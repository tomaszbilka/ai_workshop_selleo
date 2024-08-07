import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";

@Controller("aichat")
export class AichatController {
  @Public()
  @Post()
  async getAiResponse(@Body() body: { query: string }) {
    console.log(body);
    return JSON.stringify({ response: "works" });
  }
}
