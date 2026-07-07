import { executeWithAIFallback } from './aiManager';

export const fetchWordFromDictionary = async (word: string, targetLang: string) => {
    const cleanWord = word.trim().toLowerCase().split(' ')[0];
    if (!cleanWord) return null;

    try {
        // 1. Ambil data dasar (fonetik & definisi mentah) dari Free Dictionary API
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
        let phonetic = '';
        let rawDefinition = '';

        if (res.ok) {
            const data = await res.json();
            phonetic = data[0]?.phonetic || data[0]?.phonetics?.[0]?.text || '';
            rawDefinition = data[0]?.meanings?.[0]?.definitions?.[0]?.definition || '';
        }

        // 2. Minta AI (lewat fallback manager) untuk menterjemahkan ke targetLang & buat contoh (+, -, ?)
        const prompt = `You are a helpful language assistant. Word: "${cleanWord}", Raw English Definition: "${rawDefinition}". Target language: ${targetLang}. 
    Provide the translation/meaning in ${targetLang}, a clear definition/explanation in ${targetLang}, and examples in positive (+), negative (-), and interrogative (?) forms (with English sentence and ${targetLang} translation).
    Respond STRICTLY in JSON format:
    {
      "translation": "meaning/translation in ${targetLang}",
      "phonetic": "${phonetic}",
      "definition": "explanation in ${targetLang}",
      "examples": {
        "positive": {"en": "positive sentence in English", "target": "translation in ${targetLang}"},
        "negative": {"en": "negative sentence in English", "target": "translation in ${targetLang}"},
        "interrogative": {"en": "interrogative sentence in English", "target": "translation in ${targetLang}"}
      }
    }`;

        const aiResult = await executeWithAIFallback(prompt, true);
        return aiResult;
    } catch (error) {
        console.error('Hybrid Dictionary & AI Error:', error);
        return null;
    }
};