import { BookOpen, BookA, FileText, Sparkles } from 'lucide-react';

interface NavbarProps {
    activeTab: 'vocab' | 'sentence' | 'tenses';
    setActiveTab: (tab: 'vocab' | 'sentence' | 'tenses') => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-6 md:px-8 py-5 shadow-sm">
            <div className="max-w-[92rem] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="bg-brand-primary text-white p-3 rounded-2xl shadow-lg shadow-brand-primary/25 transition-transform hover:scale-105 duration-300">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">
                        Vocab <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">Studio AI</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-[1.5rem] border border-slate-200/50 flex-wrap justify-center shadow-inner">
                    <button
                        onClick={() => setActiveTab('vocab')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-extrabold transition-all duration-300 ${activeTab === 'vocab' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25 scale-[1.02]' : 'text-slate-600 hover:text-brand-primary hover:bg-slate-50'}`}
                    >
                        <BookA className="h-5 w-5" /> Kosakata AI
                    </button>
                    <button
                        onClick={() => setActiveTab('sentence')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-extrabold transition-all duration-300 ${activeTab === 'sentence' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <FileText className="h-5 w-5" /> Analisis Kalimat
                    </button>
                    <button
                        onClick={() => setActiveTab('tenses')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-extrabold transition-all duration-300 ${activeTab === 'tenses' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'}`}
                    >
                        <Sparkles className="h-5 w-5" /> Konversi Tenses
                    </button>
                </div>

                <div className="hidden md:block w-12"></div> {/* Spacer penyeimbang */}
            </div>
        </nav>
    );
}