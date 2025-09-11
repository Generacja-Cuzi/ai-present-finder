import { ContextDto } from "./context.dto";

export class ChatQuestionAskedDto {
  context: ContextDto;
  history: string[];
  question: string;
}
