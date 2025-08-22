# Vercel Deployment Guide

## 🚀 Vercel 배포 단계별 가이드

### 1. Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결: `Donggull/ea_plan_01` 선택
4. Root Directory를 `planning-platform`으로 설정
5. Framework Preset을 `Next.js`로 선택

### 2. 환경 변수 설정

⚠️ **중요**: Vercel 프로젝트 Settings > Environment Variables에서 다음 변수들을 **직접 추가**해야 합니다:

#### 설정 방법:

1. Vercel 프로젝트 → Settings 탭 → Environment Variables 메뉴
2. "Add New" 버튼 클릭
3. 아래 변수들을 하나씩 추가 (Name과 Value 입력)
4. Environment: Production, Preview, Development 모두 체크

#### 필수 환경 변수 (Supabase)

| Variable Name                   | Value Example                             |
| ------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://abc123def456.supabase.co`        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

#### 선택적 환경 변수 (AI APIs - 향후 구현용)

```
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
REPLICATE_API_TOKEN=your-replicate-token
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### 3. Supabase 프로젝트 설정

#### 3.1 새 Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 조직 선택 후 프로젝트 정보 입력:
   - Name: `ea-planning-platform`
   - Database Password: 강력한 비밀번호 설정
   - Region: `Northeast Asia (Tokyo)` 선택
4. "Create new project" 클릭

#### 3.2 환경 변수 값 확인

프로젝트 생성 후 Settings > API에서 확인:

- **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
- **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
- **service_role**: `SUPABASE_SERVICE_ROLE_KEY`에 사용

#### 3.3 데이터베이스 스키마 설정

SQL Editor에서 다음 쿼리 실행:

```sql
-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('proposal', 'development', 'operation')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대화 기록 테이블
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 생성된 이미지 테이블
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model_used TEXT NOT NULL,
  image_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations" ON conversations
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM projects WHERE id = conversations.project_id
  ));

CREATE POLICY "Users can view own messages" ON messages
  FOR ALL USING (auth.uid() IN (
    SELECT p.user_id FROM projects p
    JOIN conversations c ON c.project_id = p.id
    WHERE c.id = messages.conversation_id
  ));

CREATE POLICY "Users can view own images" ON generated_images
  FOR ALL USING (auth.uid() = user_id);
```

#### 3.4 인증 설정

Authentication > Settings에서:

1. **Site URL**: `https://your-app.vercel.app`
2. **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

### 4. 배포 실행

1. Vercel에서 "Deploy" 클릭
2. 빌드 완료 대기 (약 2-3분)
3. 배포 완료 후 도메인 확인

### 5. 도메인 설정 (선택사항)

Vercel 프로젝트 Settings > Domains에서:

1. 커스텀 도메인 추가
2. DNS 설정 업데이트
3. SSL 인증서 자동 생성

### 6. 모니터링 설정

#### 6.1 Vercel Analytics

- Functions > Analytics에서 활성화
- 성능 모니터링 자동 설정

#### 6.2 Supabase 모니터링

- Reports에서 사용량 확인
- Logs에서 에러 모니터링

### 7. 환경별 설정

#### Production

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app
```

#### Development (로컬)

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### 8. 배포 후 확인사항

1. ✅ 메인 페이지 로딩 확인
2. ✅ 각 페이지 네비게이션 확인
3. ✅ Supabase 연결 상태 확인
4. ✅ 콘솔 에러 없는지 확인
5. ✅ 모바일 반응형 확인

### 9. 문제 해결

#### 빌드 에러

```bash
# 로컬에서 빌드 테스트
npm run build
```

#### 환경 변수 에러

- Vercel 대시보드에서 환경 변수 재확인
- 변수 이름 오타 확인
- 재배포 실행

#### Supabase 연결 에러

- API 키 유효성 확인
- RLS 정책 확인
- 네트워크 접근 권한 확인

---

## 📞 지원

문제 발생 시:

1. Vercel 로그 확인
2. Supabase 로그 확인
3. 브라우저 개발자 도구 콘솔 확인
