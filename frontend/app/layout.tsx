import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Klinik MediQueue',
  description: 'Clinic queue and patient management system',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>🏥 Klinik MediQueue</h1>
          <nav>
            <Link href="/">Queue</Link>
            <Link href="/patients">Patients</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}