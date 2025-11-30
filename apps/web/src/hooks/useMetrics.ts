import { useCallback } from 'react';

type EventName = 
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'quest_start'
  | 'quest_complete'
  | 'item_purchase'
  | 'level_up'
  | 'feature_usage'
  | 'emptystate_cta_click'
  | 'earn_gold_cta_click'
  | 'microflow_preview_open'
  | 'disabled_cta_interact';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export const useMetrics = () => {
  const track = useCallback((eventName: EventName, properties?: EventProperties) => {
    // In a real app, this would send data to Segment, Mixpanel, or Google Analytics
    console.log(`[Metrics] ${eventName}`, properties);
    
    // Mock sending to backend
    // fetch('/api/metrics', { method: 'POST', body: JSON.stringify({ event: eventName, ...properties }) });
  }, []);

  const identify = useCallback((userId: string, traits?: EventProperties) => {
    console.log(`[Metrics] Identify ${userId}`, traits);
  }, []);

  return { track, identify };
};
