import { ErrorCodes } from './error-codes';

export class ServiceException extends Error {
  private readonly status: number;

  constructor(errorCode: ErrorCodes) {
    super(errorCode.message);
    this.status = errorCode.status;
  }

  getStatus() {
    return this.status;
  }
}
