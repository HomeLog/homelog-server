import { Injectable } from '@nestjs/common';
import {
  TGuestbookData,
  TGuestbookPayload,
} from 'src/common/types/guestbooks.type';

@Injectable()
export class GuestbooksConverterComponent {
  private payloadToData(payload: TGuestbookPayload): TGuestbookData {
    const { user, ...guestbook } = payload;

    return {
      ...guestbook,
      hostNickname: user.userProfile?.nickname,
    };
  }

  payloadToGuestbookData(guestBook: TGuestbookPayload): TGuestbookData {
    return this.payloadToData(guestBook);
  }

  convertToGuestbookDataList(
    guestBooks: TGuestbookPayload[],
  ): TGuestbookData[] {
    return guestBooks.map((guestBook) => this.payloadToData(guestBook));
  }
}
