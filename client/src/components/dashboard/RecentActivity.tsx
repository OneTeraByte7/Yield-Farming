import React from 'react';
import { Card } from '@/components/common/Card';
import { Transaction } from '@/types';
import { formatNumber, formatDate } from '@/utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Gift, TrendingUp } from 'lucide-react';

interface RecentActivityProps {
  transactions: Transaction[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'withdraw':
        return <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'stake':
        return <TrendingUp className="w-5 h-5 text-primary-500 dark:text-primary-400" />;
      case 'claim':
        return <Gift className="w-5 h-5 text-primary-500 dark:text-primary-400" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'withdraw':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      case 'stake':
        return 'text-primary-600 dark:text-primary-300 bg-primary-500/15 dark:bg-primary-900/35 border border-primary-500/25 dark:border-primary-700/35';
      case 'claim':
        return 'text-primary-600 dark:text-primary-300 bg-primary-500/15 dark:bg-primary-900/35 border border-primary-500/25 dark:border-primary-700/35';
      default:
        return 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">
          No recent transactions
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-white/12 dark:bg-slate-900/45 border border-white/20 dark:border-primary-500/25 rounded-xl hover:bg-white/18 dark:hover:bg-slate-900/55 transition-colors backdrop-blur-xl"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(transaction.type)}`}>
                {getIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-slate-100 capitalize">
                  {transaction.type}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {transaction.pools?.name || 'Wallet'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-slate-100">
                {formatNumber(transaction.amount)}{' '}
                {transaction.pools?.token_symbol || 'USD'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {formatDate(transaction.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};