import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, TrendingUp, Award, Zap } from 'lucide-react';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0A0A0A',
            color: '#fff',
            border: '1px solid #00A3FF',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0, 163, 255, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#00A3FF',
              secondary: '#0A0A0A',
            },
          },
        }}
      />
    </>
  );
};

export const showQuestCompleteToast = (questTitle: string, xpGained: number, goldGained: number) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-black border-2 border-system-blue rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 shadow-glow-blue`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircle className="h-10 w-10 text-system-blue" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-white">Quest Complete!</p>
            <p className="mt-1 text-xs text-gray-400">{questTitle}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <span className="text-system-blue font-mono">+{xpGained} XP</span>
              <span className="text-yellow-500 font-mono">+{goldGained} GOLD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 4000 });
};

export const showLevelUpToast = (category: string, newLevel: number) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-purple-900 to-blue-900 border-2 border-yellow-400 rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 shadow-[0_0_30px_rgba(234,179,8,0.5)]`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Award className="h-10 w-10 text-yellow-400 animate-pulse" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-yellow-400">LEVEL UP!</p>
            <p className="mt-1 text-xs text-white">{category} reached Level {newLevel}</p>
            <p className="mt-1 text-xs text-gray-300">+3 Stat Points Available</p>
          </div>
        </div>
      </div>
    </div>
  ), { duration: 5000 });
};

export const showStatIncreaseToast = (statName: string) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-black border border-system-blue rounded-lg pointer-events-auto flex shadow-glow-blue`}
    >
      <div className="flex-1 w-0 p-3">
        <div className="flex items-center">
          <TrendingUp className="h-6 w-6 text-system-blue" />
          <p className="ml-3 text-sm font-mono text-white">{statName} +1</p>
        </div>
      </div>
    </div>
  ), { duration: 2000 });
};

export const showTaskUpdateToast = (taskLabel: string, current: number, target: number) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-black/90 border border-gray-700 rounded-lg pointer-events-auto flex`}
    >
      <div className="flex-1 w-0 p-3">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-system-blue" />
          <p className="ml-3 text-xs font-mono text-gray-300">
            {taskLabel}: {current}/{target}
          </p>
        </div>
      </div>
    </div>
  ), { duration: 1500 });
};
