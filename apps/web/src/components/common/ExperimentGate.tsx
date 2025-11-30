import React, { useEffect, useState } from 'react';
import { useMetrics } from '../../hooks/useMetrics';

interface ExperimentGateProps {
  experimentId: string;
  variant: 'A' | 'B'; // For simplicity, just A/B. Could be extended.
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Mock experiment assignment service
const getExperimentVariant = (experimentId: string): 'A' | 'B' => {
  // Deterministic assignment based on user ID or random for now
  // In real app, use a proper feature flag service (LaunchDarkly, Statsig, etc.)
  const stored = localStorage.getItem(`exp_${experimentId}`);
  if (stored) return stored as 'A' | 'B';
  
  const variant = Math.random() > 0.5 ? 'A' : 'B';
  localStorage.setItem(`exp_${experimentId}`, variant);
  return variant;
};

export const ExperimentGate: React.FC<ExperimentGateProps> = ({ 
  experimentId, 
  variant, 
  children, 
  fallback = null 
}) => {
  const [assignedVariant, setAssignedVariant] = useState<'A' | 'B' | null>(null);
  const { track } = useMetrics();

  useEffect(() => {
    const v = getExperimentVariant(experimentId);
    setAssignedVariant(v);
    track('feature_usage', { experimentId, variant: v });
  }, [experimentId, track]);

  if (!assignedVariant) return null; // Or loading state

  if (assignedVariant === variant) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
