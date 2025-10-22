export class CreateSessionCommand {
  constructor(
    public readonly eventId: string,
    public readonly chatId: string,
    public readonly totalEvents: number,
  ) {}
}
