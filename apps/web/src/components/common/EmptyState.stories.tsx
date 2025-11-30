// apps/web/src/components/common/EmptyState.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Common/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No Data Found',
    description: 'There is nothing here yet.',
    actionLabel: 'Refresh',
    onAction: () => alert('Action clicked'),
  },
};

export const QuestEmpty: Story = {
  args: {
    title: 'Quest Log Empty',
    description: 'You have no active quests. Check the Quest Board to accept new missions.',
    actionLabel: 'Find New Quests',
    variant: 'quest',
    icon: (
      <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    onAction: () => alert('Navigate to Quest Board'),
  },
};

export const InventoryEmpty: Story = {
  args: {
    title: 'Inventory Empty',
    description: 'Your bag is empty. Complete quests to earn items or visit the shop.',
    actionLabel: 'Go to Shop',
    variant: 'inventory',
    icon: (
       <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
       </svg>
    ),
     onAction: () => alert('Navigate to Shop'),
  },
};
