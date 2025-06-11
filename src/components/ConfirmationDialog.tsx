import React from 'react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'warning' | 'success';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'success',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const getConfirmButtonClasses = () => {
        const baseClasses = "font-semibold py-4 px-6 rounded-lg transition-all duration-200 min-h-[56px] text-lg";
        switch (confirmVariant) {
            case 'danger':
                return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
            case 'warning':
                return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white`;
            case 'success':
            default:
                return `${baseClasses} bg-poker-green hover:bg-green-600 text-white`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-sm mx-4 animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-dark-600">
                    <h2 className="text-xl font-bold text-white text-center mb-2">{title}</h2>
                    <p className="text-gray-300 text-center leading-relaxed">{message}</p>
                </div>

                {/* Action Buttons */}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={onCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 min-h-[56px] text-lg order-2 sm:order-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`${getConfirmButtonClasses()} order-1 sm:order-2`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog; 