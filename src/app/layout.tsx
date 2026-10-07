import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KabarSantri v2.0 - Platform ERP & Parental Engagement Pesantren',
  description: 'Sistem Terpadu Manajemen Pesantren, Keasramaan, Tahfidz, Keuangan, dan Portal Wali Santri',
  icons: {
    icon: '/images/app-logo.png',
    apple: '/images/app-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
