import React, { useState, useEffect } from 'react';
import GameSetup from './components/GameSetup';
import GameInterface from './components/GameInterface';

interface Player {
  id: string;
  name: string;
}

interface GameData {
  gameName: string;
  players: Player[];
  startingChips: number;
}

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing game on load
  useEffect(() => {
    const checkExistingGame = () => {
      try {
        const savedGameState = localStorage.getItem('currentGameState');
        if (savedGameState) {
          const gameState = JSON.parse(savedGameState);
          // Check if it's a recent game (within 24 hours)
          const now = Date.now();
          const gameAge = now - (gameState.timestamp || 0);
          const hoursSinceGame = gameAge / (1000 * 60 * 60);

          if (hoursSinceGame < 24 && gameState.gameName) {
            // Restore game data
            setGameData({
              gameName: gameState.gameName,
              players: gameState.players?.map((p: any) => ({ id: p.id, name: p.name })) || [],
              startingChips: gameState.players?.[0]?.chips || 1000
            });
            setGameStarted(true);
          }
        }
      } catch (error) {
        console.error('Error loading saved game:', error);
      }
      setIsLoading(false);
    };

    // Add small delay for better UX
    const timer = setTimeout(checkExistingGame, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = (gameName: string, players: Player[], startingChips: number) => {
    const newGameData = {
      gameName,
      players,
      startingChips
    };

    setGameData(newGameData);
    setGameStarted(true);

    // Clear any existing game state when starting new game
    localStorage.removeItem('currentGameState');
  };

  const handleBackToSetup = () => {
    setGameStarted(false);
    setGameData(null);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="text-6xl mb-4">🎰</div>
          <div className="text-responsive-xl font-bold text-white mb-2">Poker Chip Tracker</div>
          <div className="text-gray-400 text-responsive-base mb-6">Loading your game...</div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-poker-green"></div>
          </div>
        </div>
      </div>
    );
  }

  // Game interface
  if (gameStarted && gameData) {
    return (
      <div className="min-h-screen bg-dark-900">
        <GameInterface
          gameName={gameData.gameName}
          initialPlayers={gameData.players}
          startingChips={gameData.startingChips}
          onBackToSetup={handleBackToSetup}
        />
      </div>
    );
  }

  // Game setup
  return (
    <div className="min-h-screen bg-dark-900">
      <GameSetup onStartGame={handleStartGame} />
    </div>
  );
};

export default App;
