import cachedAgg from '@/data/cached_aggregates.json';

export const CATEGORY_CONFIG = [
  {
    id: 'Academics',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    factors: [
      // REORDERED: MCAT first, then GPA
      { key: 'Average MCAT', label: 'MCAT', tooltip: 'Average MCAT score', type: 'direct' },
      { key: 'Average GPA', label: 'GPA', tooltip: 'Average Undergraduate GPA', type: 'direct' }
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
    id: 'Clinical Excellence', // RENAMED from 'Clinical Quality'
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
  ...cachedAgg.weights,
  'Class Size': 0
};

export const WEIGHTS_SHORT_MAP: Record<string, string> = {
  'Average MCAT': 'mcat',
  'Average GPA': 'gpa',
  'NIH Research Funding': 'nih',
  'NIH Research Funding per Faculty': 'nihf',
  'Average Graduate Indebtedness': 'debt',
  'Total Cost of Attendance': 'tca',
  'Tuition and Fees': 'tf',
  '#n_ranked_specialties': 'nrs',
  '#n_top10_specialties': 'nts',
  'URM%': 'urm',
  'Class Size': 'cs'
};

const REVERSE_SHORT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(WEIGHTS_SHORT_MAP).map(([k, v]) => [v, k])
);

export function encodeWeights(weights: Record<string, number>): string {
  const shortWeights: Record<string, number> = {};
  Object.entries(weights).forEach(([k, v]) => {
    if (v !== 0) {
      const shortKey = WEIGHTS_SHORT_MAP[k] || k;
      shortWeights[shortKey] = v;
    }
  });
  // Use a simple base64-ish or just URL search params style
  return btoa(JSON.stringify(shortWeights)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeWeights(encoded: string): Record<string, number> {
  try {
    // Add padding back
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const shortWeights = JSON.parse(atob(base64));
    const weights: Record<string, number> = { ...DEFAULT_WEIGHTS };
    // Zero out default weights if we have a custom scheme
    Object.keys(weights).forEach(k => weights[k] = 0);
    
    Object.entries(shortWeights).forEach(([k, v]) => {
      const longKey = REVERSE_SHORT_MAP[k as string] || k;
      if (typeof v === 'number') {
        weights[longKey] = v;
      }
    });
    return weights;
  } catch (e) {
    console.error("Failed to decode weights", e);
    return DEFAULT_WEIGHTS;
  }
}