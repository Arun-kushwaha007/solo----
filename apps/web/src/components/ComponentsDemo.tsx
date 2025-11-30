import React from 'react';
import { StatRadar } from './ui/StatRadar';
import { QuestCard } from './ui/QuestCard';
import { SyncChip } from './ui/SyncChip';
import { EmptyState } from './common/EmptyState';
import { Tooltip } from './common/Tooltip';
import { Scroll, Box } from 'lucide-react';

export const ComponentsDemo: React.FC = () => {
  const mockRadarData = [
    { subject: 'Physical', A: 80, fullMark: 100 },
    { subject: 'Mental', A: 65, fullMark: 100 },
    { subject: 'Social', A: 40, fullMark: 100 },
    { subject: 'Financial', A: 90, fullMark: 100 },
    { subject: 'Spiritual', A: 50, fullMark: 100 },
    { subject: 'Professional', A: 70, fullMark: 100 },
  ];

  const mockQuest = {
    id: 1,
    category: 'physical' as any,
    title: 'Morning Workout',
    description: 'Complete 50 pushups and run 2km',
    difficulty: 'E-RANK',
    tasks: [
      { id: 't1', label: 'Pushups', current: 20, target: 50, unit: 'reps' },
      { id: 't2', label: 'Run', current: 2, target: 2, unit: 'km' },
    ],
    completed: false,
    rewards: { xp: 100, gold: 50 },
  };

  return (
    <div className="p-8 space-y-12 overflow-y-auto h-full">
      <h1 className="text-3xl font-bold text-white mb-8">Component Library</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-system-blue border-b border-gray-800 pb-2">Stat Radar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl h-[400px]">
            <StatRadar data={mockRadarData} />
          </div>
          <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl h-[400px]">
            <StatRadar 
              data={mockRadarData} 
              entropy={{ social: { isDecaying: true } }} 
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-system-blue border-b border-gray-800 pb-2">Quest Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuestCard 
            quest={mockQuest} 
            onTaskClick={() => {}} 
            onComplete={() => {}} 
          />
          <QuestCard 
            quest={{ ...mockQuest, completed: true }} 
            onTaskClick={() => {}} 
            onComplete={() => {}} 
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-system-blue border-b border-gray-800 pb-2">Sync Chip</h2>
        <div className="flex gap-4">
          <SyncChip status="live" />
          <SyncChip status="syncing" />
          <SyncChip status="offline" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-system-blue border-b border-gray-800 pb-2">Empty State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EmptyState 
            icon={Scroll} 
            title="No Quests" 
            description="You have cleared all quests." 
            actionLabel="Refresh"
            onAction={() => {}}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-system-blue border-b border-gray-800 pb-2">Tooltip</h2>
        <div className="flex gap-4">
          <Tooltip content="This action is disabled" disabled={true}>
            <button className="px-4 py-2 bg-gray-800 text-gray-500 rounded cursor-not-allowed">
              Disabled Button
            </button>
          </Tooltip>
          <Tooltip content="This won't show" disabled={false}>
            <button className="px-4 py-2 bg-system-blue text-white rounded">
              Enabled Button
            </button>
          </Tooltip>
        </div>
      </section>
    </div>
  );
};
