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
    const [animatingChips, setAnimatingChips] = useState<string[]>([]);

    // Betting modal state
    const [bettingModalOpen, setBettingModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    // Pot distribution state
    const [potDistributionOpen, setPotDistributionOpen] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'all-in' | 'fold' | 'new-hand' | 'back-to-setup';
        playerId?: string;
        data?: any;
    }>({ isOpen: false, type: 'fold' });

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
    };

    const handleBackToSetup = () => {
        setConfirmDialog({
            isOpen: true,
            type: 'back-to-setup',
            data: {}
        });
    };

    const confirmBackToSetup = () => {
        onBackToSetup();
        setConfirmDialog({ isOpen: false, type: 'back-to-setup' });
    };

    const getPlayerStatusText = (status: Player['status']) => {
        switch (status) {
            case 'active': return '🟢 Active';
            case 'folded': return '🔴 Folded';
            case 'all-in': return '🟡 All-In';
            default: return 'Active';
        }
    };

    const activePlayers = players.filter(p => p.status === 'active').length;
    const totalChipsInPlay = players.reduce((sum, p) => sum + p.chips, 0) + pot;

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            {/* Header */}
            <div className="bg-dark-800 border-b border-dark-600 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={handleBackToSetup}
                        className="btn-secondary text-responsive-sm order-3 sm:order-1 w-full sm:w-auto"
                    >
                        ← Back to Setup
                    </button>
                    <h1 className="text-responsive-xl font-bold text-white truncate order-1 sm:order-2">{gameName}</h1>
                    <div className="text-gray-400 text-responsive-sm order-2 sm:order-3">
                        {activePlayers}/{players.length} active
                    </div>
                </div>
            </div>

            {/* Pot Display - Prominently Centered */}
            <div className={`bg-gradient-to-b from-dark-800 to-dark-900 p-6 md:p-8 text-center border-b border-dark-600 ${pot > 0 ? 'pot-grow' : ''}`}>
                <div className="mb-3">
                    <span className="text-gray-400 text-responsive-sm uppercase tracking-wide font-medium">Current Pot</span>
                </div>
                <div className="text-responsive-3xl font-bold text-poker-gold mb-3">
                    ${pot.toLocaleString()}
                </div>
                {currentBet > 0 && (
                    <div className="text-gray-300 text-responsive-base">
                        Current bet: ${currentBet.toLocaleString()}
                    </div>
                )}
            </div>

            {/* Scrollable Players List */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="space-y-3">
                    {players.map((player) => {
                        const isAnimating = animatingChips.includes(player.id);
                        const callAmount = currentBet - player.currentBet;
                        const canCall = callAmount > 0 && player.chips >= callAmount;
                        const canCheck = callAmount === 0;
                        const canRaise = player.chips > callAmount;

                        return (
                            <div key={player.id} className={`card-interactive ${player.status === 'folded' ? 'opacity-60' : ''
                                } ${isAnimating ? 'chip-pulse' : ''}`}>
                                {/* Player Info */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                            <h3 className="text-responsive-lg font-bold text-white truncate">{player.name}</h3>
                                            <div className={`inline-flex px-3 py-1 rounded-full text-responsive-xs font-medium ${player.status === 'active' ? 'bg-green-600 text-white' :
                                                player.status === 'all-in' ? 'bg-yellow-600 text-black' :
                                                    'bg-red-600 text-white'
                                                } ${player.status !== 'folded' ? 'status-change' : ''}`}>
                                                {getPlayerStatusText(player.status)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-responsive-sm">
                                            <span className="text-gray-300">
                                                Chips: <span className={`font-medium ${isAnimating ? 'text-poker-gold' : 'text-white'}`}>
                                                    ${player.chips.toLocaleString()}
                                                </span>
                                            </span>
                                            {player.currentBet > 0 && (
                                                <span className="text-gray-300">
                                                    Bet: <span className="text-poker-gold font-medium">
                                                        ${player.currentBet.toLocaleString()}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {player.status === 'active' && player.chips > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleFold(player.id)}
                                            className="btn-action bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
                                        >
                                            Fold
                                        </button>

                                        <button
                                            onClick={() => handleCall(player.id)}
                                            disabled={!canCall && !canCheck}
                                            className="btn-action bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
                                        >
                                            {canCheck ? 'Check' :
                                                callAmount >= player.chips ? '🚨 All-In' :
                                                    `Call $${callAmount.toLocaleString()}`}
                                        </button>

                                        <button
                                            onClick={() => handleOpenBettingModal(player.id)}
                                            disabled={!canRaise && callAmount >= player.chips}
                                            className="btn-action bg-poker-green hover:bg-green-600 active:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
                                        >
                                            {canRaise ? 'Raise' : 'All-In'}
                                        </button>
                                    </div>
                                )}

                                {/* Status Indicators */}
                                {player.status === 'all-in' && (
                                    <div className="text-center py-3 mt-4">
                                        <span className="bg-yellow-600 text-yellow-100 px-4 py-2 rounded-full font-bold uppercase tracking-wide text-responsive-xs">
                                            🟡 ALL IN
                                        </span>
                                    </div>
                                )}

                                {player.status === 'folded' && (
                                    <div className="text-center py-3 mt-4">
                                        <span className="bg-red-600 text-red-100 px-4 py-2 rounded-full font-bold uppercase tracking-wide text-responsive-xs">
                                            🔴 FOLDED
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-dark-800 border-t border-dark-600 p-4">
                <button
                    onClick={handleEndHand}
                    className={`btn-primary w-full ${pot > 0 ? 'animate-bounce-gentle' : ''}`}
                    disabled={pot === 0 && players.every(p => p.currentBet === 0)}
                >
                    {pot > 0 ? '🏆 End Hand & Distribute Pot' : '🃏 New Hand'}
                </button>

                <div className="text-center text-gray-400 text-responsive-xs mt-3">
                    Total chips in play: ${totalChipsInPlay.toLocaleString()}
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
                message={`${confirmDialog.data?.playerName} is going ALL-IN with $${confirmDialog.data?.amount?.toLocaleString()}! This will use all remaining chips.`}
                confirmText="🚨 Confirm All-In"
                cancelText="Cancel"
                confirmVariant="warning"
                onConfirm={() => confirmAllIn(confirmDialog.playerId!, confirmDialog.data?.amount)}
                onCancel={() => setConfirmDialog({ isOpen: false, type: 'all-in' })}
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'new-hand'}
                title="⚠️ Pot Not Distributed"
                message={`There's $${confirmDialog.data?.potAmount?.toLocaleString()} in the pot. Starting a new hand will reset all bets. Distribute the pot first?`}
                confirmText="Start New Hand Anyway"
                cancelText="Distribute Pot First"
                confirmVariant="warning"
                onConfirm={confirmNewHand}
                onCancel={() => {
                    setConfirmDialog({ isOpen: false, type: 'new-hand' });
                    setPotDistributionOpen(true);
                }}
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen && confirmDialog.type === 'back-to-setup'}
                title="Return to Game Setup"
                message="Are you sure you want to go back to setup? The current game will be saved and you can resume it later."
                confirmText="Yes, Back to Setup"
                cancelText="Stay in Game"
                confirmVariant="warning"
                onConfirm={confirmBackToSetup}
                onCancel={() => setConfirmDialog({ isOpen: false, type: 'back-to-setup' })}
            />
        </div>
    );
};

export default GameInterface; 