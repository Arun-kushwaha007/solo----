import React from 'react';
import { motion } from 'framer-motion';
import { User, Scroll, Backpack, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

interface NavigationProps {
  activeTab: 'status' | 'quests' | 'inventory' | 'dashboard';
  onTabChange: (tab: 'status' | 'quests' | 'inventory' | 'dashboard') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'status', label: 'STATUS', icon: User },
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'quests', label: 'QUESTS', icon: Scroll },
    { id: 'inventory', label: 'INVENTORY', icon: Backpack },
  ] as const;

  return (
    <nav className="hidden md:flex flex-col gap-2 p-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded transition-all duration-300",
              isActive
                ? "bg-system-blue/20 border border-system-blue text-system-blue shadow-glow-blue"
                : "bg-black/50 border border-transparent text-gray-500 hover:text-system-blue/70 hover:bg-system-blue/10"
            )}
            data-testid={`nav-${tab.id}`}
          >
            <Icon size={20} />
            <span className="font-bold tracking-wider text-sm">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const MobileNavigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'status', icon: User, label: 'Status' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'quests', icon: Scroll, label: 'Quests' },
    { id: 'inventory', icon: Backpack, label: 'Items' },
  ] as const;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-system-blue p-2 flex justify-around z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              "p-2 rounded flex flex-col items-center gap-1", 
              isActive ? "text-system-blue" : "text-gray-500"
            )}
            data-testid={`mobile-nav-${tab.id}`}
          >
            <Icon size={24} />
            <span className="text-[10px] font-mono">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
