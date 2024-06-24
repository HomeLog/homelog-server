import { Prisma } from '@prisma/client';

export type TPrismaMiddlewareParams = Parameters<Prisma.Middleware>[0];
export type TPrismaAction = Prisma.PrismaAction;
