import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SystemWindow } from './components/SystemWindow';
import { Navigation, MobileNavigation } from './components/Navigation';
import { StatusScreen } from './components/StatusScreen';
import { QuestLog } from './components/QuestLog';
import { Inventory } from './components/Inventory';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { GameProvider, useGame } from './context/GameContext';
import { LevelUpModal } from './components/LevelUpModal';
import authService from './services/auth.service';

const GameContent = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'quests' | 'inventory'>('status');
  const { player, loading } = useGame();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(player?.level || 1);

  useEffect(() => {
    if (player && player.level > prevLevelRef.current) {
      setShowLevelUp(true);
      prevLevelRef.current = player.level;
    }
  }, [player?.level]);

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
    <SystemWindow title="PLAYER SYSTEM">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="h-full">
        {activeTab === 'status' && <StatusScreen />}
        {activeTab === 'quests' && <QuestLog />}
        {activeTab === 'inventory' && <Inventory />}
      </div>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <LevelUpModal show={showLevelUp} level={player.level} onClose={() => setShowLevelUp(false)} />
    </SystemWindow>
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
  );
}

export default App;
