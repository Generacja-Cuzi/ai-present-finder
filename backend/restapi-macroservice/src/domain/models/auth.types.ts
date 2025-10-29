import type { Request } from "express";

import type { User } from "../entities/user.entity";

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
