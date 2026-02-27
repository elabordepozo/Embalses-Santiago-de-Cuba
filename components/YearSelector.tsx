import React from 'react';

interface YearSelectorProps {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ years, selected, onSelect }) => {
  return (
    <div
      className="max-h-52 overflow-y-auto p-2 rounded-xl"
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(148,163,184,0.1)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#334155 transparent',
      }}
    >
      <div className="grid grid-cols-4 gap-1.5">
        {years.map(year => (
          <button
            key={year}
            onClick={() => onSelect(year)}
            className="px-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-150"
            style={selected === year ? {
              background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
              color: '#fff',
              boxShadow: '0 0 12px rgba(6,182,212,0.4)',
            } : {
              background: 'rgba(51,65,85,0.5)',
              color: '#94a3b8',
            }}
            onMouseEnter={e => {
              if (selected !== year) (e.target as HTMLButtonElement).style.background = 'rgba(6,182,212,0.2)';
            }}
            onMouseLeave={e => {
              if (selected !== year) (e.target as HTMLButtonElement).style.background = 'rgba(51,65,85,0.5)';
            }}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;
