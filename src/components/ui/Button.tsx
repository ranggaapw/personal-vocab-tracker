import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
        ghost: "text-brand-dark/70 hover:bg-brand-pale hover:text-brand-dark"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} px-4 py-2.5 ${className}`} {...props}>
            {children}
        </button>
    );
}