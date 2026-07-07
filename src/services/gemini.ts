import { executeWithAIFallback } from './aiManager';

export const translateVocab = async (text: string, targetLanguage: string) => {
    const cleanText = text.trim().split(' ')[0];
    if (!cleanText) return null;

    const prompt = `You are a professional dictionary. Target language: ${targetLanguage}. Word: "${cleanText}". Respond STRICTLY in JSON format: {"translation": "direct translation", "phonetic": "IPA phonetic spelling", "definition": "Explanation in ${targetLanguage}", "examples": {"positive": {"en": "example", "target": "translation"}, "negative": {"en": "example", "target": "translation"}, "interrogative": {"en": "example", "target": "translation"}}}`;

    try {
        return await executeWithAIFallback(prompt, true);
    } catch (err) {
        console.error("Translate Vocab failed on all AIs", err);
        return null;
    }
};

export const translateSentence = async (text: string, targetLanguage: string) => {
    if (!text.trim()) return null;

    const prompt = `Translate to casual ${targetLanguage}. Text: "${text}". Respond STRICTLY in JSON: {"translation": "result", "intent": "Context/idiom explanation in ${targetLanguage}"}`;

    try {
        return await executeWithAIFallback(prompt, true);
    } catch (err) {
        console.error("Translate Sentence failed on all AIs", err);
        return null;
    }
};

export const translateImageOrDoc = async (base64Data: string, mimeType: string, targetLanguage: string) => {
    // Catatan: Vision/Multimodal diproses utama lewat Gemini karena efisiensi payload file mentahnya.
    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!GEMINI_KEY) return null;
        const ai = new GoogleGenerativeAI(GEMINI_KEY);
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([
            { inlineData: { data: base64Data, mimeType } },
            `Extract all English text or context from this image/document, then translate it into natural ${targetLanguage}. Provide the original extracted text and its translation. Respond STRICTLY in JSON: {"originalText": "extracted text", "translation": "translated text"}`
        ]);
        return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    } catch (error) { return null; }
};

export const transformTenseSingle = async (text: string, selectedTense: string, targetLanguage: string) => {
    if (!text.trim()) return null;

    const prompt = `You are an English grammar expert. Convert this base sentence: "${text}" into the specific tense: "${selectedTense}". Target language for translation and explanation: ${targetLanguage}. Respond STRICTLY in JSON format: {"tense": "${selectedTense}", "formula": "formula", "sentence": "converted sentence", "translation": "translation", "explanation": "explanation"}`;

    try {
        return await executeWithAIFallback(prompt, true);
    } catch (err) {
        console.error("Transform Tense failed on all AIs", err);
        return null;
    }
};