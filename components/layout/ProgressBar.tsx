'use client';

interface ProgressBarProps {
  masteredCount: number;
  totalCount: number;
  reviewDueToday: number;
  streakDays: number;
}

export function ProgressBar({
  masteredCount,
  totalCount,
  reviewDueToday,
  streakDays,
}: ProgressBarProps) {
  const masteryRate = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="bg-blue-50 border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 習得率 */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">習得率:</div>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${masteryRate}%` }}
                />
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-900">
                {masteryRate}%
              </span>
            </div>
          </div>

          {/* 今日の復習 */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">今日の復習:</span>
            <span className="font-semibold text-blue-600">{reviewDueToday}語</span>
          </div>

          {/* 連続日数 */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">連続日数:</span>
            <span className="font-semibold text-orange-600">{streakDays}日</span>
            <span>🔥</span>
          </div>

          {/* 習得済み/全用語 */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>習得済み:</span>
            <span className="font-semibold text-gray-900">
              {masteredCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
