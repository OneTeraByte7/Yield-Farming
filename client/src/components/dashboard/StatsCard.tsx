import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  change?: number;
  format?: 'number' | 'currency' | 'percent';
  color?: 'blue' | 'green' | 'royal' | 'orange';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  format = 'number',
  color = 'blue',
}) => {
  const colors = {
    blue: 'bg-primary-500/12 text-primary-200 border border-primary-500/25 shadow-royal-soft',
    green: 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/30 shadow-royal-soft',
    royal: 'bg-primary-500/18 text-primary-100 border border-primary-500/35 shadow-royal',
    orange: 'bg-amber-400/15 text-amber-100 border border-amber-400/35 shadow-royal-soft',
  };

  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${formatNumber(value)}%`;
      default:
        return formatNumber(value);
    }
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatValue()}</p>
          {change !== undefined && (
            <p
              className={`text-sm mt-2 ${
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {formatNumber(change)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl backdrop-blur-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};