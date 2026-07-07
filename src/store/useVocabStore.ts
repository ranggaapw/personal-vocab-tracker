import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VocabItem } from '../types';

interface VocabState {
    vocabList: VocabItem[];
    addVocab: (item: Omit<VocabItem, 'id' | 'createdAt'>) => void;
    deleteVocab: (id: string) => void;
    getVocabById: (id: string) => VocabItem | undefined;
}

export const useVocabStore = create<VocabState>()(
    persist(
        (set, get) => ({
            vocabList: [],

            // Menambahkan kosakata baru
            addVocab: (item) => {
                const newItem: VocabItem = {
                    ...item,
                    id: crypto.randomUUID(), // Generate ID unik otomatis
                    createdAt: Date.now(),    // Timestamp saat disimpan
                };
                set((state) => ({
                    vocabList: [newItem, ...state.vocabList], // Kosakata baru muncul di paling atas
                }));
            },

            // Menghapus kosakata jika ada yang salah catat
            deleteVocab: (id) => {
                set((state) => ({
                    vocabList: state.vocabList.filter((vocab) => vocab.id !== id),
                }));
            },

            // Mengambil detail kosakata berdasarkan ID untuk halaman detail
            getVocabById: (id) => {
                return get().vocabList.find((vocab) => vocab.id === id);
            },
        }),
        {
            name: 'personal-vocab-storage', // Nama key di Local Storage kamu
        }
    )
);