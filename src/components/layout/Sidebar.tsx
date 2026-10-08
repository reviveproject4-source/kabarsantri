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
import { checkStudentQuota } from '@/lib/tenantEntitlementStore';
import { isTenantMode } from '@/lib/sharedDataStore';

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

  // Mode Pengujian: Premium Unlimited default
  const [tier, setTier] = useState<'gratis' | 'premium'>('premium');
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  const [, setTick] = useState(0);

  React.useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('ks_entitlements_updated', handleUpdate);
    return () => window.removeEventListener('ks_entitlements_updated', handleUpdate);
  }, []);

  const quotaInfo = checkStudentQuota(tenant.id);

  const isYayasanExecutive = Boolean(pathname?.startsWith('/dashboard/yayasan') || pathname?.startsWith('/dashboard/wakil-yayasan'));

  const isTenant = typeof window !== 'undefined' ? isTenantMode() : false;
  const getHrefWithMode = (baseHref: string) => {
    const mode = isTenant ? 'tenant' : 'demo';
    if (baseHref.includes('?')) {
      return `${baseHref}&mode=${mode}`;
    }
    return `${baseHref}?mode=${mode}`;
  };

  // Yayasan tidak memerlukan fitur presensi harian. Filter berdasarkan Produk Entitlement Tenant.
  const menuItems = getFilteredNavigation(tenant.id).filter(item => {
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
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={APP_BRAND.logo_url}
            alt={APP_BRAND.name}
            className="w-9 h-9 rounded-xl object-contain shadow-md shadow-blue-950/60 border border-blue-500/20 bg-slate-900"
          />
          <div>
            <h2 className="font-bold text-white text-sm leading-tight">
              {APP_BRAND.name} <span className="text-blue-400 text-xs font-semibold">{APP_BRAND.version}</span>
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
      <div className="px-4 py-2 bg-slate-900/90 dark:bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} className="w-4 h-4 rounded object-contain shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}
          <span className="text-xs font-medium text-slate-300 truncate" title={tenant.name}>
            {tenant.name.replace('Pondok Pesantren ', '')}
          </span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 border ${
          quotaInfo.isFreeZakat 
            ? 'bg-amber-950/80 text-amber-300 border-amber-800' 
            : 'bg-blue-950 text-blue-300 border border-blue-900'
        }`}>
          {quotaInfo.isFreeZakat ? 'Free Zakat' : 'Full BOS'}
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-3">
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
                          href={getHrefWithMode(child.href)}
                          onClick={(e) => handleMenuClick(e, child, isMobile)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                            isChildActive
                              ? 'bg-blue-600 text-white font-medium shadow-sm'
                              : isLocked
                              ? 'text-slate-500 hover:bg-slate-800/40 cursor-pointer'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="flex items-center space-x-1.5 truncate">
                            <span className="truncate">{child.title}</span>
                            {isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                          </span>
                          {child.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800 shrink-0">
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
                  href={getHrefWithMode(group.href)}
                  onClick={(e) => handleMenuClick(e, group, isMobile)}
                  className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                    pathname === group.href
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
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
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>RLS Aktif</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {APP_BRAND.version}
        </span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex-col border-r border-slate-800 shrink-0 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (visible on mobile when mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/70 backdrop-blur-xs flex animate-in fade-in duration-150">
          <div className="w-72 max-w-[85vw] bg-slate-900 dark:bg-slate-950 text-slate-300 h-full flex flex-col shadow-2xl border-r border-slate-800">
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
