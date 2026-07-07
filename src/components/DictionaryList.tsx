import { useState } from 'react';
import { useVocabStore } from '../store/useVocabStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Trash2, Volume2, CheckCircle, XCircle, HelpCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { Pagination } from './ui/Pagination';

export function DictionaryList({ type }: { type: 'word' | 'sentence' }) {
    const { vocabList, deleteVocab } = useVocabStore();
    const { speak } = useSpeech();

    // State untuk menyimpan ID item yang sedang dibuka
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
                        <Card key={item.id} className="overflow-hidden bg-white border-brand-light/40 transition-all shadow-sm hover:shadow-md">

                            {/* HEADER LIST (Selalu Tampil & Bisa Diklik) */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-brand-dark">{item.word}</h4>
                                        {item.phonetic && <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{item.phonetic}</span>}
                                    </div>
                                    <p className="text-sm font-medium text-brand-primary mt-0.5 truncate max-w-[80%]">{item.meaning}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" className="p-2 text-slate-400 hover:text-brand-primary" onClick={(e) => { e.stopPropagation(); speak(item.word); }}>
                                        <Volume2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" className="p-2 text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteVocab(item.id); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <div className="text-slate-300 ml-2">
                                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </div>
                            </div>

                            {/* DETAILS (Muncul kalau di-klik) */}
                            {isExpanded && (
                                <div className="p-4 border-t border-brand-light/20 bg-brand-pale/10 animate-in fade-in slide-in-from-top-2">

                                    {/* Penjelasan Vocab & Contoh Kalimat */}
                                    {type === 'word' && item.examples && (
                                        <div className="space-y-4">
                                            {item.definition && (
                                                <p className="text-sm text-brand-dark/80 font-medium">💡 {item.definition}</p>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div className="bg-white p-3 rounded-lg border border-brand-light/30 shadow-sm">
                                                    <div className="flex gap-1.5 items-center text-green-600 font-bold mb-1"><CheckCircle className="h-3 w-3" /> Positif</div>
                                                    <p className="font-medium text-slate-800">{item.examples.positive.en}</p>
                                                    <p className="text-slate-500 mt-0.5">{item.examples.positive.target}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-brand-light/30 shadow-sm">
                                                    <div className="flex gap-1.5 items-center text-red-500 font-bold mb-1"><XCircle className="h-3 w-3" /> Negatif</div>
                                                    <p className="font-medium text-slate-800">{item.examples.negative.en}</p>
                                                    <p className="text-slate-500 mt-0.5">{item.examples.negative.target}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-brand-light/30 shadow-sm md:col-span-2">
                                                    <div className="flex gap-1.5 items-center text-blue-500 font-bold mb-1"><HelpCircle className="h-3 w-3" /> Tanya</div>
                                                    <p className="font-medium text-slate-800">{item.examples.interrogative.en}</p>
                                                    <p className="text-slate-500 mt-0.5">{item.examples.interrogative.target}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Penjelasan Maksud Kalimat/Idiom */}
                                    {type === 'sentence' && item.intent && (
                                        <div className="bg-white p-4 rounded-xl border border-brand-light/30 text-sm shadow-sm">
                                            <div className="flex gap-1.5 items-center text-amber-500 font-bold mb-2"><Lightbulb className="h-4 w-4" /> Maksud / Konteks</div>
                                            <p className="text-slate-700 leading-relaxed">{item.intent}</p>
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