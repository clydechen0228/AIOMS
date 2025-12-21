import { useState, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="min-w-[300px] bg-white border border-slate-200 shadow-xl rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 pointer-events-auto">
                        {t.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {t.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500" />}
                        <p className="text-sm font-medium text-slate-900">{t.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToasterProvider");
    return context;
};
