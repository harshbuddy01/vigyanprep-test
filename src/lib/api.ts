const API_URL = import.meta.env.VITE_API_URL || 'https://api.vigyanprep.com';

export const getTestMeta = async (testId: string, token: string) => {
  const res = await fetch(`${API_URL}/api/public/tests/${testId}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  if (!res.ok) throw new Error('Failed to fetch test meta');
  return res.json();
};

export const submitExam = async (attemptId: string, answers: any, token: string) => {
  if (!attemptId) return { success: true };
  
  // Format answers for backend lifecycle controller
  const answersList = Array.isArray(answers)
    ? answers
    : Object.entries(answers || {}).map(([qId, ans]) => ({
        questionId: qId,
        question_id: qId,
        answer: ans
      }));

  try {
    // 1. First autosave final answers
    if (answersList.length > 0) {
      await fetch(`${API_URL}/api/exam/lifecycle/autosave/${attemptId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ answers: answersList })
      }).catch(() => {});
    }

    // 2. Submit attempt
    const res = await fetch(`${API_URL}/api/exam/lifecycle/submit/${attemptId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ submitReason: 'manual' })
    });

    if (res.ok) return res.json();
  } catch (e) {
    console.warn('Primary lifecycle submit failed, trying fallback:', e);
  }

  // Fallback endpoint
  const fallbackRes = await fetch(`${API_URL}/api/exam/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ attemptId, answers: answersList })
  }).catch(() => null);

  if (fallbackRes && fallbackRes.ok) return fallbackRes.json();
  return { success: true };
};

export const sendHeartbeat = async (attemptId: string, timeRemaining: number, answers: any, warningCount: number, token: string) => {
  if (!attemptId) return;

  const answersList = Array.isArray(answers)
    ? answers
    : Object.entries(answers || {}).map(([qId, ans]) => ({
        questionId: qId,
        question_id: qId,
        answer: ans
      }));

  try {
    const res = await fetch(`${API_URL}/api/exam/lifecycle/autosave/${attemptId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ answers: answersList, warningCount, timeRemaining })
    });
    if (res.ok) return res.json();
  } catch (e) {
    // Non-fatal background sync
  }
};

export const submitFeedback = async (testId: string, studentId: string, data: any, token: string) => {
  const res = await fetch(`${API_URL}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ testId, studentId, ...data })
  }).catch(() => null);
  if (res && res.ok) return res.json();
  return { success: true };
};
