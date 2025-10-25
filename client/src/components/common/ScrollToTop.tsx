import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-8 right-8 z-50',
            'w-12 h-12 rounded-full',
            'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700',
            'text-white shadow-lg hover:shadow-xl',
            'flex items-center justify-center',
            'transition-all duration-300',
            'hover:scale-110 active:scale-95',
            'animate-fade-in'
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};
