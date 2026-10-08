'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function RumahTanggaLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="rumah_tangga">
      {children}
    </EntitlementGuard>
  );
}
