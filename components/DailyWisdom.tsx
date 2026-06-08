
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw, Book, Sparkles, MessageCircle } from 'lucide-react';
import { Translation, Language, ThemeColor } from '../types';
import { THEMES, DAILY_INSPIRATIONS, Inspiration } from '../constants';

interface DailyWisdomProps {
  translations: Translation;
  language: Language;
  theme: ThemeColor | 'dark';
}

const DailyWisdom: React.FC<DailyWisdomProps> = ({ translations, language, theme }) => {
  const inspirations = DAILY_INSPIRATIONS[language] || DAILY_INSPIRATIONS['en'] || [];
  const [index, setIndex] = useState(0);
  const isDark = theme === 'dark';

  const rotate = useCallback(() => {
    setIndex(prev => (prev + 1) % inspirations.length);
  }, [inspirations.length]);

  useEffect(() => {
    if (inspirations.length > 0) {
      setIndex(Math.floor(Math.random() * inspirations.length));
      const interval = setInterval(rotate, 600000); // 10 mins
      return () => clearInterval(interval);
    }
  }, [inspirations.length, rotate]);

  if (inspirations.length === 0) return null;

  const current = inspirations[index];

  const getTypeIcon = (type: Inspiration['type']) => {
    switch(type) {
      case 'hadith': return <Book size={16} />;
      case 'sunnah': return <Sparkles size={16} />;
      default: return <MessageCircle size={16} />;
    }
  };

  const getTypeName = (type: Inspiration['type']) => {
    if (language !== 'ar') return type.toUpperCase();
    switch(type) {
      case 'hadith': return "حديث شريف";
      case 'sunnah': return "سنة مهجورة";
      default: return "حكمة إيمانية";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full mb-10 p-10 rounded-[3.5rem] border relative overflow-hidden transition-all duration-700 ${
        isDark 
        ? 'bg-zinc-900/60 border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.4)]' 
        : 'bg-white border-emerald-50 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className={`absolute -right-6 -top-6 opacity-[0.05] ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}>
        <Quote size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-8 w-full justify-between px-2">
           <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-50 text-emerald-700'}`}>
              {getTypeIcon(current.type)}
              <span className="text-[10px] font-black uppercase tracking-widest">{getTypeName(current.type)}</span>
           </div>

          <motion.button
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={rotate}
            className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
            title="تحديث الإلهام"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <p className={`text-2xl sm:text-3xl font-arabic font-bold leading-[1.8] px-4 ${isDark ? 'text-zinc-100' : 'text-emerald-950'}`}>
              "{current.text}"
            </p>
            {current.source && (
               <span className={`mt-6 text-[11px] font-black opacity-40 uppercase tracking-[0.2em] ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}>
                 — {current.source}
               </span>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2], width: [32, 48, 32] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`mt-10 h-1 rounded-full ${isDark ? 'bg-amber-400/30' : 'bg-emerald-500/30'}`}
        />
      </div>
    </motion.div>
  );
};

export default DailyWisdom;
