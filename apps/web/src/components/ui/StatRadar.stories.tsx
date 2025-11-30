// apps/web/src/components/ui/StatRadar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatRadar } from './StatRadar';

const meta: Meta<typeof StatRadar> = {
  title: 'UI/StatRadar',
  component: StatRadar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatRadar>;

export const Default: Story = {
  args: {
    stats: {
      strength: 65,
      endurance: 40,
      focus: 80,
      resilience: 55,
      social: 30,
    },
  },
};
