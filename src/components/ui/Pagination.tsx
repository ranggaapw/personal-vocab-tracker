import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
}

export function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1 && itemsPerPage >= totalItems && itemsPerPage === 10) return null; // Sembunyikan jika data dikit dan page size default

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

    // Hitung range tombol angka yang ditampilkan (max 5 tombol di tengah)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white border border-brand-light/30 rounded-3xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Info Range Data & Selector Page Size */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="text-sm text-slate-500 font-medium">
                    Menampilkan <span className="font-extrabold text-brand-dark">{startIndex}-{endIndex}</span> dari <span className="font-extrabold text-brand-dark">{totalItems}</span> data
                </div>
                
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>Tampilkan:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            onItemsPerPageChange(Number(e.target.value));
                        }}
                        className="bg-slate-50 border border-brand-light/40 rounded-xl px-3 py-1.5 font-bold text-slate-700 outline-none cursor-pointer hover:border-brand-primary focus:border-brand-primary transition-colors text-xs shadow-inner"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={75}>75</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Navigasi Halaman */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {/* Tombol Prev */}
                    <Button
                        variant="ghost"
                        className="p-2 h-9 w-9 rounded-xl text-slate-400 hover:text-brand-primary disabled:opacity-40 disabled:pointer-events-none"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Halaman Sebelumnya"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {/* Tombol Angka Halaman */}
                    {getPageNumbers()[0] > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all text-slate-600 hover:bg-slate-100`}
                            >
                                1
                            </button>
                            {getPageNumbers()[0] > 2 && <span className="text-slate-300 px-1 text-xs">...</span>}
                        </>
                    )}

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                                page === currentPage
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand-dark'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                        <>
                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                <span className="text-slate-300 px-1 text-xs">...</span>
                            )}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all text-slate-600 hover:bg-slate-100`}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* Tombol Next */}
                    <Button
                        variant="ghost"
                        className="p-2 h-9 w-9 rounded-xl text-slate-400 hover:text-brand-primary disabled:opacity-40 disabled:pointer-events-none"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Halaman Selanjutnya"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
