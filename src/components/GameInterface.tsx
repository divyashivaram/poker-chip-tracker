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
    totalCommitted?: number; // Total amount committed to pot this hand (across all rounds)
    position?: 'dealer' | 'small-blind' | 'big-blind';
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
            currentBet: 0,
            totalCommitted: 0
        }))
    );
    const [pot, setPot] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [currentHand, setCurrentHand] = useState(1);
    const [currentRound, setCurrentRound] = useState<BettingRound>('pre-flop');
    const [animatingChips, setAnimatingChips] = useState<string[]>([]);

    // Turn management state
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playersWhoHaveActed, setPlayersWhoHaveActed] = useState<Set<string>>(new Set());

    // Position management state
    const [dealerIndex, setDealerIndex] = useState(0);
    const [showPositionSettings, setShowPositionSettings] = useState(false);

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

    // Helper function to get the next active player index
    const getNextActivePlayerIndex = (startIndex: number = currentPlayerIndex): number => {
        const activePlayers = players.filter(p => p.status === 'active');
        if (activePlayers.length === 0) return 0;

        let nextIndex = (startIndex + 1) % players.length;
        let attempts = 0;

        while (attempts < players.length) {
            const player = players[nextIndex];
            if (player && player.status === 'active') {
                return nextIndex;
            }
            nextIndex = (nextIndex + 1) % players.length;
            attempts++;
        }

        return startIndex; // Fallback to current if no active player found
    };

    // Function to advance to next player's turn
    const advanceToNextPlayer = () => {
        const nextIndex = getNextActivePlayerIndex();
        setCurrentPlayerIndex(nextIndex);
    };



    // Function to move dealer button to next player
    const advanceDealerButton = () => {
        const eligiblePlayers = players.filter(p => p.status === 'active' || p.chips > 0);
        if (eligiblePlayers.length < 2) return;

        let nextDealerIndex = (dealerIndex + 1) % players.length;
        // Find next eligible player for dealer position
        // eslint-disable-next-line no-loop-func
        while (!eligiblePlayers.some(p => p.id === players[nextDealerIndex].id)) {
            nextDealerIndex = (nextDealerIndex + 1) % players.length;
        }

        setDealerIndex(nextDealerIndex);
        return nextDealerIndex;
    };

    // Load saved game state including hand and round
    useEffect(() => {
        const savedGameState = localStorage.getItem('currentGameState');
        if (savedGameState) {
            try {
                const gameState = JSON.parse(savedGameState);

                // Prioritize saved game state over initial props when resuming
                if (gameState.currentHand && typeof gameState.currentHand === 'number') {
                    setCurrentHand(gameState.currentHand);
                }
                if (gameState.currentRound) {
                    setCurrentRound(gameState.currentRound);
                }
                if (gameState.currentPlayerIndex !== undefined && typeof gameState.currentPlayerIndex === 'number') {
                    setCurrentPlayerIndex(gameState.currentPlayerIndex);
                }
                if (gameState.playersWhoHaveActed && Array.isArray(gameState.playersWhoHaveActed)) {
                    setPlayersWhoHaveActed(new Set(gameState.playersWhoHaveActed));
                }
                if (gameState.dealerIndex !== undefined && typeof gameState.dealerIndex === 'number') {
                    setDealerIndex(gameState.dealerIndex);
                }
                if (gameState.players && Array.isArray(gameState.players) && gameState.players.length > 0) {
                    // Use saved players with their actual game state
                    const validatedPlayers = gameState.players.map((player: any) => {
                        return {
                            id: player.id || '',
                            name: player.name || '',
                            chips: typeof player.chips === 'number' && player.chips >= 0 ? player.chips : startingChips,
                            status: ['active', 'folded', 'all-in'].includes(player.status) ? player.status : 'active',
                            currentBet: typeof player.currentBet === 'number' && player.currentBet >= 0 ? player.currentBet : 0,
                            totalCommitted: typeof player.totalCommitted === 'number' && player.totalCommitted >= 0 ? player.totalCommitted : 0,
                            position: player.position
                        };
                    });
                    setPlayers(validatedPlayers);
                } else {
                    // Fallback to initial players if saved players are invalid
                    setPlayers(initialPlayers.map(p => ({
                        ...p,
                        chips: startingChips,
                        status: 'active' as const,
                        currentBet: 0,
                        totalCommitted: 0
                    })));
                }
                if (gameState.pot !== undefined && typeof gameState.pot === 'number' && gameState.pot >= 0) {
                    setPot(gameState.pot);
                }
                if (gameState.currentBet !== undefined && typeof gameState.currentBet === 'number' && gameState.currentBet >= 0) {
                    setCurrentBet(gameState.currentBet);
                }
            } catch (error) {
                console.error('Error loading saved game state:', error);
                // Reset to initial state if loading fails
                setPlayers(initialPlayers.map(p => ({
                    ...p,
                    chips: startingChips,
                    status: 'active' as const,
                    currentBet: 0,
                    totalCommitted: 0
                })));
                setPot(0);
                setCurrentBet(0);
                setCurrentHand(1);
                setCurrentRound('pre-flop');
                setCurrentPlayerIndex(0);
                setPlayersWhoHaveActed(new Set());
            }
        } else {
            // No saved state, initialize with starting values
            setPlayers(initialPlayers.map(p => ({
                ...p,
                chips: startingChips,
                status: 'active' as const,
                currentBet: 0,
                totalCommitted: 0
            })));
        }
    }, [initialPlayers, startingChips]);

    // Apply positions when dealer changes
    useEffect(() => {
        setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            // Clear all positions first
            updatedPlayers.forEach(player => {
                delete player.position;
            });

            // Apply new positions
            const eligiblePlayers = updatedPlayers.filter(p => p.status === 'active' || p.chips > 0);
            if (eligiblePlayers.length >= 2) {
                // Set dealer
                if (updatedPlayers[dealerIndex]) {
                    updatedPlayers[dealerIndex].position = 'dealer';
                }

                if (eligiblePlayers.length === 2) {
                    // Heads-up: other player is big blind
                    const otherPlayerIndex = updatedPlayers.findIndex((p, i) =>
                        i !== dealerIndex && eligiblePlayers.includes(p)
                    );
                    if (otherPlayerIndex !== -1) {
                        updatedPlayers[otherPlayerIndex].position = 'big-blind';
                    }
                } else {
                    // Multi-player: assign SB and BB
                    const smallBlindIndex = (dealerIndex + 1) % updatedPlayers.length;
                    const bigBlindIndex = (dealerIndex + 2) % updatedPlayers.length;

                    if (updatedPlayers[smallBlindIndex] && eligiblePlayers.includes(updatedPlayers[smallBlindIndex])) {
                        updatedPlayers[smallBlindIndex].position = 'small-blind';
                    }
                    if (updatedPlayers[bigBlindIndex] && eligiblePlayers.includes(updatedPlayers[bigBlindIndex])) {
                        updatedPlayers[bigBlindIndex].position = 'big-blind';
                    }
                }
            }

            return updatedPlayers;
        });
    }, [dealerIndex]); // Only run when dealerIndex changes

    // Save game state to localStorage including hand and round
    useEffect(() => {
        const gameState = {
            gameName,
            players,
            pot,
            currentBet,
            currentHand,
            currentRound,
            currentPlayerIndex,
            dealerIndex,
            playersWhoHaveActed: Array.from(playersWhoHaveActed),
            timestamp: Date.now()
        };
        localStorage.setItem('currentGameState', JSON.stringify(gameState));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameName, players, pot, currentBet, currentHand, currentRound, currentPlayerIndex, dealerIndex]);

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
        // Mark player as having acted
        setPlayersWhoHaveActed(prev => new Set(prev).add(playerId));
        // Advance to next player after fold
        advanceToNextPlayer();
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
                    totalCommitted: (player.totalCommitted || 0) + callAmount,
                    status: newChips === 0 ? 'all-in' as const : player.status
                };
            }
            return player;
        }));

        setPot(prevPot => prevPot + callAmount);
        animateChipTransfer(playerId);
        // Mark player as having acted
        setPlayersWhoHaveActed(prev => new Set(prev).add(playerId));
        // Advance to next player after call
        advanceToNextPlayer();
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
                    totalCommitted: (player.totalCommitted || 0) + actualBet,
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
        // Mark player as having acted
        setPlayersWhoHaveActed(prev => new Set(prev).add(selectedPlayer.id));
        // Advance to next player after bet
        advanceToNextPlayer();
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
            // Reset players who have acted for new round
            setPlayersWhoHaveActed(new Set());
            // Reset to first active player for new round
            setCurrentPlayerIndex(0);
            const firstActiveIndex = players.findIndex(p => p.status === 'active');
            if (firstActiveIndex !== -1) {
                setCurrentPlayerIndex(firstActiveIndex);
            }
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
            currentBet: 0,
            totalCommitted: 0
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
        // Advance dealer button to next player
        const nextDealerIndex = advanceDealerButton() ?? dealerIndex;

        setPlayers(prev => prev.map(player => ({
            ...player,
            status: player.chips > 0 ? 'active' as const : 'folded' as const,
            currentBet: 0,
            totalCommitted: 0
        })));

        setPot(0);
        setCurrentBet(0);
        setCurrentHand(prev => prev + 1);
        setCurrentRound('pre-flop');
        // Reset players who have acted for new hand
        setPlayersWhoHaveActed(new Set());
        // Reset to first active player for new hand (small blind typically starts)
        const smallBlindIndex = (nextDealerIndex + 1) % players.length;
        setCurrentPlayerIndex(smallBlindIndex);
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
            return `Next: ${getRoundDisplayName(nextRound)}`;
        } else {
            return `End Hand ${currentHand} & Distribute Pot`;
        }
    };

    // Check if betting round is complete
    const isBettingRoundComplete = () => {
        const activePlayers = players.filter(p => p.status === 'active');
        const allInPlayers = players.filter(p => p.status === 'all-in');

        // If only 0 or 1 active players, betting is complete
        if (activePlayers.length <= 1) {
            return true;
        }

        // Check if all active players have had a chance to act
        const allActivePlayersHaveActed = activePlayers.every(player =>
            playersWhoHaveActed.has(player.id)
        );

        // If not all players have acted yet, betting is not complete
        if (!allActivePlayersHaveActed) {
            return false;
        }

        // If all players have acted, check if betting is equalized
        if (currentBet === 0) {
            // Everyone checked - betting is complete
            return true;
        } else {
            // There's a bet - check if all active players have called it
            const allActivePlayersHaveCalled = activePlayers.every(player => {
                return player.currentBet === currentBet;
            });

            // Also check all-in players have called as much as they could
            const allInPlayersHaveCalledWhatTheyCanOrAllIn = allInPlayers.every(player => {
                return player.currentBet === currentBet || player.chips === 0;
            });

            return allActivePlayersHaveCalled && allInPlayersHaveCalledWhatTheyCanOrAllIn;
        }
    };

    const activePlayers = players.filter(p => p.status === 'active').length;
    const currentPlayer = players[currentPlayerIndex];
    const bettingComplete = isBettingRoundComplete();

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
            {/* Header */}
            <div className="bg-dark-850/90 backdrop-blur-lg border-b border-dark-700/50 p-4 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={handleBackToSetup}
                        className="btn-action bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        ← Back to Setup
                    </button>
                    <div className="text-center order-1 sm:order-2 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            {gameName}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <span>🃏</span>
                                <span>Hand #{currentHand}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>{getRoundEmoji(currentRound)}</span>
                                <span>{getRoundDisplayName(currentRound)}</span>
                            </div>
                        </div>
                        {/* Current Player Indicator */}
                        {bettingComplete ? (
                            <div className="mt-3 flex flex-col items-center justify-center gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                                    <span className="text-slate-400 font-semibold text-sm">
                                        Betting Round Complete
                                    </span>
                                    <div className="w-3 h-3 bg-slate-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    All players have acted - ready to advance to next round
                                </div>
                            </div>
                        ) : currentPlayer && currentPlayer.status === 'active' ? (
                            <div className="mt-3 flex flex-col items-center justify-center gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-poker-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-poker-green-400 font-semibold text-sm">
                                        {currentPlayer.name}'s Turn
                                    </span>
                                    <div className="w-3 h-3 bg-poker-green-500 rounded-full animate-pulse"></div>
                                </div>
                                {/* Betting Action Context */}
                                <div className="text-xs text-gray-400">
                                    {currentBet === 0 ?
                                        'No bets placed - can Check or Bet' :
                                        `Current bet: $${currentBet.toLocaleString()} - must Call or Raise`
                                    }
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="order-2 sm:order-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowPositionSettings(true)}
                            className="btn-action bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 mx-auto sm:mx-0"
                        >
                            <span>🎯</span>
                            <span>Positions</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Pot Display with Hand and Round Info */}
            <div className={`pot-display mx-4 mt-6 text-center ${pot > 0 ? 'pot-grow animate-pulse-glow' : ''}`}>
                <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-lg">🃏</span>
                            <span className="text-gray-300 text-xs uppercase tracking-wider font-medium">Hand</span>
                        </div>
                        <div className="text-lg font-bold text-poker-gold">
                            #{currentHand}
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-dark-600 to-transparent"></div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-lg">{getRoundEmoji(currentRound)}</span>
                            <span className="text-gray-300 text-xs uppercase tracking-wider font-medium">Round</span>
                        </div>
                        <div className="text-lg font-bold text-poker-gold">
                            {getRoundDisplayName(currentRound)}
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-dark-600 to-transparent"></div>
                    <div className="text-center flex-1">
                        <span className="text-gray-300 text-sm uppercase tracking-wider font-medium block mb-2">Current Pot</span>
                        <div className="text-3xl md:text-4xl font-bold text-poker-gold animate-float">
                            ${(pot || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-dark-600 to-transparent"></div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-lg">👥</span>
                            <span className="text-gray-300 text-xs uppercase tracking-wider font-medium">Players</span>
                        </div>
                        <div className="text-lg font-bold text-poker-gold">
                            {activePlayers}/{players.length}
                        </div>
                    </div>
                </div>
                {currentBet > 0 && (
                    <div className="flex items-center justify-center gap-2 text-gray-300 text-sm">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                        <span>Current bet: ${(currentBet || 0).toLocaleString()}</span>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                    </div>
                )}
            </div>

            {/* Scrollable Players List */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-4xl mx-auto space-y-4">
                    {players.map((player, index) => {
                        const isAnimating = animatingChips.includes(player.id);
                        const callAmount = Math.max(0, (currentBet || 0) - (player.currentBet || 0));
                        const canCheck = callAmount === 0; // Can check if no bet to call
                        const canCall = callAmount > 0 && (player.chips || 0) >= callAmount;
                        const canRaise = (player.chips || 0) > callAmount;
                        const isCurrentPlayer = currentPlayerIndex === index && player.status === 'active';
                        const isWaitingPlayer = !isCurrentPlayer && player.status === 'active';

                        // Determine the action text and icon for the middle button
                        const getCheckCallAction = () => {
                            if (canCheck) {
                                return { text: 'Check', icon: '✋', disabled: false };
                            } else if (callAmount >= (player.chips || 0)) {
                                return { text: 'All-In', icon: '🚨', disabled: false };
                            } else if (canCall) {
                                return { text: `Call $${callAmount.toLocaleString()}`, icon: '💰', disabled: false };
                            } else {
                                return { text: 'Call', icon: '💰', disabled: true };
                            }
                        };

                        const checkCallAction = getCheckCallAction();

                        return (
                            <div
                                key={player.id}
                                className={`card-interactive relative transition-all duration-500 ${player.status === 'folded' ? 'opacity-30' :
                                    isWaitingPlayer ? 'opacity-60 scale-[0.98]' : ''
                                    } ${isAnimating ? 'chip-pulse' : ''} ${isCurrentPlayer ?
                                        'border-2 border-poker-green-500 transform scale-[1.02] bg-gradient-to-br from-poker-green-500/5 to-dark-850/90' :
                                        ''
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Player Info */}
                                {isCurrentPlayer && (
                                    <div className="mb-4">
                                        <div className="bg-gradient-to-r from-poker-green-500 to-poker-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                            <span>▶️</span>
                                            <span>Your Turn</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                            <h3 className="text-responsive-lg font-bold text-white truncate">
                                                {player.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Position Badge */}
                                                {player.position && (
                                                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${player.position === 'dealer'
                                                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/40'
                                                        : player.position === 'small-blind'
                                                            ? 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-400 border border-slate-500/40'
                                                            : 'bg-gradient-to-r from-gray-700/20 to-gray-800/20 text-gray-500 border border-gray-700/40'
                                                        }`}>
                                                        {player.position === 'dealer' ? '🎯 DEALER' :
                                                            player.position === 'small-blind' ? 'SB' : 'BB'}
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className={`inline-flex px-3 py-1.5 rounded-full text-responsive-xs font-semibold ${player.status === 'active' ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/40' :
                                                    player.status === 'all-in' ? 'bg-gradient-to-r from-poker-gold-500/20 to-poker-gold-600/20 text-poker-gold-400 border border-poker-gold-500/40' :
                                                        'bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-400 border border-gray-600/40'
                                                    }`}>
                                                    {getPlayerStatusText(player.status)}
                                                </div>
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
                                                    <div className="w-3 h-3 bg-poker-gold-500 rounded-full animate-pulse"></div>
                                                    <span className="text-gray-300">Current Bet:</span>
                                                    <span className="text-poker-gold font-bold">
                                                        ${(player.currentBet || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {isCurrentPlayer && player.status === 'active' && (player.chips || 0) > 0 && !bettingComplete && (
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
                                            disabled={checkCallAction.disabled}
                                            className={`btn-action transition-all duration-200 ${checkCallAction.disabled
                                                ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed text-white border border-gray-600/30'
                                                : canCheck
                                                    ? 'bg-gradient-to-r from-accent-teal to-teal-600 hover:from-teal-500 hover:to-teal-600 text-white border border-teal-400/30'
                                                    : 'bg-gradient-to-r from-accent-blue to-slate-600 hover:from-slate-400 hover:to-slate-500 text-white border border-slate-400/30'
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="text-lg">{checkCallAction.icon}</span>
                                                <span className="font-semibold">{checkCallAction.text}</span>
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

                                {/* Current Bet Indicator - Only show if there's a contribution */}
                                {player.status === 'active' && (player.totalCommitted || 0) > 0 && (
                                    <div className="flex justify-center mt-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-poker-gold-500/20 to-poker-gold-600/20 border border-poker-gold-500/40 text-poker-gold-400">
                                            <span className="text-sm">🔘</span>
                                            <span className="font-semibold text-sm">
                                                In for: ${(player.totalCommitted || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Betting Complete Indicator for Active Players */}
                                {player.status === 'active' && (player.chips || 0) > 0 && bettingComplete && (
                                    <div className="text-center py-4 mt-4">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-600/20 to-slate-700/20 text-slate-400 px-6 py-3 rounded-full border border-slate-600/40 text-responsive-sm">
                                            <span>✅</span>
                                            <span>Betting complete - waiting for next round</span>
                                        </div>
                                    </div>
                                )}

                                {/* Waiting Player Indicator */}
                                {isWaitingPlayer && !bettingComplete && (
                                    <div className="text-center py-4 mt-4">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-400 px-6 py-3 rounded-full border border-gray-600/40 text-responsive-sm">
                                            <span>⏳</span>
                                            <span>Waiting for turn</span>
                                        </div>
                                    </div>
                                )}

                                {/* Status Indicators with Bet Information */}
                                {player.status === 'all-in' && (
                                    <div className="text-center py-4 mt-4 space-y-3">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 text-dark-900 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-responsive-sm shadow-glow-gold">
                                            <span>🎯</span>
                                            <span>ALL IN</span>
                                            <span>🎯</span>
                                        </div>
                                        {(player.totalCommitted || 0) > 0 && (
                                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-poker-gold-500/20 to-poker-gold-600/20 border border-poker-gold-500/40 text-poker-gold-400 px-4 py-2 rounded-full">
                                                <span>💰</span>
                                                <span className="font-semibold text-sm">
                                                    ${(player.totalCommitted || 0).toLocaleString()} total committed
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {player.status === 'folded' && (
                                    <div className="text-center py-4 mt-4 space-y-3">
                                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-responsive-sm">
                                            <span>🃏</span>
                                            <span>FOLDED</span>
                                        </div>
                                        {(player.totalCommitted || 0) > 0 && (
                                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/20 to-gray-700/20 border border-gray-600/40 text-gray-400 px-4 py-2 rounded-full">
                                                <span>💸</span>
                                                <span className="font-semibold text-sm">
                                                    ${(player.totalCommitted || 0).toLocaleString()} forfeited
                                                </span>
                                            </div>
                                        )}
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
                        className={`w-full transition-all duration-300 ${bettingComplete
                            ? 'btn-primary animate-bounce-gentle success-glow'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                            }`}
                        disabled={!bettingComplete}
                    >
                        <span className="flex items-center justify-center gap-3">
                            <span className="text-xl">
                                {bettingComplete ? (currentRound === 'river' ? '🏆' : '▶️') : '⏸️'}
                            </span>
                            <span>
                                {bettingComplete ? getNextActionText() : 'Waiting for betting to complete...'}
                            </span>
                            <span className="text-xl">
                                {bettingComplete ? (currentRound === 'river' ? '🏆' : '▶️') : '⏸️'}
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

            {/* Position Settings Modal */}
            {showPositionSettings && (
                <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-dark-800 rounded-xl border border-dark-600 max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>🎯</span>
                                    Player Positions
                                </h2>
                                <button
                                    onClick={() => setShowPositionSettings(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="text-sm text-gray-400">
                                    Choose the dealer for this hand. Small blind and big blind will be assigned automatically based on poker rules.
                                </div>

                                <div className="space-y-3">
                                    {players.filter(p => p.status === 'active' || p.chips > 0).map((player, index) => (
                                        <div
                                            key={player.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${dealerIndex === players.indexOf(player)
                                                ? 'border-yellow-500 bg-yellow-500/10'
                                                : 'border-dark-600 hover:border-dark-500'
                                                }`}
                                            onClick={() => setDealerIndex(players.indexOf(player))}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${dealerIndex === players.indexOf(player)
                                                        ? 'border-yellow-500 bg-yellow-500'
                                                        : 'border-gray-600'
                                                        }`}></div>
                                                    <span className="font-medium text-white">{player.name}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {player.position === 'dealer' && (
                                                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                                            🎯 DEALER
                                                        </span>
                                                    )}
                                                    {player.position === 'small-blind' && (
                                                        <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded">
                                                            SB
                                                        </span>
                                                    )}
                                                    {player.position === 'big-blind' && (
                                                        <span className="px-2 py-1 text-xs bg-gray-700/20 text-gray-500 rounded">
                                                            BB
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPositionSettings(false)}
                                    className="flex-1 btn-secondary bg-dark-700 hover:bg-dark-600 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => {
                                        const nextDealerIndex = advanceDealerButton() ?? dealerIndex;
                                        showToast(`Dealer button moved to ${players[nextDealerIndex]?.name}`, 'success');
                                    }}
                                    className="flex-1 btn-primary bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Auto-Advance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                title={`Advance to ${getRoundDisplayName(confirmDialog.data?.nextRound)}`}
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