// apps/web/src/tests/unit/components.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardHero } from '../../components/dashboard/DashboardHero';
import { EmptyState } from '../../components/common/EmptyState';
import { SyncStatusChip } from '../../components/ui/SyncStatusChip';
import { StatRadar } from '../../components/ui/StatRadar';

describe('DashboardHero', () => {
  it('renders correctly and handles click', () => {
    const onStart = vi.fn();
    render(<DashboardHero onStartBaseline={onStart} />);

    expect(screen.getByText('Welcome, Hunter.')).toBeTruthy(); // Using truthy for basic check, better to use toBeVisible with matchers

    const button = screen.getByText('Initialize System');
    fireEvent.click(button);
    expect(onStart).toHaveBeenCalled();
  });

  it('renders V2 variant elements', () => {
    render(<DashboardHero onStartBaseline={() => {}} abVariant="hero_v2" />);
    expect(screen.getByText("Hunter's Guide")).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Go away"
        actionLabel="Leave"
        onAction={() => {}}
      />
    );
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Go away')).toBeTruthy();
  });
});

describe('SyncStatusChip', () => {
  it('shows syncing state', () => {
    render(<SyncStatusChip isSyncing={true} />);
    expect(screen.getByText('Syncing...')).toBeTruthy();
  });

  it('shows error state', () => {
    render(<SyncStatusChip hasError={true} />);
    expect(screen.getByText('Sync Failed')).toBeTruthy();
  });
});

describe('StatRadar', () => {
  it('renders without crashing when stats are missing', () => {
    // @ts-ignore - explicitly testing missing props if TS didn't catch it or runtime issue
    render(<StatRadar />);
    // Should render the accessible table with 0s
    expect(screen.getAllByText('0')).toHaveLength(5);
  });

  it('renders with provided stats', () => {
    const stats = {
      strength: 10,
      endurance: 20,
      focus: 30,
      resilience: 40,
      social: 50
    };
    render(<StatRadar stats={stats} />);
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });
});
