// =============================================
// ADAPTIVE REVISION STORE (Zustand)
// State management for adaptive chapter revision
// =============================================

import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

function resolveToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^| )student_token=([^;]+)/);
  if (match) return decodeURIComponent(match[2]);
  return localStorage.getItem('student_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') || '';
}

// ─── Types ───────────────────────────────────────────────
export interface ChapterDef {
  name: string;
  subTopics: string[];
}

export interface AdaptiveQuestion {
  id: string;
  questionNumber: number;
  subTopic: string;
  questionText: string;
  options: string[];
  difficulty: string;
  // These are only available after submission
  correctAnswer?: string;
  explanation?: string;
}

export interface QuestionResult {
  questionId: string;
  questionNumber: number;
  subTopic: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  status: 'correct' | 'wrong' | 'skipped';
  explanation: string;
  questionText: string;
  options: string[];
}

export interface TestSummary {
  totalQuestions: number;
  answered: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  accuracy: number;
  timeTaken: number;
}

export interface Diagnosis {
  weakSubTopics: string[];
  strongSubTopics: string[];
  recommendation: string;
}

export interface SubTopicMastery {
  name: string;
  mastery: number;
  totalAttempts: number;
  streak: number;
  lastResult: string;
  lastTested: string;
}

export interface ChapterMastery {
  subject: string;
  chapterName: string;
  subTopics: SubTopicMastery[];
  overallMastery: number;
}

export interface AttemptHistory {
  id: string;
  chapter_name: string;
  subject: string;
  accuracy: number;
  score: number;
  correct_count: number;
  wrong_count: number;
  question_count: number;
  created_at: string;
  is_remediation: boolean;
}

// ─── State Interface ─────────────────────────────────────
interface AdaptiveState {
  // Configuration
  selectedExamType: string;
  selectedSubject: string | null;
  selectedChapter: ChapterDef | null;
  selectedSubTopics: string[];
  questionCount: number;
  durationMinutes: number;
  difficulty: string;

  // Chapter data
  chapters: Record<string, ChapterDef[]>;
  subjects: string[];
  loadingChapters: boolean;

  // Test session
  attemptId: string | null;
  questions: AdaptiveQuestion[];
  answers: Record<string, string>;
  currentQuestionIndex: number;
  timeRemaining: number;
  isTestActive: boolean;
  isSubmitting: boolean;
  isRemediation: boolean;
  weakAreasTargeted: string[];

  // Results
  summary: TestSummary | null;
  diagnosis: Diagnosis | null;
  results: QuestionResult[];

  // Mastery
  mastery: ChapterMastery[];
  history: AttemptHistory[];
  loadingMastery: boolean;

  // Errors
  error: string | null;
  generating: boolean;

