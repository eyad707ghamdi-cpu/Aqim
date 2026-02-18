
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Flag, Trash2, Send, ShieldAlert, X, CheckCircle2, ShieldCheck, UserCheck, ChevronLeft, ChevronRight, Edit3, History, Eye, EyeOff, Loader2, Image as ImageIcon, AlertTriangle, Clock, Reply as ReplyIcon, ChevronDown, ChevronUp, CornerDownLeft, AtSign, BadgeCheck } from 'lucide-react';
import { Comment, CommunityReply, ThemeColor, Language } from '../types';
import { THEMES, formatDigits } from '../constants';
import { sendToTelegram } from '../services/telegramService';
import { db, storage, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, increment, ref, uploadString, getDownloadURL } from '../services/firebase';

interface CommunityProps {
  theme: ThemeColor | 'dark';
  language: Language;
  isAdmin: boolean;
  userName?: string;
  telegramConfig?: { botToken?: string, chatId?: string };
}

const Community: React.FC<CommunityProps> = ({ theme, language, isAdmin, userName, telegramConfig }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [userLikedIds, setUserLikedIds] = useState<string[]>([]);
  const [userLikedReplyIds, setUserLikedReplyIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});
  const [replyTarget, setReplyTarget] = useState<{ [key: string]: string | null }>({});
  
  const [age, setAge] = useState("");
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<{id: string, type: 'post' | 'reply'} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedItemForReport, setSelectedItemForReport] = useState<{content: string, name: string} | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  
  const [replyInput, setReplyInput] = useState<{ [key: string]: { message: string, selectedImage: string | null } }>({});
  const [replyLoading, setReplyLoading] = useState<{ [key: string]: boolean }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const isRtl = language === 'ar' || language === 'ur';
  const isDark = theme === 'dark';

  const toggleReplies = (postId: string) => {
    setExpandedReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const setTargetUser = (postId: string, name: string) => {
    setReplyTarget(prev => ({ ...prev, [postId]: name }));
  };

  const clearTargetUser = (postId: string) => {
    setReplyTarget(prev => ({ ...prev, [postId]: null }));
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return isRtl ? "الآن" : "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return isRtl ? `منذ ${formatDigits(minutes, 'arabic')} دقيقة` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return isRtl ? `منذ ${formatDigits(hours, 'arabic')} ساعة` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return isRtl ? `منذ ${formatDigits(days, 'arabic')} أيام` : `${days}d ago`;
  };

  useEffect(() => {
    let userId = localStorage.getItem('al_salat_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('al_salat_user_id', userId);
    }
    setCurrentUserId(userId);

    const qPosts = query(collection(db, "community_posts"), orderBy("timestamp", "desc"));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    });

    const qReplies = query(collection(db, "community_replies"), orderBy("timestamp", "asc"));
    const unsubReplies = onSnapshot(qReplies, (snapshot) => {
      setReplies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CommunityReply[]);
    });

    const savedLikes = localStorage.getItem('al_salat_user_likes_v5');
    if (savedLikes) try { setUserLikedIds(JSON.parse(savedLikes)); } catch(e){}

    const savedReplyLikes = localStorage.getItem('al_salat_reply_likes_v5');
    if (savedReplyLikes) try { setUserLikedReplyIds(JSON.parse(savedReplyLikes)); } catch(e){}

    return () => { unsubPosts(); unsubReplies(); };
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userName?.trim()) { setError(isRtl ? "يرجى تحديد اسم من الإعدادات" : "Set name in settings"); return; }
    if ((!message.trim() && !selectedImage) || loading) return;
    setLoading(true);

    try {
      // تم إلغاء فحص المحتوى
      let uploadedImageUrl = "";
      if (selectedImage) {
        const imageRef = ref(storage, `community/${Date.now()}.jpg`);
        await uploadString(imageRef, selectedImage, 'data_url');
        uploadedImageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "community_posts"), {
        ownerId: currentUserId,
        name: userName.trim(),
        age: age.trim() || null,
        message: message.trim(),
        image: uploadedImageUrl || null,
        timestamp: Date.now(),
        likes: 0,
        reports: 0,
        isDeveloper: isAdmin
      });
      setMessage(""); setAge(""); setSelectedImage(null);
    } catch (err) { setError(isRtl ? "خطأ في النشر" : "Post error"); } finally { setLoading(false); }
  };

  const handleReplyImageChange = (postId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyInput(prev => ({
          ...prev,
          [postId]: { ...(prev[postId] || { message: "" }), selectedImage: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReply = async (postId: string) => {
    if (!userName?.trim()) return;
    const rData = replyInput[postId];
    if (!rData?.message.trim() && !rData?.selectedImage) return;
    
    setReplyLoading(prev => ({ ...prev, [postId]: true }));

    try {
      // تم إلغاء فحص الرد
      let uploadedImageUrl = "";
      if (rData.selectedImage) {
        const imageRef = ref(storage, `community_replies/${Date.now()}.jpg`);
        await uploadString(imageRef, rData.selectedImage, 'data_url');
        uploadedImageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "community_replies"), {
        postId,
        ownerId: currentUserId,
        name: userName.trim(),
        message: rData.message.trim(),
        image: uploadedImageUrl || null,
        timestamp: Date.now(),
        likes: 0,
        isDeveloper: isAdmin,
        replyToName: replyTarget[postId] || null
      });
      
      setReplyInput(prev => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      setReplyTarget(prev => ({ ...prev, [postId]: null }));
      setExpandedReplies(prev => ({ ...prev, [postId]: true }));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setReplyLoading(prev => ({ ...prev, [postId]: false })); 
    }
  };

  const handleToggleLike = async (id: string, isPost: boolean) => {
    const list = isPost ? userLikedIds : userLikedReplyIds;
    const setter = isPost ? setUserLikedIds : setUserLikedReplyIds;
    const col = isPost ? "community_posts" : "community_replies";
    const isLiked = list.includes(id);
    const refDoc = doc(db, col, id);

    if (isLiked) {
      setter(prev => prev.filter(i => i !== id));
      await updateDoc(refDoc, { likes: increment(-1) });
    } else {
      setter(prev => [...prev, id]);
      await updateDoc(refDoc, { likes: increment(1) });
      if ('vibrate' in navigator) navigator.vibrate(20);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId || isDeleting) return;
    setIsDeleting(true);
    try {
      const col = deleteConfirmId.type === 'post' ? "community_posts" : "community_replies";
      await deleteDoc(doc(db, col, deleteConfirmId.id));
      setDeleteConfirmId(null);
    } catch (e) { console.error(e); } finally { setIsDeleting(false); }
  };

  const submitReport = async (reason: string) => {
    if (!selectedItemForReport || reporting) return;
    setReporting(true);
    try {
      const msg = `🚨 <b>إبلاغ:</b>\n\n<b>المحتوى:</b> ${selectedItemForReport.content}\n<b>الكاتب:</b> ${selectedItemForReport.name}\n<b>السبب:</b> ${reason}`;
      await sendToTelegram(msg, telegramConfig?.botToken || "", telegramConfig?.chatId || "", 'REPORT');
      setReportSuccess(true);
      setTimeout(() => { setReportModalOpen(false); setReportSuccess(false); }, 2000);
    } catch (e) { alert("Error reporting"); } finally { setReporting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setDeleteConfirmId(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative w-full max-w-sm p-10 rounded-[3.5rem] text-center ${isDark ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white shadow-2xl'}`}>
              <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
              <h3 className="text-2xl font-black mb-2">{isRtl ? "هل أنت متأكد؟" : "Are you sure?"}</h3>
              <p className="opacity-60 mb-8">{isRtl ? "سيتم حذف هذا المحتوى نهائياً." : "This content will be permanently deleted."}</p>
              <div className="flex flex-col gap-3">
                <button onClick={executeDelete} className="w-full py-4 rounded-2xl bg-red-600 text-white font-black">{isRtl ? "نعم، احذف" : "Yes, Delete"}</button>
                <button onClick={() => setDeleteConfirmId(null)} className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 font-black">{isRtl ? "تراجع" : "Cancel"}</button>
              </div>
            </motion.div>
          </div>
        )}

        {reportModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setReportModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div className={`relative w-full max-w-md p-8 rounded-[3rem] ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'}`}>
              <h3 className="text-2xl font-black mb-6">{isRtl ? "سبب الإبلاغ" : "Report Reason"}</h3>
              {reportSuccess ? <div className="text-center py-10 font-black text-emerald-500">{isRtl ? "تم الإرسال" : "Sent"}</div> : (
                <div className="space-y-3">
                  {["إساءة", "محتوى غير لائق", "سبام", "أخرى"].map(r => (
                    <button key={r} onClick={() => submitReport(r)} className="w-full p-4 rounded-2xl border-2 text-right font-bold hover:border-red-500">{r}</button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handlePost} className={`${isDark ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white shadow-lg'} p-8 rounded-[3rem] border space-y-6`}>
        <div className="flex items-center gap-3">
          <MessageSquare className={isDark ? 'text-amber-400' : 'text-emerald-600'} />
          <h3 className="text-xl font-black">{isRtl ? "شاركنا أثراً طيباً" : "Share Goodness"}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent flex items-center justify-between">
            <span className="text-xs font-black">{userName || (isRtl ? "ادخل اسمك من الإعدادات" : "Set name in settings")}</span>
            <UserCheck size={18} className="opacity-40" />
          </div>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder={isRtl ? "العمر (اختياري)" : "Age (Optional)"} className={`w-full p-4 rounded-2xl border-2 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-400' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} />
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={isRtl ? "رسالتك..." : "Your message..."} className={`w-full h-32 p-4 rounded-2xl border-2 outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-amber-400' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} />
        
        <AnimatePresence>
          {selectedImage && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative inline-block">
              <img src={selectedImage} className="w-24 h-24 object-cover rounded-2xl border-2 border-emerald-500" />
              <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-4 rounded-2xl ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-gray-50 text-emerald-600'}`}>
            <ImageIcon size={24} />
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
          </button>
          <button disabled={loading || !userName} className={`flex-1 py-5 rounded-2xl font-black text-lg ${isDark ? 'bg-amber-400 text-zinc-900' : 'bg-emerald-600 text-white'} disabled:opacity-50`}>{loading ? <Loader2 className="animate-spin mx-auto" /> : isRtl ? "نشر" : "Post"}</button>
        </div>
        {error && <p className="text-center text-xs font-bold text-red-500">{error}</p>}
      </motion.form>

      <div className="space-y-8">
        {comments.map((comment) => {
          const postReplies = replies.filter(r => r.postId === comment.id);
          const isExpanded = expandedReplies[comment.id];
          const currentTarget = replyTarget[comment.id];
          const currentReplyData = replyInput[comment.id] || { message: "", selectedImage: null };

          return (
            <motion.div key={comment.id} layout className={`p-8 rounded-[3rem] border ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-xl' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>{comment.name?.charAt(0)}</div>
                  <div>
                    <h4 className="font-black text-sm flex items-center gap-1.5 flex-wrap">
                      {comment.name}
                      {comment.isDeveloper && (
                        <motion.span 
                          initial={{ scale: 0, rotate: -10 }} 
                          animate={{ scale: 1, rotate: 0 }} 
                          className="flex items-center gap-1.5 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20"
                        >
                          <span className="text-[10px] font-black">{isRtl ? "(المطور)" : "(Developer)"}</span>
                          <BadgeCheck size={20} className="text-white fill-blue-500 shadow-sm" strokeWidth={2.5} />
                        </motion.span>
                      )}
                    </h4>
                    <span className="text-[9px] opacity-40 font-bold">{getTimeAgo(comment.timestamp)}</span>
                  </div>
                </div>
                {(comment.ownerId === currentUserId || isAdmin) && (
                  <button onClick={() => setDeleteConfirmId({id: comment.id, type: 'post'})} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                {comment.message && <p className="text-lg font-arabic whitespace-pre-wrap">{comment.message}</p>}
                {(comment as any).image && <img src={(comment as any).image} className="w-full rounded-[2rem] object-cover max-h-96 shadow-md" alt="post attachment" />}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/10 mb-6">
                <div className="flex items-center gap-6">
                  <button onClick={() => handleToggleLike(comment.id, true)} className={`flex items-center gap-2 text-xs font-black transition-all ${userLikedIds.includes(comment.id) ? 'text-red-500' : 'opacity-40'}`}>
                    <Heart size={18} fill={userLikedIds.includes(comment.id) ? "currentColor" : "none"} /> 
                    {formatDigits(comment.likes, isRtl ? 'arabic' : 'latin')}
                  </button>
                  <button onClick={() => setTargetUser(comment.id, comment.name || "")} className="text-[10px] font-black opacity-30 hover:text-emerald-500 flex items-center gap-1">
                    <ReplyIcon size={14} /> {isRtl ? "رد" : "Reply"}
                  </button>
                  {!comment.isDeveloper && (
                    <button onClick={() => { setSelectedItemForReport({content: comment.message, name: comment.name || ""}); setReportModalOpen(true); }} className="text-[10px] font-black opacity-30 hover:text-red-500"><Flag size={14} /></button>
                  )}
                </div>

                {postReplies.length > 0 && (
                  <button 
                    onClick={() => toggleReplies(comment.id)} 
                    className={`flex items-center gap-2 text-[10px] font-black transition-all ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isRtl ? `عرض ${formatDigits(postReplies.length, 'arabic')} ردود` : `View ${postReplies.length} replies`}
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && postReplies.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 mb-8">
                    {postReplies.map(reply => (
                      <div key={reply.id} className={`p-4 rounded-2xl border-r-2 ${reply.isDeveloper ? (isDark ? 'bg-amber-400/5 border-amber-400' : 'bg-emerald-50 border-emerald-500') : (isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200')}`}>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black flex items-center gap-1.5">
                              {reply.name}
                              {reply.isDeveloper && (
                                <span className="flex items-center gap-1 bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/10">
                                  <span className="text-[8px] font-black">{isRtl ? "(المطور)" : "(Developer)"}</span>
                                  <BadgeCheck size={16} className="text-white fill-blue-500" strokeWidth={2.5} />
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] opacity-30">{getTimeAgo(reply.timestamp)}</span>
                          </div>
                          {(reply.ownerId === currentUserId || isAdmin) && (
                            <button onClick={() => setDeleteConfirmId({id: reply.id, type: 'reply'})} className="text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                          )}
                        </div>
                        {reply.replyToName && <p className="text-[9px] font-bold opacity-30 mb-1">@{reply.replyToName}</p>}
                        <div className="space-y-2">
                          {reply.message && <p className="text-sm">{reply.message}</p>}
                          {reply.image && <img src={reply.image} className="w-full rounded-xl object-cover max-h-48" />}
                        </div>
                        <button onClick={() => handleToggleLike(reply.id, false)} className={`mt-2 flex items-center gap-1 text-[10px] font-black ${userLikedReplyIds.includes(reply.id) ? 'text-red-500' : 'opacity-40'}`}>
                          <Heart size={12} fill={userLikedReplyIds.includes(reply.id) ? "currentColor" : "none"} /> 
                          {formatDigits(reply.likes, isRtl ? 'arabic' : 'latin')}
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {currentTarget && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 pt-4 border-t border-zinc-800/5">
                    <div className="flex items-center justify-between text-[10px] font-black text-amber-500">
                      <span>{isRtl ? `الرد على: ${currentTarget}` : `Replying to: ${currentTarget}`}</span>
                      <button onClick={() => clearTargetUser(comment.id)}><X size={12} /></button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => replyFileInputRefs.current[comment.id]?.click()} className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800 text-amber-400' : 'bg-gray-100 text-emerald-600'}`}>
                        <ImageIcon size={18} />
                        {/* Fix: Wrapped ref callback assignment in curly braces to ensure it returns void */}
                        <input type="file" ref={el => { replyFileInputRefs.current[comment.id] = el; }} hidden accept="image/*" onChange={(e) => handleReplyImageChange(comment.id, e)} />
                      </button>
                      <input 
                        value={currentReplyData.message} 
                        onChange={e => setReplyInput(prev => ({ ...prev, [comment.id]: { ...(prev[comment.id] || {selectedImage: null}), message: e.target.value }}))}
                        placeholder={isRtl ? "اكتب رداً..." : "Reply..."} 
                        className={`flex-1 p-3 rounded-xl border text-xs outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-100 border-gray-100'}`} 
                      />
                      <button onClick={() => handleReply(comment.id)} disabled={replyLoading[comment.id] || (!currentReplyData.message.trim() && !currentReplyData.selectedImage)} className={`p-3 rounded-xl bg-emerald-600 text-white`}>
                        {replyLoading[comment.id] ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                    {currentReplyData.selectedImage && (
                      <div className="relative inline-block mt-2">
                        <img src={currentReplyData.selectedImage} className="w-12 h-12 object-cover rounded-lg border-2 border-emerald-500" />
                        <button onClick={() => setReplyInput(prev => ({ ...prev, [comment.id]: { ...(prev[comment.id] || {message: ""}), selectedImage: null }}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Community;
