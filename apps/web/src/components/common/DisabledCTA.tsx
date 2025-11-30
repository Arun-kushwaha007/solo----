import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useMetrics } from '../../hooks/useMetrics';

interface Requirement {
  type: 'gold' | 'level' | 'quest';
  amount: number;
}

interface MicroCTA {
  label: string;
  onClick: () => void;
}

interface DisabledCTAProps {
  reason: string;
  requirement: Requirement;
  microCTA: MicroCTA;
  children: React.ReactNode;
  helperContent?: React.ReactNode;
}

export const DisabledCTA: React.FC<DisabledCTAProps> = ({
  reason,
  requirement,
  microCTA,
  children,
  helperContent,
}) => {
  const [showHelper, setShowHelper] = useState(false);
  const { track } = useMetrics();

  const handleMicroCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    track('earn_gold_cta_click' as any, {
      requirement_type: requirement.type,
      requirement_amount: requirement.amount,
    });
    microCTA.onClick();
  };

  const handleInteract = () => {
    track('disabled_cta_interact' as any, {
      requirement_type: requirement.type,
    });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setShowHelper(true);
        handleInteract();
      }}
      onMouseLeave={() => setShowHelper(false)}
      onFocus={() => setShowHelper(true)}
      onBlur={() => setShowHelper(false)}
    >
      {/* Disabled Button (passed as children) */}
      <div aria-describedby="disabled-cta-reason">
        {children}
      </div>

      {/* Reason & Micro-CTA Overlay */}
      <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p id="disabled-cta-reason" className="text-xs text-red-300">
            {reason}
          </p>
        </div>

        {/* Inline Micro-CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMicroCTAClick}
          className="w-full py-2 px-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-sm font-bold rounded flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-yellow-500 transition-all"
        >
          <Sparkles size={14} />
          {microCTA.label}
        </motion.button>
      </div>

      {/* Helper Card Tooltip */}
      <AnimatePresence>
        {showHelper && helperContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-black/95 border border-gray-700 rounded-lg shadow-xl z-50 backdrop-blur-sm"
          >
            {helperContent}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
