import React, { useState, useEffect } from 'react';
import BettingModal from './BettingModal';
import PotDistribution from './PotDistribution';
import ConfirmationDialog from './ConfirmationDialog';

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
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

type BettingRound = 'pre-flop' | 'flop' | 'turn' | 'river';

const GameInterface: React.FC<GameInterfaceProps> = ({
    gameName,
    initialPlayers,
    startingChips,
    onBackToSetup,
    showToast
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
    const [currentHand, setCurrentHand] = useState(1);
    const [currentRound, setCurrentRound] = useState<BettingRound>('pre-flop');
    const [animatingChips, setAnimatingChips] = useState<string[]>([]);

    // Betting modal state
    const [bettingModalOpen, setBettingModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    // Pot distribution state
    const [potDistributionOpen, setPotDistributionOpen] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'all-in' | 'fold' | 'new-hand' | 'next-round';
        playerId?: string;
        data?: any;
    }>({ isOpen: false, type: 'fold' });

    // Load saved game state including hand and round
    useEffect(() => {
        const savedGameState = localStorage.getItem('currentGameState');
        if (savedGameState) {
            try {
                const gameState = JSON.parse(savedGameState);
                if (gameState.currentHand && typeof gameState.currentHand === 'number') {
                    setCurrentHand(gameState.currentHand);
                }
                if (gameState.currentRound) {
                    setCurrentRound(gameState.currentRound);
                }
                if (gameState.players && Array.isArray(gameState.players)) {
                    // Ensure all player properties have valid default values
                    const validatedPlayers = gameState.players.map((player: any) => ({
                        id: player.id || '',
                        name: player.name || '',
                        chips: typeof player.chips === 'number' ? player.chips : startingChips,
                        status: player.status || 'active',
                        currentBet: typeof player.currentBet === 'number' ? player.currentBet : 0
                    }));
                    setPlayers(validatedPlayers);
                }
                if (gameState.pot !== undefined && typeof gameState.pot === 'number') {
                    setPot(gameState.pot);
                }
                if (gameState.currentBet !== undefined && typeof gameState.currentBet === 'number') {
                    setCurrentBet(gameState.currentBet);
                }
            } catch (error) {
                console.error('Error loading saved game state:', error);
                // Reset to initial state if loading fails
                setPlayers(initialPlayers.map(p => ({
                    ...p,
                    chips: startingChips,
                    status: 'active' as const,
                    currentBet: 0
                })));
                setPot(0);
                setCurrentBet(0);
                setCurrentHand(1);
                setCurrentRound('pre-flop');
            }
        }
    }, []);

    // Save game state to localStorage including hand and round
    useEffect(() => {
        const gameState = {
            gameName,
            players,
            pot,
            currentBet,
            currentHand,
            currentRound,
            timestamp: Date.now()
        };
        localStorage.setItem('currentGameState', JSON.stringify(gameState));
    }, [gameName, players, pot, currentBet, currentHand, currentRound]);

    const animateChipTransfer = (playerId: string) => {
        setAnimatingChips(prev => [...prev, playerId]);
        setTimeout(() => {
            setAnimatingChips(prev => prev.filter(id => id !== playerId));
        }, 800);
    };

    const handleFold = (playerId: string) => {
        const player = players.find(p => p.id === playerId);
        setConfirmDialog({
            isOpen: true,
            type: 'fold',
            playerId,
            data: { playerName: player?.name }
        });
    };

    const confirmFold = (playerId: string) => {
        setPlayers(prev => prev.map(player =>
            player.id === playerId
                ? { ...player, status: 'folded' as const }
                : player
        ));
        animateChipTransfer(playerId);
        setConfirmDialog({ isOpen: false, type: 'fold' });
    };

    const handleCall = (playerId: string) => {
        const player = players.find(p => p.id === playerId);
        if (!player) return;

        const callAmount = Math.min(currentBet - player.currentBet, player.chips);
        const newChips = player.chips - callAmount;
        const isAllIn = newChips === 0;

        if (isAllIn && callAmount > 0) {
            setConfirmDialog({
                isOpen: true,
                type: 'all-in',
                playerId,
                data: { playerName: player.name, amount: callAmount }
            });
            return;
        }

        executeCall(playerId, callAmount);
    };

    const executeCall = (playerId: string, callAmount: number) => {
        setPlayers(prev => prev.map(player => {
            if (player.id === playerId) {
                const newChips = player.chips - callAmount;
                const newCurrentBet = player.currentBet + callAmount;

                return {
                    ...player,
                    chips: newChips,
                    currentBet: newCurrentBet,
                    status: newChips === 0 ? 'all-in' as const : player.status
                };
            }
            return player;
        }));

        setPot(prevPot => prevPot + callAmount);
        animateChipTransfer(playerId);
    };

    const confirmAllIn = (playerId: string, amount: number) => {
        executeCall(playerId, amount);
        setConfirmDialog({ isOpen: false, type: 'all-in' });
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

        const actualBet = Math.min(betAmount, selectedPlayer.chips);
        const newChips = selectedPlayer.chips - actualBet;
        const newCurrentBet = selectedPlayer.currentBet + actualBet;

        setPlayers(prev => prev.map(player => {
            if (player.id === selectedPlayer.id) {
                return {
                    ...player,
                    chips: newChips,
                    currentBet: newCurrentBet,
                    status: newChips === 0 ? 'all-in' as const : player.status
                };
            }
            return player;
        }));

        setPot(prevPot => prevPot + actualBet);

        if (newCurrentBet > currentBet) {
            setCurrentBet(newCurrentBet);
        }

        animateChipTransfer(selectedPlayer.id);
        setBettingModalOpen(false);
        setSelectedPlayer(null);
    };

    const handleCancelBet = () => {
        setBettingModalOpen(false);
        setSelectedPlayer(null);
    };

    const handleNextRound = () => {
        const roundOrder: BettingRound[] = ['pre-flop', 'flop', 'turn', 'river'];
        const currentIndex = roundOrder.indexOf(currentRound);

        if (currentIndex < roundOrder.length - 1) {
            // Move to next betting round
            setConfirmDialog({
                isOpen: true,
                type: 'next-round',
                data: {
                    currentRound: currentRound,
                    nextRound: roundOrder[currentIndex + 1]
                }
            });
        } else {
            // End of hand, go to pot distribution
            handleEndHand();
        }
    };

    const confirmNextRound = () => {
        const roundOrder: BettingRound[] = ['pre-flop', 'flop', 'turn', 'river'];
        const currentIndex = roundOrder.indexOf(currentRound);

        if (currentIndex < roundOrder.length - 1) {
            setCurrentRound(roundOrder[currentIndex + 1]);
            // Reset current bets for new round but keep pot
            setPlayers(prev => prev.map(player => ({
                ...player,
                currentBet: 0
            })));
            setCurrentBet(0);
        }
        setConfirmDialog({ isOpen: false, type: 'next-round' });
    };

    const handleEndHand = () => {
        if (pot > 0) {
            setConfirmDialog({
                isOpen: true,
                type: 'new-hand',
                data: { potAmount: pot }
            });
        } else {
            handleNewHand();
        }
    };

    const confirmNewHand = () => {
        setPotDistributionOpen(true);
        setConfirmDialog({ isOpen: false, type: 'new-hand' });
    };

    const handlePotDistribution = (winners: string[], distribution: { [playerId: string]: number }) => {
        setPlayers(prev => prev.map(player => ({
            ...player,
            chips: player.chips + (distribution[player.id] || 0),
            status: player.chips + (distribution[player.id] || 0) > 0 ? 'active' as const : 'folded' as const,
            currentBet: 0
        })));

        // Animate all winners
        winners.forEach(winnerId => animateChipTransfer(winnerId));

        setPot(0);
        setCurrentBet(0);
        setPotDistributionOpen(false);

        // Auto-start new hand after distribution
        setTimeout(() => {
            handleNewHand();
        }, 1200);
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
        setCurrentHand(prev => prev + 1);
        setCurrentRound('pre-flop');
    };

    const handleBackToSetup = () => {
        showToast('Game progress saved', 'success');
        onBackToSetup();
    };

    const getPlayerStatusText = (status: Player['status']) => {
        switch (status) {
            case 'active': return '🟢 Active';
            case 'folded': return '🔴 Folded';
            case 'all-in': return '🟡 All-In';
            default: return 'Active';
        }
    };

    const getRoundDisplayName = (round: BettingRound) => {
        switch (round) {
            case 'pre-flop': return 'Pre-Flop';
            case 'flop': return 'Flop';
            case 'turn': return 'Turn';
            case 'river': return 'River';
        }
    };

    const getRoundEmoji = (round: BettingRound) => {
        switch (round) {
            case 'pre-flop': return '🃏';
            case 'flop': return '🎯';
            case 'turn': return '🔄';
            case 'river': return '🏁';
        }
    };

    const getNextActionText = () => {
        const roundOrder: BettingRound[] = ['pre-flop', 'flop', 'turn', 'river'];
        const currentIndex = roundOrder.indexOf(currentRound);

        if (currentIndex < roundOrder.length - 1) {
            const nextRound = roundOrder[currentIndex + 1];
            return `Next: ${getRoundDisplayName(nextRound)} ${getRoundEmoji(nextRound)}`;
        } else {
            return `End Hand ${currentHand} & Distribute Pot 🏆`;
        }
    };

    const activePlayers = players.filter(p => p.status === 'active').length;
    const totalChipsInPlay = players.reduce((sum, p) => sum + (p.chips || 0), 0) + (pot || 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
            {/* Header */}
            <div className="bg-dark-850/90 backdrop-blur-lg border-b border-dark-700/50 p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToSetup}
                        className="btn-secondary text-responsive-sm order-3 sm:order-1 w-full sm:w-auto"
                    >
                        ← Back to Setup
                    </button>
                    <div className="text-center order-1 sm:order-2">
                        <h1 className="text-responsive-xl font-bold text-white truncate mb-1">{gameName}</h1>
                        <div className="flex items-center justify-center gap-4 text-responsive-sm">
                            <div className="text-poker-gold font-medium">
                                Hand #{currentHand}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{getRoundEmoji(currentRound)}</span>
                                <span className="text-accent-purple font-semibold">
                                    {getRoundDisplayName(currentRound)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center order-2 sm:order-3">
                        <div className="text-gray-300 text-responsive-sm">
                            {activePlayers}/{players.length} active
                        </div>
                        <div className="text-2xs text-gray-500">
                            ${totalChipsInPlay.toLocaleString()} total
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Pot Display with Hand and Round Info */}
            <div className={`pot-display mx-4 mt-6 text-center ${pot > 0 ? 'pot-grow animate-pulse-glow' : ''}`}>
                <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="text-center">
                        <span className="text-gray-400 text-responsive-xs uppercase tracking-wider font-medium block">Hand</span>
                        <div className="text-responsive-lg font-bold text-poker-gold mt-1">
                            #{currentHand}
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-dark-600 to-transparent"></div>
                    <div className="text-center">
                        <span className="text-gray-400 text-responsive-xs uppercase tracking-wider font-medium block">Round</span>
                        <div className="text-responsive-base font-bold text-accent-purple mt-1 flex items-center gap-2">
                            <span>{getRoundEmoji(currentRound)}</span>
                            <span>{getRoundDisplayName(currentRound)}</span>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-dark-600 to-transparent"></div>
                    <div className="text-center flex-1">
                        <span className="text-gray-400 text-responsive-sm uppercase tracking-wider font-medium block">Current Pot</span>
                        <div className="text-responsive-3xl font-bold text-poker-gold mt-1 animate-float">
                            ${(pot || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-dark-600 to-transparent"></div>
                    <div className="text-center">
                        <span className="text-gray-400 text-responsive-xs uppercase tracking-wider font-medium block">Players</span>
                        <div className="text-responsive-lg font-bold text-gray-300 mt-1">
                            {activePlayers}
                        </div>
                    </div>
                </div>
                {currentBet > 0 && (
                    <div className="flex items-center justify-center gap-2 text-gray-300 text-responsive-base">
                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
                        <span>Current bet: ${(currentBet || 0).toLocaleString()}</span>
                        <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
                    </div>
                )}
            </div>

            {/* Scrollable Players List */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-4xl mx-auto space-y-4">
                    {players.map((player, index) => {
                        const isAnimating = animatingChips.includes(player.id);
                        const callAmount = (currentBet || 0) - (player.currentBet || 0);
                        const canCall = callAmount > 0 && (player.chips || 0) >= callAmount;
                        const canCheck = callAmount === 0;
                        const canRaise = (player.chips || 0) > callAmount;

                        return (
                            <div
                                key={player.id}
                                className={`card-interactive ${player.status === 'folded' ? 'opacity-60' : ''
                                    } ${isAnimating ? 'chip-pulse' : ''}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Player Info */}
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                            <h3 className="text-responsive-lg font-bold text-white truncate">
                                                {player.name}
                                            </h3>
                                            <div className={`inline-flex px-3 py-1.5 rounded-full text-responsive-xs font-semibold ${player.status === 'active' ? 'status-badge-active' :
                                                player.status === 'all-in' ? 'status-badge-allin' :
                                                    'status-badge-folded'
                                                } ${player.status !== 'folded' ? 'status-change' : ''}`}>
                                                {getPlayerStatusText(player.status)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-responsive-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-accent-emerald rounded-full"></div>
                                                <span className="text-gray-300">Chips:</span>
                                                <span className={`font-semibold ${isAnimating ? 'text-poker-gold animate-pulse' : 'text-white'}`}>
                                                    ${(player.chips || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            {(player.currentBet || 0) > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-poker-gold-500 rounded-full"></div>
                                                    <span className="text-gray-300">Bet:</span>
                                                    <span className="text-poker-gold font-semibold">
                                                        ${(player.currentBet || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {player.status === 'active' && (player.chips || 0) > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleFold(player.id)}
                                            className="btn-action bg-gradient-to-r from-poker-red-500 to-poker-red-600 hover:from-poker-red-400 hover:to-poker-red-500 text-white border border-poker-red-400/30"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <span>🃏</span>
                                                <span>Fold</span>
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleCall(player.id)}
                                            disabled={!canCall && !canCheck}
                                            className="btn-action bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white border border-blue-400/30 disabled:border-gray-600/30"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <span>{canCheck ? '✋' : callAmount >= (player.chips || 0) ? '🚨' : '💰'}</span>
                                                <span>
                                                    {canCheck ? 'Check' :
                                                        callAmount >= (player.chips || 0) ? 'All-In' :
                                                            `Call $${(callAmount || 0).toLocaleString()}`}
                                                </span>
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handleOpenBettingModal(player.id)}
                                            disabled={!canRaise && callAmount >= (player.chips || 0)}
                                            className="btn-action bg-gradient-to-r from-poker-green-500 to-poker-green-600 hover:from-poker-green-400 hover:to-poker-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white border border-poker-green-400/30 disabled:border-gray-600/30"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <span>{canRaise ? '📈' : '🎯'}</span>
                                                <span>{canRaise ? 'Raise' : 'All-In'}</span>
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {/* Status Indicators */}
                                {player.status === 'all-in' && (
                                    <div className="text-center py-4 mt-4">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 text-dark-900 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-responsive-sm shadow-glow-gold">
                                            <span>🎯</span>
                                            <span>ALL IN</span>
                                            <span>🎯</span>
                                        </div>
                                    </div>
                                )}

                                {player.status === 'folded' && (
                                    <div className="text-center py-4 mt-4">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-responsive-sm">
                                            <span>🃏</span>
                                            <span>FOLDED</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fixed Bottom Action Panel */}
            <div className="fixed bottom-0 left-0 right-0 bg-dark-850/95 backdrop-blur-lg border-t border-dark-700/50 p-4 shadow-2xl">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleNextRound}
                        className={`btn-primary w-full ${pot > 0 || currentRound === 'river' ? 'animate-bounce-gentle success-glow' : ''}`}
                        disabled={pot === 0 && players.every(p => p.currentBet === 0) && currentRound === 'pre-flop'}
                    >
                        <span className="flex items-center justify-center gap-3">
                            <span className="text-xl">
                                {currentRound === 'river' ? '🏆' : '▶️'}
                            </span>
                            <span>
                                {getNextActionText()}
                            </span>
                            <span className="text-xl">
                                {currentRound === 'river' ? '🏆' : '▶️'}
                            </span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Modals */}
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

            <PotDistribution
                isOpen={potDistributionOpen}
                players={players}
                potAmount={pot}
                onDistribute={handlePotDistribution}
                onCancel={handleCancelDistribution}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'fold'}
                title="Confirm Fold"
                message={`Are you sure ${confirmDialog.data?.playerName} wants to fold? This action cannot be undone.`}
                confirmText="Yes, Fold"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={() => confirmFold(confirmDialog.playerId!)}
                onCancel={() => setConfirmDialog({ isOpen: false, type: 'fold' })}
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'all-in'}
                title="⚠️ All-In Confirmation"
                message={`${confirmDialog.data?.playerName} is going ALL-IN with $${(confirmDialog.data?.amount || 0).toLocaleString()}! This will use all remaining chips.`}
                confirmText="🚨 Confirm All-In"
                cancelText="Cancel"
                confirmVariant="warning"
                onConfirm={() => confirmAllIn(confirmDialog.playerId!, confirmDialog.data?.amount || 0)}
                onCancel={() => setConfirmDialog({ isOpen: false, type: 'all-in' })}
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'next-round'}
                title={`Advance to ${getRoundDisplayName(confirmDialog.data?.nextRound)} ${getRoundEmoji(confirmDialog.data?.nextRound)}`}
                message={`Ready to move from ${getRoundDisplayName(confirmDialog.data?.currentRound)} to ${getRoundDisplayName(confirmDialog.data?.nextRound)}? Current bets will be reset for the new betting round.`}
                confirmText={`Yes, ${getRoundDisplayName(confirmDialog.data?.nextRound)}`}
                cancelText="Stay Here"
                confirmVariant="success"
                onConfirm={confirmNextRound}
                onCancel={() => setConfirmDialog({ isOpen: false, type: 'next-round' })}
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'new-hand'}
                title="⚠️ Pot Not Distributed"
                message={`There's $${(confirmDialog.data?.potAmount || 0).toLocaleString()} in the pot. Starting hand ${currentHand + 1} will reset everything. Distribute the pot first?`}
                confirmText={`Start Hand ${currentHand + 1} Anyway`}
                cancelText="Distribute Pot First"
                confirmVariant="warning"
                onConfirm={confirmNewHand}
                onCancel={() => {
                    setConfirmDialog({ isOpen: false, type: 'new-hand' });
                    setPotDistributionOpen(true);
                }}
            />
        </div>
    );
};

export default GameInterface; 