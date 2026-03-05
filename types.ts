
export interface YearlyData {
  year: number;
  values: (number | null)[];
}

export interface ChartDataPoint {
  month: string;
  [key: string]: number | string | null;
}

export type ComparisonMode = 'anio-historico' | 'ultimos-n' | 'anio-anio' | 'decada' | 'periodo';

export interface ComparisonParams {
  year: number;       // anio-historico
  nYears: number;     // ultimos-n
  yearA: number;      // anio-anio (año base)
  yearB: number;      // anio-anio (año comparado)
  decade: number;     // decada (ej: 1990)
  fromYear: number;   // periodo
  toYear: number;     // periodo
}
