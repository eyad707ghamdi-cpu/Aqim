
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, ChevronLeft, Loader2, PlayCircle, PauseCircle, AlertCircle, BookOpen, Volume2, Info, Layout, AlignRight, User, X, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Translation, Language, ThemeColor, NumberFormat, Reciter, LoadingVariant } from '../types';
import { THEMES, formatDigits, QURAN_TRANSLATIONS, QURRA } from '../constants';
import { CrescentStarIcon, LoadingLogo } from './Icons';

interface QuranProps {
  translations: Translation;
  language: Language;
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
  loadingVariant?: LoadingVariant;
}

const Quran: React.FC<QuranProps> = ({ translations, language, theme, numberFormat = 'latin', loadingVariant = 'default' }) => {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<any | null>(null);
  const [content, setContent] = useState<{ ayahs: any[], translation: any[] }>({ ayahs: [], translation: [] });
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isMushafMode, setIsMushafMode] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    const saved = localStorage.getItem('al_salat_najat_reciter_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return QURRA.find(q => q.id === parsed.id) || QURRA[0];
    }
    return QURRA[0];
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDark = theme === 'dark';
  const isRtl = language === 'ar' || language === 'ur';
  const activeNumberFormat = numberFormat as NumberFormat;

  const BASMALA_TEXT = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

  useEffect(() => { fetchSurahs(); }, []);
  useEffect(() => { localStorage.setItem('al_salat_najat_reciter_v1', JSON.stringify(selectedReciter)); }, [selectedReciter]);

  const fetchSurahs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.quran.com/api/v4/chapters?language=${language === 'ar' ? 'ar' : 'en'}`);
      const data = await response.json();
      setSurahs(data.chapters.sort((a: any, b: any) => a.id - b.id));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const selectSurah = (surah: any) => {
    if (audioRef.current) { 
      audioRef.current.pause(); 
      audioRef.current.currentTime = 0; 
      audioRef.current.src = "";
    }
    setIsPlaying(false); setAudioProgress(0); setAudioError(false); setAudioLoading(false);
    setSelectedSurah(surah); fetchSurahContent(surah.id);
  };

  const fetchSurahContent = async (chapterId: number) => {
    setLoading(true);
    try {
      const arabicRes = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`);
      const arabicData = await arabicRes.json();
      let translationData = { translations: [] };
      const transInfo = QURAN_TRANSLATIONS[language];
      if (transInfo.id !== 0) {
        const transRes = await fetch(`https://api.quran.com/api/v4/quran/translations/${transInfo.id}?chapter_number=${chapterId}`);
        translationData = await transRes.json();
      }
      setContent({ ayahs: arabicData.verses.sort((a: any, b: any) => parseInt(a.verse_key.split(':')[1]) - parseInt(b.verse_key.split(':')[1])), translation: translationData.translations });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { 
      audioRef.current.pause(); 
      setIsPlaying(false); 
    } else {
      setAudioLoading(true); 
      setAudioError(false);
      
      const audioUrl = getAudioUrl();
      if (!audioRef.current.src || audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }

      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAudioLoading(false);
          setAudioError(false);
        })
        .catch(err => { 
          console.error("Audio Playback Error:", err);
          setAudioError(true); 
          setAudioLoading(false); 
          setIsPlaying(false); 
        });
    }
  };

  const handleTimeUpdate = () => { if (audioRef.current && audioRef.current.duration) setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); };
  
  const handleReciterChange = (reciter: Reciter) => { 
    setSelectedReciter(reciter); 
    setShowReciterModal(false); 
    if (audioRef.current) { 
      audioRef.current.pause(); 
      audioRef.current.src = "";
      setIsPlaying(false); 
      setAudioProgress(0);
    } 
  };

  const filteredSurahs = surahs.filter(s => s.name_arabic.includes(searchQuery) || s.name_simple.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const getAudioUrl = () => { 
    if (!selectedSurah) return ""; 
    const reciterSlug = selectedReciter.slug;
    const surahId = selectedSurah.id.toString().padStart(3, '0');
    // محاولة استخدام خادم أكثر استقراراً
    return `https://server8.mp3quran.net/afs/${surahId}.mp3`.replace('afs', reciterSlug === '007' ? 'afs' : reciterSlug === '001' ? 'basit' : reciterSlug === '003' ? 'sds' : reciterSlug === '006' ? 'husr' : reciterSlug === '012' ? 'minsh' : reciterSlug === '010' ? 'shur' : 'maher'); 
  };

  if (selectedSurah) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-32">
        <div className={`sticky top-20 z-30 p-6 md:p-8 backdrop-blur-3xl border-b rounded-b-[4rem] ${isDark ? 'bg-zinc-950/90 border-zinc-800 shadow-2xl' : 'bg-white/90 border-emerald-100 shadow-2xl'}`}>
          <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto">
            <button onClick={() => { setSelectedSurah(null); setIsPlaying(false); }} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all ${isDark ? 'bg-zinc-800 text-amber-400 border border-zinc-700' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {isRtl ? <ChevronRight size={28} className="md:w-8 md:h-8" /> : <ChevronLeft size={28} className="md:w-8 md:h-8" />}
            </button>
            <div className="text-center flex-1">
              <h2 className={`text-3xl md:text-5xl font-arabic font-black ${isDark ? 'text-white' : 'text-emerald-900'}`}>{selectedSurah.name_arabic}</h2>
              <div className="flex items-center justify-center gap-4 mt-2 opacity-50">
                <span className="text-xs md:text-lg font-black uppercase tracking-widest">{formatDigits(selectedSurah.verses_count, activeNumberFormat)} {translations.ayahs}</span>
                <button className="text-xs md:text-lg font-black uppercase hover:underline" onClick={() => setShowReciterModal(true)}>{selectedReciter.name}</button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsMushafMode(!isMushafMode)} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all ${isMushafMode ? (isDark ? 'bg-amber-400 text-zinc-900' : 'bg-emerald-600 text-white') : (isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-400')}`}><Layout size={28} className="md:w-8 md:h-8" /></button>
              <button onClick={togglePlay} disabled={audioLoading} className={`p-5 md:p-6 rounded-full transition-all shadow-xl ${isPlaying ? (isDark ? 'bg-amber-400 text-zinc-900' : 'bg-emerald-600 text-white') : (isDark ? 'bg-zinc-800 text-amber-400' : 'bg-gray-100 text-emerald-600')}`}>
                {audioLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Loader2 size={24} className="md:w-8 md:h-8" />
                  </motion.div>
                ) : isPlaying ? <PauseCircle className="md:w-8 md:h-8" size={28} /> : <PlayCircle className="md:w-8 md:h-8" size={28} />}
              </button>
            </div>
          </div>
          <div className="mt-8 px-2 md:px-10 max-w-4xl mx-auto">
            <audio 
              key={selectedReciter.id + "-" + selectedSurah.id} 
              ref={audioRef} 
              src={getAudioUrl()} 
              crossOrigin="anonymous"
              preload="auto"
              onTimeUpdate={handleTimeUpdate} 
              onWaiting={() => setAudioLoading(true)} 
              onPlaying={() => setAudioLoading(false)}
              onError={() => { setAudioError(true); setAudioLoading(false); }}
              onCanPlay={() => { setAudioLoading(false); setAudioError(false); }}
            />
            <div className={`h-3 md:h-4 w-full ${isDark ? 'bg-zinc-800' : 'bg-emerald-50'} rounded-full overflow-hidden relative shadow-inner`}>
              <motion.div className={`absolute top-0 bottom-0 left-0 ${isDark ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${audioProgress}%` }} />
            </div>
            <AnimatePresence>
              {audioError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-2 mt-4 text-red-500 font-bold text-sm bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{translations.failedAudio}</span>
                  </div>
                  <button onClick={() => { setAudioError(false); togglePlay(); }} className="flex items-center gap-1 text-[10px] uppercase tracking-tighter hover:underline">
                    <RefreshCw size={10} /> {isRtl ? "إعادة المحاولة" : "Retry"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <LoadingLogo variant={loadingVariant} size={120} className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
          </div>
        ) : (
          <div className="space-y-12 px-2 md:px-16 lg:px-24">
            {selectedSurah.id !== 1 && selectedSurah.id !== 9 && (
              <div className="text-center py-16 md:py-20">
                <h3 className={`text-6xl md:text-8xl font-arabic font-black arabic-text ${isDark ? 'text-amber-400' : 'text-emerald-700'}`}>{BASMALA_TEXT}</h3>
              </div>
            )}
            
            <div className={`p-10 md:p-20 lg:p-28 rounded-[5rem] text-right max-w-7xl mx-auto shadow-sm ${isDark ? 'bg-zinc-900/40 text-zinc-100' : 'bg-white text-emerald-950 border border-emerald-50'}`}>
              <div 
                className="text-4xl md:text-6xl lg:text-8xl font-medium leading-[3.5] md:leading-[4] inline-block w-full text-justify"
                style={{ 
                  fontFamily: "'Amiri', serif",
                  wordSpacing: '1.5em',
                  direction: 'rtl',
                  textUnderlineOffset: '20px'
                }}
              >
                {content.ayahs.map((ayah, index) => {
                  let cleanText = ayah.text_uthmani;
                  if (selectedSurah.id !== 1 && (index + 1) === 1 && cleanText.startsWith(BASMALA_TEXT)) {
                    cleanText = cleanText.substring(BASMALA_TEXT.length).trim();
                  }
                  return (
                    <React.Fragment key={ayah.verse_key}>
                      <span className="inline transition-all hover:text-emerald-500 cursor-pointer">
                        {cleanText} 
                      </span>
                      <span 
                        className={`mx-10 md:mx-20 px-4 py-1 rounded-full border-4 text-xl md:text-4xl inline-flex items-center justify-center font-black h-16 w-16 md:h-28 md:w-28 align-middle shadow-xl transition-transform hover:scale-110 ${
                          isDark 
                          ? 'border-amber-400/30 text-amber-400 bg-zinc-800 shadow-amber-400/5' 
                          : 'border-emerald-500/30 text-emerald-600 bg-emerald-50 shadow-emerald-500/5'
                        }`}
                      >
                        {formatDigits(index + 1, activeNumberFormat)}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-16">
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto w-full">
        <div className="relative flex-1">
          <Search className={`absolute ${isRtl ? 'right-10' : 'left-10'} top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} size={28} />
          <input type="text" placeholder={translations.searchSurah} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full p-8 md:p-10 ${isRtl ? 'pr-24' : 'pl-24'} rounded-[3.5rem] border-2 outline-none text-2xl md:text-3xl font-bold ${isDark ? 'bg-zinc-900 border-zinc-800 text-white focus:border-amber-400' : 'bg-white border-gray-100 focus:border-emerald-500 shadow-2xl'}`} />
        </div>
        <button onClick={() => setShowReciterModal(true)} className={`p-6 md:px-12 rounded-[2.5rem] border-2 flex items-center justify-center gap-6 font-black text-xl md:text-2xl transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-white border-emerald-50 text-emerald-600 shadow-sm'}`}>
          <User size={32} className="md:w-8 md:h-8" />
          <span>{selectedReciter.name}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {filteredSurahs.map((surah) => (
          <motion.button key={surah.id} whileHover={{ y: -10, scale: 1.02 }} onClick={() => selectSurah(surah)} className={`p-10 md:p-12 rounded-[3.5rem] border-2 flex items-center justify-between group relative transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-amber-400 shadow-xl' : 'bg-white border-gray-100 hover:border-emerald-200 shadow-md'}`}>
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center font-black text-2xl md:text-3xl ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
                {formatDigits(surah.id, activeNumberFormat)}
              </div>
              <div className="text-right">
                <h3 className={`text-xl md:text-2xl font-black font-arabic ${isDark ? 'text-zinc-100' : 'text-emerald-900'}`}>{surah.name_arabic}</h3>
                <p className="text-[10px] md:text-sm font-black opacity-40 uppercase tracking-widest">{formatDigits(surah.verses_count, activeNumberFormat)} {translations.ayahs}</p>
              </div>
            </div>
            <div className={`${isDark ? 'text-zinc-800' : 'text-gray-100'} group-hover:text-emerald-500 group-hover:scale-125 transition-all`}>
               {isRtl ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
            </div>
          </motion.button>
        ))}
      </div>
      
      <ReciterModal 
        isOpen={showReciterModal} 
        onClose={() => setShowReciterModal(false)} 
        onSelect={handleReciterChange} 
        selectedReciterId={selectedReciter.id} 
        theme={theme} 
        translations={translations} 
      />
    </div>
  );
};

const ReciterModal = ({ isOpen, onClose, onSelect, selectedReciterId, theme, translations }: any) => {
  const isDark = theme === 'dark';
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className={`relative w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <div className={`p-10 md:p-14 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <h3 className={`text-3xl md:text-4xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>{translations.chooseReciter}</h3>
              <button onClick={onClose} className="p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all"><X size={20} /></button>
            </div>
            <div className="p-10 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {QURRA.map((q) => (
                  <button key={q.id} onClick={() => onSelect(q)} className={`p-8 md:p-10 rounded-[2.5rem] border-2 flex items-center justify-between transition-all ${q.id === selectedReciterId ? (isDark ? 'bg-amber-400/20 border-amber-400 text-amber-400' : 'bg-emerald-50 border-emerald-500 text-emerald-700') : (isDark ? 'bg-zinc-800 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-gray-50 border-gray-50 text-gray-500 hover:border-gray-200')}`}>
                    <div className="flex flex-col items-start text-start">
                      <span className="font-black text-xl md:text-2xl">{q.name}</span>
                      <span className="text-xs md:text-sm font-bold opacity-50 uppercase mt-2">{q.subName}</span>
                    </div>
                    {q.id === selectedReciterId && <Check size={32} />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Quran;
