import { BookOpen, BookA, FileText, Sparkles, Cpu } from 'lucide-react';

interface NavbarProps {
    activeTab: 'vocab' | 'sentence' | 'tenses';
    setActiveTab: (tab: 'vocab' | 'sentence' | 'tenses') => void;
    tokenQuota: number; // 0 - 100
}

export function Navbar({ activeTab, setActiveTab, tokenQuota }: NavbarProps) {
    // Tentukan warna indikator kuota
    const getColor = () => {
        if (tokenQuota > 40) return 'text-green-600 bg-green-50 border-green-200';
        if (tokenQuota > 10) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200 animate-pulse';
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-light/30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="bg-brand-primary text-white p-2.5 rounded-2xl shadow-md shadow-brand-primary/20">
                    <BookOpen className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-brand-dark">Vocab Studio</h1>
            </div>

            <div className="flex items-center gap-1.5 bg-brand-pale/30 p-1.5 rounded-2xl border border-brand-light/30 flex-wrap justify-center">
                <button
                    onClick={() => setActiveTab('vocab')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'vocab' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:text-brand-dark'}`}
                >
                    <BookA className="h-4 w-4" /> 📖 Vocabulary
                </button>
                <button
                    onClick={() => setActiveTab('sentence')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'sentence' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:text-brand-dark'}`}
                >
                    <FileText className="h-4 w-4" /> ✍️ Sentence
                </button>
                <button
                    onClick={() => setActiveTab('tenses')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'tenses' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'}`}
                >
                    <Sparkles className="h-4 w-4" /> ⚡ 16 Tenses
                </button>
            </div>

            {/* Monitor Kuota Token Kecil di Navbar */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${getColor()}`}>
                <Cpu className="h-4 w-4" />
                <span>Quota: {tokenQuota}%</span>
            </div>
        </nav>
    );
}