  // Actions
  setExamType: (examType: string) => void;
  setSubject: (subject: string) => void;
  setChapter: (chapter: ChapterDef | null) => void;
  setSelectedSubTopics: (topics: string[]) => void;
  toggleSubTopic: (topic: string) => void;
  selectAllSubTopics: () => void;
  clearAllSubTopics: () => void;
  setQuestionCount: (count: number) => void;
  setDurationMinutes: (mins: number) => void;
  setDifficulty: (diff: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  clearAnswer: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  decrementTimer: () => void;

  // API calls
  fetchChapters: (examType: string) => Promise<void>;
  generateTest: () => Promise<boolean>;
  generateCheckYourselfTest: (subject: string, chapterName: string, subTopic: string) => Promise<boolean>;
  submitTest: () => Promise<boolean>;
  fetchMastery: () => Promise<void>;
  resetTest: () => void;
}

// ─── Store ───────────────────────────────────────────────
export const useAdaptiveStore = create<AdaptiveState>()((set, get) => ({
  selectedExamType: 'iat',
  selectedSubject: null,
  selectedChapter: null,
  selectedSubTopics: [],
  questionCount: 10,
  durationMinutes: 15,
  difficulty: 'medium',

  chapters: {},
  subjects: [],
  loadingChapters: false,

  attemptId: null,
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  timeRemaining: 900,
  isTestActive: false,
  isSubmitting: false,
  isRemediation: false,
  weakAreasTargeted: [],

  summary: null,
  diagnosis: null,
  results: [],

  mastery: [],
  history: [],
  loadingMastery: false,

  error: null,
  generating: false,

  // ─── Simple setters ────────────────────
  setExamType: (examType) => set({ selectedExamType: examType, selectedSubject: null, selectedChapter: null, selectedSubTopics: [] }),
  setSubject: (subject) => set({ selectedSubject: subject, selectedChapter: null, selectedSubTopics: [] }),
  setChapter: (chapter) => set({
    selectedChapter: chapter,
    selectedSubTopics: chapter ? [...chapter.subTopics] : []
  }),
  setSelectedSubTopics: (topics) => set({ selectedSubTopics: topics }),
  toggleSubTopic: (topic) => set(state => {
    const exists = state.selectedSubTopics.includes(topic);
    const updated = exists
      ? state.selectedSubTopics.filter(t => t !== topic)
      : [...state.selectedSubTopics, topic];
    return { selectedSubTopics: updated };
  }),
  selectAllSubTopics: () => set(state => ({
    selectedSubTopics: state.selectedChapter ? [...state.selectedChapter.subTopics] : []
  })),
  clearAllSubTopics: () => set({ selectedSubTopics: [] }),

  setQuestionCount: (count) => set({ questionCount: Math.min(Math.max(count, 3), 30) }),
  setDurationMinutes: (mins) => set({ durationMinutes: Math.min(Math.max(mins, 3), 120) }),
  setDifficulty: (diff) => set({ difficulty: diff }),

  setAnswer: (questionId, answer) => set(state => ({
    answers: { ...state.answers, [questionId]: answer }
  })),

  clearAnswer: (questionId) => set(state => {
    const next = { ...state.answers };
    delete next[questionId];
    return { answers: next };
  }),

  goToQuestion: (index) => set({ currentQuestionIndex: index }),
  nextQuestion: () => set(state => ({
    currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
  })),
  prevQuestion: () => set(state => ({
    currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
  })),
  decrementTimer: () => set(state => ({
    timeRemaining: Math.max(state.timeRemaining - 1, 0)
  })),

  // ─── Fetch chapters ───────────────────
  fetchChapters: async (examType) => {
    set({ loadingChapters: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/adaptive/chapters?examType=${examType}`);
      const data = await res.json();
      if (data.success) {
        set({
          chapters: data.chapters,
          subjects: data.subjects || Object.keys(data.chapters),
          loadingChapters: false
        });
      } else {
        set({ error: data.error, loadingChapters: false });
      }
    } catch (err: any) {
      set({ error: err.message, loadingChapters: false });
    }
  },

  // ─── Generate test ────────────────────
  generateTest: async () => {
    const state = get();
    if (!state.selectedSubject || !state.selectedChapter) {
      set({ error: 'Please select a subject and chapter' });
      return false;
    }

    set({ generating: true, error: null });
    const token = resolveToken();

    const activeTopics = state.selectedSubTopics.length > 0
      ? state.selectedSubTopics
      : state.selectedChapter.subTopics;

    try {
      const res = await fetch(`${API_URL}/api/adaptive/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          examType: state.selectedExamType,
          subject: state.selectedSubject,
          chapterName: state.selectedChapter.name,
          selectedSubTopics: activeTopics,
          questionCount: state.questionCount,
          durationMinutes: state.durationMinutes,
          difficulty: state.difficulty
        })
      });

      const data = await res.json();

      if (data.success) {
        set({
          attemptId: data.attemptId,
          questions: data.questions,
          answers: {},
          currentQuestionIndex: 0,
          timeRemaining: data.durationSeconds || state.durationMinutes * 60,
          isTestActive: true,
          isRemediation: data.isRemediation || false,
          weakAreasTargeted: data.weakAreasTargeted || [],
          generating: false,
          summary: null,
          diagnosis: null,
          results: []
        });
        return true;
      } else {
        set({ error: data.error || 'Failed to generate test', generating: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message, generating: false });
      return false;
    }
  },

  // ─── Check Yourself (2-3 targeted questions on 1 concept) ───
  generateCheckYourselfTest: async (subject: string, chapterName: string, subTopic: string) => {
    const state = get();
    set({ generating: true, error: null });
    const token = resolveToken();

    try {
      const res = await fetch(`${API_URL}/api/adaptive/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          examType: state.selectedExamType,
          subject,
          chapterName,
          selectedSubTopics: [subTopic],
          questionCount: 3,
          durationMinutes: 6,
          difficulty: 'medium'
        })
      });

      const data = await res.json();

      if (data.success) {
        set({
          selectedSubject: subject,
          selectedChapter: { name: chapterName, subTopics: [subTopic] },
          selectedSubTopics: [subTopic],
          questionCount: 3,
          durationMinutes: 6,
          attemptId: data.attemptId,
          questions: data.questions,
          answers: {},
          currentQuestionIndex: 0,
          timeRemaining: data.durationSeconds || 360,
          isTestActive: true,
          isRemediation: true,
          weakAreasTargeted: [subTopic],
          generating: false,
          summary: null,
          diagnosis: null,
          results: []
        });
        return true;
      } else {
        set({ error: data.error || 'Failed to generate practice test', generating: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message, generating: false });
      return false;
    }
  },

  // ─── Submit test ──────────────────────
  submitTest: async () => {
    const state = get();
    if (!state.attemptId) return false;

    set({ isSubmitting: true });
    const token = resolveToken();

    // Calculate time taken
    const totalDuration = state.durationMinutes * 60;
    const timeTaken = totalDuration - state.timeRemaining;

    try {
      const res = await fetch(`${API_URL}/api/adaptive/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          attemptId: state.attemptId,
          answers: state.answers,
          timeTaken
        })
      });

      const data = await res.json();

      if (data.success) {
        set({
          isTestActive: false,
          isSubmitting: false,
          summary: data.summary,
          diagnosis: data.diagnosis,
          results: data.results
        });
        return true;
      } else {
        set({ error: data.error, isSubmitting: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message, isSubmitting: false });
      return false;
    }
  },

  // ─── Fetch mastery ────────────────────
  fetchMastery: async () => {
    const state = get();
    set({ loadingMastery: true });
    const token = resolveToken();

    try {
      const res = await fetch(
        `${API_URL}/api/adaptive/mastery?examType=${state.selectedExamType}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      const data = await res.json();
      if (data.success) {
        set({
          mastery: data.mastery || [],
          history: data.history || [],
          loadingMastery: false
        });
      }
    } catch {
      set({ loadingMastery: false });
    }
  },

  // ─── Reset test ───────────────────────
  resetTest: () => set({
    attemptId: null,
    questions: [],
    answers: {},
    currentQuestionIndex: 0,
    timeRemaining: 900,
    isTestActive: false,
    isSubmitting: false,
    isRemediation: false,
    weakAreasTargeted: [],
    summary: null,
    diagnosis: null,
    results: [],
    error: null,
    generating: false
  })
}));
