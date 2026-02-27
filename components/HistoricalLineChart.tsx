import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart
} from 'recharts';
import type { ChartDataPoint } from '../types';

interface HistoricalLineChartProps {
  data: ChartDataPoint[];
  selectedYear: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        <p className="font-bold text-white mb-2 text-sm">{label}</p>
        {payload.map((pld: any) => (
          pld.value !== null && (
            <div key={pld.dataKey} className="flex items-center gap-2 text-xs mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: pld.color || pld.stroke }} />
              <span className="text-slate-300">{pld.name}:</span>
              <span className="font-bold text-white">{Number(pld.value).toFixed(2)} hm³</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<any> = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-4 mt-3">
    {payload?.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span
          className="inline-block w-6 h-0.5 rounded"
          style={{
            background: entry.color,
            borderTop: entry.payload?.strokeDasharray ? `2px dashed ${entry.color}` : undefined,
          }}
        />
        {entry.value}
      </div>
    ))}
  </div>
);

const HistoricalLineChart: React.FC<HistoricalLineChartProps> = ({ data, selectedYear }) => {
  return (
    <div style={{ width: '100%', height: 420 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradientYear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148,163,184,0.2)', strokeWidth: 1 }} />
          <Legend content={<CustomLegend />} />

          <Line
            type="monotone"
            dataKey="Mínima Histórica"
            stroke="#ef4444"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            strokeOpacity={0.7}
          />
          <Line
            type="monotone"
            dataKey="Máxima Histórica"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            strokeOpacity={0.7}
          />
          <Line
            type="monotone"
            dataKey="Media Histórica"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey={String(selectedYear)}
            stroke="#22d3ee"
            strokeWidth={3}
            fill="url(#gradientYear)"
            dot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: 'rgba(34,211,238,0.4)', strokeWidth: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalLineChart;
