import React, { useState, useEffect } from 'react';
import BettingModal from './BettingModal';
import PotDistribution from './PotDistribution';

interface Player {
    id: string;
    name: string;
    chips: number;
    status: 'active' | 'folded' | 'all-in';
    currentBet: number;
}

interface GameInterfaceProps {
    gameName: string;
    initialPlayers: { id: string; name: string }[];
    startingChips: number;
    onBackToSetup: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
    gameName,
    initialPlayers,
    startingChips,
    onBackToSetup
}) => {
    const [players, setPlayers] = useState<Player[]>(
        initialPlayers.map(p => ({
            ...p,
            chips: startingChips,
            status: 'active' as const,
            currentBet: 0
        }))
    );
    const [pot, setPot] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);

    // Betting modal state
    const [bettingModalOpen, setBettingModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    // Pot distribution state
    const [potDistributionOpen, setPotDistributionOpen] = useState(false);

    // Save game state to localStorage
    useEffect(() => {
        const gameState = {
            gameName,
            players,
            pot,
            currentBet,
            timestamp: Date.now()
        };
        localStorage.setItem('currentGameState', JSON.stringify(gameState));
    }, [gameName, players, pot, currentBet]);

    const handleFold = (playerId: string) => {
        setPlayers(prev => prev.map(player =>
            player.id === playerId
                ? { ...player, status: 'folded' as const }
                : player
        ));
    };

    const handleCall = (playerId: string) => {
        setPlayers(prev => prev.map(player => {
            if (player.id === playerId) {
                const callAmount = Math.min(currentBet - player.currentBet, player.chips);
                const newChips = player.chips - callAmount;
                const newCurrentBet = player.currentBet + callAmount;

                setPot(prevPot => prevPot + callAmount);

                return {
                    ...player,
                    chips: newChips,
                    currentBet: newCurrentBet,
                    status: newChips === 0 ? 'all-in' as const : player.status
                };
            }
            return player;
        }));
    };

    const handleOpenBettingModal = (playerId: string) => {
        const player = players.find(p => p.id === playerId);
        if (player) {
            setSelectedPlayer(player);
            setBettingModalOpen(true);
        }
    };

    const handleConfirmBet = (betAmount: number) => {
        if (!selectedPlayer) return;

        setPlayers(prev => prev.map(player => {
            if (player.id === selectedPlayer.id) {
                const actualBet = Math.min(betAmount, player.chips);
                const newChips = player.chips - actualBet;
                const newCurrentBet = player.currentBet + actualBet;

                setPot(prevPot => prevPot + actualBet);

                // Update the current bet if this player raised
                if (newCurrentBet > currentBet) {
                    setCurrentBet(newCurrentBet);
                }

                return {
                    ...player,
                    chips: newChips,
                    currentBet: newCurrentBet,
                    status: newChips === 0 ? 'all-in' as const : player.status
                };
            }
            return player;
        }));

        setBettingModalOpen(false);
        setSelectedPlayer(null);
    };

    const handleCancelBet = () => {
        setBettingModalOpen(false);
        setSelectedPlayer(null);
    };

    const handleEndHand = () => {
        // Open pot distribution modal instead of immediately resetting
        if (pot > 0) {
            setPotDistributionOpen(true);
        } else {
            // If no pot, just reset for new hand
            handleNewHand();
        }
    };

    const handlePotDistribution = (winners: string[], distribution: { [playerId: string]: number }) => {
        // Update player chip counts with winnings
        setPlayers(prev => prev.map(player => ({
            ...player,
            chips: player.chips + (distribution[player.id] || 0),
            status: player.chips + (distribution[player.id] || 0) > 0 ? 'active' as const : 'folded' as const,
            currentBet: 0
        })));

        // Reset pot and current bet
        setPot(0);
        setCurrentBet(0);
        setPotDistributionOpen(false);
    };

    const handleCancelDistribution = () => {
        setPotDistributionOpen(false);
    };

    const handleNewHand = () => {
        setPlayers(prev => prev.map(player => ({
            ...player,
            status: player.chips > 0 ? 'active' as const : 'folded' as const,
            currentBet: 0
        })));
        setPot(0);
        setCurrentBet(0);
    };

    const getPlayerStatusColor = (status: Player['status']) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'folded': return 'text-red-400';
            case 'all-in': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getPlayerStatusText = (status: Player['status']) => {
        switch (status) {
            case 'active': return 'Active';
            case 'folded': return 'Folded';
            case 'all-in': return 'All-In';
            default: return 'Active';
        }
    };

    const activePlayers = players.filter(p => p.status === 'active').length;
    const totalChipsInPlay = players.reduce((sum, p) => sum + p.chips, 0) + pot;

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            {/* Header */}
            <div className="bg-dark-800 border-b border-dark-600 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBackToSetup}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Back to setup"
                    >
                        ← Back
                    </button>
                    <h1 className="text-lg font-semibold text-white truncate mx-4">{gameName}</h1>
                    <div className="text-gray-400 text-sm">
                        {activePlayers}/{players.length} active
                    </div>
                </div>
            </div>

            {/* Pot Display - Prominently Centered */}
            <div className="bg-gradient-to-b from-dark-800 to-dark-900 p-8 text-center border-b border-dark-600">
                <div className="mb-3">
                    <span className="text-gray-400 text-sm uppercase tracking-wide font-medium">Current Pot</span>
                </div>
                <div className="text-5xl font-bold text-poker-gold mb-3">
                    ${pot.toLocaleString()}
                </div>
                {currentBet > 0 && (
                    <div className="text-gray-300 text-base">
                        Current bet: ${currentBet.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Scrollable Players List */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="space-y-4">
                    {players.map((player) => (
                        <div key={player.id} className="card">
                            {/* Player Info */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-white font-bold text-xl">{player.name}</h3>
                                        <div className={`w-3 h-3 rounded-full ${player.status === 'active' ? 'bg-green-400' :
                                            player.status === 'folded' ? 'bg-red-400' : 'bg-yellow-400'
                                            }`}></div>
                                        <span className={`text-sm font-medium ${getPlayerStatusColor(player.status)}`}>
                                            {getPlayerStatusText(player.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-gray-300 text-lg">
                                            ${player.chips.toLocaleString()} chips
                                        </span>
                                        {player.currentBet > 0 && (
                                            <span className="text-poker-gold font-medium">
                                                Bet: ${player.currentBet.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {player.status === 'active' && player.chips > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleFold(player.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        Fold
                                    </button>

                                    <button
                                        onClick={() => handleCall(player.id)}
                                        disabled={currentBet <= player.currentBet}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        {currentBet === player.currentBet ? 'Check' :
                                            currentBet - player.currentBet >= player.chips ? 'All-In' :
                                                `Call $${(currentBet - player.currentBet).toLocaleString()}`}
                                    </button>

                                    <button
                                        onClick={() => handleOpenBettingModal(player.id)}
                                        disabled={player.chips <= (currentBet - player.currentBet)}
                                        className="bg-poker-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        Raise
                                    </button>
                                </div>
                            )}

                            {/* All-in indicator */}
                            {player.status === 'all-in' && (
                                <div className="text-center py-3">
                                    <span className="bg-yellow-600 text-yellow-100 px-4 py-2 rounded-full font-bold uppercase tracking-wide">
                                        ALL IN
                                    </span>
                                </div>
                            )}

                            {/* Folded indicator */}
                            {player.status === 'folded' && (
                                <div className="text-center py-3">
                                    <span className="bg-red-600 text-red-100 px-4 py-2 rounded-full font-bold uppercase tracking-wide">
                                        FOLDED
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section - End Hand / New Hand Button */}
            <div className="bg-dark-800 border-t border-dark-600 p-4">
                <button
                    onClick={handleEndHand}
                    className="btn-primary w-full"
                    disabled={pot === 0 && players.every(p => p.currentBet === 0)}
                >
                    {pot > 0 ? '🏆 End Hand & Distribute Pot' : '🃏 New Hand'}
                </button>

                {/* Game Stats */}
                <div className="text-center text-gray-400 text-sm mt-3">
                    Total chips in play: ${totalChipsInPlay.toLocaleString()}
                </div>
            </div>

            {/* Betting Modal */}
            <BettingModal
                isOpen={bettingModalOpen}
                playerName={selectedPlayer?.name || ''}
                playerChips={selectedPlayer?.chips || 0}
                currentBet={currentBet}
                playerCurrentBet={selectedPlayer?.currentBet || 0}
                potSize={pot}
                onConfirm={handleConfirmBet}
                onCancel={handleCancelBet}
            />

            {/* Pot Distribution Modal */}
            <PotDistribution
                isOpen={potDistributionOpen}
                players={players}
                potAmount={pot}
                onDistribute={handlePotDistribution}
                onCancel={handleCancelDistribution}
            />
        </div>
    );
};

export default GameInterface; 