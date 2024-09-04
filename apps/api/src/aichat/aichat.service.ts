import { DatabasePg } from "src/common";
import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { technicians } from "src/storage/schema";
import { cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

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

  private createPropmt = (query: string): string => `Problem: ${query}
  
   Based on the prompt with problem definition return one crucial neccessary skill required to solve and fix the reason of the problem and format it as a json object with key named skill, keep it as a one word.
`;

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
    const skill = JSON.parse(response[0]).skill;

    const embedding = await this.generateEmbedding(skill);

    const similarity = sql<number>`1 - (${cosineDistance(technicians.embedding, embedding)})`;

    const similarGuides = await this.db
      .select({
        id: technicians.id,
        name: technicians.name,
        skills: technicians.skills,
        similarity,
      })
      .from(technicians)
      .where(gt(similarity, 0.5))
      .orderBy((t) => desc(t.similarity))
      .limit(4);

    console.log({ similarGuides });

    return JSON.stringify({ response });
  };
}
