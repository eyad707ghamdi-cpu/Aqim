
import React, { useState, useEffect } from 'react';
import { Home, Settings as SettingsIcon, BookOpen, Navigation, Book, MessageSquare, Users, Loader2, Trophy, Coins, Heart, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PrayerTimes from './components/PrayerTimes';
import Tasbih from './components/Tasbih';
import AminChat from './components/AminChat';
import Settings from './components/Settings';
import Athkar from './components/Athkar';
import Duas from './components/Duas';
import Qibla from './components/Qibla';
import Quran from './components/Quran';
import Community from './components/Community';
import Onboarding from './components/Onboarding';
import DailyWisdom from './components/DailyWisdom';
import IslamicQuiz from './components/IslamicQuiz';
import { TRANSLATIONS, THEMES, FONT_OPTIONS, formatDigits } from './constants';
import { UserSettings, Language, ThemeColor } from './types';
import { db, doc, getDoc, updateDoc, increment } from './services/firebase';

type Tab = 'home' | 'quran' | 'community' | 'quiz' | 'dhikr' | 'duas' | 'qibla' | 'amin' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isInitializing, setIsInitializing] = useState(false);
  
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
      fontFamily: 'noto',
      userName: '',
      isDeveloperMode: false,
      points: 0
    };
    try {
      const saved = localStorage.getItem('aqim_app_settings_v1');
      if (saved) return { ...defaults, ...JSON.parse(saved) };
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

  const selectedFont = FONT_OPTIONS.find(f => f.id === settings.fontFamily)?.family || "'Noto Sans Arabic', sans-serif";

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-emerald-900 font-black tracking-widest text-xs uppercase">الصلاة نجاة</p>
      </div>
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
        title="الصلاة نجاة" 
        onToggleTheme={() => updateSettings({ isDarkMode: !isDark })}
      >
        <div className="fixed top-28 right-4 z-[60] md:top-32 md:right-10 flex flex-col items-end gap-3 pointer-events-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 backdrop-blur-md shadow-xl pointer-events-auto ${isDark ? 'bg-zinc-900 border-amber-400 text-amber-400' : 'bg-white border-emerald-50 text-emerald-600'}`}
          >
            <Coins size={18} className="animate-bounce" />
            <span className="font-black text-sm">{formatDigits(settings.points || 0, settings.numberFormat)}</span>
          </motion.div>
        </div>

        <div className="mt-2 min-h-[60vh] relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full">
              {activeTab === 'home' && (
                <div className="space-y-10">
                  <DailyWisdom translations={t} language={settings.language} theme={effectiveThemeKey} />
                  <PrayerTimes translations={t} theme={effectiveThemeKey} language={settings.language} notificationsEnabled={settings.notificationsEnabled} selectedMuezzin={settings.selectedMuezzin} timeFormat={settings.timeFormat} numberFormat={settings.numberFormat} accentColor={accentInfo.accent} userName={settings.userName} />
                </div>
              )}
              {activeTab === 'quran' && <Quran translations={t} language={settings.language} theme={effectiveThemeKey} numberFormat={settings.numberFormat} />}
              {activeTab === 'community' && (
                <Community 
                  theme={effectiveThemeKey} 
                  language={settings.language} 
                  isAdmin={settings.isDeveloperMode} 
                  userName={settings.userName}
                  telegramConfig={{ botToken: settings.telegramBotToken, chatId: settings.telegramChatId }}
                />
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

        <nav className={`fixed bottom-0 left-0 right-0 border-t px-2 py-3 z-50 transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center relative h-16">
            <NavItem isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label={isRtlNav ? "الرئيسية" : "Home"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'quran'} onClick={() => setActiveTab('quran')} icon={<Book size={22} />} label={isRtlNav ? "القرآن" : "Quran"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={<Users size={22} />} label={isRtlNav ? "المجتمع" : "Community"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<Trophy size={22} />} label={isRtlNav ? "تحدي" : "Quiz"} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'dhikr'} onClick={() => setActiveTab('dhikr')} icon={<BookOpen size={22} />} label={t.athkar} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'duas'} onClick={() => setActiveTab('duas')} icon={<Heart size={22} />} label={t.duas} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'qibla'} onClick={() => setActiveTab('qibla')} icon={<Navigation size={22} />} label={t.qibla} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'amin'} onClick={() => setActiveTab('amin')} icon={<MessageSquare size={22} />} label={t.aminName} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
            <NavItem isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={22} />} label={t.settings} theme={currentTheme} accentColor={accentInfo.accent} isDarkMode={isDark} />
          </div>
        </nav>
      </Layout>
    </div>
  );
};

const NavItem = ({ isActive, onClick, icon, label, theme, accentColor, isDarkMode }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all h-full relative`}>
    <motion.div animate={isActive ? { scale: 1.25, y: -3 } : { scale: 1, y: 0 }} className={`transition-all duration-300 ${isActive ? (isDarkMode ? accentColor : theme.accent) : 'text-zinc-500 opacity-60'}`}>
      {icon}
    </motion.div>
    <span className={`text-[9px] font-black ${isActive ? (isDarkMode ? accentColor : theme.accent) : 'text-zinc-500'}`}>{label}</span>
  </button>
);

export default App;
