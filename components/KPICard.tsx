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
  progress?: number; // 0-100
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, unit, icon, gradientFrom, gradientTo, borderColor, variation, progress, subtitle
}) => {
  const variationColor = variation !== undefined
    ? variation > 0 ? 'text-emerald-400' : variation < 0 ? 'text-red-400' : 'text-slate-400'
    : '';
  const variationSign = variation !== undefined && variation > 0 ? '+' : '';

  const progressColor = progress !== undefined
    ? progress >= 75 ? '#22d3ee'
    : progress >= 40 ? '#f59e0b'
    : '#ef4444'
    : '#22d3ee';

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 shadow-xl transition-transform duration-200 hover:-translate-y-1"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        borderColor: borderColor,
      }}
    >
      {/* Glow orb decoration */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: borderColor }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.1)', color: borderColor }}
        >
          {icon}
        </div>
        {variation !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${variationColor} bg-slate-900/40`}>
            {variationSign}{variation.toFixed(2)} hm³
          </span>
        )}
      </div>

      <div className="mt-1">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-white mt-1 leading-none">
          {variation !== undefined ? (
            <span className={variationColor}>{variationSign}{value}</span>
          ) : value}
          <span className="text-sm font-semibold text-slate-400 ml-1.5">{unit}</span>
        </p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400">Nivel actual</span>
            <span className="text-xs font-bold" style={{ color: progressColor }}>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-900/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, ${progressColor}aa, ${progressColor})`,
                boxShadow: `0 0 8px ${progressColor}88`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
