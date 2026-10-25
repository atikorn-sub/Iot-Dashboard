import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PreferencesProvider } from '@/components/PreferencesProvider';
import { STORAGE_KEYS } from '@/lib/preferences';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini IoT Dashboard',
  description: 'Real-time IoT device monitoring and control',
};

// Runs before first paint so a stored light theme doesn't flash dark
const themeScript = `try{if(localStorage.getItem('${STORAGE_KEYS.theme}')==='light')document.documentElement.classList.remove('dark')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-page text-fg antialiased transition-colors">
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
