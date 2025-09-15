import type { SseMessageDto } from '../../../../backend/restapi-macroservice/src/domain/models/sse-message.dto'

export type UIChatMessage = {
  id: string
  content: string
  sender: 'user' | 'assistant'
}

export const uiUpdateEvent = 'ui-update'

export type ChatState =
  | { type: 'stalking-started' }
  | { type: 'stalking-completed' }
  | { type: 'chatting'; data: { messages: Array<UIChatMessage> } }
  | { type: 'gift-ready'; data: { giftIdeas: Array<string> } }
  | { type: 'chat-interview-completed' }
  | { type: 'chat-inappropriate-request'; data: { reason: string } }
export { type SseMessageDto }
