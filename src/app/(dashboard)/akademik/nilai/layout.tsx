'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function NilaiLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="rapot">
      {children}
    </EntitlementGuard>
  );
}
