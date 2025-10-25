import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className,
  iconClassName,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top + scrollY - 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 8;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 8;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 8;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  const getTransform = () => {
    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('relative inline-flex items-center', className)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || (
          <Info
            className={cn(
              'w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-help transition-colors flex-shrink-0',
              iconClassName
            )}
          />
        )}
      </div>

      {isVisible &&
        createPortal(
          <div
            className="absolute px-3 py-2 text-sm leading-relaxed text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl border border-gray-700 dark:border-gray-600 pointer-events-none whitespace-normal"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: getTransform(),
              maxWidth: '280px',
              minWidth: '200px',
              zIndex: 99999,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};
