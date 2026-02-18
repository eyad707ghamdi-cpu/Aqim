
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Palette, Check, Info, MessageSquare, Mail, Smartphone, Star, Loader2, Send, Globe, Hash, ShieldCheck, Lock, Unlock, Heart, Clock, BellRing, Flag, Trash2, History, UserCheck, ChevronLeft, ChevronRight, X, Edit3, Eye, ShieldAlert, CheckCircle2, AlertTriangle, CornerDownLeft, Shield, Coins, Sparkles, LogOut, LogIn, User, MessageCircle, Type, ChevronDown, BadgeCheck, ExternalLink, Zap } from 'lucide-react';
import { Translation, UserSettings, ThemeColor, Language, Suggestion, FontFamily } from '../types';
import { THEMES, themeOptions, formatDigits, FONT_OPTIONS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { sendToTelegram } from '../services/telegramService';
import { db, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, increment } from '../services/firebase';

interface SettingsProps {
  translations: Translation;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const Settings: React.FC<SettingsProps> = ({ translations, settings, updateSettings }) => {
  const [suggestionText, setSuggestionText] = useState("");
  const [sugAge, setSugAge] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(settings.userName || "");
  const [nameUpdateLoading, setNameUpdateLoading] = useState(false);

  // ميزات المطور الجديدة لتعديل النقاط
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [newPointsInput, setNewPointsInput] = useState(settings.points.toString());

  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);

  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [userLikedIds, setUserLikedIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [showPinDialog, setShowPinDialog] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<{id: string, type: 'post' | 'reply'} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSugId, setEditingSugId] = useState<string | null>(null);
  const [editSugText, setEditSugText] = useState("");

  const [replyingSugId, setReplyingSugId] = useState<string | null>(null);
  const [devReplyText, setDevReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSugForReport, setSelectedSugForReport] = useState<Suggestion | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const isDark = settings.isDarkMode;
  const currentTheme = THEMES[isDark ? 'dark' : settings.accentColor];
  const isRtl = settings.language === 'ar' || settings.language === 'ur' || settings.language === 'fa';

  const PLUS_COST = 2000;

  const currentFont = FONT_OPTIONS.find(f => f.id === settings.fontFamily) || FONT_OPTIONS[0];

  const handleUpdateName = async () => {
    if (!newNameInput.trim()) return;
    setNameUpdateLoading(true);
    updateSettings({ userName: newNameInput.trim() });
    setIsEditingName(false);
    if ('vibrate' in navigator) navigator.vibrate(20);
    setNameUpdateLoading(false);
  };

  const handleUpdatePoints = () => {
    const val = parseInt(newPointsInput);
    if (isNaN(val)) return;
    updateSettings({ points: val });
    setIsEditingPoints(false);
    if ('vibrate' in navigator) navigator.vibrate([10, 30]);
  };

  const handleRedeemPlus = () => {
    if (settings.points < PLUS_COST) return;
    setRedeemLoading(true);
    setTimeout(() => {
      updateSettings({ 
        points: settings.points - PLUS_COST, 
        subscriptionTier: 'plus',
        isSubscribed: true 
      });
      setRedeemLoading(false);
      if ('vibrate' in navigator) navigator.vibrate([30, 100, 30]);
    }, 1500);
  };

  useEffect(() => {
    let userId = localStorage.getItem('al_salat_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('al_salat_user_id', userId);
    }
    setCurrentUserId(userId);

    const q = query(collection(db, "suggestions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Suggestion[];
      setAllSuggestions(docs);
    });

    const savedLikes = localStorage.getItem('al_salat_suggestion_likes_firebase');
    if (savedLikes) {
      try { setUserLikedIds(JSON.parse(savedLikes)); } catch (e) {}
    }
    
    return () => unsubscribe();
  }, []);

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!settings.userName?.trim()) { setError(isRtl ? "يرجى تحديد اسم أولاً" : "Set name first"); return; }
    if (!suggestionText.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const newSug = {
        ownerId: currentUserId,
        name: settings.userName,
        age: sugAge.trim() || null,
        text: suggestionText.trim(),
        timestamp: Date.now(),
        likes: 0,
        reports: 0
      };

      await addDoc(collection(db, "suggestions"), newSug);
      
      const botToken = settings.telegramBotToken || "8502852009:AAFfrMzlspC7lo4aL4wgg4sh0_33UYB0rDM";
      const chatId = settings.telegramChatId || "5928920376";
      const fullMessage = `<b>💡 اقتراح جديد:</b>\n\n<i>${newSug.text}</i>\n\n<b>المرسل:</b> ${newSug.name}${newSug.age ? ` (${newSug.age} سنة)` : ''}`;
      await sendToTelegram(fullMessage, botToken, chatId, 'SUGGESTION');

      setSuggestionText("");
      setSugAge("");
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (err) { setError(isRtl ? "حدث خطأ" : "Error"); } finally { setIsSending(false); }
  };

  const handleDevReply = async (id: string) => {
    if (!devReplyText.trim() || isReplying) return;
    setIsReplying(true);
    try {
      const sugRef = doc(db, "suggestions", id);
      await updateDoc(sugRef, { devReply: devReplyText.trim() });
      setReplyingSugId(null);
      setDevReplyText("");
    } catch (e) {
      alert(isRtl ? "فشل إرسال الرد" : "Reply failed");
    } finally {
      setIsReplying(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "suggestions", deleteConfirmId.id));
      setDeleteConfirmId(null);
    } catch (e) { console.error(e); } finally { setIsDeleting(false); }
  };

  const verifyDevMode = () => {
    if (pinInput === "1020") {
      updateSettings({ isDeveloperMode: true });
      setShowPinDialog(false);
      setPinInput("");
      if ('vibrate' in navigator) navigator.vibrate([10, 30]);
    } else { alert(isRtl ? "الرمز خاطئ!" : "Wrong PIN!"); setPinInput(""); }
  };

  return (
    <div className="space-y-8 pb-32">
      <AnimatePresence>
        {isEditingName && (
           <div className="fixed inset-0 z-[350] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !nameUpdateLoading && setIsEditingName(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative w-full max-w-sm p-8 rounded-[3rem] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white shadow-2xl'}`}>
              <div className="text-center mb-6">
                 <h3 className="text-2xl font-black">{isRtl ? "تعديل الاسم" : "Edit Name"}</h3>
                 <p className="text-[10px] opacity-40 font-bold mt-1">{isRtl ? "كيف تريد أن نناديك؟" : "How should we call you?"}</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  autoFocus 
                  value={newNameInput} 
                  onChange={(e) => { setNewNameInput(e.target.value); }} 
                  placeholder={isRtl ? "ادخل اسمك هنا..." : "Enter your name..."}
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-400' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`}
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleUpdateName} disabled={nameUpdateLoading} className={`flex-1 py-4 rounded-xl font-black ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}>
                    {nameUpdateLoading ? <Loader2 className="animate-spin mx-auto" /> : (isRtl ? "حفظ" : "Save")}
                  </button>
                  <button onClick={() => setIsEditingName(false)} disabled={nameUpdateLoading} className={`px-6 py-4 rounded-xl font-black ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
                    {isRtl ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {deleteConfirmId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setDeleteConfirmId(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative w-full max-w-sm p-10 rounded-[3.5rem] text-center ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white shadow-2xl'}`}>
              <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-2xl font-black mb-2">{isRtl ? "هل أنت متأكد؟" : "Are you sure?"}</h3>
              <p className="opacity-60 mb-8">{isRtl ? "سيتم حذف هذا الاقتراح نهائياً." : "This suggestion will be permanently deleted."}</p>
              <div className="flex flex-col gap-3">
                <button onClick={executeDelete} disabled={isDeleting} className="w-full py-4 rounded-2xl bg-red-600 text-white font-black flex items-center justify-center gap-2">{isDeleting ? <Loader2 className="animate-spin" size={20} /> : (isRtl ? "نعم، احذف" : "Yes, Delete")}</button>
                <button onClick={() => setDeleteConfirmId(null)} disabled={isDeleting} className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 font-black">{isRtl ? "تراجع" : "Cancel"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className={`${currentTheme.card} p-8 rounded-[3.5rem] border ${currentTheme.border} shadow-sm space-y-6 overflow-hidden relative`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <Send size={22} />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-black ${currentTheme.textMain}`}>{translations.telegramChannel}</h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{isRtl ? "تابعنا ليصلك كل جديد وحصري" : "Follow us for all new updates"}</p>
          </div>
        </div>
        <a 
          href="https://t.me/+bHuZxEgnz-MxY2U0" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`w-full py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
        >
          {translations.joinUs}
          <ExternalLink size={18} />
        </a>
      </section>

      <div className={`${currentTheme.card} p-8 rounded-[3rem] border ${currentTheme.border} shadow-sm space-y-8`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <User size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 flex-wrap ${currentTheme.textMain}`}>
                {settings.userName || translations.yourName}
                {settings.isDeveloperMode && (
                  <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
                    <span className="text-[10px] font-black">{isRtl ? "(المطور)" : "(Developer)"}</span>
                    <BadgeCheck size={24} className="text-white fill-blue-500 shadow-md" strokeWidth={2.5} />
                  </div>
                )}
              </h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{isRtl ? "ملف المستخدم" : "User Profile"}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditingName(true)} 
            className={`px-6 py-2 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 ${isDark ? 'bg-amber-400 text-zinc-900' : 'bg-emerald-600 text-white'}`}
          >
            <Edit3 size={14} />
            {isRtl ? "تعديل الاسم" : "Edit Name"}
          </button>
        </div>

        <div className={`p-6 rounded-3xl border-2 border-dashed ${isDark ? 'border-zinc-800 bg-zinc-800/20' : 'border-gray-100 bg-gray-50/50'} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-400 text-zinc-900 shadow-lg">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{isRtl ? "رصيد النقاط" : "Points Balance"}</p>
              
              <AnimatePresence mode="wait">
                {isEditingPoints ? (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2 mt-1">
                    <input 
                      type="number" 
                      autoFocus 
                      value={newPointsInput} 
                      onChange={(e) => setNewPointsInput(e.target.value)} 
                      className={`w-24 p-1 rounded-lg border-2 font-black text-lg outline-none ${isDark ? 'bg-zinc-800 border-amber-400 text-white' : 'bg-white border-emerald-500'}`}
                    />
                    <button onClick={handleUpdatePoints} className="p-2 rounded-lg bg-emerald-500 text-white"><Check size={16} /></button>
                    <button onClick={() => setIsEditingPoints(false)} className="p-2 rounded-lg bg-red-500 text-white"><X size={16} /></button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                    <h4 className={`text-3xl font-black ${currentTheme.textMain}`}>{formatDigits(settings.points, settings.numberFormat)}</h4>
                    {settings.isDeveloperMode && (
                      <button onClick={() => { setIsEditingPoints(true); setNewPointsInput(settings.points.toString()); }} className="p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 hover:text-amber-500 transition-colors">
                        <Edit3 size={14} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-black opacity-30">{isRtl ? "اجمع النقاط لفتح المزايا" : "Earn points to unlock"}</span>
            <div className="h-1.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min((settings.points / PLUS_COST) * 100, 100)}%` }} 
                className="h-full bg-emerald-500"
               />
            </div>
          </div>
        </div>
      </div>

      <section className={`${currentTheme.card} p-8 rounded-[3.5rem] border ${currentTheme.border} shadow-sm space-y-6 relative`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-gray-50 text-emerald-600'}`}>
            <Type size={22} />
          </div>
          <h3 className={`text-xl font-black ${currentTheme.textMain}`}>{translations.fontFamilyLabel}</h3>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
            style={{ fontFamily: currentFont.family }}
            className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all group ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-amber-400' : 'bg-gray-50 border-gray-100 text-emerald-900 shadow-sm'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-black">{currentFont.name}</span>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{isRtl ? 'معاينة الخط' : 'Font Preview'}</span>
            </div>
            <ChevronDown size={24} className={`transition-transform duration-300 ${isFontMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isFontMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 10, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`absolute left-0 right-0 z-[100] mt-2 p-3 rounded-3xl border shadow-2xl ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}
              >
                <div className="grid grid-cols-1 gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        updateSettings({ fontFamily: font.id });
                        setIsFontMenuOpen(false);
                        if ('vibrate' in navigator) navigator.vibrate(10);
                      }}
                      style={{ fontFamily: font.family }}
                      className={`w-full p-5 rounded-2xl text-right flex items-center justify-between transition-all group ${
                        settings.fontFamily === font.id
                        ? (isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white')
                        : (isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-gray-50 text-zinc-900')
                      }`}
                    >
                      <span className="text-base font-bold">{font.name}</span>
                      {settings.fontFamily === font.id && <Check size={20} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ديني بلس - القائمة المحدثة */}
      <section className={`${currentTheme.card} p-8 rounded-[3.5rem] border ${currentTheme.border} shadow-sm overflow-hidden relative`}>
        <div className="absolute -top-10 -left-10 opacity-5 rotate-12">
           <Zap size={200} fill="currentColor" />
        </div>

        {settings.subscriptionTier === 'plus' && (
           <div className="absolute top-0 right-0 p-4">
              <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black shadow-lg flex items-center gap-1">
                <Check size={12} /> {translations.plusMember}
              </div>
           </div>
        )}

        <div className="space-y-8 relative z-10">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl">
                <Star size={32} fill="currentColor" />
             </div>
             <div>
               <h3 className={`text-3xl font-black ${currentTheme.textMain}`}>{translations.plusMember}</h3>
               <p className="text-sm font-bold opacity-50">{isRtl ? "ارتقِ بتجربتك الإيمانية بمزايا حصرية" : "Upgrade your experience with pro features"}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FeatureItem isDark={isDark} icon={<ShieldCheck size={18} />} text={translations.removeAds} subText={isRtl ? "تجربة هادئة بدون تشتيت" : "Clean, focused experience"} />
             <FeatureItem isDark={isDark} icon={<Sparkles size={18} />} text={translations.aiFeatures} subText={isRtl ? "فتاوى وإجابات دقيقة ومعمقة" : "Deep AI religious answers"} />
             <FeatureItem isDark={isDark} icon={<MessageCircle size={18} />} text={translations.unlimitedAI} subText={isRtl ? "تحدث مع ديني AI بلا قيود" : "No daily limits for AI chat"} />
             <FeatureItem isDark={isDark} icon={<BadgeCheck size={18} />} text={translations.badgeCheck} subText={isRtl ? "شارة التوثيق في قسم المجتمع" : "Verified badge for posts"} />
          </div>

          <div className="pt-4">
            {settings.subscriptionTier === 'plus' ? (
              <div className={`p-6 rounded-3xl border-2 border-emerald-500 text-emerald-500 text-center font-black flex items-center justify-center gap-3 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <Sparkles size={24} />
                {isRtl ? "أنت الآن مشترك في ديني بلس" : "Dini Plus is Active"}
              </div>
            ) : (
              <button 
                onClick={handleRedeemPlus} 
                disabled={settings.points < PLUS_COST || redeemLoading}
                className={`w-full py-6 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}
              >
                {redeemLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Coins size={28} />
                    {isRtl ? `استبدال بـ ${formatDigits(PLUS_COST, settings.numberFormat)} نقطة` : `Redeem for ${PLUS_COST} pts`}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className={`${currentTheme.card} p-8 rounded-[3rem] border ${currentTheme.border} shadow-sm overflow-hidden`}>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-gray-50 text-emerald-600'}`}>
              <ShieldCheck size={22} />
            </div>
            <h3 className={`text-xl font-black ${currentTheme.textMain}`}>{isRtl ? "وضع المطور" : "Developer Mode"}</h3>
          </div>
          <button onClick={() => settings.isDeveloperMode ? updateSettings({ isDeveloperMode: false }) : setShowPinDialog(true)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${settings.isDeveloperMode ? 'bg-red-500 text-white shadow-lg' : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500')}`}>
            {settings.isDeveloperMode ? <Unlock size={16} /> : <Lock size={16} />}
          </button>
        </div>
        <AnimatePresence>
          {showPinDialog && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-6 space-y-4">
              <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder={isRtl ? "الرمز السري" : "PIN"} className={`w-full p-4 rounded-xl border-2 outline-none text-center tracking-[0.5em] font-black ${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-400' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} autoFocus />
              <button onClick={verifyDevMode} className={`w-full py-4 rounded-xl font-black shadow-lg ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}>{isRtl ? "فتح" : "Unlock"}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="space-y-6">
        <div className={`${currentTheme.card} p-8 rounded-[3rem] border ${currentTheme.border} shadow-sm space-y-6`}>
          <div className="flex items-center gap-4">
            <MessageSquare size={22} className={currentTheme.accent} />
            <h3 className={`text-xl font-black ${currentTheme.textMain}`}>{translations.suggestIdeas}</h3>
          </div>
          <form onSubmit={handleSendSuggestion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className={`w-full p-4 rounded-2xl border-2 bg-zinc-100 dark:bg-zinc-800 border-transparent opacity-60 flex items-center justify-between`}>
                  <span className="text-xs font-bold">{settings.userName || translations.yourName}</span>
                  <UserCheck size={16} />
                </div>
              </div>
              <input type="number" value={sugAge} onChange={(e) => setSugAge(e.target.value)} placeholder={translations.ageOptional} disabled={isSending} className={`w-full p-4 rounded-2xl border-2 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-400' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} />
            </div>
            <textarea required value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} placeholder={translations.suggestionPlaceholder} disabled={isSending} className={`w-full min-h-[120px] p-5 rounded-2xl border-2 outline-none transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-400' : 'bg-gray-50 border-gray-200 focus:border-emerald-500'}`} />
            {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-xl flex items-center gap-2"><ShieldAlert size={14} /> {error}</p>}
            <button type="submit" disabled={isSending || !suggestionText.trim() || !settings.userName} className={`w-full py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50`}>{isSending ? <Loader2 className="animate-spin" /> : <><Send size={20} /> {translations.sendSuggestion}</>}</button>
          </form>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {allSuggestions.length > 0 ? allSuggestions.map((s) => {
              const isLiked = userLikedIds.includes(s.id);
              const isDev = settings.isDeveloperMode;
              const isOwner = s.ownerId === currentUserId;
              const isReplyingNow = replyingSugId === s.id;

              return (
                <motion.div layout key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-6 md:p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-xl' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>{s.name?.charAt(0)}</div>
                      <div>
                        <h4 className={`text-xs font-black flex items-center gap-2 flex-wrap ${isDark ? 'text-zinc-100' : 'text-emerald-900'}`}>
                          {s.name} 
                          {isDev && (
                            <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/10">
                              <span className="text-[8px] font-black">{isRtl ? "(المطور)" : "(Developer)"}</span>
                              <BadgeCheck size={18} className="text-white fill-blue-500" strokeWidth={2.5} />
                            </span>
                          )}
                          {s.age && <span className="text-[10px] opacity-40">({formatDigits(s.age, settings.numberFormat)})</span>}
                        </h4>
                        <p className="text-[9px] font-bold opacity-30">{new Date(s.timestamp).toLocaleDateString(settings.language)}</p>
                      </div>
                    </div>
                    {(isOwner || isDev) && (
                      <div className="flex items-center gap-2">
                         {isDev && <button onClick={() => { setReplyingSugId(isReplyingNow ? null : s.id); setDevReplyText(s.devReply || ""); }} className={`p-2 transition-colors ${isReplyingNow ? 'text-emerald-500' : 'text-zinc-400 hover:text-emerald-500'}`}><CornerDownLeft size={16} /></button>}
                         <button onClick={() => setDeleteConfirmId({id: s.id, type: 'post'})} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>

                  <p className={`text-base font-arabic leading-relaxed mb-4 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{s.text}</p>

                  <AnimatePresence>
                    {isReplyingNow && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 space-y-3 pt-4 border-t border-zinc-800/10">
                        <textarea value={devReplyText} onChange={(e) => setDevReplyText(e.target.value)} placeholder={isRtl ? "اكتب رد المطور..." : "Developer reply..."} className={`w-full p-4 rounded-xl border-2 outline-none text-sm font-arabic ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200'}`} />
                        <div className="flex gap-2">
                          <button onClick={() => handleDevReply(s.id)} disabled={isReplying} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-2">{isReplying ? <Loader2 size={12} className="animate-spin" /> : (isRtl ? "إرسال الرد" : "Send Reply")}</button>
                          <button onClick={() => setReplyingSugId(null)} className="px-6 py-2 bg-gray-400 text-white rounded-lg text-[10px] font-black">{isRtl ? "إلغاء" : "Cancel"}</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {s.devReply && (
                    <div className={`mb-4 p-5 rounded-2xl border-l-4 ${isDark ? 'bg-amber-400/5 border-amber-400 text-zinc-300' : 'bg-emerald-50 border-emerald-500 text-emerald-950'} space-y-2 relative overflow-hidden shadow-sm`}>
                      <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider opacity-60">
                        <Shield size={12} className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
                        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
                          {isRtl ? "رد المطور الرسمي" : "Official Developer Reply"}
                          <BadgeCheck size={18} className="text-white fill-blue-500 shadow-sm" strokeWidth={2.5} />
                        </div>
                      </div>
                      <p className="text-sm font-arabic leading-relaxed italic">{s.devReply}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800">
                    <div className="flex items-center gap-6">
                      <button onClick={() => {
                        const isLiked = userLikedIds.includes(s.id);
                        const sugRef = doc(db, "suggestions", s.id);
                        if (isLiked) {
                          setUserLikedIds(prev => prev.filter(i => i !== s.id));
                          updateDoc(sugRef, { likes: increment(-1) });
                        } else {
                          setUserLikedIds(prev => [...prev, s.id]);
                          updateDoc(sugRef, { likes: increment(1) });
                          if ('vibrate' in navigator) navigator.vibrate(20);
                        }
                      }} className={`flex items-center gap-2 text-xs font-black transition-all ${userLikedIds.includes(s.id) ? 'text-red-500' : 'opacity-40'}`}>
                        <Heart size={18} className={userLikedIds.includes(s.id) ? "fill-current" : ""} />
                        <span>{formatDigits(s.likes || 0, settings.numberFormat)}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="text-center py-10 opacity-30">
                 <p className="text-xs font-black uppercase tracking-widest">{isRtl ? "لا توجد مقترحات بعد" : "No suggestions yet"}</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ isDark, icon, text, subText }: any) => (
  <div className={`flex items-center gap-4 p-4 rounded-3xl border ${isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-white border-emerald-50 shadow-sm'}`}>
    <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black">{text}</span>
      {subText && <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{subText}</span>}
    </div>
  </div>
);

export default Settings;
