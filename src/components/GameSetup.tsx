import React, { useState, useEffect } from 'react';

interface Player {
    id: string;
    name: string;
}

interface GameSetupProps {
    onStartGame: (gameData: {
        gameName: string;
        players: Player[];
        startingChips: number;
    }) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
    const [gameName, setGameName] = useState('');
    const [players, setPlayers] = useState<Player[]>([
        { id: '1', name: '' },
        { id: '2', name: '' }
    ]);
    const [startingChips, setStartingChips] = useState(1000);
    const [newPlayerName, setNewPlayerName] = useState('');

    // Load saved data from localStorage
    useEffect(() => {
        const savedGameName = localStorage.getItem('pokerGameName');
        const savedPlayers = localStorage.getItem('pokerPlayers');
        const savedStartingChips = localStorage.getItem('pokerStartingChips');

        if (savedGameName) setGameName(savedGameName);
        if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
        if (savedStartingChips) setStartingChips(parseInt(savedStartingChips));
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('pokerGameName', gameName);
        localStorage.setItem('pokerPlayers', JSON.stringify(players));
        localStorage.setItem('pokerStartingChips', startingChips.toString());
    }, [gameName, players, startingChips]);

    const addPlayer = () => {
        if (newPlayerName.trim()) {
            const newPlayer: Player = {
                id: Date.now().toString(),
                name: newPlayerName.trim()
            };
            setPlayers([...players, newPlayer]);
            setNewPlayerName('');
        }
    };

    const removePlayer = (playerId: string) => {
        if (players.length > 2) {
            setPlayers(players.filter(player => player.id !== playerId));
        }
    };

    const updatePlayerName = (playerId: string, name: string) => {
        setPlayers(players.map(player =>
            player.id === playerId ? { ...player, name } : player
        ));
    };

    const handleStartGame = () => {
        console.log('🚀 Start Game button clicked');
        const filledPlayers = players.filter(player => player.name.trim());
        console.log('👥 Filled players:', filledPlayers);
        console.log('🎮 Game name:', gameName.trim());
        console.log('💰 Starting chips:', startingChips);

        if (!gameName.trim()) {
            console.log('❌ Validation failed: No game name');
            alert('Please enter a game name');
            return;
        }

        if (filledPlayers.length < 2) {
            console.log('❌ Validation failed: Less than 2 players');
            alert('Please add at least 2 players');
            return;
        }

        if (startingChips < 1) {
            console.log('❌ Validation failed: Invalid starting chips');
            alert('Starting chips must be at least 1');
            return;
        }

        console.log('✅ Validation passed, calling onStartGame');
        onStartGame({
            gameName: gameName.trim(),
            players: filledPlayers,
            startingChips
        });
    };

    return (
        <div className="min-h-screen bg-dark-900 p-4">
            <div className="max-w-md mx-auto pt-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">�� Poker Chip Tracker v2.0</h1>
                    <p className="text-gray-400">Set up your game - UPDATED VERSION</p>
                </div>

                <div className="card space-y-6">
                    {/* Game Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Game Name
                        </label>
                        <input
                            type="text"
                            value={gameName}
                            onChange={(e) => setGameName(e.target.value)}
                            placeholder="Enter game name"
                            className="input-field w-full"
                        />
                    </div>

                    {/* Starting Chips */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Starting Chips
                        </label>
                        <input
                            type="number"
                            value={startingChips}
                            onChange={(e) => setStartingChips(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            className="input-field w-full"
                        />
                    </div>

                    {/* Players */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-4">
                            Players ({players.filter(p => p.name.trim()).length} added)
                        </label>

                        <div className="space-y-3 mb-4">
                            {players.map((player, index) => (
                                <div key={player.id} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={player.name}
                                        onChange={(e) => updatePlayerName(player.id, e.target.value)}
                                        placeholder={`Player ${index + 1} name`}
                                        className="input-field flex-1"
                                    />
                                    {players.length > 2 && (
                                        <button
                                            onClick={() => removePlayer(player.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                                            aria-label="Remove player"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Player */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                                placeholder="Add another player"
                                className="input-field flex-1"
                            />
                            <button
                                onClick={addPlayer}
                                disabled={!newPlayerName.trim()}
                                className="btn-secondary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Start Game Button */}
                    <button
                        onClick={handleStartGame}
                        style={{
                            backgroundColor: '#0f5132',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '8px',
                            border: 'none',
                            width: '100%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '32px'
                        }}
                    >
                        🚀 CLICK ME TO START GAME 🚀
                    </button>
                </div>

                <div className="text-center mt-6 text-gray-400 text-sm">
                    Perfect for poker nights under low lighting
                </div>
            </div>
        </div>
    );
};

export default GameSetup; 