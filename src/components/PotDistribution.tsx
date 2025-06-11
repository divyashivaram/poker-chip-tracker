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
    const [distribution, setDistribution] = useState<{ [playerId: string]: number }>({});

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedWinners([]);
            setDistribution({});
        }
    }, [isOpen]);

    // Calculate distribution when winners change
    useEffect(() => {
        if (selectedWinners.length > 0 && potAmount > 0) {
            const amountPerWinner = Math.floor(potAmount / selectedWinners.length);
            const remainder = potAmount % selectedWinners.length;

            const newDistribution: { [playerId: string]: number } = {};

            selectedWinners.forEach((winnerId, index) => {
                newDistribution[winnerId] = amountPerWinner + (index < remainder ? 1 : 0);
            });

            setDistribution(newDistribution);
        } else {
            setDistribution({});
        }
    }, [selectedWinners, potAmount]);

    const handlePlayerToggle = (playerId: string) => {
        setSelectedWinners(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const handleDistribute = () => {
        if (selectedWinners.length > 0) {
            onDistribute(selectedWinners, distribution);
        }
    };

    const handleSelectAll = () => {
        const activePlayers = players.filter(p => p.status !== 'folded');
        setSelectedWinners(activePlayers.map(p => p.id));
    };

    const handleClearAll = () => {
        setSelectedWinners([]);
    };

    if (!isOpen) return null;

    const totalDistributed = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);
    const activePlayers = players.filter(p => p.status !== 'folded');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-dark-700 rounded-t-xl p-6 border-b border-dark-600 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">🏆 Distribute Pot</h2>
                    <div className="text-4xl font-bold text-poker-gold mb-2">
                        ${potAmount.toLocaleString()}
                    </div>
                    <p className="text-gray-300 text-sm">
                        Select the winner(s) of this hand
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-b border-dark-600">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleSelectAll}
                            disabled={activePlayers.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                        >
                            Select All Active
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={selectedWinners.length === 0}
                            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>

                {/* Players List */}
                <div className="p-4 border-b border-dark-600">
                    <div className="space-y-3">
                        {players.map((player) => {
                            const isSelected = selectedWinners.includes(player.id);
                            const playerWinAmount = distribution[player.id] || 0;

                            return (
                                <div
                                    key={player.id}
                                    className={`border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer ${isSelected
                                            ? 'border-poker-green bg-dark-700'
                                            : player.status === 'folded'
                                                ? 'border-dark-500 bg-dark-900 opacity-50'
                                                : 'border-dark-500 bg-dark-700 hover:border-dark-400'
                                        }`}
                                    onClick={() => player.status !== 'folded' && handlePlayerToggle(player.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected
                                                    ? 'border-poker-green bg-poker-green'
                                                    : 'border-gray-400'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-semibold text-lg">{player.name}</span>
                                                    <div className={`w-2 h-2 rounded-full ${player.status === 'active' ? 'bg-green-400' :
                                                            player.status === 'folded' ? 'bg-red-400' : 'bg-yellow-400'
                                                        }`}></div>
                                                </div>
                                                <div className="text-gray-300 text-sm">
                                                    ${player.chips.toLocaleString()} chips
                                                    {player.status === 'folded' && ' (Folded)'}
                                                    {player.status === 'all-in' && ' (All-In)'}
                                                </div>
                                            </div>
                                        </div>

                                        {isSelected && playerWinAmount > 0 && (
                                            <div className="text-right">
                                                <div className="text-poker-gold font-bold text-lg">
                                                    +${playerWinAmount.toLocaleString()}
                                                </div>
                                                <div className="text-gray-400 text-xs">
                                                    wins
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Distribution Summary */}
                {selectedWinners.length > 0 && (
                    <div className="p-4 border-b border-dark-600">
                        <div className="bg-dark-700 rounded-lg p-3">
                            <div className="text-gray-300 text-sm mb-2">Distribution Summary:</div>
                            <div className="space-y-1">
                                {selectedWinners.map(winnerId => {
                                    const player = players.find(p => p.id === winnerId);
                                    const amount = distribution[winnerId] || 0;
                                    return (
                                        <div key={winnerId} className="flex justify-between text-sm">
                                            <span className="text-white">{player?.name}</span>
                                            <span className="text-poker-gold font-medium">+${amount.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="border-t border-dark-500 mt-2 pt-2 flex justify-between text-sm font-bold">
                                <span className="text-white">Total:</span>
                                <span className="text-poker-gold">${totalDistributed.toLocaleString()}</span>
                            </div>
                            {selectedWinners.length > 1 && (
                                <div className="text-gray-400 text-xs mt-1">
                                    Pot split {selectedWinners.length} ways
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <button
                        onClick={onCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDistribute}
                        disabled={selectedWinners.length === 0}
                        className="bg-poker-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors duration-200"
                    >
                        Distribute Chips
                    </button>
                </div>

                {/* Validation Message */}
                {selectedWinners.length === 0 && (
                    <div className="px-4 pb-4">
                        <div className="text-yellow-400 text-xs text-center">
                            Please select at least one winner to distribute the pot
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PotDistribution; 