import React, { useState } from 'react';
import { Zap, Target, Play } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { celebrateQuestCompletion } from '../utils/celebrations';
import { showQuestCompleteToast, showTaskUpdateToast } from '../components/ToastProvider';
import { useNavigate } from 'react-router-dom';
import { QuestCard } from './ui/QuestCard';
import { MicroflowCard } from './common/MicroflowCard';
import { QuestPreviewModal } from './modals/QuestPreviewModal';

export const QuestLog: React.FC = () => {
  const { quests, updateTaskProgress, completeQuest } = useGame();
  const navigate = useNavigate();
  const [showQuestPreview, setShowQuestPreview] = useState(false);

  const handleTaskClick = async (questId: number, taskId: string, taskLabel: string, current: number, target: number) => {
    await updateTaskProgress(questId, taskId, 1);
    showTaskUpdateToast(taskLabel, current + 1, target);
  };

  const handleQuestComplete = async (questId: number, questTitle: string, xpReward: number, goldReward: number) => {
    const result = await completeQuest(questId);
    celebrateQuestCompletion();
    showQuestCompleteToast(questTitle, xpReward, goldReward);
    
    if (result.leveledUp) {
      // Level up celebration will be handled in GameContext
    }
  };

  const handleMicroflowCTA = () => {
    setShowQuestPreview(true);
  };

  const handleStartBaseline = () => {
    setShowQuestPreview(false);
    navigate('/baseline');
  };

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-system-blue/30 pb-3 sm:pb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-widest">QUEST LOG</h2>
        <span className="text-system-blue text-xs sm:text-sm font-mono">ACTIVE: {quests.filter(q => !q.completed).length}</span>
      </div>

      <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2">
        {quests.length === 0 ? (
          <MicroflowCard
            headline="No quests yet. Get started in 90 seconds."
            steps={[
              { label: 'Take 1-min readiness test', icon: Zap },
              { label: 'Claim sample quest', icon: Target },
              { label: 'Do it now', icon: Play },
            ]}
            previewContent={
              <div className="text-left">
                <button
                  onClick={() => setShowQuestPreview(true)}
                  className="text-system-blue hover:underline text-sm font-medium"
                >
                  Preview quest →
                </button>
                <div className="mt-2 text-xs text-gray-500">
                  Sample rewards: 50 XP • 10 Gold
                </div>
              </div>
            }
            ctaLabel="Start Now"
            onCtaClick={handleMicroflowCTA}
            analyticsEvent="emptystate_cta_click"
            analyticsProperties={{ location: 'quest_log' }}
          />
        ) : (
          quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onTaskClick={handleTaskClick}
              onComplete={handleQuestComplete}
            />
          ))
        )}
      </div>

      {/* Quest Preview Modal */}
      <QuestPreviewModal
        isOpen={showQuestPreview}
        onClose={() => setShowQuestPreview(false)}
        onStartBaseline={handleStartBaseline}
      />
    </div>
  );
};
