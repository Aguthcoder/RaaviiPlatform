import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login'];

function decodeRole(token?: string) {
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    return payload.role as 'admin' | 'user' | undefined;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken');
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/_next');

  if (!refreshToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin')) {
    const role = decodeRole(accessToken);
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
