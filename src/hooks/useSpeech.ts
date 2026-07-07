import { useState, useEffect } from 'react';

export function useSpeech() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // AI Membaca Teks
    const speak = (text: string, langCode: string = 'en-US') => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Atur kecepatan dan nada agar pelafalan terdengar natural, jelas, dan mudah dipahami pembelajar
        utterance.rate = 0.92;
        utterance.pitch = 1.05;

        // Ambil list suara langsung secara real-time untuk menghindari stale state closure
        const allVoices = window.speechSynthesis.getVoices();

        // Cari suara yang cocok dengan logat/bahasa yang diminta
        const matchedVoices = allVoices.filter(v => 
            v.lang.toLowerCase() === langCode.toLowerCase() || 
            v.lang.toLowerCase().replace('_', '-') === langCode.toLowerCase().replace('_', '-')
        );

        // Cari suara perempuan (female) di list yang cocok
        let selectedVoice = matchedVoices.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('female') || 
                   name.includes('zira') || 
                   name.includes('samantha') || 
                   name.includes('google us english') || 
                   name.includes('google uk english female') || 
                   name.includes('karen') || 
                   name.includes('hazel') || 
                   name.includes('catherine') || 
                   name.includes('salli') || 
                   name.includes('joanna');
        });

        // Jika tidak ada suara perempuan spesifik, ambil suara pertama yang cocok dengan bahasa/logat tersebut
        if (!selectedVoice && matchedVoices.length > 0) {
            selectedVoice = matchedVoices[0];
        }

        // Fallback ke pencarian parsial jika logat spesifik tidak terpasang di perangkat
        if (!selectedVoice) {
            const mainLang = langCode.split('-')[0].toLowerCase();
            const partialVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith(mainLang));
            
            selectedVoice = partialVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('female') || 
                       name.includes('zira') || 
                       name.includes('samantha') || 
                       name.includes('google') || 
                       name.includes('karen') || 
                       name.includes('hazel');
            });
            
            if (!selectedVoice && partialVoices.length > 0) {
                selectedVoice = partialVoices[0];
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`[TTS] Menggunakan suara: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
            console.warn(`[TTS] Suara aksen ${langCode} tidak terdeteksi, menggunakan default browser.`);
        }

        window.speechSynthesis.speak(utterance);
    };

    // Mic Mendengarkan Suara
    const listen = (onResult: (text: string) => void, langCode: string = 'en-US', onEnd?: () => void) => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Gunakan Google Chrome untuk fitur suara.");
            if (onEnd) onEnd();
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = langCode;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => onResult(event.results[0][0].transcript);
        recognition.onerror = () => {
            setIsListening(false);
            if (onEnd) onEnd();
        };
        recognition.onend = () => {
            setIsListening(false);
            if (onEnd) onEnd();
        };

        recognition.start();
    };

    return { speak, listen, isListening, voices };
}