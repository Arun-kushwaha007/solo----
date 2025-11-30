// apps/web/src/hooks/useABTest.ts
import { useState, useEffect } from 'react';

export const useABTest = (experimentId: string) => {
  const [variant, setVariant] = useState<'control' | 'variant'>('control');

  useEffect(() => {
    // Check URL params
    const params = new URLSearchParams(window.location.search);
    const forcedVariant = params.get('ab');

    if (forcedVariant === experimentId) {
      setVariant('variant');
    } else if (forcedVariant === 'control') {
      setVariant('control');
    } else {
        // Random assignment for real users if no param
        // Storing in localStorage to persist across session
        const stored = localStorage.getItem(`ab_${experimentId}`);
        if (stored) {
            setVariant(stored as 'control' | 'variant');
        } else {
            const newVariant = Math.random() > 0.5 ? 'variant' : 'control';
            localStorage.setItem(`ab_${experimentId}`, newVariant);
            setVariant(newVariant);
        }
    }

    // Log exposure event
    if ((window as any).__apiAdapter) {
         (window as any).__apiAdapter.logEvent('ab_exposure', { experimentId, variant });
    }

  }, [experimentId]);

  return variant;
};
