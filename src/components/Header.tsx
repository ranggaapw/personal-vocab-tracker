import { BookOpen } from 'lucide-react';

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-brand-light/30 px-6 py-4 flex items-center justify-between shadow-sm shadow-brand-dark/5">
            <div className="flex items-center gap-3">
                <div className="bg-brand-primary text-white p-2 rounded-xl shadow-md shadow-brand-primary/20">
                    <BookOpen className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-brand-dark">Vocab Studio</h1>
            </div>
        </header>
    );
}