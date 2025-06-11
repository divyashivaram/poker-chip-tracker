import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show toast
        setIsVisible(true);

        // Auto hide after duration
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-poker-green-500 to-poker-green-600 text-white border-poker-green-400/30';
            case 'error':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/30';
            case 'warning':
                return 'bg-gradient-to-r from-poker-gold-500 to-poker-gold-600 text-dark-900 border-poker-gold-400/30';
            case 'info':
                return 'bg-gradient-to-r from-accent-blue to-blue-600 text-white border-blue-400/30';
            default:
                return 'bg-gradient-to-r from-poker-green-500 to-poker-green-600 text-white border-poker-green-400/30';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '✅';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`
                    ${getToastStyles()}
                    px-6 py-4 rounded-xl border shadow-lg backdrop-blur-lg
                    transform transition-all duration-300 ease-out
                    ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
                    max-w-sm
                `}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">{getIcon()}</span>
                    <div className="flex-1">
                        <p className="font-medium text-sm">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-current opacity-70 hover:opacity-100 transition-opacity duration-200 ml-2"
                    >
                        <span className="text-lg">×</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast; 