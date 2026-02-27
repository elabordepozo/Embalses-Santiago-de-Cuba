export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const SOURCES = ['Embalse 1', 'Embalse 2'];

// Rutas a los archivos CSV en /public/data/
export const CSV_FILES: Record<string, string> = {
  [SOURCES[0]]: '/data/embalse1.csv',
  [SOURCES[1]]: '/data/embalse2.csv',
};
