import { useState, useEffect } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { translateVocab, translateImageOrDoc } from '../services/gemini';
import { useSpeech } from '../hooks/useSpeech';
import { Button } from './ui/Button';
import { Save, Mic, Volume2, Upload, Image as ImageIcon } from 'lucide-react';
import { DictionaryList } from './DictionaryList';

export function VocabBox({ targetLang, accent }: { targetLang: string, accent: string }) {
    const { addVocab } = useVocabStore();
    const { speak, listen, isListening } = useSpeech();
    const [sourceText, setSourceText] = useState('');
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!sourceText.trim()) { setData(null); return; }
        setIsLoading(true);
        const timer = setTimeout(async () => {
            const result = await translateVocab(sourceText, targetLang);
            setData(result);
            setIsLoading(false);
        }, 500);
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
                setData({ translation: result.translation, definition: 'Hasil ekstraksi dan terjemahan gambar/dokumen.' });
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
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
            <div className="text-center space-y-3">
                <span className="text-4xl">📖</span>
                <h2 className="text-4xl font-black text-brand-dark">Vocabulary AI Studio</h2>
                <p className="text-slate-500 text-lg font-medium">Temukan makna kata secara presisi, kuasai cara pengucapan, dan pelajari penggunaannya dalam contoh kalimat positif, negatif, serta tanya secara otomatis.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-brand-light/40 overflow-hidden">

                <div className="p-8 bg-brand-pale/25 border-b border-brand-light/30 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-primary text-white p-3.5 rounded-2xl shadow-md">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base text-brand-dark">Ekstraksi Teks Pintar (OCR)</h4>
                            <p className="text-sm text-slate-500">Punya foto halaman buku, artikel, atau dokumen digital? Unggah di sini dan biarkan AI mendeteksi serta menerjemahkan kata-kata sulit untuk Anda secara instan.</p>
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
                            placeholder="Tulis satu kata asing di sini untuk mulai menganalisis..."
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

                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-brand-pale/10 relative justify-between">
                        <div className="flex-1">
                            {isLoading ? <p className="text-2xl animate-pulse text-brand-primary">Menganalisis kosakata dengan AI...</p>
                                : data?.translation ? (
                                    <>
                                        <p className="text-4xl font-extrabold text-brand-dark">{data.translation}</p>
                                        {data.phonetic && <p className="font-mono text-base text-slate-400 mt-3">{data.phonetic}</p>}
                                    </>
                                ) : <p className="text-2xl text-slate-300 font-medium">Hasil analisis kosakata dan maknanya akan muncul di sini...</p>}
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={handleSave} disabled={!data || isLoading} className="rounded-2xl px-8 py-3.5 text-base">
                                <Save className="h-5 w-5 mr-2" /> Simpan ke Riwayat Belajar
                            </Button>
                        </div>
                    </div>
                </div>

                {data?.definition && (
                    <div className="p-8 md:p-10 bg-brand-pale/20 border-t border-brand-light/30">
                        <p className="font-bold mb-6 text-brand-dark/90 text-xl flex items-center gap-3">💡 {data.definition}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
                            <div className="bg-white p-6 rounded-3xl border border-brand-light/40 shadow-sm">
                                <span className="font-bold text-green-600 block mb-2 text-lg">Positif (+)</span>
                                <p className="font-semibold text-slate-900">{data.examples?.positive?.en}</p>
                                <p className="text-slate-500 mt-2">{data.examples?.positive?.target}</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-brand-light/40 shadow-sm">
                                <span className="font-bold text-red-500 block mb-2 text-lg">Negatif (-)</span>
                                <p className="font-semibold text-slate-900">{data.examples?.negative?.en}</p>
                                <p className="text-slate-500 mt-2">{data.examples?.negative?.target}</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-brand-light/40 shadow-sm">
                                <span className="font-bold text-blue-500 block mb-2 text-lg">Tanya (?)</span>
                                <p className="font-semibold text-slate-900">{data.examples?.interrogative?.en}</p>
                                <p className="text-slate-500 mt-2">{data.examples?.interrogative?.target}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DictionaryList type="word" />
        </div>
    );
}