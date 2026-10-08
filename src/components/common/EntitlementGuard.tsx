'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Sparkles, 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Check 
} from 'lucide-react';
import { ProductCode, MODULAR_PRODUCT_CATALOG } from '@/lib/productCatalog';
import { hasProduct, upgradeProduct, getTenantEntitlements } from '@/lib/tenantEntitlementStore';
import { useActiveTenant, APP_BRAND } from '@/lib/sessionStore';

interface EntitlementGuardProps {
  requiredProduct: ProductCode;
  children: React.ReactNode;
}

export default function EntitlementGuard({
  requiredProduct,
  children
}: EntitlementGuardProps) {
  const tenant = useActiveTenant();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [justActivated, setJustActivated] = useState(false);

  const product = MODULAR_PRODUCT_CATALOG[requiredProduct];

  const checkAccess = () => {
    if (!tenant?.id) return true;
    return hasProduct(tenant.id, requiredProduct);
  };

  useEffect(() => {
    setMounted(true);
    setIsAllowed(checkAccess());

    const handleUpdate = () => {
      setIsAllowed(checkAccess());
    };

    window.addEventListener('ks_entitlements_updated', handleUpdate);
    return () => window.removeEventListener('ks_entitlements_updated', handleUpdate);
  }, [tenant.id, requiredProduct]);

  // While mounting on client, show children or render cleanly
  if (!mounted) {
    return <>{children}</>;
  }

  // If tenant has product entitlement, render page content
  if (isAllowed) {
    return <>{children}</>;
  }

  // Handle in-situ upgrade / activate product
  const handleUpgradeNow = () => {
    setUpgrading(true);
    try {
      upgradeProduct(tenant.id, requiredProduct);
      setJustActivated(true);
      setTimeout(() => {
        setIsAllowed(true);
        setUpgrading(false);
      }, 600);
    } catch (e) {
      console.error('Upgrade failed:', e);
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-blue-900/30 shadow-2xl p-6 md:p-10 space-y-6 text-slate-800 dark:text-slate-100">
        
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Akses Terproteksi · Entitlement Required
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Produk Belum Aktif
              </h2>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Tenant Terdaftar:
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {tenant.name}
            </span>
          </div>
        </div>

        {/* Product Explanation Card */}
        <div className="bg-blue-50/60 dark:bg-slate-950/70 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-blue-950 dark:text-blue-200">
                {product?.name || requiredProduct}
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
              Modul #{product?.code}
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product?.description}
          </p>

          {/* Features included */}
          {product?.features && product.features.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Kapabilitas & Fitur di dalam Produk Ini:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Business Rule / Architecture Context */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-900 dark:text-white">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Arsitektur Modular KabarSantri BOS</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Tenant Anda saat ini berada dalam paket <strong>KabarSantri Free — Zakat</strong> (Laporan Hafalan & Absensi Santri) atau belum mengaktifkan modul ini. KabarSantri dirancang modular sehingga setiap domain dapat diaktifkan sesuai kebutuhan tanpa merusak data atau merubah basis kode lembaga.
          </p>
        </div>

        {/* Actions / CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <button
            onClick={handleUpgradeNow}
            disabled={upgrading}
            className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {upgrading ? (
              <span>Mengaktifkan Lisensi...</span>
            ) : justActivated ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Lisensi Aktif! Membuka Halaman...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Aktifkan / Upgrade Modul Ini</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Brand Assurance */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400">
            {APP_BRAND.name} · Multi-Tenant Safe Upgrade/Downgrade Guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
