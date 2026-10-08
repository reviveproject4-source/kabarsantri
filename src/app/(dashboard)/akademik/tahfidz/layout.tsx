'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function TahfidzLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="hafalan">
      {children}
    </EntitlementGuard>
  );
}
