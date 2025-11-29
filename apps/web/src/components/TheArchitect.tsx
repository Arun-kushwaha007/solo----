import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertTriangle, Zap, Activity } from 'lucide-react';

interface ArchitectProps {
  message: string;
  mood: 'NEUTRAL' | 'WARNING' | 'DANGER' | 'PRAISE';
}

export const TheArchitect: React.FC<ArchitectProps> = ({ message, mood }) => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedMessage('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedMessage(message.substring(0, i + 1));
      i++;
      if (i === message.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); // Typing speed

    return () => clearInterval(interval);
  }, [message]);

  const getMoodColor = () => {
    switch (mood) {
      case 'DANGER': return 'text-red-500 border-red-500/50 bg-red-900/10';
      case 'WARNING': return 'text-yellow-500 border-yellow-500/50 bg-yellow-900/10';
      case 'PRAISE': return 'text-green-500 border-green-500/50 bg-green-900/10';
      default: return 'text-system-blue border-system-blue/50 bg-system-blue/10';
    }
  };

  const getMoodIcon = () => {
    switch (mood) {
      case 'DANGER': return <AlertTriangle size={20} className="animate-pulse" />;
      case 'WARNING': return <Activity size={20} />;
      case 'PRAISE': return <Zap size={20} />;
      default: return <Terminal size={20} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full p-4 rounded-xl border ${getMoodColor()} relative overflow-hidden font-mono text-sm`}
    >
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]" />
      
      <div className="relative z-10 flex gap-4">
        <div className="flex-shrink-0 mt-1">
          {getMoodIcon()}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold opacity-70 mb-1 flex justify-between">
            <span>SYSTEM_ARCHITECT // v2.4.0</span>
            <span className={isTyping ? "animate-pulse" : ""}>{isTyping ? "TRANSMITTING..." : "CONNECTED"}</span>
          </div>
          <div className="leading-relaxed">
            {displayedMessage}
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
