import React, { useState, useEffect } from 'react';

interface Player {
    id: string;
    name: string;
    chips: number;
    status: 'active' | 'folded' | 'all-in';
    currentBet: number;
}

interface PotDistributionProps {
    isOpen: boolean;
    players: Player[];
    potAmount: number;
    onDistribute: (winners: string[], distribution: { [playerId: string]: number }) => void;
    onCancel: () => void;
}

const PotDistribution: React.FC<PotDistributionProps> = ({
    isOpen,
    players,
    potAmount,
    onDistribute,
    onCancel
}) => {
    const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
    const [isDistributing, setIsDistributing] = useState(false);

    // Reset selections when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedWinners([]);
            setIsDistributing(false);
        }
    }, [isOpen]);

    const toggleWinner = (playerId: string) => {
        setSelectedWinners(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            } else {
                return [...prev, playerId];
            }
        });
    };

    const selectAllActive = () => {
        const activePlayers = players
            .filter(p => p.status === 'active' || p.status === 'all-in')
            .map(p => p.id);
        setSelectedWinners(activePlayers);
    };

    const clearAll = () => {
        setSelectedWinners([]);
    };

    const calculateDistribution = () => {
        if (selectedWinners.length === 0) return {};

        const amountPerWinner = Math.floor(potAmount / selectedWinners.length);
        const remainder = potAmount % selectedWinners.length;

        const distribution: { [playerId: string]: number } = {};

        selectedWinners.forEach((winnerId, index) => {
            // First few winners get the remainder chips (1 extra each)
            const bonus = index < remainder ? 1 : 0;
            distribution[winnerId] = amountPerWinner + bonus;
        });

        return distribution;
    };

    const handleDistribute = async () => {
        if (selectedWinners.length === 0) return;

        setIsDistributing(true);
        const distribution = calculateDistribution();

        // Add delay for better UX
        setTimeout(() => {
            onDistribute(selectedWinners, distribution);
            setIsDistributing(false);
        }, 800);
    };

    const distribution = calculateDistribution();
    const canDistribute = selectedWinners.length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="bg-dark-700 rounded-t-xl p-4 md:p-6 border-b border-dark-600">
                    <h2 className="text-responsive-xl font-bold text-white text-center mb-3">
                        🏆 Distribute Pot
                    </h2>
                    <div className="text-center">
                        <div className="text-responsive-3xl font-bold text-poker-gold mb-2">
                            ${potAmount.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-responsive-sm">
                            Select the winners to split the pot
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-b border-dark-600">
                    <div className="flex gap-2">
                        <button
                            onClick={selectAllActive}
                            className="btn-secondary flex-1 text-responsive-sm"
                        >
                            Select All Active
                        </button>
                        <button
                            onClick={clearAll}
                            className="btn-secondary flex-1 text-responsive-sm bg-gray-600 hover:bg-gray-700"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Players List */}
                <div className="max-h-[40vh] overflow-y-auto p-4 border-b border-dark-600">
                    <div className="space-y-3">
                        {players.map((player, index) => {
                            const isSelected = selectedWinners.includes(player.id);
                            const isEligible = player.status === 'active' || player.status === 'all-in';

                            return (
                                <div
                                    key={player.id}
                                    className="animate-slideUp"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <button
                                        onClick={() => isEligible && toggleWinner(player.id)}
                                        disabled={!isEligible || isDistributing}
                                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                                            ? 'border-poker-green bg-poker-green bg-opacity-10 transform scale-105'
                                            : isEligible
                                                ? 'border-dark-500 hover:border-dark-400 bg-dark-700 hover:bg-dark-600 transform hover:scale-105'
                                                : 'border-dark-600 bg-dark-700 opacity-50 cursor-not-allowed'
                                            } disabled:cursor-not-allowed text-left min-h-[72px] touch-manipulation`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {/* Checkbox */}
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                                    ? 'border-poker-green bg-poker-green'
                                                    : 'border-gray-400'
                                                    }`}>
                                                    {isSelected && (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Player Info */}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-responsive-base font-semibold text-white">
                                                            {player.name}
                                                        </span>
                                                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${player.status === 'active' ? 'bg-green-600 text-white' :
                                                            player.status === 'all-in' ? 'bg-yellow-600 text-black' :
                                                                'bg-red-600 text-white'
                                                            }`}>
                                                            {player.status === 'active' ? '🟢' :
                                                                player.status === 'all-in' ? '🟡' : '🔴'}
                                                        </div>
                                                    </div>
                                                    <div className="text-responsive-sm text-gray-400">
                                                        ${player.chips.toLocaleString()} chips
                                                        {player.currentBet > 0 && (
                                                            <span className="ml-2 text-poker-gold">
                                                                • Bet: ${player.currentBet.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Winning Amount */}
                                            {isSelected && distribution[player.id] && (
                                                <div className="text-right">
                                                    <div className="text-responsive-base font-bold text-poker-gold">
                                                        +${distribution[player.id].toLocaleString()}
                                                    </div>
                                                    <div className="text-responsive-xs text-gray-400">
                                                        winnings
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Distribution Summary */}
                {selectedWinners.length > 0 && (
                    <div className="p-4 border-b border-dark-600 bg-dark-700 animate-slideDown">
                        <h3 className="text-responsive-base font-semibold text-white mb-3">Distribution Summary</h3>
                        <div className="space-y-2 text-responsive-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>Total pot:</span>
                                <span className="text-poker-gold font-medium">${potAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Winners:</span>
                                <span className="text-white font-medium">{selectedWinners.length}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Per winner:</span>
                                <span className="text-poker-gold font-medium">
                                    ${Math.floor(potAmount / selectedWinners.length).toLocaleString()}
                                    {potAmount % selectedWinners.length > 0 && (
                                        <span className="text-responsive-xs text-gray-400 ml-1">
                                            (+${potAmount % selectedWinners.length} remainder)
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isDistributing}
                            className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 min-h-[56px] text-responsive-lg order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDistribute}
                            disabled={!canDistribute || isDistributing}
                            className={`font-semibold py-4 px-6 rounded-lg transition-all duration-200 min-h-[56px] text-responsive-lg order-1 sm:order-2 ${canDistribute && !isDistributing
                                ? 'bg-poker-green hover:bg-green-600 active:bg-green-700 text-white transform hover:scale-105 active:scale-95'
                                : 'bg-gray-600 cursor-not-allowed text-gray-300'
                                } ${isDistributing ? 'loading' : ''}`}
                        >
                            {isDistributing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Distributing...
                                </span>
                            ) : (
                                '💰 Distribute Chips'
                            )}
                        </button>
                    </div>

                    {selectedWinners.length === 0 && (
                        <div className="text-center text-gray-400 text-responsive-xs mt-3 animate-slideDown">
                            Select at least one winner to distribute the pot
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PotDistribution; 