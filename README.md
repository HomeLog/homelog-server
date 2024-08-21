# homelog-server

![homelog-backend-architecture](https://github.com/user-attachments/assets/0693db1f-3095-44d7-b856-e4c21daa1346)

## 1. 서비스 소개

🏠 **Home-log**는 집에 초대된 손님들이 방명록을 남기고, 집 주인이 방명록을 모아볼 수 있는 서비스입니다.
집에서 만든 소중한 추억들을 한 곳에 모아 남겨보세요!✨

## 2. 개발자

| 프로필 | 깃허브                                      | 역할                                                                         |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------- |
| 고지명 | [jimyungkoh](https://github.com/jimyungkoh) | 방명록 api 설계 및 구현, CI/CD 파이프라인 및 통합 테스트 환경 구축, 리팩토링 |
| 박상희 | [Sangddong](https://github.com/Sangddong)   | 카카오 소셜로그인 구현, 프로필 관련 로직 구현, swagger api 작성              |

## 3. 브랜치 전략

### 브랜치 관리

- main : 출시용 메인 브랜치
- develop : 개발용 메인 브랜치
- feature : 개별 기능 개발용 브랜치
- hotfix : master 브랜치에서 발생한 버그를 수정하는 브랜치

### 브랜치 작성 규칙

- 브랜치 작성 규칙 : 태그/이슈번호\_변경사항-설명
- 소문자로만 작성하며, 개조식 구문으로 작성

### Commit Convention

|   태그   |       설명       |
| :------: | :--------------: |
|   feat   | 새로운 기능 추가 |
|   fix    |    버그 수정     |
| refactor |  코드 리팩토링   |
|   docs   |    문서 수정     |
|  chore   |  기타 변경사항   |
|   test   |   테스트 작성    |

## 4. 주요 기능

- 사용자
  - 회원가입 및 로그인
  - 방명록 작성 가능
- 유저
  - 프로필 등록 및 수정 기능
  - 방명록 작성 링크 생성 기능
  - 방명록 삭제 기능

## 5. ERD

![db-erd](https://github.com/user-attachments/assets/dc7a3257-3550-4f5d-9769-d5ddd2ff1aca)
