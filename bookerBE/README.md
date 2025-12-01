# 호텔 예약 시스템 - 백엔드 (bookerBE)

호텔 예약 시스템의 백엔드 API 서버입니다.

## 주요 기능

### 고객 기능 API
- 회원가입 및 로그인
- 객실 목록 조회 및 검색
- 객실 상세 정보 확인
- 날짜별 예약 가능 여부 확인
- 예약 및 결제
- 예약 내역 조회 및 취소
- 공지사항/이벤트 확인
- 리뷰 작성
- 프로필 관리

### 관리자 기능 API
- 관리자 대시보드 (체크인/체크아웃 현황)
- 객실 관리 (추가/수정/삭제)
- 예약 관리
- 리뷰 관리
- 공지사항/이벤트 관리

## 기술 스택

- Java 21
- Spring Boot 3.3.0
- Spring Security
- Spring Data JPA
- PostgreSQL
- Lombok

## 데이터베이스 설정

### 1. PostgreSQL 데이터베이스 생성

```sql
CREATE DATABASE hoteldb;
```

### 2. 스키마 및 초기 데이터 생성

`schema.sql` 파일을 실행하여 테이블과 초기 데이터를 생성합니다.

**기본 관리자 계정:**
- 사용자명: admin
- 비밀번호: admin123

## 애플리케이션 실행

### 1. 의존성 설치 및 빌드

```bash
cd bookerBE
./gradlew build
```

### 2. 애플리케이션 실행

```bash
./gradlew bootRun
```

또는 IDE에서 `BookingApplication.java`를 실행합니다.

### 3. API 서버 접속

http://localhost:8081

## 프로젝트 구조

```
bookerBE/
├── src/main/java/com/hotel/booking/
│   ├── entity/          # 엔티티 클래스
│   ├── repository/      # Repository 인터페이스
│   ├── service/         # Service 클래스
│   ├── controller/      # REST API Controller
│   └── security/        # Security 설정
├── src/main/resources/
│   └── application.properties
└── schema.sql           # 데이터베이스 스키마
```

## 주요 엔티티

- **User**: 사용자 정보 (고객/관리자)
- **Room**: 객실 정보
- **Booking**: 예약 정보
- **Payment**: 결제 정보
- **Review**: 리뷰 정보
- **Notice**: 공지사항/이벤트 정보

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 고객
- `GET /api/customer/rooms` - 객실 목록 조회
- `GET /api/customer/rooms/{id}` - 객실 상세 조회
- `POST /api/customer/bookings` - 예약 생성
- `GET /api/customer/bookings` - 예약 내역 조회
- `POST /api/customer/payments` - 결제 처리
- `GET /api/customer/notices` - 공지사항 목록
- `POST /api/customer/reviews` - 리뷰 작성

### 관리자
- `GET /api/admin/dashboard` - 대시보드 데이터
- `GET /api/admin/rooms` - 객실 목록
- `POST /api/admin/rooms` - 객실 생성
- `PUT /api/admin/rooms/{id}` - 객실 수정
- `DELETE /api/admin/rooms/{id}` - 객실 삭제
- `GET /api/admin/bookings` - 예약 목록
- `GET /api/admin/reviews` - 리뷰 목록
- `GET /api/admin/notices` - 공지사항 목록
- `POST /api/admin/notices` - 공지사항 생성

## 주의사항

- 데이터베이스 연결 정보는 `application.properties`에서 확인 및 수정 가능
- 관리자 비밀번호는 BCrypt로 암호화되어 저장됨 (schema.sql 참조)
- CORS 설정이 프론트엔드와의 통신을 위해 활성화되어 있음
- API는 JSON 형식으로 요청/응답을 처리함

