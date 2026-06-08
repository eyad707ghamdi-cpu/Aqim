
import React, { useState, useEffect } from 'react';
import { THEMES } from '../constants';
import { ThemeColor, Language } from '../types';
import { Calendar, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  theme: ThemeColor | 'dark';
  accentColorKey: ThemeColor; 
  language: Language;
  title: string;
  onToggleTheme?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, theme, accentColorKey, language, title, onToggleTheme }) => {
  const currentTheme = THEMES[theme] || THEMES.green;
  const isRtl = language === 'ar' || language === 'ur';
  const isDark = theme === 'dark';
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    const date = new Date();
    const hijriOptions = { 
      calendar: 'islamic-uma', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    
    try {
      const hijriFormatter = new Intl.DateTimeFormat(
        language === 'ar' ? 'ar-SA-u-ca-islamic-uma' : 'en-US-u-ca-islamic-uma', 
        hijriOptions as any
      );
      setHijriDate(hijriFormatter.format(date));
    } catch (e) {
      setHijriDate(language === 'ar' ? "١٢ شعبان ١٤٤٧" : "12 Sha'ban 1447");
    }
  }, [language]);

  const headerBg = isDark ? 'bg-zinc-950/80 border-b border-white/5' : 'bg-white/80 border-b border-black/5';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fcfcfc]'} relative`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <header className={`${headerBg} ${textColor} py-4 px-4 md:px-8 sticky top-0 z-50 backdrop-blur-2xl transition-all duration-500`}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          
          <div className="w-1/4 flex justify-start">
            <button 
              onClick={onToggleTheme} 
              className={`p-2.5 rounded-full ${isDark ? 'bg-zinc-900 text-zinc-400 hover:text-amber-400' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'} active:scale-95 transition-all`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-lg md:text-2xl font-black arabic-text tracking-tight"
            >
              {title}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.8 }} 
              className="flex items-center gap-1.5 mt-0.5 text-zinc-500 dark:text-zinc-400"
            >
              <span className="text-[10px] md:text-sm font-semibold tracking-tight">{hijriDate}</span>
            </motion.div>
          </div>

          <div className="w-1/4 flex justify-end text-zinc-400 dark:text-zinc-500">
             <span className="text-[10px] md:text-xs font-bold uppercase hidden sm:block tracking-widest">
               {new Date().toLocaleDateString(language, { weekday: 'short' })}
             </span>
          </div>

        </div>
      </header>
      
      <main className="flex-1 w-full mx-auto p-4 md:p-8 lg:p-10 pb-48 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
