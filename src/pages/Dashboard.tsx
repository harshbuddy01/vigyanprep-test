import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, BarChart3, Bookmark, MessageSquare,
  Settings, Search, Bell, Award, Sparkles,
  ArrowRight, PlayCircle, Lock, Key, X, AlertCircle, CheckCircle2,
  RefreshCw, HelpCircle, Download, ChevronRight, Menu, Home, Mail,
  Edit3, GraduationCap, Trophy, Brain
} from 'lucide-react';
import { getCookie, deleteCookie } from '../lib/cookies';
import { useExamStore, generateRollNumber } from '../stores/examStore';
import {
  RayOpticsSketch,
  BenzeneOrbitalSketch,
  CalculusIntegralSketch,
  DNAHelixSketch,
  StudentDeskSketch
} from '../components/ScienceSketches';

import {
  ScientistAvatar,
  SCIENTIST_PERSONAS
} from '../components/ScientistPortraitAvatars';

export const SCIENTIST_AVATARS = SCIENTIST_PERSONAS;

interface TestPaper {
  id: string;
  title: string;
  exam_type?: string;
  examType?: string;
  pyq_year?: number;
  year?: string;
  exam_year?: number | string;
  duration_minutes?: number;
  questions_count?: number;
  total_marks?: number;
  status?: string;
  window_start?: string;
  window_end?: string;
  content_type?: string;
  passcode?: string;
  access_code?: string;
  response_released_at?: string;
}

interface HallTicket {
  id: string;
  test_id: string;
  unique_exam_id: string;
  issued_at: string;
  test: {
    title: string;
    exam_type: string;
    window_start: string;
    window_end: string;
  };
}

