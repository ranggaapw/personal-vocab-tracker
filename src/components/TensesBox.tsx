import { useState, useRef, useEffect } from 'react';
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

const TENSES_DETAILS: Record<string, { formula: string[]; example: string[]; description: string }> = {
    "Simple Present": {
        formula: [
            "(+) S + V1 (s/es) / is/am/are",
            "(-) S + do/does + not + V1 / is/am/are + not",
            "(?) Do/Does + S + V1? / Is/Am/Are + S?"
        ],
        example: [
            "She writes a letter every day.",
            "She does not write a letter.",
            "Does she write a letter?"
        ],
        description: "Menyatakan fakta umum, kebiasaan rutin, atau peristiwa nyata yang terjadi saat ini."
    },
    "Present Continuous": {
        formula: [
            "(+) S + is/am/are + V-ing",
            "(-) S + is/am/are + not + V-ing",
            "(?) Is/Am/Are + S + V-ing?"
        ],
        example: [
            "They are playing football now.",
            "They are not playing football.",
            "Are they playing football?"
        ],
        description: "Menyatakan aksi yang sedang berlangsung saat ini atau rencana di masa depan."
    },
    "Present Perfect": {
        formula: [
            "(+) S + have/has + V3",
            "(-) S + have/has + not + V3",
            "(?) Have/Has + S + V3?"
        ],
        example: [
            "We have finished our homework.",
            "We have not finished homework.",
            "Have we finished our homework?"
        ],
        description: "Menyatakan peristiwa yang telah selesai tetapi dampak/hasilnya masih dirasakan."
    },
    "Present Perfect Continuous": {
        formula: [
            "(+) S + have/has + been + V-ing",
            "(-) S + have/has + not + been + V-ing",
            "(?) Have/Has + S + been + V-ing?"
        ],
        example: [
            "He has been studying for two hours.",
            "He has not been studying.",
            "Has he been studying?"
        ],
        description: "Menyatakan aksi yang dimulai di masa lalu dan masih berlangsung terus hingga kini."
    },
    "Simple Past": {
        formula: [
            "(+) S + V2 / was/were",
            "(-) S + did + not + V1 / was/were + not",
            "(?) Did + S + V1? / Was/Were + S?"
        ],
        example: [
            "I bought a new phone yesterday.",
            "I did not buy a new phone.",
            "Did you buy a new phone?"
        ],
        description: "Menyatakan kejadian atau aktivitas yang selesai di masa lalu pada waktu tertentu."
    },
    "Past Continuous": {
        formula: [
            "(+) S + was/were + V-ing",
            "(-) S + was/were + not + V-ing",
            "(?) Was/Were + S + V-ing?"
        ],
        example: [
            "She was reading a book.",
            "She was not reading a book.",
            "Was she reading a book?"
        ],
        description: "Menyatakan peristiwa yang sedang berlangsung di masa lalu ketika peristiwa lain terjadi."
    },
    "Past Perfect": {
        formula: [
            "(+) S + had + V3",
            "(-) S + had + not + V3",
            "(?) Had + S + V3?"
        ],
        example: [
            "The train had left when we arrived.",
            "The train had not left.",
            "Had the train left?"
        ],
        description: "Menyatakan kejadian yang sudah selesai sebelum kejadian masa lalu lainnya terjadi."
    },
    "Past Perfect Continuous": {
        formula: [
            "(+) S + had + been + V-ing",
            "(-) S + had + not + been + V-ing",
            "(?) Had + S + been + V-ing?"
        ],
        example: [
            "We had been waiting for an hour.",
            "We had not been waiting.",
            "Had you been waiting?"
        ],
        description: "Menyatakan durasi peristiwa yang telah berlangsung sebelum peristiwa lain di masa lalu."
    },
    "Simple Future": {
        formula: [
            "(+) S + will/shall + V1 / is/am/are + going to",
            "(-) S + will + not + V1 / is/am/are + not + going to",
            "(?) Will + S + V1? / Is/Am/Are + S + going to?"
        ],
        example: [
            "I will call you tomorrow.",
            "I will not call you tomorrow.",
            "Will you call me tomorrow?"
        ],
        description: "Menyatakan kejadian yang akan dilakukan atau diprediksi terjadi di masa mendatang."
    },
    "Future Continuous": {
        formula: [
            "(+) S + will + be + V-ing",
            "(-) S + will + not + be + V-ing",
            "(?) Will + S + be + V-ing?"
        ],
        example: [
            "I will be sleeping at midnight.",
            "I will not be sleeping.",
            "Will you be sleeping?"
        ],
        description: "Menyatakan peristiwa yang akan sedang berlangsung pada waktu tertentu di masa depan."
    },
    "Future Perfect": {
        formula: [
            "(+) S + will + have + V3",
            "(-) S + will + not + have + V3",
            "(?) Will + S + have + V3?"
        ],
        example: [
            "By next month, he will have completed it.",
            "He will not have completed it.",
            "Will he have completed it?"
        ],
        description: "Menyatakan aktivitas yang akan sudah selesai diselesaikan pada masa depan."
    },
    "Future Perfect Continuous": {
        formula: [
            "(+) S + will + have + been + V-ing",
            "(-) S + will + not + have + been + V-ing",
            "(?) Will + S + have + been + V-ing?"
        ],
        example: [
            "She will have been working here for years.",
            "She will not have been working.",
            "Will she have been working?"
        ],
        description: "Menyatakan durasi aktivitas yang akan sedang dan telah berjalan pada masa depan."
    },
    "Simple Past Future": {
        formula: [
            "(+) S + would + V1 / was/were + going to + V1",
            "(-) S + would + not + V1 / was/were + not + going to",
            "(?) Would + S + V1? / Was/Were + S + going to?"
        ],
        example: [
            "I would help you if I had time.",
            "I would not help you.",
            "Would you help me?"
        ],
        description: "Menyatakan pengandaian, rencana, atau prediksi masa depan dari sudut pandang masa lalu."
    },
    "Past Future Continuous": {
        formula: [
            "(+) S + would + be + V-ing",
            "(-) S + would + not + be + V-ing",
            "(?) Would + S + be + V-ing?"
        ],
        example: [
            "I knew they would be playing games.",
            "They would not be playing games.",
            "Would they be playing games?"
        ],
        description: "Menyatakan aktivitas yang direncanakan sedang berlangsung di masa lalu."
    },
    "Past Future Perfect": {
        formula: [
            "(+) S + would + have + V3",
            "(-) S + would + not + have + V3",
            "(?) Would + S + have + V3?"
        ],
        example: [
            "She would have passed if she studied.",
            "She would not have passed.",
            "Would she have passed?"
        ],
        description: "Menyatakan pengandaian masa lalu yang tidak terwujud (penyesalan/alternatif)."
    },
    "Past Future Perfect Continuous": {
        formula: [
            "(+) S + would + have + been + V-ing",
            "(-) S + would + not + have + been + V-ing",
            "(?) Would + S + have + been + V-ing?"
        ],
        example: [
            "We would have been living here for a year.",
            "We would not have been living here.",
            "Would you have been living here?"
        ],
        description: "Menyatakan durasi aktivitas bersyarat yang seharusnya sudah selesai di masa lalu."
    }
};

