import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalyticsDashboard } from '../../services/analytics';
import { TrendingUp, Target } from 'lucide-react';

const AnalyticsChart: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAnalyticsDashboard().then(res => setData(res.data));
  }, []);

  if (!data) return <div className="text-slate-400">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 p-6 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-green-400" size={24} />
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Adherence Rate</h3>
          </div>
          <p className="text-4xl font-bold text-white">{data.adherence}%</p>
          <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-400" size={24} />
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Projected Level</h3>
          </div>
          <p className="text-4xl font-bold text-white">Lvl {data.trajectory[11].level}</p>
          <p className="text-xs text-slate-500 mt-1">In 12 weeks</p>
        </div>
      </div>

      {/* XP Trend Chart */}
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
        <h3 className="text-white font-bold mb-4">XP Trend (7 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.xpTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trajectory Projection */}
      <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
        <h3 className="text-white font-bold mb-4">12-Week Projection</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.trajectory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Week', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Level', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="level" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default AnalyticsChart;
