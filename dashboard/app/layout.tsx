// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReadmitRisk - Hospital Readmissions Dashboard',
  description: 'Care management risk stratification platform for reducing preventable 30-day hospital readmissions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 transition-colors`}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-6 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
          <p>Built with Python, Scikit-learn, Next.js, and Recharts</p>
          <p className="mt-1">
            <a
              href="https://github.com/NateDevIO/readmit-risk"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
