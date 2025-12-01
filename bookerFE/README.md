# 호텔 예약 시스템 - 프론트엔드 (bookerFE)

호텔 예약 시스템의 프론트엔드 웹 애플리케이션입니다.

## 주요 기능

### 🏠 홈 화면
- 사용자 환영 메시지
- 공지사항 표시
- "객실 선택 화면으로 이동" 버튼
- "마이페이지" 버튼
- 로그인/회원가입 링크

### 🛏 객실 선택 화면
- 객실 목록 보기
- 날짜 필터링으로 예약 가능한 객실 조회
- 객실 상세 보기
- 객실별 리뷰 확인
- "예약하기" 버튼

### 📄 예약 화면
- 예약 생성
- 예약 상세/최종 요금 확인
- 결제 화면 및 결제 처리

### 👤 마이페이지
- 프로필 관리 / 이름 변경
- 이메일 변경
- 비밀번호 변경
- 회원 탈퇴
- 예약 관리/취소
- 결제 내역
- 리뷰 작성

## 기술 스택

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Fetch API

## 파일 구조

```
bookerFE/
├── index.html          # 홈 화면
├── rooms.html          # 객실 선택 화면
├── room-detail.html    # 객실 상세 화면
├── booking.html        # 예약 및 결제 화면
├── mypage.html         # 마이페이지
├── login.html          # 로그인
├── register.html       # 회원가입
├── css/
│   └── style.css       # 스타일시트
└── js/
    ├── api.js          # API 통신 모듈
    ├── index.js        # 홈 페이지 스크립트
    ├── rooms.js        # 객실 선택 페이지 스크립트
    ├── room-detail.js  # 객실 상세 페이지 스크립트
    ├── booking.js      # 예약 페이지 스크립트
    ├── mypage.js       # 마이페이지 스크립트
    ├── login.js        # 로그인 스크립트
    └── register.js     # 회원가입 스크립트
```

## 사용 방법

### 1. 백엔드 서버 실행

먼저 백엔드 서버(`bookerBE`)가 실행 중이어야 합니다.

```bash
cd bookerBE
./gradlew bootRun
```

백엔드 서버는 기본적으로 `http://localhost:8081`에서 실행됩니다.

### 2. 프론트엔드 실행

#### 옵션 1: 간단한 HTTP 서버 사용

Python이 설치되어 있다면:

```bash
cd bookerFE
python3 -m http.server 3000
```

또는 Node.js가 설치되어 있다면:

```bash
cd bookerFE
npx http-server -p 3000
```

#### 옵션 2: 백엔드에 통합

프론트엔드 파일을 백엔드의 정적 리소스로 복사:

```bash
cp -r bookerFE/* bookerBE/src/main/resources/static/
```

그러면 백엔드 서버에서 프론트엔드도 함께 서빙됩니다.

### 3. 브라우저에서 접속

- 로컬 서버 사용 시: `http://localhost:3000`
- 백엔드 통합 시: `http://localhost:8081`

## API 통신

프론트엔드는 백엔드의 REST API와 통신합니다. 현재는 Thymeleaf 템플릿을 사용하는 백엔드와 호환되도록 구현되어 있으며, HTML 응답을 파싱하여 데이터를 추출합니다.

향후 백엔드가 완전한 REST API로 전환되면 `js/api.js`의 API 호출 방식을 JSON 응답으로 변경하면 됩니다.

## 주요 기능 설명

### 인증
- 로그인/로그아웃
- 회원가입
- 세션 기반 인증 (쿠키 사용)

### 객실 관리
- 객실 목록 조회
- 날짜별 예약 가능 객실 검색
- 객실 상세 정보 및 리뷰 확인

### 예약 관리
- 예약 생성
- 예약 취소
- 예약 상태 확인

### 결제
- 결제 처리
- 결제 내역 조회

### 사용자 관리
- 프로필 수정
- 비밀번호 변경
- 회원 탈퇴

## 주의사항

- 백엔드 서버가 실행 중이어야 합니다
- CORS 설정이 필요할 수 있습니다 (백엔드 `application.properties`에서 설정)
- 현재는 Thymeleaf 템플릿 응답을 파싱하는 방식으로 구현되어 있습니다
- 완전한 REST API로 전환 시 코드 수정이 필요합니다

