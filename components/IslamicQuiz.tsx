
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, RotateCcw, ChevronRight, HelpCircle, Star, Sparkles, BookOpen, Quote, ShieldCheck, Heart, ArrowRight, Coins, Zap } from 'lucide-react';
import { THEMES, formatDigits } from '../constants';
import { NumberFormat, Language } from '../types';

interface Question {
  id: number;
  category: 'quran' | 'hadith' | 'seerah' | 'fiqh' | 'aqeedah' | 'sahaba' | 'general';
  type: 'multiple' | 'true-false' | 'direct';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

const QUIZ_DATA: Record<number, Question[]> = {
  1: [ // المستوى السهل - أساسيات
    { id: 1, category: 'fiqh', type: 'multiple', question: "كم عدد ركعات صلاة الفجر؟", options: ["ركعة واحدة", "ركعتان", "ثلاث ركعات", "أربع ركعات"], answer: "ركعتان" },
    { id: 2, category: 'quran', type: 'true-false', question: "سورة الفاتحة هي أول سورة في المصحف الشريف؟", answer: "صح" },
    { id: 3, category: 'seerah', type: 'direct', question: "من هو خاتم الأنبياء والمرسلين؟", answer: "محمد صلى الله عليه وسلم" },
    { id: 4, category: 'aqeedah', type: 'multiple', question: "ما هو الركن الأول من أركان الإسلام؟", options: ["الصلاة", "الزكاة", "الشهادتان", "صوم رمضان"], answer: "الشهادتان" },
    { id: 5, category: 'sahaba', type: 'multiple', question: "من هو أول الخلفاء الراشدين؟", options: ["عمر بن الخطاب", "علي بن أبي طالب", "أبو بكر الصديق", "عثمان بن عفان"], answer: "أبو بكر الصديق" },
    { id: 6, category: 'general', type: 'true-false', question: "القبلة هي اتجاه المسلمين نحو الكعبة المشرفة في الصلاة؟", answer: "صح" },
    { id: 7, category: 'general', type: 'multiple', question: "كم عدد الصلوات المفروضة في اليوم والليلة؟", options: ["3 صلوات", "4 صلوات", "5 صلوات", "6 صلوات"], answer: "5 صلوات" },
    { id: 8, category: 'quran', type: 'multiple', question: "ما هو الكتاب المنزل على سيدنا محمد صلى الله عليه وسلم؟", options: ["التوراة", "الإنجيل", "الزبور", "القرآن الكريم"], answer: "القرآن الكريم" },
    { id: 9, category: 'fiqh', type: 'multiple', question: "ما هو الشرط الأساسي لصحة الصلاة؟", options: ["النوم", "الوضوء", "الأكل", "القراءة"], answer: "الوضوء" },
    { id: 10, category: 'aqeedah', type: 'multiple', question: "من هو خالق الكون؟", options: ["الملائكة", "البشر", "الله سبحانه وتعالى", "الشمس"], answer: "الله سبحانه وتعالى" },
    { id: 11, category: 'seerah', type: 'multiple', question: "ما هو اسم والد النبي محمد صلى الله عليه وسلم؟", options: ["أبو طالب", "عبد المطلب", "عبد الله", "العباس"], answer: "عبد الله" },
    { id: 12, category: 'quran', type: 'multiple', question: "أين نزل القرآن الكريم أول مرة على النبي؟", options: ["غار حراء", "غار ثور", "المسجد الحرام", "المسجد النبوي"], answer: "غار حراء" },
    { id: 13, category: 'fiqh', type: 'true-false', question: "صيام شهر رمضان ركن من أركان الإسلام؟", answer: "صح" },
    { id: 14, category: 'sahaba', type: 'multiple', question: "من هي أول امرأة أسلمت؟", options: ["عائشة بنت أبي بكر", "فاطمة الزهراء", "خديجة بنت خويلد", "أسماء بنت أبي بكر"], answer: "خديجة بنت خويلد" },
    { id: 15, category: 'general', type: 'multiple', question: "في أي شهر يصوم المسلمون؟", options: ["رجب", "شعبان", "رمضان", "شوال"], answer: "رمضان" }
  ],
  2: [ // المستوى المتوسط - تفاصيل أعمق
    { id: 101, category: 'quran', type: 'multiple', question: "ما هي أطول سورة في القرآن الكريم؟", options: ["سورة آل عمران", "سورة البقرة", "سورة النساء", "سورة المائدة"], answer: "سورة البقرة" },
    { id: 102, category: 'sahaba', type: 'multiple', question: "من هو الصحابي الذي لقب بسيف الله المسلول؟", options: ["حمزة بن عبد المطلب", "خالد بن الوليد", "علي بن أبي طالب", "عمر بن الخطاب"], answer: "خالد بن الوليد" },
    { id: 103, category: 'seerah', type: 'multiple', question: "ما هي أول معركة كبرى بين المسلمين وقريش؟", options: ["غزوة أحد", "غزوة الخندق", "غزوة بدر", "غزوة تبوك"], answer: "غزوة بدر" },
    { id: 104, category: 'fiqh', type: 'true-false', question: "هل يجوز المسح على الخفين في الوضوء بشروط؟", answer: "صح" },
    { id: 105, category: 'sahaba', type: 'multiple', question: "من هو أول مؤذن في الإسلام؟", options: ["أبو بكر الصديق", "عمر بن الخطاب", "بلال بن رباح", "زيد بن حارثة"], answer: "بلال بن رباح" },
    { id: 106, category: 'quran', type: 'multiple', question: "كم عدد أجزاء القرآن الكريم؟", options: ["20 جزء", "30 جزء", "40 جزء", "60 جزء"], answer: "30 جزء" },
    { id: 107, category: 'seerah', type: 'multiple', question: "أين ولد النبي محمد صلى الله عليه وسلم؟", options: ["المدينة المنورة", "مكة المكرمة", "الطائف", "القدس"], answer: "مكة المكرمة" },
    { id: 108, category: 'hadith', type: 'multiple', question: "ما هو أصح كتاب بعد القرآن الكريم؟", options: ["سنن الترمذي", "صحيح البخاري", "مسند الإمام أحمد", "موطأ مالك"], answer: "صحيح البخاري" },
    { id: 109, category: 'aqeedah', type: 'multiple', question: "كم عدد أركان الإيمان؟", options: ["4 أركان", "5 أركان", "6 أركان", "7 أركان"], answer: "6 أركان" },
    { id: 110, category: 'fiqh', type: 'multiple', question: "ما هي الصلاة التي ليس لها ركوع ولا سجود؟", options: ["صلاة الفجر", "صلاة الوتر", "صلاة الجنازة", "صلاة العيد"], answer: "صلاة الجنازة" },
    { id: 111, category: 'seerah', type: 'multiple', question: "كم سنة استمرت الدعوة سرًا في مكة؟", options: ["سنتان", "3 سنوات", "4 سنوات", "5 سنوات"], answer: "3 سنوات" },
    { id: 112, category: 'quran', type: 'multiple', question: "ما هي السورة التي تشفع لصاحبها في القبر؟", options: ["سورة الكهف", "سورة تبارك (الملك)", "سورة يس", "سورة الرحمن"], answer: "سورة تبارك (الملك)" },
    { id: 113, category: 'sahaba', type: 'multiple', question: "من هو الصحابي الذي أشار بحفر الخندق؟", options: ["عمر بن الخطاب", "سعد بن معاذ", "سلمان الفارسي", "علي بن أبي طالب"], answer: "سلمان الفارسي" },
    { id: 114, category: 'fiqh', type: 'multiple', question: "كم عدد رميات الجمرات في الحج في اليوم الواحد من أيام التشريق للشاخص الواحد؟", options: ["3 حصيات", "5 حصيات", "7 حصيات", "10 حصيات"], answer: "7 حصيات" },
    { id: 115, category: 'general', type: 'true-false', question: "غزوة تبوك هي آخر غزوات النبي محمد صلى الله عليه وسلم؟", answer: "صح" }
  ],
  3: [ // المستوى الصعب - للمتميزين
    { id: 201, category: 'quran', type: 'multiple', question: "كم عدد سور القرآن الكريم؟", options: ["110 سورة", "114 سورة", "120 سورة", "112 سورة"], answer: "114 سورة" },
    { id: 202, category: 'fiqh', type: 'multiple', question: "ما هو حكم صلاة الوتر عند جمهور العلماء؟", options: ["فرض عين", "سنة مؤكدة", "مستحب", "فرض كفاية"], answer: "سنة مؤكدة" },
    { id: 203, category: 'sahaba', type: 'multiple', question: "من هو الصحابي الذي لقب بذو النورين؟", options: ["علي بن أبي طالب", "عمر بن الخطاب", "عثمان بن عفان", "أبو بكر الصديق"], answer: "عثمان بن عفان" },
    { id: 204, category: 'seerah', type: 'multiple', question: "كم مكث النبي صلى الله عليه وسلم في مكة بعد البعثة؟", options: ["10 سنوات", "13 سنة", "15 سنة", "23 سنة"], answer: "13 سنة" },
    { id: 205, category: 'quran', type: 'direct', question: "ما هي السورة التي لا تبدأ بالبسملة؟", answer: "سورة التوبة" },
    { id: 206, category: 'sahaba', type: 'multiple', question: "من هو الصحابي الذي رافق النبي في الهجرة؟", options: ["عمر بن الخطاب", "علي بن أبي طالب", "أبو بكر الصديق", "عثمان بن عفان"], answer: "أبو بكر الصديق" },
    { id: 207, category: 'hadith', type: 'direct', question: "من هو الصحابي الملقب بـ (راوية الإسلام) لكثرة حفظه للأحاديث؟", answer: "أبو هريرة رضي الله عنه" },
    { id: 208, category: 'seerah', type: 'multiple', question: "في أي غزوة استشهد حمزة بن عبد المطلب عم النبي؟", options: ["غزوة بدر", "غزوة أحد", "غزوة الخندق", "غزوة خيبر"], answer: "غزوة أحد" },
    { id: 209, category: 'general', type: 'multiple', question: "كم عدد أبواب الجنة؟", options: ["5 أبواب", "7 أبواب", "8 أبواب", "10 أبواب"], answer: "8 أبواب" },
    { id: 210, category: 'quran', type: 'direct', question: "ما هي السورة الملقبة بـ (قلب القرآن)؟", answer: "سورة يس" },
    { id: 211, category: 'fiqh', type: 'multiple', question: "في أي عام فُرض صيام رمضان؟", options: ["العام الأول للهجرة", "العام الثاني للهجرة", "العام الثالث للهجرة", "العام الرابع للهجرة"], answer: "العام الثاني للهجرة" },
    { id: 212, category: 'sahaba', type: 'multiple', question: "من هو الصحابي الذي تستحي منه الملائكة؟", options: ["عمر بن الخطاب", "عثمان بن عفان", "علي بن أبي طالب", "أبو عبيدة بن الجراح"], answer: "عثمان بن عفان" },
    { id: 213, category: 'seerah', type: 'multiple', question: "ما هو اسم الناقة التي هاجر عليها النبي؟", options: ["القصواء", "العضباء", "الجدعاء", "البراق"], answer: "القصواء" },
    { id: 214, category: 'quran', type: 'multiple', question: "ما هي السورة التي تعادل ثلث القرآن؟", options: ["سورة الكافرون", "سورة الإخلاص", "سورة الفلق", "سورة الناس"], answer: "سورة الإخلاص" },
    { id: 215, category: 'hadith', type: 'multiple', question: "من هي الصحابية الملقبة بذات النطاقين؟", options: ["عائشة بنت أبي بكر", "أسماء بنت أبي بكر", "فاطمة الزهراء", "حفصة بنت عمر"], answer: "أسماء بنت أبي بكر" }
  ]
};

const POINTS_PER_LEVEL = {
  1: 10,
  2: 25,
  3: 50
};

interface IslamicQuizProps {
  theme: string;
  language: Language;
  numberFormat?: NumberFormat;
  onPointsEarned?: (amount: number) => void;
}

const IslamicQuiz: React.FC<IslamicQuizProps> = ({ theme, language, numberFormat = 'latin', onPointsEarned }) => {
  const [level, setLevel] = useState<number | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');

  const isDark = theme === 'dark';
  const isRtl = language === 'ar' || language === 'ur';
  
  const currentQuestion = sessionQuestions[currentIdx];
  const activeNumberFormat = (numberFormat as NumberFormat) || 'latin';

  const handleStartLevel = (lvl: number) => {
    // Shuffle and pick 10 questions to avoid repeating the exact same sequence
    const allQ = QUIZ_DATA[lvl] || [];
    const shuffled = [...allQ].sort(() => Math.random() - 0.5).slice(0, 10);
    setSessionQuestions(shuffled);
    
    setLevel(lvl);
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    setSessionPoints(0);
    setShowAnswer(false);
    setSelectedOpt(null);
  };

  const handleOptionClick = (opt: string) => {
    if (showAnswer) return;
    setSelectedOpt(opt);
    setShowAnswer(true);
    if (opt === currentQuestion.answer) {
      const points = level ? POINTS_PER_LEVEL[level as keyof typeof POINTS_PER_LEVEL] : 0;
      setScore(s => s + 1);
      setSessionPoints(p => p + points);
      if (onPointsEarned) onPointsEarned(points);
      if ('vibrate' in navigator) navigator.vibrate(20);
    } else {
      if ('vibrate' in navigator) navigator.vibrate([10, 50]);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < sessionQuestions.length) {
      setCurrentIdx(i => i + 1);
      setShowAnswer(false);
      setSelectedOpt(null);
    } else {
      setGameState('result');
    }
  };

  const categoryLabels = {
    quran: isRtl ? "القرآن الكريم" : "Quran",
    hadith: isRtl ? "الحديث الشريف" : "Hadith",
    seerah: isRtl ? "السيرة النبوية" : "Seerah",
    fiqh: isRtl ? "الفقه الإسلامي" : "Fiqh",
    aqeedah: isRtl ? "العقيدة" : "Aqeedah",
    sahaba: isRtl ? "الصحابة الكرام" : "Sahaba",
    general: isRtl ? "أحكام عامة" : "General"
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 pb-40">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div key="start" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className={`p-8 rounded-[3.5rem] border text-center space-y-8 ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}>
            <div className={`w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center shadow-lg ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Trophy size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-emerald-950'}`}>{isRtl ? "تحدي المسلم" : "Muslim Challenge"}</h2>
              <p className="text-sm font-bold opacity-40 uppercase tracking-widest">{isRtl ? "اختر مستوى التحدي واربح النقاط" : "Pick a level and earn points"}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <LevelButton 
                onClick={() => handleStartLevel(1)} 
                title={isRtl ? "سهل" : "Easy"} 
                points={POINTS_PER_LEVEL[1]} 
                icon={<Zap size={20} />} 
                color="emerald" 
                isDark={isDark} 
                language={language}
                numberFormat={activeNumberFormat}
              />
              <LevelButton 
                onClick={() => handleStartLevel(2)} 
                title={isRtl ? "متوسط" : "Medium"} 
                points={POINTS_PER_LEVEL[2]} 
                icon={<Sparkles size={20} />} 
                color="amber" 
                isDark={isDark} 
                language={language}
                numberFormat={activeNumberFormat}
              />
              <LevelButton 
                onClick={() => handleStartLevel(3)} 
                title={isRtl ? "صعب" : "Hard"} 
                points={POINTS_PER_LEVEL[3]} 
                icon={<Trophy size={20} />} 
                color="rose" 
                isDark={isDark} 
                language={language}
                numberFormat={activeNumberFormat}
              />
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <motion.div key="playing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-700'}`}>
                {categoryLabels[currentQuestion.category]}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black opacity-40">
                  {formatDigits(currentIdx + 1, activeNumberFormat)} / {formatDigits(sessionQuestions.length, activeNumberFormat)}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  +{formatDigits(sessionPoints, activeNumberFormat)}
                </div>
              </div>
            </div>

            <div className={`p-8 md:p-12 rounded-[3.5rem] border relative overflow-hidden ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-emerald-50 shadow-sm'}`}>
              <HelpCircle className="absolute -top-6 -right-6 opacity-5 w-48 h-48" />
              <h3 className={`text-2xl md:text-3xl font-arabic font-bold leading-relaxed relative z-10 ${isDark ? 'text-zinc-100' : 'text-emerald-950'}`}>
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.type === 'multiple' && currentQuestion.options?.map((opt, i) => {
                const isCorrect = opt === currentQuestion.answer;
                const isSelected = opt === selectedOpt;
                
                return (
                  <button 
                    key={i} 
                    disabled={showAnswer}
                    onClick={() => handleOptionClick(opt)}
                    className={`p-6 rounded-3xl border-2 text-right font-bold transition-all flex items-center justify-between group ${
                      showAnswer 
                      ? (isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : (isSelected ? 'bg-red-500/10 border-red-500 text-red-600' : 'opacity-30 border-gray-100'))
                      : (isDark ? 'bg-zinc-900 border-zinc-800 hover:border-amber-400 text-white' : 'bg-white border-gray-100 hover:border-emerald-500 text-zinc-900')
                    }`}
                  >
                    <span className="text-lg">{opt}</span>
                    {showAnswer && isCorrect && <CheckCircle2 size={24} className="text-emerald-500" />}
                    {showAnswer && isSelected && !isCorrect && <XCircle size={24} className="text-red-500" />}
                  </button>
                );
              })}

              {currentQuestion.type === 'true-false' && (
                <div className="grid grid-cols-2 gap-4">
                  {["صح", "خطأ"].map((opt) => {
                    const isCorrect = opt === currentQuestion.answer;
                    const isSelected = opt === selectedOpt;
                    return (
                       <button 
                        key={opt}
                        disabled={showAnswer}
                        onClick={() => handleOptionClick(opt)}
                        className={`p-8 rounded-3xl border-2 font-black transition-all ${
                          showAnswer 
                          ? (isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : (isSelected ? 'bg-red-500 border-red-500 text-white' : 'opacity-20'))
                          : (isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-100 text-zinc-900')
                        }`}
                       >
                         {opt}
                       </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'direct' && (
                <div className="space-y-4">
                   {!showAnswer ? (
                     <button onClick={() => setShowAnswer(true)} className={`w-full p-8 rounded-3xl border-2 border-dashed font-black opacity-50 ${isDark ? 'border-zinc-700' : 'border-gray-200'}`}>
                       {isRtl ? "كشف الإجابة" : "Reveal Answer"}
                     </button>
                   ) : (
                     <div className={`p-8 rounded-3xl bg-emerald-500 text-white text-center shadow-xl animate-bounce`}>
                        <p className="text-xs uppercase font-black opacity-70 mb-2">{isRtl ? "الإجابة الصحيحة" : "Correct Answer"}</p>
                        <h4 className="text-2xl font-black">{currentQuestion.answer}</h4>
                     </div>
                   )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {showAnswer && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleNext}
                  className={`w-full py-5 rounded-[1.8rem] font-black shadow-lg flex items-center justify-center gap-2 ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}
                >
                  {isRtl ? "السؤال التالي" : "Next Question"} <ArrowRight size={20} className={isRtl ? 'rotate-180' : ''} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-10 rounded-[3.5rem] border text-center space-y-8 ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-gray-100 shadow-2xl'}`}>
            <div className="relative inline-block">
               <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}>
                 <span className="text-4xl font-black">{formatDigits(Math.round((score/sessionQuestions.length)*100), activeNumberFormat)}%</span>
               </div>
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-0 border-4 border-dashed border-emerald-500/30 rounded-full" />
            </div>

            <div className="space-y-2">
              <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                {score === sessionQuestions.length ? (isRtl ? "ما شاء الله! درجة كاملة" : "Excellent! Perfect Score") : (isRtl ? "نتيجة رائعة!" : "Great Effort!")}
              </h3>
              <div className="flex items-center justify-center gap-4 text-sm font-bold opacity-50">
                <p>{isRtl ? `صحيح: ${formatDigits(score, activeNumberFormat)}/${formatDigits(sessionQuestions.length, activeNumberFormat)}` : `Correct: ${score}/${sessionQuestions.length}`}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <div className="flex items-center gap-1 text-amber-500">
                  <Coins size={14} />
                  <span>+{formatDigits(sessionPoints, activeNumberFormat)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
               <button onClick={() => setGameState('start')} className={`w-full py-5 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center gap-2 shadow-lg`}>
                 <RotateCcw size={20} /> {isRtl ? "العودة للمستويات" : "Back to Levels"}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LevelButton = ({ title, points, icon, color, isDark, onClick, language, numberFormat }: any) => {
  const isRtl = language === 'ar' || language === 'ur';
  const colorMap = {
    emerald: isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-500',
    amber: isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-500' : 'bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-500',
    rose: isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-500' : 'bg-rose-50 border-rose-100 text-rose-700 hover:border-rose-500'
  };

  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${colorMap[color as keyof typeof colorMap]}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-white/10">{icon}</div>
        <div className="text-right">
          <h4 className="text-xl font-black">{title}</h4>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{isRtl ? "نقاط إضافية" : "Bonus Points"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10">
        <Coins size={16} />
        <span className="font-black">+{formatDigits(points, numberFormat)}</span>
      </div>
    </button>
  );
};

export default IslamicQuiz;
