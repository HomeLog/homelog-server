import { ErrorCodes } from 'src/common/errors/error-codes';
import { ServiceException } from 'src/common/errors/service.exception';

export class InvalidUserTokenException extends ServiceException {
  constructor() {
    super(ErrorCodes.INVALID_USER_TOKEN);
  }
}

export class UserNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_NOT_FOUND);
  }
}

export class UserProfileNotFoundException extends ServiceException {
  constructor() {
    super(ErrorCodes.USER_PROFILE_NOT_FOUND);
  }
}
