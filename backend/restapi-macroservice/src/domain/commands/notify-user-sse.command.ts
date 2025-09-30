import { Command } from "@nestjs/cqrs";

import type { SseMessageDto } from "../models/sse-message.dto";

export class NotifyUserSseCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly message: SseMessageDto,
  ) {
    super();
  }
}
