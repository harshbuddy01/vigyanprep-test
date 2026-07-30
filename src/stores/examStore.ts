import { create } from 'zustand';

export type Question = {
  id: string;
  type: 'MCQ' | 'MSQ' | 'Numerical';
  text: string;
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
}

export const useExamStore = create<ExamState>((set) => ({
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: [],
  timeRemaining: 3600, // Default 1 hr
  isSubmitted: false,
  
  setQuestions: (questions) => set({ questions }),
  
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
  
  setTimeRemaining: (time) => set({ timeRemaining: time })
}));
