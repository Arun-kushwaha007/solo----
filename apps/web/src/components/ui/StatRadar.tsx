import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { Target, AlertTriangle } from 'lucide-react';

interface StatRadarProps {
  data: any[];
  entropy?: Record<string, { isDecaying: boolean }>;
}

export const StatRadar: React.FC<StatRadarProps> = ({ data, entropy }) => {
  return (
    <div className="flex-1 min-h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={({ payload, x, y, textAnchor, stroke, radius }) => {
              // Check if this category has entropy
              const catName = payload.value.toLowerCase();
              const hasEntropy = entropy?.[catName]?.isDecaying;
              
              return (
                <g className="recharts-layer recharts-polar-angle-axis-tick">
                  <text
                    radius={radius}
                    stroke={stroke}
                    x={x}
                    y={y}
                    className="recharts-text recharts-polar-angle-axis-tick-value"
                    textAnchor={textAnchor}
                    fill={hasEntropy ? "#ef4444" : "#6b7280"}
                    fontSize={10}
                    fontWeight={hasEntropy ? 700 : 500}
                  >
                    {payload.value} {hasEntropy ? "⚠️" : ""}
                  </text>
                </g>
              );
            }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Balance"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
      {/* Center Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-system-blue/20 pointer-events-none">
        <Target size={40} />
      </div>
    </div>
  );
};
