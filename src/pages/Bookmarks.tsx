// ============================================================================
// BOOKMARKS PAGE — View & manage saved questions
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, ArrowLeft, Search, Trash2, ChevronDown,
  BookOpen, Filter
} from 'lucide-react';
import { useAdaptiveStore, type BookmarkItem } from '../stores/adaptiveStore';
import { MathText } from '../components/MathText';

export function Bookmarks() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  const {
    bookmarks, loadingBookmarks,
    fetchBookmarks, toggleBookmark
  } = useAdaptiveStore();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Get unique subjects from bookmarks
  const subjects = Array.from(new Set(bookmarks.map(b => b.subject).filter(Boolean)));

  // Filter bookmarks
  const filtered = bookmarks.filter(b => {
    if (filterSubject && b.subject !== filterSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.questionText.toLowerCase().includes(q) ||
        b.subTopic.toLowerCase().includes(q) ||
        b.chapterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by chapter
  const grouped: Record<string, BookmarkItem[]> = {};
  for (const b of filtered) {
    const key = `${b.subject} › ${b.chapterName}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(b);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100 text-gray-900 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/80 px-4 sm:px-8 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bookmark size={20} className="text-amber-500" />
                <span>Bookmarked Questions</span>
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                {bookmarks.length} saved question{bookmarks.length !== 1 ? 's' : ''} for review
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-5">

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition shadow-sm"
            />
          </div>

          {subjects.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilterSubject(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  !filterSubject ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >All</button>
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSubject(filterSubject === s ? null : s)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    filterSubject === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loadingBookmarks && (
          <div className="text-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500">Loading bookmarks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loadingBookmarks && bookmarks.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 flex items-center justify-center">
              <Bookmark size={36} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-700">No Bookmarks Yet</h3>
              <p className="text-sm text-gray-400 mt-1">
                Tap the bookmark icon on any question during a test or in the diagnosis report to save it here.
              </p>
            </div>
            <button
              onClick={() => navigate('/adaptive-revision')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm cursor-pointer hover:opacity-90 transition inline-flex items-center gap-2"
            >
              <BookOpen size={16} />
              <span>Start Practicing</span>
            </button>
          </div>
        )}

        {/* No results for filter */}
        {!loadingBookmarks && bookmarks.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <Filter size={36} className="text-gray-300 mx-auto" />
            <p className="text-gray-500 font-medium">No bookmarks match your filters</p>
            <button onClick={() => { setSearchQuery(''); setFilterSubject(null); }} className="text-amber-600 text-sm font-bold cursor-pointer hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* Bookmarked Questions — Grouped by Chapter */}
        {Object.entries(grouped).map(([groupKey, items]) => (
          <div key={groupKey} className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 pt-2">
              <BookOpen size={14} />
              <span>{groupKey}</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-mono text-[10px]">{items.length}</span>
            </h3>

            {items.map((b) => {
              const isExpanded = expandedId === b.id;

              return (
                <div
                  key={b.id}
                  className="rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-sm transition"
                >
                  {/* Question Header */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Bookmark size={16} className="text-amber-500 shrink-0 mt-0.5" fill="currentColor" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                          <MathText text={b.questionText.substring(0, 120) + (b.questionText.length > 120 ? '...' : '')} />
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">{b.subTopic} · {b.difficulty}</p>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-gray-300 transition shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">

                      {/* Full Question */}
                      <div className="text-sm text-gray-900 leading-relaxed">
                        <MathText text={b.questionText} />
                      </div>

                      {/* Options with Correct Highlighted */}
                      <div className="space-y-2">
                        {b.options?.map((opt: string, i: number) => {
                          const label = String.fromCharCode(65 + i);
                          const isCorrect = b.correctAnswer === label;
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-xl border flex items-start gap-3 text-sm ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-gray-50 border-gray-100 text-gray-700'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                              }`}>{label}</span>
                              <div className="pt-0.5"><MathText text={opt} /></div>
                              {isCorrect && <span className="text-[9px] uppercase font-bold text-emerald-600 shrink-0 mt-1">✓ Correct</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {b.explanation && (
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">💡 Solution</p>
                          <div className="text-sm text-blue-900 leading-relaxed">
                            <MathText text={b.explanation} />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => toggleBookmark({
                            questionId: b.questionId,
                            questionText: b.questionText,
                            options: b.options,
                            correctAnswer: b.correctAnswer,
                            explanation: b.explanation,
                            subTopic: b.subTopic,
                            chapterName: b.chapterName,
                            subject: b.subject,
                            examType: b.examType,
                            difficulty: b.difficulty,
                          })}
                          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-red-200"
                        >
                          <Trash2 size={13} />
                          <span>Remove Bookmark</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
}

export default Bookmarks;
