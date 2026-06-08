
import React, { useState, useEffect } from 'react';
import { Home, Settings as SettingsIcon, BookOpen, Navigation, MessageSquare, Trophy, Coins, Heart, LogIn, LayoutGrid, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PrayerTimes from './components/PrayerTimes';
import Tasbih from './components/Tasbih';
import AminChat from './components/AminChat';
import Settings from './components/Settings';
import Athkar from './components/Athkar';
import Duas from './components/Duas';
import Qibla from './components/Qibla';
import Onboarding from './components/Onboarding';
import DailyWisdom from './components/DailyWisdom';
import IslamicQuiz from './components/IslamicQuiz';
import AppLoader from './components/AppLoader';
import { TRANSLATIONS, THEMES, FONT_OPTIONS, formatDigits } from './constants';
import { UserSettings, Language, ThemeColor } from './types';
import { db, doc, getDoc, updateDoc, increment } from './services/firebase';

type Tab = 'home' | 'quiz' | 'dhikr' | 'duas' | 'qibla' | 'amin' | 'settings';

const TABS: Tab[] = ['home', 'quiz', 'dhikr', 'duas', 'qibla', 'amin', 'settings'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [prevTab, setPrevTab] = useState<Tab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    // Artificial delay for splash or real initialization
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const activeIdx = TABS.indexOf(activeTab);
  const prevIdx = TABS.indexOf(prevTab);
  const slideDirection = activeIdx > prevIdx ? 1 : -1;

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  const [settings, setSettings] = useState<UserSettings>(() => {
    const defaults: UserSettings = {
      language: 'ar',
      accentColor: 'green',
      isDarkMode: false,
      timeFormat: '12h',
      numberFormat: 'arabic',
      subscriptionTier: 'none',
      isSubscribed: false, 
      notificationsEnabled: false,
      selectedMuezzin: 'makkah',
      hasCompletedOnboarding: false,
      loadingVariant: 'default',
      fontFamily: 'system',
      userName: '',
      isDeveloperMode: false,
      points: 10000
    };
    try {
      const saved = localStorage.getItem('aqim_app_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure points are at least 10000 as requested
        // Force font to system as requested
        return { ...defaults, ...parsed, points: Math.max(parsed.points || 0, 10000), fontFamily: 'system' };
      }
    } catch (e) {}
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem('aqim_app_settings_v1', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleAddPoints = (amount: number) => {
    const newPoints = (settings.points || 0) + amount;
    updateSettings({ points: newPoints });
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.ar;
  const isDark = settings.isDarkMode;
  const effectiveThemeKey = isDark ? 'dark' : settings.accentColor;
  const currentTheme = THEMES[effectiveThemeKey];
  const accentInfo = THEMES[settings.accentColor]; 
  const isRtlNav = settings.language === 'ar' || settings.language === 'ur';

  const selectedFont = settings.fontFamily === 'system' ? "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'" : FONT_OPTIONS.find(f => f.id === settings.fontFamily)?.family || "'Noto Sans Arabic', sans-serif";

  if (isInitializing) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[1000]"
      >
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative"
        >
          <AppLoader size="lg" />
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <h1 className="text-zinc-100 text-3xl font-black tracking-tighter mb-2">أقِم</h1>
        </motion.div>
      </motion.div>
    );
  }

  if (!settings.hasCompletedOnboarding) {
    return <Onboarding onComplete={(u) => updateSettings({ ...u, hasCompletedOnboarding: true })} />;
  }

  return (
    <div style={{ fontFamily: selectedFont }}>
      <Layout 
        theme={effectiveThemeKey} 
        accentColorKey={settings.accentColor} 
        language={settings.language} 
        title="أقِم" 
        onToggleTheme={() => updateSettings({ isDarkMode: !isDark })}
      >
        <div className="fixed top-24 right-4 z-[60] md:top-28 md:right-8 flex flex-col items-end gap-3 pointer-events-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border backdrop-blur-xl shadow-lg pointer-events-auto ${isDark ? 'bg-zinc-900/60 border-amber-500/30 text-amber-400' : 'bg-white/60 border-emerald-500/20 text-emerald-600'}`}
          >
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
              <Coins size={18} strokeWidth={2.5} />
            </motion.div>
            <span className="font-extrabold text-sm tracking-tight">{formatDigits(settings.points || 0, settings.numberFormat)}</span>
          </motion.div>
        </div>

        <div className="mt-2 min-h-[70vh] relative z-10 w-full md:pb-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, x: slideDirection * 20 }} 
              animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }} 
              exit={{ opacity: 0, x: -slideDirection * 20, transition: { duration: 0.2 } }} 
              className="w-full"
            >
              {activeTab === 'home' && (
                <div className="space-y-10">
                  <DailyWisdom translations={t} language={settings.language} theme={effectiveThemeKey} />
                  <PrayerTimes translations={t} theme={effectiveThemeKey} language={settings.language} notificationsEnabled={settings.notificationsEnabled} selectedMuezzin={settings.selectedMuezzin} timeFormat={settings.timeFormat} numberFormat={settings.numberFormat} accentColor={accentInfo.accent} userName={settings.userName} />
                </div>
              )}
              {activeTab === 'quiz' && (
                <IslamicQuiz 
                  theme={effectiveThemeKey} 
                  language={settings.language} 
                  numberFormat={settings.numberFormat} 
                  onPointsEarned={handleAddPoints}
                />
              )}
              {activeTab === 'dhikr' && <div className="space-y-8"><Tasbih translations={t} theme={effectiveThemeKey} numberFormat={settings.numberFormat} /><Athkar translations={t} theme={effectiveThemeKey} language={settings.language} numberFormat={settings.numberFormat} /></div>}
              {activeTab === 'duas' && <Duas translations={t} theme={effectiveThemeKey} language={settings.language} numberFormat={settings.numberFormat} />}
              {activeTab === 'qibla' && <Qibla translations={t} theme={effectiveThemeKey} numberFormat={settings.numberFormat} />}
              {activeTab === 'amin' && <AminChat translations={t} language={settings.language} theme={effectiveThemeKey} subscriptionTier={settings.subscriptionTier} onSubscribe={() => setActiveTab('settings')} userName={settings.userName} />}
              {activeTab === 'settings' && (
                <Settings 
                  translations={t} 
                  settings={settings} 
                  updateSettings={updateSettings} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Full-Screen Menu Overlay on Mobile */}
        <AnimatePresence>
          {isMenuOpen && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-zinc-900/20 dark:bg-black/40 backdrop-blur-sm"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`fixed bottom-[5.5rem] left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] rounded-3xl z-40 overflow-hidden border backdrop-blur-2xl ${isDark ? 'bg-zinc-900/90 border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]' : 'bg-white/95 border-slate-200 shadow-[0_12px_40px_rgb(0,0,0,0.15)]'}`}
              >
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-center mb-5 md:mb-6">
                    <h3 className={`font-black tracking-tight text-lg ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                      {isRtlNav ? "المزيد من الخدمات" : "More Services"}
                    </h3>
                    <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-full active:scale-90 transition-transform ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
                      <X size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <MenuButton icon={<Trophy/>} label={isRtlNav ? "تحدي" : "Quiz"} onClick={() => handleTabChange('quiz')} isActive={activeTab === 'quiz'} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                    <MenuButton icon={<Heart/>} label={t.duas} onClick={() => handleTabChange('duas')} isActive={activeTab === 'duas'} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                    <MenuButton icon={<Navigation/>} label={t.qibla} onClick={() => handleTabChange('qibla')} isActive={activeTab === 'qibla'} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                    <MenuButton icon={<SettingsIcon/>} label={t.settings} onClick={() => handleTabChange('settings')} isActive={activeTab === 'settings'} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <nav className={`fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-max max-w-[420px] md:max-w-5xl mx-auto rounded-[2rem] border z-50 backdrop-blur-[40px] saturate-[1.5] transition-all duration-500 overflow-hidden ${isDark ? 'bg-zinc-900/50 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-white/50 border-white/70 shadow-[0_8px_32px_rgba(31,38,135,0.07)]'}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 pointer-events-none rounded-[2rem]"></div>
          <div className="flex justify-between md:justify-center items-center h-[4.5rem] px-3 md:px-6 w-full relative z-10">
            {isMobile ? (
              <>
                <NavItem isActive={activeTab === 'home' && !isMenuOpen} onClick={() => handleTabChange('home')} icon={<Home size={22} />} label={isRtlNav ? "الرئيسية" : "Home"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'amin' && !isMenuOpen} onClick={() => handleTabChange('amin')} icon={<MessageSquare size={22} />} label={t.aminName} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'dhikr' && !isMenuOpen} onClick={() => handleTabChange('dhikr')} icon={<BookOpen size={22} />} label={t.athkar} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={isMenuOpen || ['quiz', 'duas', 'qibla', 'settings'].includes(activeTab)} onClick={() => setIsMenuOpen(!isMenuOpen)} icon={<LayoutGrid size={22} />} label={isRtlNav ? "المزيد" : "More"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
              </>
            ) : (
              <>
                <NavItem isActive={activeTab === 'home'} onClick={() => handleTabChange('home')} icon={<Home size={22} />} label={isRtlNav ? "الرئيسية" : "Home"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'quiz'} onClick={() => handleTabChange('quiz')} icon={<Trophy size={22} />} label={isRtlNav ? "تحدي" : "Quiz"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'dhikr'} onClick={() => handleTabChange('dhikr')} icon={<BookOpen size={22} />} label={t.athkar} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'duas'} onClick={() => handleTabChange('duas')} icon={<Heart size={22} />} label={t.duas} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'qibla'} onClick={() => handleTabChange('qibla')} icon={<Navigation size={22} />} label={t.qibla} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'amin'} onClick={() => handleTabChange('amin')} icon={<MessageSquare size={22} />} label={t.aminName} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
                <NavItem isActive={activeTab === 'settings'} onClick={() => handleTabChange('settings')} icon={<SettingsIcon size={22} />} label={t.settings} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
              </>
            )}
          </div>
        </nav>
      </Layout>
    </div>
  );
};

const NavItem = ({ isActive, onClick, icon, label, theme, accentColor, isDarkMode }: any) => (
  <button 
    onClick={onClick} 
    className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] md:min-w-[5rem] h-full transition-all flex-shrink-0 relative group"
  >
    <motion.div 
      initial={false}
      animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }} 
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`transition-colors duration-300 ${isActive ? (isDarkMode ? accentColor : theme.accent) : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}
    >
      {React.cloneElement(icon, { strokeWidth: isActive ? 2.5 : 2, size: 20 })}
    </motion.div>
    <motion.span 
      initial={false}
      animate={{ opacity: isActive ? 1 : 0.6, scale: isActive ? 1.05 : 1 }}
      className={`text-[8.5px] md:text-[10px] font-bold tracking-wide transition-colors duration-300 ${isActive ? (isDarkMode ? accentColor : theme.accent) : 'text-zinc-500'}`}
    >
      {label}
    </motion.span>
    {isActive && (
      <motion.div 
        layoutId="activeTabIndicator"
        className={`absolute bottom-2 w-1 h-1 rounded-full ${isDarkMode ? 'bg-zinc-100' : 'bg-zinc-800'}`} 
      />
    )}
  </button>
);

const MenuButton = ({ icon, label, onClick, isActive, theme, accentColor, isDarkMode }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl gap-2 transition-all active:scale-95 ${isActive ? (isDarkMode ? `bg-zinc-800 ${accentColor}` : `bg-gray-100 ${theme.accent}`) : (isDarkMode ? 'bg-zinc-800/40 text-zinc-400 border border-transparent hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200' : 'bg-white border border-transparent hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm')}`}
  >
    <div className={`${isActive ? (isDarkMode ? accentColor : theme.accent) : ''}`}>
       {React.cloneElement(icon, { strokeWidth: isActive ? 2.5 : 2, size: 26 })}
    </div>
    <span className="text-[10px] md:text-[11px] font-bold">{label}</span>
  </button>
);

export default App;
