import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { auth, db, doc, setDoc, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '../services/firebase';
import { AuthUser, Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  theme: string;
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, theme, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const isRtl = language === 'ar' || language === 'ur';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLogin && !username.trim())) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        onSuccess({
          uid: user.uid,
          username: user.displayName || email.split('@')[0],
          email: user.email || undefined
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: username.trim() });
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          username: username.trim(),
          email: email.trim(),
          createdAt: Date.now(),
          isDeveloper: false,
          points: 0
        });

        onSuccess({
          uid: user.uid,
          username: username.trim(),
          email: email.trim()
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(isRtl ? "خطأ في البريد الإلكتروني أو كلمة المرور" : "Invalid email or password");
      } else if (err.code === 'auth/email-already-in-use') {
        setError(isRtl ? "البريد الإلكتروني مستخدم بالفعل" : "Email already in use");
      } else if (err.code === 'auth/weak-password') {
        setError(isRtl ? "كلمة المرور ضعيفة جداً" : "Password is too weak");
      } else {
        setError(isRtl ? "حدث خطأ أثناء الاتصال" : "Authentication error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className={`relative w-full max-w-md p-8 rounded-[3rem] border shadow-2xl ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-100'}`}
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-50 text-emerald-600'}`}>
                {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
              </div>
              <h3 className="text-2xl font-black">{isLogin ? (isRtl ? "تسجيل الدخول" : "Login") : (isRtl ? "إنشاء حساب" : "Register")}</h3>
              <p className="text-xs opacity-50 mt-1">{isRtl ? "انضم لمجتمع أقِم" : "Join Aqim community"}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} opacity-30`} size={20} />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder={isRtl ? "اسم المستخدم" : "Username"} 
                    className={`w-full p-4 ${isRtl ? 'pr-12' : 'pl-12'} rounded-2xl border-2 outline-none transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 focus:border-amber-400 text-white' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} 
                  />
                </div>
              )}
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} opacity-30`} size={20} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder={isRtl ? "البريد الإلكتروني" : "Email Address"} 
                  className={`w-full p-4 ${isRtl ? 'pr-12' : 'pl-12'} rounded-2xl border-2 outline-none transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 focus:border-amber-400 text-white' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} 
                />
              </div>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} opacity-30`} size={20} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={isRtl ? "كلمة المرور" : "Password"} 
                  className={`w-full p-4 ${isRtl ? 'pr-12' : 'pl-12'} rounded-2xl border-2 outline-none transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 focus:border-amber-400 text-white' : 'bg-gray-50 border-gray-100 focus:border-emerald-500'}`} 
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

              <button 
                disabled={loading} 
                className={`w-full py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600 text-white'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? (isRtl ? "دخول" : "Login") : (isRtl ? "تسجيل" : "Register"))}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className={`text-xs font-black transition-all ${isDark ? 'text-amber-400' : 'text-emerald-600'}`}
              >
                {isLogin ? (isRtl ? "لا تملك حساباً؟ سجل الآن" : "No account? Register now") : (isRtl ? "تملك حساباً بالفعل؟ سجل دخولك" : "Have an account? Login")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;