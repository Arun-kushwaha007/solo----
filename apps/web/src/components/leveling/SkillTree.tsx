import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSkills, unlockSkill } from '../../services/leveling';
import { Lock, Unlock } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  cost: number;
  icon: string;
}

const SkillTree: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  // Mock unlocked skills for now, real impl would fetch from profile
  const [unlocked, setUnlocked] = useState<string[]>([]); 

  useEffect(() => {
    getSkills().then(res => setSkills(res.data));
  }, []);

  const handleUnlock = async (skillId: string) => {
    try {
      await unlockSkill(skillId);
      setUnlocked([...unlocked, skillId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Skill Tree</h2>
      
      {skills.length === 0 && (
        <p className="text-slate-400">No skills available yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map(skill => {
          const isUnlocked = unlocked.includes(skill.id);
          return (
            <motion.div
              key={skill.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded border ${isUnlocked ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-slate-700'} transition-colors`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{skill.name}</h3>
                {isUnlocked ? <Unlock size={16} className="text-blue-400" /> : <Lock size={16} className="text-slate-500" />}
              </div>
              <p className="text-sm text-slate-400 mb-3">{skill.description}</p>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Lvl Req: {skill.requiredLevel}</span>
                <button
                  onClick={() => handleUnlock(skill.id)}
                  disabled={isUnlocked}
                  className={`px-3 py-1 rounded ${isUnlocked ? 'bg-green-600/20 text-green-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {isUnlocked ? 'Learned' : `Unlock (${skill.cost} SP)`}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillTree;
