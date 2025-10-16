import { AuthService } from "src/app/services/auth.service";
import { GoogleAuthCommand } from "src/domain/commands/google-auth.command";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: GoogleAuthCommand) {
    const { code } = command;
    const result = await this.authService.validateGoogleToken(code);
    return result;
  }
}
