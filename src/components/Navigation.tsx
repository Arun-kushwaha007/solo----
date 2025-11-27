import React from 'react';
import { User, Scroll, Box, Backpack } from 'lucide-react';
import clsx from 'clsx';

interface NavigationProps {
  activeTab: 'status' | 'quests' | 'inventory';
  onTabChange: (tab: 'status' | 'quests' | 'inventory') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="hidden md:flex flex-col gap-2 p-4">
      <button
        onClick={() => onTabChange('status')}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded transition-all duration-300",
          activeTab === 'status'
            ? "bg-system-blue/20 border border-system-blue text-system-blue shadow-glow-blue"
            : "bg-black/50 border border-transparent text-gray-500 hover:text-system-blue/70 hover:bg-system-blue/10"
        )}
        data-testid="nav-status"
      >
        <User size={20} />
        <span className="font-bold tracking-wider text-sm">STATUS</span>
      </button>
      <button
        onClick={() => onTabChange('quests')}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded transition-all duration-300",
          activeTab === 'quests'
            ? "bg-system-blue/20 border border-system-blue text-system-blue shadow-glow-blue"
            : "bg-black/50 border border-transparent text-gray-500 hover:text-system-blue/70 hover:bg-system-blue/10"
        )}
        data-testid="nav-quests"
      >
        <Scroll size={20} />
        <span className="font-bold tracking-wider text-sm">QUESTS</span>
      </button>
      <button
        onClick={() => onTabChange('inventory')}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded transition-all duration-300",
          activeTab === 'inventory'
            ? "bg-system-blue/20 border border-system-blue text-system-blue shadow-glow-blue"
            : "bg-black/50 border border-transparent text-gray-500 hover:text-system-blue/70 hover:bg-system-blue/10"
        )}
        data-testid="nav-inventory"
      >
        <Box size={20} />
        <span className="font-bold tracking-wider text-sm">INVENTORY</span>
      </button>
    </nav>
  );
};

// Mobile Navigation
export const MobileNavigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-system-blue p-2 flex justify-around z-50">
      <button 
        onClick={() => onTabChange('status')}
        className={clsx("p-2 rounded", activeTab === 'status' ? "text-system-blue" : "text-gray-500")}
        data-testid="mobile-nav-status"
      >
        <User size={24} />
      </button>
      <button 
        onClick={() => onTabChange('quests')}
        className={clsx("p-2 rounded", activeTab === 'quests' ? "text-system-blue" : "text-gray-500")}
        data-testid="mobile-nav-quests"
      >
        <Scroll size={24} />
      </button>
      <button 
        onClick={() => onTabChange('inventory')}
        className={clsx("p-2 rounded", activeTab === 'inventory' ? "text-system-blue" : "text-gray-500")}
        data-testid="mobile-nav-inventory"
      >
        <Backpack size={24} />
      </button>
    </div>
  );
};
