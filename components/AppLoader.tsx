
import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Star } from 'lucide-react';

interface AppLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isDark?: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({ size = 'md', className = '', isDark = false }) => {
  const settings = {
    sm: { size: 24, star: 8, orbit: 14 },
    md: { size: 48, star: 14, orbit: 28 },
    lg: { size: 96, star: 28, orbit: 50 }
  };

  const current = settings[size];

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: current.size, height: current.size }}>
      {/* Outer Border/Orbit Path */}
      <div 
        className="absolute inset-0 rounded-full border border-emerald-500/10"
        style={{ padding: size === 'lg' ? '4px' : '2px' }}
      >
        <div className="w-full h-full rounded-full border border-emerald-500/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]" />
      </div>

      {/* The Crescent */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Moon 
          size={current.size * 0.6} 
          className="text-emerald-500 transform -rotate-12"
          fill="currentColor"
          fillOpacity={0.2}
          strokeWidth={2.5}
        />
      </div>
      
      {/* The Rotating Star Container */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* The Star orbiting */}
        <div 
          className="absolute"
          style={{ transform: `translateY(-${current.orbit}px)` }}
        >
          <Star 
            size={current.star} 
            className="text-amber-400"
            fill="currentColor"
            strokeWidth={2.5}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AppLoader;
