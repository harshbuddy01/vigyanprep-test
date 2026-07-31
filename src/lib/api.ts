const API_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

export const getTestMeta = async (testId: string, token: string) => {
  const res = await fetch(`${API_URL}/tests/${testId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch test meta');
  return res.json();
};

export const submitExam = async (attemptId: string, answers: any, token: string) => {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error('Failed to submit exam');
  return res.json();
};

export const sendHeartbeat = async (attemptId: string, timeRemaining: number, answers: any, warningCount: number, token: string) => {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ timeRemaining, answers, warningCount })
  });
  if (!res.ok) throw new Error('Failed to send heartbeat');
  return res.json();
};

export const submitFeedback = async (testId: string, studentId: string, data: any, token: string) => {
  const res = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ testId, studentId, ...data })
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
};
