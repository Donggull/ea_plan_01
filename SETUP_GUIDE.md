# 🚀 웹·앱 서비스 기획자 플랫폼 설정 가이드

## 1. 환경 변수 설정

### 1.1 환경 변수 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API 키 (선택사항 - 최소 하나 이상 필요)
GOOGLE_AI_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# 기타 환경 설정
NODE_ENV=development
```

### 1.2 Supabase 프로젝트 생성 및 설정

1. **Supabase 프로젝트 생성**
   - [Supabase](https://supabase.com)에 가입하고 로그인
   - "New Project" 클릭하여 새 프로젝트 생성
   - 프로젝트 이름, 데이터베이스 비밀번호 설정
   - 리전 선택 (Asia Northeast - Seoul 권장)

2. **API 키 확인**
   - 프로젝트 대시보드 → Settings → API
   - `Project URL`을 `NEXT_PUBLIC_SUPABASE_URL`에 복사
   - `anon public key`를 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사
   - `service_role secret key`를 `SUPABASE_SERVICE_ROLE_KEY`에 복사

3. **데이터베이스 스키마 설정**
   - Supabase 대시보드 → SQL Editor
   - 프로젝트 루트의 `supabase-setup.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣고 "RUN" 실행
   - "Supabase 스키마 설정이 완료되었습니다!" 메시지 확인

### 1.3 AI API 키 설정 (선택사항)

최소 하나 이상의 AI API 키가 필요합니다:

**Google AI (Gemini) - 권장**

- [Google AI Studio](https://makersuite.google.com)에서 API 키 생성
- 무료 티어 제공, 빠른 응답 속도

**OpenAI (ChatGPT)**

- [OpenAI Platform](https://platform.openai.com)에서 API 키 생성
- 고품질 텍스트 생성, 유료 서비스

**Anthropic (Claude)**

- [Anthropic Console](https://console.anthropic.com)에서 API 키 생성
- MCP 도구 통합 지원, 유료 서비스

## 2. 프로젝트 실행

### 2.1 의존성 설치

```bash
npm install
```

### 2.2 개발 서버 실행

```bash
npm run dev
```

### 2.3 브라우저에서 확인

- http://localhost:3000 (또는 표시된 포트)에 접속
- 환경 설정이 올바르다면 로그인 페이지가 표시됩니다
- 환경 설정에 문제가 있다면 자동으로 설정 가이드가 표시됩니다

## 3. 문제 해결

### 3.1 "프로젝트를 불러올 수 없습니다" 오류

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- Supabase URL과 키가 올바른지 확인
- 개발 서버 재시작 (Ctrl+C → npm run dev)

### 3.2 "Unexpected error occurred" 오류

- `supabase-setup.sql` 스크립트를 Supabase에서 실행했는지 확인
- 브라우저 개발자 도구 콘솔에서 구체적인 오류 메시지 확인
- Health Check API로 상태 확인: `http://localhost:3000/api/health-check`

### 3.3 AI 모델 관련 오류

- 최소 하나 이상의 AI API 키가 설정되어 있는지 확인
- API 키가 유효한지 확인 (키 복사 시 공백 제거)
- AI 서비스별 할당량 확인

## 4. 추가 설정 (선택사항)

### 4.1 이미지 생성 설정

이미지 생성 기능을 사용하려면 추가 설정이 필요할 수 있습니다. 현재는 AI API를 통한 텍스트 기반 이미지 생성만 지원됩니다.

### 4.2 MCP 도구 설정

Claude API를 설정하면 다음 MCP 도구들이 자동으로 활성화됩니다:

- 웹 검색: 실시간 정보 검색
- 파일 시스템: 문서 읽기/쓰기
- 데이터베이스: Supabase 쿼리
- 이미지 생성: AI 이미지 생성

### 4.3 프로덕션 배포

Vercel에 배포할 경우:

1. Vercel 프로젝트 생성
2. 환경 변수를 Vercel 대시보드에 설정
3. `vercel --prod` 명령어로 배포

## 5. 기능 확인

설정이 완료되면 다음 기능들을 테스트해보세요:

- ✅ 회원가입/로그인
- ✅ 대시보드 접근
- ✅ AI 챗봇 대화
- ✅ 프로젝트 생성
- ✅ MCP 도구 사용 (Claude API 설정 시)
- ✅ 이미지 생성 (지원되는 AI API 설정 시)

## 6. 지원

문제가 발생하면:

1. 브라우저 개발자 도구 콘솔 확인
2. 터미널 로그 확인
3. `/api/health-check` 엔드포인트로 상태 확인
4. GitHub Issues에 문제 보고

---

🎉 **설정 완료!** 이제 웹·앱 서비스 기획자 플랫폼을 사용할 수 있습니다!
