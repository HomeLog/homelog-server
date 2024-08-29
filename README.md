# homelog-server

![thumbnail](https://github.com/user-attachments/assets/a2c7029f-6c1a-42da-b6cf-0dc5c4e15bba)

## 🏠 HomeLog 배포 주소

[HomeLog - 개발 환경](https://dev.homelog.online/)

~~[HomeLog - 프로덕션 환경]()~~

- 프로덕션 배포는 비용 문제로 2024-08-16 이후 중단되었습니다.

## 1. 아키텍처

<details>
<summary>프로덕션 환경에서의 아키텍처 보기</summary>

![homelog-backend-architecture](https://github.com/user-attachments/assets/52fc5b66-c73b-486a-b03a-44c1f3cc24ec)

</details>

<details>
<summary>개발 환경에서의 아키텍처 보기</summary>

![homelog-dev-architecture](https://i.imgur.com/c4IwGac.png)

</details>

## 2. 서비스 소개

🏠 **Home-log**는 집에 초대된 손님들이 방명록을 남기고, 집 주인이 방명록을 모아볼 수 있는 서비스입니다.
집에서 만든 소중한 추억들을 한 곳에 모아 남겨보세요!✨

## 3. 사용 기술 및 개발 환경

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

## 4. 개발자

| 프로필 | 깃허브                                      | 역할                                                                         |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------- |
| 고지명 | [jimyungkoh](https://github.com/jimyungkoh) | 방명록 api 설계 및 구현, CI/CD 파이프라인 및 통합 테스트 환경 구축, 리팩토링 |
| 박상희 | [Sangddong](https://github.com/Sangddong)   | 카카오 소셜로그인 구현, 프로필 관련 로직 구현, swagger api 작성              |

## 5. 브랜치 전략

### 브랜치 관리

- main : 프로덕션 배포 브랜치
- dev : 개발 환경용 브랜치
- feat : 개별 기능 개발용 브랜치
- hotfix : main 브랜치에서 발생한 버그를 수정하는 브랜치

### 브랜치 작성 규칙

- 브랜치 작성 규칙 : 태그/이슈번호\_변경사항-설명
- 소문자로만 작성하며, 개조식 구문으로 작성

### Commit Convention

|   태그   |             설명              |
| :------: | :---------------------------: |
|   feat   |       새로운 기능 추가        |
|   fix    |           버그 수정           |
| refactor |         코드 리팩토링         |
|   docs   |           문서 수정           |
|  chore   |         기타 변경사항         |
|   test   |          테스트 작성          |
|    ci    | CI 구성 파일 및 스크립트 변경 |

## 6. 주요 기능

- 사용자
  - 회원가입 및 로그인
  - 방명록 작성 가능
- 유저
  - 프로필 등록 및 수정 기능
  - 방명록 작성 링크 생성 기능
  - 방명록 삭제 기능

## 7. Sequence Diagram

<details>
<summary>로그인 처리 과정</summary>

![로그인처리과정](https://github.com/user-attachments/assets/c3f68887-3b4c-4594-a872-a3310611c6cb)

</details>

<details>
<summary>리소스 요청시 인증 및 인가</summary>

- 🛠️리프레시 토큰 적용이 업데이트 예정입니다 🛠️

![인증및인가과정](https://github.com/user-attachments/assets/72d7159f-3c0e-4e2b-8cb6-e643c0f43e8b)

</details>

## 8. ERD

![db-erd](https://github.com/user-attachments/assets/dc7a3257-3550-4f5d-9769-d5ddd2ff1aca)
