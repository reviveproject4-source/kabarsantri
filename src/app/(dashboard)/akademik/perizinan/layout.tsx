'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function PerizinanLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="izin">
      {children}
    </EntitlementGuard>
  );
}
