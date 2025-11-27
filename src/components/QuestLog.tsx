import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Gift } from 'lucide-react';
import clsx from 'clsx';
import { useGame } from '../context/GameContext';

export const QuestLog: React.FC = () => {
  const { quests, updateTaskProgress, completeQuest } = useGame();

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-system-blue/30 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-widest">QUEST LOG</h2>
        <span className="text-system-blue text-sm font-mono">ACTIVE: {quests.filter(q => !q.completed).length}</span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2">
        {quests.map((quest) => (
          <motion.div 
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "bg-system-blue/5 border p-4 rounded-lg relative overflow-hidden group transition-colors",
              quest.completed ? "border-system-blue/50 opacity-60" : "border-system-blue/30 hover:bg-system-blue/10"
            )}
          >
            {/* Quest Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={clsx(
                  "text-xs font-bold px-2 py-0.5 rounded border mb-2 inline-block",
                  quest.completed ? "text-gray-400 border-gray-600 bg-gray-800/50" : "text-system-red bg-system-red/10 border-system-red/30"
                )}>
                  DIFFICULTY: {quest.difficulty}
                </span>
                <h3 className="text-xl font-bold text-white mb-1">{quest.title}</h3>
                <p className="text-gray-400 text-sm">{quest.description}</p>
              </div>
              {quest.completed ? (
                <CheckCircle className="text-system-blue" />
              ) : (
                <AlertTriangle className="text-system-red animate-pulse" />
              )}
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {quest.tasks.map((task) => {
                const progress = Math.min((task.current / task.target) * 100, 100);
                const isDone = task.current >= task.target;

                return (
                  <div 
                    key={task.id} 
                    className={clsx("space-y-1", !quest.completed && "cursor-pointer hover:opacity-80")}
                    onClick={() => !quest.completed && updateTaskProgress(quest.id, task.id, 1)}
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex justify-between text-sm">
                      <span className={clsx("font-mono", isDone ? "text-gray-500 line-through" : "text-white")}>
                        {task.label}
                      </span>
                      <span className={clsx("font-mono", isDone ? "text-system-blue" : "text-gray-400")}>
                        {task.current} / {task.target} {task.unit || ''}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={clsx(
                          "h-full shadow-[0_0_10px_currentColor]",
                          isDone ? "bg-system-blue text-system-blue" : "bg-system-red text-system-red"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reward Button */}
            {!quest.completed && quest.tasks.every(t => t.current >= t.target) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => completeQuest(quest.id)}
                className="mt-4 w-full py-2 bg-system-blue text-black font-bold rounded shadow-glow-blue flex items-center justify-center gap-2 hover:bg-white transition-colors"
                data-testid="claim-reward-btn"
              >
                <Gift size={18} />
                CLAIM REWARD
              </motion.button>
            )}

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-system-blue/10 to-transparent pointer-events-none"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
