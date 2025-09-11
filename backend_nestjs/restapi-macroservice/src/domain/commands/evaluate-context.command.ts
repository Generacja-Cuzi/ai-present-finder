import { ContextDto } from "../models/context.dto";

export class EvaluateContextCommand {
  constructor(public readonly context: ContextDto) {}
}
