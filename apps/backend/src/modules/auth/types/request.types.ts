import type { Request } from 'express';
import type { User } from '@repo/core';

export interface RequestWithUser extends Request {
  user: User;
}