interface Subscription {
  id: string;
  plan_id: string;
  student_email: string;
  student_name: string;
  starts_at: string;
  expires_at: string;
  status: string;
  amount_paid: number;
  exam_type?: string;
  plan_name?: string;
  name?: string;
  bundle_includes?: string[];
  plan: {
    id?: string;
    name: string;
    exam_type: string;
    duration_days: number;
    bundle_includes?: string[];
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestPaper[]>([]);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean>(() => {
    const fromCookie = getCookie('maintenance_mode');
    if (fromCookie !== null && fromCookie !== undefined) return fromCookie === 'true';
    return localStorage.getItem('maintenance_mode') === 'true';
  });

  useEffect(() => {
    async function checkLiveMaintenance() {
      try {
        const res = await fetch('https://api.vigyanprep.com/api/public/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.maintenanceMode !== undefined) {
            setIsMaintenanceActive(!!data.settings.maintenanceMode);
          }
        }
      } catch (err) {
        console.warn('Maintenance check error:', err);
      }
    }
    checkLiveMaintenance();
  }, []);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TEST_SERIES' | 'PYQ'>('TEST_SERIES');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IAT' | 'NEST' | 'CMI'>('ALL');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'test_series' | 'pyq' | 'performance' | 'bookmarks' | 'notes' | 'discussions' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [studentName, setStudentName] = useState('Student');
  const [studentEmail, setStudentEmail] = useState('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [hallTickets, setHallTickets] = useState<HallTicket[]>([]);
  const [attemptedTestIds, setAttemptedTestIds] = useState<string[]>([]);

  // Modals & Toasts
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedTestForPasscode, setSelectedTestForPasscode] = useState<TestPaper | null>(null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [perfTab, setPerfTab] = useState<'TEST_SERIES' | 'PYQ'>('TEST_SERIES');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Scientist Avatar & Profile Update State
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    return localStorage.getItem('student_avatar_id') || 'einstein';
  });
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const currentScientist = SCIENTIST_AVATARS.find(a => a.id === selectedAvatarId) || SCIENTIST_AVATARS[0];

  const handleSelectAvatar = (id: string) => {
    setSelectedAvatarId(id);
    localStorage.setItem('student_avatar_id', id);
    const scientist = SCIENTIST_AVATARS.find(a => a.id === id);
    if (scientist) {
      setToastMessage(`✨ Persona set to ${scientist.name}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSendProfileRequest = () => {
    if (!reqName.trim() && !reqEmail.trim()) {
      alert("Please enter the new name or email you wish to update.");
      return;
    }
    const roll = generateRollNumber(studentEmail, studentName);
    const subject = encodeURIComponent(`[PROFILE UPDATE REQUEST] Student: ${studentName} (${roll})`);
    const body = encodeURIComponent(
`Hello VigyanPrep Academic Support Team,

I would like to request an official update to my student profile:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT PROFILE DETAILS:
• Current Full Name: ${studentName}
• Current Registered Email: ${studentEmail}
• Candidate Roll Number: ${roll}

REQUESTED UPDATES:
• Requested New Full Name: ${reqName.trim() || '(No Change)'}
• Requested New Email: ${reqEmail.trim() || '(No Change)'}
• Reason for Update: ${reqReason.trim() || 'Correction / Academic verification'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please verify my student identity and update my test series records accordingly.

Thank you,
${studentName}`
    );

    window.location.href = `mailto:support@vigyanprep.com?subject=${subject}&body=${body}`;
    setRequestSent(true);
  };

  useEffect(() => {
    let token = getCookie('student_token') || localStorage.getItem('student_token');
    let name = getCookie('student_name') || localStorage.getItem('student_name') || localStorage.getItem('full_name') || 'Student';
    let email = getCookie('student_email') || localStorage.getItem('student_email') || localStorage.getItem('email') || '';

    // Check token exists
    if (!token) {
      console.warn('No auth token found. Redirecting to login.');
      window.location.href = 'https://auth.vigyanprep.com';
      return;
    }

    // Validate JWT expiry — force re-login if expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('⚠️ Student token expired. Clearing session.');
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_name');
        localStorage.removeItem('student_email');
        deleteCookie('student_token');
        window.location.href = 'https://auth.vigyanprep.com';
        return;
      }
    } catch {
      // Invalid token format — force re-login
      localStorage.removeItem('student_token');
      deleteCookie('student_token');
      window.location.href = 'https://auth.vigyanprep.com';
      return;
    }

    localStorage.setItem('student_token', token);
    localStorage.setItem('student_name', name);
    localStorage.setItem('student_email', email);

    setStudentName(name);
    setStudentEmail(email);

    async function loadDashboardTests(silent = false) {
      if (!silent) setLoading(true);
      try {
        const [pyqRes, tsRes] = await Promise.all([
          fetch(`https://api.vigyanprep.com/api/public/pyq?cb=${Date.now()}`),
          fetch(`https://api.vigyanprep.com/api/public/tests?cb=${Date.now()}`)
        ]);

        let combined: TestPaper[] = [];

        if (pyqRes.ok) {
          const pyqData = await pyqRes.json();
          if (pyqData.papers) {
            combined.push(...pyqData.papers.map((p: any) => ({ ...p, content_type: 'pyq' })));
          }
        }

        if (tsRes.ok) {
          const tsData = await tsRes.json();
          if (tsData.tests) {
            combined.push(...tsData.tests.map((t: any) => ({ ...t, content_type: 'test_series' })));
          }
        }

        const unique = Array.from(new Map(combined.map(t => [t.id, t])).values());
        setTests(unique);
      } catch (err) {
        console.error('Failed to load dashboard tests:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    }

    async function loadHallTickets(authToken: string) {
      try {
        const res = await fetch(`https://api.vigyanprep.com/api/student/hall-tickets?cb=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.hallTickets) {
            setHallTickets(data.hallTickets);
          } else {
            setHallTickets([]);
          }
        } else {
          setHallTickets([]);
        }
      } catch (err) {
        console.error('Failed to load hall tickets:', err);
        setHallTickets([]);
      }
    }

    async function loadSubscriptions(authToken: string) {
      setSubsLoading(true);
      try {
        const res = await fetch(`https://api.vigyanprep.com/api/student/subscriptions?cb=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.subscriptions) {
            setSubscriptions(data.subscriptions);
          } else {
            setSubscriptions([]);
          }
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
        setSubscriptions([]);
      } finally {
        setSubsLoading(false);
      }
    }

    async function loadAttempts(authToken: string) {
      try {
        const res = await fetch(`https://api.vigyanprep.com/api/student/attempts?cb=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.attemptedTestIds) {
            setAttemptedTestIds(data.attemptedTestIds);
          }
        }
      } catch (err) {
        console.warn('Failed to load student attempts:', err);
      }
    }

    async function loadAnalytics(authToken: string) {
      try {
        const res = await fetch(`https://api.vigyanprep.com/api/student/analytics/performance?cb=${Date.now()}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAnalyticsData(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load student analytics:', err);
      }
    }

    loadDashboardTests();
    loadSubscriptions(token);
    loadHallTickets(token);
    loadAttempts(token);
    loadAnalytics(token);

    // 🔄 Live Auto-Sync Every 15 Seconds
    const syncInterval = setInterval(() => {
      loadAttempts(token);
      loadDashboardTests(true);
      loadAnalytics(token);
    }, 15000);

    return () => clearInterval(syncInterval);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getWindowStatus = (paper: TestPaper) => {
    const isAttempted = attemptedTestIds.includes(paper.id);

    // Released results (completed or response_released_at set)
    const isResultsReleased = !!(paper.response_released_at || (paper as any).result_released_at || paper.status === 'completed');
    if (isResultsReleased) {
      if (isAttempted) {
        return {
          isLive: true,
          isPractice: true,
          isReleased: true,
          isAttempted: true,
          label: '🏆 Live Attempted • Scorecard & AIR Rank Declared',
          color: 'emerald'
        };
      } else {
        return {
          isLive: true,
          isPractice: true,
          isReleased: true,
          isAttempted: false,
          label: '⏳ Missed Live Window • Practice & Solutions Available',
          color: 'amber'
        };
      }
    }

    if (paper.content_type === 'pyq' || (!paper.window_start && !paper.window_end)) {
      return { isLive: true, isReleased: false, isAttempted, label: '24/7 Practice Archive', color: 'emerald' };
    }

    const now = new Date();
    const start = paper.window_start ? new Date(paper.window_start) : null;
    const end = paper.window_end ? new Date(paper.window_end) : null;

    // Future scheduled test
    if (start && now < start) {
      const startIST = start.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' }) + ' ' +
        start.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
      return {
        isLive: false,
        isReleased: false,
        isAttempted,
        label: `🔒 Scheduled for ${startIST} IST`,
        color: 'amber'
      };
    }

    // Live test window right now
    if (start && end && now >= start && now <= end) {
      return { isLive: true, isReleased: false, isAttempted, label: '🟢 LIVE NOW — Proctored Window Open', color: 'emerald' };
    }

    // Expired live test awaiting results
    if (paper.content_type === 'test_series' && end && now > end) {
      return {
        isLive: false,
        isPractice: false,
        isReleased: false,
        isAttempted,
        label: isAttempted ? '📋 Exam Submitted — Awaiting Official Results' : '📋 Test Window Closed — Results Pending',
        color: 'gray'
      };
    }

    // Past PYQ paper — practice anytime
    return {
      isLive: true,
      label: `📜 Past Test Paper (Available)`,
      color: 'emerald'
    };
  };

  const handleTestClick = (paper: TestPaper) => {
    const status = getWindowStatus(paper);

    // If student already attempted this live exam and results are not released yet
    if (status.isAttempted && !status.isReleased && paper.content_type === 'test_series') {
      triggerToast('📋 You have already submitted this exam. Official scorecard & AIR rankings will be released after 09:00 PM.');
      return;
    }

    if (!status.isLive && status.color !== 'emerald') {
      triggerToast(`⚠️ ${status.label}`);
      return;
    }

    const token = getCookie('student_token') || localStorage.getItem('student_token') || getCookie('auth_token') || localStorage.getItem('auth_token') || '';

    useExamStore.getState().setTestMeta({
      candidateName: studentName || 'Student Candidate',
      rollNumber: generateRollNumber(studentEmail, studentName),
      testTitle: paper.title,
      examType: paper.exam_type || paper.examType || 'IAT',
      durationMinutes: paper.duration_minutes || 180,
      questionsCount: paper.questions_count || 60,
      totalMarks: paper.total_marks || 240,
      pyqYear: paper.pyq_year || paper.year || new Date().getFullYear(),
      testId: paper.id,
      token
    });

    const isLive = paper.content_type === 'test_series';
    useExamStore.getState().setIsLiveTest(isLive);

    const myHallTicket = hallTickets.find(h => h.test_id === paper.id);
    if (myHallTicket) {
      navigate(`/instructions?testId=${paper.id}`);
      return;
    }

    const requiredCode = paper.passcode || paper.access_code;
    if (requiredCode) {
      setSelectedTestForPasscode(paper);
      setInputPasscode('');
      setPasscodeError(null);
      setShowPasscodeModal(true);
    } else {
      navigate(`/instructions?testId=${paper.id}`);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestForPasscode) return;

    const entered = inputPasscode.trim();
    if (entered.length < 4) {
      setPasscodeError('Passcode must be at least 4 characters long.');
      return;
    }

    try {
      const res = await fetch('https://api.vigyanprep.com/api/exam/validate-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: selectedTestForPasscode.id,
          passcode: entered
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowPasscodeModal(false);
        navigate(`/instructions?testId=${selectedTestForPasscode.id}`);
      } else {
        setPasscodeError(data.error || 'Invalid passcode.');
      }
    } catch (err) {
      setPasscodeError('Error validating passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    deleteCookie('student_token');
    deleteCookie('student_name');
    deleteCookie('student_email');
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_email');
    window.location.href = 'https://auth.vigyanprep.com';
  };

  const allTestSeriesPapers = tests.filter(t => t.content_type === 'test_series');
  const pyqPapers = tests.filter(t => t.content_type === 'pyq');

  // Collect ALL exam types the user is subscribed to (including bundle_includes & plan name matching)
  const subscribedExamTypes = new Set<string>();
  subscriptions.forEach(s => {
    const rawType = (s.plan?.exam_type || s.exam_type || '').toUpperCase();
    if (rawType && rawType !== 'BUNDLE') {
      subscribedExamTypes.add(rawType);
    }
    const bundleIncludes = s.plan?.bundle_includes || s.bundle_includes || [];
    if (Array.isArray(bundleIncludes)) {
      bundleIncludes.forEach((bt: string) => subscribedExamTypes.add(String(bt).toUpperCase()));
    }
    const planName = (s.plan?.name || s.plan_name || s.name || '').toUpperCase();
    if (planName.includes('IAT') || planName.includes('IISER')) subscribedExamTypes.add('IAT');
    if (planName.includes('NEST') || planName.includes('NISER')) subscribedExamTypes.add('NEST');
    if (planName.includes('CMI')) subscribedExamTypes.add('CMI');
  });

  // Category filter pills: only show categories user is subscribed to on Test Series tab
  type CategoryType = 'ALL' | 'IAT' | 'NEST' | 'CMI';
  const availableCategoryPills: CategoryType[] = activeTab === 'TEST_SERIES' && subscriptions.length > 0
    ? ['ALL', ...((['IAT', 'NEST', 'CMI'] as CategoryType[]).filter(cat => subscribedExamTypes.has(cat)))]
    : ['ALL', 'IAT', 'NEST', 'CMI'];

  // For TEST_SERIES tab: only show tests matching the user's subscribed exam types
  const testSeriesPapers = subscriptions.length > 0
    ? allTestSeriesPapers.filter(t => {
        const examCat = (t.exam_type || t.examType || '').toUpperCase();
        return subscribedExamTypes.has(examCat);
      })
    : []; // Unpaid users see no test series

  const activePapersList = activeTab === 'TEST_SERIES' ? testSeriesPapers : pyqPapers;

  const filteredTests = activePapersList.filter(t => {
    const matchesCat = activeCategory === 'ALL' || (t.exam_type || t.examType || '').toUpperCase().includes(activeCategory);
    const matchesSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#faf5eb] text-[#1c1815] font-sans flex selection:bg-amber-400 selection:text-black relative overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════════
          FULL-CLARITY AERIAL DRONE VIEW SKETCH BACKGROUND (100% VISIBLE THROUGH GLASS)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Crisp Aerial Drone Sketch of University Campus */}
        <img
          src="/images/university_drone_view_sketch.jpg"
          alt="Aerial Drone View University Campus Architectural Sketch Watermark"
          className="w-full h-full object-cover opacity-[0.55] mix-blend-multiply filter contrast-130 sepia-[0.10]"
        />
        {/* Very Light Parchment Tint (Does Not Mask the Sketch) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf5eb]/30 via-transparent to-[#f1e6d3]/40" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1815] text-amber-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-500/30 text-xs font-semibold animate-bounce">
          <Sparkles className="text-amber-400" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR NAVIGATION (Desktop Static + Mobile Slide-over Drawer)
         ═══════════════════════════════════════════════════════════════════════ */}
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white/20 backdrop-blur-2xl border-r-2 border-amber-950/30 flex-col justify-between p-6 z-20 shrink-0 min-h-screen shadow-2xl shadow-amber-950/10">
        <div className="space-y-6">
          
          {/* Official Logo (Enlarged & Prominent) — Clicking redirects directly to homepage */}
          <a
            href="https://vigyanprep.com/"
            className="flex flex-col items-start gap-2 group cursor-pointer"
            title="Go to VigyanPrep Homepage"
          >
            <img
              src="/vigyan-logo.png"
              alt="VigyanPrep Official Logo"
              className="h-24 sm:h-28 w-auto max-w-[210px] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-[9px] text-amber-950 font-extrabold tracking-widest uppercase border-t-2 border-amber-950/20 pt-2 w-full text-left">
              STUDENT TEST PORTAL
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {/* Direct Home Link */}
            <a
              href="https://vigyanprep.com"
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer text-[#1c1815] hover:text-amber-950 hover:bg-white/40 border border-transparent hover:border-amber-950/20"
            >
              <Home size={18} className="text-amber-900" />
              <span>Home (VigyanPrep)</span>
            </a>

            <button
              type="button"
              onClick={() => { setActiveNav('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#1c1815] text-amber-300 font-bold shadow-lg shadow-amber-950/30 border border-amber-500/30'
                  : 'text-[#1c1815] hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNav('test_series');
                setActiveTab('TEST_SERIES');
                document.getElementById('tests-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeNav === 'test_series'
                  ? 'bg-[#1c1815] text-amber-300 font-bold shadow-lg shadow-amber-950/30 border border-amber-500/30'
                  : 'text-[#1c1815] hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <FileText size={18} />
              <span>Test Series</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNav('pyq');
                setActiveTab('PYQ');
                document.getElementById('tests-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeNav === 'pyq'
                  ? 'bg-[#1c1815] text-amber-300 font-bold shadow-lg shadow-amber-950/30 border border-amber-500/30'
                  : 'text-[#1c1815] hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <BookOpen size={18} />
              <span>Practice Tests</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/adaptive-revision')}
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition cursor-pointer text-[#1c1815] hover:text-amber-950 hover:bg-white/40 group"
            >
              <div className="flex items-center gap-3">
                <Brain size={18} className="text-amber-900 group-hover:text-amber-950" />
                <span>AI Revision</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-600/30 text-amber-950 text-[9px] font-black uppercase">NEW</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/bookmarks')}
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer text-[#1c1815] hover:text-amber-950 hover:bg-white/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              <span>Bookmarks</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveNav('performance'); setShowPerformanceModal(true); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeNav === 'performance'
                  ? 'bg-[#1c1815] text-amber-300 font-bold shadow-lg shadow-amber-950/30 border border-amber-500/30'
                  : 'text-[#1c1815] hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <BarChart3 size={18} />
              <span>Performance</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveNav('settings'); setShowSettingsModal(true); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#1c1815] text-amber-300 font-bold shadow-lg shadow-amber-950/30 border border-amber-500/30'
                  : 'text-[#1c1815] hover:text-amber-950 hover:bg-white/40'
              }`}
            >
              <Settings size={18} />
              <span>Settings &amp; Avatar</span>
            </button>
          </nav>
        </div>

        {/* Footer Quick Logout */}
        <div className="pt-6 border-t-2 border-amber-950/20 space-y-3 text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2.5 rounded-xl bg-amber-950/10 border-2 border-amber-950/30 text-amber-950 hover:bg-amber-950 hover:text-amber-200 text-xs font-extrabold block transition shadow-sm cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-over Navigation for Phones and Tablets) */}
      {mobileNavOpen && (
        <>
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#f4ecd8] border-r-2 border-amber-950/40 p-6 flex flex-col justify-between shadow-2xl lg:hidden overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-amber-950/20 pb-4">
                <a href="https://vigyanprep.com/" className="flex flex-col items-start gap-1">
                  <img src="/vigyan-logo.png" alt="VigyanPrep Logo" className="h-18 sm:h-22 w-auto object-contain drop-shadow" />
                  <span className="text-[9px] text-amber-950 font-black tracking-widest uppercase">TEST PORTAL</span>
                </a>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-xl bg-amber-950/10 hover:bg-amber-950/20 text-amber-950 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                <a
                  href="https://vigyanprep.com"
                  className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition text-[#1c1815] hover:bg-white/60"
                >
                  <Home size={18} className="text-amber-900" />
                  <span>Home (VigyanPrep)</span>
                </a>

                <button
                  type="button"
                  onClick={() => { setActiveNav('dashboard'); setMobileNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                    activeNav === 'dashboard'
                      ? 'bg-[#1c1815] text-amber-300 font-bold shadow-md border border-amber-500/30'
                      : 'text-[#1c1815] hover:bg-white/60'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('test_series');
                    setActiveTab('TEST_SERIES');
                    setMobileNavOpen(false);
                    document.getElementById('tests-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                    activeNav === 'test_series'
                      ? 'bg-[#1c1815] text-amber-300 font-bold shadow-md border border-amber-500/30'
                      : 'text-[#1c1815] hover:bg-white/60'
                  }`}
                >
                  <FileText size={18} />
                  <span>Test Series</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveNav('pyq');
                    setActiveTab('PYQ');
                    setMobileNavOpen(false);
                    document.getElementById('tests-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                    activeNav === 'pyq'
                      ? 'bg-[#1c1815] text-amber-300 font-bold shadow-md border border-amber-500/30'
                      : 'text-[#1c1815] hover:bg-white/60'
                  }`}
                >
                  <BookOpen size={18} />
                  <span>Practice Tests</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMobileNavOpen(false); navigate('/adaptive-revision'); }}
                  className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition text-[#1c1815] hover:bg-white/60"
                >
                  <div className="flex items-center gap-3">
                    <Brain size={18} className="text-amber-900" />
                    <span>AI Revision</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-600/30 text-amber-950 text-[9px] font-black uppercase">NEW</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveNav('performance'); setShowPerformanceModal(true); setMobileNavOpen(false); }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                    activeNav === 'performance'
                      ? 'bg-[#1c1815] text-amber-300 font-bold shadow-md border border-amber-500/30'
                      : 'text-[#1c1815] hover:bg-white/60'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Performance</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveNav('settings'); setShowSettingsModal(true); setMobileNavOpen(false); }}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                    activeNav === 'settings'
                      ? 'bg-[#1c1815] text-amber-300 font-bold shadow-md border border-amber-500/30'
                      : 'text-[#1c1815] hover:bg-white/60'
                  }`}
                >
                  <Settings size={18} />
                  <span>Settings &amp; Avatar</span>
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t-2 border-amber-950/20 space-y-2 text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-xl bg-amber-950 text-amber-200 text-xs font-bold block shadow-md hover:bg-amber-900 transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* TOP HEADER BAR (Ultra-Transparent Glass with Dark Defined Border) */}
        <header className="px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-3 sm:gap-6 bg-white/20 backdrop-blur-2xl border-b-2 border-amber-950/30 sticky top-0 z-30 shadow-md">
          
          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2.5 rounded-xl bg-white/40 border-2 border-amber-950/30 text-[#1c1815] hover:bg-white/60 transition shadow-sm cursor-pointer shrink-0"
            title="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1c1815]" size={15} />
            <input
              type="text"
              placeholder="Search test series & subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/40 border-2 border-amber-950/30 rounded-full pl-10 pr-4 py-2 text-xs text-[#1c1815] placeholder-[#1c1815]/70 font-semibold focus:outline-none focus:border-amber-950 shadow-inner"
            />
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            
            {/* Active Pass Badge / My Subscriptions (Modern, Minimal & Attractive) */}
            <div className="hidden sm:flex flex-col items-end gap-2">
              {subsLoading ? (
                <div className="text-xs font-bold text-neutral-500 bg-white/40 px-3 py-1 rounded-full border border-amber-950/20">Loading pass...</div>
              ) : subscriptions.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-2 max-w-[600px]">
                  {Array.from(new Map(subscriptions.map(s => [s.plan?.id || s.id, s])).values()).map(sub => {
                    const daysRemaining = Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                    const passLabel = sub.plan.exam_type === 'BUNDLE' ? 'IAT + NEST Pass' : sub.plan.name;
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 shadow-xs text-xs font-bold backdrop-blur-md transition hover:scale-105 cursor-pointer"
                        onClick={() => setShowSettingsModal(true)}
                        title={`${sub.plan.name} • ${daysRemaining} days remaining`}
                      >
                        <Sparkles size={12} className="text-amber-400 shrink-0" />
                        <span className="font-serif font-extrabold tracking-wide text-amber-100">{passLabel}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                          {daysRemaining}d left
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Pass" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <a href="https://vigyanprep.com/tests" className="text-xs font-bold text-amber-900 hover:underline bg-white/40 px-3 py-1.5 rounded-full border border-amber-950/20 shadow-xs">
                  Explore Test Passes →
                </a>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => triggerToast('🔔 No new test notifications. All papers up to date.')}
              className="w-10 h-10 rounded-full bg-white/40 border-2 border-amber-950/30 flex items-center justify-center text-[#1c1815] hover:text-amber-950 transition shadow-sm relative"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            </button>

            {/* Student Scientist Avatar Button (Editorial Sketch Portrait) */}
            <div className="flex items-center gap-2 pl-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="w-10 h-10 rounded-2xl overflow-hidden hover:scale-105 transition cursor-pointer relative group border-2 border-amber-900/30 shadow-md bg-amber-100"
                title={`${studentName} • ${currentScientist.name} (${currentScientist.field}) • Click for Profile & Settings`}
              >
                <ScientistAvatar id={currentScientist.id} size={36} className="w-full h-full" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY CONTENT */}
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* MAINTENANCE ALERT BANNER */}
          {isMaintenanceActive && (
            <div className="p-5 rounded-3xl bg-amber-500/20 border-2 border-amber-600/50 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-600/30 text-amber-950 shrink-0">
                  <AlertCircle size={24} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#1c1815]">⚠️ Scheduled Platform Maintenance Active</h4>
                  <p className="text-xs font-semibold text-neutral-800 leading-relaxed">
                    VigyanPrep system updates are currently in progress. Exam servers and live results are operating in protected read-only mode.
                  </p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-[#1c1815] text-amber-300 font-extrabold text-[10px] uppercase tracking-widest shrink-0 border border-amber-500/30">
                Maintenance Mode
              </span>
            </div>
          )}

          {/* HERO WELCOME BANNER (Ultra-Transparent Glass Frame - 100% Background Visibility) */}
          <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-white/15 backdrop-blur-2xl border-2 border-amber-950/35 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.6)]">
            
            {/* Handcrafted Technical Science Sketches Overlay */}
            <div className="absolute right-4 top-4 opacity-20 pointer-events-none hidden lg:flex gap-6">
              <RayOpticsSketch className="w-32 h-32 text-amber-950" />
              <BenzeneOrbitalSketch className="w-32 h-32 text-amber-900" />
              <CalculusIntegralSketch className="w-32 h-32 text-amber-950" />
              <DNAHelixSketch className="w-32 h-32 text-emerald-950" />
            </div>

            {/* Left Welcome Copy */}
            <div className="lg:col-span-6 space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/50 border-2 border-amber-950/30 text-amber-950 text-xs font-extrabold uppercase tracking-widest shadow-xs">
                <Sparkles size={13} className="text-amber-800" /> Official Student Control Center
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#1c1815]">
                Welcome back, <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 font-serif tracking-wide">{studentName}!</span>
              </h2>
              <p className="text-xs text-[#1c1815] leading-relaxed font-bold max-w-md">
                Your journey to IISER, NEST &amp; CMI starts here. Practice. Analyze. Improve. <span className="text-amber-950 font-extrabold">Succeed!</span>
              </p>

              {/* Clean Aspirant Candidate Badges (Non-repetitive) */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-white/40 border-2 border-amber-950/20 text-[#1c1815] text-[11px] font-bold flex items-center gap-2 shadow-xs">
                  <GraduationCap size={15} className="text-amber-900" />
                  <span>Candidate ID: <strong className="font-mono text-amber-950">{generateRollNumber(studentEmail, studentName)}</strong></span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/10 border border-amber-950/20 text-amber-950 text-[10px] font-bold flex items-center gap-2 shadow-xs">
                  <ScientistAvatar id={currentScientist.id} size={18} className="rounded-md" />
                  <span>Persona: {currentScientist.name}</span>
                </div>
              </div>
            </div>

            {/* Right Banner Side Action Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              
              {/* Dark Teak Card: Explore Test Passes */}
              <div className="p-6 rounded-2xl bg-[#1c1815]/95 border-2 border-amber-500/40 text-white space-y-4 shadow-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-amber-200">Explore Test Passes</h3>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
                    Access all subscribed and available test series in one place.
                  </p>
                </div>
                <a
                  href="https://vigyanprep.com/tests"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition hover:opacity-95 shadow-md shadow-amber-500/20"
                >
                  <span>Explore All Passes</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Glassy Parchment Card: Browse PYQ Library */}
              <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-xl border-2 border-amber-950/30 space-y-4 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#1c1815]">Browse PYQ Library</h3>
                  <p className="text-[11px] text-[#1c1815] leading-relaxed font-bold">
                    Practice previous year questions with filters and smart analysis.
                  </p>
                </div>
                <a
                  href="https://vigyanprep.com/pyq"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/50 hover:bg-white/80 text-amber-950 font-extrabold text-xs flex items-center justify-center gap-2 transition border-2 border-amber-950/30 shadow-xs"
                >
                  <span>Browse Now</span>
                  <ArrowRight size={14} />
                </a>
              </div>

            </div>
          </div>

          {/* FILTER TABS ROW (Pill Buttons) */}
          <div id="tests-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-950/25 pb-4 scroll-mt-24">
            
            {/* Left Primary Switcher Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('TEST_SERIES')}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition ${
                  activeTab === 'TEST_SERIES'
                    ? 'bg-[#1c1815] text-amber-300 shadow-xl shadow-amber-950/30 border border-amber-500/30'
                    : 'bg-white/30 backdrop-blur-xl text-[#1c1815] hover:text-amber-950 border-2 border-amber-950/30 shadow-xs'
                }`}
              >
                {subscriptions.length > 0 ? `MY TEST SERIES (${testSeriesPapers.length})` : 'TEST SERIES (0)'}
              </button>

              <button
                onClick={() => setActiveTab('PYQ')}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition flex items-center gap-2 ${
                  activeTab === 'PYQ'
                    ? 'bg-[#1c1815] text-amber-300 shadow-xl shadow-amber-950/30 border border-amber-500/30'
                    : 'bg-white/30 backdrop-blur-xl text-[#1c1815] hover:text-amber-950 border-2 border-amber-950/30 shadow-xs'
                }`}
              >
                <BookOpen size={14} />
                <span>FREE PRACTICE PYQS ({pyqPapers.length})</span>
              </button>
            </div>

            {/* Right Category Filter Pills */}
            <div className="flex gap-2">
              {availableCategoryPills.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    activeCategory === cat
                      ? 'bg-amber-950/25 text-amber-950 border-2 border-amber-950/45 font-extrabold shadow-xs'
                      : 'bg-white/30 backdrop-blur-xl border-2 border-amber-950/30 text-[#1c1815] hover:text-amber-950 shadow-xs'
                  }`}
                >
                  {cat === 'ALL' ? 'All Exams' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 5 PERFORMANCE STAT CARDS ROW (Ultra-Transparent Glass Frame) */}
          {(() => {
            const activeDashboardSummary = activeTab === 'TEST_SERIES'
              ? (analyticsData?.testSeriesAnalytics?.summary || analyticsData?.summary)
              : (analyticsData?.pyqAnalytics?.summary || analyticsData?.summary);

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-amber-950/30 shadow-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/15 text-amber-950 border border-amber-950/30 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-[#1c1815] uppercase">Tests Attempted</p>
                    <p className="text-lg font-extrabold text-[#1c1815]">
                      {activeDashboardSummary ? activeDashboardSummary.totalTests : 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-amber-950/30 shadow-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-200/60 text-emerald-950 border border-emerald-400 flex items-center justify-center">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-[#1c1815] uppercase">Average Score</p>
                    <p className="text-lg font-extrabold text-[#1c1815]">
                      {activeDashboardSummary ? `${activeDashboardSummary.averageScore}%` : '0%'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-amber-950/30 shadow-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200/60 text-amber-950 border border-amber-400 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-[#1c1815] uppercase">Best Score</p>
                    <p className="text-lg font-extrabold text-[#1c1815]">
                      {activeDashboardSummary ? `${activeDashboardSummary.bestScore}%` : '0%'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-amber-950/30 shadow-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-200/60 text-orange-950 border border-orange-400 flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-[#1c1815] uppercase">Total Questions</p>
                    <p className="text-lg font-extrabold text-[#1c1815]">
                      {activeDashboardSummary ? activeDashboardSummary.totalQuestionsAttempted : 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-amber-950/30 shadow-md flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-pink-200/60 text-pink-950 border border-pink-400 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-[#1c1815] uppercase">Accuracy</p>
                    <p className="text-lg font-extrabold text-[#1c1815]">
                      {activeDashboardSummary ? `${activeDashboardSummary.accuracy}%` : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* MAIN SPLIT GRID: LEFT EXAM CONTENT & RIGHT QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT CONTENT AREA (9 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <div className="p-16 rounded-3xl bg-white/20 backdrop-blur-2xl border-2 border-amber-950/30 text-center space-y-3 shadow-2xl">
                  <RefreshCw className="animate-spin text-amber-950 w-8 h-8 mx-auto" />
                  <p className="text-xs text-[#1c1815] font-mono font-bold">Loading Examination Papers...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                /* ULTRA-TRANSPARENT GLASS MAIN PANEL WITH HANDCRAFTED STUDENT STUDYING SKETCH */
                <div className="p-8 sm:p-10 rounded-3xl bg-white/15 backdrop-blur-2xl border-2 border-amber-950/35 text-center space-y-6 shadow-2xl flex flex-col items-center shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.6)]">
                  
                  {/* Pure Handcrafted SVG Line Art Component */}
                  <StudentDeskSketch className="w-80 h-56 text-[#1c1815]" />

                  <div className="space-y-2 max-w-md">
                    <h3 className="font-serif text-2xl font-bold text-[#1c1815]">
                      {activeTab === 'TEST_SERIES' ? 'No Upcoming Test Series Scheduled' : 'No Free PYQ Papers Available'}
                    </h3>
                    <p className="text-xs text-[#1c1815] leading-relaxed font-extrabold">
                      {activeTab === 'TEST_SERIES'
                        ? 'Your subscribed test series papers will appear here on their scheduled exam dates. You can also explore available passes on the website.'
                        : 'Check back soon for newly published past year question papers.'}
                    </p>
                  </div>

                  {activeTab === 'TEST_SERIES' && (
                    <a
                      href="https://vigyanprep.com/tests"
                      className="px-6 py-3 rounded-xl bg-[#1c1815] text-amber-300 font-bold text-xs uppercase tracking-wider hover:bg-black transition shadow-xl shadow-amber-950/30 border border-amber-500/30 flex items-center gap-2"
                    >
                      <span>Browse Test Series Passes</span>
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              ) : (
                /* TEST CARDS GRID */
                <div className="space-y-8">
                  {/* UPCOMING TESTS (Subscribed) */}
                  {(() => {
                    // subscribedExamTypes is already computed above (includes bundle_includes)
                    const upcomingTests = filteredTests.filter(t => {
                      const examCat = (t.exam_type || t.examType || '').toUpperCase();
                      if (!subscribedExamTypes.has(examCat)) return false;
                      if (!t.window_start) return false;
                      return new Date(t.window_start) > new Date();
                    });

                    if (upcomingTests.length === 0) return null;

                    return (
                      <div className="space-y-4">
                        <h3 className="font-serif text-2xl font-bold text-[#1c1815] flex items-center gap-2">
                          <Sparkles size={24} className="text-amber-600" />
                          Upcoming Tests (Your Subscriptions)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {upcomingTests.map((paper) => {
                            const status = getWindowStatus(paper);
                            const examCat = (paper.exam_type || paper.examType || 'IAT').toUpperCase();
                            const myHallTicket = hallTickets.find(h => h.test_id === paper.id);
                            
                            const isUpcomingWithHallTicket = myHallTicket && !status.isLive && paper.window_start && new Date(paper.window_start) > new Date();

                            return (
                              <div
                                key={`upcoming-${paper.id}`}
                                className="rounded-3xl bg-amber-100/40 backdrop-blur-2xl border-2 border-amber-500/50 hover:border-amber-600 p-6 space-y-5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative group shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6)]"
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-amber-950/15 border border-amber-950/30 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider">
                                      {examCat}
                                    </span>
                                    <span className="font-serif italic text-xs text-[#1c1815] font-extrabold">
                                      {paper.exam_year || paper.year || paper.pyq_year || new Date().getFullYear()}
                                    </span>
                                  </div>

                                  <h4 className="font-serif text-xl font-bold text-[#1c1815] group-hover:text-amber-950 transition-colors line-clamp-2">
                                    {paper.title}
                                  </h4>

                                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border-2 ${
                                    status.color === 'emerald'
                                      ? 'bg-emerald-200/60 border-emerald-400 text-emerald-950'
                                      : status.color === 'amber'
                                      ? 'bg-amber-200/60 border-amber-400 text-amber-950'
                                      : 'bg-red-200/60 border-red-400 text-red-950'
                                  }`}>
                                    <span>{status.label}</span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-amber-950/25 text-center text-xs">
                                    <div className="bg-white/40 p-2 rounded-xl border border-amber-950/25">
                                      <p className="text-[9px] text-[#1c1815] uppercase font-extrabold">Questions</p>
                                      <p className="font-extrabold text-[#1c1815]">{paper.questions_count || 60} Qs</p>
                                    </div>
                                    <div className="bg-white/40 p-2 rounded-xl border border-amber-950/25">
                                      <p className="text-[9px] text-[#1c1815] uppercase font-extrabold">Duration</p>
                                      <p className="font-extrabold text-[#1c1815]">{paper.duration_minutes || 180} Mins</p>
                                    </div>
                                    <div className="bg-white/40 p-2 rounded-xl border border-amber-950/25">
                                      <p className="text-[9px] text-[#1c1815] uppercase font-extrabold">Marks</p>
                                      <p className="font-extrabold text-amber-950">{paper.total_marks || 240} M</p>
                                    </div>
                                  </div>
                                  
                                  {myHallTicket && (
                                    <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-500 shadow-inner flex flex-col gap-2">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-amber-900/10 p-2 rounded-lg text-amber-950">
                                          <Key size={18} />
                                        </div>
                                        <div>
                                          <p className="text-[10px] uppercase font-extrabold text-amber-900 tracking-wider">Your Exam Pass</p>
                                          <p className="font-mono text-sm font-bold text-amber-950">{myHallTicket.unique_exam_id}</p>
                                        </div>
                                      </div>
                                      {isUpcomingWithHallTicket && (
                                        <p className="text-[10px] text-amber-950 font-bold border-t border-amber-500/30 pt-2 mt-1">
                                          Exam on {new Date(paper.window_start!).toLocaleDateString()} at {new Date(paper.window_start!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {status.isReleased ? (
                                  status.isAttempted ? (
                                    <div className="space-y-2">
                                      <button
                                        onClick={() => {
                                          const matchAttempt = (analyticsData?.trendData || []).find((t: any) => t.testId === paper.id);
                                          const attemptParam = matchAttempt?.attemptId ? `&attemptId=${matchAttempt.attemptId}` : '';
                                          navigate(`/response-sheet?testId=${paper.id}${attemptParam}`);
                                        }}
                                        className="w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md border border-amber-400/40 cursor-pointer transition"
                                      >
                                        <Award size={16} />
                                        <span>View Your Scorecard &amp; AIR Rank</span>
                                      </button>
                                      <button
                                        onClick={() => handleTestClick(paper)}
                                        className="w-full py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#1c1815] text-amber-300 hover:bg-black border border-amber-500/30 cursor-pointer transition"
                                      >
                                        <PlayCircle size={14} />
                                        <span>Re-Practice Mode (Instant Grading)</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="p-2.5 rounded-xl bg-amber-950/10 border border-amber-950/20 text-[11px] text-[#1c1815] space-y-1">
                                        <p className="font-bold flex items-center gap-1.5 text-amber-950">
                                          <span>⚠️</span> <span>Missed Live Exam Window</span>
                                        </p>
                                        <p className="text-[10px] text-neutral-700 leading-snug">
                                          You did not take this exam during the scheduled live window. You can take it in Practice Mode with instant auto-grading or view official solutions below.
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleTestClick(paper)}
                                        className="w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md border border-amber-400/40 cursor-pointer transition"
                                      >
                                        <PlayCircle size={16} />
                                        <span>Practice Mode (Instant Grading)</span>
                                      </button>
                                      <button
                                        onClick={() => navigate(`/response-sheet?testId=${paper.id}&viewSolutions=true`)}
                                        className="w-full py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#1c1815] text-amber-300 hover:bg-black border border-amber-500/30 cursor-pointer transition"
                                      >
                                        <FileText size={14} />
                                        <span>View Paper Solutions &amp; Answer Key</span>
                                      </button>
                                    </div>
                                  )
                                ) : status.isAttempted && paper.content_type === 'test_series' ? (
                                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                                    <div className="text-xs font-black text-emerald-700 flex items-center justify-center gap-1.5">
                                      <CheckCircle2 size={16} className="text-emerald-600" />
                                      <span>Exam Submitted Successfully</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-600">
                                      Your responses have been recorded. Official results &amp; AIR rankings will be released after 09:00 PM.
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleTestClick(paper)}
                                    disabled={!status.isLive}
                                    className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                                      status.isLive
                                        ? (myHallTicket ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/30 border border-emerald-500 cursor-pointer' : 'bg-[#1c1815] text-amber-300 hover:bg-black shadow-amber-950/30 cursor-pointer border border-amber-500/30')
                                        : 'bg-neutral-300/60 text-neutral-600 border border-neutral-400 cursor-not-allowed'
                                    }`}
                                  >
                                    {status.isLive ? <PlayCircle size={16} /> : <Lock size={16} />}
                                    <span>{status.isLive ? (myHallTicket ? 'Enter Exam' : 'Start CBT Exam') : 'Test Window Closed'}</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-4">
                    <h3 className="font-serif text-xl font-bold text-[#1c1815]">All Available Papers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredTests.map((paper) => {
                    const status = getWindowStatus(paper);
                    const examCat = (paper.exam_type || paper.examType || 'IAT').toUpperCase();
                    const myHallTicket = hallTickets.find(h => h.test_id === paper.id);
                    
                    const isUpcomingWithHallTicket = myHallTicket && !status.isLive && paper.window_start && new Date(paper.window_start) > new Date();

                    return (
                      <div
                        key={paper.id}
                        className="rounded-3xl bg-white/20 backdrop-blur-2xl border-2 border-amber-950/35 hover:border-amber-950/60 p-6 space-y-5 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative group shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.6)]"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full bg-amber-950/15 border border-amber-950/30 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider">
                              {examCat}
                            </span>
                            <span className="font-serif italic text-xs text-[#1c1815] font-extrabold">
                              {paper.exam_year || paper.year || paper.pyq_year || new Date().getFullYear()}
                            </span>
                          </div>

                          <h4 className="font-serif text-xl font-bold text-[#1c1815] group-hover:text-amber-950 transition-colors line-clamp-2">
                            {paper.title}
                          </h4>

                          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border-2 ${
                            status.color === 'emerald'
                              ? 'bg-emerald-200/60 border-emerald-400 text-emerald-950'
                              : status.color === 'amber'
                              ? 'bg-amber-200/60 border-amber-400 text-amber-950'
                              : 'bg-red-200/60 border-red-400 text-red-950'
                          }`}>
                            <span>{status.label}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-amber-950/25 text-center text-xs">
                            <div className="bg-white/40 p-2 rounded-xl border border-amber-950/25">
                              <p className="text-[9px] text-[#1c1815] uppercase font-extrabold">Questions</p>
                              <p className="font-extrabold text-[#1c1815]">{paper.questions_count || 60} Qs</p>
                            </div>
                            <div className="bg-white/40 p-2 rounded-xl border border-amber-950/25">
                              <p className="text-[9px] text-[#1c1815] uppercase font-extrabold">Duration</p>
                              <p className="font-extrabold text-[#1c1815]">{paper.duration_minutes || 180} Mins</p>
                            </div>
                            <div className="bg-white/40 p-2 rounded-xl border border-amber-950/25">
                              <p className="text-[9px] text-[#1c1815] uppercase font-extrabold">Marks</p>
                              <p className="font-extrabold text-amber-950">{paper.total_marks || 240} M</p>
                            </div>
                          </div>

                          {myHallTicket && (
                            <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-200 to-amber-400 border border-amber-500 shadow-inner flex flex-col gap-2">
                              <div className="flex items-start gap-3">
                                <div className="bg-amber-900/10 p-2 rounded-lg text-amber-950">
                                  <Key size={18} />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-extrabold text-amber-900 tracking-wider">Your Exam Pass</p>
                                  <p className="font-mono text-sm font-bold text-amber-950">{myHallTicket.unique_exam_id}</p>
                                </div>
                              </div>
                              {isUpcomingWithHallTicket && (
                                <p className="text-[10px] text-amber-950 font-bold border-t border-amber-500/30 pt-2 mt-1">
                                  Exam on {new Date(paper.window_start!).toLocaleDateString()} at {new Date(paper.window_start!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {status.isReleased ? (
                          status.isAttempted ? (
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  const matchAttempt = (analyticsData?.trendData || []).find((t: any) => t.testId === paper.id);
                                  const attemptParam = matchAttempt?.attemptId ? `&attemptId=${matchAttempt.attemptId}` : '';
                                  navigate(`/response-sheet?testId=${paper.id}${attemptParam}`);
                                }}
                                className="w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md border border-amber-400/40 cursor-pointer transition"
                              >
                                <Award size={16} />
                                <span>View Your Scorecard &amp; AIR Rank</span>
                              </button>
                              <button
                                onClick={() => handleTestClick(paper)}
                                className="w-full py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#1c1815] text-amber-300 hover:bg-black border border-amber-500/30 cursor-pointer transition"
                              >
                                <PlayCircle size={14} />
                                <span>Re-Practice Mode (Instant Grading)</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2.5 rounded-xl bg-amber-950/10 border border-amber-950/20 text-[11px] text-[#1c1815] space-y-1">
                                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                                  <span>⚠️</span> <span>Missed Live Exam Window</span>
                                </p>
                                <p className="text-[10px] text-neutral-700 leading-snug">
                                  You did not take this exam during the scheduled live window. You can take it in Practice Mode with instant auto-grading or view official solutions below.
                                </p>
                              </div>
                              <button
                                onClick={() => handleTestClick(paper)}
                                className="w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md border border-amber-400/40 cursor-pointer transition"
                              >
                                <PlayCircle size={16} />
                                <span>Practice Mode (Instant Grading)</span>
                              </button>
                              <button
                                onClick={() => navigate(`/response-sheet?testId=${paper.id}&viewSolutions=true`)}
                                className="w-full py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 bg-[#1c1815] text-amber-300 hover:bg-black border border-amber-500/30 cursor-pointer transition"
                              >
                                <FileText size={14} />
                                <span>View Paper Solutions &amp; Answer Key</span>
                              </button>
                            </div>
                          )
                        ) : status.isAttempted && paper.content_type === 'test_series' ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                            <div className="text-xs font-black text-emerald-700 flex items-center justify-center gap-1.5">
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              <span>Exam Submitted Successfully</span>
                            </div>
                            <p className="text-[10px] text-neutral-600">
                              Your responses have been recorded. Official results &amp; AIR rankings will be released after 09:00 PM.
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleTestClick(paper)}
                            disabled={!status.isLive}
                            className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                              status.isLive
                                ? (myHallTicket ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/30 border border-emerald-500 cursor-pointer' : 'bg-[#1c1815] text-amber-300 hover:bg-black shadow-amber-950/30 cursor-pointer border border-amber-500/30')
                                : 'bg-neutral-300/60 text-neutral-600 border border-neutral-400 cursor-not-allowed'
                            }`}
                          >
                            {status.isLive ? <PlayCircle size={16} /> : <Lock size={16} />}
                            <span>{status.isLive ? (myHallTicket ? 'Enter Exam' : 'Start CBT Exam') : 'Test Window Closed'}</span>
                          </button>
                        )}

                      </div>
                    );
                  })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR (4 Cols): QUICK ACTIONS (Ultra-Transparent Glass Frame with Dark Defined Border) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="p-6 rounded-3xl bg-white/15 backdrop-blur-2xl border-2 border-amber-950/35 shadow-2xl space-y-4 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.6)]">
                <div className="flex items-center gap-2 font-serif text-lg font-bold text-[#1c1815]">
                  <Sparkles size={18} className="text-amber-900" />
                  <span>Quick Actions</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/adaptive-revision')}
                    className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-200/70 to-amber-300/50 hover:from-amber-200 hover:to-amber-300/80 border-2 border-amber-600/40 text-left flex items-center justify-between transition group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-300 flex items-center justify-center shadow-xs">
                        <Brain size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1815] flex items-center gap-1.5">
                          <span>Smart AI Revision</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-200 font-mono font-bold">AI</span>
                        </p>
                        <p className="text-[10px] text-[#1c1815]/80 font-bold">Topic practice &amp; mistake remediation</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#1c1815] group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => setShowPerformanceModal(true)}
                    className="w-full p-3.5 rounded-2xl bg-white/40 hover:bg-white/70 border-2 border-amber-950/25 text-left flex items-center justify-between transition group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-950/15 text-amber-950 flex items-center justify-center border border-amber-950/20">
                        <BarChart3 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1815]">Performance Analytics</p>
                        <p className="text-[10px] text-[#1c1815]/80 font-bold">View detailed performance</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#1c1815] group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('🔖 Bookmarks feature coming soon!')}
                    className="w-full p-3.5 rounded-2xl bg-white/40 hover:bg-white/70 border-2 border-amber-950/25 text-left flex items-center justify-between transition group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-950/15 text-amber-950 flex items-center justify-center border border-amber-950/20">
                        <Bookmark size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1815]">Bookmark a Test</p>
                        <p className="text-[10px] text-[#1c1815]/80 font-bold">Save tests for later</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#1c1815] group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('📱 Vigyan.prep Mobile App launching soon on Play Store!')}
                    className="w-full p-3.5 rounded-2xl bg-white/40 hover:bg-white/70 border-2 border-amber-950/25 text-left flex items-center justify-between transition group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-950/15 text-amber-950 flex items-center justify-center border border-amber-950/20">
                        <Download size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1815]">Download Mobile App</p>
                        <p className="text-[10px] text-[#1c1815]/80 font-bold">Practice on the go</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#1c1815] group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('💬 Student Discussion Forum coming soon!')}
                    className="w-full p-3.5 rounded-2xl bg-white/40 hover:bg-white/70 border-2 border-amber-950/25 text-left flex items-center justify-between transition group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-950/15 text-amber-950 flex items-center justify-center border border-amber-950/20">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1c1815]">Join Discussion</p>
                        <p className="text-[10px] text-[#1c1815]/80 font-bold">Ask & help peers</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#1c1815] group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* 4-6 DIGIT PASSCODE ENTRY MODAL */}
      {showPasscodeModal && selectedTestForPasscode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#fcfbfa] border-2 border-amber-950/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowPasscodeModal(false)}
              className="absolute top-5 right-5 text-neutral-600 hover:text-[#1c1815] p-2 rounded-full hover:bg-amber-950/10 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-950/15 text-amber-950 border border-amber-950/25">
                <Key size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1c1815]">Enter Exam Passcode</h3>
                <p className="text-xs text-neutral-600 font-semibold">4-6 Digit Access Key Required</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-950/20 space-y-1">
              <p className="text-xs text-amber-950 font-bold">{selectedTestForPasscode.title}</p>
              <p className="text-[11px] text-neutral-700 font-medium">
                Scheduled for {selectedTestForPasscode.duration_minutes || 180} Mins · {selectedTestForPasscode.questions_count || 60} Questions
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Exam Key / Passcode (4-6 Digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  placeholder="e.g. 8492"
                  className="w-full bg-white border-2 border-amber-950/30 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-[#1c1815] focus:outline-none focus:border-amber-950 shadow-inner"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1c1815] text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-black transition shadow-xl shadow-amber-950/30 border border-amber-500/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Verify Passcode & Enter Exam</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCTION-GRADE CBT PERFORMANCE & ANALYTICS COCKPIT MODAL */}
      {showPerformanceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fcfbfa] border-2 border-amber-950/40 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPerformanceModal(false)}
              className="absolute top-5 right-5 text-neutral-600 hover:text-[#1c1815] p-2 rounded-full hover:bg-amber-950/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-amber-950/15 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-300 flex items-center justify-center text-xl shadow-md border border-amber-500/30">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1c1815]">CBT Performance &amp; Analytics Cockpit</h3>
                <p className="text-xs text-neutral-600 font-semibold">Live Accuracy, Subject Mastery &amp; All-India Rank Analysis</p>
              </div>
            </div>

            {/* 🌟 Tab Switcher: Paid Test Series vs Previous Year Practice (PYQ) */}
            <div className="flex bg-amber-950/10 p-1.5 rounded-2xl border border-amber-950/20">
              <button
                onClick={() => setPerfTab('TEST_SERIES')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  perfTab === 'TEST_SERIES'
                    ? 'bg-[#1c1815] text-amber-300 shadow-md scale-[1.01]'
                    : 'text-neutral-600 hover:text-[#1c1815] hover:bg-white/40'
                }`}
              >
                <Trophy size={14} className={perfTab === 'TEST_SERIES' ? 'text-amber-400' : 'text-neutral-500'} />
                <span>Paid Test Series ({analyticsData?.testSeriesAnalytics?.trendData?.length || 0})</span>
              </button>
              <button
                onClick={() => setPerfTab('PYQ')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  perfTab === 'PYQ'
                    ? 'bg-[#1c1815] text-amber-300 shadow-md scale-[1.01]'
                    : 'text-neutral-600 hover:text-[#1c1815] hover:bg-white/40'
                }`}
              >
                <BookOpen size={14} className={perfTab === 'PYQ' ? 'text-amber-400' : 'text-neutral-500'} />
                <span>Previous Year Papers / PYQ ({analyticsData?.pyqAnalytics?.trendData?.length || 0})</span>
              </button>
            </div>

            {(() => {
              const activePerfData = perfTab === 'TEST_SERIES'
                ? (analyticsData?.testSeriesAnalytics || analyticsData)
                : (analyticsData?.pyqAnalytics || analyticsData);

              return (
                <>
                  {/* 4-Card Hero Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-950/10 border border-amber-950/20 text-center">
                      <p className="text-[10px] font-extrabold text-neutral-600 uppercase">Tests Attempted</p>
                      <p className="text-2xl font-black text-amber-950 mt-1">
                        {activePerfData?.summary ? activePerfData.summary.totalTests : 0}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">{perfTab === 'TEST_SERIES' ? 'Submitted Mocks' : 'PYQ Papers'}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-center">
                      <p className="text-[10px] font-extrabold text-emerald-900 uppercase">Global Accuracy</p>
                      <p className="text-2xl font-black text-emerald-800 mt-1">
                        {activePerfData?.summary ? `${activePerfData.summary.accuracy}%` : '0%'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        {activePerfData?.summary ? `${activePerfData.summary.totalCorrect} / ${activePerfData.summary.totalQuestionsAttempted} Correct` : '0 Correct'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-indigo-100/70 border border-indigo-300 text-center">
                      <p className="text-[10px] font-extrabold text-indigo-900 uppercase">Average Score</p>
                      <p className="text-2xl font-black text-indigo-900 mt-1">
                        {activePerfData?.summary ? `${activePerfData.summary.averageScore}%` : '0%'}
                      </p>
                      <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                        Best: {activePerfData?.summary ? `${activePerfData.summary.bestScore}%` : '0%'}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-100/70 border border-rose-300 text-center">
                      <p className="text-[10px] font-extrabold text-rose-900 uppercase">Negative Marks</p>
                      <p className="text-2xl font-black text-rose-800 mt-1">
                        {activePerfData?.summary ? `-${activePerfData.summary.totalIncorrect}` : '0'}
                      </p>
                      <p className="text-[10px] text-rose-700 font-semibold mt-0.5">Marks Penalized</p>
                    </div>
                  </div>

                  {/* Subject Mastery Breakdown (PCMB) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Award size={15} className="text-amber-800" /> Subject-wise Accuracy &amp; Score Mastery
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-bold">Physics • Chemistry • Math • Biology</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['Physics', 'Chemistry', 'Mathematics', 'Biology'].map(subj => {
                        const sm = activePerfData?.subjectMastery?.[subj] || { correct: 0, incorrect: 0, attempted: 0, score: 0, accuracy: 0 };
                        const acc = sm.accuracy;
                        let statusBadge = "bg-gray-100 text-gray-700 border-gray-200";
                        let statusText = "No Attempts";
                        if (sm.attempted > 0) {
                          if (acc >= 70) { statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-300"; statusText = "⚡ Strong Focus"; }
                          else if (acc >= 40) { statusBadge = "bg-amber-100 text-amber-800 border-amber-300"; statusText = "📈 Steady Progress"; }
                          else { statusBadge = "bg-rose-100 text-rose-800 border-rose-300"; statusText = "📘 Revision Needed"; }
                        }

                        return (
                          <div key={subj} className="p-4 rounded-2xl bg-white border border-amber-950/15 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-[#1c1815]">{subj}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                                {statusText}
                              </span>
                            </div>

                            {/* Accuracy Progress Bar */}
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-neutral-500 font-medium">Accuracy</span>
                                <span className="font-bold text-amber-950">{acc}%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    acc >= 70 ? 'bg-emerald-500' : acc >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${acc}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 text-center text-xs">
                              <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Net Score</p>
                                <p className={`font-extrabold ${sm.score >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {sm.score > 0 ? `+${sm.score}` : sm.score}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Correct</p>
                                <p className="font-extrabold text-emerald-600">{sm.correct}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase">Wrong</p>
                                <p className="font-extrabold text-rose-500">{sm.incorrect}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exam Progression & Test History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <FileText size={15} className="text-amber-800" /> {perfTab === 'TEST_SERIES' ? 'Submitted Paid Test Series' : 'Submitted PYQ Practice Papers'}
                    </h4>

                    {activePerfData?.trendData && activePerfData.trendData.length > 0 ? (
                      <div className="space-y-2">
                        {activePerfData.trendData.map((t: any, idx: number) => (
                          <div
                            key={t.attemptId || idx}
                            className="p-4 rounded-2xl bg-white border border-amber-950/15 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#1c1815]">{t.testTitle}</span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full uppercase">
                                  {t.examType}
                                </span>
                                {t.isResultReleased ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                                    Result Declared
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                    Result Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500">
                                Attempted: <strong>{t.questionsAttempted} / {t.totalQuestions} Questions</strong> • {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              {t.isResultReleased && (
                                <div className="text-right">
                                  <p className="text-sm font-black text-amber-950">
                                    {t.score} <span className="text-[10px] font-semibold text-neutral-400">/ {t.totalMarks}</span>
                                  </p>
                                  <p className="text-[10px] text-emerald-700 font-bold">{t.accuracy}% Accuracy</p>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setShowPerformanceModal(false);
                                  navigate(`/response-sheet?testId=${t.testId}`);
                                }}
                                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5 shrink-0"
                              >
                                <Trophy size={13} />
                                <span>View Scorecard</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-amber-950/5 border border-amber-950/15 text-center space-y-1">
                        <p className="text-xs font-bold text-neutral-700">No {perfTab === 'TEST_SERIES' ? 'test series' : 'PYQ practice'} attempts recorded yet.</p>
                        <p className="text-[11px] text-neutral-500">Attempt a {perfTab === 'TEST_SERIES' ? 'live test series mock' : 'practice PYQ paper'} to start tracking your performance analytics!</p>
                      </div>
                    )}
                  </div>

                  {/* Strategic Diagnostic Recommendation */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-3">
                    <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-amber-950 space-y-1">
                      <p className="font-extrabold">💡 Academic Strategic Insight</p>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        {activePerfData?.summary && activePerfData.summary.accuracy < 60
                          ? "Your attempt rate is solid, but negative marking (-1 mark penalty) is impacting your net score. Practice selective question filtering to target 75%+ accuracy in your core subjects."
                          : "Excellent question accuracy! Focus on consistent speed drills and mock simulations to maximize your All-India Rank in the upcoming IISER / NEST examinations."}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* SETTINGS & PROFILE UPDATE MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fcfbfa] border-2 border-amber-950/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative my-8">
            <button
              onClick={() => { setShowSettingsModal(false); setRequestSent(false); }}
              className="absolute top-5 right-5 text-neutral-600 hover:text-[#1c1815] p-2 rounded-full hover:bg-amber-950/10 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-amber-950/15 pb-4">
              <ScientistAvatar id={currentScientist.id} size={54} className="rounded-2xl shadow-md border-2 border-amber-950/30" />
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1c1815]">Student Profile &amp; Settings</h3>
                <p className="text-xs text-neutral-600 font-semibold mt-0.5">
                  Active Persona: <strong className="text-amber-950 font-serif text-sm">{currentScientist.name}</strong> • <span className="text-amber-800 font-medium">{currentScientist.field}</span>
                </p>
                <p className="text-[10px] text-neutral-500 font-medium italic">{currentScientist.bio}</p>
              </div>
            </div>

            {/* Section 1: Choose Your Scientist Avatar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-800" /> Choose Your Scientist Persona
                </label>
                <span className="text-[10px] text-neutral-500 font-bold">{SCIENTIST_AVATARS.length} Editorial Sketches</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {SCIENTIST_AVATARS.map(avatar => {
                  const isSelected = selectedAvatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectAvatar(avatar.id)}
                      className={`p-2.5 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-amber-950 bg-amber-100/90 shadow-sm ring-2 ring-amber-950/20'
                          : 'border-amber-950/15 bg-white/70 hover:bg-white hover:border-amber-950/40'
                      }`}
                    >
                      <ScientistAvatar id={avatar.id} size={38} className="rounded-xl shrink-0 shadow-xs" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#1c1815] truncate font-serif">{avatar.name.split(' ').slice(-1)[0]}</p>
                        <p className="text-[9px] text-neutral-500 truncate">{avatar.field}</p>
                        <p className="text-[8px] font-mono text-amber-800/80 truncate">{avatar.era}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Current Account Details */}
            <div className="space-y-1.5 text-xs bg-amber-950/5 p-3.5 rounded-2xl border border-amber-950/15">
              <div className="flex justify-between items-center"><span className="text-neutral-500 font-bold">Candidate Name:</span> <span className="font-extrabold text-[#1c1815]">{studentName}</span></div>
              <div className="flex justify-between items-center"><span className="text-neutral-500 font-bold">Registered Email:</span> <span className="font-extrabold text-[#1c1815]">{studentEmail}</span></div>
              <div className="flex justify-between items-center"><span className="text-neutral-500 font-bold">Candidate Roll No:</span> <span className="font-mono font-bold text-amber-900">{generateRollNumber(studentEmail, studentName)}</span></div>
            </div>

            {/* Section 3: Request Profile Verification / Update */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border-2 border-amber-950/20 shadow-xs">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Edit3 size={14} className="text-amber-800" /> Request Name or Email Correction
                </h4>
                <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                  To protect your official test series scores and prevent unauthorized access, name/email changes require quick academic verification. Fill below to generate an automatic support email.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 mb-1">New Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Correct Name"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-amber-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-700 mb-1">New Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. new@email.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-amber-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-700 mb-1">Reason for Update</label>
                <input
                  type="text"
                  placeholder="e.g., Spelling correction / Primary email change"
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-amber-950"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendProfileRequest}
                  className="flex-1 py-2.5 px-4 bg-[#1c1815] hover:bg-black text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer border border-amber-500/30"
                >
                  <Mail size={14} />
                  <span>Send Support Request Email</span>
                </button>
                <a
                  href={`https://wa.me/917004283531?text=Hello%20VigyanPrep%20Support%2C%20I%20am%20student%20${encodeURIComponent(studentName)}%20(${encodeURIComponent(generateRollNumber(studentEmail, studentName))})%20and%20would%20like%20to%20request%20a%20profile%20correction.`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp (+91 7004283531)</span>
                </a>
              </div>
              {requestSent && (
                <p className="text-[11px] text-emerald-700 font-bold text-center bg-emerald-50 py-1.5 px-3 rounded-lg border border-emerald-200">
                  ✓ Email draft opened! Our support desk will verify and update your records promptly.
                </p>
              )}
            </div>

            {/* Section 4: Password Security & Sign Out */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-amber-950/15">
              <a
                href="https://auth.vigyanprep.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
              >
                <Key size={13} />
                <span>Change Password</span>
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
