import type { Request } from 'express';
import { User } from '@repo/core';

export interface RequestWithUser extends Request {
  user: User;
}
