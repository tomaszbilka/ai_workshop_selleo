import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class AichatService {
  getAiResponse = async (query: string) => {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
    async function main() {
      const chatCompletion = await client.chat.completions.create({
        messages: [{ role: "user", content: query }],
        model: "gpt-3.5-turbo",
      });
      console.log(chatCompletion.choices);
    }
    main();
    return JSON.stringify(query);
  };
}
