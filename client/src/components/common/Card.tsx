import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-white dark:bg-[#1a1a1f] border border-[#e8e8e8] dark:border-[#2a2a2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    glass: 'bg-[#fafbfc] dark:bg-[#1a1a1f] border border-[#f0f0f0] dark:border-[#2a2a2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    gradient: 'bg-[#f6f8fa] dark:bg-[#1a1a1f] border border-[#e8e8e8] dark:border-[#2a2a2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 ease-out',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};