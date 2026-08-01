import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, BarChart3, Bookmark, StickyNote,
  MessageSquare, Settings, Search, Bell, Award, Sparkles, ShieldCheck,
  ArrowRight, PlayCircle, Lock, Key, X, AlertCircle, CheckCircle2,
  RefreshCw, HelpCircle, Download, ChevronRight
} from 'lucide-react';
import { getCookie, deleteCookie } from '../lib/cookies';
import {
  RayOpticsSketch,
  BenzeneOrbitalSketch,
  CalculusIntegralSketch,
  DNAHelixSketch
} from '../components/ScienceSketches';

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
    <div className="min-h-screen bg-[#16120b] text-[#f2ead8] font-sans flex selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* Handcrafted Warm Blueprint Grid Accent */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#fcd34d_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e170d] text-amber-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-500/40 text-xs font-semibold animate-bounce">
          <Sparkles className="text-amber-400" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR NAVIGATION (Matching Warm Academic Brand Palette)
         ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 bg-[#1b150c]/90 backdrop-blur-xl border-r border-amber-500/20 flex flex-col justify-between p-6 z-20 shrink-0 min-h-screen shadow-xl">
        <div className="space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif text-amber-300 font-bold text-xl shadow-lg shadow-amber-500/10">
              V
            </div>
            <div>
              <h1 className="font-serif italic font-bold text-lg text-white">
                VIGYAN<span className="font-sans text-xs uppercase text-amber-400 font-semibold ml-1">.prep</span>
              </h1>
              <p className="text-[9px] text-amber-400/80 font-extrabold tracking-widest uppercase">STUDENT TEST PORTAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveNav('dashboard'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveNav('test_series'); setActiveTab('TEST_SERIES'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'test_series'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <FileText size={18} />
              <span>Test Series</span>
            </button>

            <a
              href="https://vigyanprep.com/pyq"
              target="_blank"
              rel="noreferrer"
              className="w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 text-neutral-400 hover:text-amber-300 hover:bg-white/5 transition"
            >
              <BookOpen size={18} />
              <span>PYQ Library</span>
            </a>

            <button
              onClick={() => { setActiveNav('performance'); setShowPerformanceModal(true); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'performance'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <BarChart3 size={18} />
              <span>Performance</span>
            </button>

            <button
              onClick={() => { setActiveNav('bookmarks'); triggerToast('🔖 Bookmarks feature coming soon! Save questions for revision.'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'bookmarks'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <Bookmark size={18} />
              <span>Bookmarks</span>
            </button>

            <button
              onClick={() => { setActiveNav('notes'); triggerToast('📋 Notes feature coming soon! Write revision notes during CBT tests.'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'notes'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <StickyNote size={18} />
              <span>Notes</span>
            </button>

            <button
              onClick={() => { setActiveNav('discussions'); triggerToast('💬 Student Discussion Forum coming soon!'); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'discussions'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <MessageSquare size={18} />
              <span>Discussions</span>
            </button>

            <button
              onClick={() => { setActiveNav('settings'); setShowSettingsModal(true); }}
              className={`w-full px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition ${
                activeNav === 'settings'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Footer Support Notice */}
        <div className="pt-6 border-t border-white/10 space-y-3 text-center">
          <p className="text-[10px] text-neutral-400 font-medium">Need Assistance?</p>
          <a
            href="https://vigyanprep.com/about"
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold block hover:bg-amber-500/20 transition"
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
        <header className="px-8 py-5 flex items-center justify-between gap-6 bg-[#16120b]/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-30">
          
          {/* Search Box */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search test series, subjects & more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-amber-500/30 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Active Pass Badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-xs">
              <Award size={15} className="text-amber-400" />
              <span>IISER & NEST Subscription Active</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => triggerToast('🔔 No new test notifications. All papers up to date.')}
              className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 hover:bg-amber-500/20 transition shadow-xs relative"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </button>

            {/* Student Profile Pill */}
            <div className="flex items-center gap-3 pl-2 cursor-pointer" onClick={() => setShowSettingsModal(true)}>
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold flex items-center justify-center text-sm shadow-md">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-extrabold text-white">{studentName}</p>
                <p className="text-[10px] text-neutral-400 font-medium">{studentEmail}</p>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY CONTENT */}
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* HERO WELCOME BANNER (Warm Academic Theme) */}
          <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#1c150c] via-[#18120a] to-[#120e08] border border-amber-500/30 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Handcrafted Technical Science Sketches Overlay */}
            <div className="absolute right-4 top-4 opacity-15 pointer-events-none hidden lg:flex gap-6">
              <RayOpticsSketch className="w-32 h-32 text-amber-400" />
              <BenzeneOrbitalSketch className="w-32 h-32 text-orange-400" />
              <CalculusIntegralSketch className="w-32 h-32 text-amber-300" />
              <DNAHelixSketch className="w-32 h-32 text-emerald-400" />
            </div>

            {/* Left Welcome Copy */}
            <div className="lg:col-span-6 space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
                <Sparkles size={13} /> Official Student Control Center
              </div>
              <h2 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-white">
                Welcome back, <span className="text-amber-300 font-sans not-italic">{studentName}!</span>
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed font-light max-w-md">
                Your journey to IISER, NEST & CMI starts here. Practice. Analyze. Improve. <span className="text-amber-300 font-bold">Succeed!</span>
              </p>

              {/* Immutable Identity Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-amber-500/25 text-neutral-300 text-[11px] font-semibold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Official Identity: <strong className="text-white">{studentName}</strong> ({studentEmail})</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  🔒 Immutable Profile
                </div>
              </div>
            </div>

            {/* Right Banner Side Action Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              
              {/* Gold Accent Card: Explore Test Passes */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2a1f10] via-[#1f170c] to-[#141009] border border-amber-500/40 text-white space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-amber-200">Explore Test Passes</h3>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Access all subscribed and available test series in one place.
                  </p>
                </div>
                <a
                  href="https://vigyanprep.com/tests"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition hover:opacity-95 shadow-md shadow-amber-500/20"
                >
                  <span>Explore All Passes</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Parchment Card: Browse PYQ Library */}
              <div className="p-6 rounded-2xl bg-[#1b150c] border border-white/10 space-y-4 shadow-md flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-white">Browse PYQ Library</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Practice previous year questions with filters and smart analysis.
                  </p>
                </div>
                <a
                  href="https://vigyanprep.com/pyq"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/15 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Browse Now</span>
                  <ArrowRight size={14} />
                </a>
              </div>

            </div>
          </div>

          {/* FILTER TABS ROW (Pill Buttons) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            
            {/* Left Primary Switcher Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('TEST_SERIES')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition ${
                  activeTab === 'TEST_SERIES'
                    ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                    : 'bg-[#1b150c] text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                SUBSCRIBED TEST SERIES ({testSeriesPapers.length})
              </button>

              <button
                onClick={() => setActiveTab('PYQ')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition flex items-center gap-2 ${
                  activeTab === 'PYQ'
                    ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                    : 'bg-[#1b150c] text-neutral-400 hover:text-white border border-white/10'
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
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                      : 'bg-[#1b150c] border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Exams' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 5 PERFORMANCE STAT CARDS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-[#1b150c] border border-white/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Tests Attempted</p>
                <p className="text-lg font-bold text-white">0</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1b150c] border border-white/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Average Score</p>
                <p className="text-lg font-bold text-white">0%</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1b150c] border border-white/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Best Score</p>
                <p className="text-lg font-bold text-white">0%</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1b150c] border border-white/10 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-400/10 text-orange-400 border border-orange-400/20 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Total Questions</p>
                <p className="text-lg font-bold text-white">0</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1b150c] border border-white/10 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Accuracy</p>
                <p className="text-lg font-bold text-white">0%</p>
              </div>
            </div>
          </div>

          {/* MAIN SPLIT GRID: LEFT EXAM CONTENT & RIGHT QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT CONTENT AREA (9 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {loading ? (
                <div className="p-16 rounded-3xl bg-[#1b150c] border border-amber-500/20 text-center space-y-3">
                  <RefreshCw className="animate-spin text-amber-400 w-8 h-8 mx-auto" />
                  <p className="text-xs text-neutral-400 font-mono">Loading Examination Papers...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                /* REALISTIC GRAPHITE PENCIL SKETCH ARTWORK OF STUDENT STUDYING */
                <div className="p-8 sm:p-10 rounded-3xl bg-[#1b150c] border border-amber-500/20 text-center space-y-6 shadow-xl flex flex-col items-center">
                  
                  {/* High Resolution Realistic Graphite Sketch Image generated by Gemini */}
                  <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl">
                    <img
                      src="/images/student_studying_sketch.jpg"
                      alt="Realistic Graphite Pencil Sketch of Student Studying Physics at Desk"
                      className="w-full h-auto object-cover filter contrast-[1.05] brightness-[0.95]"
                    />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      {activeTab === 'TEST_SERIES' ? 'No Upcoming Test Series Scheduled' : 'No Free PYQ Papers Available'}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light">
                      {activeTab === 'TEST_SERIES'
                        ? 'Your subscribed test series papers will appear here on their scheduled exam dates. You can also explore available passes on the website.'
                        : 'Check back soon for newly published past year question papers.'}
                    </p>
                  </div>

                  {activeTab === 'TEST_SERIES' && (
                    <a
                      href="https://vigyanprep.com/tests"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
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
                        className="rounded-3xl bg-[#1b150c] border border-amber-500/20 hover:border-amber-400/50 p-6 space-y-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                              {examCat}
                            </span>
                            <span className="font-serif italic text-xs text-neutral-400">
                              {paper.pyq_year || paper.year || '2025'}
                            </span>
                          </div>

                          <h4 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                            {paper.title}
                          </h4>

                          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                            status.color === 'emerald'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : status.color === 'amber'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}>
                            <span>{status.label}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-neutral-400 uppercase">Questions</p>
                              <p className="font-bold text-white">{paper.questions_count || 60} Qs</p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-neutral-400 uppercase">Duration</p>
                              <p className="font-bold text-white">{paper.duration_minutes || 180} Mins</p>
                            </div>
                            <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                              <p className="text-[9px] text-neutral-400 uppercase">Marks</p>
                              <p className="font-bold text-amber-300">{paper.total_marks || 240} M</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTestClick(paper)}
                          disabled={!status.isLive}
                          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                            status.isLive
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:opacity-95 shadow-amber-500/20 cursor-pointer'
                              : 'bg-neutral-800 text-neutral-500 border border-white/10 cursor-not-allowed'
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
              
              <div className="p-6 rounded-3xl bg-[#1b150c] border border-amber-500/20 shadow-md space-y-4">
                <div className="flex items-center gap-2 font-serif text-lg font-bold text-white">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>Quick Actions</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowPerformanceModal(true)}
                    className="w-full p-3.5 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/5 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                        <BarChart3 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Performance Analytics</p>
                        <p className="text-[10px] text-neutral-400">View detailed performance</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('🔖 Bookmarks feature coming soon!')}
                    className="w-full p-3.5 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/5 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                        <Bookmark size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Bookmark a Test</p>
                        <p className="text-[10px] text-neutral-400">Save tests for later</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('📱 Vigyan.prep Mobile App launching soon on Play Store!')}
                    className="w-full p-3.5 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/5 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                        <Download size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Download Mobile App</p>
                        <p className="text-[10px] text-neutral-400">Practice on the go</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition" />
                  </button>

                  <button
                    onClick={() => triggerToast('💬 Student Discussion Forum coming soon!')}
                    className="w-full p-3.5 rounded-2xl bg-black/30 hover:bg-black/50 border border-white/5 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Join Discussion</p>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18120a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowPasscodeModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Key size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Enter Exam Passcode</h3>
                <p className="text-xs text-neutral-400">4-6 Digit Access Key Required</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <p className="text-xs text-amber-300 font-bold">{selectedTestForPasscode.title}</p>
              <p className="text-[11px] text-neutral-400">
                Scheduled for {selectedTestForPasscode.duration_minutes || 180} Mins · {selectedTestForPasscode.questions_count || 60} Questions
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Exam Key / Passcode (4-6 Digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  placeholder="e.g. 8492"
                  className="w-full bg-black border border-amber-500/40 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18120a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowPerformanceModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Performance Analytics</h3>
                <p className="text-xs text-neutral-400">Student Progress & Attempt Overview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Tests Completed</p>
                <p className="text-2xl font-extrabold text-amber-300">0</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Average Accuracy</p>
                <p className="text-2xl font-extrabold text-amber-300">0%</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed text-center font-light">
              Complete your first scheduled CBT test series exam to view subject-wise performance graphs and All-India ranks!
            </p>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18120a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Student Settings</h3>
                <p className="text-xs text-neutral-400">Manage Account & Profile</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 bg-black/40 p-4 rounded-2xl border border-white/10">
              <p><strong className="text-white">Name:</strong> {studentName} (Immutable Profile)</p>
              <p><strong className="text-white">Email:</strong> {studentEmail}</p>
              <p><strong className="text-white">Role:</strong> Student Aspirant</p>
              <p><strong className="text-white">Portal:</strong> IISER & NEST Test Center</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Sign Out of Student Account
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
