import React from 'react';

const MapPlaceholder: React.FC = () => {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)',
        borderColor: 'rgba(148,163,184,0.1)',
      }}
    >
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <h2 className="text-base font-bold text-slate-100">Ubicación Geográfica</h2>
        </div>
        <p className="text-xs text-slate-500">Provincia de Santiago de Cuba</p>
      </div>

      <div className="relative mx-4 mb-4 rounded-xl overflow-hidden" style={{ height: '220px' }}>
        <svg width="100%" height="100%" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
          {/* Background */}
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <radialGradient id="waterGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0e7490" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#164e63" stopOpacity="0.4" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <rect width="320" height="220" fill="url(#bgGrad)" />

          {/* Grid lines */}
          {[40,80,120,160,200].map(y => (
            <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(148,163,184,0.04)" strokeWidth="1" />
          ))}
          {[64,128,192,256].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="rgba(148,163,184,0.04)" strokeWidth="1" />
          ))}

          {/* Sea/coast background */}
          <path d="M0 110 C 40 100, 80 130, 120 115 S 200 95, 240 110 S 300 130, 320 120 L 320 220 L 0 220 Z"
            fill="rgba(14,116,144,0.15)" />

          {/* Cuba island shape (simplified Santiago de Cuba province) */}
          <path d="M 20 95 C 35 80, 60 75, 90 78 C 115 72, 140 68, 170 72 C 200 70, 230 80, 260 85
                   C 285 90, 305 95, 315 100 C 310 108, 295 112, 275 110 C 250 108, 225 115, 200 112
                   C 175 118, 150 125, 130 122 C 110 128, 85 132, 60 125 C 40 120, 22 112, 20 95 Z"
            fill="#334155" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />

          {/* Mountain range hint */}
          <path d="M 80 105 L 100 88 L 115 100 L 135 82 L 155 98 L 170 87 L 190 100 L 200 95"
            fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Rivers */}
          <path d="M 140 82 C 145 90, 150 100, 155 115" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 170 87 C 175 95, 178 105, 180 118" fill="none" stroke="rgba(34,211,238,0.25)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Embalse 1 - Charco Mono (approx location) */}
          <g filter="url(#glow)">
            <circle cx="145" cy="92" r="9" fill="rgba(34,211,238,0.15)" />
            <circle cx="145" cy="92" r="5" fill="rgba(34,211,238,0.3)" />
            <circle cx="145" cy="92" r="2.5" fill="#22d3ee" />
            <circle cx="145" cy="92" r="9" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.5">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
          <text x="155" y="88" fontFamily="sans-serif" fontSize="8" fill="#22d3ee" fontWeight="bold">Embalse 1</text>

          {/* Embalse 2 - El Corojo (approx location) */}
          <g filter="url(#glow)">
            <circle cx="185" cy="96" r="9" fill="rgba(168,85,247,0.15)" />
            <circle cx="185" cy="96" r="5" fill="rgba(168,85,247,0.3)" />
            <circle cx="185" cy="96" r="2.5" fill="#a855f7" />
            <circle cx="185" cy="96" r="9" fill="none" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.5">
              <animate attributeName="r" values="6;12;6" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </g>
          <text x="195" y="92" fontFamily="sans-serif" fontSize="8" fill="#a855f7" fontWeight="bold">Embalse 2</text>

          {/* Santiago de Cuba city marker */}
          <g filter="url(#glow)">
            <circle cx="230" cy="108" r="4" fill="rgba(251,191,36,0.4)" />
            <circle cx="230" cy="108" r="2" fill="#fbbf24" />
          </g>
          <text x="236" y="112" fontFamily="sans-serif" fontSize="7" fill="#fbbf24">Stgo. de Cuba</text>

          {/* Compass */}
          <g transform="translate(285, 30)">
            <circle cx="0" cy="0" r="14" fill="rgba(15,23,42,0.8)" stroke="rgba(148,163,184,0.2)" strokeWidth="1" />
            <text x="0" y="-5" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill="#94a3b8">N</text>
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
            <polygon points="0,-9 -2.5,-3 2.5,-3" fill="#22d3ee" />
            <polygon points="0,9 -2.5,3 2.5,3" fill="#475569" />
          </g>

          {/* Scale bar */}
          <g transform="translate(15, 200)">
            <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
            <line x1="40" y1="-3" x2="40" y2="3" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
            <text x="20" y="-5" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill="#64748b">~20 km</text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-5 pb-5 flex gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs text-slate-400">Embalse 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-xs text-slate-400">Embalse 2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-xs text-slate-400">Ciudad</span>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
