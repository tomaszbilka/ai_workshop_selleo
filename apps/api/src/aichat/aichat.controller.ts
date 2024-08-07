import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { AichatService } from "./aichat.service";

@Controller("aichat")
export class AichatController {
  constructor(private aichatService: AichatService) {}
  @Public()
  @Post()
  async getAiResponse(@Body() body: { query: string }) {
    return this.aichatService.getAiResponse(body.query);
  }
}
