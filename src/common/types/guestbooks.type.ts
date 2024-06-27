import { Prisma } from '@prisma/client';

export interface TGuestbookSelect extends Prisma.GuestBookSelectScalar {
  createdAt: true;
  imageUrl: true;
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
    imageUrl: true;
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
