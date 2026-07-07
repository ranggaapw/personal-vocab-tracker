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

        // Cari suara yang paling cocok dengan logat/bahasa yang diminta
        const exactVoice = voices.find(v => v.lang === langCode);
        const partialVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));

        if (exactVoice) {
            utterance.voice = exactVoice;
        } else if (partialVoice) {
            utterance.voice = partialVoice;
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