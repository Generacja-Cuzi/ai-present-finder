import { ContextDto } from "../models/context.dto";

export class ChatUserAnsweredEvent {
    constructor(
        public readonly context: ContextDto,
        public readonly history: string[],
        public readonly answer: string,
    ) {} 
}