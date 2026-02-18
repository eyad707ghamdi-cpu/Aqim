
import React from 'react';
import { motion } from 'framer-motion';

const MockAd: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-24 left-4 z-40 pointer-events-none hidden lg:block"
    >
      <div className="bg-zinc-800/80 backdrop-blur-md text-[8px] text-white/40 px-2 py-4 rounded-xl border border-white/5 writing-vertical-lr flex flex-col items-center gap-2">
        <span className="uppercase tracking-widest font-black [writing-mode:vertical-lr]">ADVERTISEMENT</span>
        <div className="w-1 h-8 bg-amber-400/20 rounded-full" />
      </div>
    </motion.div>
  );
};

export const CornerAdMobile: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-24 right-4 z-[45]"
    >
      <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[9px] font-black text-white/50 uppercase tracking-tighter">Sponsored Content</span>
      </div>
    </motion.div>
  );
};

export default MockAd;
