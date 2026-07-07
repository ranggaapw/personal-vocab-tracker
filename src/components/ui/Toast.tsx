import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const iconStyles = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
};

// Helper sederhana pengganti clsx/cn
function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(' ');
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
    const Icon = icons[type];

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-lg w-full animate-in slide-in-from-top-2 duration-300',
                styles[type]
            )}
        >
            <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconStyles[type])} />
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm leading-normal">
                    {title}
                </p>
                {message && (
                    <p className="text-xs mt-1 opacity-90 leading-relaxed whitespace-pre-wrap">
                        {message}
                    </p>
                )}
            </div>
            <button
                onClick={() => onClose(id)}
                className="shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
    return (
        <div className="fixed top-6 inset-x-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto w-full max-w-5xl">
                    <Toast {...toast} />
                </div>
            ))}
        </div>
    );
}