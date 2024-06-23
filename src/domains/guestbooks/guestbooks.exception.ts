import { ErrorCodes } from 'src/common/errors/error-codes';
import { ServiceException } from 'src/common/errors/service.exception';

export class GuestBookNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.GUESTBOOK_NOT_FOUND);
  }
}

export class GuestBookAccessDeniedException extends ServiceException {
  constructor() {
    super(ErrorCodes.GUESTBOOK_ACCESS_DENIED);
  }
}
