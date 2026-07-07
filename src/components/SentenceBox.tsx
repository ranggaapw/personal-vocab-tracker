import { useState, useEffect } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { translateSentence, translateImageOrDoc } from '../services/gemini';
import { useSpeech } from '../hooks/useSpeech';
import { Button } from './ui/Button';
import { Save, Mic, Volume2, Upload, FileText } from 'lucide-react';
import { DictionaryList } from './DictionaryList';

export function SentenceBox({ targetLang, accent }: { targetLang: string, accent: string }) {
    const { addVocab } = useVocabStore();
    const { speak, listen, isListening } = useSpeech();
    const [sourceText, setSourceText] = useState('');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!sourceText.trim()) { setData(null); return; }
        setIsLoading(true);
        const timer = setTimeout(async () => {
            const result = await translateSentence(sourceText, targetLang);
            setData(result);
            setIsLoading(false);
        }, 700);
        return () => clearTimeout(timer);
    }, [sourceText, targetLang]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const result = await translateImageOrDoc(base64String, file.type, targetLang);
            if (result) {
                setSourceText(result.originalText);
                setData({ translation: result.translation, intent: 'Analisis teks otomatis dari dokumen yang diunggah.' });
            }
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!data?.translation) return;
        addVocab({
            word: sourceText.trim(),
            meaning: data.translation,
            intent: data.intent,
            type: 'sentence'
        });
        setSourceText(''); setData(null);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
                <span className="text-4xl">✍️</span>
                <h2 className="text-4xl font-black text-brand-dark">Sentence & Idiom AI Studio</h2>
                <p className="text-slate-500 text-lg font-medium">Terjemahkan kalimat kompleks, klausa, atau ungkapan idiomatis tanpa kehilangan makna. AI kami akan membedah nuansa kontekstual serta maksud tersirat di balik setiap kalimat.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-brand-light/40 overflow-hidden">

                <div className="p-8 bg-brand-pale/25 border-b border-brand-light/30 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-primary text-white p-3.5 rounded-2xl shadow-md">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base text-brand-dark">Scan Kalimat & Paragraf (OCR)</h4>
                            <p className="text-sm text-slate-500">Unggah foto halaman buku, artikel, atau dokumen digital untuk mengekstrak kalimat panjang dan menganalisis maknanya secara instan.</p>
                        </div>
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-2.5 bg-brand-primary hover:bg-brand-dark text-white px-6 py-3.5 rounded-2xl text-base font-bold shadow-lg shadow-brand-primary/20 transition-all">
                        <Upload className="h-5 w-5" /> Pilih Foto / PDF
                        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-light/30">
                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-slate-50/30">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Ketik kalimat lengkap, frasa bahasa Inggris, atau ekspresi idiomatis yang ingin Anda bedah di sini..."
                            className="w-full flex-1 resize-none outline-none text-2xl font-medium bg-transparent text-brand-dark placeholder:text-slate-300"
                        />
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" className={`p-2.5 rounded-xl ${isListening ? 'text-red-500 animate-pulse' : ''}`} onClick={() => listen(setSourceText, accent)}>
                                <Mic className="h-6 w-6" />
                            </Button>
                            <Button variant="ghost" className="p-2.5 rounded-xl" onClick={() => speak(sourceText, accent)}>
                                <Volume2 className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-brand-pale/10 justify-between">
                        <div className="flex-1">
                            {isLoading ? <p className="text-2xl animate-pulse text-brand-primary">Menganalisis dan menerjemahkan kalimat...</p>
                                : data?.translation ? <p className="text-2xl font-bold text-brand-dark leading-relaxed">{data.translation}</p>
                                    : <p className="text-2xl text-slate-300 font-medium">Hasil terjemahan kontekstual akan muncul di sini...</p>}
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={handleSave} disabled={!data || isLoading} className="rounded-2xl px-8 py-3.5 text-base">
                                <Save className="h-5 w-5 mr-2" /> Simpan ke Riwayat Kalimat
                            </Button>
                        </div>
                    </div>
                </div>

                {data?.intent && (
                    <div className="p-8 md:p-10 bg-brand-pale/20 border-t border-brand-light/30">
                        <h4 className="text-base font-bold text-amber-600 uppercase tracking-wider mb-3">Analisis Makna & Konteks Budaya:</h4>
                        <div className="text-brand-dark/90 text-xl leading-relaxed space-y-3">
                            {data.intent.split('\n').map((paragraph: string, idx: number) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <DictionaryList type="sentence" />
        </div>
    );
}