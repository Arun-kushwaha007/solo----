import React from 'react';
import { RefreshCw } from 'lucide-react';

interface SyncChipProps {
  status: 'syncing' | 'live' | 'offline';
}

export const SyncChip: React.FC<SyncChipProps> = ({ status }) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-black/50 border border-gray-800 rounded-full text-[10px] font-mono uppercase tracking-wider">
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'live' ? 'bg-green-500 animate-pulse' : status === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      <span className="text-gray-400">
        {status === 'live' ? 'System Live' : status === 'syncing' ? 'Syncing...' : 'Offline'}
      </span>
      {status === 'syncing' && <RefreshCw size={10} className="animate-spin text-gray-500" />}
    </div>
  );
};
