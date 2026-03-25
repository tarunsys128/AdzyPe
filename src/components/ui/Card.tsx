import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'nav';
  glow?: boolean;
}

export function Card({ className = '', variant = 'default', glow = false, children, ...props }: CardProps) {
  const baseClass = "rounded-2xl overflow-hidden transition-all duration-300";
  
  const variants = {
    default: "bg-white border border-slate-200 shadow-sm hover:shadow-md",
    glass: "glass-card text-slate-800",
    gradient: "gradient-blue text-white",
    nav: "bg-white border border-slate-200"
  };

  const glowClass = glow && variant === 'gradient' ? "glow-blue" : "";

  return (
    <div className={`${baseClass} ${variants[variant]} ${glowClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pb-4 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`font-bold text-lg tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
