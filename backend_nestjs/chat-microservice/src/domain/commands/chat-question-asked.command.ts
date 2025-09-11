import { ChatQuestionAskedDto } from "../models/chat-question-asked.dto";

export class ChatQuestionAskedCommand {
  constructor(public readonly chatQuestionAskedDto: ChatQuestionAskedDto) {}
}
