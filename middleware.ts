import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 需要登录才能访问的路由
const protectedRoutes = ['/qa', '/scan']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl

  // 如果是受保护的路由且没有token，重定向到登录页
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 如果已登录，访问登录页则重定向到首页
  if (pathname === '/login' && token) {
    const homeUrl = new URL('/qa', request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有需要保护的路由:
     * - /qa
     * - /scan
     * - /login (处理已登录用户的重定向)
     */
    '/qa/:path*',
    '/scan/:path*',
    '/login',
  ],
}
