import type { Request } from 'express';
import { RoleType } from '@repo/utils';

export interface JwtPayload {
  userId: number;
  email: string;
  role: RoleType;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
