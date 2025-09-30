// src/webapi/controllers/order.controller.ts
import { Body, Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
}
