// apps/web/src/components/ui/SyncStatusChip.tsx
import React, { useState, useEffect } from 'react';

interface SyncStatusChipProps {
  lastSyncedAt?: Date;
  isSyncing?: boolean;
  hasError?: boolean;
}

export const SyncStatusChip: React.FC<SyncStatusChipProps> = ({ lastSyncedAt, isSyncing, hasError }) => {
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    if (!lastSyncedAt) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - lastSyncedAt.getTime()) / 60000);
      setTimeAgo(diff < 1 ? 'Just now' : `${diff}m ago`);
    }, 60000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  if (hasError) {
     return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/30 text-accent-500 text-xs font-mono">
           <span className="w-2 h-2 rounded-full bg-accent-500"></span>
           Sync Failed
        </div>
     );
  }

  if (isSyncing) {
      return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-mono">
               <svg className="animate-spin h-3 w-3 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Syncing...
          </div>
      );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/50 border border-neutral-800 text-neutral-500 text-xs font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
      Synced {timeAgo}
    </div>
  );
};
