# Vercel 환경변수 설정 가이드

## 이미지 생성 API 통합을 위한 환경변수

### 필수 환경변수

#### 1. AI 모델 API 키

```bash
# Flux Schnell API
FLUX_SCHNELL_API_KEY=your_flux_schnell_api_key_here
FLUX_SCHNELL_API_URL=https://api.flux-schnell.com/v1

# Google Imagen3 API
IMAGEN3_API_KEY=your_google_imagen3_api_key_here
IMAGEN3_PROJECT_ID=your_google_project_id_here

# Flux Context API (참조 이미지 기반)
FLUX_CONTEXT_API_KEY=your_flux_context_api_key_here
FLUX_CONTEXT_API_URL=https://api.flux-context.com/v1
```

#### 2. Supabase 연동

```bash
# 기존 Supabase 설정 (이미 설정되어 있음)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### 3. 파일 저장소 설정

```bash
# Supabase Storage (이미지 저장)
SUPABASE_STORAGE_BUCKET=generated-images
SUPABASE_STORAGE_URL=your_supabase_storage_url_here

# CDN 설정 (선택사항)
IMAGE_CDN_URL=https://your-cdn-domain.com
IMAGE_CDN_TOKEN=your_cdn_token_here
```

#### 4. 사용량 제한 및 비용 설정

```bash
# 일일/월간 사용량 제한
DAILY_IMAGE_LIMIT=50
MONTHLY_IMAGE_LIMIT=1000
MONTHLY_COST_LIMIT=20.00

# 모델별 비용 설정 (USD per image)
FLUX_SCHNELL_COST_PER_IMAGE=0.02
IMAGEN3_COST_PER_IMAGE=0.05
FLUX_CONTEXT_COST_PER_IMAGE=0.03
```

#### 5. 이미지 처리 설정

```bash
# 이미지 최적화
ENABLE_IMAGE_OPTIMIZATION=true
DEFAULT_IMAGE_FORMAT=webp
DEFAULT_IMAGE_QUALITY=85
MAX_IMAGE_SIZE_MB=10

# 워터마크 설정
ENABLE_WATERMARK=false
WATERMARK_TEXT="Planning Platform"
WATERMARK_OPACITY=0.3
```

#### 6. 대기열 관리 설정

```bash
# 동시 생성 제한
MAX_CONCURRENT_GENERATIONS=3
GENERATION_TIMEOUT_MS=300000
QUEUE_CLEANUP_INTERVAL_HOURS=1
```

### 선택적 환경변수

#### 1. 모니터링 및 로깅

```bash
# Sentry (에러 모니터링)
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production

# 로그 레벨
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false
```

#### 2. 캐싱 설정

```bash
# Redis 캐싱 (선택사항)
REDIS_URL=your_redis_url_here
CACHE_TTL_SECONDS=3600
ENABLE_RESPONSE_CACHE=true
```

#### 3. 웹훅 및 알림

```bash
# 생성 완료 웹훅
WEBHOOK_ENDPOINT=https://your-domain.com/api/webhooks/image-complete
WEBHOOK_SECRET=your_webhook_secret_here

# 이메일 알림 (선택사항)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_smtp_password
```

### Vercel 배포 설정

#### 1. Vercel CLI로 환경변수 설정

```bash
# Vercel CLI 로그인
vercel login

# 환경변수 설정
vercel env add FLUX_SCHNELL_API_KEY production
vercel env add IMAGEN3_API_KEY production
vercel env add FLUX_CONTEXT_API_KEY production

# 모든 환경(development, preview, production)에 설정
vercel env add DAILY_IMAGE_LIMIT development preview production
vercel env add MONTHLY_IMAGE_LIMIT development preview production
```

#### 2. Vercel 대시보드에서 설정

1. Vercel 프로젝트 대시보드 접속
2. Settings > Environment Variables
3. 위의 환경변수들을 각각 추가
4. Environment 선택 (Production, Preview, Development)

#### 3. 환경별 설정 권장사항

```bash
# Development 환경
DAILY_IMAGE_LIMIT=10
MONTHLY_IMAGE_LIMIT=100
ENABLE_DEBUG_LOGS=true
LOG_LEVEL=debug

# Preview 환경
DAILY_IMAGE_LIMIT=25
MONTHLY_IMAGE_LIMIT=250
LOG_LEVEL=info

# Production 환경
DAILY_IMAGE_LIMIT=50
MONTHLY_IMAGE_LIMIT=1000
LOG_LEVEL=warn
ENABLE_IMAGE_OPTIMIZATION=true
```

### 보안 고려사항

#### 1. API 키 보호

- API 키는 절대 클라이언트 사이드에 노출하지 않음
- `NEXT_PUBLIC_` 프리픽스 사용 금지
- 정기적인 API 키 로테이션 실시

#### 2. 환경변수 검증

```typescript
// 환경변수 검증 함수 예시
function validateEnvironmentVariables() {
  const required = [
    'FLUX_SCHNELL_API_KEY',
    'IMAGEN3_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }
}
```

#### 3. 접근 제한

- Vercel 프로젝트 액세스 제한
- 팀 멤버 권한 관리
- API 엔드포인트 Rate Limiting

### 비용 최적화 팁

#### 1. 모델 선택 최적화

```bash
# 기본 모델을 비용 효율적인 Flux Schnell로 설정
DEFAULT_IMAGE_MODEL=flux-schnell

# 고품질 요청시에만 Imagen3 사용
HIGH_QUALITY_THRESHOLD=true
```

#### 2. 캐싱 활용

```bash
# 유사한 프롬프트 결과 캐싱
ENABLE_PROMPT_CACHE=true
PROMPT_CACHE_TTL_HOURS=24

# 이미지 CDN 캐싱
CDN_CACHE_MAX_AGE=31536000
```

#### 3. 사용량 모니터링

```bash
# 비용 알림 임계값
COST_ALERT_THRESHOLD=15.00
USAGE_ALERT_THRESHOLD=80

# 자동 제한
AUTO_LIMIT_ON_THRESHOLD=true
```

### 테스트 환경 설정

#### 1. 로컬 개발

```bash
# .env.local 파일에 개발용 키 설정
FLUX_SCHNELL_API_KEY=test_key_or_mock
IMAGEN3_API_KEY=test_key_or_mock
ENABLE_MOCK_APIS=true
```

#### 2. 스테이징 환경

```bash
# 제한된 할당량으로 테스트
DAILY_IMAGE_LIMIT=5
MONTHLY_IMAGE_LIMIT=50
TEST_MODE=true
```

### 모니터링 및 디버깅

#### 1. 로그 설정

```bash
# 상세 로깅 활성화
ENABLE_GENERATION_LOGS=true
LOG_GENERATION_REQUESTS=true
LOG_GENERATION_RESPONSES=true
```

#### 2. 성능 모니터링

```bash
# 응답 시간 모니터링
TRACK_GENERATION_TIME=true
PERFORMANCE_THRESHOLD_MS=10000

# 큐 상태 모니터링
MONITOR_QUEUE_STATUS=true
QUEUE_STATUS_INTERVAL_MS=5000
```

이 환경변수 설정을 통해 이미지 생성 시스템이 Vercel에서 안전하고 효율적으로 작동할 수 있습니다.
