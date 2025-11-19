'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import schoolsData from '@/data/final_medical_school_data.json';
import { CATEGORY_CONFIG, DEFAULT_WEIGHTS } from '@/lib/rankingConfig';
import { useAggregates } from '@/lib/useAggregates';
import RankingsTable from '@/components/RankingsTable';
import { GraduationCap, SlidersIcon, Search } from '@/components/Icons';

export default function HomePage() {
  const { aggregates, loading } = useAggregates();
  const [rankedSchools, setRankedSchools] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Filters
  const [isInState, setIsInState] = useState(false);
  const [selectedRole, setSelectedRole] = useState('overall');

  // 1. Update ranking when aggregates, role, or in-state toggle changes
  useEffect(() => {
    if (aggregates.length === 0) return;
    
    // Determine weights based on selected Role
    const activeAgg = aggregates.find(a => a.role === selectedRole) || aggregates.find(a => a.role === 'overall');
    // Cast to Record<string, number> to satisfy TypeScript
    const weights = (activeAgg ? activeAgg.weights : DEFAULT_WEIGHTS) as Record<string, number>;
    
    // --- MAPPING LOGIC FOR IN-STATE VS OUT-OF-STATE ---
    const mappedData = schoolsData.map((d: any) => {
        const row = { ...d };
        if (isInState) {
            if (row['instate_Total Cost of Attendance'] !== undefined) {
                row['Total Cost of Attendance'] = row['instate_Total Cost of Attendance'];
            }
            if (row['instate_Tuition and Fees'] !== undefined) {
                row['Tuition and Fees'] = row['instate_Tuition and Fees'];
            }
        }
        return row;
    });

    const flattenedFactors = CATEGORY_CONFIG.flatMap(g => g.factors).filter(f => f.type !== 'display_only');
    
    const stats: Record<string, { min: number, max: number }> = {};
    flattenedFactors.forEach(factor => {
        const values = mappedData.map((d: any) => d[factor.key]).filter((v: any) => v !== null && !isNaN(v));
        if (values.length) {
            stats[factor.key] = { min: Math.min(...values), max: Math.max(...values) };
        } else {
            stats[factor.key] = { min: 0, max: 1 };
        }
    });

    const scored = mappedData.map((school: any) => {
        let totalScore = 0;
        flattenedFactors.forEach(factor => {
            const weight = weights[factor.key] || 0;
            if (weight === 0) return;

            let rawVal = school[factor.key];
            const { min, max } = stats[factor.key];

            if (rawVal === null || rawVal === undefined) {
                rawVal = factor.type === 'inverse' ? max : min;
            }

            let normalized = 0;
            if (max > min) {
                normalized = (rawVal - min) / (max - min);
            }
            if (factor.type === 'inverse') {
                normalized = 1 - normalized;
            }
            totalScore += normalized * weight;
        });
        return { ...school, rawScore: totalScore };
    });

    scored.sort((a: any, b: any) => {
        const diff = b.rawScore - a.rawScore;
        if (Math.abs(diff) < 0.00001) {
            return (a.AAMC_Institution || '').localeCompare(b.AAMC_Institution || '');
        }
        return diff;
    });

    scored.forEach((row: any, index: number) => {
        if (index > 0 && Math.abs(row.rawScore - scored[index-1].rawScore) < 0.00001) {
            row.CustomRank = scored[index-1].CustomRank;
        } else {
            row.CustomRank = index + 1;
        }
    });

    setRankedSchools(scored);
    
  }, [aggregates, isInState, selectedRole]);

  const filteredSchools = useMemo(() => {
      if (!searchTerm) return rankedSchools;
      const lowerTerm = searchTerm.toLowerCase();
      return rankedSchools.filter((school: any) => 
          (school["AAMC_Institution"] || '').toLowerCase().includes(lowerTerm) ||
          (school["canonical_name"] || '').toLowerCase().includes(lowerTerm)
      );
  }, [rankedSchools, searchTerm]);

  // Get current active weights for the table to display in the Peek panel
  const currentWeights = useMemo(() => {
    return aggregates.find(a => a.role === selectedRole)?.weights || {};
  }, [aggregates, selectedRole]);

  // MODIFIED: Now calculates count based on the currently selected role
  const submissionCount = aggregates.find(a => a.role === selectedRole)?.count || 0;
  
  return (
    <div className="min-h-screen pb-12 flex flex-col h-screen">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm flex-none">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    Med School Rankings
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="/" className="text-blue-600">Home</Link>
                    <Link href="/calculate?open=true" className="hover:text-blue-600 transition-colors">Customize</Link>
                    <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
                </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Link 
                href="/calculate?open=true"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform shadow-md 
                  bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 ring-2 ring-purple-500 ring-offset-2
                `}
              >
                <SlidersIcon className="w-4 h-4" />
                Customize Rankings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-4 mt-6 flex-1 min-h-0 flex flex-col w-full">
        <div className="flex items-center justify-between mb-4 flex-none">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Overall Crowdsourced Rankings</h2>
                <p className="text-sm text-slate-500">
                    Ranked by the aggregated priorities of contributors as of {new Date().getFullYear()}.
                </p>
            </div>
            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wide">
                {submissionCount} Submissions
            </div>
        </div>

        <div className="flex-1 min-h-0">
          {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Loading live data...</div>
          ) : (
              <RankingsTable 
                  data={filteredSchools} 
                  isInState={isInState} 
                  onToggleInState={setIsInState}
                  // NEW PROPS PASSED DOWN
                  availableRoles={aggregates}
                  selectedRole={selectedRole}
                  onRoleSelect={setSelectedRole}
                  currentWeights={currentWeights}
              />
          )}
        </div>
      </div>
    </div>
  );
}