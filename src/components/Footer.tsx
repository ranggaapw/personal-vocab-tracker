import { useState } from 'react';
import { Button } from './ui/Button';
import { Mail, Send, ExternalLink, Code2, Globe, CheckCircle2 } from 'lucide-react';
// Menggunakan user full name dari konteks (Rangga Permana Wijaya)
export function Footer() {
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSendGmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const gmailUrl = `mailto:rangga.permana@example.com?subject=Pesan dari Vocab Studio&body=${encodeURIComponent(message)}`;
        window.open(gmailUrl, '_blank');
        setSent(true);
        setTimeout(() => setSent(false), 4000);
        setMessage('');
    };

    return (
        <footer className="mt-32 border-t border-brand-light/30 bg-gradient-to-b from-white to-brand-pale/20 py-16 px-6">
            <div className="max-w-[92rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Kiri: Info & Socials */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pale/50 text-brand-primary text-xs font-bold">
                        <Mail className="h-3.5 w-3.5" /> Get in Touch
                    </div>
                    <h3 className="text-3xl font-black text-brand-dark tracking-tight">Hubungi Rangga Permana Wijaya</h3>
                    <p className="text-slate-500 font-medium max-w-md">
                        Punya masukan, pertanyaan seputar frontend, atau ingin berkolaborasi? Kirimkan pesan langsung atau terhubung via tautan di bawah.
                    </p>

                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                        <a href="https://linkedin.com/in/ranggapermanawijaya" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white border border-brand-light/40 text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm">
                            <ExternalLink className="h-4 w-4" /> LinkedIn
                        </a>
                        <a href="https://github.com/ranggapermana" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white border border-brand-light/40 text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm">
                            <Code2 className="h-4 w-4" /> GitHub
                        </a>
                        {/* Diubah dari Google Sites menjadi Portfolio */}
                        <a href="https://sites.google.com/view/ranggapermana" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-white border border-brand-light/40 text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm">
                            <Globe className="h-4 w-4" /> Portfolio
                        </a>
                    </div>
                </div>

                {/* Kanan: Form Kirim Pesan ke Gmail (CTA) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-brand-dark/5 border border-brand-light/40">
                    <form onSubmit={handleSendGmail} className="space-y-4">
                        <h4 className="font-bold text-lg text-brand-dark">Kirim Pesan Cepat</h4>
                        <div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tulis pesanmu di sini..."
                                className="w-full p-4 bg-slate-50 border border-brand-light/40 rounded-xl resize-none outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            {sent ? (
                                <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                    <CheckCircle2 className="h-4 w-4" /> Mengarahkan ke Gmail...
                                </span>
                            ) : (
                                <span className="text-xs text-slate-400 font-medium">Membuka aplikasi email default</span>
                            )}

                            <Button type="submit" disabled={!message.trim()} className="bg-brand-primary text-white rounded-xl px-6 gap-2">
                                <Send className="h-4 w-4" /> Kirim via Gmail
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </footer>
    );
}