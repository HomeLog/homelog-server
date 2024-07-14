import { Prisma } from '@prisma/client';

export interface TGuestbookSelect extends Prisma.GuestBookSelectScalar {
  createdAt: true;
  imageKey: true;
  userId: boolean;
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
    imageKey: true;
    createdAt: true;
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

export type TGuestbookResponse = Omit<TGuestbookData, 'user'> & {
  hostNickname?: string;
};
