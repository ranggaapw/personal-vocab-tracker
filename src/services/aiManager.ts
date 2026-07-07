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
    if (!response.ok) throw new Error(`OpenAI Error: ${response.status}`);
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
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
        })
    });
    if (!response.ok) throw new Error(`Claude Error: ${response.status}`);
    const data = await response.json();
    const text = data.content[0].text;
    return isJson ? JSON.parse(text.replace(/```json|```/g, '').trim()) : text;
}

// 🔄 MULTI-AI FALLBACK EXECUTION WRAPPER
export async function executeWithAIFallback(prompt: string, isJson: boolean = true) {
    try {
        return await callGemini(prompt, isJson);
    } catch (geminiErr) {
        console.warn("⚠️ Gemini limit/error, beralih ke ChatGPT (OpenAI)...");
        try {
            return await callOpenAI(prompt, isJson);
        } catch (openaiErr) {
            console.warn("⚠️ OpenAI limit/error, beralih ke Claude (Anthropic)...");
            try {
                return await callClaude(prompt, isJson);
            } catch (claudeErr: any) {
                // Trigger Toast ke seluruh aplikasi
                const errorMsg = `Gemini (429), OpenAI & Claude gagal total: ${claudeErr.message || 'Limit habis'}`;
                window.dispatchEvent(new CustomEvent('ai-fallback-failed', { detail: errorMsg }));
                throw new Error(errorMsg);
            }
        }
    }
}