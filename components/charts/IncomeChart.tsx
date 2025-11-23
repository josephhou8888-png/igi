import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface IncomeChartProps {
  data: { name: string; income: number }[];
}

const IncomeChart: React.FC<IncomeChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value}`} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} 
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Income']}
        />
        <Area type="monotone" dataKey="income" stroke="#4F46E5" fillOpacity={1} fill="url(#colorIncome)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IncomeChart;