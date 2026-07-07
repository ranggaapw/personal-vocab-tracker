import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 1. GEMINI API CALL
async function callGemini(prompt: string, isJson: boolean = true) {
    if (!GEMINI_KEY) throw new Error("Gemini Key missing");
    const ai = new GoogleGenerativeAI(GEMINI_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return isJson ? JSON.parse(text.replace(/```json|```/g, '').trim()) : text;
}

// 🔄 GEMINI AI EXECUTION WRAPPER
export async function executeWithAIFallback(prompt: string, isJson: boolean = true) {
    try {
        return await callGemini(prompt, isJson);
    } catch (geminiErr: any) {
        const errMsg = geminiErr.message || geminiErr.toString();
        const lowerMsg = errMsg.toLowerCase();
        
        let userFriendlyMsg = '';
        if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('exhausted') || lowerMsg.includes('too many requests')) {
            userFriendlyMsg = "Batas penggunaan (limit) API Gemini Anda telah habis. Mohon tunggu beberapa saat lagi sebelum mencoba kembali.";
        } else if (lowerMsg.includes('api key') || lowerMsg.includes('invalid') || lowerMsg.includes('unauthorized') || lowerMsg.includes('401')) {
            userFriendlyMsg = "Kunci API Gemini tidak valid atau belum diatur dengan benar di file konfigurasi (.env).";
        } else {
            // Bersihkan format JSON dari string error jika ada
            if (errMsg.includes('{')) {
                try {
                    const match = errMsg.match(/"message"\s*:\s*"([^"]+)"/);
                    if (match && match[1]) {
                        userFriendlyMsg = `Terjadi kendala pada Gemini AI: ${match[1]}`;
                    }
                } catch (_) {}
            }
            if (!userFriendlyMsg) {
                userFriendlyMsg = `Gagal terhubung ke Gemini AI: ${errMsg}`;
            }
        }
        
        window.dispatchEvent(new CustomEvent('ai-fallback-failed', { detail: userFriendlyMsg }));
        throw new Error(userFriendlyMsg);
    }
}