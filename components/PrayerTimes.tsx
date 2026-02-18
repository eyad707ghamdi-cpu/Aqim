
import { Clock, Quote, Bell, Timer, MapPin, Loader2, VolumeX, Sunrise, Sun, CloudSun, Moon, CloudMoon, Volume2, XCircle, AlertCircle, Play } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrayerTime, Translation, ThemeColor, Language, TimeFormat, NumberFormat, LoadingVariant } from '../types';
import { THEMES, WISDOMS, MUEZZINS, formatDigits } from '../constants';

interface PrayerTimesProps {
  translations: Translation;
  theme: ThemeColor | 'dark';
  language: Language;
  notificationsEnabled: boolean;
  selectedMuezzin: string;
  timeFormat: TimeFormat;
  numberFormat: NumberFormat;
  accentColor: string; 
  userName?: string;
  loadingVariant?: LoadingVariant;
}

const PrayerTimes: React.FC<PrayerTimesProps> = ({ 
  translations, 
  theme, 
  language, 
  notificationsEnabled, 
  selectedMuezzin,
  timeFormat,
  numberFormat,
  accentColor,
  userName,
  loadingVariant = 'default'
}) => {
  const isRtl = language === 'ar' || language === 'ur';
  const currentTheme = THEMES[theme];
  const isDark = theme === 'dark';
  const [currentTime, setCurrentTime] = useState(new Date());
  const [preciseCountdown, setPreciseCountdown] = useState("00:00:00");
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);
  const [currentPrayerPlaying, setCurrentPrayerPlaying] = useState("");
  const [greeting, setGreeting] = useState("");
  const [adhanBlocked, setAdhanBlocked] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAdhanPlayedTime = useRef<string | null>(null);

  useEffect(() => {
    const hours = currentTime.getHours();
    if (hours >= 4 && hours < 12) {
      setGreeting(translations.goodMorning);
    } else {
      setGreeting(translations.goodEvening);
    }
  }, [currentTime, translations]);

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAdhanPlaying(false);
      setCurrentPrayerPlaying("");
      setAdhanBlocked(false);
    }
  };

  const playAdhan = useCallback((prayerName: string, force = false) => {
    if ((!notificationsEnabled && !force) || (isAdhanPlaying && !force)) return;
    
    const muezzin = MUEZZINS.find(m => m.id === selectedMuezzin) || MUEZZINS[0];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = muezzin.url;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsAdhanPlaying(true);
          setCurrentPrayerPlaying(prayerName);
          setAdhanBlocked(false);
        }).catch(err => {
          console.error("Adhan playback blocked by browser:", err);
          setAdhanBlocked(true);
          setCurrentPrayerPlaying(prayerName);
        });
      }
    }
  }, [notificationsEnabled, selectedMuezzin, isAdhanPlaying]);

  const formatTime = (timeStr: string) => {
    let displayTime = timeStr;
    let suffix = '';
    
    if (timeFormat === '12h') {
      const [h, m] = timeStr.split(':').map(Number);
      suffix = h >= 12 ? (language === 'ar' ? ' م' : ' PM') : (language === 'ar' ? ' ص' : ' AM');
      const h12 = h % 12 || 12;
      displayTime = `${h12}:${m.toString().padStart(2, '0')}`;
    }
    
    return formatDigits(displayTime, numberFormat) + suffix;
  };

  const getPrayerIcon = (key: string) => {
    const iconProps = { size: 24, className: "md:w-7 md:h-7" };
    let icon: React.ReactNode;
    switch (key) {
      case 'fajr': icon = <Sunrise {...iconProps} />; break;
      case 'dhuhr': icon = <Sun {...iconProps} />; break;
      case 'asr': icon = <CloudSun {...iconProps} />; break;
      case 'maghrib': icon = <CloudMoon {...iconProps} />; break;
      case 'isha': icon = <Moon {...iconProps} />; break;
      default: icon = <Clock {...iconProps} />;
    }
    return <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 5, repeat: Infinity }}>{icon}</motion.div>;
  };

  const fetchTimings = useCallback(async (lat: number, lng: number, isDefault = false) => {
    try {
      setLoading(true);
      const timestamp = Math.floor(Date.now() / 1000);
      const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4`);
      const data = await response.json();
      if (data.code === 200) {
        const t = data.data.timings;
        setPrayers([
          { name: translations.fajr, time: t.Fajr, key: 'fajr' },
          { name: translations.dhuhr, time: t.Dhuhr, key: 'dhuhr' },
          { name: translations.asr, time: t.Asr, key: 'asr' },
          { name: translations.maghrib, time: t.Maghrib, key: 'maghrib' },
          { name: translations.isha, time: t.Isha, key: 'isha' },
        ]);
        
        if (isDefault) {
          setLocationName(language === 'ar' ? "مكة المكرمة (افتراضي)" : "Makkah (Default)");
        } else {
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language}`);
            const geoData = await geoRes.json();
            setLocationName(`${geoData.address.city || geoData.address.state || ""}, ${geoData.address.country}`);
          } catch (e) {
            setLocationName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
          }
        }
      }
    } catch (err) { 
      console.error(err); 
      // المحاولة الأخيرة بمكة إذا فشل كل شيء
      if (!isDefault) fetchTimings(21.4225, 39.8262, true);
    } finally { 
      setLoading(false); 
    }
  }, [translations, language]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationDenied(false);
          fetchTimings(pos.coords.latitude, pos.coords.longitude);
        }, 
        () => {
          setLocationDenied(true);
          // استخدام مكة المكرمة كافتراضي عند الرفض
          fetchTimings(21.4225, 39.8262, true);
        }
      );
    } else {
      setLocationDenied(true);
      fetchTimings(21.4225, 39.8262, true);
    }
  }, [fetchTimings]);

  useEffect(() => {
    if (prayers.length === 0) return;
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
      
      const currentPrayer = prayers.find(p => p.time === timeStr);
      if (currentPrayer && lastAdhanPlayedTime.current !== timeStr) {
        playAdhan(currentPrayer.name);
        lastAdhanPlayedTime.current = timeStr;
      }

      const nowMin = now.getHours() * 60 + now.getMinutes();
      let next = prayers.find(p => { const [h, m] = p.time.split(':').map(Number); return (h * 60 + m) > nowMin; }) || prayers[0];
      const [h, m] = next.time.split(':').map(Number);
      let target = new Date(); target.setHours(h, m, 0); if (target < now) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      const hh = Math.floor(diff / 3600000); const mm = Math.floor((diff % 3600000) / 60000); const ss = Math.floor((diff % 60000) / 1000);
      setPreciseCountdown(`${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [prayers, playAdhan]);

  const nextPrayer = prayers.find(p => {
    const nowStr = currentTime.getHours().toString().padStart(2, '0') + ":" + currentTime.getMinutes().toString().padStart(2, '0');
    return p.time > nowStr;
  }) || prayers[0];

  const cardGradient = isDark ? 'from-zinc-900 via-zinc-900 to-zinc-800' : `bg-gradient-to-br ${currentTheme.gradient}`;

  if (loading && prayers.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 py-40">
      <Loader2 size={60} className={`animate-spin ${isDark ? 'text-amber-400' : 'text-emerald-600'}`} />
      <p className="animate-pulse opacity-70 mt-12 font-black font-arabic text-xl">{translations.detectingLocation}</p>
    </div>
  );

  return (
    <div className="space-y-10 md:space-y-14 pb-10">
      <audio ref={audioRef} onEnded={() => { setIsAdhanPlaying(false); setCurrentPrayerPlaying(""); }} />

      <div className="flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-zinc-900 text-amber-400' : 'bg-white text-emerald-600'}`}>
            {currentTime.getHours() >= 4 && currentTime.getHours() < 18 ? <Sun size={28} className="md:w-10 md:h-10" /> : <Moon size={28} className="md:w-10 md:h-10" />}
          </div>
          <div>
            <h2 className={`text-2xl md:text-5xl font-black font-arabic ${isDark ? 'text-white' : 'text-emerald-900'}`}>{greeting} {userName && <span> {userName}</span>}</h2>
            <p className="text-[10px] md:text-sm font-bold opacity-40 uppercase tracking-[0.3em]">{formatDigits(currentTime.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit', hour12: timeFormat === '12h' }), numberFormat)}</p>
          </div>
        </div>

        {isAdhanPlaying && (
          <motion.button 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={stopAdhan}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white font-black text-xs shadow-xl animate-pulse"
          >
            <XCircle size={16} />
            {translations.stopAdhan}
          </motion.button>
        )}
      </div>

      {locationDenied && prayers.length > 0 && (
        <div className="mx-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] md:text-xs font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          {translations.locationError}
        </div>
      )}
      
      {nextPrayer && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`${cardGradient} rounded-[2.5rem] md:rounded-[4rem] p-7 md:p-12 text-white shadow-2xl relative overflow-hidden`}
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="text-center md:text-right w-full md:w-auto">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4 opacity-90">
                <Timer size={14} className="md:w-5 md:h-5" />
                <span className="text-[10px] md:text-sm font-black tracking-widest uppercase">{translations.nextPrayer}</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black mb-3 md:mb-4 tracking-tighter leading-tight">{nextPrayer.name}</h2>
              <div className="px-4 py-1.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 inline-flex items-center gap-2 md:gap-3">
                <Clock size={16} className="md:w-6 md:h-6" />
                <span className="text-lg md:text-3xl font-black">{formatTime(nextPrayer.time)}</span>
              </div>
            </div>
            <div className="text-center md:text-right w-full md:w-auto">
              <span className={`text-4xl sm:text-6xl md:text-8xl font-mono font-black tracking-tighter block ${isDark ? accentColor : 'text-white'} leading-none`}>
                {formatDigits(preciseCountdown, numberFormat)}
              </span>
              
              <AnimatePresence>
                {adhanBlocked && (
                   <motion.button
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     onClick={() => playAdhan(currentPrayerPlaying, true)}
                     className="mt-6 px-6 py-3 rounded-full bg-amber-400 text-zinc-950 font-black text-sm flex items-center gap-2 shadow-xl mx-auto md:mr-0 md:ml-auto"
                   >
                     <Play size={18} fill="currentColor" />
                     {translations.adhanStarted} {currentPrayerPlaying} (اضغط للتشغيل)
                   </motion.button>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-center md:justify-end gap-2 mt-3 md:mt-4 opacity-70">
                 <MapPin size={14} className="md:w-5 md:h-5" />
                 <p className="text-[10px] md:text-lg font-bold truncate max-w-[150px] md:max-w-[250px]">{locationName}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        {prayers.map((prayer) => {
          const isNext = nextPrayer && prayer.key === nextPrayer.key;
          const isCurrentlyAdhan = isAdhanPlaying && currentPrayerPlaying === prayer.name;

          return (
            <div key={prayer.key} className={`p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border transition-all flex items-center justify-between overflow-hidden ${isNext ? (isDark ? 'bg-zinc-800 border-amber-400' : 'bg-white border-emerald-500 shadow-xl') : (isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm')}`}>
              <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                <div className={`p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] ${isNext ? (isDark ? 'bg-amber-400 text-zinc-900' : 'bg-emerald-600 text-white') : (isDark ? 'bg-zinc-800 text-amber-400' : 'bg-gray-50 text-emerald-600')}`}>
                  {isCurrentlyAdhan ? <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}><Volume2 size={24} className="md:w-7 md:h-7" /></motion.div> : getPrayerIcon(prayer.key)}
                </div>
                <div className="text-right">
                  <span className={`text-lg md:text-2xl font-black font-arabic block ${isDark ? 'text-white' : 'text-emerald-950'} leading-none mb-1`}>{prayer.name}</span>
                  <span className="text-[9px] md:text-[11px] font-black opacity-30 uppercase tracking-widest">{isNext ? translations.nextPrayer : 'Time'}</span>
                </div>
              </div>
              <span className={`text-xl md:text-4xl font-black font-mono tracking-tighter flex-shrink-0 ${isNext && isDark ? 'text-amber-400' : ''}`}>
                {formatTime(prayer.time)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerTimes;
