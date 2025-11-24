import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { db } from './db';
import { searchEngine } from './search';
import { loadSettings, saveSettings } from './storage';
import type { Term, Category } from '@/types/term';
import type { UserProgress } from '@/types/progress';

// ----------------
// ヘルパー関数
// ----------------

// 検索精度から threshold 値を取得
export function getThresholdFromPrecision(precision: 'strict' | 'balanced' | 'loose'): number {
  const thresholdMap = {
    strict: 0.2,    // 厳格：誤ヒットなし
    balanced: 0.3,  // バランス：推奨
    loose: 0.4,     // 緩い：タイポに強い
  };
  return thresholdMap[precision];
}

// ----------------
// Terms Store（用語管理）
// ----------------

interface TermsState {
  // データ
  terms: Term[];
  filteredTerms: Term[];
  categories: Category[];
  selectedTerm: Term | null;

  // フィルター
  searchQuery: string;
  selectedCategory: string | null;
  selectedDifficulty: string | null;

  // ロード状態
  isLoading: boolean;
  isInitialized: boolean;

  // アクション
  loadTerms: () => Promise<void>;
  searchTerms: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  filterByDifficulty: (difficulty: string | null) => void;
  selectTerm: (term: Term | null) => void;
  applyFilters: () => void;
}

export const useTermStore = create<TermsState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      terms: [],
      filteredTerms: [],
      categories: [],
      selectedTerm: null,
      searchQuery: '',
      selectedCategory: null,
      selectedDifficulty: null,
      isLoading: false,
      isInitialized: false,

      // 用語データをIndexedDBから読み込み
      loadTerms: async () => {
        set({ isLoading: true });
        try {
          const terms = await db.terms.toArray();

          // UIStoreから現在の検索精度を取得してthresholdを決定
          const { searchPrecision } = useUIStore.getState();
          const threshold = getThresholdFromPrecision(searchPrecision);

          // 検索エンジンを初期化（動的threshold使用）
          searchEngine.initialize(terms, threshold);

          // カテゴリー一覧を抽出（重複なし）
          const categoryMap = new Map<string, Category>();
          terms.forEach((term: Term) => {
            if (!categoryMap.has(term.category)) {
              categoryMap.set(term.category, {
                name: term.category,
                color: getCategoryColor(term.category),
              });
            }
          });
          const categories = Array.from(categoryMap.values());

          set({
            terms,
            filteredTerms: terms,
            categories,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to load terms:', error);
          set({ isLoading: false });
        }
      },

      // 検索
      searchTerms: (query) => {
        set({ searchQuery: query });
        get().applyFilters();
      },

      // カテゴリーフィルター
      filterByCategory: (category) => {
        set({ selectedCategory: category });
        get().applyFilters();
      },

      // 難易度フィルター
      filterByDifficulty: (difficulty) => {
        set({ selectedDifficulty: difficulty });
        get().applyFilters();
      },

      // 用語選択
      selectTerm: (term) => {
        set({ selectedTerm: term });
      },

      // フィルター適用
      applyFilters: () => {
        const { terms, searchQuery, selectedCategory, selectedDifficulty } = get();
        let filtered = terms;

        // 検索フィルター（Fuse.js使用）
        if (searchQuery && searchQuery.trim().length > 0) {
          filtered = searchEngine.search(searchQuery);
        }

        // カテゴリーフィルター
        if (selectedCategory) {
          filtered = filtered.filter(t => t.category === selectedCategory);
        }

        // 難易度フィルター
        if (selectedDifficulty) {
          filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
        }

        set({ filteredTerms: filtered });
      },
    }),
    { name: 'TermStore' }
  )
);

// カテゴリー色のマッピング（暫定）
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Web': '#3B82F6',
    'Database': '#10B981',
    'プログラミング言語': '#F59E0B',
    'ツール': '#8B5CF6',
    'アーキテクチャ': '#EF4444',
  };
  return colors[category] || '#6B7280';
}

// ----------------
// Progress Store（進捗管理）
// ----------------

interface ProgressState {
  progressMap: Map<string, UserProgress>;
  isLoading: boolean;

