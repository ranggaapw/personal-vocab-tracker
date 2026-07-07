import { useState, useEffect } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { translateText } from '../services/gemini';
import { useSpeech } from '../hooks/useSpeech';
import { Button } from './ui/Button';
import { LanguageSelect } from './ui/LanguageSelect';
import { ArrowRightLeft, Save, Sparkles, Mic, Volume2, CheckCircle2, XCircle } from 'lucide-react';

// Pemetaan bahasa untuk AI Speaker Hasil Terjemahan
const TARGET_LANG_CODES: Record<string, string> = {
    Indonesian: 'id-ID',
    Japanese: 'ja-JP',
    Korean: 'ko-KR',
    Spanish: 'es-ES',
    French: 'fr-FR',
    German: 'de-DE'
};

export function TranslatorBox() {
    const { addVocab } = useVocabStore();
    const { speak, listen, isListening } = useSpeech();

    const [sourceText, setSourceText] = useState('');
    const [translationData, setTranslationData] = useState<{
        translation: string;
        phonetic?: string;
        source?: 'Dictionary' | 'Gemini AI'
    } | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [targetLang, setTargetLang] = useState('Indonesian');
    const [accent, setAccent] = useState('en-US');

    // State untuk Fitur Tes Pelafalan
    const [practiceStatus, setPracticeStatus] = useState<'idle' | 'listening' | 'success' | 'fail'>('idle');
    const [spokenText, setSpokenText] = useState('');

    // Auto Translate (Hybrid API: Dictionary / Gemini) dengan Debounce 500ms
    useEffect(() => {
        if (!sourceText.trim()) {
            setTranslationData(null);
            setPracticeStatus('idle');
            return;
        }

        setIsTranslating(true);

        const delayDebounceFn = setTimeout(async () => {
            const result = await translateText(sourceText, targetLang);
            setTranslationData(result);
            setIsTranslating(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [sourceText, targetLang]);

    const handleSaveVocab = () => {
        if (!sourceText.trim() || !translationData?.translation) return;

        addVocab({
            word: sourceText.trim(),
            meaning: translationData.translation,
            phonetic: translationData.phonetic || '',
            type: sourceText.split(/\s+/).length > 2 ? 'sentence' : 'word',
            examples: {
                positive: { en: '-', target: '-' },
                negative: { en: '-', target: '-' },
                interrogative: { en: '-', target: '-' }
            },
        });

        setSourceText('');
        setTranslationData(null);
        setPracticeStatus('idle');
    };

    // Logic Voice Typing Biasa
    const handleVoiceTyping = () => {
        if (!isListening) listen((text) => setSourceText(text), accent);
    };

    // Logic Tes Pelafalan
    const handlePracticePronunciation = () => {
        setPracticeStatus('listening');
        listen(
            (text) => {
                setSpokenText(text);
                // Normalisasi teks (hapus tanda baca & kecilkan huruf) agar perbandingan akurat
                const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

                if (normalize(text) === normalize(sourceText)) {
                    setPracticeStatus('success');
                } else {
                    setPracticeStatus('fail');
                }

                // Reset status kembali ke idle setelah 5 detik
                setTimeout(() => setPracticeStatus('idle'), 5000);
            },
            accent,
            () => {
                // Jika mic mati tanpa hasil
                setPracticeStatus(prev => prev === 'listening' ? 'idle' : prev);
            }
        );
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-brand-dark/5 border border-brand-light/40 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:shadow-brand-dark/10">

            {/* Header Bar: Aksen & Dropdown Bahasa */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light/30 bg-slate-50/50 flex-wrap gap-4">

                {/* Kiri: Pilihan Aksen & Mic Voice Typing */}
                <div className="flex items-center gap-4">
                    <select
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        className="bg-transparent font-bold text-slate-600 outline-none cursor-pointer text-sm"
                    >
                        <option value="en-US">🇺🇸 US Accent</option>
                        <option value="en-GB">🇬🇧 UK Accent</option>
                        <option value="en-AU">🇦🇺 AU Accent</option>
                    </select>

                    <Button
                        variant="ghost"
                        className={`p-2 h-auto rounded-full transition-all ${isListening && practiceStatus === 'idle' ? 'text-red-500 bg-red-100 animate-pulse' : 'text-slate-400 hover:text-brand-primary hover:bg-brand-pale'}`}
                        onClick={handleVoiceTyping}
                        title="Voice Typing (Speak to type)"
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                </div>

                <div className="bg-white p-2 rounded-full border border-brand-light/30 shadow-sm hidden md:block">
                    <ArrowRightLeft className="h-4 w-4 text-brand-primary" />
                </div>

                {/* Kanan: Pilihan Target Bahasa */}
                <div className="flex items-center gap-2">
                    <LanguageSelect value={targetLang} onChange={setTargetLang} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row min-h-[280px]">

                {/* KIRI: Input & Pronunciation Checker */}
                <div className="flex-1 p-6 md:p-8 relative group flex flex-col">
                    <textarea
                        value={sourceText}
                        onChange={(e) => {
                            setSourceText(e.target.value);
                            setPracticeStatus('idle');
                        }}
                        placeholder="Type or speak english text here..."
                        className="w-full h-full min-h-[120px] resize-none outline-none text-2xl font-medium bg-transparent text-brand-dark placeholder:text-slate-300 transition-colors"
                    />

                    {/* Action Area Kiri (Muncul saat ada teks) */}
                    {sourceText && (
                        <div className="mt-6 flex flex-col gap-4 border-t border-brand-light/20 pt-4">
                            <div className="flex justify-between items-center">
                                {translationData?.phonetic && (
                                    <span className="text-brand-primary font-mono text-sm bg-brand-pale/60 px-2.5 py-1 rounded-md border border-brand-light/30">
                                        {translationData.phonetic}
                                    </span>
                                )}

                                <div className="flex gap-2 ml-auto">
                                    {/* AI Speaker Asli */}
                                    <Button variant="secondary" className="p-2.5 h-auto rounded-xl" onClick={() => speak(sourceText, accent)} title="Listen to AI">
                                        <Volume2 className="h-5 w-5 text-brand-primary" />
                                    </Button>

                                    {/* Tombol Test Pelafalan */}
                                    <Button
                                        variant={practiceStatus === 'listening' ? 'danger' : 'primary'}
                                        className={`rounded-xl gap-2 ${practiceStatus === 'listening' && 'animate-pulse'}`}
                                        onClick={handlePracticePronunciation}
                                    >
                                        <Mic className="h-4 w-4" />
                                        {practiceStatus === 'listening' ? 'Listening...' : 'Test Pronunciation'}
                                    </Button>
                                </div>
                            </div>

                            {/* Feedback Hasil Pelafalan */}
                            {practiceStatus === 'success' && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Perfect pronunciation!
                                </div>
                            )}
                            {practiceStatus === 'fail' && (
                                <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                    <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block">Not quite right. AI heard:</span>
                                        <span className="italic">"{spokenText}"</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* KANAN: Hasil Translasi & Tombol Suara */}
                <div className="flex-1 p-6 md:p-8 bg-brand-pale/15 md:border-l border-brand-light/30 relative flex flex-col justify-between">
                    <div className="flex-1">
                        {isTranslating ? (
                            <div className="flex gap-2 items-center text-brand-primary animate-pulse">
                                <Sparkles className="h-5 w-5" />
                                <p className="text-2xl font-medium">Translating...</p>
                            </div>
                        ) : translationData?.translation ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <p className="text-xl md:text-2xl font-medium text-brand-dark leading-relaxed whitespace-pre-wrap">
                                        {translationData.translation}
                                    </p>

                                    {/* Badge Indikator Sumber Data */}
                                    {translationData.source && (
                                        <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-md border border-brand-light/30 shadow-sm flex items-center gap-1.5">
                                            {translationData.source === 'Dictionary' ? '⚡ API' : '✨ Gemini'}
                                        </span>
                                    )}
                                </div>

                                {/* AI Speaker untuk Target Bahasa */}
                                <Button
                                    variant="ghost"
                                    className="p-2 h-auto rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-pale"
                                    // Hanya baca baris pertama jika ada text "Def: " di baris selanjutnya
                                    onClick={() => speak(translationData.translation.split('\n')[0], TARGET_LANG_CODES[targetLang])}
                                    title={`Listen in ${targetLang}`}
                                >
                                    <Volume2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <p className="text-2xl font-medium text-brand-dark/20">Translation</p>
                        )}
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={handleSaveVocab}
                            disabled={!translationData?.translation || isTranslating}
                            className="bg-brand-dark text-white hover:bg-brand-primary rounded-xl px-6 py-3 gap-2 shadow-lg hover:shadow-brand-primary/30 transition-all text-sm"
                        >
                            <Save className="h-4 w-4" /> Save Vocab
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}