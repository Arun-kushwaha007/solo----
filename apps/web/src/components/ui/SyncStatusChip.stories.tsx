// apps/web/src/components/ui/SyncStatusChip.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { SyncStatusChip } from './SyncStatusChip';

const meta: Meta<typeof SyncStatusChip> = {
  title: 'UI/SyncStatusChip',
  component: SyncStatusChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SyncStatusChip>;

export const Synced: Story = {
  args: {
    lastSyncedAt: new Date(),
    isSyncing: false,
  },
};

export const Syncing: Story = {
  args: {
    isSyncing: true,
  },
};

export const Error: Story = {
  args: {
    hasError: true,
  },
};
