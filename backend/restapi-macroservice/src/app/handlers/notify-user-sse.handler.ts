import { NotifyUserSseCommand } from "src/domain/commands/notify-user-sse.command";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { SseService } from "../services/sse-service";

@CommandHandler(NotifyUserSseCommand)
export class NotifyUserSseHandler
  implements ICommandHandler<NotifyUserSseCommand>
{
  constructor(private readonly sseService: SseService) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(command: NotifyUserSseCommand) {
    const { userId, message } = command;

    this.sseService.sendEvent({ userId, message });
  }
}
