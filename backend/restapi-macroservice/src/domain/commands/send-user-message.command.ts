import { Command } from "@nestjs/cqrs";

import type { SendMessageDto } from "../models/send-message.dto";

export class SendUserMessageCommand extends Command<void> {
  constructor(public readonly sendMessageDto: SendMessageDto) {
    super();
  }
}
