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
    const [animatingNewPlayer, setAnimatingNewPlayer] = useState<string | null>(null);

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
            setAnimatingNewPlayer(newPlayer.id);
            setTimeout(() => setAnimatingNewPlayer(null), 600);
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
        { name: 'Quick Game', chips: 500, playerCount: 4, icon: '⚡', color: 'from-accent-blue to-blue-600' },
        { name: 'Standard Game', chips: 1000, playerCount: 6, icon: '♠️', color: 'from-poker-green-500 to-poker-green-600' },
        { name: 'Tournament', chips: 2000, playerCount: 8, icon: '♦️', color: 'from-poker-gold-500 to-poker-gold-600' }
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

    const getPlayerIcon = (index: number) => {
        const icons = ['👤', '👥', '🧑‍💼', '👩‍💼', '🧑‍🎓', '👨‍🎓', '🧑‍💻', '👩‍💻', '🧑‍🎨', '👨‍🎨'];
        return icons[index % icons.length];
    };

    const hasErrors = Object.keys(errors).length > 0;
    const canStartGame = gameName.trim() && players.filter(p => p.name.trim()).length >= 2 && !hasErrors;

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Enhanced Premium Header */}
                <div className="text-center mb-16 animate-slideDown">
                    <div className="inline-flex items-center gap-6 mb-8">
                        <div className="text-7xl animate-float">♠️</div>
                        <div>
                            <h1 className="text-responsive-3xl font-black text-white mb-3 tracking-tight">
                                Poker Chip Tracker
                            </h1>
                            <div className="text-poker-gold text-responsive-lg font-semibold tracking-wide">
                                Professional Edition
                            </div>
                        </div>
                        <div className="text-7xl animate-float" style={{ animationDelay: '0.5s' }}>♣️</div>
                    </div>
                    <p className="text-gray-400 text-responsive-base max-w-lg mx-auto leading-relaxed">
                        Set up your poker game with professional-grade chip tracking and betting round management
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Enhanced Quick Setup Presets */}
                    <div className="card animate-fadeIn">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-poker-green-500 to-poker-green-600 rounded-full flex items-center justify-center shadow-glow">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <div>
                                <h2 className="text-responsive-lg font-bold text-white">Quick Setup</h2>
                                <p className="text-gray-400 text-responsive-sm">Choose a preset to get started quickly</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickSetupPresets.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => applyPreset(preset)}
                                    className="group relative overflow-hidden bg-dark-800/60 hover:bg-dark-750/90 border border-dark-600/50 hover:border-poker-green-500/60 text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-card-hover active:scale-100"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-10 h-10 bg-gradient-to-r ${preset.color} rounded-full flex items-center justify-center shadow-lg`}>
                                            <span className="text-xl">{preset.icon}</span>
                                        </div>
                                        <span className="font-bold text-responsive-base">{preset.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-300 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-accent-purple">👥</span>
                                            <span>{preset.playerCount} players</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-poker-gold-500">💰</span>
                                            <span>${preset.chips.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-poker-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Enhanced Game Name */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-accent-blue to-blue-600 rounded-full flex items-center justify-center shadow-glow">
                                <span className="text-2xl">🎮</span>
                            </div>
                            <div>
                                <h2 className="text-responsive-lg font-bold text-white">Game Name</h2>
                                <p className="text-gray-400 text-responsive-sm">Give your poker session a memorable name</p>
                            </div>
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
                            <div className="text-red-400 text-responsive-xs mt-4 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.gameName}</span>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Players */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-accent-purple to-purple-600 rounded-full flex items-center justify-center shadow-glow">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div>
                                    <h2 className="text-responsive-lg font-bold text-white">
                                        Players ({players.length})
                                    </h2>
                                    <p className="text-gray-400 text-responsive-sm">Add players to your game</p>
                                </div>
                            </div>
                            <button
                                onClick={addPlayer}
                                disabled={players.length >= 10}
                                className="btn-secondary bg-gradient-to-r from-poker-green-600/20 to-poker-green-700/20 border-poker-green-500/40 hover:border-poker-green-400/60 hover:bg-poker-green-600/30 flex items-center gap-3 text-responsive-sm disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-semibold"
                            >
                                <div className="w-5 h-5 bg-poker-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">+</span>
                                </div>
                                <span>Add Player</span>
                            </button>
                        </div>

                        <div className="space-y-5">
                            {players.map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`group ${animatingNewPlayer === player.id ? 'animate-slideUp' : ''
                                        }`}
                                    style={{ animationDelay: `${0.1 * index}s` }}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                                                {getPlayerIcon(index)}
                                            </div>
                                            <input
                                                type="text"
                                                value={player.name}
                                                onChange={(e) => updatePlayer(player.id, e.target.value)}
                                                placeholder={`Player ${index + 1} name`}
                                                className={`input-field w-full pl-16 ${errors[`player_${player.id}`] ? 'border-red-500 ring-red-500' : ''}`}
                                                maxLength={30}
                                            />
                                            {errors[`player_${player.id}`] && (
                                                <div className="text-red-400 text-responsive-xs mt-3 animate-slideDown flex items-center gap-2">
                                                    <span>⚠️</span>
                                                    <span>{errors[`player_${player.id}`]}</span>
                                                </div>
                                            )}
                                        </div>
                                        {players.length > 2 && (
                                            <button
                                                onClick={() => removePlayer(player.id)}
                                                className="btn-action bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-400 hover:to-red-500 text-white px-4 py-3 min-h-[56px] transform hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                                                aria-label={`Remove ${player.name || 'player'}`}
                                            >
                                                <span className="text-lg font-bold">×</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-dark-700/50">
                            <div className="flex items-center gap-3 text-responsive-xs text-gray-400">
                                <span className="text-lg">💡</span>
                                <span>Minimum 2 players, maximum 10 players</span>
                            </div>
                        </div>

                        {errors.players && (
                            <div className="text-red-400 text-responsive-xs mt-6 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.players}</span>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Starting Chips */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 rounded-full flex items-center justify-center shadow-glow-gold">
                                <span className="text-2xl">🃏</span>
                            </div>
                            <div>
                                <h2 className="text-responsive-lg font-bold text-white">Starting Chips</h2>
                                <p className="text-gray-400 text-responsive-sm">Set the initial chip amount for each player</p>
                            </div>
                        </div>

                        {/* Enhanced preset chip amounts */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
                                    className={`relative overflow-hidden py-4 px-5 rounded-xl transition-all duration-300 text-responsive-sm font-bold transform hover:scale-105 active:scale-100 ${startingChips === amount
                                        ? 'bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 text-dark-900 shadow-glow-gold border-2 border-poker-gold-400'
                                        : 'bg-dark-800/60 hover:bg-dark-750/80 text-gray-300 border-2 border-dark-600/50 hover:border-poker-gold-500/40'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {startingChips === amount && (
                                            <span className="text-lg">✓</span>
                                        )}
                                        <span>${amount.toLocaleString()}</span>
                                    </div>
                                    {startingChips === amount && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"></div>
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

                        <div className="flex items-center gap-3 text-responsive-xs text-gray-400 mt-4">
                            <span className="text-lg">📊</span>
                            <span>Range: $100 - $1,000,000</span>
                        </div>

                        {errors.startingChips && (
                            <div className="text-red-400 text-responsive-xs mt-4 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.startingChips}</span>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Start Game Button */}
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
                                <span className="flex items-center justify-center gap-4">
                                    <span className="text-2xl">🚀</span>
                                    <span className="font-bold">Start Game</span>
                                    <span className="text-2xl">🚀</span>
                                </span>
                            )}
                        </button>

                        {hasErrors && (
                            <div className="text-center text-red-400 text-responsive-xs mt-6 animate-slideDown flex items-center justify-center gap-2">
                                <span>⚠️</span>
                                <span>Please fix the errors above to start the game</span>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Game Summary */}
                    {canStartGame && !hasErrors && (
                        <div className="card bg-gradient-to-br from-dark-850/90 to-dark-800/90 border-poker-green-500/30 animate-fadeIn shadow-glow" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-poker-green-500 to-poker-green-600 rounded-full flex items-center justify-center shadow-glow">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <div>
                                    <h3 className="text-responsive-base font-bold text-poker-green-400">Game Summary</h3>
                                    <p className="text-gray-400 text-responsive-xs">Review your game setup</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-responsive-sm">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <span>🎮</span>
                                            <span>Game:</span>
                                        </span>
                                        <span className="text-white font-semibold">{gameName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <span>👥</span>
                                            <span>Players:</span>
                                        </span>
                                        <span className="text-white font-semibold">
                                            {players.filter(p => p.name.trim()).length}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <span>🃏</span>
                                            <span>Starting chips:</span>
                                        </span>
                                        <span className="text-poker-gold font-semibold">
                                            ${startingChips.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 flex items-center gap-2">
                                            <span>💰</span>
                                            <span>Total chips:</span>
                                        </span>
                                        <span className="text-poker-gold font-semibold">
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