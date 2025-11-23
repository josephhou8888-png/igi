import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartProps {
    data: { date: string; inflow: number; outflow: number }[];
}

const AdminInflowOutflowChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000)}k`} />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Legend wrapperStyle={{color: '#9CA3AF'}}/>
        <Line type="monotone" dataKey="inflow" stroke="#22C55E" strokeWidth={2} name="Inflow (USDT)" />
        <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={2} name="Outflow (USDT)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AdminInflowOutflowChart;