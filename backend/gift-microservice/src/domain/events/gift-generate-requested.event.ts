import { EndConversationOutput } from '../../../../chat-microservice/src/app/ai/types';

export class GiftGenerateRequestedEvent {
  constructor(
    public readonly keywords: string[],
    public readonly chatId: string,
    public readonly profile: EndConversationOutput | null,
  ) {}
}
