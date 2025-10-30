import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import {
  ResourceIdLocation,
  ResourceType,
} from "src/domain/models/resource-ownership.types";
import type { ResourceOwnershipConfig } from "src/domain/models/resource-ownership.types";
import { IChatRepository } from "src/domain/repositories/ichat.repository";
import { IListingRepository } from "src/domain/repositories/ilisting.repository";
import { IMessageRepository } from "src/domain/repositories/imessage.repository";
import { IUserProfileRepository } from "src/domain/repositories/iuser-profile.repository";

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { RESOURCE_OWNERSHIP_KEY } from "../../domain/decorators/resource-ownership.decorator";

@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(ResourceOwnershipGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly chatRepository: IChatRepository,
    private readonly listingRepository: IListingRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<ResourceOwnershipConfig>(
      RESOURCE_OWNERSHIP_KEY,
      context.getHandler(),
    );

    // If no resource ownership config, allow access (not a protected resource endpoint)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (config === null || config === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // User should be authenticated by JwtAuthGuard
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (user === null || user === undefined) {
      this.logger.warn("ResourceOwnershipGuard used without authentication");
      throw new ForbiddenException("Authentication required");
    }

    const resourceId = this.extractResourceId(request, config);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (resourceId === null || resourceId === undefined || resourceId === "") {
      this.logger.warn(
        `Parameter '${config.paramName}' not found in ${config.location ?? ResourceIdLocation.PARAMS}`,
      );
      throw new NotFoundException(
        config.errorMessage ?? `${config.resourceType} not found`,
      );
    }

    const isOwner = await this.verifyOwnership(
      config.resourceType,
      resourceId,
      user.id,
    );

    if (!isOwner) {
      this.logger.warn(
        `User ${user.id} attempted to access ${config.resourceType} ${resourceId} without ownership`,
      );
      throw new ForbiddenException(
        config.errorMessage ??
          `You don't have permission to access this ${config.resourceType}`,
      );
    }

    return true;
  }

  private extractResourceId(
    request: AuthenticatedRequest,
    config: ResourceOwnershipConfig,
  ): string | undefined {
    const location = config.location ?? ResourceIdLocation.PARAMS;

    switch (location) {
      case ResourceIdLocation.PARAMS: {
        return request.params[config.paramName] as string | undefined;
      }
      case ResourceIdLocation.BODY: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return request.body?.[config.paramName] as string | undefined;
      }
    }
  }

  private async verifyOwnership(
    resourceType: ResourceType,
    resourceId: string,
    userId: string,
  ): Promise<boolean> {
    switch (resourceType) {
      case ResourceType.CHAT: {
        return this.chatRepository.isOwnedByUser(resourceId, userId);
      }

      case ResourceType.LISTING: {
        return this.listingRepository.isOwnedByUser(resourceId, userId);
      }

      case ResourceType.MESSAGE: {
        return this.messageRepository.isOwnedByUser(resourceId, userId);
      }

      case ResourceType.USER_PROFILE: {
        return this.userProfileRepository.isOwnedByUser(resourceId, userId);
      }
    }
  }
}
