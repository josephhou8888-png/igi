import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartProps {
  data: { date: string; amount: number }[];
}

const DailyInvestmentsChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000)}k`} />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'New Investment']}
        />
        <Bar dataKey="amount" fill="#4F46E5" name="New Investment" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyInvestmentsChart;