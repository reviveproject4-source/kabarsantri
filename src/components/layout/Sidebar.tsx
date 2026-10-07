'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  Wallet, 
  FileBarChart2, 
  UserCheck,
  Lock,
  Crown,
  ShieldCheck,
  Utensils,
  Users,
  X,
  Building2
} from 'lucide-react';
import { getFilteredNavigation, NavItem } from '@/config/navigation';
import LockedFeatureModal from '@/components/common/LockedFeatureModal';
import { APP_BRAND, useActiveTenant } from '@/lib/sessionStore';

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Wallet,
  FileBarChart2,
  UserCheck,
  Utensils,
  Users,
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tenant = useActiveTenant();

  // Mode Pengujian: Buka seluruh fitur secara default (Premium Unlimited)
  const [tier, setTier] = useState<'gratis' | 'premium'>('premium');
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');

  const isYayasanExecutive = Boolean(pathname?.startsWith('/dashboard/yayasan') || pathname?.startsWith('/dashboard/wakil-yayasan'));

  // Ketua dan Wakil Ketua Yayasan tidak memerlukan fitur absen (sesuai instruksi revisi)
  const menuItems = getFilteredNavigation().filter(item => {
    if (isYayasanExecutive && item.href.startsWith('/presensi')) {
      return false;
    }
    return true;
  });

  const handleMenuClick = (e: React.MouseEvent, item: NavItem, isMobile = false) => {
    if (tier === 'gratis' && item.isLockedInFreeTier) {
      e.preventDefault();
      setLockedFeatureName(item.title);
      setLockedModalOpen(true);
    } else if (isMobile) {
      onMobileClose?.();
    }
  };

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Brand: Logo Resmi Aplikasi KabarSantri (Permanen & Tidak Ditimpa) */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={APP_BRAND.logo_url}
            alt={APP_BRAND.name}
            className="w-10 h-10 rounded-xl object-contain shadow-md shadow-blue-950/60 border border-blue-400/20 bg-slate-900"
          />
          <div>
            <h2 className="font-bold text-white text-base leading-tight">
              {APP_BRAND.name} <span className="text-emerald-400 text-xs font-semibold">{APP_BRAND.version}</span>
            </h2>
            <p className="text-[11px] text-slate-400">Backoffice ERP Pesantren</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Identitas Lembaga / Pesantren (Tenant) */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="w-4 h-4 rounded object-contain shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-medium text-slate-300 truncate" title={tenant.name}>
            {tenant.name.replace('Pondok Pesantren ', '')}
          </span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
          Tenant
        </span>
      </div>

      {/* Tier Status Banner */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Status Langganan:</span>
          {tier === 'gratis' ? (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
              GRATIS (50 Santri)
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              PREMIUM UNLIMITED
            </span>
          )}
        </div>
        {tier === 'gratis' && (
          <Link
            href="/dashboard/yayasan"
            onClick={() => isMobile && onMobileClose?.()}
            className="mt-1.5 w-full py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-[10px] rounded-md flex items-center justify-center space-x-1 shadow transition"
          >
            <Crown className="w-3 h-3 text-slate-950" />
            <span>Aktifkan Paket Premium</span>
          </Link>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {menuItems.map((group, idx) => {
          const IconComponent = group.icon ? ICON_MAP[group.icon] : LayoutDashboard;

          return (
            <div key={idx} className="space-y-1">
              {group.children ? (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    {IconComponent && <IconComponent className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{group.title}</span>
                  </div>
                  <div className="mt-1 space-y-0.5 pl-2">
                    {group.children.map((child, cIdx) => {
                      const isChildActive = pathname === child.href;
                      const isLocked = tier === 'gratis' && child.isLockedInFreeTier;

                      return (
                        <Link
                          key={cIdx}
                          href={child.href}
                          onClick={(e) => handleMenuClick(e, child, isMobile)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                            isChildActive
                              ? 'bg-emerald-600 text-white font-medium shadow-sm'
                              : isLocked
                              ? 'text-slate-500 hover:bg-slate-800/40 cursor-pointer'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="flex items-center space-x-1.5">
                            <span>{child.title}</span>
                            {isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                          </span>
                          {child.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Link
                  href={group.href}
                  onClick={(e) => handleMenuClick(e, group, isMobile)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                    pathname === group.href
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {IconComponent && <IconComponent className="w-4 h-4" />}
                    <span>{group.title}</span>
                  </div>
                  {tier === 'gratis' && group.isLockedInFreeTier && (
                    <Lock className="w-3 h-3 text-amber-500" />
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>RLS Active</span>
        </div>
        <button
          onClick={() => setTier(tier === 'gratis' ? 'premium' : 'gratis')}
          className="text-[10px] text-slate-400 hover:text-emerald-400 underline font-mono"
          title="Klik untuk beralih mode demo (Uji Coba Terbuka vs Tier Gratis)"
        >
          [{tier === 'gratis' ? 'Uji: Gratis' : 'Uji: Premium'}]
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col border-r border-slate-800 shrink-0 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (visible on mobile when mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/70 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] bg-slate-900 text-slate-300 h-full flex flex-col shadow-2xl border-r border-slate-800">
            {renderSidebarContent(true)}
          </div>
          <div className="flex-1" onClick={onMobileClose} />
        </div>
      )}

      {/* Reusable Modal jika mengklik fitur yang terkunci pada Tier Gratis */}
      <LockedFeatureModal
        isOpen={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        featureTitle={lockedFeatureName}
      />
    </>
  );
}
