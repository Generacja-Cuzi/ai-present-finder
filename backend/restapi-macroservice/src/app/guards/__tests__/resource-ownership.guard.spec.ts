import type { ExecutionContext } from "@nestjs/common";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { UserRole } from "../../../domain/entities/user.entity";
import type { User } from "../../../domain/entities/user.entity";
import type { AuthenticatedRequest } from "../../../domain/models/auth.types";
import {
  ResourceIdLocation,
  ResourceType,
} from "../../../domain/models/resource-ownership.types";
import type { ResourceOwnershipConfig } from "../../../domain/models/resource-ownership.types";
import { IChatRepository } from "../../../domain/repositories/ichat.repository";
import { IListingRepository } from "../../../domain/repositories/ilisting.repository";
import { IMessageRepository } from "../../../domain/repositories/imessage.repository";
import { IUserProfileRepository } from "../../../domain/repositories/iuser-profile.repository";
import { ResourceOwnershipGuard } from "../resource-ownership.guard";

describe("ResourceOwnershipGuard", () => {
  let guard: ResourceOwnershipGuard;
  let reflector: Reflector;
  let chatRepository: jest.Mocked<IChatRepository>;
  let listingRepository: jest.Mocked<IListingRepository>;
  let messageRepository: jest.Mocked<IMessageRepository>;
  let _userProfileRepository: jest.Mocked<IUserProfileRepository>;

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    googleId: "google-123",
    accessToken: "access-token",
    refreshToken: "refresh-token",
    givenName: "John",
    familyName: "Doe",
    picture: "",
    role: UserRole.USER,
    chats: [],
    favoriteListings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockChatRepo = {
      isOwnedByUser: jest.fn(),
    };

    const mockListingRepo = {
      isOwnedByUser: jest.fn(),
    };

    const mockMessageRepo = {
      isOwnedByUser: jest.fn(),
    };

    const mockUserProfileRepo = {
      isOwnedByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceOwnershipGuard,
        Reflector,
        {
          provide: IChatRepository,
          useValue: mockChatRepo,
        },
        {
          provide: IListingRepository,
          useValue: mockListingRepo,
        },
        {
          provide: IMessageRepository,
          useValue: mockMessageRepo,
        },
        {
          provide: IUserProfileRepository,
          useValue: mockUserProfileRepo,
        },
      ],
    }).compile();

    guard = module.get<ResourceOwnershipGuard>(ResourceOwnershipGuard);
    reflector = module.get<Reflector>(Reflector);
    chatRepository = module.get(IChatRepository);
    listingRepository = module.get(IListingRepository);
    messageRepository = module.get(IMessageRepository);
    _userProfileRepository = module.get(IUserProfileRepository);
  });

  const createMockExecutionContext = (
    config: ResourceOwnershipConfig | undefined,
    user: User | undefined,
    parameters: Record<string, string>,
    body?: Record<string, unknown>,
  ): ExecutionContext => {
    const mockRequest = {
      user,
      params: parameters,
      body: body ?? {},
    } as unknown as AuthenticatedRequest;

    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, "get").mockReturnValue(config);

    return context;
  };

  describe("canActivate", () => {
    it("should allow access when no resource ownership config is present", async () => {
      const context = createMockExecutionContext(undefined, mockUser, {});

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("should throw ForbiddenException when user is not authenticated", async () => {
      const config: ResourceOwnershipConfig = {
        resourceType: ResourceType.CHAT,
        paramName: "chatId",
      };

      const context = createMockExecutionContext(config, undefined, {
        chatId: "chat-123",
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw NotFoundException when resource parameter is missing", async () => {
      const config: ResourceOwnershipConfig = {
        resourceType: ResourceType.CHAT,
        paramName: "chatId",
      };

      const context = createMockExecutionContext(config, mockUser, {});

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
    });

    describe("Chat ownership", () => {
      it("should allow access when user owns the chat", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.CHAT,
          paramName: "chatId",
        };

        chatRepository.isOwnedByUser.mockResolvedValue(true);

        const context = createMockExecutionContext(config, mockUser, {
          chatId: "chat-123",
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(chatRepository.isOwnedByUser).toHaveBeenCalledWith(
          "chat-123",
          "user-123",
        );
      });

      it("should throw ForbiddenException when user does not own the chat", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.CHAT,
          paramName: "chatId",
        };

        chatRepository.isOwnedByUser.mockResolvedValue(false);

        const context = createMockExecutionContext(config, mockUser, {
          chatId: "chat-123",
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });

      it("should use custom error message when provided", async () => {
        const customMessage = "Custom access denied message";
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.CHAT,
          paramName: "chatId",
          errorMessage: customMessage,
        };

        chatRepository.isOwnedByUser.mockResolvedValue(false);

        const context = createMockExecutionContext(config, mockUser, {
          chatId: "chat-123",
        });

        await expect(guard.canActivate(context)).rejects.toThrow(customMessage);
      });
    });

    describe("Listing ownership", () => {
      it("should allow access when user owns the listing", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.LISTING,
          paramName: "listingId",
        };

        listingRepository.isOwnedByUser.mockResolvedValue(true);

        const context = createMockExecutionContext(config, mockUser, {
          listingId: "listing-123",
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(listingRepository.isOwnedByUser).toHaveBeenCalledWith(
          "listing-123",
          "user-123",
        );
      });

      it("should throw ForbiddenException when user does not own the listing", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.LISTING,
          paramName: "listingId",
        };

        listingRepository.isOwnedByUser.mockResolvedValue(false);

        const context = createMockExecutionContext(config, mockUser, {
          listingId: "listing-123",
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });
    });

    describe("Message ownership", () => {
      it("should allow access when user owns the message", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.MESSAGE,
          paramName: "messageId",
        };

        messageRepository.isOwnedByUser.mockResolvedValue(true);

        const context = createMockExecutionContext(config, mockUser, {
          messageId: "message-123",
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(messageRepository.isOwnedByUser).toHaveBeenCalledWith(
          "message-123",
          "user-123",
        );
      });

      it("should throw ForbiddenException when user does not own the message", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.MESSAGE,
          paramName: "messageId",
        };

        messageRepository.isOwnedByUser.mockResolvedValue(false);

        const context = createMockExecutionContext(config, mockUser, {
          messageId: "message-123",
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });
    });

    describe("Body parameter extraction", () => {
      it("should extract resource ID from body when location is BODY", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.CHAT,
          paramName: "chatId",
          location: ResourceIdLocation.BODY,
        };

        chatRepository.isOwnedByUser.mockResolvedValue(true);

        const context = createMockExecutionContext(
          config,
          mockUser,
          {},
          { chatId: "chat-from-body" },
        );

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(chatRepository.isOwnedByUser).toHaveBeenCalledWith(
          "chat-from-body",
          "user-123",
        );
      });

      it("should throw NotFoundException when body parameter is missing", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.CHAT,
          paramName: "chatId",
          location: ResourceIdLocation.BODY,
        };

        const context = createMockExecutionContext(config, mockUser, {}, {});

        await expect(guard.canActivate(context)).rejects.toThrow(
          NotFoundException,
        );
      });

      it("should default to PARAMS location when not specified", async () => {
        const config: ResourceOwnershipConfig = {
          resourceType: ResourceType.CHAT,
          paramName: "chatId",
          // location not specified, should default to PARAMS
        };

        chatRepository.isOwnedByUser.mockResolvedValue(true);

        const context = createMockExecutionContext(config, mockUser, {
          chatId: "chat-from-params",
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(chatRepository.isOwnedByUser).toHaveBeenCalledWith(
          "chat-from-params",
          "user-123",
        );
      });
    });
  });
});
