// src/lib/calculateRanks.ts
import type { School } from '@/types/school';
import { DEFAULT_WEIGHTS } from '@/lib/rankingConfig';

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

export function rescaleWeights(weights: Record<string, number>): Record<string, number> {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return weights;
  
  const newWeights: Record<string, number> = {};
  let currentTotal = 0;
  
  const keys = Object.keys(weights);
  keys.forEach(key => {
    const val = Math.round((weights[key] / total) * 100);
    newWeights[key] = val;
    currentTotal += val;
  });
  
  const diff = 100 - currentTotal;
  if (diff !== 0 && keys.length > 0) {
    const maxKey = keys.reduce((a, b) => newWeights[a] > newWeights[b] ? a : b);
    newWeights[maxKey] += diff;
  }
  
  return newWeights;
}

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