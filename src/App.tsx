import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VocabBox } from './components/VocabBox';
import { SentenceBox } from './components/SentenceBox';
import { TensesBox } from './components/TensesBox';
import { LanguageSelect } from './components/ui/LanguageSelect';
import { ToastContainer } from './components/ui/Toast';
import { Settings2 } from 'lucide-react';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'sentence' | 'tenses'>(() => {
    return (localStorage.getItem('vocab_tracker_active_tab') as 'vocab' | 'sentence' | 'tenses') || 'vocab';
  });
  const [targetLang, setTargetLang] = useState(() => {
    return localStorage.getItem('vocab_tracker_target_lang') || 'Indonesian';
  });
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('vocab_tracker_accent') || 'en-US';
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    localStorage.setItem('vocab_tracker_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('vocab_tracker_target_lang', targetLang);
  }, [targetLang]);

  useEffect(() => {
    localStorage.setItem('vocab_tracker_accent', accent);
  }, [accent]);

  const consumeToken = () => true;

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Global listener untuk menangkap event error AI dari service
  useEffect(() => {
    const handleGlobalAIFail = (e: CustomEvent) => {
      addToast(
        'error',
        'Gagal Terhubung ke AI',
        e.detail || "Semua cadangan API AI mengalami kendala atau limit habis."
      );
    };
    window.addEventListener('ai-fallback-failed' as any, handleGlobalAIFail);
    return () => window.removeEventListener('ai-fallback-failed' as any, handleGlobalAIFail);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-brand-dark flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)]">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="w-full max-w-[92rem] mx-auto px-6 md:px-8 mt-10 mb-28 relative z-10 flex-1">
          <div className="flex justify-center items-center gap-4 bg-white w-fit mx-auto px-5 py-2.5 rounded-2xl shadow-sm border border-brand-light/40 mb-12">
            <Settings2 className="h-4 w-4 text-slate-400" />
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="bg-transparent font-bold text-slate-600 outline-none cursor-pointer text-sm"
            >
              <option value="en-US">🇺🇸 US Accent</option>
              <option value="en-GB">🇬🇧 UK Accent</option>
              <option value="en-AU">🇦🇺 AU Accent</option>
            </select>
            <div className="w-px h-5 bg-brand-light/50"></div>
            <LanguageSelect value={targetLang} onChange={setTargetLang} />
          </div>

          {activeTab === 'vocab' && <VocabBox targetLang={targetLang} accent={accent} />}
          {activeTab === 'sentence' && <SentenceBox targetLang={targetLang} accent={accent} />}
          {activeTab === 'tenses' && <TensesBox targetLang={targetLang} accent={accent} consumeToken={consumeToken} />}
        </main>
      </div>

      <ToastContainer toasts={toasts.map(t => ({ ...t, onClose: removeToast }))} />
      <Footer />
    </div>
  );
}