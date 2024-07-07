import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SignUpKakaoDto {
  constructor(id: string) {
    this.id = id;
  }
  id: string;
}

export class EditProfileDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '방명록 이름' })
  guestBookName: string;
}
