// apps/web/src/components/ui/StatRadar.tsx
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface StatRadarProps {
  stats: {
    strength: number;
    endurance: number;
    focus: number;
    resilience: number;
    social: number;
  };
}

export const StatRadar: React.FC<StatRadarProps> = ({ stats }) => {
  const safeStats = stats || {
    strength: 0,
    endurance: 0,
    focus: 0,
    resilience: 0,
    social: 0
  };

  const data = [
    { subject: 'STR', A: safeStats.strength, fullMark: 100 },
    { subject: 'END', A: safeStats.endurance, fullMark: 100 },
    { subject: 'FOC', A: safeStats.focus, fullMark: 100 },
    { subject: 'RES', A: safeStats.resilience, fullMark: 100 },
    { subject: 'SOC', A: safeStats.social, fullMark: 100 },
  ];

  return (
    <div className="relative w-full h-64 md:h-80" role="img" aria-label="Radar chart showing player statistics">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#404040" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
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

      {/* Accessible fallback for screen readers */}
      <div className="sr-only">
        <table>
          <caption>Player Statistics</caption>
          <thead>
            <tr>
              <th scope="col">Stat</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Strength</td><td>{safeStats.strength}</td></tr>
            <tr><td>Endurance</td><td>{safeStats.endurance}</td></tr>
            <tr><td>Focus</td><td>{safeStats.focus}</td></tr>
            <tr><td>Resilience</td><td>{safeStats.resilience}</td></tr>
            <tr><td>Social</td><td>{safeStats.social}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
