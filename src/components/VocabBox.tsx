import { useState, useEffect, useRef } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { fetchWordFromDictionary } from '../services/dictionary';
import { translateImageOrDoc } from '../services/gemini';
import { useSpeech } from '../hooks/useSpeech';
import { Button } from './ui/Button';
import { Save, Mic, Volume2, Upload, Copy, Check } from 'lucide-react';
import { DictionaryList } from './DictionaryList';

export function VocabBox({ targetLang, accent }: { targetLang: string, accent: string }) {
    const { addVocab } = useVocabStore();
    const { speak, listen, isListening } = useSpeech();
    const [sourceText, setSourceText] = useState('');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 1500);
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [sourceText]);

    useEffect(() => {
        if (!sourceText.trim()) { setData(null); return; }
        setIsLoading(true);
        const timer = setTimeout(async () => {
            const result = await fetchWordFromDictionary(sourceText, targetLang);
            setData(result);
            setIsLoading(false);
        }, 400);
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
                setData({ translation: result.translation, definition: 'Hasil ekstraksi dari dokumen/gambar.' });
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
            phonetic: data.phonetic,
            definition: data.definition,
            examples: data.examples,
            type: 'word'
        });
        setSourceText(''); setData(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
                <span className="text-4xl">📖</span>
                <h2 className="text-4xl font-black text-brand-dark">Kamus Kosakata AI</h2>
                <p className="text-slate-500 text-lg font-medium">Tuliskan kata asing untuk membedah maknanya secara akurat, mendengarkan pelafalan fonetis, serta mendapatkan contoh kalimat interaktif.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-brand-light/40 overflow-hidden">

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-light/30">
                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-slate-50/30">
                        <textarea
                            ref={textareaRef}
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Tulis satu kata asing di sini untuk mulai menganalisis..."
                            className="w-full resize-none overflow-hidden outline-none text-2xl font-medium bg-transparent text-brand-dark placeholder:text-slate-300 min-h-[140px]"
                        />
                        <div className="flex gap-3 mt-6 items-center">
                            <Button
                                variant="ghost"
                                className={`p-2.5 rounded-xl ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-brand-primary'}`}
                                onClick={() => listen(setSourceText, accent)}
                                title="Bicara untuk menulis (Voice Typing)"
                            >
                                <Mic className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="p-2.5 rounded-xl text-slate-400 hover:text-brand-primary"
                                onClick={() => speak(sourceText, accent)}
                                title="Dengarkan pengucapan"
                            >
                                <Volume2 className="h-6 w-6" />
                            </Button>
                            <label
                                className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center"
                                title="Unggah Gambar / PDF (Ekstrak Teks OCR)"
                            >
                                <Upload className="h-6 w-6" />
                                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-brand-pale/10 relative justify-between">
                        <div className="flex-1">
                            {isLoading ? <p className="text-2xl animate-pulse text-brand-primary">Menganalisis kata...</p>
                                : data?.translation ? (
                                    <>
                                        <p className="text-4xl font-extrabold text-brand-dark">{data.translation}</p>
                                        {data.phonetic && <p className="font-mono text-base text-slate-400 mt-3">{data.phonetic}</p>}
                                    </>
                                ) : <p className="text-2xl text-slate-300 font-medium">Hasil analisis kosakata dan maknanya akan muncul di sini...</p>}
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button variant="primary" onClick={handleSave} disabled={!data || isLoading} className="rounded-2xl px-8 py-3.5 text-base">
                                <Save className="h-5 w-5 mr-2" /> Simpan ke Riwayat Belajar
                            </Button>
                        </div>
                    </div>
                </div>

                {data?.definition && (
                    <div className="p-8 md:p-10 bg-brand-pale/20 border-t border-brand-light/30">
                        <p className="font-bold mb-6 text-brand-dark/90 text-2xl flex items-center gap-3">💡 {data.definition}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
                            <div className="bg-white p-6 rounded-[2rem] border border-brand-light/40 shadow-sm">
                                <span className="font-bold text-green-600 block mb-2.5 text-lg">Positif (+)</span>
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-extrabold text-lg md:text-xl text-slate-900 leading-normal">{data.examples?.positive?.en}</p>
                                    <button 
                                        onClick={() => handleCopy(data.examples?.positive?.en)}
                                        className="text-slate-400 hover:text-brand-primary p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                        title="Salin Kalimat"
                                    >
                                        {copiedText === data.examples?.positive?.en ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-base text-slate-600 mt-2.5 font-medium leading-relaxed">{data.examples?.positive?.target}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-brand-light/40 shadow-sm">
                                <span className="font-bold text-red-500 block mb-2.5 text-lg">Negatif (-)</span>
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-extrabold text-lg md:text-xl text-slate-900 leading-normal">{data.examples?.negative?.en}</p>
                                    <button 
                                        onClick={() => handleCopy(data.examples?.negative?.en)}
                                        className="text-slate-400 hover:text-brand-primary p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                        title="Salin Kalimat"
                                    >
                                        {copiedText === data.examples?.negative?.en ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-base text-slate-600 mt-2.5 font-medium leading-relaxed">{data.examples?.negative?.target}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-brand-light/40 shadow-sm">
                                <span className="font-bold text-blue-500 block mb-2.5 text-lg">Tanya (?)</span>
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-extrabold text-lg md:text-xl text-slate-900 leading-normal">{data.examples?.interrogative?.en}</p>
                                    <button 
                                        onClick={() => handleCopy(data.examples?.interrogative?.en)}
                                        className="text-slate-400 hover:text-brand-primary p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                        title="Salin Kalimat"
                                    >
                                        {copiedText === data.examples?.interrogative?.en ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-base text-slate-600 mt-2.5 font-medium leading-relaxed">{data.examples?.interrogative?.target}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DictionaryList type="word" accent={accent} />
        </div>
    );
}