import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Palette, ArrowRight, ArrowLeft, User, Hash, Info, AlertCircle, Sparkles, Check } from 'lucide-react';
import { Language, ThemeColor, UserSettings } from '../types';
import { THEMES, TRANSLATIONS, themeOptions } from '../constants';
import AppLoader from './AppLoader';

interface OnboardingProps {
  onComplete: (settings: Partial<UserSettings>, startTour?: boolean) => void;
  isTouring?: boolean;
  initialSettings?: Partial<UserSettings>;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isTouring = false, initialSettings }) => {
  const [showSplash, setShowSplash] = useState(!isTouring); 
  const [step, setStep] = useState(0); 
  
  const [tempSettings, setTempSettings] = useState<Partial<UserSettings>>(
    initialSettings || { language: 'ar', accentColor: 'green', isDarkMode: false, showPatterns: true, userName: '', numberFormat: 'arabic', loadingVariant: 'default' }
  );

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 2000); 
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const langCode = (tempSettings.language as Language) || 'ar';
  const t = TRANSLATIONS[langCode] || TRANSLATIONS.ar;
  const isRtl = langCode === 'ar' || langCode === 'ur' || langCode === 'fa';
  const accentColorKey = (tempSettings.accentColor as ThemeColor) || 'green';
  const isDark = tempSettings.isDarkMode;

  const handleNextSetup = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      onComplete({ ...tempSettings, language: 'ar' }, false);
    }
  };

  const handlePrevSetup = () => {
    if (step > 0) setStep(step - 1);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[500] bg-zinc-950 flex flex-col items-center justify-center text-center p-10 overflow-hidden">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-10">
          <AppLoader size="lg" />
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl font-black text-white arabic-text mb-4">أقِم</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="text-xs text-white/60 tracking-[0.5em] uppercase">أهلاً بك</motion.p>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[400] overflow-y-auto ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'}`}>
      <div className="max-w-xl mx-auto min-h-screen flex flex-col p-6 py-12">
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="text-center space-y-4">
                  <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${isDark ? 'bg-zinc-900 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <User size={40} />
                  </div>
                  <h2 className="text-3xl font-black">ما هو اسمك؟</h2>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    autoFocus
                    value={tempSettings.userName} 
                    onChange={(e) => setTempSettings({ ...tempSettings, userName: e.target.value })}
                    placeholder="ادخل اسمك هنا..."
                    className={`w-full p-6 rounded-3xl border-2 outline-none text-2xl font-bold transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 focus:border-amber-400 text-white' : 'bg-white border-gray-100 focus:border-emerald-500 text-zinc-900 shadow-xl'}`}
                  />
                  <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">سيظهر اسمك في قسم المجتمع والمقترحات</p>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="text-center space-y-4">
                  <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${isDark ? 'bg-zinc-900 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Palette size={40} />
                  </div>
                  <h2 className="text-3xl font-black">اختر مظهرك المفضل</h2>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {themeOptions.map(tc => (
                    <button 
                      key={tc} 
                      onClick={() => setTempSettings({ ...tempSettings, accentColor: tc })}
                      className={`w-full aspect-square rounded-2xl border-4 transition-all ${tempSettings.accentColor === tc ? (isDark ? 'border-amber-400 scale-110 shadow-lg' : 'border-emerald-600 scale-110 shadow-lg') : 'border-transparent'} ${THEMES[tc].primary}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setTempSettings({ ...tempSettings, isDarkMode: !tempSettings.isDarkMode })}
                  className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between font-bold transition-all ${isDark ? 'bg-zinc-900 border-amber-400 text-white' : 'bg-gray-50 border-gray-100 text-zinc-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
                    <span>تفعيل الوضع الليلي</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${tempSettings.isDarkMode ? (isDark ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-gray-300'}`}>
                    <motion.div 
                      animate={{ x: tempSettings.isDarkMode ? 24 : 0 }}
                      className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                    />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex gap-4">
          {step > 0 && (
            <button 
              onClick={handlePrevSetup} 
              className={`px-8 py-5 rounded-[1.8rem] font-black flex items-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-gray-100 text-zinc-500 hover:bg-gray-200'}`}
            >
              <ArrowRight size={24} />
            </button>
          )}
          <button 
            onClick={handleNextSetup} 
            disabled={step === 0 && !tempSettings.userName?.trim()}
            className={`flex-1 py-5 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}
          >
            <span>{step === 1 ? "ابدأ باستخدام أقِم" : "متابعة"}</span>
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;