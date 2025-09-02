import type { Request } from 'express';
import { User } from '@repo/utils';

export interface RequestWithUser extends Request {
  user: User;
}
