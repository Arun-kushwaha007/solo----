import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getQuests, acceptQuest, completeQuest } from '../../services/quests';
import { CheckCircle, Circle, Play } from 'lucide-react';

interface Quest {
  _id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  rewards: { xp: number; gold: number };
  userStatus: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

const QuestList: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);

  const fetchQuests = () => {
    getQuests().then(res => setQuests(res.data));
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await acceptQuest(id);
      fetchQuests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeQuest(id);
      fetchQuests();
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'E': return 'text-slate-400';
      case 'D': return 'text-green-400';
      case 'C': return 'text-blue-400';
      case 'B': return 'text-purple-400';
      case 'A': return 'text-red-400';
      case 'S': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Quest Log</h2>
      
      <div className="space-y-4">
        {quests.map(quest => (
          <motion.div
            key={quest._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded border ${
              quest.userStatus === 'COMPLETED' ? 'bg-slate-800/50 border-slate-800 opacity-60' : 
              quest.userStatus === 'ACTIVE' ? 'bg-blue-900/20 border-blue-500' : 
              'bg-slate-800 border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold text-xs px-2 py-0.5 rounded bg-slate-700 ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}-Rank
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{quest.type}</span>
                </div>
                <h3 className="font-bold text-white text-lg">{quest.title}</h3>
                <p className="text-slate-400 text-sm mb-2">{quest.description}</p>
                <div className="text-xs text-yellow-500">
                  Rewards: {quest.rewards.xp} XP {quest.rewards.gold > 0 && `| ${quest.rewards.gold} Gold`}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {quest.userStatus === 'AVAILABLE' && (
                  <button
                    onClick={() => handleAccept(quest._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold"
                  >
                    <Play size={16} /> Accept
                  </button>
                )}
                {quest.userStatus === 'ACTIVE' && (
                  <button
                    onClick={() => handleComplete(quest._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold"
                  >
                    <Circle size={16} /> Complete
                  </button>
                )}
                {quest.userStatus === 'COMPLETED' && (
                  <span className="flex items-center gap-2 text-green-500 font-bold text-sm">
                    <CheckCircle size={16} /> Done
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuestList;
