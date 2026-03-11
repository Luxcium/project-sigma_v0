import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Sigma v0',
  description: 'A production-ready Next.js 15 template',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
