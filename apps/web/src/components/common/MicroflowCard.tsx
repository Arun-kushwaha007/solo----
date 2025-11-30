import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMetrics } from '../../hooks/useMetrics';

interface MicroflowStep {
  label: string;
  icon: LucideIcon;
}

interface MicroflowCardProps {
  headline: string;
  steps: MicroflowStep[];
  previewContent?: React.ReactNode;
  ctaLabel: string;
  onCtaClick: () => void;
  analyticsEvent: string;
  analyticsProperties?: Record<string, any>;
}

export const MicroflowCard: React.FC<MicroflowCardProps> = ({
  headline,
  steps,
  previewContent,
  ctaLabel,
  onCtaClick,
  analyticsEvent,
  analyticsProperties = {},
}) => {
  const { track } = useMetrics();

  const handleClick = () => {
    track(analyticsEvent as any, analyticsProperties);
    onCtaClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-system-blue/10 via-black/40 to-purple-900/10 border border-system-blue/30 rounded-2xl p-8 text-center"
      role="status"
      aria-live="polite"
    >
      {/* Headline */}
      <h3 className="text-2xl font-bold text-white mb-6">{headline}</h3>

      {/* 3-Step Microflow */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-system-blue/20 border border-system-blue/50 flex items-center justify-center">
                  <Icon size={20} className="text-system-blue" />
                </div>
                <span className="text-xs text-gray-400 max-w-[80px] text-center">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight size={20} className="text-gray-600 mt-[-20px]" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Preview Content */}
      {previewContent && (
        <div className="mb-6 p-4 bg-black/40 border border-gray-800 rounded-lg">
          {previewContent}
        </div>
      )}

      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="px-8 py-3 bg-system-blue text-black font-bold rounded-lg shadow-glow-blue hover:bg-white transition-colors"
      >
        {ctaLabel}
      </motion.button>
    </motion.div>
  );
};
