import React from 'react';
import { motion } from 'framer-motion';
import { User, Scroll, Backpack, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useGame } from '../context/GameContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: 'status' | 'quests' | 'inventory' | 'dashboard';
  onTabChange: (tab: 'status' | 'quests' | 'inventory' | 'dashboard') => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { player, logout } = useGame();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'status', label: 'PROFILE', icon: User },
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'quests', label: 'QUESTS', icon: Scroll },
    { id: 'inventory', label: 'INVENTORY', icon: Backpack },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-black/50 backdrop-blur-xl h-screen sticky top-0 z-50">
        <div className="p-8 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            SOLO<span className="text-system-blue">LEVELING</span>
          </h1>
          <div className="text-xs text-gray-500 font-mono mt-1">HUNTER SYSTEM v2.0</div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-system-blue text-black font-bold shadow-lg shadow-system-blue/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={20} className={clsx(isActive ? "text-black" : "text-gray-500 group-hover:text-white")} />
                <span className="tracking-wide text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-system-blue to-purple-600 flex items-center justify-center text-xs font-bold">
              {player?.name?.charAt(0) || 'H'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">{player?.name}</div>
              <div className="text-xs text-gray-500 truncate">{player?.title}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50 flex items-center justify-between px-4">
        <div className="font-bold text-lg">SOLO<span className="text-system-blue">LEVELING</span></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden fixed inset-0 top-16 bg-black z-40 p-4 flex flex-col gap-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={clsx(
                  "flex items-center gap-4 px-4 py-4 rounded-xl transition-all",
                  isActive ? "bg-system-blue text-black font-bold" : "text-gray-400 hover:bg-white/5"
                )}
              >
                <Icon size={24} />
                <span className="text-lg">{tab.label}</span>
              </button>
            );
          })}
          <div className="mt-auto border-t border-gray-800 pt-4">
             <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-500/10 rounded-lg"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-hidden relative pt-16 md:pt-0">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-system-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10 h-full p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
