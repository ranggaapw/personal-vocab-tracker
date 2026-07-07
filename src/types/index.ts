export interface BilingualSentence {
    en: string;
    target: string;
}

export interface ExampleSentences {
    positive: BilingualSentence;
    negative: BilingualSentence;
    interrogative: BilingualSentence;
}

export interface VocabItem {
    id: string;
    word: string;
    meaning: string;
    phonetic?: string;
    definition?: string; // Penjelasan untuk Vocab
    intent?: string;     // Maksud dari Kalimat/Idiom
    examples?: ExampleSentences;
    type: 'word' | 'sentence';
    createdAt: number;
}