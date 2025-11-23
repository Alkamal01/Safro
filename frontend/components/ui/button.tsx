'use client';

import { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    type = 'button'
}: ButtonProps) {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95',
        secondary: 'bg-secondary text-secondary-foreground border border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:shadow-lg hover:shadow-destructive/50 hover:scale-105 active:scale-95',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
}
