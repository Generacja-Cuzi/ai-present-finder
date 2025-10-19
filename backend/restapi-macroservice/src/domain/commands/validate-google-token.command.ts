import { Command } from "@nestjs/cqrs";

import { User } from "../entities/user.entity";

export class ValidateGoogleTokenCommand extends Command<{
  accessToken: string;
  user: User;
}> {
  constructor(public readonly code: string) {
    super();
  }
}
