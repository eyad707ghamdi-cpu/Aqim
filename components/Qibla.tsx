
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, Compass, Smartphone, AlertCircle, Camera, X } from 'lucide-react';
import { Translation, ThemeColor, NumberFormat } from '../types';
import { THEMES, formatDigits } from '../constants';
import AppLoader from './AppLoader';

interface QiblaProps {
  translations: Translation;
  theme: ThemeColor | 'dark';
  numberFormat?: NumberFormat;
}

const Qibla: React.FC<QiblaProps> = ({ translations, theme, numberFormat = 'latin' }) => {
  const [qiblaDegrees, setQiblaDegrees] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [arMode, setArMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentTheme = THEMES[theme];
  const activeNumberFormat = numberFormat as NumberFormat;

  const MECCA_COORD = { lat: 21.4225, lng: 39.8262 };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    // webkitCompassHeading مخصص لأجهزة iOS
    let heading = (e as any).webkitCompassHeading || e.alpha || 0;
    if (e.absolute === false && !(e as any).webkitCompassHeading) {
      // إذا لم يكن الحساس مطلقاً (Android قد يحتاج معالجة إضافية)
      heading = e.alpha || 0;
    }
    setDeviceHeading(heading);
  };

  const startCompass = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setNeedsPermission(false);
          setIsCompassActive(true);
        } else {
          setError("تم رفض إذن الوصول للحساسات");
        }
      } catch (e) {
        setError("فشل طلب الإذن");
      }
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      setIsCompassActive(true);
    }
  };

  const toggleArMode = async () => {
    if (arMode) {
      setArMode(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setArMode(true);
        if (!isCompassActive) startCompass();
      } catch (err) {
        setError("لا يمكن الوصول للكاميرا");
      }
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    // فحص إذا كان الجهاز يتطلب إذناً (iOS)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat1 = (pos.coords.latitude * Math.PI) / 180;
        const lon1 = (pos.coords.longitude * Math.PI) / 180;
        const lat2 = (MECCA_COORD.lat * Math.PI) / 180;
        const lon2 = (MECCA_COORD.lng * Math.PI) / 180;

        const y = Math.sin(lon2 - lon1);
        const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1);
        const qibla = (Math.atan2(y, x) * 180) / Math.PI;
        setQiblaDegrees((qibla + 360) % 360);

        const dist = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          MECCA_COORD.lat,
          MECCA_COORD.lng
        );
        setDistance(dist);
        setLoading(false);
      },
      () => {
        setError(translations.allowLocation);
        setLoading(false);
      }
    );

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [translations.allowLocation]);

  // الزاوية النهائية للإبرة = اتجاه القبلة من الشمال - اتجاه الجهاز الحالي من الشمال
  const finalNeedleRotation = qiblaDegrees !== null ? qiblaDegrees - deviceHeading : 0;
  
  // AR Kaaba position
  // Field of view approx 60 degrees. Let's calculate horizontal offset.
  const angleDiff = qiblaDegrees !== null ? ((qiblaDegrees - deviceHeading + 540) % 360) - 180 : 0;
  const isKaabaVisible = Math.abs(angleDiff) < 45; // Visible within 45 degrees
  const translateX = angleDiff * 8; // Adjust multiplier as needed for screen width

  return (
    <div className={`flex flex-col items-center justify-center space-y-8 py-12 px-4 pb-40 transition-all duration-500 ${arMode ? 'fixed inset-0 z-[100] bg-black p-0 m-0' : ''}`}>
      {arMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover opacity-80"
          />
          {isKaabaVisible && (
            <motion.div 
              className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center gap-2"
              animate={{ x: translateX - 40, y: '-50%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div className="text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">🕋</div>
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm tracking-widest uppercase border border-white/20">
                {formatDigits(Math.round(distance || 0), activeNumberFormat)} km
              </div>
            </motion.div>
          )}

          {/* AR UI Overlay */}
          <div className="absolute inset-x-0 bottom-12 flex flex-col items-center">
            <div className={`px-8 py-4 rounded-full flex items-center gap-3 font-black text-lg bg-black/50 backdrop-blur-xl text-white shadow-2xl border border-white/10 mb-8`}>
              <Compass size={22} className={Math.abs(angleDiff) < 5 ? 'text-emerald-400' : 'text-white'} />
              <span dir="ltr">{formatDigits(qiblaDegrees?.toFixed(1) || '0', activeNumberFormat)}°</span>
            </div>
            <button 
              onClick={toggleArMode}
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-90 transition-all pointer-events-auto shadow-2xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {!arMode && (
        <div className="text-center max-w-sm">
          <h2 className={`text-3xl md:text-4xl font-black mb-2 ${currentTheme.textMain}`}>{translations.qibla}</h2>
          <p className={`text-sm font-bold opacity-50 ${currentTheme.textMuted}`}>{translations.findingLocation}</p>
        </div>
      )}

      {/* Compass View */}
      <motion.div 
        animate={{ scale: arMode ? 0.6 : 1, y: arMode ? -150 : 0, opacity: arMode ? 0.8 : 1 }}
        className={`relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center ${arMode ? 'pointer-events-none mt-10' : ''}`}
      >
        {/* حلقات البوصلة الخلفية */}
        <div className={`absolute inset-0 border-[10px] ${theme === 'dark' ? 'border-zinc-900 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'border-gray-100 shadow-inner'} rounded-full`} />
        
        {/* مؤشرات الاتجاهات الثابتة (تدور مع الجهاز لتبقى البوصلة ثابتة واقعياً) */}
        <motion.div 
          animate={{ rotate: -deviceHeading }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          className="absolute inset-0 p-6 flex items-center justify-center pointer-events-none"
        >
          <span className="absolute top-2 font-black text-red-500 text-lg">N</span>
          <span className="absolute right-2 font-black text-gray-400">E</span>
          <span className="absolute bottom-2 font-black text-gray-400">S</span>
          <span className="absolute left-2 font-black text-gray-400">W</span>
          
          <div className="w-full h-full rounded-full border border-dashed border-gray-200/30" />
        </motion.div>

        {/* حالة التحميل أو الخطأ */}
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <AppLoader size="md" />
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
            <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
          </div>
        ) : (
          <AnimatePresence>
            {/* إبرة القبلة الذكية */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, rotate: finalNeedleRotation }}
              transition={{ type: 'spring', stiffness: 50, damping: 12 }}
              className="relative flex items-center justify-center z-20"
            >
              <div className={`w-1.5 h-44 md:h-48 rounded-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} absolute`} />
              
              <div className="flex flex-col items-center">
                {/* رأس الإبرة يشير لمكة */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[50px] ${currentTheme.primary.replace('bg-', 'border-b-')} drop-shadow-lg mb-2`} 
                />
                
                <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-zinc-900 ${currentTheme.primary} shadow-2xl flex items-center justify-center`}>
                  <Navigation className="text-white fill-current" size={20} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {!arMode && needsPermission && !isCompassActive && !loading && !error && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={startCompass}
          className={`px-8 py-5 rounded-[2rem] font-black text-sm shadow-xl flex items-center gap-3 transition-all active:scale-95 ${currentTheme.primary} text-white`}
        >
          <Smartphone size={20} />
          تفعيل حركة البوصلة الحية
        </motion.button>
      )}

      <AnimatePresence>
        {!arMode && !loading && !error && distance !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 w-full max-w-xs"
          >
            <div className={`w-full ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'} p-8 rounded-[2.5rem] shadow-xl border flex flex-col items-center gap-4`}>
              <div className={`w-14 h-14 rounded-2xl ${currentTheme.secondary} flex items-center justify-center text-3xl shadow-inner`}>
                🕋
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-40 ${currentTheme.textMain}`}>
                  {translations.distanceToKaaba}
                </p>
                <h4 className={`text-4xl font-black ${currentTheme.textMain}`}>
                  {formatDigits(Math.round(distance).toLocaleString(), activeNumberFormat)} 
                  <span className="text-sm font-bold opacity-40 mx-1">km</span>
                </h4>
              </div>
            </div>

            <div className="flex w-full gap-2">
              <button 
                onClick={toggleArMode}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-lg active:scale-95 transition-all ${isCompassActive ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900') : 'opacity-50 pointer-events-none'}`}
              >
                <Camera size={18} />
                الواقع المعزز (AR)
              </button>
              
              <div className={`flex-[1.5] py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm ${currentTheme.primary} text-white shadow-lg`}>
                <Compass size={18} />
                <span dir="ltr">{formatDigits(qiblaDegrees?.toFixed(1) || '0', activeNumberFormat)}°</span>
              </div>
            </div>
            
            <p className="text-[10px] font-bold opacity-30 text-center uppercase tracking-widest px-4 mt-2">
              ضع الجهاز بشكل أفقي للحصول على أدق نتيجة، واستخدم ميزة AR لرؤية الاتجاه عبر الكاميرا
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Qibla;
