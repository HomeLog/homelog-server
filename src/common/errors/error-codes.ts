export class ErrorCodes {
  constructor(
    readonly message: string,
    readonly status: number,
  ) {}

  // 방명록 관련 에러
  static readonly GUESTBOOK_NOT_FOUND = new ErrorCodes(
    '방명록을 찾을 수 없습니다.',
    404,
  );

  static readonly GUESTBOOK_ACCESS_DENIED = new ErrorCodes(
    '방명록 소유자만 접근할 수 있습니다.',
    403,
  );
}
