import { SetMetadata } from "@nestjs/common";

import type { ResourceOwnershipConfig } from "../models/resource-ownership.types";

/**
 * Metadata key for resource ownership validation
 */
export const RESOURCE_OWNERSHIP_KEY = "resourceOwnership";

/**
 * Decorator to mark endpoints that require resource ownership validation.
 * Use in combination with ResourceOwnershipGuard.
 *
 * @example
 * ```typescript
 * @Get(':chatId/messages')
 * @UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
 * @RequireResourceOwnership({
 *   resourceType: ResourceType.CHAT,
 *   paramName: 'chatId'
 * })
 * async getMessages(@Param('chatId') chatId: string) {
 *   // User ownership is automatically verified
 * }
 * ```
 */
export const RequireResourceOwnership = (config: ResourceOwnershipConfig) =>
  SetMetadata(RESOURCE_OWNERSHIP_KEY, config);
