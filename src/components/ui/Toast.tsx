import { AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string | null;
    onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
    if (!message) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-md border border-red-500/50">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-100" />
            <div className="flex-1">
                <h5 className="font-extrabold text-sm uppercase tracking-wider">Gagal Terhubung ke AI</h5>
                <p className="text-xs text-red-100 mt-0.5 leading-relaxed">{message}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-red-700 text-red-200 hover:text-white transition-all">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}