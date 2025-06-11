import React, { useState, useEffect } from 'react';
import GameSetup from './components/GameSetup';
import GameInterface from './components/GameInterface';
import Toast from './components/Toast';

interface Player {
  id: string;
  name: string;
}

interface GameState {
  gameName: string;
  players: Player[];
  startingChips: number;
  timestamp: number;
}

interface ToastState {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'game'>('setup');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showResumeOption, setShowResumeOption] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', isVisible: false });

  // Initialize the app and check for saved games
  useEffect(() => {
    const checkSavedGame = () => {
      try {
        const savedGameState = localStorage.getItem('currentGameState');
        if (savedGameState) {
          const parsedState = JSON.parse(savedGameState);
          const hoursSinceLastGame = (Date.now() - parsedState.timestamp) / (1000 * 60 * 60);

          // Only show resume option if game was saved within 24 hours
          if (hoursSinceLastGame < 24) {
            setShowResumeOption(true);
            setGameState(parsedState);
          } else {
            // Clear old game state
            localStorage.removeItem('currentGameState');
          }
        }
      } catch (error) {
        console.error('Error checking saved game:', error);
        localStorage.removeItem('currentGameState');
      }
    };

    // Simulate app initialization delay for better UX
    setTimeout(() => {
      checkSavedGame();
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleStartGame = (gameName: string, players: Player[], startingChips: number) => {
    const newGameState = {
      gameName,
      players,
      startingChips,
      timestamp: Date.now()
    };

    setGameState(newGameState);
    setCurrentView('game');
    setShowResumeOption(false);

    // Clear any existing game state since we're starting fresh
    localStorage.removeItem('currentGameState');
  };

  const handleBackToSetup = () => {
    setCurrentView('setup');
    setShowResumeOption(false);
  };

  const handleResumeGame = () => {
    if (gameState) {
      setCurrentView('game');
      setShowResumeOption(false);
    }
  };

  const handleResumeGameFromSetup = () => {
    // For resuming from the saved games list in GameSetup
    // We need to load the current game state and switch to game view
    const savedGameState = localStorage.getItem('currentGameState');
    if (savedGameState) {
      try {
        const parsedState = JSON.parse(savedGameState);
        setGameState({
          gameName: parsedState.gameName,
          players: parsedState.players || [],
          startingChips: parsedState.startingChips || 1000,
          timestamp: parsedState.timestamp || Date.now()
        });
        setCurrentView('game');
      } catch (error) {
        console.error('Error loading saved game for resume:', error);
      }
    }
  };

  const handleStartNewGame = () => {
    setGameState(null);
    setShowResumeOption(false);
    localStorage.removeItem('currentGameState');
    // Stay on setup view
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Premium loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Animated logo */}
          <div className="relative">
            <div className="text-8xl mb-4 animate-float">🎰</div>
            <div className="absolute inset-0 text-8xl mb-4 animate-pulse opacity-50">🎰</div>
          </div>

          {/* App title */}
          <div className="space-y-3">
            <h1 className="text-responsive-3xl font-bold text-white">
              Poker Chip Tracker
            </h1>
            <div className="text-poker-gold text-responsive-base font-medium">
              Professional Edition
            </div>
          </div>

          {/* Loading animation */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-poker-green-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-poker-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-poker-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="text-gray-400 text-responsive-sm">
              Initializing game engine...
            </div>
          </div>

          {/* Loading bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-poker-green-500 to-poker-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resume game option screen
  if (showResumeOption && gameState) {
    const gameAge = Math.round((Date.now() - gameState.timestamp) / (1000 * 60));
    const timeDisplay = gameAge < 60 ? `${gameAge} minutes ago` : `${Math.round(gameAge / 60)} hours ago`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <div className="card text-center space-y-8 animate-slideUp">
            {/* Header */}
            <div className="space-y-4">
              <div className="text-6xl animate-float">🎮</div>
              <div>
                <h2 className="text-responsive-xl font-bold text-white mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-400 text-responsive-base">
                  We found a saved game session
                </p>
              </div>
            </div>

            {/* Game info */}
            <div className="bg-dark-800/60 backdrop-blur-sm rounded-xl p-6 border border-dark-600/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Game:</span>
                  <span className="text-white font-semibold">{gameState.gameName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Players:</span>
                  <span className="text-white font-semibold">{gameState.players.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Started:</span>
                  <span className="text-poker-gold font-semibold">{timeDisplay}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResumeGame}
                className="btn-primary w-full success-glow"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-xl">🔄</span>
                  <span>Resume Game</span>
                </span>
              </button>

              <button
                onClick={handleStartNewGame}
                className="btn-secondary w-full"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-xl">🆕</span>
                  <span>Start New Game</span>
                </span>
              </button>
            </div>

            {/* Info note */}
            <div className="text-2xs text-gray-500 border-t border-dark-700/50 pt-4">
              Game sessions are automatically saved for 24 hours
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main app content
  return (
    <div className="App">
      {currentView === 'setup' ? (
        <GameSetup onStartGame={handleStartGame} onResumeGame={handleResumeGameFromSetup} />
      ) : (
        gameState && (
          <GameInterface
            gameName={gameState.gameName}
            initialPlayers={gameState.players}
            startingChips={gameState.startingChips}
            onBackToSetup={handleBackToSetup}
            showToast={showToast}
          />
        )
      )}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

export default App;