  // アクション
  loadProgress: () => Promise<void>;
  getProgress: (termId: string) => UserProgress | undefined;
  updateProgress: (termId: string, updates: Partial<UserProgress>) => Promise<void>;
  getStats: () => {
    totalTerms: number;
    masteredTerms: number;
    reviewDueToday: number;
  };
}

export const useProgressStore = create<ProgressState>()(
  devtools(
    (set, get) => ({
      progressMap: new Map(),
      isLoading: false,

      // 進捗データをIndexedDBから読み込み
      loadProgress: async () => {
        set({ isLoading: true });
        try {
          const progressList = await db.user_progress.toArray();
          const progressMap = new Map<string, UserProgress>(
            progressList.map((p: UserProgress) => [p.term_id, p])
          );
          set({ progressMap, isLoading: false });
        } catch (error) {
          console.error('Failed to load progress:', error);
          set({ isLoading: false });
        }
      },

      // 進捗取得
      getProgress: (termId) => {
        return get().progressMap.get(termId);
      },

      // 進捗更新
      updateProgress: async (termId, updates) => {
        const existing = get().progressMap.get(termId);
        const updated: UserProgress = existing
          ? { ...existing, ...updates }
          : {
              term_id: termId,
              first_learned_at: new Date(),
              last_reviewed_at: new Date(),
              review_count: 0,
              quiz_correct: 0,
              quiz_total: 0,
              ease_factor: 2.5,
              interval: 0,
              next_review: new Date(),
              mastery_level: 0,
              ...updates,
            };

        await db.user_progress.put(updated);

        const newMap = new Map(get().progressMap);
        newMap.set(termId, updated);
        set({ progressMap: newMap });
      },

      // 統計取得
      getStats: () => {
        const { progressMap } = get();
        const progressList = Array.from(progressMap.values());
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        return {
          totalTerms: progressMap.size,
          masteredTerms: progressList.filter(p => p.mastery_level === 4).length,
          reviewDueToday: progressList.filter(
            p => p.next_review <= today
          ).length,
        };
      },
    }),
    { name: 'ProgressStore' }
  )
);

// ----------------
// UI Store（UI状態管理）
// ----------------

export type ViewMode = 'card' | 'list';
export type SortMode = 'term-asc' | 'reading-asc' | 'difficulty' | 'category' | 'date-new' | 'date-old';
export type SearchPrecision = 'strict' | 'balanced' | 'loose';

interface UIState {
  isSidebarOpen: boolean;
  isSearchFocused: boolean;
  viewMode: ViewMode;
  sortMode: SortMode;
  searchPrecision: SearchPrecision;

  // アクション
  toggleSidebar: () => void;
  setSearchFocused: (focused: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortMode: (mode: SortMode) => void;
  setSearchPrecision: (precision: SearchPrecision) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => {
      // 保存された設定を読み込み
      const savedSettings = loadSettings();

      return {
        isSidebarOpen: true,
        isSearchFocused: false,
        viewMode: savedSettings?.viewMode ?? 'card',
        sortMode: savedSettings?.sortMode ?? 'term-asc',
        searchPrecision: savedSettings?.searchPrecision ?? 'balanced',

      toggleSidebar: () => {
        set(state => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSearchFocused: (focused) => {
        set({ isSearchFocused: focused });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
        saveSettings({ viewMode: mode });
      },

      setSortMode: (mode) => {
        set({ sortMode: mode });
        saveSettings({ sortMode: mode });
      },

      setSearchPrecision: (precision) => {
        set({ searchPrecision: precision });
        saveSettings({ searchPrecision: precision });

        // 検索精度が変更されたら、検索エンジンを再初期化
        const { terms } = useTermStore.getState();
        if (terms.length > 0) {
          const threshold = getThresholdFromPrecision(precision);
          searchEngine.initialize(terms, threshold);

          // 現在の検索クエリがあれば再検索
          const { searchQuery } = useTermStore.getState();
          if (searchQuery) {
            useTermStore.getState().applyFilters();
          }
        }
      },
      };
    },
    { name: 'UIStore' }
  )
);
