export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const SOURCES = ['Embalse 1', 'Embalse 2'];

// BASE_URL es '/' en desarrollo y '/Embalses-Santiago-de-Cuba/' en produccion
const base = import.meta.env.BASE_URL;

export const CSV_FILES: Record<string, string> = {
  [SOURCES[0]]: base + 'data/embalse1.csv',
  [SOURCES[1]]: base + 'data/embalse2.csv',
};
