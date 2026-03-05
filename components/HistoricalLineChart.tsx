import React from 'react';
import {
  ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
import type { ChartDataPoint, ComparisonMode } from '../types';

interface Props {
  data: ChartDataPoint[];
  mode: ComparisonMode;
  seriesKeys: string[];          // claves a dibujar como líneas
  seriesColors: Record<string, string>;
  selectedYear?: number;         // solo para anio-historico
}

const MONTH_SHORT: Record<string, string> = {
  'Enero':'Ene','Febrero':'Feb','Marzo':'Mar','Abril':'Abr',
  'Mayo':'May','Junio':'Jun','Julio':'Jul','Agosto':'Ago',
  'Septiembre':'Sep','Octubre':'Oct','Noviembre':'Nov','Diciembre':'Dic',
};

const Tooltip_: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'rgba(9,14,28,0.97)', border:'1px solid rgba(148,163,184,0.2)',
      borderRadius:'12px', padding:'10px 14px', boxShadow:'0 10px 30px rgba(0,0,0,0.5)',
      maxWidth: '220px',
    }}>
      <p className="font-bold text-white mb-2 text-sm">{label}</p>
      {payload.map((p: any) => p.value !== null && p.value !== undefined && (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color || p.stroke }} />
          <span className="text-slate-400 truncate">{p.name}:</span>
          <span className="font-bold text-white ml-auto whitespace-nowrap">{Number(p.value).toFixed(2)} hm³</span>
        </div>
      ))}
    </div>
  );
};

const Legend_: React.FC<any> = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-2">
    {payload?.map((e: any) => (
      <div key={e.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="inline-block w-5 h-0.5 rounded" style={{
          background: e.color,
          borderTop: e.payload?.strokeDasharray ? `2px dashed ${e.color}` : undefined,
        }}/>
        {e.value}
      </div>
    ))}
  </div>
);

function computeYDomain(data: ChartDataPoint[], keys: string[], clampMinZero = true): [number, number] {
  let min = Infinity;
  let max = -Infinity;

  for (const row of data) {
    for (const k of keys) {
      const v = row[k];
      if (typeof v !== 'number' || Number.isNaN(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];

  const range = max - min;
  // Padding relativo para embalses pequeños; evita el "+5" fijo que aplasta la curva.
  const pad = Math.max(range * 0.08, max * 0.05, 0.15);
  const lo = clampMinZero ? Math.max(0, min - pad) : (min - pad);
  const hi = max + pad;
  if (hi <= lo) return [clampMinZero ? 0 : lo, lo + 1];
  return [lo, hi];
}

const HistoricalLineChart: React.FC<Props> = ({ data, mode, seriesKeys, seriesColors, selectedYear }) => {
  const isHistorico = mode === 'anio-historico';
  const height = 'clamp(240px, 45vw, 400px)';
  const domainKeys = isHistorico
    ? ['Mínima Histórica', 'Media Histórica', 'Máxima Histórica', ...seriesKeys]
    : seriesKeys;
  const yDomain = computeYDomain(data, domainKeys, true);
  const [touchIndex, setTouchIndex] = React.useState<number | null>(null);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  return (
    <div style={{ width:'100%', height }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top:8, right:8, left:-15, bottom:0 }}
          onClick={(e) => { if (isTouchDevice && e?.activeTooltipIndex !== undefined) setTouchIndex(prev => prev === e.activeTooltipIndex ? null : e.activeTooltipIndex); }}>
          <defs>
            {seriesKeys.map(k => (
              <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={seriesColors[k]} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={seriesColors[k]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false}/>
          <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:10 }}
            axisLine={{ stroke:'rgba(148,163,184,0.1)' }} tickLine={false}
            tickFormatter={v => MONTH_SHORT[v] ?? v}/>
          <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} width={55}
            domain={yDomain} tickCount={6}
            tickFormatter={(v: number) => Number.isInteger(v) ? v.toString() : v.toFixed(1)}/>
          <Tooltip
            content={<Tooltip_ />}
            cursor={{ stroke:'rgba(148,163,184,0.15)', strokeWidth:1 }}
            {...(isTouchDevice && touchIndex !== null ? { defaultIndex: touchIndex, active: true } : {})}
          />
          <Legend content={<Legend_ />}/>

          {/* Bandas históricas (solo en modo anio-historico) */}
          {isHistorico && <>
            <Line type="monotone" dataKey="Mínima Histórica" name="Mínima Histórica"
              stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="5 5" strokeOpacity={0.7}/>
            <Line type="monotone" dataKey="Máxima Histórica" name="Máxima Histórica"
              stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" strokeOpacity={0.7}/>
            <Line type="monotone" dataKey="Media Histórica" name="Media Histórica"
              stroke="#f59e0b" strokeWidth={2} dot={false}/>
          </>}

          {/* Series dinámicas */}
          {seriesKeys.map((k, i) => {
            const color = seriesColors[k] ?? '#22d3ee';
            // La primera serie del modo anio-historico lleva área
            if (isHistorico && i === 0) {
              return (
                <Area key={k} type="monotone" dataKey={k} name={k}
                  stroke={color} strokeWidth={3} fill={`url(#grad_${k})`}
                  dot={{ r:3, fill:color, strokeWidth:0 }}
                  activeDot={{ r:6, fill:color, stroke:`${color}66`, strokeWidth:4 }}/>
              );
            }
            // Segunda serie en modo anio-historico = año anterior, línea discontinua
            if (isHistorico && i === 1) {
              return (
                <Line key={k} type="monotone" dataKey={k} name={k + ' (año ant.)'}
                  stroke={color} strokeWidth={1.5} strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r:4, fill:color, strokeWidth:0 }}/>
              );
            }
            return (
              <Line key={k} type="monotone" dataKey={k} name={k}
                stroke={color} strokeWidth={2.5} dot={{ r:2.5, fill:color, strokeWidth:0 }}
                activeDot={{ r:5, fill:color, stroke:`${color}66`, strokeWidth:3 }}/>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalLineChart;
