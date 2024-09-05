import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

export function ApiUsersKakaoSignIn() {
  return applyDecorators(
    ApiOperation({
      summary: '인가 코드 발급',
      description: '카카오 로그인시 필요한 인가 코드를 발급합니다.',
    }),
  );
}

export function ApiUsersKakaoCallback() {
  return applyDecorators(
    ApiOperation({
      summary: '액세스 토큰 코드 발급',
      description:
        '카카오 회원가입시 유저와 프로필을 동시에 생성하고, 발급되는 액세스토큰을 반환합니다.',
    }),
    ApiQuery({
      name: 'code',
      required: true,
      type: String,
    }),
    ApiCreatedResponse({
      description: '발급된 액세스토큰을 반환한다.',
      type: String,
    }),
  );
}

export function ApiUsersSignOut() {
  return applyDecorators(
    ApiOperation({
      summary: '로그아웃',
      description: '쿠키를 만료시켜 로그아웃합니다.',
    }),
  );
}

export function ApiUsersIsSignedIn() {
  return applyDecorators(
    ApiOperation({
      summary: '로그인 확인',
      description:
        '로그인된 상태인지 확인합니다. 로그인 상태일 경우 true를 반환합니다.',
    }),
  );
}

export function ApiUsersGetUser() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 확인',
      description: '유저를 탐색하여 존재하는 유저라면 정보를 반환합니다.',
    }),
  );
}
export function ApiUsersGetProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '프로필 확인',
      description:
        '유저를 탐색하여 프로필이 존재하는 유저라면 프로필 정보를 반환합니다.',
    }),
  );
}
export function ApiUsersEditProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '프로필 수정',
      description: '프로필을 수정합니다.',
    }),
  );
}

export function ApiUsersDeleteImage() {
  return applyDecorators(
    ApiOperation({
      summary: '기본이미지로 변경',
      description:
        '이미지 타입에 따라 홈 사진 또는 프로필 사진을 삭제하고, 기본 이미지로 변경합니다.',
    }),
  );
}
