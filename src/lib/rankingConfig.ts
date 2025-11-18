// src/lib/rankingConfig.ts

export const CATEGORY_CONFIG = [
  {
    id: 'Academics',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    factors: [
      { key: 'Average GPA', label: 'GPA', tooltip: 'Average Undergraduate GPA', type: 'direct' },
      { key: 'Average MCAT', label: 'MCAT', tooltip: 'Average MCAT score', type: 'direct' }
    ]
  },
  {
    id: 'Research',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    factors: [
      { key: 'NIH Research Funding', label: 'Total NIH Funding', tooltip: 'Total Institutional NIH Funding', type: 'direct' },
      { key: 'NIH Research Funding per Faculty', label: 'NIH / Faculty', tooltip: 'NIH Funding per Faculty Member', type: 'direct' }
    ]
  },
  {
    id: 'Finances',
    color: 'bg-green-50 text-green-800 border-green-200',
    factors: [
      { key: 'Average Graduate Indebtedness', label: 'Avg Debt', tooltip: 'Average Debt of Graduates', type: 'inverse' },
      { key: 'Total Cost of Attendance', label: 'Total Cost', tooltip: 'Annual Cost of Attendance', type: 'inverse' },
      { key: 'Tuition and Fees', label: 'Tuition + Fees', tooltip: 'Tuition and Fees', type: 'inverse' }
    ]
  },
  {
    id: 'Clinical Quality',
    color: 'bg-orange-50 text-orange-800 border-orange-200',
    factors: [
      { key: '#n_ranked_specialties', label: 'Ranked Specialties', tooltip: 'Nationally Ranked Specialties by US News & World Report', type: 'direct' },
      { key: '#n_top10_specialties', label: 'Top 10 Specialties', tooltip: 'Top 10 Ranked Specialties by US News & World Report', type: 'direct' }
    ]
  },
  {
    id: 'Student Body',
    color: 'bg-pink-50 text-pink-800 border-pink-200',
    factors: [
      { key: 'URM%', label: '% URM', tooltip: 'Underrepresented in Medicine % (Non white/asian)', type: 'direct' },
      { key: 'Class Size', label: 'Class Size', tooltip: 'Number of Students', type: 'display_only' }
    ]
  }
];

export const DEFAULT_WEIGHTS: Record<string, number> = {
  'Average GPA': 20,
  'Average MCAT': 20,
  'NIH Research Funding': 15,
  'NIH Research Funding per Faculty': 10,
  'Average Graduate Indebtedness': 10,
  'Total Cost of Attendance': 10,
  'Tuition and Fees': 5,
  '#n_ranked_specialties': 5,
  '#n_top10_specialties': 5,
  'URM%': 0,
  'Class Size': 0
};