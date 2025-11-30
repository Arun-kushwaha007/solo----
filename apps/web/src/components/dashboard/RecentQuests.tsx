import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Quest {
  _id: string;
  title: string;
  difficulty: string;
  xpReward: number;
}

interface UserQuest {
  _id: string;
  quest: Quest;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  completedAt?: string;
}

interface RecentQuestsProps {
  quests: UserQuest[];
}

const RecentQuests: React.FC<RecentQuestsProps> = ({ quests }) => {
  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 h-full">
      <h3 className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-wider">Recent Quests</h3>
      
      {quests.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No recent quest activity.</div>
      ) : (
        <div className="space-y-3">
          {quests.map((uq) => (
            <div key={uq._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700/50">
              <div className="flex items-center gap-3">
                {uq.status === 'COMPLETED' && <CheckCircle size={18} className="text-green-500" />}
                {uq.status === 'FAILED' && <XCircle size={18} className="text-red-500" />}
                {uq.status === 'PENDING' && <Clock size={18} className="text-yellow-500" />}
                
                <div>
                  <div className="font-medium text-slate-200">{uq.quest.title}</div>
                  <div className="text-xs text-slate-500 flex gap-2">
                    <span className={`
                      ${uq.quest.difficulty === 'E' ? 'text-slate-400' : ''}
                      ${uq.quest.difficulty === 'D' ? 'text-green-400' : ''}
                      ${uq.quest.difficulty === 'C' ? 'text-blue-400' : ''}
                      ${uq.quest.difficulty === 'B' ? 'text-yellow-400' : ''}
                      ${uq.quest.difficulty === 'A' ? 'text-orange-400' : ''}
                      ${uq.quest.difficulty === 'S' ? 'text-red-400' : ''}
                    `}>
                      Rank {uq.quest.difficulty}
                    </span>
                    <span>•</span>
                    <span className="text-blue-400">+{uq.quest.xpReward} XP</span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 font-mono">
                {uq.completedAt ? new Date(uq.completedAt).toLocaleDateString() : 'In Progress'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentQuests;
