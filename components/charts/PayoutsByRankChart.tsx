import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartProps {
  data: { name: string; amount: number }[];
}

const PayoutsByRankChart: React.FC<ChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a,b) => {
    const levelA = parseInt(a.name.replace('L', ''));
    const levelB = parseInt(b.name.replace('L', ''));
    return levelA - levelB;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000)}k`} />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Payouts']}
        />
        <Bar dataKey="amount" fill="#7C3AED" name="Total Payouts" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PayoutsByRankChart;