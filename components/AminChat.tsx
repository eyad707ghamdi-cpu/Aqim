import { Image as ImageIcon, X, Loader2, Star, SendHorizontal, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAmin } from '../services/geminiService';
import { Translation, Language, ThemeColor, SubscriptionTier, LoadingVariant } from '../types';
import { THEMES } from '../constants';
import { storage, ref, uploadString, getDownloadURL } from '../services/firebase';

interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
  id: string;
  sources?: { title: string; uri: string }[];
}

interface AminChatProps {
  translations: Translation;
  language: Language;
  theme: ThemeColor | 'dark';
  subscriptionTier: SubscriptionTier;
  onSubscribe: () => void;
  userName?: string;
  loadingVariant?: LoadingVariant;
}

const AminChat: React.FC<AminChatProps> = ({ translations, language, theme, subscriptionTier, onSubscribe, userName, loadingVariant = 'default' }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentTheme = THEMES[theme];
  const isDark = theme === 'dark';
  const isRtl = language === 'ar' || language === 'ur';
  const isSubscribed = subscriptionTier === 'plus';

  const placeholders = isRtl ? [
    "اسأل أقِم AI سؤالاً دينياً...",
    "ما فضل صلاة الفجر؟",
    "أريد أذكار النوم..."
  ] : [
    "Ask Aqim AI a religious question...",
    "Benefits of Fajr prayer?"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  useEffect(() => {
    const savedChat = localStorage.getItem('aqim_chat_history_v1');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      const welcome = isRtl 
        ? `السلام عليكم${userName ? ' يا ' + userName : ''}، أنا أقِم AI رفيقك الذكي. أبحث لك في المصادر الموثوقة (مثل IslamQA) لأجيبك بدقة. كيف يمكنني خدمتك اليوم؟` 
        : `Peace be upon you, I am Aqim AI. I search reliable sources to provide accurate fatwas. How can I assist you today?`;
      setMessages([{ role: 'ai', content: welcome, id: 'welcome' }]);
    }
  }, [language, userName]);

  useEffect(() => {
    localStorage.setItem('aqim_chat_history_v1', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageClick = () => {
    if (!isSubscribed) {
      alert(translations.imageRequiredSub);
      onSubscribe();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleSend = async (customMsg?: string) => {
    const userMsg = customMsg || input.trim();
    const userImgBase64 = selectedImage;
    if ((!userMsg && !userImgBase64) || loading) return;

    setLoading(true);
    setInput('');
    setSelectedImage(null);

    let finalImageUrl = "";

    try {
      if (userImgBase64) {
        const imageRef = ref(storage, `chat_images/${Date.now()}.jpg`);
        await uploadString(imageRef, userImgBase64, 'data_url');
        finalImageUrl = await getDownloadURL(imageRef);
      }

      setMessages(prev => [...prev, { 
        role: 'user', 
        content: userMsg, 
        image: finalImageUrl || undefined, 
        id: Date.now().toString() 
      }]);

      const result = await askAmin(userMsg || "أخبرني عن هذه الصورة", language, userImgBase64 || undefined);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: result.text, 
        sources: result.sources,
        id: 'ai-' + Date.now() 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: isRtl ? 'عذراً، واجهت مشكلة في الاتصال بالمصادر السحابية.' : 'Sorry, I encountered a cloud connection error.', 
        id: 'error-' + Date.now() 
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div className={`flex flex-col h-[calc(100dvh-220px)] md:h-[680px] max-w-xl mx-auto w-full ${currentTheme.card} rounded-[3.5rem] shadow-2xl border ${isDark ? 'border-zinc-800' : 'border-emerald-50'} overflow-hidden relative`}>
      <div className={`${isDark ? 'bg-zinc-900 border-b border-zinc-800' : `bg-gradient-to-r ${currentTheme.gradient}`} p-6 text-white flex items-center justify-between z-10`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><MessageCircle size={24} /></div>
          <div>
            <h3 className="text-2xl font-black font-arabic leading-none mb-1">أقِم AI</h3>
            <div className="flex items-center gap-2 opacity-70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">متصل بالسحابة</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 md:p-10 space-y-8 ${isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50/30'} custom-scroll`}>
        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-[2.2rem] shadow-sm ${m.role === 'user' ? `bg-gradient-to-br ${currentTheme.gradient} text-white rounded-tr-none` : `${isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-800 border border-emerald-50'} rounded-tl-none`}`}>
              {m.image && <img src={m.image} className="rounded-[1.5rem] mb-4 max-h-64 w-full object-cover shadow-lg" alt="attachment" />}
              <p className="whitespace-pre-wrap leading-relaxed font-arabic text-base md:text-lg">{m.content}</p>
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-black/10 flex flex-wrap gap-2">
                  {m.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] bg-black/5 font-bold"><ExternalLink size={10} /> {s.title}</a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && <div className="flex justify-start"><Loader2 className="animate-spin opacity-40" /></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-6 border-t ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-emerald-50'}`}>
        <AnimatePresence>
          {selectedImage && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-4 relative inline-block">
              <img src={selectedImage} className="w-20 h-20 object-cover rounded-2xl border-2 border-emerald-500" />
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setSelectedImage(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
          <button type="button" onClick={handleImageClick} className={`p-4 rounded-2xl ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}><ImageIcon size={24} /></button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholders[placeholderIndex]} className={`flex-1 p-4 rounded-2xl border-none outline-none ${isDark ? 'bg-zinc-950 text-white' : 'bg-gray-100'}`} />
          <button type="submit" disabled={loading} className={`p-4 rounded-full ${currentTheme.primary} text-white`}><SendHorizontal size={24} /></button>
        </form>
      </div>
    </div>
  );
};

export default AminChat;