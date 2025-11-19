import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CycleEntry } from '../types';
import { sortEntries, getDurationInDays } from '../utils/dateUtils';

interface StatsChartProps {
  entries: CycleEntry[];
  color: string;
}

const StatsChart: React.FC<StatsChartProps> = ({ entries, color }) => {
  const data = useMemo(() => {
    // Take the last 5 cycles (instead of 6) to prevent overcrowding on small screens
    const sorted = sortEntries(entries).slice(0, 5).reverse();
    
    return sorted.map(entry => ({
      date: new Date(entry.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: getDurationInDays(entry.startDate, entry.endDate),
      isOngoing: !entry.endDate
    }));
  }, [entries]);

  if (data.length === 0) {
    return <div className="text-gray-400 text-sm text-center py-8">Not enough data for charts</div>;
  }

  return (
    <div className="h-64 w-full mt-4">
      <h3 className="text-sm font-medium text-gray-500 mb-4">Cycle Duration History (Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 10 }} 
            dy={10}
            interval={0} // Ensure all dates are shown
          />
          <YAxis 
            hide 
            domain={[0, 'auto']} 
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number, name: string, props: any) => [
                `${value} days ${props.payload.isOngoing ? '(Ongoing)' : ''}`, 
                'Duration'
            ]}
          />
          <Bar dataKey="duration" radius={[4, 4, 4, 4]} maxBarSize={40}>
            {data.map((entry, index) => (
               <Cell 
                key={`cell-${index}`} 
                fill={entry.isOngoing ? '#fbbf24' : (index === data.length - 1 ? '#fb7185' : '#e5e7eb')} 
                fillOpacity={entry.isOngoing ? 0.6 : 1}
               />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;