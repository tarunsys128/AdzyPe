import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = "inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "gradient-blue text-white glow-blue hover:brightness-110 border-transparent",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent",
    outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent",
    success: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-transparent"
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
    md: "text-sm px-4 py-2.5 rounded-xl gap-2",
    lg: "text-base px-6 py-3 rounded-xl gap-2.5"
  };

  return (
    <button 
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
