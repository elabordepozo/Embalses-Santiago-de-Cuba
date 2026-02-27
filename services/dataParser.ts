
import type { YearlyData } from '../types';

export const parseCSV = (csvString: string): YearlyData[] => {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const data: YearlyData[] = [];
  // Start from 1 to skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length < 2) continue;

    const year = parseInt(values[0], 10);
    if (isNaN(year)) continue;

    const monthlyValues = values.slice(1).map(val => {
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    });

    data.push({ year, values: monthlyValues });
  }
  return data;
};
