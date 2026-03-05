import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CSV_FILES, MONTHS, SOURCES } from './constants';
import { parseCSV } from './services/dataParser';
import type { YearlyData, ChartDataPoint, ComparisonMode, ComparisonParams } from './types';
import KPICard from './components/KPICard';
import HistoricalLineChart from './components/HistoricalLineChart';
import YearlyComparisonBarChart from './components/YearlyComparisonBarChart';
import {
  IconChartLine, IconTrendingUp, IconTrendingDown, IconStack2, IconDropletHalf2,
  IconDownload, IconWater, IconGauge, IconTable, IconRefresh, IconDam,
} from './components/Icons';
import MapPlaceholder from './components/MapPlaceholder';

// ─── Colores ──────────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  [SOURCES[0]]: '#22d3ee',
  [SOURCES[1]]: '#a855f7',
};

const PALETTE = [
  '#22d3ee','#a855f7','#f59e0b','#10b981','#ef4444',
  '#3b82f6','#f97316','#ec4899','#84cc16','#06b6d4',
  '#8b5cf6','#14b8a6','#d946ef','#65a30d','#dc2626',
  '#0ea5e9','#e11d48','#7c3aed','#16a34a','#ca8a04',
];

// ─── Modos de comparación disponibles ────────────────────────────────────────
const COMP_MODES: { id: ComparisonMode; label: string; icon: string; desc: string }[] = [
  { id:'anio-historico', label:'Año vs. Histórico', icon:'📅', desc:'Un año frente a mín/media/máx de toda la serie' },
  { id:'ultimos-n',      label:'Últimos N años',    icon:'📈', desc:'Evolución de los últimos años en una sola gráfica' },
  { id:'anio-anio',      label:'Año vs. Año',       icon:'⚖️', desc:'Compara dos años específicos mes a mes' },
  { id:'decada',         label:'Por Década',         icon:'🗓️', desc:'Todos los años de una misma década' },
  { id:'periodo',        label:'Período',            icon:'📊', desc:'Rango de años personalizado' },
];

// ─── Helper: obtener décadas disponibles ─────────────────────────────────────
const getDecades = (years: number[]) => {
  const set = new Set(years.map(y => Math.floor(y / 10) * 10));
  return [...set].sort((a, b) => a - b);
};

// ─── DataTable ────────────────────────────────────────────────────────────────
const DataTable: React.FC<{ data: ChartDataPoint[]; seriesKeys: string[]; seriesColors: Record<string,string> }> = ({ data, seriesKeys, seriesColors }) => {
  if (!data.length) return null;
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border:'1px solid rgba(148,163,184,0.1)' }}>
      <table className="w-full text-xs" style={{ minWidth:'400px' }}>
        <thead>
          <tr style={{ background:'rgba(2,6,23,0.6)' }}>
            <th className="px-3 py-3 text-left text-slate-500 font-semibold uppercase tracking-wider">Mes</th>
            {seriesKeys.map(k => (
              <th key={k} className="px-3 py-3 text-right font-semibold uppercase tracking-wider"
                style={{ color: seriesColors[k] ?? '#94a3b8' }}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.month} style={{ background: i%2===0 ? 'rgba(30,41,59,0.25)' : 'transparent' }}>
              <td className="px-3 py-2.5 text-slate-300 font-semibold">{row.month}</td>
              {seriesKeys.map(k => (
                <td key={k} className="px-3 py-2.5 text-right font-bold"
                  style={{ color: seriesColors[k] ?? '#94a3b8' }}>
                  {row[k] != null ? Number(row[k]).toFixed(1) : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Radial Gauge ─────────────────────────────────────────────────────────────
const RadialGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
  const c = Math.min(Math.max(percentage, 0), 100);
  const circ = Math.PI * 63; // radio real del arco = 63
  const offset = c >= 100 ? 0 : circ - (c / 100) * circ;
  const color = c >= 75 ? '#22d3ee' : c >= 40 ? '#f59e0b' : '#ef4444';
  const label = c >= 75 ? 'Normal' : c >= 40 ? 'Bajo' : 'Crítico';
  return (
    <div className="flex flex-col items-center py-3">
      <svg width="150" height="84" viewBox="0 0 150 84">
        <path d="M 12 74 A 63 63 0 0 1 138 74" fill="none" stroke="rgba(51,65,85,0.6)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 12 74 A 63 63 0 0 1 138 74" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter:`drop-shadow(0 0 8px ${color}cc)`, transition:'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        {[0,25,50,75,100].map(t => {
          const r = ((-180+(t/100)*180)*Math.PI)/180;
          return <line key={t} x1={75+58*Math.cos(r)} y1={74+58*Math.sin(r)} x2={75+50*Math.cos(r)} y2={74+50*Math.sin(r)} stroke="rgba(148,163,184,0.25)" strokeWidth="1.5"/>;
        })}
        <text x="75" y="66" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="22" fontWeight="900" fill={color}>{c.toFixed(0)}%</text>
        <text x="12"  y="82" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8" fill="#475569">0%</text>
        <text x="138" y="82" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="8" fill="#475569">100%</text>
      </svg>
      <span className="mt-1 text-xs font-bold px-4 py-1.5 rounded-full"
        style={{ background:`${color}18`, color, border:`1px solid ${color}35` }}>
        Estado: {label}
      </span>
    </div>
  );
};

// ─── Botón exportar ───────────────────────────────────────────────────────────
const ExportBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick}
    className="p-2 rounded-lg transition-all duration-200 hover:text-cyan-400 active:scale-90 flex-shrink-0"
    style={{ background:'rgba(51,65,85,0.5)', border:'1px solid rgba(148,163,184,0.1)', color:'#64748b' }}
    title="Exportar PNG">
    <IconDownload/>
  </button>
);

