import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === '/login' || pathname === '/register';

  // 1. Đã đăng nhập mà vào /login hoặc /register -> Chuyển hướng ngay về Trang chủ (/)
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Chưa đăng nhập mà vào các trang bảo mật (không phải /login, /register) -> Chuyển hướng về /login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Truy cập trang gốc (/)
  if (pathname === '/') {
    // Chưa đăng nhập -> về /login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Đã đăng nhập -> Cho phép xem trang chủ
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Bỏ qua các file tĩnh, ảnh, api route để middleware chạy mượt mà
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
