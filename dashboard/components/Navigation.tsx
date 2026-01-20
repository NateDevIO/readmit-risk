// components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/members', label: 'Members' },
  { href: '/geography', label: 'Geography' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div>
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ReadmitRisk
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                Hospital Readmission Prevention Platform
              </p>
            </div>
            <span className="ml-3 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="ml-2 pl-2 border-l dark:border-gray-700">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
