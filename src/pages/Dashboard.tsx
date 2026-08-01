import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, PlayCircle, Lock, Key,
  BookOpen, Sparkles, LogOut, ArrowRight, ShieldCheck, HelpCircle, RefreshCw, X, AlertCircle, CheckCircle2
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
  const [studentName, setStudentName] = useState('Student');
  const [studentEmail, setStudentEmail] = useState('');

  // Passcode Modal States
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedTestForPasscode, setSelectedTestForPasscode] = useState<TestPaper | null>(null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  useEffect(() => {
    // 🛡️ Read shared subdomain cookie and sync to local storage
    const token = getCookie('student_token') || localStorage.getItem('student_token');
    const name = getCookie('student_name') || localStorage.getItem('student_name') || localStorage.getItem('full_name') || 'Student';
    const email = getCookie('student_email') || localStorage.getItem('student_email') || localStorage.getItem('email') || '';

    if (!token) {
      // Direct unauthenticated student to Login Portal immediately
      window.location.href = 'https://auth.vigyanprep.com';
      return;
    }

    // Sync variables to local storage
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

  // Filter papers by Tab (Test Series vs PYQ) & Exam Category
  const testSeriesPapers = tests.filter(t => t.content_type === 'test_series' || t.content_type !== 'pyq');
  const pyqPapers = tests.filter(t => t.content_type === 'pyq');

  const activePapersList = activeTab === 'TEST_SERIES' ? testSeriesPapers : pyqPapers;

  const filteredTests = activePapersList.filter(t => {
    if (activeCategory === 'ALL') return true;
    const cat = (t.exam_type || t.examType || '').toUpperCase();
    return cat.includes(activeCategory);
  });

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#f2ead8] font-sans selection:bg-amber-500 selection:text-black">
      {/* Hand-Drawn Blueprint Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#fcd34d_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      {/* Top Navbar */}
      <nav className="relative z-10 border-b border-amber-500/20 bg-[#120e08]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
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
            <Award size={14} /> IISER & NEST Subscription Active
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
        
        {/* Academic Hero Panel with Handcrafted Technical Science Sketches */}
        <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#1c150c] via-[#16110a] to-[#110e08] border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Handcrafted Technical Science Sketches Overlay */}
          <div className="absolute right-4 top-4 opacity-15 pointer-events-none hidden lg:flex gap-6">
            <RayOpticsSketch className="w-32 h-32 text-amber-400" />
            <BenzeneOrbitalSketch className="w-32 h-32 text-orange-400" />
            <CalculusIntegralSketch className="w-32 h-32 text-amber-300" />
            <DNAHelixSketch className="w-32 h-32 text-emerald-400" />
          </div>

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/30">
              <Sparkles size={13} /> Official Student Control Center
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Welcome Back, <span className="text-amber-300">{studentName}</span>
            </h2>
            <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
              Access your subscribed scheduled CBT mock test series below or practice past IISER IAT, NISER NEST, and CMI archives.
            </p>

            {/* Locked Immutable Student Profile Badge */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400 bg-black/50 px-3.5 py-1.5 rounded-xl border border-amber-500/25 w-fit shadow-inner">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Official Identity: <strong className="text-white">{studentName}</strong> ({studentEmail})</span>
              <span className="text-amber-400/80 ml-2 font-mono text-[10px] uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">🔒 Immutable Profile</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 relative z-10">
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

        {/* Section Switcher Tabs: Subscribed Test Series vs PYQs */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            
            {/* Primary Section Switcher Pills */}
            <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10 w-fit">
              <button
                onClick={() => setActiveTab('TEST_SERIES')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
                  activeTab === 'TEST_SERIES'
                    ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Award size={15} />
                <span>Subscribed CBT Test Series ({testSeriesPapers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('PYQ')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
                  activeTab === 'PYQ'
                    ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <BookOpen size={15} />
                <span>Free Practice PYQs ({pyqPapers.length})</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2">
              {(['ALL', 'IAT', 'NEST', 'CMI'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                    activeCategory === cat
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                      : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Exams' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-[#141009] border border-amber-500/20 rounded-3xl">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-neutral-400 font-mono">Loading Examination Papers...</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-[#141009]/80 border border-amber-500/20 rounded-3xl space-y-4">
              {activeTab === 'TEST_SERIES' ? (
                <RayOpticsSketch className="w-20 h-20 mx-auto text-amber-400/40" />
              ) : (
                <BenzeneOrbitalSketch className="w-20 h-20 mx-auto text-orange-400/40" />
              )}
              <h4 className="font-serif text-xl font-bold text-white">
                {activeTab === 'TEST_SERIES' ? 'No Upcoming Test Series Scheduled' : 'No Free PYQ Papers Found'}
              </h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {activeTab === 'TEST_SERIES'
                  ? 'Your subscribed test series papers will appear here on their scheduled exam dates. You can also explore available passes on the website.'
                  : 'Check back soon for newly published past year question papers.'}
              </p>
              {activeTab === 'TEST_SERIES' && (
                <a
                  href="https://vigyanprep.com/tests"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition"
                >
                  <span>Browse Test Series Passes</span>
                  <ArrowRight size={14} />
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((paper) => {
                const status = getWindowStatus(paper);
                const examCat = (paper.exam_type || paper.examType || 'IAT').toUpperCase();

                return (
                  <div
                    key={paper.id}
                    className="relative overflow-hidden rounded-2xl bg-[#141009] border border-amber-500/20 hover:border-amber-400/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl group"
                  >
                    {/* Hand-Drawn Science Sketch Background Accent */}
                    <div className="absolute right-2 top-2 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                      {examCat.includes('IAT') && <RayOpticsSketch className="w-24 h-24 text-amber-400" />}
                      {examCat.includes('NEST') && <BenzeneOrbitalSketch className="w-24 h-24 text-orange-400" />}
                      {examCat.includes('CMI') && <CalculusIntegralSketch className="w-24 h-24 text-amber-300" />}
                      {!['IAT', 'NEST', 'CMI'].some(k => examCat.includes(k)) && <DNAHelixSketch className="w-24 h-24 text-emerald-400" />}
                    </div>

                    <div className="space-y-4 relative z-10">
                      {/* Badge Row */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          {examCat}
                        </span>
                        <span className="font-serif italic text-xs text-neutral-400">
                          {paper.pyq_year || paper.year || '2025'}
                        </span>
                      </div>

                      {/* Paper Title */}
                      <h4 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                        {paper.title}
                      </h4>

                      {/* Live Window Schedule Pill */}
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                        status.color === 'emerald'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : status.color === 'amber'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        <span>{status.label}</span>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
                        <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                          <p className="text-[10px] text-neutral-400 uppercase">Questions</p>
                          <p className="font-bold text-white">{paper.questions_count || 60} Qs</p>
                        </div>
                        <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                          <p className="text-[10px] text-neutral-400 uppercase">Duration</p>
                          <p className="font-bold text-white">{paper.duration_minutes || 180} Mins</p>
                        </div>
                        <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                          <p className="text-[10px] text-neutral-400 uppercase">Total Marks</p>
                          <p className="font-bold text-amber-300">{paper.total_marks || 240} M</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-6 relative z-10">
                      <button
                        onClick={() => handleTestClick(paper)}
                        disabled={!status.isLive}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                          status.isLive
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 hover:opacity-95 shadow-lg shadow-amber-500/20 cursor-pointer'
                            : 'bg-neutral-800 text-neutral-500 border border-white/10 cursor-not-allowed'
                        }`}
                      >
                        {status.isLive ? <PlayCircle size={16} /> : <Lock size={16} />}
                        <span>{status.isLive ? 'Start CBT Test' : 'Test Window Closed'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footnote Notice */}
        <div className="p-4 rounded-2xl bg-[#141009] border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Official CBT Test Engine · Real Exam Environment · Passcode Protected Entry</span>
          </div>
          <a href="https://vigyanprep.com/about" className="text-amber-300 hover:underline flex items-center gap-1">
            <HelpCircle size={14} /> Need Help? Contact Student Support
          </a>
        </div>

      </main>

      {/* 4-6 Digit Passcode Entry Modal */}
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
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Verify Passcode & Enter Exam</span>
              </button>
            </form>

            <p className="text-[10px] text-neutral-500 text-center">
              Your passcode is issued by the administrator for scheduled exam dates.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
