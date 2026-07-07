import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(API_KEY || 'DUMMY');

export const LANG_CODES: Record<string, string> = {
    Indonesian: 'id', Japanese: 'ja', Korean: 'ko', Spanish: 'es', French: 'fr', German: 'de'
};

export const translateText = async (text: string, targetLanguage: string) => {
    const cleanText = text.trim();
    if (cleanText.split(/\s+/).length > 2) {
        return translateSentence(cleanText, targetLanguage);
    } else {
        return translateVocab(cleanText, targetLanguage);
    }
};

export const translateVocab = async (text: string, targetLanguage: string) => {
    const cleanText = text.trim().split(' ')[0];
    if (!cleanText || !API_KEY) return null;
    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are a professional dictionary. Target language: ${targetLanguage}. Word: "${cleanText}". Respond STRICTLY in JSON format: {"translation": "direct translation", "phonetic": "IPA phonetic spelling", "definition": "Explanation in ${targetLanguage}", "examples": {"positive": {"en": "example", "target": "translation"}, "negative": {"en": "example", "target": "translation"}, "interrogative": {"en": "example", "target": "translation"}}}`;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    } catch (error) { return null; }
};

export const translateSentence = async (text: string, targetLanguage: string) => {
    if (!text.trim() || !API_KEY) return null;
    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Translate to casual ${targetLanguage}. Text: "${text}". Respond STRICTLY in JSON: {"translation": "result", "intent": "Context/idiom explanation in ${targetLanguage}"}`;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    } catch (error) { return null; }
};

export const translateImageOrDoc = async (base64Data: string, mimeType: string, targetLanguage: string) => {
    if (!API_KEY) return null;
    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent([
            { inlineData: { data: base64Data, mimeType } },
            `Extract all English text or context from this image/document, then translate it into natural ${targetLanguage}. Provide the original extracted text and its translation. Respond STRICTLY in JSON: {"originalText": "extracted text", "translation": "translated text"}`
        ]);
        return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    } catch (error) { return null; }
};

// Fungsi Tenses Single Dropdown
export const transformTenseSingle = async (text: string, selectedTense: string, targetLanguage: string) => {
    if (!text.trim() || !API_KEY) return null;
    try {
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Convert this base sentence: "${text}" into the specific tense: "${selectedTense}". Target language for translation and explanation: ${targetLanguage}. Respond STRICTLY in JSON format: {"tense": "${selectedTense}", "formula": "formula", "sentence": "converted sentence", "translation": "translation", "explanation": "explanation"}`;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    } catch (error) { return null; }
};