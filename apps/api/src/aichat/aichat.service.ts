import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { technicians } from "./constants";

@Injectable()
export class AichatService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
  }

  private createPropmt = (query: string): string => `Problem: ${query}
    Lista specjalistów: ${JSON.stringify(technicians)}

    Twoim zadaniem jest zidentyfikowanie specjalisty, którego umiejętności są najbardziej odpowiednie do rozwiązania podanego problemu.

    Jeśli taka osoba istnieje, zwróć wynik w formacie: ID=<tutaj wstaw id>; Imię i Nazwisko; Opis, jak i dlaczego ta osoba może rozwiązać wskazany problem.
    Jeśli żadna osoba nie spełnia kryteriów, koniecznie odpowiedz: "Nie znalazłem odpowiedniego specjalisty."
    Uwaga: Jeśli nie ma odpowiedniego specjalisty, musisz wyraźnie to zaznaczyć w odpowiedzi.`;

  private fetchAiResponse = async (prompt: string): Promise<string[]> => {
    const chatCompletion = await this.client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    return chatCompletion.choices[0].message.content?.split(";") || [];
  };

  getAiResponse = async (query: string) => {
    const prompt = this.createPropmt(query);
    const response = await this.fetchAiResponse(prompt);

    return JSON.stringify(response);
  };
}
