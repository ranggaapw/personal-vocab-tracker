import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VocabBox } from './components/VocabBox';
import { SentenceBox } from './components/SentenceBox';
import { TensesBox } from './components/TensesBox';
import { LanguageSelect } from './components/ui/LanguageSelect';
import { Settings2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'sentence' | 'tenses'>('vocab');
  const [targetLang, setTargetLang] = useState('Indonesian');
  const [accent, setAccent] = useState('en-US');

  // Dummy fungsi consumeToken agar tidak error di TensesBox
  const consumeToken = () => true;

  return (
    <div className="min-h-screen bg-slate-50 text-brand-dark flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)]">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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