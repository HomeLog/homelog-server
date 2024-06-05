import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGuestbookDto {
  @IsString()
  @IsNotEmpty()
  visitorName: string;
}

export class UpdateGuestbookDto {
  @IsString()
  @IsNotEmpty({ message: '방명록은 최소 1자 이상이어야 합니다.' })
  content: string;
}
