import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

// 인증이 필요한 경로들
// 데모 모드를 위해 일부 경로는 인증 불필요
const protectedPaths = [
  // '/dashboard',  // 데모 모드에서는 대시보드 접근 허용
  // '/projects',   // 데모 모드에서는 프로젝트 접근 허용
  // '/chat',       // 데모 모드에서는 채팅 접근 허용
  // '/canvas',     // 데모 모드에서는 캔버스 접근 허용
  // '/images',     // 데모 모드에서는 이미지 접근 허용
  '/profile', // 프로필은 여전히 인증 필요
  '/settings', // 설정은 여전히 인증 필요
]

// 인증된 사용자가 접근할 수 없는 경로들
const authPaths = ['/auth/login', '/auth/signup', '/auth/reset-password']

// Pro 구독이 필요한 경로들
const proPaths = ['/chat/advanced', '/projects/unlimited', '/images/bulk']

// Enterprise 구독이 필요한 경로들
const enterprisePaths = ['/admin', '/analytics', '/team-management']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // API 경로는 미들웨어에서 처리하지 않음
  if (pathname.startsWith('/api')) {
    return res
  }

  // 정적 파일들도 처리하지 않음
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return res
  }

  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: Record<string, unknown>) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // 사용자 세션 확인
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware auth error:', error)
    }

    const user = session?.user

    // 보호된 경로 체크
    const isProtectedPath = protectedPaths.some(path =>
      pathname.startsWith(path)
    )

    // 인증 경로 체크
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))

    // 구독 레벨 체크
    const isProPath = proPaths.some(path => pathname.startsWith(path))

    const isEnterprisePath = enterprisePaths.some(path =>
      pathname.startsWith(path)
    )

    // 사용자 프로필 가져오기 (구독 레벨 체크를 위해)
    let userProfile = null
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      userProfile = profile
    }

    // 1. 인증된 사용자가 로그인/회원가입 페이지에 접근하는 경우
    if (user && isAuthPath) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // 2. 미인증 사용자가 보호된 경로에 접근하는 경우
    if (!user && isProtectedPath) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 3. 구독 레벨 체크
    if (user && userProfile) {
      const userTier = userProfile.subscription_tier

      // Pro 구독이 필요한 경로
      if (isProPath && userTier === 'free') {
        const redirectUrl = new URL('/pricing', req.url)
        redirectUrl.searchParams.set('upgrade', 'pro')
        redirectUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Enterprise 구독이 필요한 경로
      if (isEnterprisePath && (userTier === 'free' || userTier === 'pro')) {
        const redirectUrl = new URL('/pricing', req.url)
        redirectUrl.searchParams.set('upgrade', 'enterprise')
        redirectUrl.searchParams.set('from', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // 4. 루트 경로 처리
    if (pathname === '/') {
      // 데모 모드: 항상 대시보드로 리다이렉트
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)

    // 에러 발생 시 기본 동작
    if (pathname === '/') {
      // 데모 모드: 에러 발생해도 대시보드로 리다이렉트
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
