'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = '用語を検索...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce処理（100ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 100);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // キーボードショートカット（Ctrl+K または /）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K または Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // / キー（他の入力中でない場合）
      else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Escape（フォーカス中の場合）
      else if (e.key === 'Escape' && document.activeElement?.id === 'search-input') {
        document.getElementById('search-input')?.blur();
        setLocalValue('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {/* 検索アイコン */}
        <div className="absolute left-3 text-gray-400 dark:text-gray-500">
          🔍
        </div>

        {/* 検索入力 */}
        <input
          id="search-input"
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />

        {/* ショートカット表示 */}
        {!localValue && (
          <div className="absolute right-3 flex items-center space-x-1 text-xs text-gray-400 dark:text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
              ⌘K
            </kbd>
          </div>
        )}

        {/* クリアボタン */}
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="クリア"
          >
            ✕
          </button>
        )}
      </div>

      {/* 検索結果数（オプション） */}
      {localValue && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          検索中...
        </div>
      )}
    </div>
  );
}
