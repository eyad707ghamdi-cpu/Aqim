
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Quote, Share2, Book, Sparkles, Heart } from 'lucide-react';
import { Translation, Language, ThemeColor, DuaCategory, NumberFormat } from '../types';
import { THEMES, DUAS_DATA, formatDigits } from '../constants';

interface DuasProps {
  translations: Translation;
  language: Language;
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
}

const Duas: React.FC<DuasProps> = ({ translations, language, theme, numberFormat = 'latin' }) => {
  const [activeCategory, setActiveCategory] = useState<string>('prophetic');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const categories = DUAS_DATA[language] || DUAS_DATA['en'] || [];
  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];
  
  const isDark = theme === 'dark';
  const isRtl = language === 'ar' || language === 'ur';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleShare = async (dua: any) => {
    const shareText = `${dua.text}\n\n— ${dua.source}\nتمت المشاركة من تطبيق (${translations.title})`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: translations.duas,
          text: shareText,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      handleCopy(shareText, 'share-fallback');
    }
  };

  return (
    <div className="space-y-10 pb-32 max-w-4xl mx-auto px-2">
      {/* أزرار التصنيفات بنمطها الأصلي */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
              activeCategory === cat.id
                ? 'bg-amber-400 border-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20'
                : (isDark ? 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300' : 'bg-gray-100 border-gray-200 text-gray-600')
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* قائمة الأدعية */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          {currentCategory?.items.map((dua) => (
            <div 
              key={dua.id} 
              className={`p-10 md:p-14 rounded-[3.5rem] border transition-all relative overflow-hidden ${
                isDark ? 'bg-zinc-900/60 border-zinc-800 shadow-2xl' : 'bg-white border-emerald-50 shadow-sm'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* نص الدعاء المركزي */}
                <p className={`text-2xl md:text-4xl font-arabic font-bold leading-relaxed mb-8 ${isDark ? 'text-zinc-100' : 'text-emerald-950'}`}>
                  {dua.text}
                </p>
                
                {/* خط فاصل سفلي */}
                <div className="w-full h-px bg-zinc-800/10 dark:bg-zinc-800 mb-6" />

                {/* تذييل الكرت (المصدر والأزرار) */}
                <div className={`w-full flex items-center justify-between ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleShare(dua)}
                      className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-amber-400' : 'bg-gray-100 text-emerald-600'}`}
                    >
                      <Share2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleCopy(dua.text, dua.id)}
                      className={`p-3 rounded-2xl transition-all ${
                        copiedId === dua.id 
                          ? 'bg-emerald-500 text-white' 
                          : (isDark ? 'bg-zinc-800 text-zinc-400 hover:text-amber-400' : 'bg-gray-100 text-emerald-600')
                      }`}
                    >
                      {copiedId === dua.id ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>

                  <span className={`text-xs font-black opacity-40 uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}>
                    — {dua.source}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Duas;
