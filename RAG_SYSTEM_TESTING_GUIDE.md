# RAG 시스템 테스트 가이드

## 개요

본 가이드는 새로 구현된 RAG (Retrieval-Augmented Generation) 시스템의 테스트 방법과 절차를 상세히 설명합니다. RAG 시스템은 문서 처리, 벡터 검색, 그리고 AI 기반 응답 생성을 통합한 종합적인 지식 검색 시스템입니다.

## 시스템 구조

### 핵심 컴포넌트

1. **Document Processor** (`src/lib/services/documentProcessor.ts`)
   - 문서 업로드 및 텍스트 추출
   - 텍스트 청킹 (chunking) 및 전처리
   - OpenAI 임베딩 생성
   - Supabase 벡터 데이터베이스 저장

2. **Vector Search** (`src/lib/services/vectorSearch.ts`)
   - 시맨틱 검색 (의미 기반 검색)
   - 키워드 검색 (전체 텍스트 검색)
   - 하이브리드 검색 (시맨틱 + 키워드)
   - 지식 베이스 검색 (커스텀 봇용)

3. **RAG Service** (`src/lib/services/ragService.ts`)
   - 질의 확장 및 의도 파악
   - 관련 문서 검색 및 컨텍스트 생성
   - AI 응답 생성 및 신뢰도 계산
   - 대화형 RAG 지원

4. **API Routes**
   - `/api/rag/upload` - 문서 업로드 및 처리
   - `/api/rag/search` - 벡터 검색 수행
   - `/api/rag/chat` - RAG 기반 채팅

## 데이터베이스 설정

### 필수 Supabase 설정

RAG 시스템 테스트 전에 Supabase 데이터베이스에 다음 설정이 완료되어야 합니다:

1. **pgvector 확장 활성화**

```sql
-- pgvector 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **테이블 생성**

```sql
-- documents 테이블 (기존 존재 시 스키마 확인)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  content TEXT,
  processed_content TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_chunks 테이블
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536), -- OpenAI ada-002 embedding 차원
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- knowledge_base 테이블 (커스텀 봇용)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_bot_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **인덱스 생성**

```sql
-- 벡터 검색 성능 최적화를 위한 IVFFlat 인덱스
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
ON document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding
ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 일반 인덱스
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id ON document_chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_project_id ON document_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_custom_bot_id ON knowledge_base(custom_bot_id);
```

4. **벡터 검색 함수 생성**

```sql
-- 문서 청크 검색 함수
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  metadata JSONB,
  similarity FLOAT,
  document_id UUID,
  project_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.chunk_text,
    dc.metadata,
    (1 - (dc.embedding <=> query_embedding)) AS similarity,
    dc.document_id,
    dc.project_id
  FROM document_chunks dc
  WHERE (1 - (dc.embedding <=> query_embedding)) > match_threshold
  ORDER BY dc.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- 지식 베이스 검색 함수
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding VECTOR(1536),
  bot_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  custom_bot_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.metadata,
    (1 - (kb.embedding <=> query_embedding)) AS similarity,
    kb.custom_bot_id
  FROM knowledge_base kb
  WHERE kb.custom_bot_id = bot_id
    AND (1 - (kb.embedding <=> query_embedding)) > match_threshold
  ORDER BY kb.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
```

5. **RLS 정책 설정**

```sql
-- RLS 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책 (사용자별 접근 제어)
CREATE POLICY "Users can access their own documents" ON documents
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own document chunks" ON document_chunks
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own knowledge base" ON knowledge_base
  FOR ALL USING (user_id = auth.uid());
```

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수가 설정되어야 합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI 설정
OPENAI_API_KEY=your_openai_api_key
```

## 테스트 절차

### 1. 문서 업로드 테스트

#### 1.1 기본 문서 업로드

```bash
curl -X POST http://localhost:3000/api/rag/upload \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test_document.pdf" \
  -F "projectId=your_project_id"
