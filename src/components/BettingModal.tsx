import React, { useState, useEffect } from 'react';

interface BettingModalProps {
    isOpen: boolean;
    playerName: string;
    playerChips: number;
    currentBet: number;
    playerCurrentBet: number;
    potSize: number;
    onConfirm: (betAmount: number) => void;
    onCancel: () => void;
}

const BettingModal: React.FC<BettingModalProps> = ({
    isOpen,
    playerName,
    playerChips,
    currentBet,
    playerCurrentBet,
    potSize,
    onConfirm,
    onCancel
}) => {
    const [betAmount, setBetAmount] = useState(0);
    const [customInput, setCustomInput] = useState('');

    const minBet = Math.max(currentBet - playerCurrentBet + 1, 1);
    const maxBet = playerChips;
    const callAmount = currentBet - playerCurrentBet;

    // Reset modal when opened
    useEffect(() => {
        if (isOpen) {
            setBetAmount(minBet);
            setCustomInput(minBet.toString());
        }
    }, [isOpen, minBet]);

    // Update betAmount when custom input changes
    useEffect(() => {
        const amount = parseInt(customInput) || 0;
        setBetAmount(Math.max(minBet, Math.min(maxBet, amount)));
    }, [customInput, minBet, maxBet]);

    const handleNumberInput = (num: string) => {
        if (num === 'clear') {
            setCustomInput('');
            return;
        }
        if (num === 'backspace') {
            setCustomInput(prev => prev.slice(0, -1));
            return;
        }
        setCustomInput(prev => prev + num);
    };

    const handleQuickBet = (amount: number) => {
        const validAmount = Math.max(minBet, Math.min(maxBet, amount));
        setBetAmount(validAmount);
        setCustomInput(validAmount.toString());
    };

    const handleConfirm = () => {
        if (betAmount >= minBet && betAmount <= maxBet) {
            onConfirm(betAmount);
        }
    };

    const quickBetOptions = [
        { label: 'Min Raise', amount: minBet },
        { label: '1/4 Pot', amount: Math.floor(potSize * 0.25) + callAmount },
        { label: '1/2 Pot', amount: Math.floor(potSize * 0.5) + callAmount },
        { label: 'Pot Size', amount: potSize + callAmount },
        { label: '2x Pot', amount: (potSize * 2) + callAmount },
        { label: 'All-In', amount: maxBet }
    ].filter(option => option.amount >= minBet && option.amount <= maxBet);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-dark-700 rounded-t-xl p-4 border-b border-dark-600">
                    <h2 className="text-xl font-bold text-white text-center">{playerName}</h2>
                    <div className="mt-2 space-y-1 text-sm text-gray-300">
                        <div className="flex justify-between">
                            <span>Available chips:</span>
                            <span className="text-white font-medium">${playerChips.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>To call:</span>
                            <span className="text-poker-gold font-medium">${callAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Current pot:</span>
                            <span className="text-green-400 font-medium">${potSize.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Bet Amount Display */}
                <div className="p-4 text-center border-b border-dark-600">
                    <div className="text-gray-400 text-sm mb-2">Bet Amount</div>
                    <div className="text-3xl font-bold text-poker-gold mb-2">
                        ${betAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                        Range: ${minBet.toLocaleString()} - ${maxBet.toLocaleString()}
                    </div>
                </div>

                {/* Custom Input */}
                <div className="p-4 border-b border-dark-600">
                    <input
                        type="number"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter amount"
                        className="input-field w-full text-center text-xl"
                        min={minBet}
                        max={maxBet}
                    />
                </div>

                {/* Number Pad */}
                <div className="p-4 border-b border-dark-600">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberInput(num.toString())}
                                className="bg-dark-600 hover:bg-dark-500 text-white font-medium py-3 rounded-lg transition-colors duration-200 text-lg"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleNumberInput('clear')}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => handleNumberInput('0')}
                            className="bg-dark-600 hover:bg-dark-500 text-white font-medium py-3 rounded-lg transition-colors duration-200 text-lg"
                        >
                            0
                        </button>
                        <button
                            onClick={() => handleNumberInput('backspace')}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                        >
                            ⌫
                        </button>
                    </div>
                </div>

                {/* Quick Bet Buttons */}
                <div className="p-4 border-b border-dark-600">
                    <div className="text-gray-400 text-sm mb-3">Quick Bets</div>
                    <div className="grid grid-cols-2 gap-2">
                        {quickBetOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleQuickBet(option.amount)}
                                className="bg-poker-green hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                            >
                                <div className="font-semibold">{option.label}</div>
                                <div className="text-xs opacity-80">${option.amount.toLocaleString()}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 grid grid-cols-2 gap-3">
                    <button
                        onClick={onCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={betAmount < minBet || betAmount > maxBet}
                        className="bg-poker-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors duration-200"
                    >
                        {betAmount === maxBet ? 'All-In' : 'Raise'}
                    </button>
                </div>

                {/* Validation Message */}
                {(betAmount < minBet || betAmount > maxBet) && (
                    <div className="px-4 pb-4">
                        <div className="text-red-400 text-xs text-center">
                            {betAmount < minBet
                                ? `Minimum bet is $${minBet.toLocaleString()}`
                                : `Maximum bet is $${maxBet.toLocaleString()}`
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BettingModal; 