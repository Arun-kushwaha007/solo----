import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { LevelUpModal } from './components/LevelUpModal';
import { ToastProvider, showLevelUpToast } from './components/ToastProvider';
import { celebrateLevelUp } from './utils/celebrations';
import authService from './services/auth.service';
import { CATEGORY_INFO } from './types';

import { Dashboard } from './components/Dashboard';
import { MainLayout } from './components/MainLayout';
import { StatusScreen } from './components/StatusScreen';
import { QuestLog } from './components/QuestLog';
import { Inventory } from './components/Inventory';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';

const GameContent = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'quests' | 'inventory' | 'dashboard'>('status');
  const { player, loading } = useGame();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevCategoryLevelsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (player) {
      // Check each category for level ups
      player.selectedCategories.forEach(cat => {
        const currentLevel = player.categories[cat].level;
        const prevLevel = prevCategoryLevelsRef.current[cat] || 1;
        
        if (currentLevel > prevLevel) {
          celebrateLevelUp();
          showLevelUpToast(CATEGORY_INFO[cat].name, currentLevel);
          setShowLevelUp(true);
          prevCategoryLevelsRef.current[cat] = currentLevel;
        }
      });
      
      // Initialize ref if empty
      if (Object.keys(prevCategoryLevelsRef.current).length === 0) {
        player.selectedCategories.forEach(cat => {
          prevCategoryLevelsRef.current[cat] = player.categories[cat].level;
        });
      }
    }
  }, [player?.categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-system-blue text-xl font-mono animate-pulse">
          LOADING PLAYER DATA...
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-system-red text-xl font-mono">
          FAILED TO LOAD PLAYER DATA
        </div>
      </div>
    );
  }

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'status' && <StatusScreen />}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'quests' && <QuestLog />}
      {activeTab === 'inventory' && <Inventory />}
      <LevelUpModal show={showLevelUp} level={player.overallLevel} onClose={() => setShowLevelUp(false)} />
    </MainLayout>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <GameProvider>{children}</GameProvider>;
};

function App() {
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const handleAuthSuccess = () => {
    window.location.href = '/game';
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/game" replace />
              ) : authView === 'login' ? (
                <Login
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignup={() => setAuthView('signup')}
                />
              ) : (
                <Signup
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setAuthView('login')}
                />
              )
            }
          />
          
          <Route
            path="/forgot-password"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/game" replace />
              ) : (
                <ForgotPassword />
              )
            }
          />
          
          <Route
            path="/reset-password/:token"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/game" replace />
              ) : (
                <ResetPassword />
              )
            }
          />
          
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameContent />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to={authService.isAuthenticated() ? "/game" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