```

**예상 응답:**

```json
{
  "success": true,
  "document_id": "uuid-here",
  "file_name": "test_document.pdf",
  "chunks_created": 15,
  "processing_time": "3.2s"
}
```

#### 1.2 지원 파일 형식 테스트

다음 파일 형식들을 테스트해보세요:

- PDF (.pdf)
- Word 문서 (.doc, .docx)
- 텍스트 파일 (.txt)
- 마크다운 (.md)

#### 1.3 오류 처리 테스트

- 지원하지 않는 파일 형식 업로드
- 파일 크기 제한 초과
- 잘못된 인증 토큰
- 존재하지 않는 프로젝트 ID

### 2. 벡터 검색 테스트

#### 2.1 시맨틱 검색 테스트

```bash
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "프로젝트 관리 방법론",
    "searchType": "semantic",
    "limit": 5,
    "threshold": 0.7,
    "projectId": "your_project_id"
  }'
```

**예상 응답:**

```json
{
  "success": true,
  "query": "프로젝트 관리 방법론",
  "searchType": "semantic",
  "results": [
    {
      "id": "chunk-uuid",
      "chunk_text": "프로젝트 관리 방법론은...",
      "similarity_score": 0.85,
      "document_name": "test_document.pdf",
      "metadata": {
        "document_file_name": "test_document.pdf",
        "chunk_length": 245
      }
    }
  ],
  "metadata": {
    "total_results": 5,
    "timestamp": "2025-08-26T10:30:00.000Z"
  }
}
```

#### 2.2 키워드 검색 테스트

```bash
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "애자일 스크럼",
    "searchType": "keyword",
    "limit": 10
  }'
```

#### 2.3 하이브리드 검색 테스트

```bash
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "사용자 경험 디자인",
    "searchType": "hybrid",
    "limit": 10,
    "threshold": 0.6
  }'
```

### 3. RAG 채팅 테스트

#### 3.1 기본 RAG 질의

```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "프로젝트 관리에서 위험 관리는 어떻게 해야 하나요?",
    "projectId": "your_project_id",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }'
```

**예상 응답:**

```json
{
  "success": true,
  "query": "프로젝트 관리에서 위험 관리는 어떻게 해야 하나요?",
  "answer": "프로젝트 위험 관리는 다음과 같은 단계로 진행됩니다...",
  "sources": [
    {
      "id": "chunk-uuid",
      "similarity_score": 0.89,
      "document_name": "project_management_guide.pdf"
    }
  ],
  "metadata": {
    "confidence": 0.85,
    "model": "gpt-3.5-turbo",
    "tokens_used": 245,
    "context_length": 1850,
    "sources_count": 3,
    "timestamp": "2025-08-26T10:30:00.000Z"
  }
}
```

#### 3.2 대화형 RAG 테스트

```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "더 자세히 설명해주세요",
    "projectId": "your_project_id",
    "chatHistory": [
      {
        "role": "user",
        "content": "애자일 방법론이 무엇인가요?"
      },
      {
        "role": "assistant",
        "content": "애자일 방법론은 반복적이고 점진적인 개발 접근방식입니다..."
      }
    ]
  }'
```

#### 3.3 커스텀 봇 테스트

```bash
curl -X POST http://localhost:3000/api/rag/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "회사 정책에 대해 알려주세요",
    "customBotId": "your_custom_bot_id"
  }'
```

### 4. 성능 테스트

#### 4.1 응답 시간 측정

각 API 엔드포인트의 응답 시간을 측정하고 다음 기준과 비교:

- 문서 업로드: < 10초 (파일 크기에 따라)
- 벡터 검색: < 2초
- RAG 채팅: < 5초

#### 4.2 동시 접속 테스트

여러 사용자가 동시에 RAG 시스템을 사용할 때의 성능을 확인:

```bash
# Apache Bench를 사용한 부하 테스트 예시
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -p search_payload.json -T application/json \
  http://localhost:3000/api/rag/search
