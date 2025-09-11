import { Context } from "vm";

export class ChatUserAnsweredEvent {
    constructor(
        public readonly context: Context,
        public readonly history: string[],
        public readonly answer: string,
    ) {} 
}