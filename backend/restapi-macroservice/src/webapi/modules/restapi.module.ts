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
import { CreateFeedbackHandler } from "src/app/handlers/create-feedback.handler";
import { GetAllFeedbacksHandler } from "src/app/handlers/get-all-feedbacks.handler";
import { GetChatListingsHandler } from "src/app/handlers/get-chat-listings.handler";
import { GetChatMessagesHandler } from "src/app/handlers/get-chat-messages.handler";
import { GetChatWithListingsByIdHandler } from "src/app/handlers/get-chat-with-listings-by-id.handler";
import { GetFeedbackByChatIdHandler } from "src/app/handlers/get-feedback-by-chat-id.handler";
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
import { FeedbackDatabaseRepository } from "src/data/feedback.database.repository";
import { ListingDatabaseRepository } from "src/data/listing.database.repository";
import { MessageDatabaseRepository } from "src/data/message.database.repository";
import { UserProfileDatabaseRepository } from "src/data/user-profile.database.repository";
import { UserDatabaseRepository } from "src/data/user.database.repository";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IFeedbackRepository } from "src/domain/repositories/ifeedback.repository";
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

import { entities, getDatabaseConfig } from "../../data/database.config";
import { AuthController } from "../controllers/auth.controller";
import { ChatController } from "../controllers/chat.controller";
import { FavoritesController } from "../controllers/favorites.controller";
import { FeedbackController } from "../controllers/feedback.controller";
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
      useFactory: () => {
        return getDatabaseConfig({
          migrations: [
            "./dist/backend/restapi-macroservice/src/data/migrations/*.js",
          ],
          migrationsRun: true,
        });
      },
    }),
    TypeOrmModule.forFeature(entities),
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
    FeedbackController,
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
    GetChatWithListingsByIdHandler,
    AddToFavoritesHandler,
    RemoveFromFavoritesHandler,
    GetUserFavoritesHandler,
    GetChatMessagesHandler,
    GetChatListingsHandler,
    SaveListingsHandler,
    SaveUserProfileHandler,
    GetUserProfilesHandler,
    GetUserProfileByIdHandler,
    CreateFeedbackHandler,
    GetFeedbackByChatIdHandler,
    GetAllFeedbacksHandler,

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
    {
      provide: IFeedbackRepository,
      useClass: FeedbackDatabaseRepository,
    },
  ],
})
export class RestApiModule {}