```

### 5. 품질 테스트

#### 5.1 검색 정확도 테스트

1. **관련성 테스트**: 질의와 검색 결과의 의미적 관련성 확인
2. **완전성 테스트**: 중요한 정보가 누락되지 않았는지 확인
3. **순위 테스트**: 검색 결과가 관련도 순으로 정렬되었는지 확인

#### 5.2 RAG 응답 품질 테스트

1. **정확성**: 제공된 컨텍스트 기반으로 정확한 응답 생성
2. **일관성**: 동일한 질문에 대해 일관된 응답 제공
3. **인용**: 적절한 소스 인용 및 참조

#### 5.3 신뢰도 점수 검증

- 고품질 답변: confidence > 0.8
- 중간 품질 답변: 0.5 < confidence < 0.8
- 낮은 품질 답변: confidence < 0.5

### 6. 오류 처리 테스트

#### 6.1 API 오류 테스트

- 잘못된 요청 형식 (400 Bad Request)
- 인증 실패 (401 Unauthorized)
- 존재하지 않는 리소스 (404 Not Found)
- 내부 서버 오류 (500 Internal Server Error)

#### 6.2 외부 서비스 장애 테스트

- OpenAI API 호출 실패
- Supabase 연결 실패
- 네트워크 타임아웃

## 문제 해결 가이드

### 자주 발생하는 문제들

#### 1. pgvector 확장 오류

**증상**: `extension "vector" does not exist` 오류
**해결책**:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 2. 임베딩 생성 실패

**증상**: OpenAI API 호출 시 오류 발생
**해결책**:

- `OPENAI_API_KEY` 환경 변수 확인
- API 키의 유효성 및 잔액 확인

#### 3. 벡터 검색 결과 없음

**증상**: 검색 쿼리 실행 시 빈 결과 반환
**해결책**:

- 임베딩이 올바르게 생성되었는지 확인
- 임계값(threshold) 설정이 너무 높지 않은지 확인
- 인덱스가 올바르게 생성되었는지 확인

#### 4. 메모리 부족 오류

**증상**: 대용량 문서 처리 시 메모리 초과 오류
**해결책**:

- 청크 크기를 줄여서 처리
- 배치 크기를 작게 설정

### 로그 확인 방법

#### 애플리케이션 로그

```bash
# 개발 환경에서 로그 확인
npm run dev

# 프로덕션 로그 확인 (Vercel)
vercel logs
```

#### Supabase 로그

Supabase 대시보드 → Logs → API 로그에서 데이터베이스 쿼리 및 오류 확인

#### OpenAI API 로그

OpenAI 대시보드에서 API 사용량 및 오류 로그 확인

## 성능 모니터링

### 메트릭 수집

다음 메트릭들을 모니터링하세요:

1. **API 응답 시간**
   - 업로드 API: 평균 < 10초
   - 검색 API: 평균 < 2초
   - 채팅 API: 평균 < 5초

2. **처리량**
   - 초당 요청 수 (RPS)
   - 동시 접속자 수

3. **오류율**
   - 4xx 오류율 < 5%
   - 5xx 오류율 < 1%

4. **리소스 사용량**
   - CPU 사용률
   - 메모리 사용률
   - 데이터베이스 연결 수

### 알림 설정

중요한 메트릭에 대한 알림을 설정하여 문제를 조기에 발견:

- 응답 시간 임계값 초과
- 오류율 급증
- API 키 할당량 한계 근접

## 보안 고려사항

### 데이터 보호

1. **개인정보 보호**: 업로드된 문서에서 민감한 정보 자동 탐지 및 마스킹
2. **접근 제어**: 사용자별/프로젝트별 데이터 접근 제한
3. **암호화**: 저장 데이터 및 전송 데이터 암호화

### API 보안

1. **인증**: JWT 토큰 기반 인증 확인
2. **인가**: 역할 기반 접근 제어 (RBAC)
3. **속도 제한**: API 호출 빈도 제한

## 결론

본 가이드를 통해 RAG 시스템의 모든 구성 요소를 체계적으로 테스트할 수 있습니다.

### 테스트 체크리스트

- [ ] 데이터베이스 설정 완료
- [ ] 환경 변수 구성 완료
- [ ] 문서 업로드 기능 테스트
- [ ] 벡터 검색 기능 테스트
- [ ] RAG 채팅 기능 테스트
- [ ] 성능 테스트 수행
- [ ] 오류 처리 테스트 완료
- [ ] 보안 검증 완료

각 테스트 단계별로 결과를 기록하고, 발견된 문제점은 즉시 수정하여 안정적인 RAG 시스템을 구축하시기 바랍니다.

---

_작성일: 2025-08-26_  
_RAG 시스템 버전: 1.0_
