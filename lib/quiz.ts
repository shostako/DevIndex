import type { Term } from '@/types/term';
import type { QuizQuestion, QuizChoice, QuestionType, QuizSession } from '@/types/quiz';
import type { UserProgress } from '@/types/progress';
import { v4 as uuidv4 } from 'uuid';

// ----------------
// ユーティリティ関数
// ----------------

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * ランダムな要素を取得
 */
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

// ----------------
// クイズ生成
// ----------------

export interface GenerateQuizOptions {
  mode: 'random' | 'category' | 'weakness';
  category?: string;
  difficulty?: string;
  questionCount?: number;
  progressMap?: Map<string, UserProgress>;
}

/**
 * クイズ問題を生成
 */
export function generateQuizQuestions(
  allTerms: Term[],
  options: GenerateQuizOptions
): QuizQuestion[] {
  const { mode, category, difficulty, questionCount = 10, progressMap } = options;

  // 用語をフィルタリング
  let filteredTerms = allTerms;

  if (category) {
    filteredTerms = filteredTerms.filter(t => t.category === category);
  }

  if (difficulty) {
    filteredTerms = filteredTerms.filter(t => t.difficulty === difficulty);
  }

  // モード別フィルタリング
  if (mode === 'weakness' && progressMap) {
    // 正答率が低い順にソート
    filteredTerms = filteredTerms
      .map(term => {
        const progress = progressMap.get(term.id);
        const accuracy = progress && progress.quiz_total > 0
          ? progress.quiz_correct / progress.quiz_total
          : 0;
        return { term, accuracy };
      })
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, questionCount * 2) // 候補を多めに
      .map(item => item.term);
  }

  // 問題数が足りない場合は調整
  const actualCount = Math.min(questionCount, filteredTerms.length);
  if (actualCount === 0) {
    return [];
  }

  // ランダムに選択
  const selectedTerms = getRandomElements(filteredTerms, actualCount);

  // 各用語から問題を生成
  return selectedTerms.map(term => generateSingleQuestion(term, allTerms));
}

/**
 * 1つの用語から問題を生成
 */
function generateSingleQuestion(
  correctTerm: Term,
  allTerms: Term[]
): QuizQuestion {
  // 問題タイプをランダム選択
  // アルファベット主体の用語（CSS、HTTP等）は reading-to-term を除外
  const isAlphabetTerm = /^[A-Za-z0-9\-_.\/]+$/.test(correctTerm.term);
  const questionTypes: QuestionType[] = isAlphabetTerm
    ? ['term-to-desc', 'desc-to-term']
    : ['term-to-desc', 'desc-to-term', 'reading-to-term'];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  // 問題文を生成
  let questionText = '';
  switch (questionType) {
    case 'term-to-desc':
      questionText = `「${correctTerm.term}」の説明として正しいものは？`;
      break;
    case 'desc-to-term':
      questionText = `「${correctTerm.short_desc}」に該当する用語は？`;
      break;
    case 'reading-to-term':
      questionText = `「${correctTerm.reading}」の用語名は？`;
      break;
  }

  // 選択肢を生成
  const choices = generateChoices(correctTerm, allTerms, questionType);

  // 正解のインデックスを見つける
  const correctIndex = choices.findIndex(c => c.term_id === correctTerm.id);

  return {
    term_id: correctTerm.id,
    question_type: questionType,
    question_text: questionText,
    choices,
    correct_index: correctIndex,
  };
}

/**
 * 選択肢を生成（正解1つ + ダミー3つ）
 */
function generateChoices(
  correctTerm: Term,
  allTerms: Term[],
  questionType: QuestionType
): QuizChoice[] {
  // ダミー用語を選択（正解以外）
  const otherTerms = allTerms.filter(t => t.id !== correctTerm.id);
  const dummyTerms = getRandomElements(otherTerms, 3);

  // 選択肢を作成
  const allChoiceTerms = [correctTerm, ...dummyTerms];

  const choices: QuizChoice[] = allChoiceTerms.map(term => {
    let text = '';
    switch (questionType) {
      case 'term-to-desc':
        text = term.short_desc;
        break;
      case 'desc-to-term':
      case 'reading-to-term':
        text = term.term;
        break;
    }
    return { text, term_id: term.id };
  });

  // シャッフル
  return shuffleArray(choices);
}

// ----------------
// クイズセッション管理
// ----------------

/**
 * 新しいクイズセッションを作成
 */
export function createQuizSession(
  questions: QuizQuestion[],
  options: GenerateQuizOptions
): QuizSession {
  return {
    id: uuidv4(),
    mode: options.mode,
    category: options.category,
    difficulty: options.difficulty,
    started_at: new Date(),
    questions,
    score: {
      correct: 0,
      total: questions.length,
    },
  };
}

/**
 * 回答を記録
 */
export function answerQuestion(
  question: QuizQuestion,
  userAnswerIndex: number,
  timeSpent: number
): QuizQuestion {
  const isCorrect = userAnswerIndex === question.correct_index;

  return {
    ...question,
    user_answer_index: userAnswerIndex,
    is_correct: isCorrect,
    answered_at: new Date(),
    time_spent: timeSpent,
  };
}

/**
 * セッションを完了
 */
export function completeQuizSession(session: QuizSession): QuizSession {
  const correctCount = session.questions.filter(q => q.is_correct).length;

  return {
    ...session,
    completed_at: new Date(),
    score: {
      correct: correctCount,
      total: session.questions.length,
    },
  };
}
