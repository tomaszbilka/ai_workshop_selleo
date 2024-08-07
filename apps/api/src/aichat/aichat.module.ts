import { Module } from "@nestjs/common";
import { AichatController } from "./aichat.controller";
import { AichatService } from "./aichat.service";

@Module({
  imports: [],
  controllers: [AichatController],
  providers: [AichatService],
  exports: [],
})
export class AichatModule {}
