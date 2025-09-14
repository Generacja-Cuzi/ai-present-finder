import { Command } from '@nestjs/cqrs';

export class NotifyUserSseCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly message: string,
  ) {
    super();
  }
}
