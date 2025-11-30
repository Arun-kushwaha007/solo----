// apps/web/src/components/DemoPage.tsx
import React, { useState } from 'react';
import { DashboardHero } from './dashboard/DashboardHero';
import { BaselineModal } from './onboarding/BaselineModal';
import { StatRadar } from './ui/StatRadar';
import { SyncStatusChip } from './ui/SyncStatusChip';
import { EmptyState } from './common/EmptyState';
import { LevelUpModal } from './ui/LevelUpModal';

export const DemoPage = () => {
  const [showBaseline, setShowBaseline] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [variant, setVariant] = useState<'control' | 'hero_v2'>('control');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 space-y-12">
      <header className="flex justify-between items-center pb-8 border-b border-neutral-800">
        <h1 className="text-3xl font-bold text-white">UI Overhaul Demo</h1>
        <div className="flex gap-4 items-center">
          <select
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1"
            onChange={(e) => setVariant(e.target.value as any)}
            value={variant}
          >
            <option value="control">Hero Control</option>
            <option value="hero_v2">Hero V2</option>
          </select>
          <SyncStatusChip lastSyncedAt={new Date()} />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-primary-500">1. Dashboard Hero</h2>
        <DashboardHero
          onStartBaseline={() => setShowBaseline(true)}
          abVariant={variant}
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-500">2. Stats Visualization</h2>
          <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
            <StatRadar stats={{ strength: 65, endurance: 40, focus: 80, resilience: 55, social: 30 }} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-primary-500">3. Level Up Modal Trigger</h2>
          <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 flex items-center justify-center h-64">
            <button
              onClick={() => setShowLevelUp(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl shadow-glow-yellow"
            >
              Simulate Level Up
            </button>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-primary-500">4. Empty States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EmptyState
            title="Quest Log"
            description="No active quests."
            actionLabel="Find Quests"
            onAction={() => {}}
            variant="quest"
          />
          <EmptyState
            title="Inventory"
            description="Your bag is empty."
            actionLabel="Visit Shop"
            onAction={() => {}}
            variant="inventory"
          />
           <EmptyState
            title="Shop"
            description="Shop is closed."
            actionLabel="Come back later"
            onAction={() => {}}
            variant="shop"
          />
        </div>
      </section>

      <BaselineModal
        isOpen={showBaseline}
        onClose={() => setShowBaseline(false)}
        onComplete={() => alert('Baseline Completed!')}
      />

      <LevelUpModal
        isOpen={showLevelUp}
        level={10}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
};
