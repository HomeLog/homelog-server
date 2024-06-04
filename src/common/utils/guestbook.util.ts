import { TGuestbookData } from 'src/types/guestbooks.type';

export function extractGuestBookData(guestBook: TGuestbookData) {
  const { user, ...foundGuestbook } = guestBook;

  return {
    ...foundGuestbook,
    hostNickname: user.userProfile?.nickname,
  };
}

export function extractGuestBooksData(guestBooks: TGuestbookData[]) {
  return guestBooks.map((guestBook) => this.extractGuestBookData(guestBook));
}
