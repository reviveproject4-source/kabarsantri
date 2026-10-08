'use client';

import React from 'react';
import EntitlementGuard from '@/components/common/EntitlementGuard';

export default function DisiplinLayout({ children }: { children: React.ReactNode }) {
  return (
    <EntitlementGuard requiredProduct="adab">
      {children}
    </EntitlementGuard>
  );
}
