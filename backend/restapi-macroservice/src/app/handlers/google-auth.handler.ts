import { AuthService } from "src/app/services/auth.service";
import { GoogleAuthCommand } from "src/domain/commands/google-auth.command";
import { User } from "src/domain/entities/user.entity";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(
    command: GoogleAuthCommand,
  ): Promise<{ accessToken: string; user: User }> {
    const { code } = command;
    const result = await this.authService.validateGoogleToken(code);
    return result;
  }
}
