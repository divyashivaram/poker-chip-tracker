import React, { useState } from 'react';
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

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);

  const handleStartGame = (data: GameData) => {
    console.log('🎮 handleStartGame called with data:', data);
    setGameData(data);
    setGameStarted(true);
    // Store in localStorage for persistence
    localStorage.setItem('currentGame', JSON.stringify(data));
    console.log('🎮 Game started! gameStarted:', true, 'gameData:', data);
  };

  const handleBackToSetup = () => {
    console.log('🔙 Back to setup called');
    setGameStarted(false);
    setGameData(null);
    localStorage.removeItem('currentGame');
    localStorage.removeItem('currentGameState');
  };

  console.log('🎯 App render - gameStarted:', gameStarted, 'gameData:', gameData);

  // Show game setup screen
  if (!gameStarted || !gameData) {
    console.log('📋 Rendering GameSetup');
    return <GameSetup onStartGame={handleStartGame} />;
  }

  // Show main game interface
  console.log('🃏 Rendering GameInterface');
  return (
    <GameInterface
      gameName={gameData.gameName}
      initialPlayers={gameData.players}
      startingChips={gameData.startingChips}
      onBackToSetup={handleBackToSetup}
    />
  );
}

export default App;
