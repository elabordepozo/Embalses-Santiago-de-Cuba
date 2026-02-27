import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import type { ChartDataPoint } from '../types';

interface YearlyComparisonBarChartProps {
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
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: pld.fill }} />
              <span className="text-slate-300">{pld.name}:</span>
              <span className="font-bold text-white">{Number(pld.value).toFixed(2)} hm³</span>
            </div>
          )
        ))}
        {payload.length === 2 && payload[0].value !== null && payload[1].value !== null && (
          <div className="mt-2 pt-2 border-t border-slate-700 text-xs">
            <span className="text-slate-400">Diferencia: </span>
            <span className={`font-bold ${(payload[1].value - payload[0].value) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(payload[1].value - payload[0].value) >= 0 ? '+' : ''}
              {(payload[1].value - payload[0].value).toFixed(2)} hm³
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomLegend: React.FC<any> = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-4 mt-3">
    {payload?.map((entry: any) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

const YearlyComparisonBarChart: React.FC<YearlyComparisonBarChartProps> = ({ data, selectedYear }) => {
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          barGap={4}
          barCategoryGap="25%"
        >
          <defs>
            <linearGradient id="gradientMedia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#b45309" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="gradientYear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0e7490" stopOpacity={0.7} />
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="Media Histórica" fill="url(#gradientMedia)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey={String(selectedYear)} fill="url(#gradientYear)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearlyComparisonBarChart;
