import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface StatRadarProps {
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    perception: number;
  };
}

const StatRadar: React.FC<StatRadarProps> = ({ stats }) => {
  const data = [
    { subject: 'STR', A: stats.strength, fullMark: 100 },
    { subject: 'AGI', A: stats.agility, fullMark: 100 },
    { subject: 'INT', A: stats.intelligence, fullMark: 100 },
    { subject: 'VIT', A: stats.vitality, fullMark: 100 },
    { subject: 'PER', A: stats.perception, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px] bg-slate-900/50 rounded-lg border border-blue-500/20 relative">
      <h3 className="absolute top-2 left-4 text-blue-400 font-bold text-sm tracking-widest">STATS</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Radar
            name="Player"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatRadar;
