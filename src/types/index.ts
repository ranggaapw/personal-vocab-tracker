export interface ExampleSentences {
    positive: string;
    negative: string;
    interrogative: string;
}

export interface VocabItem {
    id: string;
    word: string;           // Kata, idiom, atau kalimat yang dicari
    meaning: string;        // Arti dari hasil pencarian
    sourceShow: string;     // Judul Film / Series (Contoh: "Hogwarts Legacy" / "Suits")
    sourceEpisode: string;  // Episode (Contoh: "S01E01" atau "Clip")
    type: 'word' | 'idiom' | 'sentence';
    examples: ExampleSentences;
    createdAt: number;      // Timestamp untuk pengurutan
}