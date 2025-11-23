import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TeamPerformanceChartProps {
    data: { name: string; joins: number; investment: number }[];
}

const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number, name: string) => [name === 'investment' ? `$${value.toLocaleString()}` : value, name === 'joins' ? 'New Joins' : 'Total Investment (USDT)']}
        />
        <Legend wrapperStyle={{color: '#9CA3AF'}} />
        <Bar dataKey="joins" fill="#7C3AED" name="New Joins" />
        <Bar dataKey="investment" fill="#4F46E5" name="Total Investment (USDT)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TeamPerformanceChart;