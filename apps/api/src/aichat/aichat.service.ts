import { Injectable } from "@nestjs/common";

@Injectable()
export class AichatService {
  getAiResponse = async (query: string) => {
    console.log({ query });
    return "hehe";
  };
} // TODO: connect to openai
