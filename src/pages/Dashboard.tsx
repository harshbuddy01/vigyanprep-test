import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, PlayCircle, FileText, Lock, Key,
  BookOpen, Sparkles, LogOut, ArrowRight, ShieldCheck, HelpCircle, RefreshCw, X, AlertCircle
} from 'lucide-react';

interface TestPaper {
  id: string;
  title: string;
  exam_type?: string;
  examType?: string;
  pyq_year?: number;
  year?: string;
  duration_minutes?: number;
  duration?: number;
  total_questions?: number;
  questions_count?: number;
  content_type?: string;
  window_start?: string;
  window_end?: string;
  passcode?: string;
  access_code?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'IAT' | 'NEST' | 'CMI'>('ALL');
  const [studentName, setStudentName] = useState('Science Aspirant');
  const [studentEmail, setStudentEmail] = useState('');

  // Passcode Modal States
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedTestForPasscode, setSelectedTestForPasscode] = useState<TestPaper | null>(null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  useEffect(() => {
    // Read student auth info
    const storedName = localStorage.getItem('student_name') || localStorage.getItem('full_name') || 'Science Aspirant';
    const storedEmail = localStorage.getItem('student_email') || localStorage.getItem('email') || 'student@vigyanprep.com';
    setStudentName(storedName);
    setStudentEmail(storedEmail);

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
          if (pyqData.papers) combined.push(...pyqData.papers);
        }

        if (tsRes.ok) {
          const tsData = await tsRes.json();
          if (tsData.tests) combined.push(...tsData.tests);
        }

        // Deduplicate by ID
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

    // Check if passcode / key entry is required for this paper
    const requiredCode = paper.passcode || paper.access_code;
    if (requiredCode || paper.content_type === 'test_series') {
      setSelectedTestForPasscode(paper);
      setInputPasscode('');
      setPasscodeError(null);
      setShowPasscodeModal(true);
    } else {
      // Launch directly into system check
      navigate(`/system-check?testId=${paper.id}`);
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestForPasscode) return;

    const expectedCode = (selectedTestForPasscode.passcode || selectedTestForPasscode.access_code || '').trim().toUpperCase();
    const entered = inputPasscode.trim().toUpperCase();

    // If test has a set passcode and entered doesn't match
    if (expectedCode && entered !== expectedCode) {
      setPasscodeError('Invalid 4-6 Digit Exam Passcode. Please check your hall ticket or subscription pass.');
      return;
    }

    // Require non-empty passcode for scheduled tests
    if (entered.length < 4) {
      setPasscodeError('Passcode must be at least 4 to 6 characters/digits long.');
      return;
    }

    setShowPasscodeModal(false);
    navigate(`/system-check?testId=${selectedTestForPasscode.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_email');
    window.location.href = 'https://auth.vigyanprep.com';
  };

  const filteredTests = tests.filter(t => {
    if (activeCategory === 'ALL') return true;
    const cat = (t.exam_type || t.examType || '').toUpperCase();
    return cat.includes(activeCategory);
  });

  return (
    <div className="min-h-screen bg-[#0d0b08] text-[#f2ead8] font-sans selection:bg-amber-500 selection:text-black">
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#fcd34d_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      {/* Top Navbar */}
      <nav className="relative z-10 border-b border-amber-500/20 bg-[#141009]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif text-amber-300 font-bold text-xl">
            V
          </div>
          <div>
            <h1 className="font-serif italic font-bold text-lg text-white">
              VIGYAN<span className="font-sans text-xs uppercase text-amber-400 font-semibold ml-1">.prep</span>
            </h1>
            <p className="text-[10px] text-neutral-400 tracking-wider">STUDENT TEST PORTAL</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Award size={14} /> IISER & NEST Pass Active
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-sm">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white">{studentName}</p>
              <p className="text-[10px] text-neutral-400">{studentEmail}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition ml-2"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Student Dashboard Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Welcome Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1b150c] via-[#16120b] to-[#120e08] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={13} /> Student Control Center
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Welcome Back, <span className="text-amber-300">{studentName}</span>
            </h2>
            <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
              Select any scheduled IISER IAT, NISER NEST, or CMI test paper below. Paid tests require your 4-6 digit passcode on the scheduled date.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://vigyanprep.com/tests"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider hover:scale-105 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <span>Explore All Test Passes</span>
              <ArrowRight size={14} />
            </a>
            <a
              href="https://vigyanprep.com/pyq"
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition flex items-center gap-2"
            >
              <BookOpen size={14} className="text-amber-400" />
              <span>Browse PYQ Library</span>
            </a>
          </div>
        </div>

        {/* Available Tests Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="text-amber-400" /> Scheduled Test Papers & Mocks
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">Attempt test papers on their scheduled date using your exam passcode.</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2">
              {(['ALL', 'IAT', 'NEST', 'CMI'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                    activeCategory === cat
                      ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                      : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Papers' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-[#141009] border border-amber-500/20 rounded-3xl">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-neutral-400 font-mono">Loading Scheduled Test Papers...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16 bg-[#141009] border border-white/10 rounded-3xl text-neutral-400 space-y-3">
              <p className="text-sm">No tests found under category <strong>{activeCategory}</strong>.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((paper) => {
                const examCat = paper.exam_type || paper.examType || 'IAT';
                const yearVal = paper.pyq_year || paper.year || '2025';
                const duration = paper.duration_minutes || paper.duration || 180;
                const totalQ = paper.total_questions || paper.questions_count || 60;
                const totalMarks = totalQ * 4;
                const windowStatus = getWindowStatus(paper);

                return (
                  <div
                    key={paper.id}
                    className={`bg-[#15110a] border rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl group ${
                      windowStatus.isLive ? 'border-amber-500/30 hover:border-amber-400' : 'border-white/10 opacity-80'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          {examCat}
                        </span>
                        <span className="font-serif font-bold text-amber-300 text-sm">
                          {yearVal}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl font-bold text-white group-hover:text-amber-200 transition">
                        {paper.title}
                      </h4>

                      {/* Schedule Window Status Badge */}
                      <div className="text-[11px] font-semibold flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider ${
                          windowStatus.color === 'emerald'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : windowStatus.color === 'amber'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                          {windowStatus.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-300 py-3 border-y border-white/5 font-mono">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-neutral-500">Questions</span>
                          <span className="font-bold text-white">{totalQ} Qs</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-neutral-500">Duration</span>
                          <span className="font-bold text-white">{duration} Mins</span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-neutral-500">Total Marks</span>
                          <span className="font-bold text-amber-400">{totalMarks} M</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => handleTestClick(paper)}
                        disabled={!windowStatus.isLive}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                          windowStatus.isLive
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:opacity-95 shadow-amber-500/20'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                        }`}
                      >
                        {windowStatus.isLive ? <PlayCircle size={16} /> : <Lock size={16} />}
                        <span>{windowStatus.isLive ? 'Start CBT Test' : 'Test Window Closed'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Support Bar */}
        <div className="p-6 rounded-2xl bg-[#141009] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-amber-400" size={18} />
            <span>Official CBT Test Engine &middot; Real Exam Environment &middot; Passcode Protected Entry</span>
          </div>
          <a href="mailto:support@vigyanprep.com" className="text-amber-400 hover:underline flex items-center gap-1">
            <HelpCircle size={14} /> Need Help? Contact Student Support
          </a>
        </div>

      </main>

      {/* 4-6 DIGIT EXAM PASSCODE / ACCESS KEY MODAL */}
      {showPasscodeModal && selectedTestForPasscode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#15120d] border border-amber-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowPasscodeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
              <Key size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">Enter Exam Passcode</h3>
              <p className="text-xs text-amber-300 font-semibold">{selectedTestForPasscode.title}</p>
              <p className="text-xs text-neutral-400 pt-1">
                Enter your 4-6 digit test passcode or hall ticket key to enter the proctored exam window.
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={12}
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  placeholder="e.g. 849201 or EXAM-KEY"
                  className="w-full bg-neutral-950 border border-amber-500/30 rounded-xl px-4 py-3 text-center font-mono text-lg text-amber-300 tracking-widest uppercase focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="py-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  Verify & Enter →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
