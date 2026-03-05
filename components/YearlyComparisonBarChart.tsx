import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
  keyA: string;   // primera barra
  keyB: string;   // segunda barra
  keyC?: string;  // tercera barra (opcional)
  colorA?: string;
  colorB?: string;
  colorC?: string;
}

const MONTH_SHORT: Record<string, string> = {
  'Enero':'Ene','Febrero':'Feb','Marzo':'Mar','Abril':'Abr',
  'Mayo':'May','Junio':'Jun','Julio':'Jul','Agosto':'Ago',
  'Septiembre':'Sep','Octubre':'Oct','Noviembre':'Nov','Diciembre':'Dic',
};

const Tooltip_: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // Buscar valores por nombre de serie
  const getVal = (name: string) => payload.find((p: any) => p.dataKey === name)?.value ?? null;
  const names  = payload.map((p: any) => p.dataKey);

  // Detectar cuál es el año principal (keyB), el anterior (keyA) y la media
  const yearMain = payload.find((p: any) => !p.dataKey.includes('Histórica') && payload.indexOf(p) === 1);
  const yearPrev = payload.find((p: any) => !p.dataKey.includes('Histórica') && payload.indexOf(p) === 0);
  const media    = payload.find((p: any) => p.dataKey === 'Media Histórica');

  const diffPrev  = yearMain && yearPrev  && yearMain.value != null && yearPrev.value != null
    ? yearMain.value - yearPrev.value : null;
  const diffMedia = yearMain && media && yearMain.value != null && media.value != null
    ? yearMain.value - media.value : null;

  const DiffRow = ({ label, diff }: { label: string; diff: number }) => (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold whitespace-nowrap ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {diff >= 0 ? '+' : ''}{diff.toFixed(3)} hm³
      </span>
    </div>
  );

  return (
    <div style={{
      background:'rgba(9,14,28,0.97)', border:'1px solid rgba(148,163,184,0.2)',
      borderRadius:'12px', padding:'10px 14px', boxShadow:'0 10px 30px rgba(0,0,0,0.5)',
      minWidth: '210px',
    }}>
      <p className="font-bold text-white mb-2 text-sm">{label}</p>

      {/* Valores de cada barra */}
      {payload.map((p: any) => p.value != null && (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.fill }}/>
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-white ml-auto whitespace-nowrap">{Number(p.value).toFixed(3)} hm³</span>
        </div>
      ))}

      {/* Diferencias */}
      {(diffPrev !== null || diffMedia !== null) && (
        <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
          {diffPrev  !== null && <DiffRow label={`vs. ${yearPrev?.dataKey}`}  diff={diffPrev} />}
          {diffMedia !== null && <DiffRow label="vs. Media Histórica" diff={diffMedia} />}
        </div>
      )}
    </div>
  );
};

const Legend_: React.FC<any> = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-2">
    {payload?.map((e: any) => (
      <div key={e.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background:e.color }}/>
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
  const pad = Math.max(range * 0.08, max * 0.05, 0.15);
  const lo = clampMinZero ? Math.max(0, min - pad) : (min - pad);
  const hi = max + pad;
  if (hi <= lo) return [clampMinZero ? 0 : lo, lo + 1];
  return [lo, hi];
}

const YearlyComparisonBarChart: React.FC<Props> = ({
  data, keyA, keyB, keyC, colorA = '#f59e0b', colorB = '#22d3ee', colorC = '#94a3b8',
}) => {
  const keys = keyC ? [keyA, keyB, keyC] : [keyA, keyB];
  const yDomain = computeYDomain(data, keys, true);
  const [touchIndex, setTouchIndex] = React.useState<number | null>(null);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  // Leyenda personalizada con colores directos (sin duplicados)
  const legendPayload = [
    { value: keyA, color: colorA },
    { value: keyB, color: colorB },
    ...(keyC && keyC !== keyA && keyC !== keyB ? [{ value: keyC, color: colorC }] : []),
  ];

  return (
    <div style={{ width:'100%', height:'clamp(220px, 40vw, 320px)' }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top:8, right:8, left:-15, bottom:0 }} barGap={3} barCategoryGap="25%"
          onClick={(e) => { if (isTouchDevice && e?.activeTooltipIndex !== undefined) setTouchIndex(prev => prev === e.activeTooltipIndex ? null : e.activeTooltipIndex); }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false}/>
        <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:10 }}
          axisLine={{ stroke:'rgba(148,163,184,0.1)' }} tickLine={false}
          tickFormatter={v => MONTH_SHORT[v] ?? v}/>
        <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={false} tickLine={false} width={55}
          domain={yDomain} tickCount={6}
          tickFormatter={(v: number) => Number.isInteger(v) ? v.toString() : v.toFixed(1)}/>
        <Tooltip
          content={<Tooltip_ />}
          cursor={{ fill:'rgba(148,163,184,0.05)' }}
          {...(isTouchDevice && touchIndex !== null ? { defaultIndex: touchIndex, active: true } : {})}
        />
        <Legend content={(props) => <Legend_ {...props} payload={legendPayload}/>}/>
        <Bar dataKey={keyA} name={keyA} fill={colorA} fillOpacity={0.85} radius={[4,4,0,0]} maxBarSize={18}/>
        <Bar dataKey={keyB} name={keyB} fill={colorB} fillOpacity={0.85} radius={[4,4,0,0]} maxBarSize={18}/>
        {keyC && <Bar dataKey={keyC} name={keyC} fill={colorC} fillOpacity={0.7} radius={[4,4,0,0]} maxBarSize={18}/>}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YearlyComparisonBarChart;
