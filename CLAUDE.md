# 블로그 자동 글쓰기 시스템

## 프로젝트 개요
간호 상담사가 월 1회 네이버 블로그에 글을 올리기 위한 AI 기반 자동 글 작성 시스템

## 기술 스택
- **프론트엔드/백엔드**: Next.js 16 + TypeScript + Tailwind CSS
- **AI**: Google Gemini API (gemini-1.5-flash)
- **데이터 저장**: Supabase (PostgreSQL)
- **알림**: 카카오톡 나에게 보내기 API
- **배포**: Vercel

## 실행 방법

### 1. 환경변수 설정
`.env.local` 파일을 생성하고 다음 변수를 설정:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
```

### 2. Supabase 테이블 생성
```sql
-- profiles 테이블
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  job TEXT DEFAULT '간호 상담사',
  experience TEXT,
  blog_style TEXT,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- posts 테이블
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  positive_experience TEXT,
  negative_experience TEXT,
  improvement TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- kakao_tokens 테이블
CREATE TABLE kakao_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 개발 서버 실행
```bash
npm install
npm run dev
```

## 파일 구조
```
blog-auto-writer/
├── app/
│   ├── page.tsx                 # 메인 대시보드
│   ├── layout.tsx               # 레이아웃 + Navbar
│   ├── globals.css              # 전역 스타일
│   ├── profile/
│   │   └── page.tsx             # 프로필 설정 페이지
│   ├── write/
│   │   └── page.tsx             # 글 작성 페이지
│   ├── history/
│   │   └── page.tsx             # 작성 이력 페이지
│   └── api/
│       ├── generate/route.ts    # Gemini AI 글 생성
│       ├── profile/route.ts     # 프로필 CRUD
│       ├── posts/route.ts       # 작성 이력 CRUD
│       ├── auth/kakao/          # 카카오 OAuth
│       │   ├── route.ts         # 로그인 시작
│       │   └── callback/route.ts # OAuth 콜백
│       └── kakao/
│           ├── send/route.ts    # 나에게 보내기
│           └── status/route.ts  # 연동 상태 확인
├── lib/
│   ├── gemini.ts                # Gemini API 클라이언트
│   ├── kakao.ts                 # 카카오톡 API 클라이언트
│   └── supabase.ts              # Supabase 클라이언트
├── components/
│   ├── Navbar.tsx               # 네비게이션 바
│   ├── ProfileForm.tsx          # 프로필 입력 폼
│   ├── WriteForm.tsx            # 글감 입력 폼
│   └── PostPreview.tsx          # 생성된 글 미리보기
└── types/
    └── index.ts                 # TypeScript 타입 정의
```

## 주요 기능

### 1. 대시보드 (/)
- 프로필 상태 확인
- 이번 달 글 작성 여부 확인
- 카카오톡 연동 상태 확인
- 최근 작성한 글 목록

### 2. 프로필 설정 (/profile)
- 이름, 직업, 경력 입력
- 블로그 스타일 설정 (말투, 선호 주제 등)
- 카카오톡 연동

### 3. 글 작성 (/write)
- 이번 달 주제/키워드 입력
- 긍정적/부정적 경험 입력
- 개선하고 싶은 점 입력
- AI가 블로그 글 생성
- 생성된 글 수정/복사
- 이력에 저장
- 카카오톡으로 알림 전송

### 4. 작성 이력 (/history)
- 이전에 작성한 글 목록
- 글 상세 보기
- 내용 복사

## 카카오톡 연동 설정

1. [카카오 개발자](https://developers.kakao.com) 사이트에서 앱 등록
2. 카카오 로그인 활성화
3. Redirect URI 설정: `http://localhost:3000/api/auth/kakao/callback`
4. 동의항목에서 "카카오톡 메시지 전송" 권한 설정 (talk_message)
