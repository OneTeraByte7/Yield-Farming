import React from 'react';
import { Card } from '@/components/common/Card';

export const PoolCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-slate-300 dark:bg-slate-700 rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
          <div className="h-16 w-20 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        </div>

        <div className="h-10 bg-slate-200 dark:bg-slate-600 rounded" />

        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-slate-200 dark:bg-slate-600 rounded" />
          <div className="h-16 bg-slate-200 dark:bg-slate-600 rounded" />
          <div className="h-16 bg-slate-200 dark:bg-slate-600 rounded" />
        </div>

        <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-lg" />
      </div>
    </Card>
  );
};