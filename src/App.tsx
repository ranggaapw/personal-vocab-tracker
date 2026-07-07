import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VocabBox } from './components/VocabBox';
import { SentenceBox } from './components/SentenceBox';
import { TensesBox } from './components/TensesBox';
import { LanguageSelect } from './components/ui/LanguageSelect';
import { Settings2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'sentence' | 'tenses'>('vocab');
  const [targetLang, setTargetLang] = useState('Indonesian');
  const [accent, setAccent] = useState('en-US');

  // State Simulasi Kuota Token (100%)
  const [tokenQuota, setTokenQuota] = useState(100);
  const [isExhausted, setIsExhausted] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Fungsi pengurang kuota saat aksi AI dipanggil
  const consumeToken = () => {
    if (tokenQuota <= 0) {
      setIsExhausted(true);
      return false;
    }
    setTokenQuota(prev => {
      const next = prev - 15;
      if (next <= 0) {
        setIsExhausted(true);
        return 0;
      }
      return next;
    });
    return true;
  };

  // Efek Countdown jika token habis
  useEffect(() => {
    if (!isExhausted) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsExhausted(false);
          setTokenQuota(100); // Restart kuota kembali aman
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isExhausted]);

  return (
    <div className="min-h-screen bg-slate-50 text-brand-dark flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)]">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} tokenQuota={tokenQuota} />

        {/* Banner Error Token Habis */}
        {isExhausted && (
          <div className="max-w-7xl mx-auto px-6 mt-6 w-full z-50">
            <div className="bg-red-600 text-white p-5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-extrabold text-base">Token anda sudah habis, akan restart dalam {countdown} detik...</p>
                <p className="text-xs text-red-100 mt-0.5">Sistem membatasi penggunaan sementara untuk menjaga stabilitas limit API.</p>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-6 md:px-8 mt-10 mb-28 relative z-10 flex-1">
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

      <Footer />
    </div>
  );
}