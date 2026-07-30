const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

export const api = {
  getQuestions: async (testId: string) => {
    const res = await fetch(`${BASE_URL}/tests/${testId}/questions`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },
  submitExam: async (testId: string, answers: Record<string, string | string[]>) => {
    const res = await fetch(`${BASE_URL}/tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Failed to submit exam');
    return res.json();
  },
  getResults: async (testId: string) => {
    const res = await fetch(`${BASE_URL}/tests/${testId}/results`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  }
};
