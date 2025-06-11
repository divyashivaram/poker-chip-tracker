import React, { useState, useEffect } from 'react';

interface Player {
    id: string;
    name: string;
}

interface GameSetupProps {
    onStartGame: (gameName: string, players: Player[], startingChips: number) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
    const [gameName, setGameName] = useState('');
    const [players, setPlayers] = useState<Player[]>([
        { id: '1', name: '' },
        { id: '2', name: '' }
    ]);
    const [startingChips, setStartingChips] = useState(1000);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    // Load saved game state
    useEffect(() => {
        const savedState = localStorage.getItem('gameSetupState');
        if (savedState) {
            try {
                const { gameName: savedGameName, players: savedPlayers, startingChips: savedChips } = JSON.parse(savedState);
                if (savedGameName) setGameName(savedGameName);
                if (savedPlayers && savedPlayers.length >= 2) setPlayers(savedPlayers);
                if (savedChips) setStartingChips(savedChips);
            } catch (error) {
                console.error('Error loading saved state:', error);
            }
        }
    }, []);

    // Auto-save setup state
    useEffect(() => {
        const saveState = {
            gameName,
            players,
            startingChips
        };
        localStorage.setItem('gameSetupState', JSON.stringify(saveState));
    }, [gameName, players, startingChips]);

