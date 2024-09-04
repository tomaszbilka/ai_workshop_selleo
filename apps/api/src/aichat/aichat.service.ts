import { availability } from "./constants";
import { DatabasePg } from "src/common";
import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { technicians } from "src/storage/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class AichatService {
  private client: OpenAI;

  private generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll("\n", " ");
    const { data } = await this.client.embeddings.create({
      model: "text-embedding-ada-002",
      input,
    });
    return data[0].embedding;
  };

  private createEmbeddings = async () => {
    const allTechnicians = await this.db.select().from(technicians);

    if (!allTechnicians[0].embedding) {
      allTechnicians.map(async (technician) => {
        const embedding = await this.generateEmbedding(
          technician.skills?.join(","),
        );

        await this.db
          .update(technicians)
          .set({ embedding })
          .where(eq(technicians.id, technician.id));

        console.log("generated embedding for technicians skills");
      });
    }
  };

  constructor(@Inject("DB") private readonly db: DatabasePg) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });

    this.createEmbeddings();
  }

  private createPropmt = (
    query: string,
    techniciansData: any,
  ): string => `Problem: ${query}
    Lista specjalistów: ${JSON.stringify(techniciansData)}

    Twoim zadaniem jest zidentyfikowanie specjalisty, którego umiejętności są najbardziej odpowiednie do rozwiązania podanego problemu.

    Jeśli taka osoba istnieje, zwróć wynik w formacie: ID=<tutaj wstaw id>; Imię i Nazwisko; Opis, jak i dlaczego ta osoba może rozwiązać wskazany problem.
    Jeśli żadna osoba nie spełnia kryteriów, koniecznie odpowiedz: "Nie znalazłem odpowiedniego specjalisty."
    Uwaga: Jeśli nie ma odpowiedniego specjalisty, musisz wyraźnie to zaznaczyć w odpowiedzi.`;

  private getTechinicianAvailabilityPropmt = (id: string) => {
    return `Oto lista techników wrasz z ich dostępnościami: ${JSON.stringify(availability)}. Znajdź technika o technicianId równym ${id} i zwróc wartości i klucze w tablicy, np: id=<tutaj podaj id>`;
  };

  private fetchAiResponse = async (prompt: string): Promise<string[]> => {
    const chatCompletion = await this.client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    return chatCompletion.choices[0].message.content?.split(";") || [];
  };

  getAiResponse = async (query: string) => {
    const techniciansFromDB = await this.db.select().from(technicians);

    const prompt = this.createPropmt(query, techniciansFromDB);
    const response = await this.fetchAiResponse(prompt);
    if (response.length === 1) {
      return JSON.stringify({ availability: null, response });
    }

    const technicianId = response[0].substring(3);

    const availabilityPrompt =
      this.getTechinicianAvailabilityPropmt(technicianId);

    const availability = await this.fetchAiResponse(availabilityPrompt);

    return JSON.stringify({ availability, response });
  };
}
