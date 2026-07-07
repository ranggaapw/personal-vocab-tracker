import { useState, useEffect, useRef } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { translateSentence, translateImageOrDoc } from '../services/gemini';
import { useSpeech } from '../hooks/useSpeech';
import { Button } from './ui/Button';
import { Save, Mic, Volume2, Upload } from 'lucide-react';
import { DictionaryList } from './DictionaryList';

export function SentenceBox({ targetLang, accent }: { targetLang: string, accent: string }) {
    const { addVocab } = useVocabStore();
    const { speak, listen, isListening } = useSpeech();
    const [sourceText, setSourceText] = useState('');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <div className="w-full max-w-full mx-auto space-y-10 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
                <span className="text-4xl">✍️</span>
                <h2 className="text-4xl font-black text-brand-dark">Detektor Kalimat & Idiom</h2>
                <p className="text-slate-500 text-lg font-medium">Terjemahkan frasa rumit atau ungkapan kiasan bahasa Inggris dengan penjelasan maksud kontekstual dan analisis budaya yang mendalam secara instan.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-indigo-100 overflow-hidden">

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-indigo-100">
                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-slate-50/30">
                        <textarea
                            ref={textareaRef}
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Ketik kalimat lengkap, frasa bahasa Inggris, atau ekspresi idiomatis yang ingin Anda bedah di sini..."
                            className="w-full resize-none overflow-hidden outline-none text-2xl font-medium bg-transparent text-brand-dark placeholder:text-slate-300 min-h-[140px]"
                        />
                        <div className="flex gap-3 mt-6 items-center">
                            <Button 
                                variant="ghost" 
                                className={`p-2.5 rounded-xl ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-indigo-650'}`} 
                                onClick={() => listen(setSourceText, accent)}
                                title="Bicara untuk menulis (Voice Typing)"
                            >
                                <Mic className="h-6 w-6" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-650" 
                                onClick={() => speak(sourceText, accent)}
                                title="Dengarkan pengucapan"
                            >
                                <Volume2 className="h-6 w-6" />
                            </Button>
                            <label 
                                className="cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-650 transition-all flex items-center justify-center"
                                title="Unggah Gambar / PDF (Ekstrak Teks OCR)"
                            >
                                <Upload className="h-6 w-6" />
                                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-indigo-50/10 justify-between">
                        <div className="flex-1">
                            {isLoading ? <p className="text-2xl animate-pulse text-indigo-600">Menganalisis dan menerjemahkan kalimat...</p>
                                : data?.translation ? <p className="text-2xl font-bold text-brand-dark leading-relaxed">{data.translation}</p>
                                    : <p className="text-2xl text-slate-300 font-medium">Hasil terjemahan kontekstual akan muncul di sini...</p>}
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button variant="indigo" onClick={handleSave} disabled={!data || isLoading} className="rounded-2xl px-8 py-3.5 text-base">
                                <Save className="h-5 w-5 mr-2" /> Simpan ke Riwayat Kalimat
                            </Button>
                        </div>
                    </div>
                </div>

                {data?.intent && (
                    <div className="p-8 md:p-10 bg-indigo-50/20 border-t border-indigo-100">
                        <h4 className="text-base font-bold text-indigo-800 uppercase tracking-wider mb-3">Analisis Makna & Konteks Budaya:</h4>
                        <div className="text-brand-dark/90 text-xl leading-relaxed space-y-3">
                            {data.intent.split('\n').map((paragraph: string, idx: number) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <DictionaryList type="sentence" accent={accent} />
        </div>
    );
}