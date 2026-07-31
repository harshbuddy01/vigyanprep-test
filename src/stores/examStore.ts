import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Question = {
  id: string;
  type: 'MCQ' | 'MSQ' | 'Numerical';
  text: string;
  image_url?: string;
  imageUrl?: string;
  options?: string[];
  section: string;
};

interface ExamState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  markedForReview: string[];
  timeRemaining: number;
  isSubmitted: boolean;

  testId: string | null;
  testTitle: string | null;
  examType: 'NEST' | 'IAT' | 'CMI' | null;
  candidateName: string | null;
  rollNumber: string | null;
  attemptId: string | null;
  token: string | null;
  warningCount: number;
  isOnline: boolean;

  setQuestions: (q: Question[]) => void;
  setAnswer: (questionId: string, answer: any) => void;
  markForReview: (questionId: string) => void;
  clearAnswer: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitExam: () => void;
  decrementTimer: () => void;
  setTimeRemaining: (time: number) => void;

  setTestMeta: (meta: Partial<ExamState>) => void;
  incrementWarning: () => void;
  setOnline: (status: boolean) => void;
  setAttemptId: (id: string) => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: [],
      timeRemaining: 3600, // Default 1 hr
      isSubmitted: false,

      testId: null,
      testTitle: null,
      examType: null,
      candidateName: null,
      rollNumber: null,
      attemptId: null,
      token: null,
      warningCount: 0,
      isOnline: true,
      
      setQuestions: (questions) => set({ questions, isSubmitted: false, warningCount: 0, currentQuestionIndex: 0 }),
      
      setAnswer: (questionId, answer) => set((state) => ({
        answers: { ...state.answers, [questionId]: answer }
      })),
      
      markForReview: (questionId) => set((state) => ({
        markedForReview: state.markedForReview.includes(questionId) 
          ? state.markedForReview.filter(id => id !== questionId)
          : [...state.markedForReview, questionId]
      })),
      
      clearAnswer: (questionId) => set((state) => {
        const newAnswers = { ...state.answers };
        delete newAnswers[questionId];
        return { answers: newAnswers };
      }),
      
      nextQuestion: () => set((state) => ({
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.questions.length - 1)
      })),
      
      prevQuestion: () => set((state) => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
      })),

      goToQuestion: (index) => set({ currentQuestionIndex: index }),
      
      submitExam: () => set({ isSubmitted: true }),
      
      decrementTimer: () => set((state) => ({
        timeRemaining: Math.max(state.timeRemaining - 1, 0),
        isSubmitted: state.timeRemaining <= 1 ? true : state.isSubmitted
      })),
      
      setTimeRemaining: (time) => set({ timeRemaining: time }),

      setTestMeta: (meta) => set((state) => ({ ...state, ...meta })),
      incrementWarning: () => set((state) => ({ warningCount: state.warningCount + 1 })),
      setOnline: (status) => set({ isOnline: status }),
      setAttemptId: (id) => set({ attemptId: id })
    }),
    {
      name: 'vigyan_exam_v1',
    }
  )
);
