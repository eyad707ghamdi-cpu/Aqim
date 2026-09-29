import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Star, Clock, Compass, Search, X, Check, Copy, Share2, 
  RotateCcw, Sparkles, Heart, Bookmark, BookmarkCheck, CheckCircle2,
  ChevronDown, ChevronUp, Info, SunMedium, Sunrise, Sunset, Moon,
  Volume2, Building, Droplets, Home, Utensils, ShieldAlert, HeartPulse,
  CloudRain, ShoppingBag, RefreshCw
} from 'lucide-react';
import { ThemeColor, NumberFormat, HisnDhikrItem, HisnCategoryType } from '../types';
import { THEMES, formatDigits } from '../constants';
import { HISN_CATEGORIES, HISN_ATHKAR } from '../data/hisnData';

interface HisnMuslimProps {
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
}

type MainFilter = 'all' | 'time' | 'state' | 'favorites';

export const HisnMuslim: React.FC<HisnMuslimProps> = ({ theme, numberFormat = 'arabic' }) => {
  const activeNumberFormat = (numberFormat || 'arabic') as NumberFormat;
  const [activeFilter, setActiveFilter] = useState<MainFilter>('time');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedFadlId, setExpandedFadlId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentTheme = THEMES[theme] || THEMES.green;
  const isDark = theme === 'dark';

  // استرجاع المفضلة من التخزين المحلي
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('hisn_favorites_v1');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // حفظ المفضلة في التخزين المحلي
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter(fId => fId !== id);
        showToast("تم الحذف من المفضلة");
      } else {
        updated = [...prev, id];
        showToast("تمت الإضافة إلى المفضلة ⭐");
      }
      localStorage.setItem('hisn_favorites_v1', JSON.stringify(updated));
      if ('vibrate' in navigator) navigator.vibrate(20);
      return updated;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleIncrement = (item: HisnDhikrItem) => {
    const current = counts[item.id] || 0;
    if (current < item.repeat) {
      const next = current + 1;
      setCounts(prev => ({ ...prev, [item.id]: next }));
      if ('vibrate' in navigator) {
        if (next === item.repeat) {
          navigator.vibrate([20, 80, 20]);
        } else {
          navigator.vibrate(15);
        }
      }
    }
  };

  const handleResetCount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounts(prev => ({ ...prev, [id]: 0 }));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleCopy = (item: HisnDhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `${item.title}\n\n${item.text}\n\nالتخريج: ${item.source}${item.fadl ? `\nالفضل: ${item.fadl}` : ''}\n\n(من تطبيق أقِم - حصن المسلم)`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(item.id);
    showToast("تم نسخ الذكر إلى الحافظة");
    setTimeout(() => setCopiedId(null), 2000);
    if ('vibrate' in navigator) navigator.vibrate(15);
  };

  const handleShare = async (item: HisnDhikrItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullText = `${item.title}\n\n${item.text}\n\nالتخريج: ${item.source}\n(تطبيق أقِم)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: fullText,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy(item, e);
    }
  };

  // الفئات الفرعية المتاحة بحسب الفلتر الرئيسي
  const availableSubCategories = useMemo(() => {
    if (activeFilter === 'time') {
      return HISN_CATEGORIES.filter(c => c.type === 'time');
    }
    if (activeFilter === 'state') {
      return HISN_CATEGORIES.filter(c => c.type === 'state');
    }
    return [];
  }, [activeFilter]);

  // قائمة الأذكار المفلترة
  const filteredAthkar = useMemo(() => {
    return HISN_ATHKAR.filter(item => {
      // فلتر المفضلة
      if (activeFilter === 'favorites') {
        if (!favorites.includes(item.id)) return false;
      } else if (activeFilter === 'time') {
        if (item.categoryType !== 'time') return false;
        if (selectedSubCategory !== 'all' && item.categoryGroup !== selectedSubCategory) return false;
      } else if (activeFilter === 'state') {
        if (item.categoryType !== 'state') return false;
        if (selectedSubCategory !== 'all' && item.categoryGroup !== selectedSubCategory) return false;
      }

      // فلتر البحث
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesText = item.text.toLowerCase().includes(query);
        const matchesSource = item.source.toLowerCase().includes(query);
        const matchesFadl = item.fadl?.toLowerCase().includes(query) || false;
        return matchesTitle || matchesText || matchesSource || matchesFadl;
      }

      return true;
    });
  }, [activeFilter, selectedSubCategory, searchQuery, favorites]);

  // دالة جلب أيقونة الفئة الفرعية
  const getCategoryIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise size={size} />;
      case 'Sunset': return <Sunset size={size} />;
      case 'Moon': return <Moon size={size} />;
      case 'SunMedium': return <SunMedium size={size} />;
      case 'Volume2': return <Volume2 size={size} />;
      case 'CheckCircle2': return <CheckCircle2 size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'Building': return <Building size={size} />;
      case 'Droplets': return <Droplets size={size} />;
      case 'Home': return <Home size={size} />;
      case 'Utensils': return <Utensils size={size} />;
      case 'Compass': return <Compass size={size} />;
      case 'ShieldAlert': return <ShieldAlert size={size} />;
      case 'HeartPulse': return <HeartPulse size={size} />;
      case 'CloudRain': return <CloudRain size={size} />;
      case 'ShoppingBag': return <ShoppingBag size={size} />;
      case 'RefreshCw': return <RefreshCw size={size} />;
      default: return <BookOpen size={size} />;
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto px-2">
      {/* رأس القسم */}
      <div className={`p-8 md:p-10 rounded-[3rem] border relative overflow-hidden shadow-sm transition-all duration-300 ${
        isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-emerald-50'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:bg-amber-400/10 dark:text-amber-400">
              <Sparkles size={14} />
              <span>مختارات حصن المسلم من أذكار الكتاب والسنة</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black font-arabic ${currentTheme.textMain}`}>
              حصن المسلم
            </h2>
            <p className={`text-sm leading-relaxed max-w-xl ${currentTheme.textMuted} font-medium`}>
              أدعية وأذكار جامعة ومحققة مصنفة حسب الوقت والحالة، لتعمير يومك وليلتك بذكر الله وحفظه المتين.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-zinc-50 border-gray-100'
            }`}>
              <BookmarkCheck size={20} className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
              <div>
                <span className="text-[10px] block opacity-50 font-bold uppercase tracking-wider">المفضلة</span>
                <span className="text-lg font-black">{formatDigits(favorites.length, activeNumberFormat)} ذكر</span>
              </div>
            </div>
          </div>
        </div>

        {/* خلفية تجميلية */}
        <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
          <BookOpen size={240} />
        </div>
      </div>

      {/* شريط البحث وفلاتر التصنيف الرئيسية */}
      <div className="space-y-4">
        {/* شريط البحث */}
        <div className={`relative flex items-center rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 focus-within:border-amber-400' : 'bg-white border-gray-200 focus-within:border-emerald-500 shadow-sm'
        }`}>
          <Search size={20} className="mr-4 ml-2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الأذكار ومناسباتها وفضائلها..."
            className="w-full py-4 px-2 bg-transparent outline-none font-medium text-sm md:text-base placeholder:text-zinc-400 placeholder:text-sm"
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

        {/* الفلاتر الرئيسية: حسب الوقت / حسب الحالة / المفضلة / الكل */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => { setActiveFilter('time'); setSelectedSubCategory('all'); }}
            className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeFilter === 'time'
                ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-lg' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20')
                : (isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-white text-zinc-600 hover:bg-gray-50 border border-gray-100 shadow-sm')
            }`}
          >
            <Clock size={16} />
            <span>حسب الوقت</span>
          </button>

          <button
            onClick={() => { setActiveFilter('state'); setSelectedSubCategory('all'); }}
            className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeFilter === 'state'
                ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-lg' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20')
                : (isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-white text-zinc-600 hover:bg-gray-50 border border-gray-100 shadow-sm')
            }`}
          >
            <Compass size={16} />
            <span>حسب الحالة</span>
          </button>

          <button
            onClick={() => { setActiveFilter('favorites'); setSelectedSubCategory('all'); }}
            className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 relative ${
              activeFilter === 'favorites'
                ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-lg' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20')
                : (isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-white text-zinc-600 hover:bg-gray-50 border border-gray-100 shadow-sm')
            }`}
          >
            <Star size={16} className={favorites.length > 0 ? 'fill-amber-400 text-amber-500' : ''} />
            <span>المفضلة</span>
            {favorites.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeFilter === 'favorites' ? 'bg-black/20 text-white' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                {formatDigits(favorites.length, activeNumberFormat)}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveFilter('all'); setSelectedSubCategory('all'); }}
            className={`py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeFilter === 'all'
                ? (isDark ? 'bg-amber-400 text-zinc-950 shadow-lg' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20')
                : (isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800' : 'bg-white text-zinc-600 hover:bg-gray-50 border border-gray-100 shadow-sm')
            }`}
          >
            <BookOpen size={16} />
            <span>كل الأذكار</span>
          </button>
        </div>

        {/* الفئات الفرعية (Chips) عند تفعيل "حسب الوقت" أو "حسب الحالة" */}
        {availableSubCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedSubCategory === 'all'
                  ? (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white')
                  : (isDark ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700' : 'bg-white text-zinc-700 border border-gray-200')
              }`}
            >
              الكل ({formatDigits(HISN_ATHKAR.filter(a => a.categoryType === activeFilter).length, activeNumberFormat)})
            </button>
            {availableSubCategories.map(cat => {
              const count = HISN_ATHKAR.filter(a => a.categoryGroup === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSubCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all ${
                    selectedSubCategory === cat.id
                      ? (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white')
                      : (isDark ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700' : 'bg-white text-zinc-700 border border-gray-200')
                  }`}
                >
                  {getCategoryIcon(cat.icon, 14)}
                  <span>{cat.name}</span>
                  <span className="opacity-60 text-[10px]">({formatDigits(count, activeNumberFormat)})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

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

      {/* قائمة الأذكار */}
      <div className="space-y-6">
        {filteredAthkar.length === 0 ? (
          <div className={`p-16 rounded-[3rem] border text-center space-y-4 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {activeFilter === 'favorites' ? <Star size={32} /> : <Search size={32} />}
            </div>
            <h3 className="text-xl font-black">
              {activeFilter === 'favorites' ? 'لم تقم بإضافة أي أذكار للمفضلة بعد' : 'لم يتم العثور على أذكار تطابق بحثك'}
            </h3>
            <p className="text-sm opacity-50 max-w-sm mx-auto font-medium">
              {activeFilter === 'favorites'
                ? 'اضغط على رمز النجمة ⭐ بجانب أي ذكر في حصن المسلم لتصل إليه بسرعة هنا في أي وقت.'
                : 'تأكد من كتابة الكلمة بشكل صحيح أو جرّب البحث بكلمة أخرى.'}
            </p>
            {activeFilter === 'favorites' && (
              <button
                onClick={() => setActiveFilter('time')}
                className={`mt-4 px-6 py-3 rounded-2xl font-black text-sm ${
                  isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'
                }`}
              >
                تصفح أذكار حصن المسلم
              </button>
            )}
          </div>
        ) : (
          filteredAthkar.map((item) => {
            const isFav = favorites.includes(item.id);
            const currentCount = counts[item.id] || 0;
            const isCompleted = currentCount >= item.repeat;
            const isFadlOpen = expandedFadlId === item.id;
            const categoryObj = HISN_CATEGORIES.find(c => c.id === item.categoryGroup);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 md:p-8 rounded-[2.8rem] border relative overflow-hidden transition-all duration-300 ${
                  isCompleted 
                    ? (isDark ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-emerald-50/40 border-emerald-200/70')
                    : (isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm hover:shadow-md')
                }`}
              >
                {/* شريط الإنجاز العلوي إذا كان الذكر يتطلب أكثر من تكرار */}
                {item.repeat > 1 && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      className={`h-full ${isCompleted ? 'bg-emerald-500' : (isDark ? 'bg-amber-400' : 'bg-emerald-600')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentCount / item.repeat) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* ترويسة البطاقة */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {categoryObj && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {getCategoryIcon(categoryObj.icon, 12)}
                          <span>{categoryObj.name}</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                          <Check size={12} strokeWidth={3} />
                          <span>تم الإكمال</span>
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl md:text-2xl font-black ${currentTheme.textMain}`}>
                      {item.title}
                    </h3>
                  </div>

                  {/* أزرار الإجراءات السريعة (مفضلة، نسخ، مشاركة) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                      className={`p-2.5 rounded-full transition-all active:scale-80 ${
                        isFav
                          ? 'bg-amber-500/10 text-amber-500'
                          : (isDark ? 'bg-zinc-800/80 text-zinc-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-zinc-800')
                      }`}
                    >
                      <Star size={18} className={isFav ? "fill-amber-400 text-amber-500" : ""} />
                    </button>

                    <button
                      onClick={(e) => handleCopy(item, e)}
                      title="نسخ الذكر"
                      className={`p-2.5 rounded-full transition-all active:scale-80 ${
                        copiedId === item.id
                          ? 'bg-emerald-500 text-white'
                          : (isDark ? 'bg-zinc-800/80 text-zinc-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-zinc-800')
                      }`}
                    >
                      {copiedId === item.id ? <Check size={18} /> : <Copy size={18} />}
                    </button>

                    <button
                      onClick={(e) => handleShare(item, e)}
                      title="مشاركة الذكر"
                      className={`p-2.5 rounded-full transition-all active:scale-80 ${
                        isDark ? 'bg-zinc-800/80 text-zinc-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-zinc-800'
                      }`}
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* نص الذكر */}
                <div 
                  onClick={() => handleIncrement(item)}
                  className={`my-6 p-5 md:p-6 rounded-[2rem] transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isDark 
                      ? 'bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800/60' 
                      : 'bg-emerald-50/20 hover:bg-emerald-50/40 border border-emerald-100/50'
                  }`}
                >
                  <p className={`text-xl md:text-2xl leading-[2.2] font-arabic font-bold text-justify md:text-right ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    {item.text}
                  </p>
                </div>

                {/* التخريج والفضل القابل للتوسيع */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold opacity-60">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} />
                      <span>{item.source}</span>
                    </span>

                    {item.fadl && (
                      <button
                        onClick={() => setExpandedFadlId(isFadlOpen ? null : item.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
                          isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Info size={13} />
                        <span>فضل الذكر</span>
                        {isFadlOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isFadlOpen && item.fadl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed font-medium border ${
                          isDark ? 'bg-amber-400/5 border-amber-400/20 text-amber-300' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles size={16} className="mt-0.5 shrink-0" />
                          <p>{item.fadl}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* عداد التكرار التفاعلي */}
                <div className="mt-6 pt-5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold opacity-40">التكرار:</span>
                    <span className="text-sm font-black">
                      {formatDigits(currentCount, activeNumberFormat)} / {formatDigits(item.repeat, activeNumberFormat)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentCount > 0 && (
                      <button
                        onClick={(e) => handleResetCount(item.id, e)}
                        title="إعادة التصفير"
                        className="p-3 rounded-2xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-90"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleIncrement(item)}
                      disabled={isCompleted}
                      className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md ${
                        isCompleted
                          ? 'bg-emerald-500 text-white cursor-default'
                          : (isDark ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20')
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check size={18} strokeWidth={3} />
                          <span>اكتمل التكرار</span>
                        </>
                      ) : (
                        <>
                          <span>كرّر الذكر</span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                            isDark ? 'bg-black/20' : 'bg-white/20'
                          }`}>
                            {formatDigits(item.repeat - currentCount, activeNumberFormat)} متبقٍ
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HisnMuslim;
