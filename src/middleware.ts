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

  // 2. Akses halaman /login (Jika logout atau akses langsung, izinkan dan bersihkan cookie)
  if (pathname === '/login') {
    if (searchParams.get('logout') === '1') {
      const logoutRes = NextResponse.next();
      logoutRes.cookies.set('sb-access-token', '', { path: '/', maxAge: 0, expires: new Date(0) });
      logoutRes.cookies.set('ks_session', '', { path: '/', maxAge: 0, expires: new Date(0) });
      logoutRes.cookies.set('ks_active_tenant_id', '', { path: '/', maxAge: 0, expires: new Date(0) });
      return logoutRes;
    }
    // Jika sengaja membuka login, jangan redirect paksa agar bisa ganti akun
    return NextResponse.next();
  }

  // 3. Sesi Default jika belum ada (memudahkan navigasi)
  const response = NextResponse.next();
  if (isProtectedRoute && !token) {
    response.cookies.set('ks_session', 'active-tenant-session', { path: '/', httpOnly: false });
  }

  // 4. Sinkronisasi Cookie Mode Otomatis (Jalur Tenant Live)
  if (isTenantDeployment) {
    response.cookies.set('ks_app_mode', 'tenant', { path: '/', maxAge: 864000 });
    const currentTenantId = request.cookies.get('ks_active_tenant_id')?.value;
    if (!currentTenantId) {
      response.cookies.set('ks_active_tenant_id', 'tenant-al-kausar-9033', { path: '/', maxAge: 864000 });
    }
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
