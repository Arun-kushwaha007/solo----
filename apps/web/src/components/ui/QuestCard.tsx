import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Gift } from 'lucide-react';
import clsx from 'clsx';
import { CATEGORY_INFO, Quest } from '../../types';

interface QuestCardProps {
  quest: Quest;
  onTaskClick: (questId: number, taskId: string, taskLabel: string, current: number, target: number) => void;
  onComplete: (questId: number, questTitle: string, xpReward: number, goldReward: number) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onTaskClick, onComplete }) => {
  const categoryInfo = CATEGORY_INFO[quest.category];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "bg-system-blue/5 border p-3 sm:p-4 rounded-lg relative overflow-hidden group transition-colors",
        quest.completed ? "border-system-blue/50 opacity-60" : "border-system-blue/30 hover:bg-system-blue/10"
      )}
    >
      {/* Quest Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Category Badge */}
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1"
              style={{
                backgroundColor: `${categoryInfo.color}20`,
                borderColor: `${categoryInfo.color}60`,
                color: categoryInfo.color
              }}
            >
              <span>{categoryInfo.icon}</span>
              <span className="hidden sm:inline">{categoryInfo.name}</span>
            </span>
            
            {/* Difficulty Badge */}
            <span className={clsx(
              "text-xs font-bold px-2 py-0.5 rounded border",
              quest.completed ? "text-gray-400 border-gray-600 bg-gray-800/50" : "text-system-red bg-system-red/10 border-system-red/30"
            )}>
              {quest.difficulty}
            </span>
          </div>
          
          <h3 className="text-base sm:text-xl font-bold text-white mb-1 truncate">{quest.title}</h3>
          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{quest.description}</p>
        </div>
        
        <div className="flex-shrink-0">
          {quest.completed ? (
            <CheckCircle className="text-system-blue" size={20} />
          ) : (
            <AlertTriangle className="text-system-red animate-pulse" size={20} />
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2 sm:space-y-3">
        {quest.tasks.map((task) => {
          const progress = Math.min((task.current / task.target) * 100, 100);
          const isDone = task.current >= task.target;

          return (
            <div 
              key={task.id} 
              className={clsx("space-y-1", !quest.completed && "cursor-pointer hover:opacity-80 active:opacity-60")}
              onClick={() => !quest.completed && onTaskClick(quest.id, task.id, task.label, task.current, task.target)}
              data-testid={`task-${task.id}`}
            >
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className={clsx("font-mono truncate", isDone ? "text-gray-500 line-through" : "text-white")}>
                  {task.label}
                </span>
                <span className={clsx("font-mono flex-shrink-0", isDone ? "text-system-blue" : "text-gray-400")}>
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
          onClick={() => onComplete(quest.id, quest.title, quest.rewards.xp, quest.rewards.gold)}
          className="mt-3 sm:mt-4 w-full py-2 sm:py-3 bg-system-blue text-black font-bold rounded shadow-glow-blue flex items-center justify-center gap-2 hover:bg-white transition-colors text-sm sm:text-base"
          data-testid="claim-reward-btn"
        >
          <Gift size={18} />
          CLAIM REWARD
        </motion.button>
      )}

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-bl from-system-blue/10 to-transparent pointer-events-none"></div>
    </motion.div>
  );
};
