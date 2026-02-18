
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { Translation, Language, ThemeColor, AthkarCategory, NumberFormat } from '../types';
import { THEMES, ATHKAR_DATA, formatDigits } from '../constants';

interface AthkarProps {
  translations: Translation;
  language: Language;
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
}

const Athkar: React.FC<AthkarProps> = ({ translations, language, theme, numberFormat = 'latin' }) => {
  const [selectedCategory, setSelectedCategory] = useState<AthkarCategory | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const currentTheme = THEMES[theme];
  const isRtl = language === 'ar' || language === 'ur';
  const activeNumberFormat = numberFormat as NumberFormat;

  const categories = ATHKAR_DATA[language] || ATHKAR_DATA['en'];

  useEffect(() => {
    if (selectedCategory) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  const handleItemClick = (categoryId: string, itemIdx: number, max: number) => {
    const id = `${categoryId}-${itemIdx}`; const current = counts[id] || 0;
    if (current < max) {
      if ('vibrate' in navigator) navigator.vibrate(10);
      setCounts({ ...counts, [id]: current + 1 });
    }
  };

  if (selectedCategory) {
    return (
      <motion.div initial={{ opacity: 0, x: isRtl ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-20 max-w-4xl mx-auto">
        <div className="sticky top-20 z-20 bg-opacity-80 backdrop-blur-md py-6 px-2">
          <button onClick={() => setSelectedCategory(null)} className={`flex items-center gap-3 mb-4 ${currentTheme.textMuted} font-black text-lg bg-white/20 dark:bg-black/20 px-6 py-3 rounded-full shadow-sm`}>
            {isRtl ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            {translations.athkar}
          </button>
          <h2 className={`text-4xl sm:text-6xl font-black mt-2 px-4 ${currentTheme.textMain}`}>{selectedCategory.title}</h2>
        </div>
        <div className="space-y-6 px-2">
          {selectedCategory.items.map((item, idx) => {
            const id = `${selectedCategory.id}-${idx}`; const currentCount = counts[id] || 0; const isDone = currentCount >= item.repeat;
            return (
              <motion.div key={idx} whileTap={{ scale: 0.98 }} onClick={() => handleItemClick(selectedCategory.id, idx, item.repeat)} className={`p-8 sm:p-14 rounded-[3.5rem] border transition-all cursor-pointer relative overflow-hidden shadow-sm ${isDone ? (theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200') : `${currentTheme.card} ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-100'} hover:shadow-md`}`}>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8">
                  <div className="flex-1 w-full">
                    <p className={`text-2xl sm:text-4xl font-arabic leading-relaxed ${isRtl ? 'text-right' : 'text-left'} ${isDone ? `${currentTheme.accent}` : currentTheme.textMain}`}>{item.text}</p>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <span className={`text-lg font-black px-8 py-3 rounded-3xl shadow-inner ${isDone ? `${theme === 'dark' ? 'bg-emerald-500 text-white' : 'bg-emerald-200 text-emerald-800'}` : `${theme === 'dark' ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}`}>
                          {formatDigits(currentCount, activeNumberFormat)} / {formatDigits(item.repeat, activeNumberFormat)}
                        </span>
                        {isDone && <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">{translations.completed}</span>}
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>{isDone && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-500 text-white rounded-full p-3 shadow-xl"><CheckCircle size={48} /></motion.div>}</AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => setSelectedCategory(cat)} className={`${currentTheme.card} p-12 sm:p-16 border ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-100'} rounded-[3.5rem] hover:scale-[1.03] transition-all group flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-xl`}>
          <div className="relative z-10 text-right">
            <h3 className={`text-3xl sm:text-4xl font-black ${currentTheme.textMain} mb-3`}>{cat.title}</h3>
            <p className={`text-lg font-bold ${currentTheme.textMuted} flex items-center gap-2`}><span className={`w-3 h-3 rounded-full ${currentTheme.primary}`} />{formatDigits(cat.items.length, activeNumberFormat)} {language === 'ar' ? 'ذكراً' : 'items'}</p>
          </div>
          <div className={`p-6 rounded-[2rem] ${currentTheme.secondary} ${currentTheme.accent} group-hover:scale-110 transition-transform`}>{isRtl ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}</div>
        </button>
      ))}
    </div>
  );
};

export default Athkar;