export function TensesBox({ targetLang, accent, consumeToken }: { targetLang: string, accent: string, consumeToken: () => boolean }) {
    const { speak, listen, isListening } = useSpeech();
    const [sourceText, setSourceText] = useState('');
    const [selectedTense, setSelectedTense] = useState(TENSES_LIST[0]);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [sourceText]);

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
            {/* 1. Header Halaman */}
            <div className="text-center space-y-3">
                <span className="text-4xl">⚡</span>
                <h2 className="text-4xl font-black text-brand-dark">Konverter & Formula 16 Tenses</h2>
                <p className="text-slate-500 text-lg font-medium">Masukkan kalimat dasar Anda dan konversikan ke salah satu dari 16 tenses secara instan, lengkap dengan panduan rumus tata bahasa yang benar.</p>
            </div>
            {/* 2. Section Rumus & Panduan Tenses (Pilihan & Preview) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-brand-dark/5 border border-emerald-100/60 grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                {/* Dropdown pemilih */}
                <div className="md:col-span-1 bg-emerald-50/30 border border-emerald-100/60 rounded-[1.8rem] p-6 flex flex-col justify-center gap-3.5 shadow-sm">
                    <label className="text-sm font-extrabold text-emerald-850 uppercase tracking-wider block">Pilih Tenses:</label>
                    <div className="relative">
                        <select
                            value={selectedTense}
                            onChange={(e) => {
                                setSelectedTense(e.target.value);
                                setData(null);
                            }}
                            className="w-full bg-white font-bold text-emerald-900 px-4 py-3.5 rounded-2xl border border-emerald-150 outline-none cursor-pointer text-base shadow-sm focus:border-emerald-500 focus:bg-white transition-all"
                        >
                            {TENSES_LIST.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Info rumus, contoh, & penggunaan dari tenses terpilih */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 items-stretch">
                    <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-[1.8rem] p-6 shadow-inner flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block mb-3">Rumus Struktur:</span>
                            <div className="space-y-2 font-mono text-sm md:text-base text-emerald-950 font-black leading-relaxed">
                                {TENSES_DETAILS[selectedTense]?.formula.map((f, i) => (
                                    <div key={i} className="border-b border-emerald-100/30 pb-1.5 last:border-0 last:pb-0">{f}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-[1.8rem] p-6 shadow-inner flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block mb-3">Contoh Kalimat:</span>
                            <div className="space-y-2 text-sm md:text-base text-slate-800 font-extrabold italic leading-relaxed">
                                {TENSES_DETAILS[selectedTense]?.example.map((e, i) => (
                                    <div key={i} className="border-b border-emerald-100/30 pb-1.5 last:border-0 last:pb-0">"{e}"</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-[1.8rem] p-6 shadow-inner flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block mb-3">Fungsi Penggunaan:</span>
                            <p className="text-sm text-slate-650 font-bold leading-relaxed">
                                {TENSES_DETAILS[selectedTense]?.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Section Form & Konversi Kalimat AI */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-emerald-100/60 overflow-hidden">
                <div className="p-6 md:p-8 bg-emerald-50/70 border-b border-emerald-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-md">
                            <BookOpenCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-emerald-900">Transformasi Kalimat AI</h3>
                            <p className="text-xs text-emerald-700/80 font-medium">Ubah kalimat dasar Anda ke bentuk {selectedTense} menggunakan kecerdasan buatan.</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={!sourceText.trim() || isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 py-3.5 shadow-lg shadow-emerald-600/25 text-base font-bold"
                    >
                        <Wand2 className={`h-5 w-5 mr-2.5 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Mentransformasi...' : 'Konversi Tenses'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-emerald-100/60">
                    <div className="p-8 md:p-10 flex flex-col min-h-[260px] bg-slate-50/30">
                        <textarea
                            ref={textareaRef}
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Ketik kalimat dasar dalam bahasa Inggris di sini (contoh: I write a letter)..."
                            className="w-full resize-none overflow-hidden outline-none text-2xl font-medium bg-transparent text-brand-dark placeholder:text-slate-300 min-h-[140px]"
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
                            {isLoading ? (
                                <p className="text-2xl animate-pulse text-emerald-600 font-bold">Mengonversi bentuk tenses dengan AI...</p>
                            ) : data?.sentence ? (
                                <>
                                    <div className="bg-emerald-100/60 px-4 py-2 rounded-xl text-sm font-mono text-emerald-900 mb-5 w-fit font-black border border-emerald-300 shadow-sm">
                                        Rumus Terpakai: {data.formula}
                                    </div>
                                    <h4 className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider mb-2">Kalimat Hasil Konversi:</h4>
                                    <p className="text-3xl font-extrabold text-brand-dark mb-2.5 leading-snug">{data.sentence}</p>
                                    <p className="text-lg text-slate-500 font-medium italic mb-6">{data.translation}</p>
                                </>
                            ) : (
                                <p className="text-2xl text-slate-300 font-medium">Hasil konversi kalimat dalam bentuk tense yang dipilih akan muncul di sini...</p>
                            )}
                        </div>
                        {data?.sentence && (
                            <div className="flex justify-end mt-4">
                                <Button variant="ghost" className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl" onClick={() => speak(data.sentence, accent)}>
                                    <Volume2 className="h-6 w-6" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {data?.explanation && (
                    <div className="p-8 md:p-10 bg-emerald-50/20 border-t border-emerald-100/60">
                        <h4 className="text-lg font-bold text-emerald-800 uppercase tracking-wider mb-3">Analisis Rumus & Penjelasan:</h4>
                        <p className="text-xl text-brand-dark/90 leading-relaxed font-medium">💡 {data.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
}