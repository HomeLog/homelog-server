import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { TAccount } from 'src/common/types/account.type';

export const DAccount = createParamDecorator(
  (data: TAccount, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[data];
  },
);

export const DCookie = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);

export const Private = (accountType: TAccount) =>
  SetMetadata('accountType', accountType);
