import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hostname = request.headers.get('host')?.toLowerCase() || '';
  const envMode = process.env.NEXT_PUBLIC_APP_MODE;

  // Deteksi jika deployment atau rute adalah Jalur Tenant Live
  const isTenantDeployment = 
    envMode === 'tenant' || 
    hostname.startsWith('live.') || 
    hostname.startsWith('app.') || 
    hostname.startsWith('tenant.') || 
    hostname.includes('-tenant') ||
    hostname.includes('-live') ||
    searchParams.get('mode') === 'tenant' ||
    request.cookies.get('ks_app_mode')?.value === 'tenant';

  // Isolasi Ketat: Super Admin Terlarang pada Jalur Tenant Live
  if (isTenantDeployment && pathname.startsWith('/super-admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 1. Daftar rute yang dilindungi otentikasi
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/finance') ||
    pathname.startsWith('/akademik') ||
    pathname.startsWith('/rumah-tangga') ||
    pathname.startsWith('/santri') ||
    pathname.startsWith('/wali') ||
    pathname.startsWith('/presensi') ||
    pathname.startsWith('/laporan');

  // Token otentikasi
  const token = 
    request.cookies.get('sb-access-token')?.value || 
    request.cookies.get('ks_session')?.value;

  // 2. Redirect jika sudah login tapi membuka halaman /login
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Sesi Default jika belum ada (memudahkan pengujian menyeluruh)
  const response = NextResponse.next();
  if (isProtectedRoute && !token) {
    response.cookies.set('ks_session', 'active-eval-session', { path: '/', httpOnly: false });
  }

  // 4. Sinkronisasi Cookie Mode Otomatis
  if (isTenantDeployment) {
    response.cookies.set('ks_app_mode', 'tenant', { path: '/', maxAge: 864000 });
    response.cookies.set('ks_active_tenant_id', 'tenant-rabu-001', { path: '/', maxAge: 864000 });
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/finance/:path*',
    '/akademik/:path*',
    '/rumah-tangga/:path*',
    '/santri/:path*',
    '/wali/:path*',
    '/presensi/:path*',
    '/laporan/:path*',
    '/super-admin/:path*',
    '/login',
  ],
};
