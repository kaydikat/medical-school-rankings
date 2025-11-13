// src/lib/calculateRanks.ts
import type { School } from '@/types/school';

const INVERSE_SCORE_COLS = ['Average Graduate Indebtedness', 'Tuition and Fees', 'Total Cost of Attendance'];

const RANKING_COLS = [
  'Average GPA',
  'Average MCAT',
  'Average Graduate Indebtedness',
  'Total Cost of Attendance',
  'Tuition and Fees',
  'NIH Research Funding',
  'NIH Research Funding per Faculty',
  '#n_ranked_specialties',
  '#n_top10_specialties',
  'URM%'
] as const;

export type Weights = Record<typeof RANKING_COLS[number], number>;

export const DEFAULT_WEIGHTS: Weights = {
  'Average GPA': 10,
  'Average MCAT': 10,
  'Average Graduate Indebtedness': 10,
  'Total Cost of Attendance': 10,
  'Tuition and Fees': 10,
  'NIH Research Funding': 10,
  'NIH Research Funding per Faculty': 10,
  '#n_ranked_specialties': 10,
  '#n_top10_specialties': 10,
  'URM%': 10
};

export function calculateRanks(data: School[], weights: Weights): School[] {
  const proc = JSON.parse(JSON.stringify(data));

  // Fill missing values with median (same as before)
  RANKING_COLS.forEach(col => {
    const vals = proc.map((d: any) => d[col]).filter((v: any) => v != null && !isNaN(v));
    if (!vals.length) return;
    vals.sort((a: number, b: number) => a - b);
    const median = vals.length % 2
      ? vals[Math.floor(vals.length / 2)]
      : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
    proc.forEach((d: any) => {
      if (d[col] == null || isNaN(d[col])) d[col] = median;
    });
  });

  // Normalize to 0–1
  const scaled: Record<string, number[]> = {};
  RANKING_COLS.forEach(col => {
    const vals = proc.map((d: any) => d[col]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    scaled[col] = vals.map((v: number) => max === min ? 0 : (v - min) / (max - min));
  });

  // Invert "bad" columns (higher value = worse)
  INVERSE_SCORE_COLS.forEach(col => {
    if (scaled[col]) {
      scaled[col] = scaled[col].map(v => 1 - v);
    }
  });

  // Composite score (same)
  proc.forEach((d: any, i: number) => {
    d.CompositeScore = RANKING_COLS.reduce((sum, c) =>
      sum + scaled[c][i] * (weights[c] / 100), 0);
  });

  // Sort and rank (same)
  proc.sort((a: any, b: any) => b.CompositeScore - a.CompositeScore);
  proc.forEach((d: any, i: number) => {
    d.Rank = i > 0 && proc[i].CompositeScore === proc[i - 1].CompositeScore
      ? proc[i - 1].Rank : i + 1;
  });

  return proc;
}