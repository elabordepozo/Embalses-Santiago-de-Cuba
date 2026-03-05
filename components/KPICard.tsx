import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  variation?: number;
  progress?: number;
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, unit, icon, gradientFrom, gradientTo, borderColor, variation, progress, subtitle
}) => {
  const isPositive = variation !== undefined && variation > 0;
  const isNegative = variation !== undefined && variation < 0;
  const variationColor = isPositive ? '#34d399' : isNegative ? '#f87171' : '#94a3b8';
  const variationSign = isPositive ? '+' : '';

  const progressColor = progress !== undefined
    ? progress >= 75 ? '#22d3ee' : progress >= 40 ? '#f59e0b' : '#ef4444'
    : '#22d3ee';

  return (
    <div
      className="kpi-card relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-default select-none"
      style={{
        background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        border: `1px solid ${borderColor}40`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: borderColor, opacity: 0.12, filter: 'blur(28px)' }}
      />
      {/* Borde superior con acento de color */}
      <div
        className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${borderColor}80, transparent)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 sm:p-2.5 rounded-xl"
          style={{ background: `${borderColor}18`, color: borderColor, border: `1px solid ${borderColor}30` }}
        >
          {icon}
        </div>
        {variation !== undefined && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background: `${variationColor}15`, color: variationColor, border: `1px solid ${variationColor}30` }}
          >
            {variationSign}{variation.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-1">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">{title}</p>
        <p className="font-black text-white leading-none flex items-baseline flex-wrap gap-x-1" style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.9rem)' }}>
          {variation !== undefined
            ? <span style={{ color: variationColor }}>{variationSign}{value}</span>
            : value}
          <span className="text-xs sm:text-sm font-semibold text-slate-400 ml-1.5">{unit}</span>
        </p>
        {subtitle && <p className="text-slate-500 text-xs mt-1.5">{subtitle}</p>}
      </div>

      {progress !== undefined && (
        <div className="mt-3 sm:mt-4">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, ${progressColor}99, ${progressColor})`,
                boxShadow: `0 0 10px ${progressColor}66`,
              }}
            />
          </div>
          <p className="text-right text-xs font-bold mt-1" style={{ color: progressColor }}>
            {progress.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default KPICard;
