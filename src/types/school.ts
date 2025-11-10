// src/types/school.ts
export interface School {
  'MSAR Name': string;
  'Median MCAT': number;
  'Median GPA': number;
  'Research Funding Per Faculty': number;
  'Count Nationally Ranked Specialties': number;
  'Count T10 Ranked Specialties': number;
  'Avg Indebtedness ($)': number;
  'Full NIH Funding 2024': number;
  'Yield %': number | null;
  '% Receiving Aid': number;
  'URM %': number;
  'Low SES %': number;
  Rank?: number;
  CompositeScore?: number;
}