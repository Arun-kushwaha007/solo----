import React from 'react';
import { motion } from 'framer-motion';

interface SystemWindowProps {
  children: React.ReactNode;
  title?: string;
}

export const SystemWindow: React.FC<SystemWindowProps> = ({ children, title = "SYSTEM" }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2 sm:p-4 md:p-6 font-sans text-system-text overflow-hidden relative">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,10,10,1)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,1)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      
      {/* Main Window Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-7xl h-[95vh] sm:h-[90vh] md:h-[85vh] bg-system-panel border border-system-blue/30 rounded-lg shadow-glow-blue backdrop-blur-sm flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="h-10 sm:h-12 bg-system-blue/10 border-b border-system-blue/30 flex items-center justify-between px-3 sm:px-4 relative flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-system-blue rounded-full animate-pulse"></div>
            <span className="text-system-blue font-bold tracking-widest uppercase text-xs sm:text-sm">{title}</span>
          </div>
          <div className="hidden sm:flex gap-1">
             <div className="w-3 h-3 border border-system-blue/50"></div>
             <div className="w-3 h-3 border border-system-blue/50"></div>
          </div>
          
          {/* Decorative Corner Lines */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-system-blue"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-system-blue"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-system-blue"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-system-blue"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 relative">
          {children}
        </div>

        {/* Footer Status */}
        <div className="h-6 sm:h-8 bg-black/40 border-t border-system-blue/20 flex items-center justify-end px-3 sm:px-4 text-xs text-system-blue/60 flex-shrink-0">
          <span className="hidden sm:inline">CONNECTED</span>
          <span className="sm:hidden">●</span>
        </div>
      </motion.div>
    </div>
  );
};
