import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AccountType } from 'src/domains/users/users.type';

export const DAccount = createParamDecorator(
  (data: AccountType, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[data];
  },
);
