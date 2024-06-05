import { Prisma } from '@prisma/client';

export interface TGuestbookSelect extends Prisma.GuestBookSelectScalar {
  user: {
    select: {
      userProfile: {
        select: {
          nickname: true;
        };
      };
    };
  };
}
export type TGuestbookData = Prisma.GuestBookGetPayload<{
  include: {
    user: {
      select: {
        userProfile: {
          select: {
            nickname: true;
          };
        };
      };
    };
  };
}>;
