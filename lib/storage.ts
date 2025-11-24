/**
 * LocalStorage ユーティリティ
 *
 * ユーザー設定をブラウザに永続化する
 */

import type { ViewMode, SortMode, SearchPrecision } from './store';

const STORAGE_KEY = 'devindex-settings';

// 保存する設定の型
export interface UserSettings {
  searchPrecision?: SearchPrecision;
  sortMode?: SortMode;
  viewMode?: ViewMode;
}

/**
 * LocalStorage が利用可能かチェック
 * SSR、プライベートブラウジング対応
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 設定を保存
 * @param settings 保存する設定（部分的な更新も可能）
 */
export function saveSettings(settings: UserSettings): void {
  if (!isLocalStorageAvailable()) {
    console.warn('[DevIndex] LocalStorage is not available');
    return;
  }

  try {
    // 既存の設定を読み込んで、新しい設定とマージ
    const existing = loadSettings();
    const updated = { ...existing, ...settings };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('[DevIndex] Settings saved:', updated);
  } catch (error) {
    console.error('[DevIndex] Failed to save settings:', error);
  }
}

/**
 * 設定を読み込み
 * @returns 保存された設定（なければ null）
 */
export function loadSettings(): UserSettings | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const settings = JSON.parse(stored) as UserSettings;
    console.log('[DevIndex] Settings loaded:', settings);
    return settings;
  } catch (error) {
    console.error('[DevIndex] Failed to load settings:', error);
    return null;
  }
}

/**
 * 設定をクリア（デバッグ用）
 */
export function clearSettings(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    console.log('[DevIndex] Settings cleared');
  } catch (error) {
    console.error('[DevIndex] Failed to clear settings:', error);
  }
}
