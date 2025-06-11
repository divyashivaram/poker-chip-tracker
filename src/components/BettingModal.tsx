import React, { useState, useEffect, useCallback } from 'react';

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
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const minBet = Math.max(currentBet - playerCurrentBet + 1, 1);
    const maxBet = playerChips;
    const callAmount = currentBet - playerCurrentBet;

    // Unified function to update all input methods simultaneously
    const updateBetAmount = useCallback((newAmount: number, source: 'slider' | 'input' | 'quick-bet' = 'input') => {
        // Validate the amount
        if (isNaN(newAmount) || newAmount < 0) {
            if (source === 'input') {
                setError('Please enter a valid number');
            }
            return;
        }

        // Update the central bet amount
        setBetAmount(newAmount);

        // Update the text input to match
        setCustomInput(newAmount.toString());

        // Validate and set error messages
        if (newAmount < minBet && newAmount > 0) {
            setError(`Minimum bet is $${minBet.toLocaleString()}`);
        } else if (newAmount > maxBet) {
            setError(`Maximum bet is $${maxBet.toLocaleString()} (all your chips)`);
        } else {
            setError('');
        }
    }, [minBet, maxBet]);

    // Reset modal when opened
    useEffect(() => {
        if (isOpen) {
            const defaultBet = Math.min(minBet, maxBet);
            // Round to nearest multiple of 10
            const roundedBet = Math.round(defaultBet / 10) * 10;
            const finalBet = Math.max(Math.ceil(minBet / 10) * 10, Math.min(roundedBet, Math.floor(maxBet / 10) * 10));
            updateBetAmount(finalBet, 'quick-bet');
            setIsValidating(false);
        }
    }, [isOpen, updateBetAmount]);

    // Handle slider changes
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const amount = parseInt(e.target.value);
        updateBetAmount(amount, 'slider');
    };

    // Handle text input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setCustomInput(inputValue);

        if (!inputValue.trim()) {
            setBetAmount(0);
            setError('');
            return;
        }

        const amount = parseInt(inputValue);
        updateBetAmount(amount, 'input');
    };

    // Handle quick bet button clicks
    const handleQuickBet = (amount: number) => {
        const validAmount = Math.max(minBet, Math.min(maxBet, amount));
        updateBetAmount(validAmount, 'quick-bet');
    };

    const handleConfirm = async () => {
        if (betAmount < minBet || betAmount > maxBet || error) {
            setError('Please enter a valid bet amount');
            return;
        }

        setIsValidating(true);

        // Add a small delay for better UX
        setTimeout(() => {
            onConfirm(betAmount);
            setIsValidating(false);
        }, 300);
    };

    const quickBetOptions = [
        { label: 'Min Raise', amount: minBet },
        { label: '1/4 Pot', amount: Math.floor(potSize * 0.25) + callAmount },
        { label: '1/2 Pot', amount: Math.floor(potSize * 0.5) + callAmount },
        { label: 'Pot Size', amount: potSize + callAmount },
        { label: '2x Pot', amount: (potSize * 2) + callAmount },
        { label: 'All-In', amount: maxBet }
    ].filter(option => option.amount >= minBet && option.amount <= maxBet);

    const isAllIn = betAmount === maxBet;
    const isValid = betAmount >= minBet && betAmount <= maxBet && !error;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header */}
                <div className="bg-dark-700 rounded-t-xl p-4 md:p-6 border-b border-dark-600">
                    <h2 className="text-responsive-xl font-bold text-white text-center">{playerName}</h2>
                    <div className="mt-3 space-y-2 text-responsive-sm text-gray-300">
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

                {/* Bet Amount Display - The Source of Truth */}
                <div className={`p-4 md:p-6 text-center border-b border-dark-600 ${isAllIn ? 'bg-yellow-900 bg-opacity-20' : ''}`}>
                    <div className="text-gray-400 text-responsive-sm mb-2">
                        {isAllIn ? '🚨 ALL-IN BET' : 'Bet Amount'}
                    </div>
                    <div className={`text-responsive-3xl font-bold mb-2 transition-all duration-300 ${error ? 'text-red-400 error-shake' :
                        isAllIn ? 'text-yellow-400' :
                            'text-poker-gold'
                        }`}>
                        ${betAmount.toLocaleString()}
                    </div>
                    <div className="text-responsive-xs text-gray-400">
                        Range: ${minBet.toLocaleString()} - ${maxBet.toLocaleString()}
                    </div>
                    {isAllIn && (
                        <div className="text-yellow-400 text-responsive-sm font-medium mt-2 animate-bounce-gentle">
                            ⚠️ This will bet all your remaining chips!
                        </div>
                    )}
                </div>

                {/* Combined Slider and Input Control */}
                <div className="p-4 border-b border-dark-600">
                    <div className="text-gray-400 text-responsive-sm mb-3 flex items-center gap-2">
                        <span>🎚️</span>
                        <span>Adjust Bet Amount</span>
                    </div>

                    {/* Slider and Input Container */}
                    <div className="flex items-center gap-3 mb-4">
                        {/* Slider */}
                        <div className="flex-1">
                            <input
                                type="range"
                                min={Math.ceil(minBet / 10) * 10}
                                max={Math.floor(maxBet / 10) * 10}
                                step={10}
                                value={Math.round(betAmount / 10) * 10}
                                onChange={handleSliderChange}
                                className="w-full h-3 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, 
                                        #10b981 0%, 
                                        #10b981 ${((Math.round(betAmount / 10) * 10 - Math.ceil(minBet / 10) * 10) / (Math.floor(maxBet / 10) * 10 - Math.ceil(minBet / 10) * 10)) * 100}%, 
                                        #374151 ${((Math.round(betAmount / 10) * 10 - Math.ceil(minBet / 10) * 10) / (Math.floor(maxBet / 10) * 10 - Math.ceil(minBet / 10) * 10)) * 100}%, 
                                        #374151 100%)`
                                }}
                            />
                        </div>

                        {/* Text Input */}
                        <div className="w-24">
                            <input
                                type="number"
                                value={customInput}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                className={`input-field w-full text-center text-responsive-base font-semibold ${error ? 'border-red-500 ring-red-500' : 'border-poker-green-500/30 focus:border-poker-green-500/50'
                                    }`}
                                min={minBet}
                                max={maxBet}
                            />
                        </div>
                    </div>

                    {/* Slider Range Labels */}
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>${(Math.ceil(minBet / 10) * 10).toLocaleString()}</span>
                        <span>${(Math.floor(maxBet / 10) * 10).toLocaleString()}</span>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center text-xs text-gray-500">
                        Drag slider or enter exact amount
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-400 text-responsive-xs text-center mt-3 animate-slideDown">
                            {error}
                        </div>
                    )}
                </div>

                {/* Quick Bet Buttons */}
                {quickBetOptions.length > 0 && (
                    <div className="p-4 border-b border-dark-600">
                        <div className="text-gray-400 text-responsive-sm mb-3 flex items-center gap-2">
                            <span>⚡</span>
                            <span>Quick Bet Options</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {quickBetOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickBet(option.amount)}
                                    className={`relative overflow-hidden transition-all duration-200 p-3 rounded-xl font-semibold transform hover:scale-105 active:scale-95 ${option.amount === maxBet
                                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-glow-gold'
                                        : 'bg-gradient-to-r from-poker-green-500 to-poker-green-600 hover:from-poker-green-400 hover:to-poker-green-500 text-white shadow-glow'
                                        } ${betAmount === option.amount ? 'ring-2 ring-white ring-opacity-60' : ''}`}
                                >
                                    <div className="relative z-10">
                                        <div className="text-sm font-bold">{option.label}</div>
                                        <div className="text-xs opacity-90">${option.amount.toLocaleString()}</div>
                                    </div>
                                    {/* Selected indicator */}
                                    {betAmount === option.amount && (
                                        <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full opacity-80 animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isValidating}
                        className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 min-h-[56px] text-responsive-lg order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid || isValidating}
                        className={`font-semibold py-4 px-6 rounded-lg transition-all duration-200 min-h-[56px] text-responsive-lg order-1 sm:order-2 ${isAllIn
                            ? 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 disabled:bg-gray-600'
                            : 'bg-poker-green hover:bg-green-600 active:bg-green-700 disabled:bg-gray-600'
                            } disabled:cursor-not-allowed text-white ${isValid && !isValidating ? 'transform hover:scale-105 active:scale-95' : ''
                            } ${isValidating ? 'loading' : ''}`}
                    >
                        {isValidating ? 'Processing...' : isAllIn ? '🚨 GO ALL-IN' : 'Raise'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BettingModal; 