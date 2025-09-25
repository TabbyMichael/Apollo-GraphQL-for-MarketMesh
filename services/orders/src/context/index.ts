import { UserRole } from '@prisma/client';

export interface Context {
  userId?: string;
  role?: UserRole;
  token?: string;
}

export type WithContext<T = {}> = T & {
  ctx: Context;
};
