import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

interface ChartProps {
  data: { date: string; netFlow: number }[];
}

const NetFlowChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
        <YAxis 
            stroke="#9CA3AF" 
            tickFormatter={(value) => `$${value >= 1000 || value <= -1000 ? (value / 1000) + 'k' : value}`}
            domain={['auto', 'auto']}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Net Flow']}
        />
        <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="2 2" />
        <Line 
            type="monotone" 
            dataKey="netFlow" 
            stroke="#4F46E5" 
            strokeWidth={2}
            dot={false}
            connectNulls
        >
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NetFlowChart;
