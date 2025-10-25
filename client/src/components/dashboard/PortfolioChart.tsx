import React from 'react';
import { Card } from '@/components/common/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PortfolioChartProps {
  data: Array<{ date: string; value: number }>;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data }) => {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
        Portfolio Value
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0610ac" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0610ac" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#2a2a2f" : "#f0f0f0"} />
          <XAxis
            dataKey="date"
            stroke={isDark ? "#94a3b8" : "#9ca3af"}
            style={{ fontSize: '12px', fill: isDark ? "#94a3b8" : "#9ca3af" }}
          />
          <YAxis
            stroke={isDark ? "#94a3b8" : "#9ca3af"}
            style={{ fontSize: '12px', fill: isDark ? "#94a3b8" : "#9ca3af" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a1a1f' : '#fff',
              border: `1px solid ${isDark ? '#2a2a2f' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDark ? '#f8fafc' : '#1a1a1a',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0610ac"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};