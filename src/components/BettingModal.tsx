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
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const minBet = Math.max(currentBet - playerCurrentBet + 1, 1);
    const maxBet = playerChips;
    const callAmount = currentBet - playerCurrentBet;

    // Reset modal when opened
    useEffect(() => {
        if (isOpen) {
            const defaultBet = Math.min(minBet, maxBet);
            setBetAmount(defaultBet);
            setCustomInput(defaultBet.toString());
            setError('');
            setIsValidating(false);
        }
    }, [isOpen, minBet, maxBet]);

    // Validate and update betAmount when custom input changes
    useEffect(() => {
        if (!customInput.trim()) {
            setBetAmount(0);
            setError('');
            return;
        }

        const amount = parseInt(customInput);

        if (isNaN(amount)) {
            setError('Please enter a valid number');
            setBetAmount(0);
            return;
        }

        if (amount < minBet) {
            setError(`Minimum bet is $${minBet.toLocaleString()}`);
            setBetAmount(amount);
            return;
        }

        if (amount > maxBet) {
            setError(`Maximum bet is $${maxBet.toLocaleString()} (all your chips)`);
            setBetAmount(amount);
            return;
        }

        setError('');
        setBetAmount(amount);
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

        // Prevent entering too many digits
        if (customInput.length >= 8) {
            setError('Bet amount too large');
            return;
        }

        setCustomInput(prev => prev + num);
    };

    const handleQuickBet = (amount: number) => {
        const validAmount = Math.max(minBet, Math.min(maxBet, amount));
        setBetAmount(validAmount);
        setCustomInput(validAmount.toString());
        setError('');
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

                {/* Bet Amount Display */}
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

                {/* Custom Input */}
                <div className="p-4 border-b border-dark-600">
                    <input
                        type="number"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter amount"
                        className={`input-field w-full text-center text-responsive-xl ${error ? 'border-red-500 ring-red-500' : ''
                            }`}
                        min={minBet}
                        max={maxBet}
                    />
                    {error && (
                        <div className="text-red-400 text-responsive-xs text-center mt-2 animate-slideDown">
                            {error}
                        </div>
                    )}
                </div>

                {/* Number Pad */}
                <div className="p-4 border-b border-dark-600">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberInput(num.toString())}
                                className="bg-dark-600 hover:bg-dark-500 active:bg-dark-400 text-white font-medium py-3 rounded-lg transition-all duration-200 text-responsive-lg min-h-[48px] transform hover:scale-105 active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => handleNumberInput('clear')}
                            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-3 rounded-lg transition-all duration-200 min-h-[48px] transform hover:scale-105 active:scale-95"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => handleNumberInput('0')}
                            className="bg-dark-600 hover:bg-dark-500 active:bg-dark-400 text-white font-medium py-3 rounded-lg transition-all duration-200 text-responsive-lg min-h-[48px] transform hover:scale-105 active:scale-95"
                        >
                            0
                        </button>
                        <button
                            onClick={() => handleNumberInput('backspace')}
                            className="bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium py-3 rounded-lg transition-all duration-200 min-h-[48px] transform hover:scale-105 active:scale-95"
                        >
                            ⌫
                        </button>
                    </div>
                </div>

                {/* Quick Bet Buttons */}
                {quickBetOptions.length > 0 && (
                    <div className="p-4 border-b border-dark-600">
                        <div className="text-gray-400 text-responsive-sm mb-3">Quick Bets</div>
                        <div className="grid grid-cols-2 gap-2">
                            {quickBetOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickBet(option.amount)}
                                    className={`btn-action ${option.amount === maxBet
                                        ? 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800'
                                        : 'bg-poker-green hover:bg-green-600 active:bg-green-700'
                                        } text-white`}
                                >
                                    <div className="font-semibold">{option.label}</div>
                                    <div className="text-xs opacity-80">${option.amount.toLocaleString()}</div>
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