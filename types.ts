
export interface YearlyData {
  year: number;
  values: (number | null)[];
}

export interface ChartDataPoint {
  month: string;
  [key: string]: number | string | null;
}
