export interface School {
  AAMC_Institution: string;
  canonical_name: string;
  'Degree Type': string;
  'Average GPA': number;
  'Average MCAT': number;
  'Average Graduate Indebtedness': number;
  'Tuition and Fees': number;
  'Total Cost of Attendance': number;
  '% Receiving Aid': string; // e.g., "100%"
  'NIH Research Funding': number;
  'NIH Research Funding per Faculty': number;
  'Total Faculty': number;
  '#n_ranked_specialties': number;
  '#n_top10_specialties': number;
  '#n_top1_specialties': number;
  'URM%': number;
  Applications: number;
  'Class Size': number;
  'Matriculation Rate': number;
  // Add any individual specialty columns if needed later, e.g., Cancer: number;
  Rank?: number;
  CompositeScore?: number;
}