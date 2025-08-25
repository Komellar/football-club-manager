import type { Request } from 'express';
import { RoleType } from '@repo/types';

export interface JwtPayload {
  userId: number;
  email: string;
  role: RoleType;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
