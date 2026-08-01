import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, BarChart3, Bookmark, StickyNote,
  MessageSquare, Settings, Search, Bell, Award, Sparkles, ShieldCheck,
  ArrowRight, PlayCircle, Lock, Key, X, AlertCircle, CheckCircle2,
  RefreshCw, HelpCircle, Download, ChevronRight
} from 'lucide-react';
import { getCookie, deleteCookie } from '../lib/cookies';
import { StudentStudyingSketch } from '../components/StudentStudyingSketch';

interface TestPaper {
  id: string;
  title: string;
  exam_type?: string;
  examType?: string;
  pyq_year?: number;
  year?: string;
  duration_minutes?: number;
  questions_count?: number;
  total_marks?: number;
  status?: string;
  window_start?: string;
  window_end?: string;
  content_type?: string;
  passcode?: string;
  access_code?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TEST_SERIES' | 'PYQ'>('TEST_SERIES');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IAT' | 'NEST' | 'CMI'>('ALL');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'test_series' | 'pyq' | 'performance' | 'bookmarks' | 'notes' | 'discussions' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [studentName, setStudentName] = useState('Student');
  const [studentEmail, setStudentEmail] = useState('');

  // Modals & Toasts
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedTestForPasscode, setSelectedTestForPasscode] = useState<TestPaper | null>(null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  useEffect(() => {
    const token = getCookie('student_token') || localStorage.getItem('student_token');
    const name = getCookie('student_name') || localStorage.getItem('student_name') || localStorage.getItem('full_name') || 'Student';
    const email = getCookie('student_email') || localStorage.getItem('student_email') || localStorage.getItem('email') || '';

    if (!token) {
      window.location.href = 'https://auth.vigyanprep.com';
      return;
    }

    localStorage.setItem('student_token', token);
    localStorage.setItem('student_name', name);
    localStorage.setItem('student_email', email);

    setStudentName(name);
    setStudentEmail(email);

    async function loadDashboardTests() {
      setLoading(true);
      try {
        const [pyqRes, tsRes] = await Promise.all([
          fetch('https://api.vigyanprep.com/api/public/pyq'),
          fetch('https://api.vigyanprep.com/api/public/tests')
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
        setLoading(false);
      }
    }

    loadDashboardTests();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getWindowStatus = (paper: TestPaper) => {
    if (paper.content_type === 'pyq' || (!paper.window_start && !paper.window_end)) {
      return { isLive: true, label: '24/7 Practice Archive', color: 'emerald' };
    }

    const now = new Date();
    const start = paper.window_start ? new Date(paper.window_start) : null;
    const end = paper.window_end ? new Date(paper.window_end) : null;

    if (start && now < start) {
      return {
        isLive: false,
        label: `🔒 Scheduled for ${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        color: 'amber'
      };
    }

    if (end && now > end) {
      return {
        isLive: false,
        label: `⌛ Window Closed on ${end.toLocaleDateString()}`,
        color: 'red'
      };
    }

    return { isLive: true, label: '🟢 LIVE NOW', color: 'emerald' };
  };

  const handleTestClick = (paper: TestPaper) => {
    const status = getWindowStatus(paper);
    if (!status.isLive) {
      alert(`⚠️ This test paper is not currently open.\n\nStatus: ${status.label}`);
      return;
    }

    const requiredCode = paper.passcode || paper.access_code;
    if (requiredCode || paper.content_type === 'test_series') {
      setSelectedTestForPasscode(paper);
      setInputPasscode('');
      setPasscodeError(null);
      setShowPasscodeModal(true);
    } else {
      navigate(`/system-check?testId=${paper.id}`);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestForPasscode) return;

    const expectedCode = selectedTestForPasscode.passcode || selectedTestForPasscode.access_code;
    const entered = inputPasscode.trim();

    if (expectedCode && entered !== expectedCode) {
      setPasscodeError('Invalid 4-6 Digit Exam Passcode. Please check your hall ticket or subscription pass.');
      return;
    }

    if (entered.length < 4) {
      setPasscodeError('Passcode must be at least 4 to 6 characters/digits long.');
      return;
    }

    setShowPasscodeModal(false);
    navigate(`/system-check?testId=${selectedTestForPasscode.id}`);
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

  const testSeriesPapers = tests.filter(t => t.content_type === 'test_series' || t.content_type !== 'pyq');
  const pyqPapers = tests.filter(t => t.content_type === 'pyq');
  const activePapersList = activeTab === 'TEST_SERIES' ? testSeriesPapers : pyqPapers;

  const filteredTests = activePapersList.filter(t => {
    const matchesCat = activeCategory === 'ALL' || (t.exam_type || t.examType || '').toUpperCase().includes(activeCategory);
    const matchesSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f4f3fb] text-[#1e1b4b] font-sans flex selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Liquid Curve Accents (Yellow & Purple Corner Shapes matching reference image) */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/40 blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-3xl pointer-events-none z-0" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1b4b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple-400/30 text-xs font-semibold animate-bounce">
          <Sparkles className="text-amber-400" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR NAVIGATION (Exact match to reference layout)
         ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-purple-100 flex flex-col justify-between p-6 z-20 shrink-0 min-h-screen shadow-sm">
        <div className="space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
              ⚛
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-lg text-[#1e1b4b]">
                VIGYAN<span className="font-sans text-xs uppercase text-amber-500 font-bold ml-1">.prep</span>
              </h1>
              <p className="text-[9px] text-purple-600 font-extrabold tracking-widest uppercase">STUDENT TEST PORTAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveNav('dashboard'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveNav('test_series'); setActiveTab('TEST_SERIES'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'test_series'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <FileText size={18} />
              <span>Test Series</span>
            </button>

            <a
              href="https://vigyanprep.com/pyq"
              target="_blank"
              rel="noreferrer"
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 text-neutral-500 hover:text-purple-600 hover:bg-purple-50 transition"
            >
              <BookOpen size={18} />
              <span>PYQ Library</span>
            </a>

            <button
              onClick={() => { setActiveNav('performance'); setShowPerformanceModal(true); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'performance'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <BarChart3 size={18} />
              <span>Performance</span>
            </button>

            <button
              onClick={() => { setActiveNav('bookmarks'); triggerToast('🔖 Bookmarks feature coming soon! You will be able to save questions for revision.'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'bookmarks'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Bookmark size={18} />
              <span>Bookmarks</span>
            </button>

            <button
              onClick={() => { setActiveNav('notes'); triggerToast('📋 Notes feature coming soon! You will be able to write revision notes during CBT tests.'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'notes'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <StickyNote size={18} />
              <span>Notes</span>
            </button>

            <button
              onClick={() => { setActiveNav('discussions'); triggerToast('💬 Student Discussion Forum coming soon! Connect with fellow IISER & NEST aspirants.'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'discussions'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <MessageSquare size={18} />
              <span>Discussions</span>
            </button>

            <button
              onClick={() => { setActiveNav('settings'); setShowSettingsModal(true); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'settings'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-neutral-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer Support Notice */}
        <div className="pt-6 border-t border-purple-100 space-y-3 text-center">
          <p className="text-[10px] text-neutral-400 font-medium">Need Assistance?</p>
          <a
            href="https://vigyanprep.com/about"
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold block transition"
          >
            Contact Support
          </a>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* TOP HEADER BAR */}
        <header className="px-8 py-5 flex items-center justify-between gap-6 bg-white/40 backdrop-blur-md border-b border-purple-100/60 sticky top-0 z-30">
          
          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search test series, subjects & more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 border border-purple-100 rounded-full pl-11 pr-4 py-2.5 text-xs text-[#1e1b4b] placeholder-neutral-400 focus:outline-none focus:border-purple-500 shadow-sm"
            />
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Active Pass Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/70 border border-purple-200 text-purple-700 text-xs font-bold shadow-xs">
              <Award size={15} className="text-purple-600" />
              <span>IISER & NEST Subscription Active</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => triggerToast('🔔 No new test notifications. All papers up to date.')}
              className="w-10 h-10 rounded-full bg-white border border-purple-100 flex items-center justify-center text-neutral-500 hover:text-purple-600 transition shadow-xs relative"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </button>

            {/* Student Profile Pill */}
            <div className="flex items-center gap-3 pl-2 cursor-pointer" onClick={() => setShowSettingsModal(true)}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-extrabold text-[#1e1b4b]">{studentName}</p>
                <p className="text-[10px] text-neutral-400 font-medium">{studentEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY CONTENT */}
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* HERO WELCOME BANNER (Exact layout with scientific doodles & side cards) */}
          <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-white/90 border border-purple-100 shadow-xl shadow-purple-500/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Hand-sketched Erlenmeyer flask, Saturn, Magnifying Glass Background Motif */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block">
              <svg width="400" height="200" viewBox="0 0 400 200" fill="none">
                <path d="M 50,150 L 80,80 L 80,40 L 95,40 L 95,80 L 125,150 Z" stroke="#4c1d95" strokeWidth="2" />
                <circle cx="200" cy="80" r="35" stroke="#4c1d95" strokeWidth="2" />
                <ellipse cx="200" cy="80" rx="60" ry="12" stroke="#4c1d95" strokeWidth="2" />
                <circle cx="320" cy="120" r="25" stroke="#4c1d95" strokeWidth="2.5" />
                <line x1="338" y1="138" x2="365" y2="165" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            {/* Left Welcome Copy */}
            <div className="lg:col-span-6 space-y-4 relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-600">Welcome back,</p>
              <h2 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-[#1e1b4b]">
                {studentName}!
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium max-w-md">
                Your journey to IISER, NEST & CMI starts here. Practice. Analyze. Improve. <span className="text-purple-600 font-bold">Succeed!</span>
              </p>

              {/* Immutable Identity Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-[#1e1b4b] text-[11px] font-semibold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-purple-600" />
                  <span>Official Identity: <strong>{studentName}</strong> ({studentEmail})</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-purple-100/70 border border-purple-200 text-purple-700 text-[10px] font-mono font-bold uppercase">
                  🔒 Immutable Profile
                </div>
              </div>
            </div>

            {/* Right Banner Side Action Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              
              {/* Purple Card: Explore Test Passes */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white space-y-4 shadow-lg shadow-purple-600/20 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white">Explore Test Passes</h3>
                  <p className="text-[11px] text-purple-100/80 leading-relaxed">
                    Access all subscribed and available test series in one place.
                  </p>
                </div>
                <a
                  href="https://vigyanprep.com/tests"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Explore All Passes</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* White Card: Browse PYQ Library */}
              <div className="p-6 rounded-2xl bg-white border border-purple-100 space-y-4 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#1e1b4b]">Browse PYQ Library</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Practice previous year questions with filters and smart analysis.
                  </p>
                </div>
                <a
                  href="https://vigyanprep.com/pyq"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Browse Now</span>
                  <ArrowRight size={14} />
                </a>
              </div>

            </div>
          </div>

          {/* FILTER TABS ROW (Pill Buttons matching reference image) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-4">
            
            {/* Left Primary Switcher Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('TEST_SERIES')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition ${
                  activeTab === 'TEST_SERIES'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-neutral-500 hover:text-purple-600 border border-purple-100'
                }`}
              >
                SUBSCRIBED TEST SERIES ({testSeriesPapers.length})
              </button>

              <button
                onClick={() => setActiveTab('PYQ')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition flex items-center gap-2 ${
                  activeTab === 'PYQ'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-neutral-500 hover:text-purple-600 border border-purple-100'
                }`}
              >
                <BookOpen size={14} />
                <span>FREE PRACTICE PYQS ({pyqPapers.length})</span>
              </button>
            </div>

            {/* Right Category Filter Pills */}
            <div className="flex gap-2">
              {(['ALL', 'IAT', 'NEST', 'CMI'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    activeCategory === cat
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white border border-purple-100 text-neutral-500 hover:text-purple-600'
                  }`}
                >
                  {cat === 'ALL' ? 'All Exams' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 5 PERFORMANCE STAT CARDS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Tests Attempted</p>
                <p className="text-lg font-bold text-[#1e1b4b]">0</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Average Score</p>
                <p className="text-lg font-bold text-[#1e1b4b]">0%</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Best Score</p>
                <p className="text-lg font-bold text-[#1e1b4b]">0%</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Questions</p>
                <p className="text-lg font-bold text-[#1e1b4b]">0</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Accuracy</p>
                <p className="text-lg font-bold text-[#1e1b4b]">0%</p>
              </div>
            </div>
          </div>

          {/* MAIN SPLIT GRID: LEFT EXAM CONTENT & RIGHT QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT CONTENT AREA (9 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <div className="p-16 rounded-3xl bg-white border border-purple-100 text-center space-y-3">
                  <RefreshCw className="animate-spin text-purple-600 w-8 h-8 mx-auto" />
                  <p className="text-xs text-neutral-400 font-mono">Loading Examination Papers...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                /* EMPTY STATE FEATURING PENCIL SKETCH OF STUDENT STUDYING */
                <div className="p-10 rounded-3xl bg-white border border-dashed border-purple-200 text-center space-y-6 shadow-sm flex flex-col items-center">
                  
                  {/* Real Pencil Sketch Artwork */}
                  <StudentStudyingSketch className="w-80 h-56 text-[#1e1b4b]" />

                  <div className="space-y-2 max-w-md">
                    <h3 className="font-serif text-2xl font-extrabold text-[#1e1b4b]">
                      {activeTab === 'TEST_SERIES' ? 'No Upcoming Test Series Scheduled' : 'No Free PYQ Papers Available'}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {activeTab === 'TEST_SERIES'
                        ? 'Your subscribed test series papers will appear here on their scheduled exam dates. You can also explore available passes on the website.'
                        : 'Check back soon for newly published past year question papers.'}
                    </p>
                  </div>

                  {activeTab === 'TEST_SERIES' && (
                    <a
                      href="https://vigyanprep.com/tests"
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-md shadow-purple-500/20 flex items-center gap-2"
                    >
                      <span>Browse Test Series Passes</span>
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              ) : (
                /* TEST CARDS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTests.map((paper) => {
                    const status = getWindowStatus(paper);
                    const examCat = (paper.exam_type || paper.examType || 'IAT').toUpperCase();

                    return (
                      <div
                        key={paper.id}
                        className="rounded-3xl bg-white border border-purple-100 p-6 space-y-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase border border-purple-100">
                              {examCat}
                            </span>
                            <span className="font-serif italic text-xs text-neutral-400">
                              {paper.pyq_year || paper.year || '2025'}
                            </span>
                          </div>

                          <h4 className="font-serif text-xl font-bold text-[#1e1b4b] group-hover:text-purple-600 transition-colors line-clamp-2">
                            {paper.title}
                          </h4>

                          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                            status.color === 'emerald'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : status.color === 'amber'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}>
                            <span>{status.label}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-50 text-center text-xs">
                            <div className="bg-purple-50/50 p-2 rounded-xl">
                              <p className="text-[9px] text-neutral-400 font-bold uppercase">Questions</p>
                              <p className="font-bold text-[#1e1b4b]">{paper.questions_count || 60} Qs</p>
                            </div>
                            <div className="bg-purple-50/50 p-2 rounded-xl">
                              <p className="text-[9px] text-neutral-400 font-bold uppercase">Duration</p>
                              <p className="font-bold text-[#1e1b4b]">{paper.duration_minutes || 180} Mins</p>
                            </div>
                            <div className="bg-purple-50/50 p-2 rounded-xl">
                              <p className="text-[9px] text-neutral-400 font-bold uppercase">Marks</p>
                              <p className="font-bold text-purple-600">{paper.total_marks || 240} M</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTestClick(paper)}
                          disabled={!status.isLive}
                          className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                            status.isLive
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-95 shadow-purple-500/20 cursor-pointer'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                          }`}
                        >
                          {status.isLive ? <PlayCircle size={16} /> : <Lock size={16} />}
                          <span>{status.isLive ? 'Start CBT Exam' : 'Test Window Closed'}</span>
                        </button>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR (4 Cols): QUICK ACTIONS */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-md space-y-4">
                <div className="flex items-center gap-2 font-serif text-lg font-extrabold text-[#1e1b4b]">
                  <Sparkles size={18} className="text-purple-600" />
                  <span>Quick Actions</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowPerformanceModal(true)}
                    className="w-full p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <BarChart3 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1e1b4b]">Performance Analytics</p>
                        <p className="text-[10px] text-neutral-400">View detailed performance</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('🔖 Bookmarks feature coming soon!')}
                    className="w-full p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                        <Bookmark size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1e1b4b]">Bookmark a Test</p>
                        <p className="text-[10px] text-neutral-400">Save tests for later</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('📱 Vigyan.prep Mobile App launching soon on Play Store!')}
                    className="w-full p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Download size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1e1b4b]">Download Mobile App</p>
                        <p className="text-[10px] text-neutral-400">Practice on the go</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('💬 Student Discussion Forum coming soon!')}
                    className="w-full p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1e1b4b]">Join Discussion</p>
                        <p className="text-[10px] text-neutral-400">Ask & help peers</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* 4-6 DIGIT PASSCODE ENTRY MODAL */}
      {showPasscodeModal && selectedTestForPasscode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowPasscodeModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-[#1e1b4b] p-2 rounded-full hover:bg-purple-50 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                <Key size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1e1b4b]">Enter Exam Passcode</h3>
                <p className="text-xs text-neutral-400">4-6 Digit Access Key Required</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
              <p className="text-xs text-purple-700 font-bold">{selectedTestForPasscode.title}</p>
              <p className="text-[11px] text-neutral-500">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Exam Key / Passcode (4-6 Digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  placeholder="e.g. 8492"
                  className="w-full bg-purple-50/50 border border-purple-200 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-purple-900 focus:outline-none focus:border-purple-600 shadow-inner"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:opacity-95 transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Verify Passcode & Enter Exam</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PERFORMANCE MODAL */}
      {showPerformanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowPerformanceModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-[#1e1b4b] p-2 rounded-full hover:bg-purple-50 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1e1b4b]">Performance Analytics</h3>
                <p className="text-xs text-neutral-400">Student Progress & Attempt Overview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Tests Completed</p>
                <p className="text-2xl font-extrabold text-purple-700">0</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Average Accuracy</p>
                <p className="text-2xl font-extrabold text-purple-700">0%</p>
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed text-center">
              Complete your first scheduled CBT test series exam to view subject-wise performance graphs and All-India ranks!
            </p>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-[#1e1b4b] p-2 rounded-full hover:bg-purple-50 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1e1b4b]">Student Settings</h3>
                <p className="text-xs text-neutral-400">Manage Account & Profile</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-600 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p><strong>Name:</strong> {studentName} (Immutable)</p>
              <p><strong>Email:</strong> {studentEmail}</p>
              <p><strong>Role:</strong> Student Aspirant</p>
              <p><strong>Portal:</strong> IISER & NEST Test Center</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold text-xs uppercase tracking-wider rounded-2xl transition"
            >
              Sign Out of Student Account
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
