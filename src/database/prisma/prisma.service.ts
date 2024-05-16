import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    this.configSoftDeleteMiddleware();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }

  private configSoftDeleteMiddleware() {
    this.$use(this.excludeDeletedMiddleware);
    this.$use(this.softDeleteMiddleware);
  }

  async excludeDeletedMiddleware(params, next): Promise<Prisma.Middleware> {
    if (!params.model) return next(params);

    switch (params.action) {
      case 'findUnique':
      case 'findFirst':
        params.action = 'findFirst';
        params.args.where.deleted = false;
        break;
      case 'findMany':
        params.args.where = { ...params.args.where, deleted: false };
        break;
      case 'update':
        params.action = 'updateMany';
        params.args.where.deleted = false;
        break;
      case 'updateMany':
        params.args.where = { ...params.args.where, deleted: false };
        break;
    }

    return next(params);
  }

  async softDeleteMiddleware(params, next): Promise<Prisma.Middleware> {
    if (!params.model) return next(params);

    switch (params.action) {
      case 'delete':
        params.action = 'update';
        params.args.data = { deleted: true };
        break;
      case 'deleteMany':
        params.action = 'updateMany';
        params.args.data = { ...params.args.data, deleted: true };
        break;
    }

    return next(params);
  }
}
