// src/lib/calculateRanks.ts
import type { School } from '@/types/school'; // We'll define this next

const INVERSE_SCORE_COL = 'Avg Indebtedness ($)';

const RANKING_COLS = [
  'Median MCAT',
  'Median GPA',
  'Research Funding Per Faculty',
  'Count Nationally Ranked Specialties',
  'Count T10 Ranked Specialties',
  'Avg Indebtedness ($)',
  'Full NIH Funding 2024',
  'Yield %',
  '% Receiving Aid',
  'URM %',
  'Low SES %'
] as const;

export type Weights = Record<typeof RANKING_COLS[number], number>;

export const DEFAULT_WEIGHTS: Weights = {
  'Median MCAT': 15,
  'Median GPA': 15,
  'Research Funding Per Faculty': 20,
  'Count Nationally Ranked Specialties': 5,
  'Count T10 Ranked Specialties': 10,
  'Avg Indebtedness ($)': 5,
  'Full NIH Funding 2024': 10,
  'Yield %': 5,
  '% Receiving Aid': 5,
  'URM %': 5,
  'Low SES %': 5
};

export function calculateRanks(data: School[], weights: Weights): School[] {
  const proc = JSON.parse(JSON.stringify(data));

  // Fill missing values with median
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

  // Invert indebtedness
  if (scaled[INVERSE_SCORE_COL]) {
    scaled[INVERSE_SCORE_COL] = scaled[INVERSE_SCORE_COL].map(v => 1 - v);
  }

  // Composite score
  proc.forEach((d: any, i: number) => {
    d.CompositeScore = RANKING_COLS.reduce((sum, c) =>
      sum + scaled[c][i] * (weights[c] / 100), 0);
  });

  // Sort and rank
  proc.sort((a: any, b: any) => b.CompositeScore - a.CompositeScore);
  proc.forEach((d: any, i: number) => {
    d.Rank = i > 0 && proc[i].CompositeScore === proc[i - 1].CompositeScore
      ? proc[i - 1].Rank : i + 1;
  });

  return proc;
}