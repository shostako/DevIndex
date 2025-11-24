/**
 * SRS (Spaced Repetition System) - SM-2アルゴリズム実装
 *
 * SM-2アルゴリズムは、記憶の定着度に応じて復習間隔を調整する
 * 間隔反復学習システムのアルゴリズム。
 */

import type { UserProgress } from '@/types/progress';

// ----------------
// SM-2アルゴリズム
// ----------------

export interface SRSUpdateResult {
  ease_factor: number;
  interval: number;
  next_review: Date;
  review_count: number;
  mastery_level: 0 | 1 | 2 | 3 | 4;
}

/**
 * SM-2アルゴリズムに基づいて次回復習日を計算
 *
 * @param currentProgress 現在の進捗データ
 * @param quality 記憶度（0-5）
 * @returns 更新されたSRSパラメータ
 */
export function calculateNextReview(
  currentProgress: UserProgress | undefined,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): SRSUpdateResult {
  // 初期値（新規学習の場合）
  const currentEF = currentProgress?.ease_factor ?? 2.5;
  const currentInterval = currentProgress?.interval ?? 0;
  const currentReviewCount = currentProgress?.review_count ?? 0;

  // 新しいEase Factorを計算
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // EFの最小値は1.3
  if (newEF < 1.3) {
    newEF = 1.3;
  }

  // 新しい復習間隔を計算
  let newInterval: number;

  if (quality < 3) {
    // 記憶度が低い（0-2）場合、最初からやり直し
    newInterval = 1;
  } else {
    // 記憶度が高い（3-5）場合、間隔を延ばす
    if (currentInterval === 0) {
      // 初回復習
      newInterval = 1;
    } else if (currentInterval === 1) {
      // 2回目復習
      newInterval = 6;
    } else {
      // 3回目以降
      newInterval = Math.round(currentInterval * newEF);
    }
  }

  // 次回復習日を計算
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  nextReview.setHours(0, 0, 0, 0); // 時刻をリセット

  // 復習回数を増やす
  const newReviewCount = currentReviewCount + 1;

  // 習得レベルを計算
  const masteryLevel = calculateMasteryLevel(newInterval, newReviewCount, quality);

  return {
    ease_factor: newEF,
    interval: newInterval,
    next_review: nextReview,
    review_count: newReviewCount,
    mastery_level: masteryLevel,
  };
}

/**
 * 習得レベルを計算
 *
 * @param interval 復習間隔（日数）
 * @param reviewCount 復習回数
 * @param quality 記憶度（0-5）
 * @returns 習得レベル（0-4）
 */
function calculateMasteryLevel(
  interval: number,
  reviewCount: number,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): 0 | 1 | 2 | 3 | 4 {
  // 習得レベルの判定基準
  // 0: 未学習 - reviewCount === 0
  // 1: 認識 - reviewCount >= 1 && interval < 7
  // 2: 理解 - reviewCount >= 3 && interval >= 7
  // 3: 定着 - reviewCount >= 5 && interval >= 14
  // 4: 習得 - reviewCount >= 8 && interval >= 30

  if (reviewCount === 0) {
    return 0; // 未学習
  }

  if (reviewCount >= 8 && interval >= 30 && quality >= 4) {
    return 4; // 習得
  }

  if (reviewCount >= 5 && interval >= 14 && quality >= 3) {
    return 3; // 定着
  }

  if (reviewCount >= 3 && interval >= 7) {
    return 2; // 理解
  }

  return 1; // 認識
}

/**
 * 進捗データをSRSパラメータで更新
 *
 * @param currentProgress 現在の進捗データ
 * @param quality 記憶度（0-5）
 * @returns 更新された進捗データ
 */
export function updateSRSProgress(
  currentProgress: UserProgress | undefined,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): Partial<UserProgress> {
  const srsResult = calculateNextReview(currentProgress, quality);

  return {
    last_reviewed_at: new Date(),
    review_count: srsResult.review_count,
    ease_factor: srsResult.ease_factor,
    interval: srsResult.interval,
    next_review: srsResult.next_review,
    mastery_level: srsResult.mastery_level,
  };
}

// ----------------
// 復習管理
// ----------------

/**
 * 今日復習すべき用語を取得
 *
 * @param progressList 全進捗データ
 * @returns 今日復習すべき進捗データのリスト
 */
export function getReviewDueToday(progressList: UserProgress[]): UserProgress[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 今日の終わりまで

  return progressList.filter((progress) => {
    const nextReview = new Date(progress.next_review);
    return nextReview <= today;
  });
}

/**
 * 次の復習予定日順にソート
 *
 * @param progressList 進捗データリスト
 * @returns ソート済みリスト
 */
export function sortByNextReview(progressList: UserProgress[]): UserProgress[] {
  return [...progressList].sort((a, b) => {
    const dateA = new Date(a.next_review).getTime();
    const dateB = new Date(b.next_review).getTime();
    return dateA - dateB;
  });
}

/**
 * 習得レベル別に進捗をグループ化
 *
 * @param progressList 進捗データリスト
 * @returns 習得レベル別のマップ
 */
export function groupByMasteryLevel(
  progressList: UserProgress[]
): Record<number, UserProgress[]> {
  const grouped: Record<number, UserProgress[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };

  progressList.forEach((progress) => {
    grouped[progress.mastery_level].push(progress);
  });

  return grouped;
}

// ----------------
// 統計計算
// ----------------

/**
 * 学習統計を計算
 *
 * @param progressList 進捗データリスト
 * @returns 統計データ
 */
export function calculateStats(progressList: UserProgress[]): {
  totalTerms: number;
  learnedTerms: number;
  masteredTerms: number;
  reviewDueToday: number;
  averageEaseFactor: number;
  averageInterval: number;
} {
  const totalTerms = progressList.length;
  const learnedTerms = progressList.filter((p) => p.review_count > 0).length;
  const masteredTerms = progressList.filter((p) => p.mastery_level === 4).length;
  const reviewDueToday = getReviewDueToday(progressList).length;

  const averageEaseFactor =
    progressList.reduce((sum, p) => sum + p.ease_factor, 0) / totalTerms || 0;

  const averageInterval =
    progressList.reduce((sum, p) => sum + p.interval, 0) / totalTerms || 0;

  return {
    totalTerms,
    learnedTerms,
    masteredTerms,
    reviewDueToday,
    averageEaseFactor,
    averageInterval,
  };
}
