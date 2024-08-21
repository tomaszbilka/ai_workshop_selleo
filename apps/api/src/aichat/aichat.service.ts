import { Injectable } from "@nestjs/common";

@Injectable()
export class AichatService {
  getAiResponse = async (query: string) => {
    console.log({ query });
    return JSON.stringify(query);
  };
} // TODO: connect to openai
