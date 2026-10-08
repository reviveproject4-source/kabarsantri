'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="finance">
      {children}
    </EntitlementGuard>
  );
}
