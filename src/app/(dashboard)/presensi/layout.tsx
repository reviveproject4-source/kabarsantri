'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function PresensiLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="presensi">
      {children}
    </EntitlementGuard>
  );
}
