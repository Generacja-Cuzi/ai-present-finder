import type { AuthenticatedRequest } from "src/domain/models/auth.types";
import { GetUserProfileByIdQuery } from "src/domain/queries/get-user-profile-by-id.query";
import { GetUserProfilesQuery } from "src/domain/queries/get-user-profiles.query";
import {
  UserProfileDto,
  UserProfilesResponseDto,
} from "src/webapi/dtos/user-profile.dto";

import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../app/guards/jwt-auth.guard";
import { ResourceOwnershipGuard } from "../../app/guards/resource-ownership.guard";
import { RequireResourceOwnership } from "../../domain/decorators/resource-ownership.decorator";
import { ResourceType } from "../../domain/models/resource-ownership.types";

@ApiTags("user-profiles")
@Controller("user-profiles")
export class UserProfileController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get all user profiles" })
  @ApiOkResponse({
    description: "Returns list of user profiles",
    type: UserProfilesResponseDto,
  })
  async getUserProfiles(
    @Req() request: AuthenticatedRequest,
  ): Promise<UserProfilesResponseDto> {
    const profiles = await this.queryBus.execute(
      new GetUserProfilesQuery(request.user.id),
    );

    return {
      profiles: profiles.map((profile) => ({
        id: profile.id,
        userId: profile.userId,
        chatId: profile.chatId,
        personName: profile.personName,
        profile: profile.profile,
        keyThemes: profile.keyThemes,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      })),
    };
  }

  @Get(":profileId")
  @UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
  @RequireResourceOwnership({
    resourceType: ResourceType.USER_PROFILE,
    paramName: "profileId",
  })
  @ApiOperation({ summary: "Get a specific user profile" })
  @ApiOkResponse({
    description: "Returns a user profile",
    type: UserProfileDto,
  })
  async getUserProfile(
    @Param("profileId") profileId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<UserProfileDto> {
    const profile = await this.queryBus.execute(
      new GetUserProfileByIdQuery(profileId, request.user.id),
    );

    return {
      id: profile.id,
      userId: profile.userId,
      chatId: profile.chatId,
      personName: profile.personName,
      profile: profile.profile,
      keyThemes: profile.keyThemes,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
