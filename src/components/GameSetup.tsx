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

        if (!gameName.trim()) {
            newErrors.gameName = 'Game name is required';
        } else if (gameName.trim().length < 2) {
            newErrors.gameName = 'Game name must be at least 2 characters';
        }

        const validPlayers = players.filter(p => p.name.trim());
        if (validPlayers.length < 2) {
            newErrors.players = 'At least 2 players with names are required';
        }

        players.forEach(player => {
            if (!player.name.trim()) {
                newErrors[`player_${player.id}`] = 'Player name is required';
            } else if (player.name.trim().length < 2) {
                newErrors[`player_${player.id}`] = 'Name must be at least 2 characters';
            }
        });

        const playerNames = players.map(p => p.name.trim().toLowerCase()).filter(name => name);
        const duplicateNames = playerNames.filter((name, index) => playerNames.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
            newErrors.players = 'Player names must be unique';
        }

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
            const errorElements = document.querySelectorAll('.error-shake');
            errorElements.forEach(el => el.classList.add('error-shake'));
            setTimeout(() => {
                errorElements.forEach(el => el.classList.remove('error-shake'));
            }, 500);
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            const validPlayers = players.filter(p => p.name.trim());
            onStartGame(gameName.trim(), validPlayers, startingChips);
            setIsLoading(false);
        }, 800);
    };

    const quickSetupPresets = [
        { name: 'Quick Game', chips: 500, playerCount: 4, icon: '⚡' },
        { name: 'Standard Game', chips: 1000, playerCount: 6, icon: '🎯' },
        { name: 'Tournament', chips: 2000, playerCount: 8, icon: '🏆' }
    ];

    const applyPreset = (preset: typeof quickSetupPresets[0]) => {
        setStartingChips(preset.chips);
        setGameName(preset.name);

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
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Premium Header */}
                <div className="text-center mb-12 animate-slideDown">
                    <div className="inline-flex items-center gap-4 mb-6">
                        <div className="text-6xl animate-float">🎰</div>
                        <div>
                            <h1 className="text-responsive-3xl font-bold text-white mb-2">Poker Chip Tracker</h1>
                            <div className="text-poker-gold text-responsive-base font-medium">
                                Professional Game Setup
                            </div>
                        </div>
                        <div className="text-6xl animate-float" style={{ animationDelay: '0.5s' }}>🃏</div>
                    </div>
                    <p className="text-gray-400 text-responsive-base max-w-md mx-auto">
                        Set up your poker game with professional-grade chip tracking
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Quick Setup Presets */}
                    <div className="card animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-poker-green-500 to-poker-green-600 rounded-full flex items-center justify-center">
                                <span className="text-xl">⚡</span>
                            </div>
                            <h2 className="text-responsive-lg font-semibold text-white">Quick Setup</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickSetupPresets.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyPreset(preset)}
                                    className="group relative overflow-hidden bg-dark-800/60 hover:bg-dark-750/80 border border-dark-600/50 hover:border-poker-green-500/50 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{preset.icon}</span>
                                        <span className="font-semibold text-responsive-base">{preset.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-400 space-y-1">
                                        <div>👥 {preset.playerCount} players</div>
                                        <div>💰 ${preset.chips.toLocaleString()}</div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-poker-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Game Name */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-accent-blue to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-xl">🎮</span>
                            </div>
                            <h2 className="text-responsive-lg font-semibold text-white">Game Name</h2>
                        </div>
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
                            <div className="text-red-400 text-responsive-xs mt-3 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.gameName}</span>
                            </div>
                        )}
                    </div>

                    {/* Players */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-accent-purple to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-xl">👥</span>
                                </div>
                                <h2 className="text-responsive-lg font-semibold text-white">
                                    Players ({players.length})
                                </h2>
                            </div>
                            <button
                                onClick={addPlayer}
                                disabled={players.length >= 10}
                                className="btn-secondary flex items-center gap-2 text-responsive-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>+</span>
                                <span>Add Player</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {players.map((player, index) => (
                                <div key={player.id} className="group animate-slideUp" style={{ animationDelay: `${0.1 * index}s` }}>
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                                                #{index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={player.name}
                                                onChange={(e) => updatePlayer(player.id, e.target.value)}
                                                placeholder={`Player ${index + 1} name`}
                                                className={`input-field w-full pl-12 ${errors[`player_${player.id}`] ? 'border-red-500 ring-red-500' : ''}`}
                                                maxLength={30}
                                            />
                                            {errors[`player_${player.id}`] && (
                                                <div className="text-red-400 text-responsive-xs mt-2 animate-slideDown flex items-center gap-2">
                                                    <span>⚠️</span>
                                                    <span>{errors[`player_${player.id}`]}</span>
                                                </div>
                                            )}
                                        </div>
                                        {players.length > 2 && (
                                            <button
                                                onClick={() => removePlayer(player.id)}
                                                className="btn-action bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-4 py-3 min-h-[56px] transform hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                aria-label={`Remove ${player.name || 'player'}`}
                                            >
                                                <span className="text-lg">×</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-dark-700/50">
                            <div className="flex items-center gap-2 text-responsive-xs text-gray-400">
                                <span>💡</span>
                                <span>Minimum 2 players, maximum 10 players</span>
                            </div>
                        </div>

                        {errors.players && (
                            <div className="text-red-400 text-responsive-xs mt-4 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.players}</span>
                            </div>
                        )}
                    </div>

                    {/* Starting Chips */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 rounded-full flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                            <h2 className="text-responsive-lg font-semibold text-white">Starting Chips</h2>
                        </div>

                        {/* Preset chip amounts */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
                                    className={`relative overflow-hidden py-3 px-4 rounded-lg transition-all duration-300 text-responsive-sm font-medium transform hover:scale-105 ${startingChips === amount
                                            ? 'bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 text-dark-900 shadow-glow-gold'
                                            : 'bg-dark-800/60 hover:bg-dark-750/80 text-gray-300 border border-dark-600/50 hover:border-poker-gold-500/30'
                                        }`}
                                >
                                    <span className="relative z-10">${amount.toLocaleString()}</span>
                                    {startingChips === amount && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                                    )}
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

                        <div className="flex items-center gap-2 text-responsive-xs text-gray-400 mt-3">
                            <span>📊</span>
                            <span>Range: $100 - $1,000,000</span>
                        </div>

                        {errors.startingChips && (
                            <div className="text-red-400 text-responsive-xs mt-3 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.startingChips}</span>
                            </div>
                        )}
                    </div>

                    {/* Start Game Button */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                        <button
                            onClick={handleStartGame}
                            disabled={!canStartGame || isLoading}
                            className={`btn-primary w-full ${canStartGame && !isLoading ? 'success-glow' : ''
                                } ${isLoading ? 'loading' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span>Starting Game...</span>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    <span className="text-xl">🚀</span>
                                    <span>Start Game</span>
                                    <span className="text-xl">🚀</span>
                                </span>
                            )}
                        </button>

                        {hasErrors && (
                            <div className="text-center text-red-400 text-responsive-xs mt-4 animate-slideDown flex items-center justify-center gap-2">
                                <span>⚠️</span>
                                <span>Please fix the errors above to start the game</span>
                            </div>
                        )}
                    </div>

                    {/* Game Summary */}
                    {canStartGame && !hasErrors && (
                        <div className="card bg-gradient-to-br from-dark-850/90 to-dark-800/90 border-poker-green-500/30 animate-fadeIn" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-poker-green-500 to-poker-green-600 rounded-full flex items-center justify-center">
                                    <span className="text-xl">📋</span>
                                </div>
                                <h3 className="text-responsive-base font-semibold text-poker-green-400">Game Summary</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-responsive-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Game:</span>
                                        <span className="text-white font-medium">{gameName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Players:</span>
                                        <span className="text-white font-medium">
                                            {players.filter(p => p.name.trim()).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Starting chips:</span>
                                        <span className="text-poker-gold font-medium">
                                            ${startingChips.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Total chips:</span>
                                        <span className="text-poker-gold font-medium">
                                            ${(startingChips * players.filter(p => p.name.trim()).length).toLocaleString()}
                                        </span>
                                    </div>
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