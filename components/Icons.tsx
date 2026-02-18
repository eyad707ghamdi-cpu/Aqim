
import React from 'react';
import { motion } from 'framer-motion';
import { LoadingVariant } from '../types';

interface IconProps {
  size?: number;
  className?: string;
  fill?: string;
  variant?: LoadingVariant | 'static';
}

export const CrescentStarIcon: React.FC<IconProps> = ({ size = 24, className = "", fill = "none", variant = 'static' }) => {
  const masterSharpCrescent = "M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10c2.3,0,4.4-0.8,6.1-2.1c-3.5-0.5-6.1-3.5-6.1-7.2s2.6-6.7,6.1-7.2C16.4,2.8,14.3,2,12,2z";
  const outsideStarPath = "M28,14 L29.2,11.2 L32,11.2 L29.7,9.4 L30.6,6.6 L28,8.3 L25.4,6.6 L26.3,9.4 L24,11.2 L26.8,11.2 Z";
  
  return (
    <svg 
      width={size * (40/24)} 
      height={size} 
      viewBox="0 0 40 24" 
      fill={fill} 
      className={className}
      style={{ overflow: 'visible' }}
    >
      <g transform="rotate(-45 12 12)">
        <path d={masterSharpCrescent} fill="currentColor" />
        <AnimateStar key={variant} variant={variant as LoadingVariant | 'static'} path={outsideStarPath} />
      </g>
    </svg>
  );
};

const AnimateStar: React.FC<{ variant: LoadingVariant | 'static', path: string }> = ({ variant, path }) => {
  const starCenter = { x: "28px", y: "10.5px" };

  if (variant === 'continuous') {
    return (
      <motion.path
        d={path}
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 1], 
          opacity: 1,
          rotate: [0, 0, 360] 
        }}
        transition={{ 
          scale: { duration: 0.8, ease: "easeOut" },
          opacity: { duration: 0.5 },
          rotate: { 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear",
            delay: 0.8
          }
        }}
        style={{ originX: starCenter.x, originY: starCenter.y }}
      />
    );
  }

  if (variant === 'default') {
    return (
      <motion.path
        d={path}
        fill="currentColor"
        initial={{ rotate: 0 }}
        animate={{ 
          rotate: [0, 360] 
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
    );
  }

  return (
    <motion.path 
      d={path} 
      fill="currentColor" 
      animate={{ scale: [1, 1.1, 1] }} 
      transition={{ duration: 2, repeat: Infinity }}
      style={{ originX: starCenter.x, originY: starCenter.y }}
    />
  );
};

export const LoadingLogo: React.FC<IconProps> = ({ size = 120, className = "", variant = 'default' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
      >
        <CrescentStarIcon 
          size={size * 2} 
          fill="currentColor" 
          className="text-[#10b981] drop-shadow-[0_0_60px_rgba(16,185,129,0.4)]" 
          variant={variant} 
        />
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-20 text-emerald-500 font-black tracking-[0.5em] text-sm uppercase"
      >
        Loading Aqim
      </motion.p>
    </div>
  );
};
