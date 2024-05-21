import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SignUpKakaoDto {
  constructor(id: string) {
    this.id = id;
  }
  id: string;
}

export class CreateProfileDto {
  @IsString()
  nickname: string;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;
}

export class EditProfileDto {
  @IsString()
  @IsOptional()
  nickname: string;
}