// ─── Select estilizado ────────────────────────────────────────────────────────
const StyledSelect: React.FC<{ value:string; onChange:(v:string)=>void; children:React.ReactNode; minWidth?:string }> = ({
  value, onChange, children, minWidth='140px'
}) => (
  <div className="relative" style={{ minWidth }}>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-semibold outline-none cursor-pointer"
      style={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(6,182,212,0.3)', color:'#22d3ee' }}>
      {children}
    </select>
    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color:'#22d3ee' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
  </div>
);

// ─── LISTÓN SUPERIOR DE CONTROLES ────────────────────────────────────────────
const TopRibbon: React.FC<{
  sourceValue: string;
  onSourceChange: (v:string) => void;
  mode: ComparisonMode;
  onModeChange: (m:ComparisonMode) => void;
  params: ComparisonParams;
  onParams: (p:Partial<ComparisonParams>) => void;
  availableYears: number[];
  lastUpdated: Date;
}> = ({ sourceValue, onSourceChange, mode, onModeChange, params, onParams, availableYears, lastUpdated }) => {
  const decades = getDecades(availableYears);
  const lastYear = availableYears[availableYears.length - 1] ?? new Date().getFullYear();

  return (
    <div className="sticky top-0 z-30 w-full" style={{
      background: 'rgba(4,8,20,0.97)',
      borderBottom: '1px solid rgba(6,182,212,0.2)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
    }}>
      {/* Línea de acento */}
      <div style={{ height:'2px', background:'linear-gradient(90deg,transparent,#22d3ee 30%,#a855f7 70%,transparent)' }}/>

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">

        {/* Fila 1: logo + título + estado */}
        <div className="flex items-center justify-between gap-3 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width:'56px', height:'56px', background:'rgba(255,255,255,0.95)', padding:'6px', boxShadow:'0 0 16px rgba(6,182,212,0.3)' }}>
              <img src={`${import.meta.env.BASE_URL}INRH.png`} alt="INRH" style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-white tracking-tight leading-tight text-sm sm:text-base lg:text-lg truncate">
                Cuadro de Mando{' '}
                <span className="gradient-text hidden sm:inline">Hidrológico</span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Embalses · Santiago de Cuba</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500"
              style={{ background:'rgba(30,41,59,0.5)', border:'1px solid rgba(148,163,184,0.08)' }}>
              <IconRefresh/> {lastUpdated.toLocaleTimeString('es-CU')}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"/>
              <span className="text-xs text-emerald-400 font-semibold hidden sm:inline">En línea</span>
            </div>
          </div>
        </div>

        {/* Fila 2: controles */}
        <div className="flex flex-wrap items-center gap-2 pb-3 pt-1">

          {/* Fuente */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">📍 Fuente</span>
            <StyledSelect value={sourceValue} onChange={onSourceChange} minWidth="160px">
              <option value="all"  style={{ background:'#0f172a' }}>🌊 Provincia completa</option>
              {SOURCES.map(s => (
                <option key={s} value={s} style={{ background:'#0f172a' }}>💧 {s}</option>
              ))}
            </StyledSelect>
          </div>

          <div className="w-px h-6 bg-slate-700 hidden sm:block"/>

          {/* Modo de comparación */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">📊 Análisis</span>
            <StyledSelect value={mode} onChange={v => onModeChange(v as ComparisonMode)} minWidth="175px">
              {COMP_MODES.map(m => (
                <option key={m.id} value={m.id} style={{ background:'#0f172a' }}>{m.icon} {m.label}</option>
              ))}
            </StyledSelect>
          </div>

          {/* Parámetros dinámicos según modo */}
          <div className="flex flex-wrap items-center gap-2">

            {/* anio-historico: un año */}
            {mode === 'anio-historico' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 whitespace-nowrap">Año</span>
                <StyledSelect value={String(params.year)} onChange={v => onParams({ year:+v })} minWidth="90px">
                  {[...availableYears].reverse().map(y => (
                    <option key={y} value={y} style={{ background:'#0f172a' }}>{y}</option>
                  ))}
                </StyledSelect>
              </div>
            )}

            {/* ultimos-n: cuántos años */}
            {mode === 'ultimos-n' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 whitespace-nowrap">Últimos</span>
                <div className="flex gap-1">
                  {[5,10,15,20].map(n => (
                    <button key={n} onClick={() => onParams({ nYears:n })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={params.nYears===n ? {
                        background:'linear-gradient(135deg,#06b6d4,#0e7490)', color:'#fff',
                        boxShadow:'0 0 12px rgba(6,182,212,0.4)'
                      } : { background:'rgba(51,65,85,0.5)', color:'#64748b' }}>
                      {n}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500">años (hasta {lastYear})</span>
              </div>
            )}

            {/* anio-anio: dos selectores */}
            {mode === 'anio-anio' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <StyledSelect value={String(params.yearA)} onChange={v => onParams({ yearA:+v })} minWidth="90px">
                  {[...availableYears].reverse().map(y => (
                    <option key={y} value={y} style={{ background:'#0f172a' }}>{y}</option>
                  ))}
                </StyledSelect>
                <span className="text-xs text-slate-400">vs.</span>
                <StyledSelect value={String(params.yearB)} onChange={v => onParams({ yearB:+v })} minWidth="90px">
                  {[...availableYears].reverse().map(y => (
                    <option key={y} value={y} style={{ background:'#0f172a' }}>{y}</option>
                  ))}
                </StyledSelect>
              </div>
            )}

            {/* decada: selector de década */}
            {mode === 'decada' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 whitespace-nowrap">Década</span>
                <StyledSelect value={String(params.decade)} onChange={v => onParams({ decade:+v })} minWidth="110px">
                  {decades.map(d => (
                    <option key={d} value={d} style={{ background:'#0f172a' }}>Años {d}s</option>
                  ))}
                </StyledSelect>
              </div>
            )}

            {/* periodo: desde / hasta */}
            {mode === 'periodo' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 whitespace-nowrap">Desde</span>
                <StyledSelect value={String(params.fromYear)} onChange={v => onParams({ fromYear:+v })} minWidth="90px">
                  {availableYears.map(y => (
                    <option key={y} value={y} style={{ background:'#0f172a' }}>{y}</option>
                  ))}
                </StyledSelect>
                <span className="text-xs text-slate-500">hasta</span>
                <StyledSelect value={String(params.toYear)} onChange={v => onParams({ toYear:+v })} minWidth="90px">
                  {[...availableYears].reverse().map(y => (
                    <option key={y} value={y} style={{ background:'#0f172a' }}>{y}</option>
                  ))}
                </StyledSelect>
              </div>
            )}
          </div>

          {/* Descripción del modo activo */}
          <div className="ml-auto hidden lg:flex items-center">
            <span className="text-xs text-slate-600 italic">
              {COMP_MODES.find(m => m.id === mode)?.desc}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [allData,         setAllData]         = useState<{ source:string; data:YearlyData[] }[]>([]);
  const [availableYears,  setAvailableYears]  = useState<number[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([...SOURCES]);
  const [lastUpdated,     setLastUpdated]     = useState(new Date());
  const [activeTab,       setActiveTab]       = useState<'charts'|'table'>('charts');

  // ── Modo de comparación ──────────────────────────────────────────────────
  const [compMode,   setCompMode]   = useState<ComparisonMode>('anio-historico');
  const [compParams, setCompParams] = useState<ComparisonParams>({
    year: new Date().getFullYear(),
    nYears: 10,
    yearA: new Date().getFullYear(),
    yearB: new Date().getFullYear() - 10,
    decade: Math.floor(new Date().getFullYear() / 10) * 10,
    fromYear: new Date().getFullYear() - 10,
    toYear: new Date().getFullYear(),
  });

  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef  = useRef<HTMLDivElement>(null);

  // ── Carga de datos ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const results = await Promise.all(
        SOURCES.map(async source => {
          try {
            const r = await fetch(CSV_FILES[source]);
            if (!r.ok) return null; // CSV aún no existe → ignorar
            const t = await r.text();
            return { source, data: parseCSV(t) };
          } catch {
            return null; // error de red → ignorar
          }
        })
      );
      const entries = results.filter(Boolean) as { source: string; data: any[] }[];
      setAllData(entries);
      const ys = [...new Set(entries.flatMap(d => d.data.map(y => y.year)))].sort((a,b)=>a-b).filter(y=>y>=1978);
      setAvailableYears(ys);
      if (ys.length) {
        const last = ys[ys.length-1];
        setCompParams(p => ({
          ...p,
          year: last,
          yearA: last,
          yearB: Math.max(ys[0], last - 10),
          decade: Math.floor(last/10)*10,
          fromYear: Math.max(ys[0], last-10),
          toYear: last,
        }));
      }
    };
    load();
    const iv = setInterval(() => setLastUpdated(new Date()), 3600000);
    return () => clearInterval(iv);
  }, []);

  // ── Fuente ───────────────────────────────────────────────────────────────
  const sourceDropdownValue = selectedSources.length === SOURCES.length ? 'all' : selectedSources[0];
  const handleSourceChange = (v:string) => {
    setSelectedSources(v === 'all' ? [...SOURCES] : [v]);
  };
  const updateParams = (p:Partial<ComparisonParams>) => setCompParams(prev => ({ ...prev, ...p }));

  // ── Datos combinados de la fuente seleccionada ───────────────────────────
  const combinedData = useMemo((): YearlyData[] => {
    if (!allData.length || !selectedSources.length) return [];
    const sel = allData.filter(d => selectedSources.includes(d.source));
    const map = new Map<number,(number|null)[]>();
    sel.forEach(({ data }) => {
      const ym = new Map<number,(number|null)[]>();
      data.forEach(yd => ym.set(yd.year, yd.values));
      ym.forEach((vals, yr) => {
        const ex = map.get(yr);
        if (ex) map.set(yr, ex.map((v,i) => { const n=vals[i]??null; return v===null&&n===null?null:(v??0)+(n??0); }));
        else map.set(yr, [...vals]);
      });
    });
    return [...map.entries()].map(([year,values])=>({year,values})).sort((a,b)=>a.year-b.year);
  }, [allData, selectedSources]);

  // ── Estadísticas históricas ───────────────────────────────────────────────
  const histStats = useMemo(() => {
    const avg=Array(12).fill(0), min=Array(12).fill(Infinity), max=Array(12).fill(-Infinity), cnt=Array(12).fill(0);
    combinedData.forEach(yd => yd.values.forEach((v,i) => {
      if (v!==null) { avg[i]+=v; min[i]=Math.min(min[i],v); max[i]=Math.max(max[i],v); cnt[i]++; }
    }));
    return {
      avg: avg.map((s,i)=>cnt[i]>0?s/cnt[i]:0),
      min: min.map(v=>v===Infinity?0:v),
      max: max.map(v=>v===-Infinity?0:v),
    };
  }, [combinedData]);

  // ── KPIs (siempre del año más reciente) ──────────────────────────────────
  const { capacity, currentReserve, capacityPercentage, monthlyVariation } = useMemo(() => {
    if (!combinedData.length) return { capacity:0, currentReserve:0, capacityPercentage:0, monthlyVariation:0 };
    const allVals = combinedData.flatMap(d=>d.values).filter(v=>v!==null) as number[];
    const capacity = Math.max(...allVals, 0);
    const sorted = [...combinedData].sort((a,b)=>b.year-a.year);
    let latest:YearlyData|null = null;
    for (const yd of sorted) { if (yd.values.some(v=>v!==null)) { latest=yd; break; } }
    let cur=0, prev=0;
    if (latest) {
      const valid = latest.values.filter(v=>v!==null) as number[];
      if (valid.length) { cur=valid[valid.length-1]; if (valid.length>1) prev=valid[valid.length-2]; }
    }
    const rawPct = capacity > 0 ? (cur / capacity) * 100 : 0;
    const capacityPercentage = Math.min(Math.round(rawPct * 10) / 10, 100);
    return { capacity, currentReserve:cur, capacityPercentage, monthlyVariation:cur-prev };
  }, [combinedData]);

  // ── CÁLCULO DE DATOS PARA GRÁFICAS según modo ────────────────────────────
  const { chartData, seriesKeys, seriesColors, chartTitle, barKeyA, barKeyB, barKeyC } = useMemo(() => {
    const getYearVals = (y:number) => combinedData.find(d=>d.year===y)?.values ?? Array(12).fill(null);

    // Helper: años relevantes según modo
    const getYears = (): number[] => {
      switch(compMode) {
        case 'anio-historico': {
          const prevYear = availableYears[availableYears.indexOf(compParams.year) - 1];
          return prevYear !== undefined ? [compParams.year, prevYear] : [compParams.year];
        }
        case 'ultimos-n': {
          const base = availableYears[availableYears.length-1] ?? compParams.year;
          return availableYears.filter(y=>y<=base).slice(-compParams.nYears);
        }
        case 'anio-anio': return [compParams.yearA, compParams.yearB];
        case 'decada': return availableYears.filter(y=>Math.floor(y/10)*10===compParams.decade);
        case 'periodo': return availableYears.filter(y=>y>=compParams.fromYear && y<=compParams.toYear);
        default: return [];
      }
    };

    const years = getYears();
    const colors: Record<string,string> = {};
    years.forEach((y, i) => {
      if (compMode === 'anio-historico' && i === 1) {
        colors[String(y)] = '#94a3b8'; // año anterior en gris suave
      } else {
        colors[String(y)] = PALETTE[i % PALETTE.length];
      }
    });

    // Título descriptivo
    let title = '';
    switch(compMode) {
      case 'anio-historico': title=`${compParams.year} vs. Serie Histórica`; break;
      case 'ultimos-n':      title=`Últimos ${compParams.nYears} años`; break;
      case 'anio-anio':      title=`${compParams.yearA} vs. ${compParams.yearB}`; break;
      case 'decada':         title=`Década de los ${compParams.decade}s`; break;
      case 'periodo':        title=`Período ${compParams.fromYear}–${compParams.toYear}`; break;
    }

    // Construir datos de la gráfica
    const data: ChartDataPoint[] = MONTHS.map((month,i) => {
      const point: ChartDataPoint = { month };
      // Estadísticas históricas (solo en modo anio-historico)
      if (compMode === 'anio-historico') {
        point['Mínima Histórica'] = histStats.min[i];
        point['Media Histórica']  = histStats.avg[i];
        point['Máxima Histórica'] = histStats.max[i];
      }
      years.forEach(y => { point[String(y)] = getYearVals(y)[i] ?? null; });
      return point;
    });

    const sKeys = years.map(y=>String(y));

    // Barra: para anio-historico y anio-anio tiene sentido
    const bKeyA = compMode==='anio-anio' ? String(compParams.yearA)
      : compMode==='anio-historico' && years.length >= 2 ? String(years[1]) // año anterior
      : 'Media Histórica';
    const bKeyB = compMode==='anio-anio' ? String(compParams.yearB) : String(years[0]??compParams.year);
    const bKeyC = compMode==='anio-historico' ? 'Media Histórica' : undefined;

    return { chartData:data, seriesKeys:sKeys, seriesColors:colors, chartTitle:title, barKeyA:bKeyA, barKeyB:bKeyB, barKeyC:bKeyC };
  }, [compMode, compParams, combinedData, histStats, availableYears]);

  // Colores completos incluyendo bandas históricas
  const allSeriesColors = useMemo(() => ({
    'Mínima Histórica':'#ef4444',
    'Media Histórica':'#f59e0b',
    'Máxima Histórica':'#3b82f6',
    ...seriesColors,
  }), [seriesColors]);

  // ── Exportar CSV ─────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    if (!chartData.length) return;
    const headers = Object.keys(chartData[0]);
    const rows = [headers.join(','), ...chartData.map(row =>
      headers.map(h=>`"${row[h]==null?'':String(row[h]).replace(/"/g,'""')}"`).join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'}));
    a.download=`embalses_${chartTitle.replace(/\s/g,'_')}.csv`;
    a.click();
  }, [chartData, chartTitle]);

  const handleExportPNG = async (ref:React.RefObject<HTMLDivElement>, name:string, title:string, legendItems?: {label:string; color:string}[]) => {
    const container = ref.current; if (!container) return;
    const svg = container.querySelector('svg'); if (!svg) return;

    const SCALE    = 3;
    const HEADER   = 52;
    const FOOTER   = 36; // espacio para la leyenda
    const MARGIN_R = 24;
    const W = (svg.clientWidth  || 800) + MARGIN_R;
    const H =  svg.clientHeight || 400;

    const canvas = document.createElement('canvas');
    canvas.width  = W * SCALE;
    canvas.height = (H + HEADER + FOOTER) * SCALE;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(SCALE, SCALE);

    // Fondo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H + HEADER + FOOTER);

    // Título
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 16, HEADER / 2);

    // Subtítulo
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Embalses · Santiago de Cuba · hm³', 16, HEADER / 2 + 18);

    // Línea separadora superior
    ctx.strokeStyle = 'rgba(6,182,212,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, HEADER - 1); ctx.lineTo(W, HEADER - 1); ctx.stroke();

    // Gráfica (SVG)
    await new Promise<void>(resolve => {
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type:'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const img  = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, HEADER, W, H);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });

    // Leyenda desde los datos pasados directamente
    if (legendItems && legendItems.length > 0) {
      const yLegend = HEADER + H + FOOTER / 2;
      ctx.font = '10px Inter, sans-serif';
      ctx.textBaseline = 'middle';
      const totalW = legendItems.reduce((acc, item) => acc + 10 + 6 + ctx.measureText(item.label).width + 18, 0);
      let x = (W - totalW) / 2;
      legendItems.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(x, yLegend - 5, 10, 10, 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(item.label, x + 16, yLegend);
        x += 16 + ctx.measureText(item.label).width + 18;
      });
    }

    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png', 1.0);
    a.download = name;
    a.click();
  };

  // ── Stats por embalse ─────────────────────────────────────────────────────
  const sourceStats = useMemo(()=>SOURCES.map(source=>{
    const sd=allData.find(d=>d.source===source); if (!sd) return { source, current:0, max:0 };
    const ym=new Map<number,(number|null)[]>(); sd.data.forEach(yd=>ym.set(yd.year,yd.values));
    const all=[...ym.values()].flatMap(v=>v).filter(v=>v!==null) as number[];
    const max=Math.max(...all,0); let current=0;
    for (const [,vals] of [...ym.entries()].sort((a,b)=>b[0]-a[0])) {
      const valid=vals.filter(v=>v!==null) as number[]; if (valid.length){current=valid[valid.length-1];break;}
    }
    return {source,current,max};
  }),[allData]);

  // Mostrar barra de comparación solo en modos que tienen sentido
  const showBarChart = compMode==='anio-historico' || compMode==='anio-anio';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen antialiased relative" style={{ background:'linear-gradient(160deg,#020817 0%,#0f172a 45%,#0d1f35 100%)' }}>

      {/* Fondo decorativo */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div style={{ position:'absolute', inset:0, backgroundImage:[
          'radial-gradient(ellipse 80% 50% at 15% 10%,rgba(6,182,212,0.07) 0%,transparent 60%)',
          'radial-gradient(ellipse 70% 60% at 85% 85%,rgba(168,85,247,0.06) 0%,transparent 60%)',
        ].join(',')}}/>
      </div>

      {/* ══ LISTÓN SUPERIOR DE CONTROLES ══════════════════════════════ */}
      <TopRibbon
        sourceValue={sourceDropdownValue}
        onSourceChange={handleSourceChange}
        mode={compMode}
        onModeChange={setCompMode}
        params={compParams}
        onParams={updateParams}
        availableYears={availableYears}
        lastUpdated={lastUpdated}
      />

      {/* ── Contenido principal ─────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pt-5 pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── SIDEBAR ─────────────────────────────────────────────── */}
          <aside className="lg:col-span-1 flex flex-col gap-5 order-2 lg:order-1">

            {/* Mapa */}
            <MapPlaceholder/>

            {/* Exportar */}
            <button onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95"
              style={{ background:'linear-gradient(135deg,rgba(6,182,212,0.18),rgba(14,116,144,0.18))', border:'1px solid rgba(6,182,212,0.35)', color:'#22d3ee' }}>
              <IconDownload/> Exportar datos (CSV)
            </button>
          </aside>

          {/* ── MAIN ────────────────────────────────────────────────── */}
          <main className="lg:col-span-2 flex flex-col gap-5 order-1 lg:order-2">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <KPICard title="Capacidad Total"   value={Number(capacity.toFixed(3)).toLocaleString('es-CU', {minimumFractionDigits:0, maximumFractionDigits:3})}              unit="hm³" icon={<IconStack2/>}
                gradientFrom="rgba(59,130,246,0.12)" gradientTo="rgba(30,64,175,0.08)" borderColor="#3b82f6" subtitle="Máximo histórico"/>
              <KPICard title="Reserva Actual"    value={Number(currentReserve.toFixed(3)).toLocaleString('es-CU', {minimumFractionDigits:0, maximumFractionDigits:3})}        unit="hm³" icon={<IconDropletHalf2/>}
                gradientFrom="rgba(16,185,129,0.12)" gradientTo="rgba(5,150,105,0.08)" borderColor="#10b981" progress={capacityPercentage} subtitle="Último dato"/>
              {/* Tarjeta gauge % Capacidad */}
              <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 cursor-default select-none"
                style={{ background:'linear-gradient(145deg,rgba(245,158,11,0.12) 0%,rgba(180,83,9,0.08) 100%)', border:'1px solid #f59e0b40', boxShadow:'0 4px 24px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                {/* Glow orb */}
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none" style={{background:'#f59e0b',opacity:0.12,filter:'blur(28px)'}}/>
                <div className="absolute top-0 left-4 right-4 h-px rounded-full" style={{background:'linear-gradient(90deg,transparent,#f59e0b80,transparent)'}}/>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">% Capacidad</p>
                <RadialGauge percentage={capacityPercentage}/>
                <p className="text-slate-500 text-xs text-center -mt-1">Respecto al máximo histórico</p>
              </div>
              <KPICard title="Variación Mensual" value={Math.abs(monthlyVariation).toFixed(1)} unit="hm³"
                icon={monthlyVariation>=0?<IconTrendingUp/>:<IconTrendingDown/>}
                gradientFrom="rgba(168,85,247,0.12)" gradientTo="rgba(126,34,206,0.08)" borderColor="#a855f7"
                variation={monthlyVariation} subtitle="Vs. mes anterior"/>
            </div>

            {/* Gráficas / Tabla */}
            <div className="glass rounded-2xl overflow-hidden" style={{boxShadow:'0 4px 40px rgba(0,0,0,0.35)'}}>

              {/* Tabs */}
              <div className="flex items-center px-4 sm:px-5 pt-4 gap-1" style={{borderBottom:'1px solid rgba(148,163,184,0.07)'}}>
                {([{id:'charts',label:'Gráficas',icon:<IconChartLine/>},{id:'table',label:'Tabla',icon:<IconTable/>}] as const).map(tab=>{
                  const active=activeTab===tab.id;
                  return (
                    <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all -mb-px"
                      style={active?{background:'rgba(6,182,212,0.1)',color:'#22d3ee',borderBottom:'2px solid #22d3ee'}
                             :{color:'#475569',borderBottom:'2px solid transparent'}}>
                      {tab.icon}{tab.label}
                    </button>
                  );
                })}
                {/* Modo activo badge */}
                <div className="ml-auto pb-2 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{background:'rgba(6,182,212,0.08)',border:'1px solid rgba(6,182,212,0.2)'}}>
                  <span className="text-xs text-cyan-400 font-semibold">
                    {COMP_MODES.find(m=>m.id===compMode)?.icon} {chartTitle}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {activeTab==='charts' ? (
                  <div className="flex flex-col gap-8">
                    {/* Gráfica principal */}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-100">{chartTitle}</h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {COMP_MODES.find(m=>m.id===compMode)?.desc}
                          </p>
                        </div>
                        <ExportBtn onClick={()=>handleExportPNG(lineChartRef,`${chartTitle}.png`,chartTitle,
                          [
                            ...(compMode==='anio-historico' ? [
                              { label: String(seriesKeys[0]), color: allSeriesColors[seriesKeys[0]] },
                              ...(seriesKeys[1] ? [{ label: String(seriesKeys[1])+' (año ant.)', color: '#94a3b8' }] : []),
                              { label: 'Media Histórica', color: '#f59e0b' },
                              { label: 'Máxima Histórica', color: '#3b82f6' },
                              { label: 'Mínima Histórica', color: '#ef4444' },
                            ] : seriesKeys.map(k => ({ label: k, color: allSeriesColors[k] }))),
                          ]
                        )}/>
                      </div>
                      <div ref={lineChartRef}>
                        <HistoricalLineChart
                          data={chartData}
                          mode={compMode}
                          seriesKeys={seriesKeys}
                          seriesColors={allSeriesColors}
                          selectedYear={compParams.year}
                        />
                      </div>
                    </div>

                    {/* Barra comparativa (solo en modos que aplican) */}
                    {showBarChart && (
                      <>
                        <div style={{borderTop:'1px solid rgba(148,163,184,0.07)'}}/>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                                Comparativa mensual: {barKeyB} vs. {barKeyA}{barKeyC ? ` vs. ${barKeyC}` : ''}
                              </h2>
                              <p className="text-xs text-slate-500 mt-0.5">Diferencia mes a mes en hm³</p>
                            </div>
                            <ExportBtn onClick={()=>handleExportPNG(barChartRef,`comparativa_${chartTitle}.png`,`Comparativa mensual: ${barKeyB} vs. ${barKeyA}${barKeyC ? ' vs. '+barKeyC : ''}`,
                              [
                                { label: barKeyA, color: allSeriesColors[barKeyA] ?? '#94a3b8' },
                                { label: barKeyB, color: allSeriesColors[barKeyB] ?? '#22d3ee' },
                                ...(barKeyC ? [{ label: barKeyC, color: allSeriesColors[barKeyC] ?? '#f59e0b' }] : []),
                              ]
                            )}/>
                          </div>
                          <div ref={barChartRef}>
                            <YearlyComparisonBarChart
                              data={chartData}
                              keyA={barKeyA}
                              keyB={barKeyB}
                              keyC={barKeyC}
                              colorA={allSeriesColors[barKeyA]}
                              colorB={allSeriesColors[barKeyB]}
                              colorC={barKeyC ? allSeriesColors[barKeyC] : undefined}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-100">Tabla — {chartTitle}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Valores mensuales en hm³</p>
                      </div>
                      <button onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-cyan-400"
                        style={{background:'rgba(6,182,212,0.1)',border:'1px solid rgba(6,182,212,0.25)'}}>
                        <IconDownload/>CSV
                      </button>
                    </div>
                    <DataTable data={chartData} seriesKeys={[
                      ...(compMode==='anio-historico'?['Mínima Histórica','Media Histórica','Máxima Histórica']:[]),
                      ...seriesKeys
                    ]} seriesColors={allSeriesColors}/>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        <footer className="mt-8 text-center" style={{borderTop:'1px solid rgba(148,163,184,0.06)',paddingTop:'1.5rem'}}>
          <p className="text-xs text-slate-700">Cuadro de Mando Hidrológico · Embalses de Santiago de Cuba · {new Date().getFullYear()}</p>
        </footer>
      </div>

      {/* Barra inferior móvil */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden nav-bar">
        <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(6,182,212,0.4),rgba(168,85,247,0.4),transparent)'}}/>
        <div className="flex items-stretch">
          {[
            {id:'charts',label:'Gráficas', icon:<IconChartLine/>, action:()=>setActiveTab('charts')},
            {id:'table', label:'Tabla',    icon:<IconTable/>,     action:()=>setActiveTab('table')},
            {id:'export',label:'Exportar', icon:<IconDownload/>,  action:handleExportCSV},
          ].map(item=>{
            const active=item.id===activeTab;
            return (
              <button key={item.id} onClick={item.action}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-semibold transition-all active:scale-90"
                style={{color:active?'#22d3ee':'#475569',position:'relative'}}>
                {active&&<div style={{position:'absolute',top:0,left:'20%',right:'20%',height:'2px',background:'linear-gradient(90deg,transparent,#22d3ee,transparent)',borderRadius:'0 0 4px 4px'}}/>}
                {item.icon}<span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default App;
