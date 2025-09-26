import { PrismaClient } from '@prisma/client';
import { UserService } from './userService';

export interface Context {
  token?: string;
  userId?: string;
  role?: string;
  prisma: PrismaClient;
  userService: UserService;
}