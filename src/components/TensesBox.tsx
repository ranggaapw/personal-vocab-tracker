import { useState } from 'react';
import { transformTenseSingle } from '../services/gemini';
import { useSpeech } from '../hooks/useSpeech';
import { Button } from './ui/Button';
import { Mic, Volume2, Wand2, BookOpenCheck } from 'lucide-react';

const TENSES_LIST = [
    "Simple Present", "Present Continuous", "Present Perfect", "Present Perfect Continuous",
    "Simple Past", "Past Continuous", "Past Perfect", "Past Perfect Continuous",
    "Simple Future", "Future Continuous", "Future Perfect", "Future Perfect Continuous",
    "Simple Past Future", "Past Future Continuous", "Past Future Perfect", "Past Future Perfect Continuous"
];

export function TensesBox({ targetLang, accent, consumeToken }: { targetLang: string, accent: string, consumeToken: () => boolean }) {
    const { speak, listen, isListening } = useSpeech();
    const [sourceText, setSourceText] = useState('');
    const [selectedTense, setSelectedTense] = useState(TENSES_LIST[0]);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!sourceText.trim()) return;
        if (!consumeToken()) return; // Cek kuota token sebelum eksekusi
        setIsLoading(true);
        const result = await transformTenseSingle(sourceText, selectedTense, targetLang);
        setData(result);
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
                <span className="text-4xl">⚡</span>
                <h2 className="text-4xl font-black text-brand-dark">16 Tenses AI Master</h2>
                <p className="text-slate-500 text-lg font-medium">Kuasai tata bahasa Inggris tanpa pusing. Masukkan kalimat dasar Anda, pilih tenses tujuan, dan lihat bagaimana struktur kalimat berubah lengkap dengan rumus serta penjelasan situasional secara detail.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-emerald-100/60 overflow-hidden">
                <div className="p-8 bg-emerald-50/70 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md">
                            <BookOpenCheck className="h-6 w-6" />
                        </div>
                        <select
                            value={selectedTense}
                            onChange={(e) => setSelectedTense(e.target.value)}
                            className="bg-white font-bold text-emerald-900 px-5 py-3 rounded-2xl border border-emerald-200 outline-none cursor-pointer text-base shadow-sm"
                        >
                            {TENSES_LIST.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={!sourceText.trim() || isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-10 py-4 shadow-lg shadow-emerald-600/25 text-base font-bold"
                    >
                        <Wand2 className={`h-5 w-5 mr-2.5 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Mentransformasi...' : 'Konversi Tenses'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-emerald-100/60">
                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-slate-50/30">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Ketik kalimat dasar dalam bahasa Inggris di sini (contoh: I write a letter)..."
                            className="w-full flex-1 resize-none outline-none text-2xl font-medium bg-transparent text-brand-dark placeholder:text-slate-300"
                        />
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" className={`p-2.5 rounded-xl ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-600'}`} onClick={() => listen(setSourceText, accent)}>
                                <Mic className="h-6 w-6" />
                            </Button>
                            <Button variant="ghost" className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-600" onClick={() => speak(sourceText, accent)}>
                                <Volume2 className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-emerald-50/10 justify-between">
                        <div className="flex-1">
                            {isLoading ? <p className="text-2xl animate-pulse text-emerald-600">Mengonversi bentuk tenses dengan AI...</p>
                                : data?.sentence ? (
                                    <>
                                        <div className="bg-emerald-50 px-3.5 py-1.5 rounded-lg text-xs font-mono text-emerald-800 mb-4 w-fit font-bold border border-emerald-100">
                                            {data.formula}
                                        </div>
                                        <p className="text-3xl font-extrabold text-brand-dark mb-2.5">{data.sentence}</p>
                                        <p className="text-lg text-slate-500 font-medium italic">{data.translation}</p>
                                    </>
                                ) : <p className="text-2xl text-slate-300 font-medium">Hasil konversi kalimat dalam bentuk tense yang dipilih akan muncul di sini...</p>}
                        </div>
                        {data?.sentence && (
                            <div className="flex justify-end mt-4">
                                <Button variant="ghost" className="p-2.5 text-slate-400 hover:text-emerald-600" onClick={() => speak(data.sentence, accent)}>
                                    <Volume2 className="h-6 w-6" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {data?.explanation && (
                    <div className="p-8 md:p-10 bg-emerald-50/20 border-t border-emerald-100/60">
                        <h4 className="text-base font-bold text-emerald-800 uppercase tracking-wider mb-2">Panduan Rumus & Cara Penggunaan:</h4>
                        <p className="text-lg text-brand-dark/90 leading-relaxed">💡 {data.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
}