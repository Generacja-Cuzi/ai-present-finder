import {
  ChatStartInterviewEvent,
  ChatUserAnsweredEvent,
  StalkingAnalyzeRequestedEvent,
} from "@core/events";
import { JwtAuthGuard } from "src/app/guards/jwt-auth.guard";
import { ResourceOwnershipGuard } from "src/app/guards/resource-ownership.guard";
import { AddToFavoritesHandler } from "src/app/handlers/add-to-favorites.handler";
import { ChatCompletedNotifyUserHandler } from "src/app/handlers/chat-completed-notify-user.handler";
import { ChatInappropriateRequestHandler } from "src/app/handlers/chat-inappropriate-request.handler";
import { ChatQuestionAskedHandler } from "src/app/handlers/chat-question-asked.handler";
import { GetChatListingsHandler } from "src/app/handlers/get-chat-listings.handler";
import { GetChatMessagesHandler } from "src/app/handlers/get-chat-messages.handler";
import { GetUserChatsHandler } from "src/app/handlers/get-user-chats.handler";
import { GetUserFavoritesHandler } from "src/app/handlers/get-user-favorites.handler";
import { GetUserProfileByIdHandler } from "src/app/handlers/get-user-profile-by-id.handler";
import { GetUserProfilesHandler } from "src/app/handlers/get-user-profiles.handler";
import { GiftReadyHandler } from "src/app/handlers/gift-ready.handler";
import { NotifyUserSseHandler } from "src/app/handlers/notify-user-sse.handler";
import { RemoveFromFavoritesHandler } from "src/app/handlers/remove-from-favorites.handler";
import { SaveListingsHandler } from "src/app/handlers/save-listings.handler";
import { SaveMessageHandler } from "src/app/handlers/save-message.handler";
import { SaveUserProfileHandler } from "src/app/handlers/save-user-profile.handler";
import { SendUserMessageHandler } from "src/app/handlers/send-user-message.handler";
import { StartProcessingCommandHandler } from "src/app/handlers/start-processing.handler";
import { ValidateGoogleTokenHandler } from "src/app/handlers/validate-google-token.command";
import { DatabaseSeederService } from "src/app/services/database-seeder.service";
import { GoogleService } from "src/app/services/google-service";
import { SseService } from "src/app/services/sse-service";
import { JwtStrategy } from "src/app/strategies/jwt.strategy";
import { ChatDatabaseRepository } from "src/data/chat.database.repository";
import { ListingDatabaseRepository } from "src/data/listing.database.repository";
import { MessageDatabaseRepository } from "src/data/message.database.repository";
import { UserProfileDatabaseRepository } from "src/data/user-profile.database.repository";
import { UserDatabaseRepository } from "src/data/user.database.repository";
import { Chat } from "src/domain/entities/chat.entity";
import { Listing } from "src/domain/entities/listing.entity";
import { Message } from "src/domain/entities/message.entity";
import { UserProfile } from "src/domain/entities/user-profile.entity";
import { User } from "src/domain/entities/user.entity";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";
import { IMessageRepository } from "src/domain/repositories/imessage.repository";
import { IUserProfileRepository } from "src/domain/repositories/iuser-profile.repository";
import { IUserRepository } from "src/domain/repositories/iuser.repository";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "../controllers/auth.controller";
import { ChatController } from "../controllers/chat.controller";
import { FavoritesController } from "../controllers/favorites.controller";
import { MessagesController } from "../controllers/messages.controller";
import { RestApiController } from "../controllers/restapi.controller";
import { SseController } from "../controllers/sse.controller";
import { UserProfileController } from "../controllers/user-profile.controller";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ??
          "your-secret-key-change-in-prod",
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        // Parse DATABASE_URL if provided, otherwise fall back to individual vars
        const databaseUrl =
          configService.get<string>("RESTAPI_DATABASE_URL") ?? "";

        if (databaseUrl.length > 0) {
          const url = new URL(databaseUrl);
          return {
            type: "postgres" as const,
            host: url.hostname,
            port: Number.parseInt(url.port, 10) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading '/'
            entities: [User, Chat, Listing, Message],
            // Never enable in production; opt-in via env
            synchronize:
              configService.get<string>("TYPEORM_SYNCHRONIZE") === "true",
            logging: false,
          };
        }

        // Fallback to individual environment variables
        return {
          type: "postgres" as const,
          host: configService.get<string>("DATABASE_HOST") ?? "localhost",
          port: Number.parseInt(
            configService.get<string>("DATABASE_PORT") ?? "5432",
            10,
          ),
          username:
            configService.get<string>("DATABASE_USERNAME") ?? "restapi_user",
          password:
            configService.get<string>("DATABASE_PASSWORD") ??
            "restapi_password",
          database:
            configService.get<string>("DATABASE_NAME") ?? "restapi_service",
          entities: [User, Chat, Listing, Message, UserProfile],
          synchronize: true, // Only for development
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Chat, Listing, Message, UserProfile]),
    ClientsModule.register([
      {
        name: "STALKING_ANALYZE_REQUESTED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: StalkingAnalyzeRequestedEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "CHAT_START_INTERVIEW_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatStartInterviewEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: "CHAT_USER_ANSWERED_EVENT",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.CLOUDAMQP_URL ?? "amqp://admin:admin@localhost:5672",
          ],
          queue: ChatUserAnsweredEvent.name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    RestApiController,
    AuthController,
    ChatController,
    FavoritesController,
    MessagesController,
    UserProfileController,
    ChatQuestionAskedHandler,
    ChatInappropriateRequestHandler,
    ChatCompletedNotifyUserHandler,
    GiftReadyHandler,
    SseController,
  ],
  providers: [
    // Command & Query Handlers
    StartProcessingCommandHandler,
    NotifyUserSseHandler,
    SendUserMessageHandler,
    SaveMessageHandler,
    ValidateGoogleTokenHandler,
    GetUserChatsHandler,
    AddToFavoritesHandler,
    RemoveFromFavoritesHandler,
    GetUserFavoritesHandler,
    GetChatMessagesHandler,
    GetChatListingsHandler,
    SaveListingsHandler,
    SaveUserProfileHandler,
    GetUserProfilesHandler,
    GetUserProfileByIdHandler,

    // Services
    SseService,
    GoogleService,
    DatabaseSeederService,

    // Auth
    JwtStrategy,
    JwtAuthGuard,
    ResourceOwnershipGuard,

    // Repositories
    {
      provide: IUserRepository,
      useClass: UserDatabaseRepository,
    },
    {
      provide: IChatRepository,
      useClass: ChatDatabaseRepository,
    },
    {
      provide: IListingRepository,
      useClass: ListingDatabaseRepository,
    },
    {
      provide: IMessageRepository,
      useClass: MessageDatabaseRepository,
    },
    {
      provide: IUserProfileRepository,
      useClass: UserProfileDatabaseRepository,
    },
  ],
})
export class RestApiModule {}
