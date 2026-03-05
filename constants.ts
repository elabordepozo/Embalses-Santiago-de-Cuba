export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// ─── Para añadir un nuevo embalse: ───────────────────────────────────────────
// 1. Agrega el nombre aquí en SOURCES (en el orden que quieras que aparezca)
// 2. Agrega la ruta del CSV en CSV_FILES con la misma clave
// 3. Copia el archivo CSV a public/data/
// La web detectará automáticamente el nuevo embalse. ¡Eso es todo!
// ─────────────────────────────────────────────────────────────────────────────

export const SOURCES = [
  'Protesta de Baraguá',
  'Chalons',
  'Joturo',
  'La Majagua',
  'Mícara',
  'Carlos Manuel de Céspedes',
  'Gilbert',
  'Gota Blanca',
  'Charco Mono',
  'Hatillo',
  'Parada',
  'La Campana',
];

const base = import.meta.env.BASE_URL;

export const CSV_FILES: Record<string, string> = {
  'Protesta de Baraguá':       base + 'data/protesta_de_baragua.csv',
  'Chalons':                   base + 'data/chalons.csv',
  'Joturo':                    base + 'data/joturo.csv',
  'La Majagua':                base + 'data/la_majagua.csv',
  'Mícara':                    base + 'data/micara.csv',
  'Carlos Manuel de Céspedes': base + 'data/carlos_manuel_de_cespedes.csv',
  'Gilbert':                   base + 'data/gilbert.csv',
  'Gota Blanca':               base + 'data/gota_blanca.csv',
  'Charco Mono':               base + 'data/charco_mono.csv',
  'Hatillo':                   base + 'data/hatillo.csv',
  'Parada':                    base + 'data/parada.csv',
  'La Campana':                base + 'data/la_campana.csv',
};
