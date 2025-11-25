'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/lib/theme';

export function Header() {
  const pathname = usePathname();
  const { isDark, toggle } = useThemeStore();

  const navItems = [
    { href: '/', label: '辞書', icon: '📚' },
    { href: '/quiz', label: 'クイズ', icon: '🎯' },
    { href: '/srs', label: '復習', icon: '📅' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">😈</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">悪魔のIT辞典</span>
            </Link>
          </div>

          {/* ナビゲーション */}
          <nav className="flex space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ダークモードトグル・設定 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggle}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="設定"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
