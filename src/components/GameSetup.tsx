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

    const handleChipPresetClick = (amount: number) => {
        setStartingChips(amount);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.startingChips;
            return newErrors;
        });
    };

    const getPlayerIcon = (index: number) => {
        const icons = ['👤', '👥', '🧑‍💼', '👩‍💼', '🧑‍🎓', '👨‍🎓', '🧑‍💻', '👩‍💻', '🧑‍🎨', '👨‍🎨'];
        return icons[index % icons.length];
    };

    const hasErrors = Object.keys(errors).length > 0;
    const canStartGame = gameName.trim() && players.filter(p => p.name.trim()).length >= 2 && !hasErrors;
    const validPlayerCount = players.filter(p => p.name.trim()).length;
    const totalChips = startingChips * validPlayerCount;

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Compact Header */}
                <div className="text-center mb-8 animate-slideDown">
                    <div className="inline-flex items-center gap-4 mb-4">
                        <div className="text-4xl animate-float">♠️</div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                                Poker Chip Tracker
                            </h1>
                            <div className="text-poker-gold text-sm md:text-base font-semibold">
                                Professional Edition
                            </div>
                        </div>
                        <div className="text-4xl animate-float" style={{ animationDelay: '0.5s' }}>♣️</div>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
                        Focus on the cards, we'll handle the chips
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Compact Game Name */}
                    <div className="card animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">

                            <div>
                                <h2 className="text-lg font-bold text-white">Game Name</h2>

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
                            placeholder="(e.g., Friday Night Poker)"
                            className={`input-field w-full ${errors.gameName ? 'border-red-500 ring-red-500 error-shake' : ''}`}
                            maxLength={50}
                        />
                        {errors.gameName && (
                            <div className="text-red-400 text-xs mt-2 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.gameName}</span>
                            </div>
                        )}
                    </div>

                    {/* Compact Players */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-4">

                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Players
                                </h2>

                            </div>
                        </div>

                        <div className="space-y-3">
                            {players.map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`${animatingNewPlayer === player.id ? 'animate-slideUp' : ''
                                        }`}
                                    style={{ animationDelay: `${0.1 * index}s` }}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                                                {getPlayerIcon(index)}
                                            </div>
                                            <input
                                                type="text"
                                                value={player.name}
                                                onChange={(e) => updatePlayer(player.id, e.target.value)}
                                                placeholder={`Player ${index + 1}`}
                                                className={`input-field w-full pl-12 ${errors[`player_${player.id}`] ? 'border-red-500 ring-red-500' : ''}`}
                                                maxLength={30}
                                            />
                                            {errors[`player_${player.id}`] && (
                                                <div className="text-red-400 text-xs mt-2 animate-slideDown flex items-center gap-2">
                                                    <span>⚠️</span>
                                                    <span>{errors[`player_${player.id}`]}</span>
                                                </div>
                                            )}
                                        </div>
                                        {players.length > 2 && (
                                            <button
                                                onClick={() => removePlayer(player.id)}
                                                className="btn-action bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-400 hover:to-red-500 text-white px-3 py-2 min-h-[40px] transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg border border-red-400/30 hover:border-red-300/50"
                                                aria-label={`Remove ${player.name || 'player'}`}
                                                title="Remove player"
                                            >
                                                <span className="text-sm font-bold">×</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Player button below inputs */}
                        {players.length < 10 && (
                            <div className="mt-4 flex justify-start">
                                <button
                                    onClick={addPlayer}
                                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2 px-0 py-2"
                                >
                                    <span className="text-xs">+</span>
                                    <span>Add more</span>
                                </button>
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-dark-700/50">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>💡</span>
                                <span>Minimum 2, maximum 10 players</span>
                            </div>
                        </div>

                        {errors.players && (
                            <div className="text-red-400 text-xs mt-3 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.players}</span>
                            </div>
                        )}
                    </div>

                    {/* Compact Starting Chips */}
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 rounded-full flex items-center justify-center shadow-glow-gold">
                                <span className="text-lg">🃏</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Initial chip amount for each player</h2>

                            </div>
                        </div>

                        {/* Primary input field */}
                        <div className="mb-4">
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
                                placeholder="Enter starting chip amount"
                                min="100"
                                max="1000000"
                                step="50"
                                className={`input-field w-full text-center text-lg font-bold ${errors.startingChips ? 'border-red-500 ring-red-500' : 'border-poker-gold-500/30 focus:border-poker-gold-500/50'}`}
                            />
                        </div>

                        {/* Quick-fill preset buttons */}
                        <div className="mb-4">

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[500, 1000, 2000, 5000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => handleChipPresetClick(amount)}
                                        className={`relative overflow-hidden py-2 px-3 rounded-lg transition-all duration-300 text-sm font-semibold transform hover:scale-105 active:scale-100 ${startingChips === amount
                                            ? 'bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 text-dark-900 shadow-glow-gold border border-poker-gold-400'
                                            : 'bg-dark-800/60 hover:bg-dark-750/80 text-gray-300 border border-dark-600/50 hover:border-poker-gold-500/40'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            {startingChips === amount && (
                                                <span className="text-xs">✓</span>
                                            )}
                                            <span>${amount.toLocaleString()}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>



                        {errors.startingChips && (
                            <div className="text-red-400 text-xs mt-3 animate-slideDown flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{errors.startingChips}</span>
                            </div>
                        )}
                    </div>

                    {/* Compact Pre-Game Summary */}
                    {canStartGame && !hasErrors && (
                        <div className="card bg-gradient-to-br from-poker-green-900/20 to-dark-850/90 border-poker-green-500/30 animate-fadeIn shadow-glow" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-poker-green-500 to-poker-green-600 rounded-full flex items-center justify-center shadow-glow">
                                    <span className="text-lg">📋</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-poker-green-400">Ready to Start</h3>
                                    <p className="text-gray-400 text-xs">Review your game setup</p>
                                </div>
                            </div>

                            {/* Readable summary */}
                            <div className="bg-dark-800/40 rounded-lg p-4 mb-4 border border-dark-700/30">
                                <p className="text-sm text-gray-200 leading-relaxed text-center">
                                    You're setting up <span className="text-poker-gold font-semibold">{gameName}</span> for{' '}
                                    <span className="text-white font-semibold">{validPlayerCount} player{validPlayerCount !== 1 ? 's' : ''}</span> with{' '}
                                    <span className="text-poker-gold font-semibold">${startingChips.toLocaleString()}</span> in starting chips each.
                                </p>
                            </div>

                            {/* Detailed breakdown */}
                            <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-gray-300 mb-1">
                                        <span>🎮</span>
                                        <span>Game</span>
                                    </div>
                                    <div className="text-white font-semibold truncate">{gameName}</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-gray-300 mb-1">
                                        <span>👥</span>
                                        <span>Players</span>
                                    </div>
                                    <div className="text-white font-semibold">{validPlayerCount}</div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-gray-300 mb-1">
                                        <span>💰</span>
                                        <span>Total</span>
                                    </div>
                                    <div className="text-poker-gold font-semibold">${totalChips.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compact Start Game Button */}
                    <div className="animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                        <button
                            onClick={handleStartGame}
                            disabled={!canStartGame || isLoading}
                            className={`btn-primary w-full ${canStartGame && !isLoading ? 'success-glow' : ''
                                } ${isLoading ? 'loading' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Starting Game...</span>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    <span className="font-bold">Start Game</span>

                                </span>
                            )}
                        </button>

                        {hasErrors && (
                            <div className="text-center text-red-400 text-xs mt-4 animate-slideDown flex items-center justify-center gap-2">
                                <span>⚠️</span>
                                <span>Please fix the errors above to start the game</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameSetup; 