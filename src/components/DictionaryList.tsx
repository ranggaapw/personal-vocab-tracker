import { useState } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Trash2, Volume2, CheckCircle, XCircle, HelpCircle, Lightbulb, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { Pagination } from './ui/Pagination';

export function DictionaryList({ type, accent = 'en-US' }: { type: 'word' | 'sentence'; accent?: string }) {
    const { vocabList, deleteVocab } = useVocabStore();
    const { speak } = useSpeech();

    // State untuk menyimpan ID item yang sedang dibuka
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 1500);
    };

    // State untuk Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredList = vocabList.filter(v => v.type === type);

    if (filteredList.length === 0) return null;

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    // Hitung halaman yang valid
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const validCurrentPage = Math.min(currentPage, totalPages || 1);

    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

    const handleItemsPerPageChange = (size: number) => {
        setItemsPerPage(size);
        setCurrentPage(1);
    };

    return (
        <div className="mt-8">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                History Tersimpan ({filteredList.length})
            </h3>

            <div className="flex flex-col gap-3">
                {paginatedList.map((item) => {
                    const isExpanded = expandedId === item.id;

                    return (
                        <Card key={item.id} className={`overflow-hidden bg-white border transition-all shadow-sm hover:shadow-md ${type === 'word' ? 'border-brand-light/40' : 'border-indigo-100'}`}>

                            {/* HEADER LIST (Selalu Tampil & Bisa Diklik) */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-xl font-extrabold text-brand-dark">{item.word}</h4>
                                        {item.phonetic && <span className={`text-sm font-mono px-2 py-0.5 rounded ${type === 'word' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>{item.phonetic}</span>}
                                    </div>
                                    <p className={`text-base font-semibold mt-0.5 truncate max-w-[80%] ${type === 'word' ? 'text-brand-primary' : 'text-indigo-600'}`}>{item.meaning}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" className={`p-2 text-slate-400 ${type === 'word' ? 'hover:text-brand-primary hover:bg-brand-pale' : 'hover:text-indigo-600 hover:bg-indigo-50'}`} onClick={(e) => { e.stopPropagation(); speak(item.word, accent); }}>
                                        <Volume2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteVocab(item.id); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="text-slate-300 ml-2">
                                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>
                            </div>

                            {/* DETAILS (Muncul kalau di-klik) */}
                            {isExpanded && (
                                <div className={`p-6 border-t animate-in fade-in slide-in-from-top-2 ${type === 'word' ? 'bg-brand-pale/10 border-brand-light/20' : 'bg-indigo-50/20 border-indigo-100/60'}`}>

                                    {/* Penjelasan Vocab & Contoh Kalimat */}
                                    {type === 'word' && item.examples && (
                                        <div className="space-y-4">
                                            {item.definition && (
                                                <p className="text-base md:text-lg text-brand-dark/90 font-semibold leading-relaxed">💡 {item.definition}</p>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                                                <div className="bg-white p-5 rounded-2xl border border-brand-light/30 shadow-sm">
                                                    <div className="flex gap-2 items-center text-green-600 font-extrabold mb-1.5 text-sm md:text-base"><CheckCircle className="h-4 w-4" /> Positif</div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="font-extrabold text-base md:text-lg text-slate-900 leading-normal">{item.examples?.positive?.en}</p>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleCopy(item.examples?.positive?.en || ''); }}
                                                            className="text-slate-400 hover:text-brand-primary p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                                            title="Salin Kalimat"
                                                        >
                                                            {copiedText === item.examples?.positive?.en ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm md:text-base text-slate-600 mt-1.5 font-medium leading-relaxed">{item.examples?.positive?.target}</p>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl border border-brand-light/30 shadow-sm">
                                                    <div className="flex gap-2 items-center text-red-500 font-extrabold mb-1.5 text-sm md:text-base"><XCircle className="h-4 w-4" /> Negatif</div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="font-extrabold text-base md:text-lg text-slate-900 leading-normal">{item.examples?.negative?.en}</p>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleCopy(item.examples?.negative?.en || ''); }}
                                                            className="text-slate-400 hover:text-brand-primary p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                                            title="Salin Kalimat"
                                                        >
                                                            {copiedText === item.examples?.negative?.en ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm md:text-base text-slate-600 mt-1.5 font-medium leading-relaxed">{item.examples?.negative?.target}</p>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl border border-brand-light/30 shadow-sm md:col-span-2">
                                                    <div className="flex gap-2 items-center text-blue-500 font-extrabold mb-1.5 text-sm md:text-base"><HelpCircle className="h-4 w-4" /> Tanya</div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="font-extrabold text-base md:text-lg text-slate-900 leading-normal">{item.examples?.interrogative?.en}</p>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleCopy(item.examples?.interrogative?.en || ''); }}
                                                            className="text-slate-400 hover:text-brand-primary p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                                                            title="Salin Kalimat"
                                                        >
                                                            {copiedText === item.examples?.interrogative?.en ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm md:text-base text-slate-600 mt-1.5 font-medium leading-relaxed">{item.examples?.interrogative?.target}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Penjelasan Maksud Kalimat/Idiom */}
                                    {type === 'sentence' && item.intent && (
                                        <div className="bg-white p-6 rounded-2xl border border-indigo-100 text-base shadow-sm">
                                            <div className="flex gap-2 items-center text-amber-500 font-extrabold mb-3 text-base md:text-lg"><Lightbulb className="h-5 w-5" /> Analisis Makna & Konteks Budaya</div>
                                            <p className="text-slate-700 leading-relaxed text-base md:text-lg font-medium whitespace-pre-wrap">{item.intent}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </Card>
                    );
                })}
            </div>

            <Pagination
                currentPage={validCurrentPage}
                totalItems={filteredList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        </div>
    );
}