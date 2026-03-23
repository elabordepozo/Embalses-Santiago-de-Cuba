import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Datos geográficos de los embalses ───────────────────────────────────────
export interface ReservoirInfo {
  name:    string;
  lat:     number;
  lng:     number;
  municipio: string;
  capacidad: number;   // hm³
  foto?:   string;     // ruta relativa a /public/embalses/
}

export const RESERVOIR_GEO: ReservoirInfo[] = [
  { name: 'Protesta de Baraguá', lat: 20.1843, lng: -75.9721, municipio: 'Palma Soriano',       capacidad: 280.0 },
  { name: 'Chalons',             lat: 20.0530, lng: -75.6710, municipio: 'Santiago de Cuba',    capacidad:  12.5 },
  { name: 'Joturo',             lat: 20.1612, lng: -76.0354, municipio: 'Contramaestre',        capacidad:  30.2 },
  { name: 'La Majagua',         lat: 20.1124, lng: -76.1298, municipio: 'Contramaestre',        capacidad:  18.7 },
  { name: 'Mícara',             lat: 20.2018, lng: -76.2256, municipio: 'Palma Soriano',        capacidad:  95.3 },
  { name: 'Carlos Manuel de Céspedes', lat: 20.2289, lng: -75.8934, municipio: 'Palma Soriano', capacidad:  47.6 },
  { name: 'Gilbert',            lat: 20.3102, lng: -75.8021, municipio: 'San Luis',             capacidad:  22.1 },
  { name: 'Gota Blanca',        lat: 20.1389, lng: -75.5712, municipio: 'El Cobre',             capacidad:   8.9 },
  { name: 'Charco Mono',        lat: 20.0934, lng: -75.5089, municipio: 'El Cobre',             capacidad:  14.3 },
  { name: 'Hatillo',            lat: 19.9812, lng: -75.6834, municipio: 'Santiago de Cuba',     capacidad: 313.0 },
  { name: 'Parada',             lat: 20.2512, lng: -76.1623, municipio: 'Contramaestre',        capacidad:  35.8 },
  { name: 'La Campana',         lat: 20.0712, lng: -76.0056, municipio: 'Santiago de Cuba',     capacidad:  11.4 },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  baseUrl:   string;
  onSelect?: (name: string) => void;   // callback al pulsar un embalse
}

// ─── SVG del marcador personalizado ──────────────────────────────────────────
const makeIcon = (color: string) => L.divIcon({
  html: `
    <div style="
      width:32px; height:32px;
      background:${color};
      border:2px solid rgba(255,255,255,0.85);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 14px rgba(0,0,0,0.5);
    "></div>`,
  className: '',
  iconSize:  [32, 32],
  iconAnchor:[16, 32],
  popupAnchor:[0, -34],
});

const MARKER_COLOR = '#22d3ee';

// ─── Componente ───────────────────────────────────────────────────────────────
const ReservoirMap: React.FC<Props> = ({ baseUrl, onSelect }) => {
  const mapRef     = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Inicializar mapa
    const map = L.map(containerRef.current, {
      center: [20.14, -75.95],
      zoom:   10,
      zoomControl: false,
      attributionControl: true,
    });

    // Tile layer oscuro
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Control de zoom reposicionado
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marcadores
    RESERVOIR_GEO.forEach(r => {
      const icon = makeIcon(MARKER_COLOR);
      const marker = L.marker([r.lat, r.lng], { icon })
        .addTo(map);

      // Popup
      const fotoPath = r.foto ? `${baseUrl}embalses/${r.foto}` : null;
      const popupContent = `
        <div style="
          font-family: Inter, sans-serif;
          min-width: 200px;
          color: #e2e8f0;
        ">
          ${fotoPath ? `
            <div style="
              width:100%; height:110px; border-radius:8px; overflow:hidden;
              margin-bottom:10px; background:#0f172a;
            ">
              <img src="${fotoPath}" alt="${r.name}"
                style="width:100%;height:100%;object-fit:cover;"
                onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#334155;font-size:11px;\\'>Sin foto disponible</div>'"
              />
            </div>` : `
            <div style="
              width:100%; height:80px; border-radius:8px; overflow:hidden;
              margin-bottom:10px; background:#0f172a;
              display:flex; align-items:center; justify-content:center;
            ">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5">
                <path d="M2 20h20M6 20V10l6-6 6 6v10M10 20v-5h4v5"/>
              </svg>
            </div>`}
          <div style="font-size:13px;font-weight:800;color:#22d3ee;margin-bottom:4px;">${r.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">📍 ${r.municipio}</div>
          <div style="
            display:flex; align-items:center; justify-content:space-between;
            background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);
            border-radius:6px; padding:5px 8px; margin-bottom:8px;
          ">
            <span style="font-size:10px;color:#64748b;">Capacidad</span>
            <span style="font-size:12px;font-weight:700;color:#22d3ee;">${r.capacidad.toFixed(1)} hm³</span>
          </div>
          <button
            onclick="window.__mapSelectReservoir && window.__mapSelectReservoir('${r.name}')"
            style="
              width:100%; padding:7px; border-radius:8px;
              background:linear-gradient(135deg,#06b6d4,#0e7490);
              color:#fff; font-size:11px; font-weight:700; border:none;
              cursor:pointer; letter-spacing:0.03em;
            "
          >Ver datos del embalse →</button>
        </div>`;

      marker.bindPopup(popupContent, {
        maxWidth: 230,
        className: 'reservoir-popup',
      });

      marker.on('click', () => setSelected(r.name));
    });

    mapRef.current = map;

    // Limpiar
    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exponer callback global para el botón dentro del popup
  useEffect(() => {
    (window as any).__mapSelectReservoir = (name: string) => {
      onSelect?.(name);
    };
    return () => {
      delete (window as any).__mapSelectReservoir;
    };
  }, [onSelect]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '100%' }}>
      {/* Hoja de estilo del popup */}
      <style>{`
        .reservoir-popup .leaflet-popup-content-wrapper {
          background: rgba(7,12,26,0.97) !important;
          border: 1px solid rgba(6,182,212,0.25) !important;
          border-radius: 14px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
        }
        .reservoir-popup .leaflet-popup-content {
          margin: 14px !important;
        }
        .reservoir-popup .leaflet-popup-tip {
          background: rgba(7,12,26,0.97) !important;
        }
        .reservoir-popup .leaflet-popup-close-button {
          color: #475569 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 8px !important;
        }
        .leaflet-attribution-flag { display:none !important; }
        .leaflet-control-attribution {
          background: rgba(7,12,26,0.7) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #64748b !important; }
        .leaflet-control-zoom a {
          background: rgba(7,12,26,0.9) !important;
          color: #94a3b8 !important;
          border-color: rgba(148,163,184,0.15) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(6,182,212,0.2) !important;
          color: #22d3ee !important;
        }
      `}</style>

      <div ref={containerRef} style={{ width:'100%', height:'100%', borderRadius:'inherit' }} />
    </div>
  );
};

export default ReservoirMap;
