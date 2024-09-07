export class ErrorCodes {
  constructor(
    readonly message: string,
    readonly status: number,
  ) {}

  // 방명록 관련 에러
  static readonly PAGE_MUST_BE_NUMBER = new ErrorCodes(
    'page는 양수여야 합니다.',
    400,
  );

  static readonly PAGE_MUST_BE_AT_LEAST_ONE = new ErrorCodes(
    'page는 1 이상이어야 합니다.',
    400,
  );

  static readonly PAGE_LIMIT_MUST_BE_NUMBER = new ErrorCodes(
    'size는 양수여야 합니다.',
    400,
  );

  static readonly PAGE_LIMIT_MUST_BE_AT_LEAST_ONE = new ErrorCodes(
    'size는 최소 1 이상이어야 합니다.',
    400,
  );

  static readonly PAGE_LIMIT_MUST_BE_AT_MOST_TWENTY = new ErrorCodes(
    'size는 최대 20 이하이어야 합니다.',
    400,
  );

  static readonly GUESTBOOK_ALREADY_SUBMITTED = new ErrorCodes(
    '이미 작성된 방명록입니다.',
    400,
  );

  static readonly GUESTBOOK_NOT_FOUND = new ErrorCodes(
    '방명록을 찾을 수 없습니다.',
    404,
  );

  static readonly GUESTBOOK_ACCESS_DENIED = new ErrorCodes(
    '방명록 소유자만 접근할 수 있습니다.',
    403,
  );

  static readonly GUESTBOOK_NO_IMAGE = new ErrorCodes(
    '방명록에 이미지가 없습니다.',
    400,
  );
}
