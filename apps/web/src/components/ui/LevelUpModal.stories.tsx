// apps/web/src/components/ui/LevelUpModal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LevelUpModal } from './LevelUpModal';

const meta: Meta<typeof LevelUpModal> = {
  title: 'UI/LevelUpModal',
  component: LevelUpModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LevelUpModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    level: 5,
    onClose: () => alert('Closed'),
  },
};
