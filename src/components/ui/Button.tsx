import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'violet' | 'teal' | 'emerald' | 'amber' | 'indigo';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
    const baseStyle = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
        // Tombol utama pakai Biru Terang
        primary: "bg-brand-primary text-white hover:bg-brand-dark shadow-md hover:shadow-lg",
        // Tombol sekunder pakai Putih Kebiruan
        secondary: "bg-brand-pale text-brand-dark hover:bg-brand-light",
        // Tombol danger untuk hapus
        danger: "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white",
        // Tombol tanpa background
        ghost: "text-brand-dark/70 hover:bg-brand-pale hover:text-brand-dark",
        // Varian Warna Baru untuk Membedakan Halaman
        violet: "bg-violet-600 text-white hover:bg-violet-700 shadow-md hover:shadow-lg hover:shadow-violet-600/20 shadow-violet-600/10",
        teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg hover:shadow-teal-600/20 shadow-teal-600/10",
        emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg hover:shadow-emerald-600/20 shadow-emerald-600/10",
        amber: "bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg hover:shadow-amber-500/20 shadow-amber-500/10",
        indigo: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 shadow-indigo-600/10"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} px-4 py-2.5 ${className}`} {...props}>
            {children}
        </button>
    );
}