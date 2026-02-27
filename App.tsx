import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CSV_FILES, MONTHS, SOURCES } from './constants';
import { parseCSV } from './services/dataParser';
import type { YearlyData, ChartDataPoint } from './types';
import KPICard from './components/KPICard';
import HistoricalLineChart from './components/HistoricalLineChart';
import YearlyComparisonBarChart from './components/YearlyComparisonBarChart';
import {
  IconChartLine, IconTrendingUp, IconTrendingDown, IconStack2, IconDropletHalf2,
  IconDownload, IconWater, IconGauge, IconTable, IconFilter, IconRefresh, IconDam
} from './components/Icons';
import MapPlaceholder from './components/MapPlaceholder';
import YearSelector from './components/YearSelector';

// ─── Source colors ────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, string> = {
  [SOURCES[0]]: '#22d3ee',
  [SOURCES[1]]: '#a855f7',
};

// ─── DataTable component ───────────────────────────────────────────────────────
const DataTable: React.FC<{ data: ChartDataPoint[]; selectedYear: number }> = ({ data, selectedYear }) => {
  if (data.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148,163,184,0.1)' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: 'rgba(15,23,42,0.8)' }}>
            <th className="px-4 py-3 text-left text-slate-400 font-semibold uppercase tracking-wider">Mes</th>
            <th className="px-4 py-3 text-right text-red-400 font-semibold uppercase tracking-wider">Mín. Histórica</th>
            <th className="px-4 py-3 text-right text-amber-400 font-semibold uppercase tracking-wider">Media Histórica</th>
            <th className="px-4 py-3 text-right text-blue-400 font-semibold uppercase tracking-wider">Máx. Histórica</th>
            <th className="px-4 py-3 text-right text-cyan-400 font-semibold uppercase tracking-wider">{selectedYear}</th>
            <th className="px-4 py-3 text-right text-slate-400 font-semibold uppercase tracking-wider">vs Media</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const yearVal = row[selectedYear] as number | null;
            const media = row['Media Histórica'] as number;
            const diff = yearVal !== null && media ? yearVal - media : null;
            return (
              <tr
                key={row.month}
                style={{
                  background: i % 2 === 0 ? 'rgba(30,41,59,0.4)' : 'transparent',
                }}
              >
                <td className="px-4 py-2.5 text-slate-300 font-medium">{row.month}</td>
                <td className="px-4 py-2.5 text-right text-red-400">
                  {(row['Mínima Histórica'] as number)?.toFixed(1) ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-right text-amber-400">
                  {(row['Media Histórica'] as number)?.toFixed(1) ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-right text-blue-400">
                  {(row['Máxima Histórica'] as number)?.toFixed(1) ?? '—'}
                </td>
                <td className="px-4 py-2.5 text-right text-cyan-400 font-bold">
                  {yearVal !== null ? yearVal.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {diff !== null ? (
                    <span className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                    </span>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Radial gauge ─────────────────────────────────────────────────────────────
const RadialGauge: React.FC<{ percentage: number }> = ({ percentage }) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (clamped / 100) * circumference;

  const color = clamped >= 75 ? '#22d3ee' : clamped >= 40 ? '#f59e0b' : '#ef4444';
  const label = clamped >= 75 ? 'Normal' : clamped >= 40 ? 'Bajo' : 'Crítico';

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Track */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke="rgba(51,65,85,0.6)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(tick => {
          const angle = -180 + (tick / 100) * 180;
          const rad = (angle * Math.PI) / 180;
          const x1 = 70 + 54 * Math.cos(rad);
          const y1 = 70 + 54 * Math.sin(rad);
          const x2 = 70 + 46 * Math.cos(rad);
          const y2 = 70 + 46 * Math.sin(rad);
          return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148,163,184,0.3)" strokeWidth="1" />;
        })}
        <text x="70" y="62" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill={color}>
          {clamped.toFixed(0)}%
        </text>
        <text x="10" y="80" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#64748b">0%</text>
        <text x="130" y="80" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#64748b">100%</text>
      </svg>
      <span
        className="mt-1 text-xs font-bold px-3 py-1 rounded-full"
        style={{ background: `${color}22`, color }}
      >
        Estado: {label}
      </span>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [allData, setAllData] = useState<{ source: string; data: YearlyData[] }[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([...SOURCES]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts');

  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const entries = await Promise.all(
        SOURCES.map(async (source) => {
          const response = await fetch(CSV_FILES[source]);
          const text = await response.text();
          return { source, data: parseCSV(text) };
        })
      );
      setAllData(entries);

      const allYears = [...new Set(entries.flatMap(d => d.data.map(y => y.year)))].sort((a, b) => a - b);
      const validYears = allYears.filter(y => y >= 1978);
      setAvailableYears(validYears);

      if (validYears.length > 0) {
        setSelectedYear(validYears[validYears.length - 1]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 3600000);
    return () => clearInterval(interval);
  }, []);

  // ── Filter: combine only selected sources ──────────────────────────────────
  const filteredAndCombinedData = useMemo(() => {
    if (allData.length === 0 || selectedSources.length === 0) return [];

    const dataFromSelectedSources = allData.filter(d => selectedSources.includes(d.source));

    // Merge by year: sum values from selected sources
    const combinedDataMap = new Map<number, (number | null)[]>();

    dataFromSelectedSources.forEach(sourceObj => {
      // De-duplicate years within a source by taking the last occurrence
      const yearMap = new Map<number, (number | null)[]>();
      sourceObj.data.forEach(yearData => {
        yearMap.set(yearData.year, yearData.values);
      });

      yearMap.forEach((values, year) => {
        const existing = combinedDataMap.get(year);
        if (existing) {
          const merged = existing.map((val, i) => {
            const newVal = values[i] ?? null;
            if (val === null && newVal === null) return null;
            return (val ?? 0) + (newVal ?? 0);
          });
          combinedDataMap.set(year, merged);
        } else {
          combinedDataMap.set(year, [...values]);
        }
      });
    });

    return Array.from(combinedDataMap.entries())
      .map(([year, values]) => ({ year, values }))
      .sort((a, b) => a.year - b.year);
  }, [allData, selectedSources]);

  // ── KPI calculations ──────────────────────────────────────────────────────
  const { capacity, currentReserve, capacityPercentage, monthlyVariation } = useMemo(() => {
    if (filteredAndCombinedData.length === 0)
      return { capacity: 0, currentReserve: 0, capacityPercentage: 0, monthlyVariation: 0 };

    const allValues = filteredAndCombinedData.flatMap(d => d.values).filter(v => v !== null) as number[];
    const capacity = Math.max(...allValues, 0);

    const sortedData = [...filteredAndCombinedData].sort((a, b) => b.year - a.year);
    let latestYearData: YearlyData | null = null;
    for (const yd of sortedData) {
      if (yd.values.some(v => v !== null)) { latestYearData = yd; break; }
    }

    let currentReserve = 0;
    let prevMonthReserve = 0;
    if (latestYearData) {
      const valid = latestYearData.values.filter(v => v !== null) as number[];
      if (valid.length > 0) {
        currentReserve = valid[valid.length - 1];
        if (valid.length > 1) prevMonthReserve = valid[valid.length - 2];
      }
    }

    return {
      capacity,
      currentReserve,
      capacityPercentage: capacity > 0 ? (currentReserve / capacity) * 100 : 0,
      monthlyVariation: currentReserve - prevMonthReserve,
    };
  }, [filteredAndCombinedData]);

  // ── Historical stats ───────────────────────────────────────────────────────
  const historicalStats = useMemo(() => {
    const avg = Array(12).fill(0);
    const min = Array(12).fill(Infinity);
    const max = Array(12).fill(-Infinity);
    const counts = Array(12).fill(0);

    filteredAndCombinedData.forEach(yd => {
      yd.values.forEach((value, i) => {
        if (value !== null) {
          avg[i] += value;
          min[i] = Math.min(min[i], value);
          max[i] = Math.max(max[i], value);
          counts[i]++;
        }
      });
    });

    return {
      avg: avg.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0)),
      min: min.map(v => (v === Infinity ? 0 : v)),
      max: max.map(v => (v === -Infinity ? 0 : v)),
    };
  }, [filteredAndCombinedData]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    const yearData = filteredAndCombinedData.find(d => d.year === selectedYear);
    return MONTHS.map((month, i) => ({
      month,
      'Mínima Histórica': historicalStats.min[i],
      'Media Histórica': historicalStats.avg[i],
      'Máxima Histórica': historicalStats.max[i],
      [selectedYear]: yearData?.values[i] ?? null,
    }));
  }, [selectedYear, filteredAndCombinedData, historicalStats]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSourceChange = (source: string) => {
    setSelectedSources(prev => {
      if (prev.includes(source)) {
        // Prevent deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== source);
      }
      return [...prev, source];
    });
  };

  const handleExportCSV = useCallback(() => {
    if (chartData.length === 0) return;
    const headers = Object.keys(chartData[0]);
    const rows = [
      headers.join(','),
      ...chartData.map(row =>
        headers.map(h => {
          const v = row[h];
          return `"${v === null ? '' : String(v).replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `embalses_${selectedYear}.csv`;
    a.click();
  }, [chartData, selectedYear]);

  const handleExportPNG = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = svg.clientWidth || 800;
    canvas.height = svg.clientHeight || 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      a.click();
    };
    img.src = url;
  };

  // ── Per-source stats for sidebar ──────────────────────────────────────────
  const sourceStats = useMemo(() => {
    return SOURCES.map(source => {
      const sourceData = allData.find(d => d.source === source);
      if (!sourceData) return { source, current: 0, max: 0 };
      const yearMap = new Map<number, (number | null)[]>();
      sourceData.data.forEach(yd => yearMap.set(yd.year, yd.values));
      const allVals = [...yearMap.values()].flatMap(v => v).filter(v => v !== null) as number[];
      const max = Math.max(...allVals, 0);
      // latest non-null
      const sorted = [...yearMap.entries()].sort((a, b) => b[0] - a[0]);
      let current = 0;
      for (const [, vals] of sorted) {
        const valid = vals.filter(v => v !== null) as number[];
        if (valid.length) { current = valid[valid.length - 1]; break; }
      }
      return { source, current, max };
    });
  }, [allData]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #0c1a2e 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(6,182,212,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.04) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div
            className="rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(148,163,184,0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,116,144,0.2))', border: '1px solid rgba(6,182,212,0.3)' }}
              >
                <IconDam />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Cuadro de Mando
                  <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(90deg, #22d3ee, #a855f7)', backgroundClip: 'text' }}>
                    {' '}Hidrológico
                  </span>
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">Embalses · Provincia Santiago de Cuba</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <IconRefresh />
                <span>Actualizado: {lastUpdated.toLocaleTimeString('es-CU')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">En línea</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <aside className="lg:col-span-1 flex flex-col gap-5">
            <MapPlaceholder />

            {/* Gauge card */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div style={{ color: '#22d3ee' }}><IconGauge /></div>
                <h3 className="font-bold text-slate-200">Nivel de Capacidad</h3>
              </div>
              <p className="text-xs text-slate-500 mb-2">Porcentaje combinado actual</p>
              <RadialGauge percentage={capacityPercentage} />
            </div>

            {/* Per-source breakdown */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div style={{ color: '#a855f7' }}><IconWater /></div>
                <h3 className="font-bold text-slate-200">Por Embalse</h3>
              </div>
              <div className="flex flex-col gap-3">
                {sourceStats.map(s => {
                  const pct = s.max > 0 ? (s.current / s.max) * 100 : 0;
                  const color = SOURCE_COLORS[s.source] || '#22d3ee';
                  return (
                    <div key={s.source}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold" style={{ color }}>{s.source}</span>
                        <span className="text-slate-400">{s.current.toFixed(1)} / {s.max.toFixed(1)} hm³</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: `linear-gradient(90deg, ${color}88, ${color})`,
                            boxShadow: `0 0 6px ${color}66`,
                          }}
                        />
                      </div>
                      <p className="text-right text-xs mt-0.5" style={{ color }}>{pct.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div style={{ color: '#f59e0b' }}><IconFilter /></div>
                <h3 className="font-bold text-slate-200">Controles</h3>
              </div>

              {/* Source filter */}
              <div className="mb-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Filtrar por embalse</p>
                <div className="flex flex-col gap-2">
                  {SOURCES.map(source => {
                    const isActive = selectedSources.includes(source);
                    const color = SOURCE_COLORS[source];
                    return (
                      <button
                        key={source}
                        onClick={() => handleSourceChange(source)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                        style={{
                          background: isActive ? `${color}18` : 'rgba(30,41,59,0.5)',
                          border: `1px solid ${isActive ? `${color}60` : 'rgba(148,163,184,0.1)'}`,
                          color: isActive ? color : '#64748b',
                          boxShadow: isActive ? `0 0 12px ${color}22` : 'none',
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: isActive ? color : '#334155' }}
                        />
                        {source}
                        {isActive && (
                          <span
                            className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: `${color}30`, color }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year selector */}
              <div className="mb-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Año de comparación</p>
                <YearSelector years={availableYears} selected={selectedYear} onSelect={setSelectedYear} />
              </div>

              {/* Export */}
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,116,144,0.2))',
                  border: '1px solid rgba(6,182,212,0.3)',
                  color: '#22d3ee',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.35), rgba(14,116,144,0.35))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,116,144,0.2))')}
              >
                <IconDownload />
                Exportar datos (CSV)
              </button>
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────────── */}
          <main className="lg:col-span-2 flex flex-col gap-5">

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-4">
              <KPICard
                title="Capacidad Total"
                value={capacity.toFixed(1)}
                unit="hm³"
                icon={<IconStack2 />}
                gradientFrom="rgba(59,130,246,0.15)"
                gradientTo="rgba(30,64,175,0.15)"
                borderColor="#3b82f6"
                subtitle="Máximo histórico registrado"
              />
              <KPICard
                title="Reserva Actual"
                value={currentReserve.toFixed(1)}
                unit="hm³"
                icon={<IconDropletHalf2 />}
                gradientFrom="rgba(16,185,129,0.15)"
                gradientTo="rgba(5,150,105,0.15)"
                borderColor="#10b981"
                progress={capacityPercentage}
                subtitle="Último dato disponible"
              />
              <KPICard
                title="% Capacidad"
                value={capacityPercentage.toFixed(1)}
                unit="%"
                icon={<IconChartLine />}
                gradientFrom="rgba(245,158,11,0.15)"
                gradientTo="rgba(180,83,9,0.15)"
                borderColor="#f59e0b"
                progress={capacityPercentage}
                subtitle="Respecto al máximo"
              />
              <KPICard
                title="Variación Mensual"
                value={Math.abs(monthlyVariation).toFixed(1)}
                unit="hm³"
                icon={monthlyVariation >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                gradientFrom="rgba(168,85,247,0.15)"
                gradientTo="rgba(126,34,206,0.15)"
                borderColor="#a855f7"
                variation={monthlyVariation}
                subtitle="Respecto al mes anterior"
              />
            </div>

            {/* Chart / Table tabs */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Tab bar */}
              <div
                className="flex items-center gap-1 px-5 pt-4 pb-0"
                style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}
              >
                {[
                  { id: 'charts', label: 'Gráficas', icon: <IconChartLine /> },
                  { id: 'table', label: 'Tabla de datos', icon: <IconTable /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'charts' | 'table')}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-150 -mb-px"
                    style={activeTab === tab.id ? {
                      background: 'rgba(6,182,212,0.1)',
                      color: '#22d3ee',
                      borderBottom: '2px solid #22d3ee',
                    } : {
                      color: '#64748b',
                      borderBottom: '2px solid transparent',
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
                <div className="ml-auto text-xs text-slate-600 pb-2">
                  Año seleccionado: <span className="text-cyan-500 font-bold">{selectedYear}</span>
                  {selectedSources.length < SOURCES.length && (
                    <span className="ml-2 text-amber-500">· {selectedSources.join(' + ')}</span>
                  )}
                </div>
              </div>

              <div className="p-5">
                {activeTab === 'charts' ? (
                  <div className="flex flex-col gap-8">
                    {/* Line chart */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-slate-100">Variación Histórica vs. {selectedYear}</h2>
                          <p className="text-xs text-slate-500 mt-0.5">Comparativa mensual con estadísticas históricas</p>
                        </div>
                        <button
                          onClick={() => handleExportPNG(lineChartRef, `variacion_historica_${selectedYear}.png`)}
                          className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"
                          style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
                          title="Exportar PNG"
                        >
                          <IconDownload />
                        </button>
                      </div>
                      <div ref={lineChartRef}>
                        <HistoricalLineChart data={chartData} selectedYear={selectedYear} />
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }} />

                    {/* Bar chart */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-slate-100">Comparativa Mensual: {selectedYear} vs. Media</h2>
                          <p className="text-xs text-slate-500 mt-0.5">Diferencia respecto a la media histórica</p>
                        </div>
                        <button
                          onClick={() => handleExportPNG(barChartRef, `comparativa_mensual_${selectedYear}.png`)}
                          className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"
                          style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(148,163,184,0.1)' }}
                          title="Exportar PNG"
                        >
                          <IconDownload />
                        </button>
                      </div>
                      <div ref={barChartRef}>
                        <YearlyComparisonBarChart data={chartData} selectedYear={selectedYear} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-100">Tabla de Datos — {selectedYear}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Valores mensuales en hm³</p>
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-cyan-400 transition-colors"
                        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
                      >
                        <IconDownload />
                        CSV
                      </button>
                    </div>
                    <DataTable data={chartData} selectedYear={selectedYear} />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-700">
          Cuadro de Mando Hidrológico · Embalses de Santiago de Cuba · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default App;
