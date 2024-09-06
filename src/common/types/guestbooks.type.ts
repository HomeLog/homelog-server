import { Prisma } from '@prisma/client';

export interface TGuestbookSelectFields extends Prisma.GuestBookSelectScalar {
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

export type TGuestbookPayload = Prisma.GuestBookGetPayload<{
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

export type TGuestbookData = Omit<TGuestbookPayload, 'user'> & {
  hostNickname?: string;
};
