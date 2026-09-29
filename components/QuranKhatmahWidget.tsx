import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Target, Sparkles, BookOpen, CheckCircle2, 
  RotateCcw, Edit3, Plus, ArrowRight, Award, Trophy, ChevronRight, X, HeartHandshake, Check
} from 'lucide-react';
import { ThemeColor, NumberFormat, QuranKhatmah } from '../types';
import { THEMES, formatDigits } from '../constants';
import { getChapterByPage } from '../data/quranChapters';

interface QuranKhatmahWidgetProps {
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
  khatmah: QuranKhatmah | null;
  onUpdateKhatmah: (khatmah: QuranKhatmah | null) => void;
  onOpenSurahPage: (pageNum: number) => void;
  showToast: (msg: string) => void;
}

export const QuranKhatmahWidget: React.FC<QuranKhatmahWidgetProps> = ({
  theme,
  numberFormat = 'arabic',
  khatmah,
  onUpdateKhatmah,
  onOpenSurahPage,
  showToast
}) => {
  const isDark = theme === 'dark';
  const currentTheme = THEMES[theme] || THEMES.green;
  const activeNumberFormat = (numberFormat || 'arabic') as NumberFormat;

  // Modals & Panels
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [isCustomPageOpen, setIsCustomPageOpen] = useState(false);
  const [customPageInput, setCustomPageInput] = useState('');

  // Form states for creating/editing Khatmah
  const [planType, setPlanType] = useState<'days' | 'pages'>(khatmah?.planType || 'days');
  const [targetDays, setTargetDays] = useState<number>(khatmah?.targetDays || 30);
  const [dailyPages, setDailyPages] = useState<number>(khatmah?.dailyPages || 20);
  const [startPage, setStartPage] = useState<number>(khatmah?.currentPage || 1);

  // Calculations
  const calculatedDailyPages = planType === 'days' ? Math.max(1, Math.ceil(604 / targetDays)) : dailyPages;
  const calculatedDays = planType === 'pages' ? Math.max(1, Math.ceil(604 / dailyPages)) : targetDays;

  const currentPage = Math.min(604, Math.max(0, khatmah?.currentPage || 0));
  const progressPercent = Math.min(100, Math.round((currentPage / 604) * 100));
  const remainingPages = Math.max(0, 604 - currentPage);
  const remainingDays = Math.ceil(remainingPages / (khatmah?.dailyPages || 20));
  const currentJuz = Math.min(30, Math.floor(Math.max(0, currentPage - 1) / 20) + 1);
  const currentSurah = getChapterByPage(currentPage || 1);

  // حفظ الخطة الجديدة أو المعدلة
  const handleSavePlan = () => {
    const finalDailyPages = planType === 'days' ? Math.max(1, Math.ceil(604 / targetDays)) : dailyPages;
    const finalDays = planType === 'pages' ? Math.max(1, Math.ceil(604 / dailyPages)) : targetDays;

    const newKhatmah: QuranKhatmah = {
      planType,
      targetDays: finalDays,
      dailyPages: finalDailyPages,
      currentPage: Math.min(604, Math.max(0, startPage)),
      startDate: khatmah?.startDate || Date.now(),
      lastUpdated: Date.now(),
      completed: startPage >= 604
    };

    onUpdateKhatmah(newKhatmah);
    setIsModalOpen(false);
    showToast('تم حفظ خطة الختمة القرآنية بنجاح 🤲');
  };

  const updateTodayHistory = (pagesAdded: number) => {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      let history: Record<string, number> = {};
      const saved = localStorage.getItem('quran_reading_history_v1');
      if (saved) history = JSON.parse(saved);

      history[dateKey] = Math.max(0, (history[dateKey] || 0) + pagesAdded);
      localStorage.setItem('quran_reading_history_v1', JSON.stringify(history));
    } catch {}
  };

  // تسجيل تقدم بالقراءة (+1 أو +5 أو ورد كامل)
  const handleIncrementPage = (delta: number) => {
    if (!khatmah) return;
    const nextPage = Math.min(604, Math.max(1, khatmah.currentPage + delta));
    const isCompleted = nextPage >= 604;

    const updated: QuranKhatmah = {
      ...khatmah,
      currentPage: nextPage,
      lastUpdated: Date.now(),
      completed: isCompleted,
      completedAt: isCompleted ? Date.now() : undefined
    };

    updateTodayHistory(delta);
    onUpdateKhatmah(updated);
    if ('vibrate' in navigator) navigator.vibrate(20);

    if (isCompleted) {
      showToast('مبارك! تم ختم القرآن الكريم كاملاً 🎉 تقبل الله منك');
      setIsDuaOpen(true);
    } else {
      showToast(`تم تسجيل القراءة: صـ ${formatDigits(nextPage, activeNumberFormat)} (${formatDigits(progressPercent, activeNumberFormat)}%)`);
    }
  };

  // تعيين صفحة محددة يدوياً
  const handleSetCustomPage = () => {
    const val = parseInt(customPageInput, 10);
    if (isNaN(val) || val < 1 || val > 604) {
      showToast('يرجى إدخال رقم صفحة صحيح بين 1 و 604');
      return;
    }

    if (!khatmah) return;
    const isCompleted = val >= 604;
    const updated: QuranKhatmah = {
      ...khatmah,
      currentPage: val,
      lastUpdated: Date.now(),
      completed: isCompleted,
      completedAt: isCompleted ? Date.now() : undefined
    };

    onUpdateKhatmah(updated);
    setIsCustomPageOpen(false);
    setCustomPageInput('');
    if (isCompleted) {
      showToast('مبارك! تم ختم القرآن الكريم كاملاً 🎉');
      setIsDuaOpen(true);
    } else {
      showToast(`تم تحديث موضع الختمة إلى الصفحة ${formatDigits(val, activeNumberFormat)}`);
    }
  };

  // إعادة ضبط الختمة
  const handleResetKhatmah = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط الختمة وبدء ختمة جديدة؟')) {
      onUpdateKhatmah(null);
      showToast('تمت إعادة ضبط الختمة');
    }
  };

  return (
    <div className="space-y-4">
      {/* في حال عدم وجود ختمة مفعلة: بطاقة تحفيزية للبدء */}
      {!khatmah ? (
        <div className={`p-6 md:p-8 rounded-[2.8rem] border relative overflow-hidden transition-all shadow-sm ${
          isDark 
            ? 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/20 border-zinc-800' 
            : 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border-emerald-100 shadow-emerald-600/5'
        }`}>
          <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 md:gap-5">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              }`}>
                <Calendar size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-600/10 text-emerald-700'
                  }`}>
                    ميزة جديدة
                  </span>
                  <h3 className={`text-xl md:text-2xl font-black ${currentTheme.textMain}`}>
                    الختمة القرآنية المباركة
                  </h3>
                </div>
                <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  حدد هدفك لختم كتاب الله (بالأيام أو بعدد الصفحات اليومية) وتابع إنجازك خطوة بخطوة.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setStartPage(1);
                setIsModalOpen(true);
              }}
              className={`px-6 py-3.5 rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 transition-all active:scale-95 shrink-0 ${
                isDark 
                  ? 'bg-amber-400 text-zinc-950 shadow-md hover:bg-amber-300' 
                  : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700'
              }`}
            >
              <Sparkles size={16} />
              <span>ابدأ ختمة جديدة</span>
            </button>
          </div>
        </div>
      ) : (
        /* في حال وجود ختمة نشطة: بطاقة تتبع التقدم والإنجاز */
        <div className={`p-6 md:p-8 rounded-[2.8rem] border relative overflow-hidden transition-all shadow-sm ${
          khatmah.completed
            ? (isDark ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-amber-500/40' : 'bg-gradient-to-r from-amber-50 via-emerald-50 to-white border-amber-300 shadow-amber-200/50')
            : (isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-emerald-100 shadow-sm')
        }`}>
          <div className="relative z-10 space-y-6">
            {/* الترويسة: اسم الختمة ونسبة الإنجاز */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  khatmah.completed
                    ? 'bg-amber-400 text-zinc-950 animate-bounce'
                    : (isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-700')
                }`}>
                  {khatmah.completed ? <Trophy size={24} /> : <Calendar size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg md:text-xl font-black ${currentTheme.textMain}`}>
                      {khatmah.completed ? 'مبارك! أتممت الختمة المباركة' : 'ختمتي القرآنية الحالية'}
                    </h3>
                    {khatmah.completed && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-zinc-950">
                        مكتملة 🌟
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold opacity-60 mt-0.5">
                    خطة الختم: {khatmah.planType === 'days' ? `${formatDigits(khatmah.targetDays, activeNumberFormat)} يوماً` : `${formatDigits(khatmah.dailyPages, activeNumberFormat)} صفحة يومياً`}
                    {' '}• الورد اليومي المطلوب: {formatDigits(khatmah.dailyPages, activeNumberFormat)} صفحة
                  </p>
                </div>
              </div>

              {/* نسبة الإنجاز المئوية */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-2xl border text-center ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-emerald-50/80 border-emerald-100'
                }`}>
                  <span className="text-[10px] font-bold block opacity-60">نسبة الإنجاز</span>
                  <span className={`text-lg md:text-xl font-black font-mono ${
                    isDark ? 'text-amber-400' : 'text-emerald-700'
                  }`}>
                    {formatDigits(progressPercent, activeNumberFormat)}%
                  </span>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`p-2.5 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${
                    isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-gray-50 border-gray-200 text-zinc-600'
                  }`}
                  title="تعديل خطة الختمة"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            </div>

            {/* شريط التقدم المرئي البصري */}
            <div className="space-y-2">
              <div className="w-full h-3.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden p-0.5 border border-black/5 dark:border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    khatmah.completed
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-400/50'
                      : (isDark ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-gradient-to-r from-emerald-600 to-teal-400')
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold opacity-60 px-1">
                <span>البداية (صـ ١)</span>
                <span>الموضع الحالي: صـ {formatDigits(currentPage, activeNumberFormat)} (سورة {currentSurah.name_arabic})</span>
                <span>الختم (صـ ٦٠٤)</span>
              </div>
            </div>

            {/* شبكة الإحصائيات والأرقام */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/80 border-gray-100'
              }`}>
                <span className="text-[10px] font-bold opacity-50 block">الصفحة الحالية</span>
                <span className="text-base font-black">
                  صـ {formatDigits(currentPage, activeNumberFormat)}
                </span>
                <span className="text-[9px] opacity-40 block truncate">سورة {currentSurah.name_arabic}</span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/80 border-gray-100'
              }`}>
                <span className="text-[10px] font-bold opacity-50 block">الجزء الحالي</span>
                <span className="text-base font-black">
                  الجزء {formatDigits(currentJuz, activeNumberFormat)}
                </span>
                <span className="text-[9px] opacity-40 block">من أصل ٣٠ جزءاً</span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/80 border-gray-100'
              }`}>
                <span className="text-[10px] font-bold opacity-50 block">المتبقي للختم</span>
                <span className="text-base font-black">
                  {formatDigits(remainingPages, activeNumberFormat)} صفحة
                </span>
                <span className="text-[9px] opacity-40 block">تقريباً {formatDigits(remainingDays, activeNumberFormat)} يوماً</span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${
                isDark ? 'bg-zinc-800/40 border-zinc-800' : 'bg-gray-50/80 border-gray-100'
              }`}>
                <span className="text-[10px] font-bold opacity-50 block">الورد اليومي</span>
                <span className="text-base font-black">
                  {formatDigits(khatmah.dailyPages, activeNumberFormat)} صفحة
                </span>
                <span className="text-[9px] opacity-40 block">لكل يوم</span>
              </div>
            </div>

            {/* أزرار الإجراءات السريعة وتسجيل القراءة */}
            <div className="flex items-center justify-between gap-2.5 flex-wrap pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenSurahPage(currentPage || 1)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${
                    isDark 
                      ? 'bg-amber-400 text-zinc-950 shadow-md hover:bg-amber-300' 
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>اقرأ وردك (سورة {currentSurah.name_arabic})</span>
                </button>

                {khatmah.completed && (
                  <button
                    onClick={() => setIsDuaOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all bg-amber-500 text-white shadow-md"
                  >
                    <HeartHandshake size={16} />
                    <span>دعاء ختم القرآن</span>
                  </button>
                )}
              </div>

              {/* أزرار التسجيل السريع للتقدم */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold opacity-50 ml-1">سجّل قراءة:</span>
                <button
                  onClick={() => handleIncrementPage(1)}
                  disabled={khatmah.completed}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                    isDark ? 'bg-zinc-800 text-zinc-200 hover:text-white' : 'bg-gray-100 text-zinc-700 hover:bg-gray-200'
                  }`}
                  title="سجل قراءة صفحة واحدة"
                >
                  +١ صـ
                </button>

                <button
                  onClick={() => handleIncrementPage(5)}
                  disabled={khatmah.completed}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                    isDark ? 'bg-zinc-800 text-zinc-200 hover:text-white' : 'bg-gray-100 text-zinc-700 hover:bg-gray-200'
                  }`}
                  title="سجل قراءة 5 صفحات"
                >
                  +٥ صـ
                </button>

                <button
                  onClick={() => handleIncrementPage(khatmah.dailyPages)}
                  disabled={khatmah.completed}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                    isDark ? 'bg-amber-400/20 text-amber-400 hover:bg-amber-400/30' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title={`سجل قراءة ورد اليوم كاملاً (${khatmah.dailyPages} صفحة)`}
                >
                  + الورد كامل ({formatDigits(khatmah.dailyPages, activeNumberFormat)})
                </button>

                <button
                  onClick={() => setIsCustomPageOpen(true)}
                  className={`p-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                    isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="إدخال رقم الصفحة يدوياً"
                >
                  <Target size={16} />
                </button>

                <button
                  onClick={handleResetKhatmah}
                  className={`p-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                    isDark ? 'bg-zinc-800 text-zinc-400 hover:text-red-400' : 'bg-gray-100 text-zinc-500 hover:text-red-600'
                  }`}
                  title="إعادة ضبط وبدء ختمة جديدة"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة ضبط وتعديل الختمة (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-lg rounded-[2.5rem] border p-6 md:p-8 shadow-2xl overflow-hidden ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-emerald-100 text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}>
                    <Calendar size={20} />
                  </div>
                  <h3 className="text-lg md:text-xl font-black">
                    {khatmah ? 'تعديل خطة الختمة القرآنية' : 'تحديد خطة الختمة القرآنية'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-6 space-y-6">
                {/* تبديل نوع الخطة: بالأيام أو بالصفحات */}
                <div className="space-y-2">
                  <label className="text-xs font-black opacity-60">كيف تفضل تخطيط ختمتك؟</label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setPlanType('days')}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        planType === 'days'
                          ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      تحديد بعدد الأيام
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanType('pages')}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        planType === 'pages'
                          ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      تحديد بعدد الصفحات
                    </button>
                  </div>
                </div>

                {/* خيار 1: تحديد بعدد الأيام */}
                {planType === 'days' ? (
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-60">اختر المدة الزمنية المرغوبة لختم القرآن:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { days: 30, desc: 'جزء يومياً' },
                        { days: 60, desc: 'نصف جزء' },
                        { days: 15, desc: 'جزآن يومياً' },
                        { days: 10, desc: '٣ أجزاء' }
                      ].map((item) => (
                        <button
                          key={item.days}
                          type="button"
                          onClick={() => setTargetDays(item.days)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            targetDays === item.days
                              ? (isDark ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm' : 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm')
                              : (isDark ? 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                          }`}
                        >
                          <div className="text-sm font-black">{formatDigits(item.days, activeNumberFormat)} يوماً</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* إدخال عدد أيام مخصص */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-70">
                        <span>أو أدخل عدد الأيام المخصص:</span>
                        <span className="font-mono">{formatDigits(targetDays, activeNumberFormat)} يوم</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="365"
                        value={targetDays}
                        onChange={(e) => setTargetDays(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 dark:accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* الحساب التلقائي */}
                    <div className={`p-4 rounded-2xl border text-xs font-bold ${
                      isDark ? 'bg-zinc-800/60 border-zinc-800 text-amber-300' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                    }`}>
                      💡 وردك اليومي المطلوب: <span className="font-black text-sm">{formatDigits(calculatedDailyPages, activeNumberFormat)} صفحة</span> يومياً (حوالي {formatDigits(Math.ceil(calculatedDailyPages / 5), activeNumberFormat)} صفحات بعد كل صلاة).
                    </div>
                  </div>
                ) : (
                  /* خيار 2: تحديد بعدد الصفحات اليومية */
                  <div className="space-y-4">
                    <label className="text-xs font-black opacity-60">اختر عدد الصفحات التي تقرؤها يومياً:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { pages: 20, desc: 'جزء كامل' },
                        { pages: 10, desc: 'نصف جزء' },
                        { pages: 4, desc: 'صفحة بعد كل صلاة' },
                        { pages: 30, desc: 'جزء ونصف' }
                      ].map((item) => (
                        <button
                          key={item.pages}
                          type="button"
                          onClick={() => setDailyPages(item.pages)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            dailyPages === item.pages
                              ? (isDark ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-sm' : 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm')
                              : (isDark ? 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                          }`}
                        >
                          <div className="text-sm font-black">{formatDigits(item.pages, activeNumberFormat)} صفحة</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* سلايدر الصفحات */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-70">
                        <span>أو حدد عدد الصفحات اليومي:</span>
                        <span className="font-mono">{formatDigits(dailyPages, activeNumberFormat)} صفحة</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="60"
                        value={dailyPages}
                        onChange={(e) => setDailyPages(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600 dark:accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* الحساب التلقائي */}
                    <div className={`p-4 rounded-2xl border text-xs font-bold ${
                      isDark ? 'bg-zinc-800/60 border-zinc-800 text-amber-300' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                    }`}>
                      💡 ستختم القرآن الكريم بإذن الله تعالى في غضون: <span className="font-black text-sm">{formatDigits(calculatedDays, activeNumberFormat)} يوماً</span>.
                    </div>
                  </div>
                )}

                {/* الصفحة التي تبدأ منها الختمة */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black opacity-60">الصفحة الحالية التي تبدأ منها الختمة:</label>
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={startPage}
                    onChange={(e) => setStartPage(Math.max(1, Math.min(604, parseInt(e.target.value, 10) || 1)))}
                    className={`w-full p-3.5 rounded-2xl border outline-none font-bold text-sm ${
                      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'
                    }`}
                    placeholder="رقم الصفحة (1 إلى 604)"
                  />
                  <p className="text-[10px] opacity-50">افتراضياً تبدأ من الصفحة الأولى (سورة الفاتحة)</p>
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-zinc-600'
                  }`}
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSavePlan}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md ${
                    isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Check size={16} />
                  <span>{khatmah ? 'حفظ التعديلات' : 'بدء الختمة المباركة'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة إدخال رقم الصفحة يدوياً */}
      <AnimatePresence>
        {isCustomPageOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-200 text-zinc-900'
              }`}
            >
              <h4 className="text-base font-black mb-3">تحديث الصفحة الحالية للختمة</h4>
              <p className="text-xs opacity-60 mb-4">أدخل رقم الصفحة التي وصلت إليها في المصحف (1 - 604):</p>
              <input
                type="number"
                min="1"
                max="604"
                value={customPageInput}
                onChange={(e) => setCustomPageInput(e.target.value)}
                placeholder={`الصفحة الحالية: ${currentPage}`}
                className={`w-full p-3.5 rounded-2xl border outline-none font-bold text-sm mb-4 ${
                  isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'
                }`}
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsCustomPageOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold opacity-70"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSetCustomPage}
                  className={`px-5 py-2 rounded-xl text-xs font-black ${
                    isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'
                  }`}
                >
                  تحديث الصفحة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة دعاء ختم القرآن الكريم */}
      <AnimatePresence>
        {isDuaOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] border flex flex-col shadow-2xl overflow-hidden ${
                isDark ? 'bg-zinc-900 border-amber-500/30 text-white' : 'bg-white border-emerald-100 text-zinc-900'
              }`}
            >
              <div className="p-6 border-b flex items-center justify-between border-black/5 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}>
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black font-arabic">دعاء ختم القرآن الكريم</h3>
                    <p className="text-[11px] opacity-60">تقبل الله طاعاتكم وبارك لكم في كتابه العزيز</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDuaOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-justify leading-relaxed font-arabic text-base md:text-lg select-text">
                <p className="text-center font-black text-xl text-amber-600 dark:text-amber-400 pb-2 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                <p>
                  اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً.
                </p>
                <p>
                  اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ.
                </p>
                <p>
                  اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.
                </p>
                <p>
                  اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ.
                </p>
                <p>
                  اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً، وَمِيتَةً سَوِيَّةً، وَمَرَدّاً غَيْرَ مُخْزٍ وَلا فَاضِحٍ.
                </p>
                <p>
                  اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلَةِ، وَخَيْرَ الدُّعَاءِ، وَخَيْرَ النَّجَاحِ، وَخَيْرَ العِلْمِ، وَخَيْرَ العَمَلِ، وَخَيْرَ الثَّوَابِ، وَخَيْرَ الحَيَاةِ، وَخَيْرَ المَمَاتِ، وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي، وَحَقِّقْ إِيمَانِي، وَارْفَعْ دَرَجَتِي، وَتَقَبَّلْ صَلاتِي، وَاغْفِرْ خَطِيئَاتِي، وَأَسْأَلُكَ العُلا مِنَ الجَنَّةِ.
                </p>
                <p>
                  وصلى الله على نبينا محمد وعلى آله وصحبه أجمعين، والحمد لله رب العالمين.
                </p>
              </div>

              <div className="p-4 border-t border-black/5 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5 shrink-0">
                <button
                  onClick={() => {
                    setIsDuaOpen(false);
                    setIsModalOpen(true);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 ${
                    isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>بدء ختمة جديدة مباركة</span>
                </button>

                <button
                  onClick={() => setIsDuaOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold opacity-70 hover:opacity-100"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuranKhatmahWidget;
