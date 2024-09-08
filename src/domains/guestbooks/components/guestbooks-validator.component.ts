import { Injectable } from '@nestjs/common';
import { TGuestbookPayload } from 'src/common/types/guestbooks.type';
import {
  GuestBookAccessDeniedException,
  GuestBookAlreadySubmittedException,
  GuestBookNoImageException,
  GuestBookNotFoundException,
} from '../guestbooks.exception';

@Injectable()
export class GuestbooksValidatorComponent {
  private ensureExists(
    guestbook: TGuestbookPayload | null,
  ): asserts guestbook is TGuestbookPayload {
    if (!guestbook) throw new GuestBookNotFoundException();
  }

  private validateImageKeyExistence(guestbook: TGuestbookPayload): void {
    if (!guestbook.imageKey) throw new GuestBookNoImageException();
  }

  private validateOwnership(
    guestbook: TGuestbookPayload,
    userId: string,
  ): void {
    if (guestbook.userId !== userId) throw new GuestBookAccessDeniedException();
  }

  passDelete(guestbook: TGuestbookPayload | null, userId: string): void {
    this.ensureExists(guestbook);
    this.validateOwnership(guestbook, userId);
  }

  passPhotoUpdate(guestbook: TGuestbookPayload | null, userId: string): void {
    this.ensureExists(guestbook);
    this.validateOwnership(guestbook, userId);
    this.validateImageKeyExistence(guestbook!);
  }

  passEmptyContent(guestbook: TGuestbookPayload): void {
    if (guestbook.content) throw new GuestBookAlreadySubmittedException();
  }
}
