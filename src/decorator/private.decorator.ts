import { SetMetadata } from '@nestjs/common';
import { AccountType } from 'src/users/users.type';

export const Private = (accountType: AccountType) =>
  SetMetadata('accountType', accountType);
