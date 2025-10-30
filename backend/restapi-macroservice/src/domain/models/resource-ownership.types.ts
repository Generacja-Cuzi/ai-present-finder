/**
 * Types of resources that can be owned by users
 */
export enum ResourceType {
  CHAT = "chat",
  LISTING = "listing",
  MESSAGE = "message",
  USER_PROFILE = "user_profile",
}

/**
 * Location where the resource ID can be found
 */
export enum ResourceIdLocation {
  /**
   * Resource ID is in route parameters (e.g., /chats/:chatId)
   */
  PARAMS = "params",
  /**
   * Resource ID is in request body (e.g., { chatId: "..." })
   */
  BODY = "body",
}

/**
 * Configuration for resource ownership validation
 */
export interface ResourceOwnershipConfig {
  /**
   * Type of resource to validate
   */
  resourceType: ResourceType;

  /**
   * Name of the parameter/property containing the resource ID
   * @example 'chatId', 'listingId', 'messageId'
   */
  paramName: string;

  /**
   * Where to find the resource ID
   * @default ResourceIdLocation.PARAMS
   */
  location?: ResourceIdLocation;

  /**
   * Optional custom error message
   */
  errorMessage?: string;
}
