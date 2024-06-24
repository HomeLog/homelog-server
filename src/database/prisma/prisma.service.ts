import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  TPrismaAction,
  TPrismaMiddlewareParams,
} from 'src/common/types/prisma.type';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    this.useSoftDeleteMiddleware();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private useSoftDeleteMiddleware() {
    this.$use(this.softDeleteMiddleware.bind(this));
  }

  private async softDeleteMiddleware(
    params: TPrismaMiddlewareParams,
    next: (params: TPrismaMiddlewareParams) => Promise<any>,
  ): Promise<any> {
    const targetActions: TPrismaAction[] = [
      'findUnique',
      'findUniqueOrThrow',
      'findMany',
      'findFirst',
      'findFirstOrThrow',
      'update',
      'updateMany',
      'delete',
      'deleteMany',
      'aggregate',
      'count',
      'groupBy',
    ];

    if (!params.model || !targetActions.includes(params.action))
      return next(params);

    const isSoftDeleteAction = ['delete', 'deleteMany'].includes(params.action);

    params.args.where = { ...params.args.where, deleted: false };

    if (isSoftDeleteAction) {
      params.action = params.action === 'delete' ? 'update' : 'updateMany';
      params.args.data = { deleted: true };
    }

    return next(params);
  }
}
