import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Play, Pause, Volume2, Search, Bookmark, BookmarkCheck, 
  ArrowRight, ArrowLeft, Share2, Copy, Check, Info, Sparkles, 
  ChevronDown, ChevronUp, Type, ExternalLink, X, RotateCcw,
  SlidersHorizontal, CheckCircle2, Eye, Compass, Maximize2, Minimize2,
  Sun, Moon, Palette, Target
} from 'lucide-react';
import { ThemeColor, NumberFormat, QuranVerse, QuranBookmark, QuranKhatmah } from '../types';
import { THEMES, QURRA, formatDigits } from '../constants';
import { QURAN_CHAPTERS, ChapterMeta, getChapterByPage } from '../data/quranChapters';
import { getChapterVerses, getChapterAudio, getAyahTafsir } from '../services/quranService';
import AppLoader from './AppLoader';
import QuranKhatmahWidget from './QuranKhatmahWidget';
import QuranChartsWidget from './QuranChartsWidget';

interface QuranProps {
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
  onFocusModeChange?: (isFocus: boolean) => void;
}

type ViewMode = 'page' | 'list';
type FilterType = 'all' | 'makkah' | 'madinah' | 'bookmarked';
type FocusTone = 'mushaf' | 'dark' | 'sepia';

export const Quran: React.FC<QuranProps> = ({ theme, numberFormat = 'arabic', onFocusModeChange }) => {
  const activeNumberFormat = (numberFormat || 'arabic') as NumberFormat;
  const currentTheme = THEMES[theme] || THEMES.green;
  const isDark = theme === 'dark';

  // State
  const [selectedChapter, setSelectedChapter] = useState<ChapterMeta | null>(null);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Reading Preferences
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quran_font_size');
      return saved ? parseInt(saved, 10) : 26;
    } catch {
      return 26;
    }
  });

  // وضع القراءة المركز (Reading Focus Mode)
  const [isReadingFocusMode, setIsReadingFocusMode] = useState(false);
  const [focusTone, setFocusTone] = useState<FocusTone>(() => {
    try {
      const saved = localStorage.getItem('quran_focus_tone') as FocusTone;
      return saved || (isDark ? 'dark' : 'mushaf');
    } catch {
      return isDark ? 'dark' : 'mushaf';
    }
  });
  const [readingFontSize, setReadingFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quran_reading_font_size');
      return saved ? parseInt(saved, 10) : 34;
    } catch {
      return 34;
    }
  });

  // Tafsir
  const [activeTafsirKey, setActiveTafsirKey] = useState<string | null>(null);
  const [tafsirContent, setTafsirContent] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);

  // Bookmark / Last Read
  const [lastBookmark, setLastBookmark] = useState<QuranBookmark | null>(() => {
    try {
      const saved = localStorage.getItem('quran_last_read_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // الختمة القرآنية (Khatmah State)
  const [khatmah, setKhatmah] = useState<QuranKhatmah | null>(() => {
    try {
      const saved = localStorage.getItem('quran_khatmah_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleUpdateKhatmah = (updated: QuranKhatmah | null) => {
    setKhatmah(updated);
    try {
      if (updated) {
        localStorage.setItem('quran_khatmah_v1', JSON.stringify(updated));
      } else {
        localStorage.removeItem('quran_khatmah_v1');
      }
    } catch {}
  };

  const handleOpenSurahPage = (pageNum: number) => {
    const chapter = getChapterByPage(pageNum);
    if (chapter) {
      setSelectedChapter(chapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Audio Playback
  const [selectedReciterId, setSelectedReciterId] = useState<number>(7); // مشاري راشد العفاسي
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleFontSizeChange = (delta: number) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 18), 44);
      localStorage.setItem('quran_font_size', next.toString());
      return next;
    });
  };

  const handleReadingFontSizeChange = (delta: number) => {
    setReadingFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 24), 56);
      localStorage.setItem('quran_reading_font_size', next.toString());
      return next;
    });
  };

  const handleToneChange = (tone: FocusTone) => {
    setFocusTone(tone);
    try {
      localStorage.setItem('quran_focus_tone', tone);
    } catch {}
  };

  const toggleReadingFocusMode = (chapter?: ChapterMeta) => {
    if (chapter) {
      setSelectedChapter(chapter);
    }
    setIsReadingFocusMode(prev => {
      const next = !prev;
      if (next) {
        showToast('تم تفعيل وضع القراءة: تكبير الخط وإخفاء المشتتات 📖');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('تم إنهاء وضع القراءة');
      }
      return next;
    });
  };

  // Sync focus mode with parent App (to hide navigation and coin counter)
  useEffect(() => {
    onFocusModeChange?.(isReadingFocusMode);
  }, [isReadingFocusMode, onFocusModeChange]);

  useEffect(() => {
    return () => {
      onFocusModeChange?.(false);
    };
  }, [onFocusModeChange]);

  // Escape key exits focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isReadingFocusMode) {
        setIsReadingFocusMode(false);
        showToast('تم إنهاء وضع القراءة');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingFocusMode]);

  const toneStyles = useMemo(() => {
    switch (focusTone) {
      case 'dark':
        return {
          container: 'bg-[#0d0e12] text-[#f4f4f5]',
          card: 'bg-[#15171e] border-zinc-800',
          header: 'bg-[#0d0e12]/95 border-zinc-800/80 text-zinc-100',
          ayahMarker: 'text-amber-400',
          bismillah: 'text-amber-300',
          activeChip: 'bg-amber-400 text-zinc-950 font-black shadow-md',
          inactiveChip: 'bg-zinc-800 text-zinc-300 hover:text-white',
          footer: 'bg-zinc-900/90 border-zinc-800'
        };
      case 'sepia':
        return {
          container: 'bg-[#f4ebd9] text-[#3d3326]',
          card: 'bg-[#ebdec8] border-[#ded0b6]',
          header: 'bg-[#f4ebd9]/95 border-[#ded0b6] text-[#3d3326]',
          ayahMarker: 'text-[#8c5a27]',
          bismillah: 'text-[#68411b]',
          activeChip: 'bg-[#8c5a27] text-white font-black shadow-md',
          inactiveChip: 'bg-[#e5d8be] text-[#4d4233] hover:bg-[#dbccaf]',
          footer: 'bg-[#ede2cb] border-[#ded0b6]'
        };
      case 'mushaf':
      default:
        return {
          container: 'bg-[#fdfbf6] text-[#1c1914]',
          card: 'bg-[#f6eee2] border-[#e8ddcb]',
          header: 'bg-[#fdfbf6]/95 border-[#e8ddcb] text-[#1c1914]',
          ayahMarker: 'text-[#b3782b]',
          bismillah: 'text-[#875518]',
          activeChip: 'bg-[#b3782b] text-white font-black shadow-md',
          inactiveChip: 'bg-[#eee4d2] text-[#3c362d] hover:bg-[#e4d8c2]',
          footer: 'bg-[#f7efe3] border-[#e8ddcb]'
        };
    }
  }, [focusTone]);

  // تحميل آيات السورة عند اختيارها
  useEffect(() => {
    if (!selectedChapter) {
      setVerses([]);
      setIsPlaying(false);
      setAudioUrl(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    let isMounted = true;
    setLoadingVerses(true);
    setErrorMsg(null);

    getChapterVerses(selectedChapter.id)
      .then(fetchedVerses => {
        if (isMounted) {
          setVerses(fetchedVerses);
          setLoadingVerses(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch(err => {
        if (isMounted) {
          setErrorMsg(err.message || 'فشل تحميل الآيات');
          setLoadingVerses(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedChapter]);

  // إدارة الصوت
  const handleToggleAudio = async () => {
    if (!selectedChapter) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setAudioLoading(true);
    const url = await getChapterAudio(selectedReciterId, selectedChapter.id);
    setAudioLoading(false);

    if (url) {
      setAudioUrl(url);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 100);
    } else {
      showToast('التلاوة غير متاحة حالياً لهذا القارئ');
    }
  };

  // تغيير القارئ
  const handleReciterChange = async (reciterId: number) => {
    setSelectedReciterId(reciterId);
    setIsAudioMenuOpen(false);
    if (!selectedChapter) return;

    setAudioLoading(true);
    const url = await getChapterAudio(reciterId, selectedChapter.id);
    setAudioLoading(false);
    if (url) {
      setAudioUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  // حفظ الإشارة المرجعية
  const handleSaveBookmark = (verse: QuranVerse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedChapter) return;

    const verseNum = parseInt(verse.verse_key.split(':')[1], 10);
    const bookmark: QuranBookmark = {
      chapterId: selectedChapter.id,
      chapterName: selectedChapter.name_arabic,
      verseNumber: verseNum,
      verseKey: verse.verse_key,
      textSnippet: verse.text_uthmani.slice(0, 50) + '...',
      timestamp: Date.now()
    };

    setLastBookmark(bookmark);
    localStorage.setItem('quran_last_read_v1', JSON.stringify(bookmark));
    showToast(`تم حفظ الآية ${formatDigits(verseNum, activeNumberFormat)} كعلامة قراءة 🔖`);
    if ('vibrate' in navigator) navigator.vibrate(25);
  };

  // الانتقال للعلامة المرجعية
  const handleJumpToBookmark = () => {
    if (!lastBookmark) return;
    const targetChapter = QURAN_CHAPTERS.find(c => c.id === lastBookmark.chapterId);
    if (targetChapter) {
      setSelectedChapter(targetChapter);
      setViewMode('list');
      setTimeout(() => {
        const el = document.getElementById(`ayah-${lastBookmark.verseKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 800);
    }
  };

  // عرض التفسير
  const handleToggleTafsir = async (verseKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTafsirKey === verseKey) {
      setActiveTafsirKey(null);
      setTafsirContent(null);
      return;
    }

    setActiveTafsirKey(verseKey);
    setLoadingTafsir(true);
    setTafsirContent(null);

    const text = await getAyahTafsir(verseKey);
    setLoadingTafsir(false);
    setTafsirContent(text || 'التفسير غير متوفر لهذه الآية حالياً.');
  };

  // نسخ الآية
  const handleCopyAyah = (verse: QuranVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedChapter) return;
    const verseNum = verse.verse_key.split(':')[1];
    const textToCopy = `﴿${verse.text_uthmani}﴾ [سورة ${selectedChapter.name_arabic}: ${formatDigits(verseNum, activeNumberFormat)}]\nالمصدر: Quran.com`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(verse.verse_key);
    showToast('تم نسخ الآية بالرسم العثماني');
    setTimeout(() => setCopiedKey(null), 2000);
    if ('vibrate' in navigator) navigator.vibrate(15);
  };

  // مشاركة الآية
  const handleShareAyah = async (verse: QuranVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedChapter) return;
    const verseNum = verse.verse_key.split(':')[1];
    const shareText = `﴿${verse.text_uthmani}﴾ [سورة ${selectedChapter.name_arabic}: ${formatDigits(verseNum, activeNumberFormat)}]`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${selectedChapter.name_arabic} - آية ${verseNum}`,
          text: shareText
        });
      } catch (err) {}
    } else {
      handleCopyAyah(verse, e);
    }
  };

  // قائمة السور المفلترة
  const filteredChapters = useMemo(() => {
    return QURAN_CHAPTERS.filter(ch => {
      if (filterType === 'makkah' && ch.revelation_place !== 'makkah') return false;
      if (filterType === 'madinah' && ch.revelation_place !== 'madinah') return false;
      if (filterType === 'bookmarked') {
        if (!lastBookmark || lastBookmark.chapterId !== ch.id) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim();
        const matchesName = ch.name_arabic.includes(query);
        const matchesSimple = ch.name_simple.toLowerCase().includes(query.toLowerCase());
        const matchesNum = ch.id.toString() === query;
        return matchesName || matchesSimple || matchesNum;
      }

      return true;
    });
  }, [searchQuery, filterType, lastBookmark]);

  const activeReciter = QURRA.find(r => r.id === selectedReciterId) || QURRA[0];

  return (
    <div className="space-y-8 pb-36 max-w-4xl mx-auto px-2">
      {/* مشغل الصوت الخفي */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setAudioProgress(audioRef.current.currentTime);
            setAudioDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setAudioProgress(0);
        }}
        onError={() => {
          setIsPlaying(false);
          setAudioLoading(false);
        }}
      />

      {/* تنبيه سريع عائم (Toast) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full font-black text-sm shadow-2xl backdrop-blur-md flex items-center gap-2 ${
              isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة وضع القراءة والتركيز الكامل (Focus Reading Mode) */}
      <AnimatePresence>
        {isReadingFocusMode && selectedChapter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[120] overflow-y-auto ${toneStyles.container} select-text`}
          >
            {/* شريط التحكم الهادئ العائم لوضع القراءة */}
            <header className={`sticky top-0 z-50 px-4 md:px-8 py-3.5 backdrop-blur-xl border-b transition-colors shadow-sm ${toneStyles.header}`}>
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleReadingFocusMode()}
                    className="p-2.5 rounded-2xl transition-all active:scale-95 flex items-center gap-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 font-black text-xs"
                    title="الخروج من وضع القراءة (أو اضغط Esc)"
                  >
                    <Minimize2 size={16} />
                    <span className="hidden sm:inline">إنهاء وضع القراءة</span>
                  </button>

                  <div>
                    <h3 className="text-base md:text-lg font-black font-arabic leading-none">
                      سورة {selectedChapter.name_arabic}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold opacity-60">
                        {selectedChapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} • {formatDigits(selectedChapter.verses_count, activeNumberFormat)} آية • صـ {formatDigits(selectedChapter.pages[0], activeNumberFormat)}
                      </p>
                      {khatmah && (
                        <button
                          onClick={() => {
                            const pageToRecord = selectedChapter.pages[0];
                            handleUpdateKhatmah({
                              ...khatmah,
                              currentPage: pageToRecord,
                              lastUpdated: Date.now(),
                              completed: pageToRecord >= 604,
                              completedAt: pageToRecord >= 604 ? Date.now() : undefined
                            });
                            showToast(`تم تسجيل صـ ${formatDigits(pageToRecord, activeNumberFormat)} في ختمتك 📖`);
                          }}
                          className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-lg transition-all ${
                            khatmah.currentPage === selectedChapter.pages[0] ? toneStyles.activeChip : toneStyles.inactiveChip
                          }`}
                          title="تسجيل هذه الصفحة في الختمة"
                        >
                          <Target size={10} />
                          <span>{khatmah.currentPage === selectedChapter.pages[0] ? 'موضع ختمتك' : 'تسجيل بالختمة'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* أدوات التحكم في وضع القراءة: تغيير حجم الخط وخلفية الورق */}
                <div className="flex items-center gap-2 md:gap-3">
                  {/* تغيير مظهر الورق */}
                  <div className="flex items-center p-1 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 gap-1">
                    <button
                      onClick={() => handleToneChange('mushaf')}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                        focusTone === 'mushaf' ? toneStyles.activeChip : 'opacity-60 hover:opacity-100'
                      }`}
                      title="ورق المصحف الدافئ"
                    >
                      مصحف
                    </button>
                    <button
                      onClick={() => handleToneChange('dark')}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                        focusTone === 'dark' ? toneStyles.activeChip : 'opacity-60 hover:opacity-100'
                      }`}
                      title="الوضع الليلي الهادئ"
                    >
                      ليلي
                    </button>
                    <button
                      onClick={() => handleToneChange('sepia')}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all ${
                        focusTone === 'sepia' ? toneStyles.activeChip : 'opacity-60 hover:opacity-100'
                      }`}
                      title="ورق كلاسيكي هادئ"
                    >
                      هادئ
                    </button>
                  </div>

                  {/* تكبير وتصغير الخط */}
                  <div className="flex items-center border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5">
                    <button
                      onClick={() => handleReadingFontSizeChange(-2)}
                      className="px-3 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-black"
                      title="تصغير خط القراءة"
                    >
                      A-
                    </button>
                    <span className="text-[11px] font-bold px-2 opacity-70">
                      {readingFontSize}
                    </span>
                    <button
                      onClick={() => handleReadingFontSizeChange(2)}
                      className="px-3 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-black"
                      title="تكبير خط القراءة"
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* مساحة القراءة الخاشعة المتصلة الخالية تماماً من المشتتات */}
            <main className="max-w-4xl mx-auto px-5 md:px-12 py-10 md:py-16 space-y-12">
              {/* البسملة المباركة */}
              {selectedChapter.id !== 9 && selectedChapter.id !== 1 && (
                <div className="py-6 text-center select-none">
                  <p className={`font-quran text-3xl md:text-5xl tracking-wide ${toneStyles.bismillah}`}>
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              {/* متن السورة المباركة بالرسم العثماني الأصلي والخط المكبر */}
              <div 
                className="font-quran text-justify font-normal select-text transition-all"
                style={{ 
                  fontSize: `${readingFontSize}px`, 
                  lineHeight: `${Math.max(readingFontSize * 2.45, 68)}px`,
                  wordSpacing: '0.12em'
                }}
              >
                {verses.map((verse) => {
                  const verseNum = verse.verse_key.split(':')[1];
                  const isBookmarked = lastBookmark?.verseKey === verse.verse_key;

                  return (
                    <span 
                      key={verse.id} 
                      id={`focus-ayah-${verse.verse_key}`}
                      onClick={() => handleSaveBookmark(verse)}
                      title="اضغط لحفظ موضع القراءة"
                      className={`inline cursor-pointer transition-all rounded px-1 ${
                        isBookmarked 
                          ? 'bg-amber-400/25 ring-2 ring-amber-400/40' 
                          : 'hover:opacity-75'
                      }`}
                    >
                      {verse.text_uthmani}{' '}
                      <span className={`inline-flex items-center justify-center font-arabic px-1 text-[0.8em] font-black ${toneStyles.ayahMarker}`}>
                        ﴿{formatDigits(verseNum, activeNumberFormat)}﴾
                      </span>{' '}
                    </span>
                  );
                })}
              </div>

              {/* نهاية السورة وشريط الانتقال للسورة التالية/السابقة */}
              <div className={`mt-16 pt-8 border-t border-dashed border-black/10 dark:border-white/10 flex items-center justify-between gap-4 flex-wrap`}>
                {selectedChapter.id > 1 ? (
                  <button
                    onClick={() => {
                      const prev = QURAN_CHAPTERS.find(c => c.id === selectedChapter.id - 1);
                      if (prev) {
                        setSelectedChapter(prev);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${toneStyles.inactiveChip}`}
                  >
                    <ArrowRight size={16} />
                    <span>السورة السابقة: {QURAN_CHAPTERS.find(c => c.id === selectedChapter.id - 1)?.name_arabic}</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => toggleReadingFocusMode()}
                  className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${toneStyles.activeChip}`}
                >
                  <Minimize2 size={16} />
                  <span>الرجوع للوضع العادي</span>
                </button>

                {selectedChapter.id < 114 ? (
                  <button
                    onClick={() => {
                      const next = QURAN_CHAPTERS.find(c => c.id === selectedChapter.id + 1);
                      if (next) {
                        setSelectedChapter(next);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${toneStyles.inactiveChip}`}
                  >
                    <span>السورة التالية: {QURAN_CHAPTERS.find(c => c.id === selectedChapter.id + 1)?.name_arabic}</span>
                    <ArrowLeft size={16} />
                  </button>
                ) : <div />}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الحالة 1: عرض فهرس السور (Chapter Index) */}
      {!selectedChapter ? (
        <div className="space-y-8">
          {/* ترويسة القرآن الكريم ورابط المصدر */}
          <div className={`p-8 md:p-10 rounded-[3rem] border relative overflow-hidden shadow-sm ${
            isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-emerald-50'
          }`}>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <Sparkles size={14} />
                  <span>المصحف الشريف بالرسم العثماني المعتمد</span>
                </div>

                <a
                  href="https://quran.com/ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-opacity hover:opacity-100 ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <span>مصدر الآيات: Quran.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div>
                <h2 className={`text-3xl md:text-5xl font-black font-arabic ${currentTheme.textMain}`}>
                  القرآن الكريم
                </h2>
                <p className={`text-sm md:text-base leading-relaxed mt-2 ${currentTheme.textMuted} font-medium max-w-xl`}>
                  قراءة واستماع لجميع سور القرآن الكريم بالنص العثماني الكامل والمطابق لمصحف مجمع الملك فهد، مع التفسير الميسر والتلاوة العطرة.
                </p>
              </div>

              {/* بطاقة متابعة القراءة السريعة */}
              {lastBookmark && (
                <div 
                  onClick={handleJumpToBookmark}
                  className={`p-5 rounded-2xl border cursor-pointer flex items-center justify-between gap-4 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    isDark ? 'bg-amber-400/10 border-amber-400/30 text-amber-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}>
                      <BookmarkCheck size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">
                        متابعة القراءة من حيث توقفت
                      </span>
                      <h4 className="text-base font-black">
                        سورة {lastBookmark.chapterName} — الآية {formatDigits(lastBookmark.verseNumber, activeNumberFormat)}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-black shrink-0 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10">
                    متابعة ←
                  </span>
                </div>
              )}
            </div>

            <div className="absolute -bottom-8 -left-8 opacity-5 pointer-events-none">
              <BookOpen size={220} />
            </div>
          </div>

          {/* قسم الختمة القرآنية */}
          <QuranKhatmahWidget
            theme={theme}
            numberFormat={activeNumberFormat}
            khatmah={khatmah}
            onUpdateKhatmah={handleUpdateKhatmah}
            onOpenSurahPage={handleOpenSurahPage}
            showToast={showToast}
          />

          {/* رسوم بيانية تفاعلية لتقدم الختمة والتقرير الأسبوعي */}
          <QuranChartsWidget
            theme={theme}
            numberFormat={activeNumberFormat}
            khatmah={khatmah}
          />

          {/* شريط البحث والفلاتر */}
          <div className="space-y-4">
            <div className={`relative flex items-center rounded-2xl border transition-all ${
              isDark ? 'bg-zinc-900 border-zinc-800 focus-within:border-amber-400' : 'bg-white border-gray-200 focus-within:border-emerald-500 shadow-sm'
            }`}>
              <Search size={20} className="mr-4 ml-2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم السورة (مثل: الكهف، يس، الملك) أو رقمها..."
                className="w-full py-4 px-2 bg-transparent outline-none font-medium text-sm md:text-base placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-2 ml-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* أزرار الفلترة */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  filterType === 'all'
                    ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-md' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                    : (isDark ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 'bg-white text-zinc-600 border border-gray-200 shadow-sm')
                }`}
              >
                جميع السور (114)
              </button>

              <button
                onClick={() => setFilterType('makkah')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  filterType === 'makkah'
                    ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-md' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                    : (isDark ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 'bg-white text-zinc-600 border border-gray-200 shadow-sm')
                }`}
              >
                السور المكية ({formatDigits(QURAN_CHAPTERS.filter(c => c.revelation_place === 'makkah').length, activeNumberFormat)})
              </button>

              <button
                onClick={() => setFilterType('madinah')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  filterType === 'madinah'
                    ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-md' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                    : (isDark ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 'bg-white text-zinc-600 border border-gray-200 shadow-sm')
                }`}
              >
                السور المدنية ({formatDigits(QURAN_CHAPTERS.filter(c => c.revelation_place === 'madinah').length, activeNumberFormat)})
              </button>

              {lastBookmark && (
                <button
                  onClick={() => setFilterType('bookmarked')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    filterType === 'bookmarked'
                      ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-md' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                      : (isDark ? 'bg-zinc-900 text-zinc-400 border border-zinc-800' : 'bg-white text-zinc-600 border border-gray-200 shadow-sm')
                  }`}
                >
                  <Bookmark size={14} />
                  <span>المحفوظة مؤخراً</span>
                </button>
              )}
            </div>
          </div>

          {/* شبكة السور الـ 114 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredChapters.map((chapter) => {
              const isCurrentBookmark = lastBookmark?.chapterId === chapter.id;

              return (
                <motion.div
                  key={chapter.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`p-5 rounded-3xl border cursor-pointer relative overflow-hidden transition-all group ${
                    isDark 
                      ? 'bg-zinc-900/90 border-zinc-800 hover:border-amber-400/50 hover:bg-zinc-900' 
                      : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* رقم السورة في إطار مميز */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                        isDark 
                          ? 'bg-zinc-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950' 
                          : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}>
                        {formatDigits(chapter.id, activeNumberFormat)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xl font-black font-arabic ${currentTheme.textMain}`}>
                            سورة {chapter.name_arabic}
                          </h3>
                          {isCurrentBookmark && (
                            <BookmarkCheck size={16} className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold opacity-50 mt-0.5">
                          <span>{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</span>
                          <span>•</span>
                          <span>{formatDigits(chapter.verses_count, activeNumberFormat)} آية</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-serif flex flex-col items-end gap-1">
                      <div className="opacity-30 group-hover:opacity-80 transition-opacity">
                        <span className="text-xs font-bold block">{chapter.name_simple}</span>
                        <span className="text-[10px] block">صـ {formatDigits(chapter.pages[0], activeNumberFormat)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadingFocusMode(chapter);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-amber-400 hover:text-zinc-950 text-zinc-400"
                        title="بدء وضع القراءة والتركيز"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* الحالة 2: عرض السورة المختارة وقراءتها (Reader View) */
        <div className="space-y-6">
          {/* شريط التحكم العلوي بالسورة */}
          <div className={`sticky top-20 z-30 p-4 md:p-6 rounded-[2.5rem] border backdrop-blur-xl transition-all shadow-sm ${
            isDark ? 'bg-zinc-900/90 border-zinc-800 text-white' : 'bg-white/95 border-emerald-100 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className={`p-3 rounded-2xl transition-all active:scale-90 ${
                    isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-gray-100 text-zinc-700 hover:bg-gray-200'
                  }`}
                  title="الرجوع لقائمة السور"
                >
                  <ArrowRight size={20} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-black font-arabic">
                      سورة {selectedChapter.name_arabic}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedChapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}
                    </span>
                    <a
                      href={`https://quran.com/ar/${selectedChapter.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-amber-400 hover:underline px-2 py-0.5 rounded-lg bg-emerald-500/10 dark:bg-amber-400/10"
                      title="فتح السورة على Quran.com"
                    >
                      <span>Quran.com</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <p className="text-[11px] font-bold opacity-50">
                      {formatDigits(selectedChapter.verses_count, activeNumberFormat)} آية — صـ {formatDigits(selectedChapter.pages[0], activeNumberFormat)}
                    </p>

                    {khatmah && (
                      <button
                        onClick={() => {
                          const pageToRecord = selectedChapter.pages[0];
                          handleUpdateKhatmah({
                            ...khatmah,
                            currentPage: pageToRecord,
                            lastUpdated: Date.now(),
                            completed: pageToRecord >= 604,
                            completedAt: pageToRecord >= 604 ? Date.now() : undefined
                          });
                          showToast(`تم تسجيل صـ ${formatDigits(pageToRecord, activeNumberFormat)} في الختمة 📖`);
                        }}
                        className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg transition-all ${
                          khatmah.currentPage === selectedChapter.pages[0]
                            ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                            : (isDark ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100')
                        }`}
                        title="تحديث موضع الختمة إلى بداية هذه السورة"
                      >
                        <Target size={11} />
                        <span>{khatmah.currentPage === selectedChapter.pages[0] ? 'موضع ختمتك' : 'تسجيل بالختمة'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* أدوات التحكم: تكبير الخط، التلاوة الصوتية، وطريقة العرض */}
              <div className="flex items-center gap-2">
                {/* ضبط حجم الخط */}
                <div className="flex items-center border rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5">
                  <button
                    onClick={() => handleFontSizeChange(-2)}
                    className="px-2.5 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-black"
                    title="تصغير الخط"
                  >
                    A-
                  </button>
                  <span className="text-[10px] font-bold px-1.5 opacity-60">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => handleFontSizeChange(2)}
                    className="px-2.5 py-2 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-black"
                    title="تكبير الخط"
                  >
                    A+
                  </button>
                </div>

                {/* زر تشغيل التلاوة الصوتية */}
                <button
                  onClick={handleToggleAudio}
                  disabled={audioLoading}
                  className={`p-3 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 ${
                    isPlaying
                      ? 'bg-amber-500 text-white shadow-md'
                      : (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                  }`}
                  title={isPlaying ? "إيقاف التلاوة" : `استماع بصوت ${activeReciter.name}`}
                >
                  {audioLoading ? (
                    <AppLoader size="sm" />
                  ) : isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                  <span className="hidden sm:inline text-xs">
                    {isPlaying ? "إيقاف" : "استماع"}
                  </span>
                </button>

                {/* تبديل وضع العرض: مصحف متصل / آية بآية */}
                <button
                  onClick={() => setViewMode(prev => prev === 'page' ? 'list' : 'page')}
                  className={`p-3 rounded-2xl text-xs font-black transition-all ${
                    viewMode === 'page'
                      ? (isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-700')
                      : (isDark ? 'bg-zinc-800/60 text-zinc-400' : 'bg-gray-100 text-zinc-600')
                  }`}
                  title={viewMode === 'page' ? "عرض آية بآية مع التفسير" : "عرض مصحف متصل"}
                >
                  <Eye size={18} />
                </button>

                {/* زر تفعيل وضع القراءة والتركيز الكامل */}
                <button
                  onClick={() => toggleReadingFocusMode()}
                  className={`p-3 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                    isDark 
                      ? 'bg-amber-400 text-zinc-950 shadow-md hover:bg-amber-300' 
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700'
                  }`}
                  title="وضع القراءة: تكبير الخط وإخفاء كل ما يشتت الانتباه لتركيز كامل"
                >
                  <Maximize2 size={18} />
                  <span className="hidden sm:inline">وضع القراءة</span>
                </button>
              </div>
            </div>

            {/* شريط تشغيل الصوت والتقدم (إذا كان الصوت قيد التشغيل أو تم تحميله) */}
            {(audioUrl || isPlaying) && (
              <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Volume2 size={16} className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
                  <span className="text-xs font-bold">
                    القارئ: {activeReciter.name} {activeReciter.style ? `(${activeReciter.style})` : ''}
                  </span>
                  <button
                    onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                    className="text-[10px] text-emerald-600 dark:text-amber-400 font-black hover:underline"
                  >
                    تغيير القارئ
                  </button>
                </div>

                <div className="text-[11px] font-mono opacity-60">
                  {Math.floor(audioProgress / 60)}:{Math.floor(audioProgress % 60).toString().padStart(2, '0')} / {Math.floor(audioDuration / 60)}:{Math.floor(audioDuration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}

            {/* قائمة اختيار القارئ المنسدلة */}
            <AnimatePresence>
              {isAudioMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800"
                >
                  <p className="text-xs font-bold mb-2 opacity-70">اختر القارئ المفضل من Quran.com:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {QURRA.map(rec => (
                      <button
                        key={rec.id}
                        onClick={() => handleReciterChange(rec.id)}
                        className={`p-2.5 rounded-xl text-xs font-black text-right transition-all ${
                          selectedReciterId === rec.id
                            ? (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white')
                            : (isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-zinc-700 hover:bg-gray-200')
                        }`}
                      >
                        <div>{rec.name}</div>
                        {rec.style && <div className="text-[9px] opacity-70 font-normal">{rec.style}</div>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* محتوى السورة */}
          {loadingVerses ? (
            <div className="p-20 text-center space-y-4">
              <AppLoader size="lg" className="mx-auto" />
              <p className="text-sm font-bold opacity-60">
                جاري تحميل آيات سورة {selectedChapter.name_arabic} بالرسم العثماني من Quran.com...
              </p>
            </div>
          ) : errorMsg ? (
            <div className={`p-10 rounded-3xl border text-center space-y-4 ${
              isDark ? 'bg-zinc-900 border-red-500/20' : 'bg-red-50 border-red-200'
            }`}>
              <p className="text-red-500 font-bold">{errorMsg}</p>
              <button
                onClick={() => {
                  setLoadingVerses(true);
                  getChapterVerses(selectedChapter.id)
                    .then(res => { setVerses(res); setLoadingVerses(false); })
                    .catch(e => { setErrorMsg(e.message); setLoadingVerses(false); });
                }}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* إطار الترويسة المزخرفة للسورة */}
              <div className={`p-8 md:p-12 rounded-[3.5rem] border text-center relative overflow-hidden ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm'
              }`}>
                <div className="relative z-10 space-y-4">
                  <div className="inline-block px-6 py-2 rounded-2xl border border-dashed border-emerald-500/30 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-amber-400">
                    سورة {selectedChapter.name_arabic}
                  </div>
                  
                  {/* البسملة (لكل السور عدا التوبة، وسورة الفاتحة البسملة آية 1) */}
                  {selectedChapter.id !== 9 && selectedChapter.id !== 1 && (
                    <div className="pt-2">
                      <p className="font-quran text-2xl md:text-3xl leading-[2.5] text-zinc-800 dark:text-zinc-100 select-none">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                      </p>
                    </div>
                  )}

                  {selectedChapter.id === 9 && (
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 opacity-80">
                      سورة التوبة نزلت بدون بسملة
                    </p>
                  )}
                </div>
              </div>

              {/* النمط الأول: قراءة متصلة (مصحف صفحة واحدة مريح) */}
              {viewMode === 'page' ? (
                <div className={`p-8 md:p-14 rounded-[3.5rem] border shadow-sm leading-[2.8] text-justify ${
                  isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100' : 'bg-white border-emerald-50 text-zinc-900'
                }`}>
                  <p 
                    className="font-quran text-justify font-normal select-text"
                    style={{ fontSize: `${fontSize}px`, lineHeight: `${Math.max(fontSize * 2.3, 56)}px` }}
                  >
                    {verses.map((verse) => {
                      const verseNum = verse.verse_key.split(':')[1];
                      const isBookmarked = lastBookmark?.verseKey === verse.verse_key;

                      return (
                        <span 
                          key={verse.id} 
                          id={`ayah-${verse.verse_key}`}
                          className={`inline transition-colors hover:text-emerald-600 dark:hover:text-amber-400 cursor-pointer ${
                            isBookmarked ? 'bg-amber-400/20 dark:bg-amber-400/30 rounded px-1' : ''
                          }`}
                          onClick={() => handleSaveBookmark(verse)}
                          title="اضغط لحفظ موضع القراءة"
                        >
                          {verse.text_uthmani}{' '}
                          <span className={`inline-flex items-center justify-center font-arabic px-1 text-[0.8em] font-black ${
                            isDark ? 'text-amber-400' : 'text-emerald-700'
                          }`}>
                            ﴿{formatDigits(verseNum, activeNumberFormat)}﴾
                          </span>{' '}
                        </span>
                      );
                    })}
                  </p>
                  <div className="mt-8 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-xs font-bold opacity-40">نهاية سورة {selectedChapter.name_arabic}</p>
                  </div>
                </div>
              ) : (
                /* النمط الثاني: آية بآية مع التفسير والنسخ والحفظ */
                <div className="space-y-4">
                  {verses.map((verse) => {
                    const verseNum = verse.verse_key.split(':')[1];
                    const isBookmarked = lastBookmark?.verseKey === verse.verse_key;
                    const isTafsirOpen = activeTafsirKey === verse.verse_key;

                    return (
                      <div
                        key={verse.id}
                        id={`ayah-${verse.verse_key}`}
                        className={`p-6 md:p-8 rounded-[2.8rem] border relative overflow-hidden transition-all ${
                          isBookmarked
                            ? (isDark ? 'bg-amber-950/20 border-amber-400/40' : 'bg-amber-50/50 border-amber-200')
                            : (isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-100 shadow-sm hover:shadow-md')
                        }`}
                      >
                        {/* ترويسة الآية: رقم الآية، وحفظ الموضع، وتفسير، ونسخ */}
                        <div className="flex items-center justify-between gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                              isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {formatDigits(verseNum, activeNumberFormat)}
                            </span>
                            <span className="text-[11px] font-bold opacity-40">
                              الآية {formatDigits(verseNum, activeNumberFormat)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* زر حفظ الموضع */}
                            <button
                              onClick={(e) => handleSaveBookmark(verse, e)}
                              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                                isBookmarked
                                  ? (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white')
                                  : (isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:text-zinc-900')
                              }`}
                              title={isBookmarked ? "موضعك المحفوظ" : "حفظ كموضع للقراءة"}
                            >
                              <Bookmark size={16} />
                            </button>

                            {/* زر التفسير */}
                            <button
                              onClick={(e) => handleToggleTafsir(verse.verse_key, e)}
                              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                                isTafsirOpen
                                  ? (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white')
                                  : (isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:text-zinc-900')
                              }`}
                              title="عرض التفسير الميسر"
                            >
                              <Info size={16} />
                            </button>

                            {/* زر النسخ */}
                            <button
                              onClick={(e) => handleCopyAyah(verse, e)}
                              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                                copiedKey === verse.verse_key
                                  ? 'bg-emerald-500 text-white'
                                  : (isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:text-zinc-900')
                              }`}
                              title="نسخ الآية"
                            >
                              {copiedKey === verse.verse_key ? <Check size={16} /> : <Copy size={16} />}
                            </button>

                            {/* زر المشاركة */}
                            <button
                              onClick={(e) => handleShareAyah(verse, e)}
                              className={`p-2.5 rounded-full transition-all active:scale-90 ${
                                isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-zinc-600 hover:text-zinc-900'
                              }`}
                              title="مشاركة الآية"
                            >
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* نص الآية بالرسم العثماني المطابق لـ Quran.com */}
                        <div className="py-3 text-right">
                          <p 
                            className="font-quran leading-[2.4] text-zinc-900 dark:text-zinc-100 select-text"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {verse.text_uthmani}
                          </p>
                        </div>

                        {/* بطاقة التفسير القابلة للتوسيع */}
                        <AnimatePresence>
                          {isTafsirOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className={`mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800`}
                            >
                              <div className={`p-5 rounded-2xl border text-xs md:text-sm leading-relaxed ${
                                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                              }`}>
                                <div className="flex items-center gap-2 mb-2 font-black text-xs text-emerald-600 dark:text-amber-400">
                                  <Sparkles size={14} />
                                  <span>التفسير الميسر (Quran.com)</span>
                                </div>
                                {loadingTafsir ? (
                                  <div className="flex items-center gap-2 py-2">
                                    <AppLoader size="sm" />
                                    <span>جاري جلب التفسير...</span>
                                  </div>
                                ) : (
                                  <p className="font-arabic text-justify">{tafsirContent}</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* شريط الانتقال بين السور (السابقة / الفهرس / التالية) */}
              <div className={`mt-8 p-5 md:p-6 rounded-[2.5rem] border flex items-center justify-between gap-3 flex-wrap shadow-sm ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-emerald-100'
              }`}>
                {selectedChapter.id > 1 ? (
                  <button
                    onClick={() => {
                      const prev = QURAN_CHAPTERS.find(c => c.id === selectedChapter.id - 1);
                      if (prev) {
                        setSelectedChapter(prev);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${
                      isDark ? 'bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700' : 'bg-gray-100 text-zinc-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowRight size={16} />
                    <span>السورة السابقة: {QURAN_CHAPTERS.find(c => c.id === selectedChapter.id - 1)?.name_arabic}</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => {
                    setSelectedChapter(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${
                    isDark ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>فهرس السور</span>
                </button>

                {selectedChapter.id < 114 ? (
                  <button
                    onClick={() => {
                      const next = QURAN_CHAPTERS.find(c => c.id === selectedChapter.id + 1);
                      if (next) {
                        setSelectedChapter(next);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${
                      isDark ? 'bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700' : 'bg-gray-100 text-zinc-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>السورة التالية: {QURAN_CHAPTERS.find(c => c.id === selectedChapter.id + 1)?.name_arabic}</span>
                    <ArrowLeft size={16} />
                  </button>
                ) : <div />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quran;
