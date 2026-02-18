
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

  const headerGradient = isDark ? 'from-zinc-900 via-zinc-900 to-zinc-950' : `bg-gradient-to-r ${currentTheme.gradient}`;

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'} ${currentTheme.textMain} relative`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <header className={`${isDark ? 'bg-zinc-900/90 border-b border-zinc-800' : headerGradient} text-white py-6 px-4 md:px-8 shadow-2xl sticky top-0 z-50 backdrop-blur-xl transition-all duration-500`}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 items-center">
          
          <div className="flex justify-start">
            <button 
              onClick={onToggleTheme} 
              className={`p-3 md:p-4 rounded-2xl ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white/10 border-white/20'} backdrop-blur-md border active:scale-90 transition-all shadow-xl`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} className="text-amber-400 md:w-6 md:h-6" /> : <Moon size={20} className="md:w-6 md:h-6" />}
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xl md:text-4xl font-black arabic-text tracking-tight drop-shadow-md"
            >
              {title}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.9 }} 
              className="flex items-center gap-1.5 mt-1"
            >
              <Calendar size={12} className="opacity-70 md:w-4 md:h-4" />
              <span className="text-[10px] md:text-sm font-bold tracking-tight opacity-90">{hijriDate}</span>
            </motion.div>
          </div>

          <div className="flex justify-end opacity-60">
             <span className="text-[10px] md:text-xs font-black uppercase hidden sm:block tracking-widest">
               {new Date().toLocaleDateString(language, { weekday: 'long' })}
             </span>
          </div>

        </div>
      </header>
      
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-10 lg:p-12 pb-32 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
