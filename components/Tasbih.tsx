
import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translation, ThemeColor, NumberFormat } from '../types';
import { THEMES, formatDigits } from '../constants';
import { CrescentStarIcon } from './Icons';

interface TasbihProps {
  translations: Translation;
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
}

const Tasbih: React.FC<TasbihProps> = ({ translations, theme, numberFormat = 'latin' }) => {
  const [count, setCount] = useState(0);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const currentTheme = THEMES[theme];
  const activeNumberFormat = numberFormat as NumberFormat;

  const handleIncrement = () => {
    if ('vibrate' in navigator) navigator.vibrate(30);
    setCount(prev => prev + 1);
    if (isConfirmingReset) setIsConfirmingReset(false);
  };

  const executeReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResetting(true);
    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);
    
    setTimeout(() => {
      setCount(0);
      setIsConfirmingReset(false);
      setTimeout(() => setIsResetting(false), 500);
    }, 100);
  };

  const cancelReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingReset(false);
  };

  const startResetFlow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmingReset(true);
  };

  return (
    <div className="flex flex-col items-center py-10 md:py-16">
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        {/* حلقات الخلفية */}
        <motion.div 
          animate={isResetting ? { rotate: 360, scale: 0.8, opacity: 0 } : { rotate: 360 }}
          transition={isResetting ? { duration: 0.5 } : { duration: 6, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 rounded-full border-2 md:border-4 border-dashed ${currentTheme.border} opacity-30`} 
        />

        <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] -rotate-90">
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={`${currentTheme.accent} opacity-20`}
            animate={isResetting ? { pathLength: 0 } : { pathLength: (count % 100) / 100 }}
            transition={{ duration: isResetting ? 0.5 : 0.3 }}
          />
        </svg>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          animate={isResetting ? { 
            scale: [1, 0.9, 1.1, 1],
            x: [0, -5, 5, -5, 5, 0] 
          } : { scale: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleIncrement}
          className={`w-52 h-52 md:w-64 md:h-64 rounded-full ${currentTheme.primary} text-white flex flex-col items-center justify-center shadow-2xl relative z-10 overflow-hidden group`}
        >
          {/* تأثير الوميض عند التصفير */}
          <AnimatePresence>
            {isResetting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-30"
              />
            )}
          </AnimatePresence>

          <div className="relative z-20 flex flex-col items-center px-4">
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={count}
                initial={isResetting ? { y: -50, opacity: 0 } : { y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={isResetting ? { y: 50, opacity: 0 } : { y: -15, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-6xl md:text-7xl font-black font-mono tracking-tighter truncate w-full text-center"
              >
                {formatDigits(count, activeNumberFormat)}
              </motion.span>
            </AnimatePresence>
            
            <motion.div
              animate={isResetting ? { rotate: 720, scale: 1.5 } : { rotate: 0, scale: 1 }}
            >
              <CrescentStarIcon className="w-8 h-8 md:w-10 md:h-10 mt-2 opacity-50" fill="currentColor" />
            </motion.div>
          </div>
        </motion.button>
      </div>

      <div className="mt-12 md:mt-16 flex flex-col items-center gap-6">
        <p className={`text-xs md:text-sm font-black uppercase tracking-[0.4em] ${currentTheme.textMuted} opacity-50`}>
          {translations.count}
        </p>
        
        <div className="flex gap-4 min-h-[50px]">
          <AnimatePresence mode="wait">
            {!isConfirmingReset ? (
              <motion.button 
                key="reset-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={startResetFlow}
                className={`flex items-center gap-2 px-10 py-4 rounded-2xl ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} font-black text-base md:text-lg transition-all border border-red-100/10 shadow-sm`}
              >
                <RotateCcw size={20} />
                {translations.reset}
              </motion.button>
            ) : (
              <motion.div 
                key="confirm-box" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-3"
              >
                <button 
                  onClick={executeReset} 
                  className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform"
                >
                  {translations.reset}
                </button>
                <button 
                  onClick={cancelReset} 
                  className={`${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'} px-8 py-4 rounded-2xl font-black active:scale-95 transition-transform`}
                >
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Tasbih;
