import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const CLAUDE_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// 1. GEMINI API CALL
async function callGemini(prompt: string, isJson: boolean = true) {
    if (!GEMINI_KEY) throw new Error("Gemini Key missing");
    const ai = new GoogleGenerativeAI(GEMINI_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return isJson ? JSON.parse(text.replace(/```json|```/g, '').trim()) : text;
}

// 2. OPENAI (CHATGPT) API CALL FALLBACK
async function callOpenAI(prompt: string, isJson: boolean = true) {
    if (!OPENAI_KEY) throw new Error("OpenAI Key missing");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: isJson ? { type: "json_object" } : { type: "text" }
        })
    });
    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `ChatGPT Error ${response.status}`);
    }
    const data = await response.json();
    const text = data.choices[0].message.content;
    return isJson ? JSON.parse(text) : text;
}

// 3. CLAUDE (ANTHROPIC) API CALL FALLBACK
async function callClaude(prompt: string, isJson: boolean = true) {
    if (!CLAUDE_KEY) throw new Error("Claude Key missing");
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': CLAUDE_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-dangerous-direct-browser-access': 'true' // untuk dev/browser test
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307', // Menggunakan Claude 3 Haiku agar kompatibel dengan akun free/evaluasi
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
        })
    });
    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Claude Error ${response.status}`);
    }
    const data = await response.json();
    const text = data.content[0].text;
    return isJson ? JSON.parse(text.replace(/```json|```/g, '').trim()) : text;
}

function getHumanFriendlyError(provider: 'Gemini' | 'OpenAI' | 'Claude', errorMsg: string): string {
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes('api key not valid') || msg.includes('invalid api key') || msg.includes('key missing') || msg.includes('unauthorized') || msg.includes('401')) {
        return `Kunci API ${provider} tidak valid atau belum dikonfigurasi.`;
    }
    if (msg.includes('quota exceeded') || msg.includes('429') || msg.includes('rate limit') || msg.includes('exhausted') || msg.includes('too many requests')) {
        return `Batas kuota penggunaan ${provider} telah habis (Rate Limit / Quota Exceeded).`;
    }
    if (msg.includes('credit balance') || msg.includes('balance is too low') || msg.includes('no credit')) {
        return `Saldo/Kredit akun ${provider} Anda habis atau tidak mencukupi.`;
    }
    if (msg.includes('not found') || msg.includes('not available') || msg.includes('model')) {
        return `Model AI ${provider} tidak ditemukan atau tidak didukung pada tingkat akun Anda.`;
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('connect')) {
        return `Koneksi jaringan ke server ${provider} terputus.`;
    }
    
    if (errorMsg.includes('{')) {
        try {
            const match = errorMsg.match(/"message"\s*:\s*"([^"]+)"/);
            if (match && match[1]) {
                return `${provider}: ${match[1]}`;
            }
        } catch (_) {}
    }
    
    return `${provider}: ${errorMsg.substring(0, 100)}${errorMsg.length > 100 ? '...' : ''}`;
}

// 🔄 MULTI-AI FALLBACK EXECUTION WRAPPER
export async function executeWithAIFallback(prompt: string, isJson: boolean = true) {
    try {
        return await callGemini(prompt, isJson);
    } catch (geminiErr: any) {
        console.warn("⚠️ Gemini limit/error, beralih ke ChatGPT (OpenAI)...", geminiErr);
        try {
            return await callOpenAI(prompt, isJson);
        } catch (openaiErr: any) {
            console.warn("⚠️ OpenAI limit/error, beralih ke Claude (Anthropic)...", openaiErr);
            try {
                return await callClaude(prompt, isJson);
            } catch (claudeErr: any) {
                // Buat ringkasan detail error dari masing-masing AI untuk mempermudah debugging pengguna
                const geminiFriendly = getHumanFriendlyError('Gemini', geminiErr.message || geminiErr.toString());
                const openaiFriendly = getHumanFriendlyError('OpenAI', openaiErr.message || openaiErr.toString());
                const claudeFriendly = getHumanFriendlyError('Claude', claudeErr.message || claudeErr.toString());

                const errorMsg = `Semua AI Cadangan Mengalami Kendala:\n` +
                                 `• ${geminiFriendly}\n` +
                                 `• ${openaiFriendly}\n` +
                                 `• ${claudeFriendly}`;
                
                window.dispatchEvent(new CustomEvent('ai-fallback-failed', { detail: errorMsg }));
                throw new Error(errorMsg);
            }
        }
    }
}