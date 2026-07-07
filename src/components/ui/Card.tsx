import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white border border-brand-light/50 rounded-2xl shadow-sm ${className}`}>
            {children}
        </div>
    );
}