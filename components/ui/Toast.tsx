import React from 'react';
import { Toaster, toast } from 'sonner';

export const ToastProvider: React.FC = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1rem',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                },
                classNames: {
                    success: 'border-green-200 bg-green-50',
                    error: 'border-red-200 bg-red-50',
                    warning: 'border-amber-200 bg-amber-50',
                    info: 'border-blue-200 bg-blue-50',
                },
            }}
            richColors
            closeButton
            duration={4000}
        />
    );
};

// Export toast helper for easy usage
export { toast };
