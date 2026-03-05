import React, { useState, useMemo } from 'react';

interface YearSelectorProps {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ years, selected, onSelect }) => {
  // Mostramos una "página" de 12 años (como un calendario mensual)
  const [page, setPage] = useState(() => {
    const idx = years.indexOf(selected);
    return Math.floor((idx >= 0 ? idx : years.length - 1) / 12);
  });

  const totalPages = Math.ceil(years.length / 12);
  const pageYears = useMemo(() => years.slice(page * 12, page * 12 + 12), [years, page]);

  const firstYear = pageYears[0];
  const lastYear  = pageYears[pageYears.length - 1];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(9,14,28,0.9)', border: '1px solid rgba(148,163,184,0.12)' }}
    >
      {/* ── Cabecera estilo calendario ── */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.08)', background: 'rgba(6,182,212,0.06)' }}
      >
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            background: page === 0 ? 'transparent' : 'rgba(6,182,212,0.12)',
            color: page === 0 ? '#334155' : '#22d3ee',
            border: `1px solid ${page === 0 ? 'transparent' : 'rgba(6,182,212,0.25)'}`,
            cursor: page === 0 ? 'not-allowed' : 'pointer',
          }}
          title="Años anteriores"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {/* Rango de años visible */}
        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Período</p>
          <p className="text-sm font-black text-cyan-400 leading-tight">{firstYear} – {lastYear}</p>
        </div>

        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            background: page === totalPages - 1 ? 'transparent' : 'rgba(6,182,212,0.12)',
            color: page === totalPages - 1 ? '#334155' : '#22d3ee',
            border: `1px solid ${page === totalPages - 1 ? 'transparent' : 'rgba(6,182,212,0.25)'}`,
            cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
          }}
          title="Años siguientes"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* ── Año seleccionado destacado ── */}
      <div
        className="px-4 py-2 flex items-center justify-center gap-2"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}
      >
        <span className="text-xs text-slate-500">Año seleccionado:</span>
        <span
          className="text-base font-black px-3 py-0.5 rounded-lg"
          style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' }}
        >
          {selected}
        </span>
      </div>

      {/* ── Cuadrícula de años (estilo calendario) ── */}
      <div className="p-3 grid grid-cols-4 gap-1.5">
        {/* Días de la semana ficticios → aquí usamos cabeceras de columna */}
        {['', '', '', ''].map((_, i) => (
          <div key={i} />
        ))}
        {pageYears.map(year => {
          const isSelected = year === selected;
          const isToday    = year === new Date().getFullYear();
          return (
            <button
              key={year}
              onClick={() => onSelect(year)}
              className="relative py-2 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95"
              style={
                isSelected
                  ? {
                      background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
                      color: '#fff',
                      boxShadow: '0 0 14px rgba(6,182,212,0.5)',
                    }
                  : isToday
                  ? {
                      background: 'rgba(6,182,212,0.08)',
                      color: '#22d3ee',
                      border: '1px solid rgba(6,182,212,0.35)',
                    }
                  : {
                      background: 'rgba(30,41,59,0.5)',
                      color: '#64748b',
                    }
              }
            >
              {/* Punto "hoy" */}
              {isToday && !isSelected && (
                <span
                  className="absolute top-1 right-1 w-1 h-1 rounded-full"
                  style={{ background: '#22d3ee' }}
                />
              )}
              {year}
            </button>
          );
        })}
      </div>

      {/* ── Indicador de página ── */}
      <div className="pb-3 flex justify-center gap-1.5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className="rounded-full transition-all duration-200"
            style={{
              width: i === page ? '20px' : '6px',
              height: '6px',
              background: i === page ? '#22d3ee' : 'rgba(51,65,85,0.8)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
