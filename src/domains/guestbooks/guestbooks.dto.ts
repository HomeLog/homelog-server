import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ErrorCodes } from 'src/common/errors/error-codes';

export class CreateGuestbookDto {
  @IsString()
  @IsNotEmpty()
  visitorName: string;

  @IsString()
  @IsNotEmpty()
  imageKey: string;
}

export class UpdateGuestbookDto {
  @IsString()
  @IsNotEmpty({ message: '방명록은 최소 1자 이상이어야 합니다.' })
  content: string;
}

export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt({
    message: ErrorCodes.PAGE_MUST_BE_NUMBER.message,
  })
  @IsOptional()
  @Min(1, {
    message: ErrorCodes.PAGE_MUST_BE_AT_LEAST_ONE.message,
  })
  page?: number = 1;

  @Type(() => Number)
  @IsInt({
    message: ErrorCodes.PAGE_LIMIT_MUST_BE_NUMBER.message,
  })
  @IsOptional()
  @Min(1, {
    message: ErrorCodes.PAGE_LIMIT_MUST_BE_AT_LEAST_ONE.message,
  })
  @Max(20, {
    message: ErrorCodes.PAGE_LIMIT_MUST_BE_AT_MOST_TWENTY.message,
  })
  limit?: number = 10;
}