    const addPlayer = () => {
        if (players.length < 10) {
            const newPlayer = {
                id: Date.now().toString(),
                name: ''
            };
            setPlayers([...players, newPlayer]);
            // Clear any player-related errors when adding
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.players;
                return newErrors;
            });
        }
    };

    const removePlayer = (playerId: string) => {
        if (players.length > 2) {
            setPlayers(players.filter(p => p.id !== playerId));
            // Clear any player-related errors when removing
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.players;
                return newErrors;
            });
        }
    };

    const updatePlayer = (playerId: string, name: string) => {
        setPlayers(players.map(p =>
            p.id === playerId ? { ...p, name } : p
        ));

        // Clear player name error when user starts typing
        if (name.trim()) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`player_${playerId}`];
                delete newErrors.players;
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Validate game name
        if (!gameName.trim()) {
            newErrors.gameName = 'Game name is required';
        } else if (gameName.trim().length < 2) {
            newErrors.gameName = 'Game name must be at least 2 characters';
        }

        // Validate players
        const validPlayers = players.filter(p => p.name.trim());
        if (validPlayers.length < 2) {
            newErrors.players = 'At least 2 players with names are required';
        }

        // Validate individual player names
        players.forEach(player => {
            if (!player.name.trim()) {
                newErrors[`player_${player.id}`] = 'Player name is required';
            } else if (player.name.trim().length < 2) {
                newErrors[`player_${player.id}`] = 'Name must be at least 2 characters';
            }
        });

        // Check for duplicate names
        const playerNames = players.map(p => p.name.trim().toLowerCase()).filter(name => name);
        const duplicateNames = playerNames.filter((name, index) => playerNames.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
            newErrors.players = 'Player names must be unique';
        }

        // Validate starting chips
        if (startingChips < 100) {
            newErrors.startingChips = 'Starting chips must be at least 100';
        } else if (startingChips > 1000000) {
            newErrors.startingChips = 'Starting chips cannot exceed 1,000,000';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartGame = async () => {
        if (!validateForm()) {
            // Shake animation for errors
            const errorElements = document.querySelectorAll('.error-shake');
            errorElements.forEach(el => el.classList.add('error-shake'));
            setTimeout(() => {
                errorElements.forEach(el => el.classList.remove('error-shake'));
            }, 500);
            return;
        }

        setIsLoading(true);

        // Add loading delay for better UX
        setTimeout(() => {
            const validPlayers = players.filter(p => p.name.trim());
            onStartGame(gameName.trim(), validPlayers, startingChips);
            setIsLoading(false);
        }, 500);
    };

    const quickSetupPresets = [
        { name: 'Quick Game', chips: 500, playerCount: 4 },
        { name: 'Standard Game', chips: 1000, playerCount: 6 },
        { name: 'Tournament', chips: 2000, playerCount: 8 }
    ];

    const applyPreset = (preset: typeof quickSetupPresets[0]) => {
        setStartingChips(preset.chips);
        setGameName(preset.name);

        // Adjust player count
        const currentCount = players.length;
        if (currentCount < preset.playerCount) {
            const newPlayers = [...players];
            for (let i = currentCount; i < preset.playerCount; i++) {
                newPlayers.push({
                    id: Date.now() + i.toString(),
                    name: ''
                });
            }
            setPlayers(newPlayers);
        } else if (currentCount > preset.playerCount) {
            setPlayers(players.slice(0, preset.playerCount));
        }

        setErrors({});
    };

    const hasErrors = Object.keys(errors).length > 0;
    const canStartGame = gameName.trim() && players.filter(p => p.name.trim()).length >= 2 && !hasErrors;

    return (
        <div className="min-h-screen bg-dark-900 p-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8 animate-slideDown">
                    <h1 className="text-responsive-3xl font-bold text-white mb-3">🎰 Poker Chip Tracker</h1>
                    <p className="text-gray-400 text-responsive-base">Set up your poker game</p>
                </div>

                <div className="space-y-6">
                    {/* Quick Setup Presets */}
                    <div className="card animate-fadeIn">
                        <h2 className="text-responsive-lg font-semibold text-white mb-4">Quick Setup</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {quickSetupPresets.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyPreset(preset)}
                                    className="btn-secondary text-center p-3"
                                >
                                    <div className="font-semibold text-responsive-sm">{preset.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {preset.playerCount} players • ${preset.chips.toLocaleString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Game Name */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-responsive-lg font-semibold text-white mb-4">Game Name</h2>
                        <input
                            type="text"
                            value={gameName}
                            onChange={(e) => {
                                setGameName(e.target.value);
                                if (e.target.value.trim()) {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.gameName;
                                        return newErrors;
                                    });
                                }
                            }}
                            placeholder="Enter game name (e.g., Friday Night Poker)"
                            className={`input-field w-full ${errors.gameName ? 'border-red-500 ring-red-500 error-shake' : ''}`}
                            maxLength={50}
                        />
                        {errors.gameName && (
                            <div className="text-red-400 text-responsive-xs mt-2 animate-slideDown">
                                {errors.gameName}
                            </div>
                        )}
                    </div>

                    {/* Players */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                            <h2 className="text-responsive-lg font-semibold text-white">Players ({players.length})</h2>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={addPlayer}
                                    disabled={players.length >= 10}
                                    className="btn-secondary flex-1 sm:flex-none text-responsive-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + Add Player
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {players.map((player, index) => (
                                <div key={player.id} className="flex gap-3 items-start animate-slideUp" style={{ animationDelay: `${0.1 * index}s` }}>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={player.name}
                                            onChange={(e) => updatePlayer(player.id, e.target.value)}
                                            placeholder={`Player ${index + 1} name`}
                                            className={`input-field w-full ${errors[`player_${player.id}`] ? 'border-red-500 ring-red-500' : ''}`}
                                            maxLength={30}
                                        />
                                        {errors[`player_${player.id}`] && (
                                            <div className="text-red-400 text-responsive-xs mt-1 animate-slideDown">
                                                {errors[`player_${player.id}`]}
                                            </div>
                                        )}
                                    </div>
                                    {players.length > 2 && (
                                        <button
                                            onClick={() => removePlayer(player.id)}
                                            className="btn-secondary bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-3 min-h-[48px] transform hover:scale-105 active:scale-95"
                                            aria-label={`Remove ${player.name || 'player'}`}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="text-responsive-xs text-gray-400 mt-3">
                            Minimum 2 players, maximum 10 players
                        </div>

                        {errors.players && (
                            <div className="text-red-400 text-responsive-xs mt-2 animate-slideDown">
                                {errors.players}
                            </div>
                        )}
                    </div>

                    {/* Starting Chips */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-responsive-lg font-semibold text-white mb-4">Starting Chips</h2>

                        {/* Preset chip amounts */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {[500, 1000, 2000, 5000].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setStartingChips(amount);
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.startingChips;
                                            return newErrors;
                                        });
                                    }}
                                    className={`btn-action text-responsive-sm ${startingChips === amount
                                            ? 'bg-poker-green text-white'
                                            : 'bg-dark-600 hover:bg-dark-500 text-gray-300'
                                        }`}
                                >
                                    ${amount.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <input
                            type="number"
                            value={startingChips}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setStartingChips(value);
                                if (value >= 100 && value <= 1000000) {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.startingChips;
                                        return newErrors;
                                    });
                                }
                            }}
                            placeholder="Custom amount"
                            min="100"
                            max="1000000"
                            step="50"
                            className={`input-field w-full ${errors.startingChips ? 'border-red-500 ring-red-500' : ''}`}
                        />

                        <div className="text-responsive-xs text-gray-400 mt-2">
                            Range: $100 - $1,000,000
                        </div>

                        {errors.startingChips && (
                            <div className="text-red-400 text-responsive-xs mt-2 animate-slideDown">
                                {errors.startingChips}
                            </div>
                        )}
                    </div>

                    {/* Start Game Button */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={handleStartGame}
                            disabled={!canStartGame || isLoading}
                            className={`btn-primary w-full ${canStartGame && !isLoading ? 'success-glow' : ''
                                } ${isLoading ? 'loading' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Starting Game...
                                </span>
                            ) : (
                                '🚀 Start Game'
                            )}
                        </button>

                        {hasErrors && (
                            <div className="text-center text-red-400 text-responsive-xs mt-3 animate-slideDown">
                                Please fix the errors above to start the game
                            </div>
                        )}
                    </div>

                    {/* Game Summary */}
                    {canStartGame && !hasErrors && (
                        <div className="card bg-dark-700 border-poker-green animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                            <h3 className="text-responsive-base font-semibold text-poker-green mb-3">Game Summary</h3>
                            <div className="space-y-2 text-responsive-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Game:</span>
                                    <span className="text-white font-medium">{gameName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Players:</span>
                                    <span className="text-white font-medium">
                                        {players.filter(p => p.name.trim()).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Starting chips:</span>
                                    <span className="text-poker-gold font-medium">
                                        ${startingChips.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total chips:</span>
                                    <span className="text-poker-gold font-medium">
                                        ${(startingChips * players.filter(p => p.name.trim()).length).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameSetup; 