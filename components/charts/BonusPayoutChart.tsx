import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartData {
  date: string;
  amount: number;
}

interface BonusPayoutChartProps {
  data: ChartData[];
}

const BonusPayoutChart: React.FC<BonusPayoutChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
        <YAxis 
          stroke="#9CA3AF" 
          tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`} 
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Payout']}
        />
        <Legend wrapperStyle={{color: '#9CA3AF'}} />
        <Bar dataKey="amount" fill="#7C3AED" name="Daily Payout (USDT)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BonusPayoutChart;
