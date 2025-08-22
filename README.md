# 웹·앱 서비스 기획자 플랫폼

AI 기반 통합 워크플로우 플랫폼으로, 제안 진행부터 구축 관리, 운영 관리까지 전 과정을 하나의 플랫폼에서 효율적으로 처리할 수 있는 종합 솔루션입니다.

## 주요 기능

### 🎯 핵심 카테고리

- **제안 진행**: RFP 분석, 시장 조사, 제안서 작성, 비용 산정
- **구축 관리**: 현황분석, 요구사항정리, 기능정의, 화면설계, WBS, QA관리
- **운영 관리**: 요건 관리, 업무 분배, 일정 관리, 성과 관리

### 🤖 AI 시스템

- **멀티 모델 지원**: Gemini, ChatGPT, Claude + MCP 연동
- **RAG 기반 커스텀 챗봇** 생성 및 공유
- **실시간 코드 실행 캔버스**
- **이미지 생성**: Flux Schnell, Imagen3

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **State Management**: Zustand, TanStack Query
- **Database**: Supabase
- **UI Components**: Headless UI, Heroicons
- **Code Editor**: Monaco Editor
- **Animation**: Framer Motion
- **Real-time**: Socket.io

## 개발 환경 설정

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd planning-platform
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 API 키들을 설정합니다:

```bash
cp .env.example .env.local
```

필수 환경 변수:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `GEMINI_API_KEY`: Google Gemini API 키
- `OPENAI_API_KEY`: OpenAI API 키
- `ANTHROPIC_API_KEY`: Anthropic Claude API 키

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 애플리케이션을 확인할 수 있습니다.

## 사용 가능한 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 실행
- `npm run lint:fix`: ESLint 자동 수정
- `npm run format`: Prettier 포맷팅
- `npm run format:check`: Prettier 포맷 확인

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
├── components/          # 재사용 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── chat/           # 챗봇 관련 컴포넌트
│   ├── canvas/         # 코드/이미지 캔버스
│   ├── project/        # 프로젝트 관리 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── lib/                # 유틸리티 및 설정
├── hooks/              # 커스텀 훅
├── stores/             # Zustand 상태 관리
└── types/              # TypeScript 타입 정의
```

## 개발 도구 설정

### Code Quality

- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **Husky**: Git 훅 관리
- **lint-staged**: 스테이징된 파일만 린트 실행

### Pre-commit 훅

커밋 전에 자동으로 실행됩니다:

1. ESLint 검사 및 자동 수정
2. Prettier 포맷팅
3. 타입 체크

## 기여 가이드

1. 브랜치 생성: `git checkout -b feature/your-feature-name`
2. 변경사항 커밋: `git commit -m 'Add some feature'`
3. 브랜치 푸시: `git push origin feature/your-feature-name`
4. Pull Request 생성

## 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)를 따릅니다.
