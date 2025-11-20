// src/app/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import schoolsData from '@/data/final_medical_school_data.json';
import { CATEGORY_CONFIG, DEFAULT_WEIGHTS } from '@/lib/rankingConfig';
import { useAggregates } from '@/lib/useAggregates';
import RankingsTable from '@/components/RankingsTable';
import { GraduationCap, SlidersIcon, Search, Menu, X } from '@/components/Icons';

// Helper: Calculate Scores based on weights
const calculateRanking = (weights: Record<string, number>) => {
    const flattenedFactors = CATEGORY_CONFIG.flatMap(g => g.factors).filter(f => f.type !== 'display_only');
    
    // 1. Stats for normalization
    const stats: Record<string, { min: number, max: number }> = {};
    flattenedFactors.forEach(factor => {
        const values = schoolsData.map((d: any) => d[factor.key]).filter((v: any) => v !== null && !isNaN(v));
        if (values.length) {
            stats[factor.key] = { min: Math.min(...values), max: Math.max(...values) };
        } else {
            stats[factor.key] = { min: 0, max: 1 };
        }
    });

    // 2. Score
    const scored = schoolsData.map((school: any) => {
        let totalScore = 0;
        flattenedFactors.forEach(factor => {
            const weight = weights[factor.key] || 0;
            const key = factor.key as keyof typeof weights;

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

    // 3. Sort
    scored.sort((a: any, b: any) => {
        const diff = b.rawScore - a.rawScore;
        if (Math.abs(diff) < 0.00001) {
            return (a.AAMC_Institution || '').localeCompare(b.AAMC_Institution || '');
        }
        return diff;
    });

    // 4. Rank
    scored.forEach((row: any, index: number) => {
        if (index > 0 && Math.abs(row.rawScore - scored[index-1].rawScore) < 0.00001) {
            row.CustomRank = scored[index-1].CustomRank;
        } else {
            row.CustomRank = index + 1;
        }
    });

    return scored;
};

export default function HomePage() {
  const { aggregates, loading } = useAggregates();
  const [rankedSchools, setRankedSchools] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isInState, setIsInState] = useState(false);
  const [selectedRole, setSelectedRole] = useState('overall');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (aggregates.length === 0) return;
    
    const activeAgg = aggregates.find(a => a.role === selectedRole) || aggregates.find(a => a.role === 'overall');
    const weights = (activeAgg ? activeAgg.weights : DEFAULT_WEIGHTS) as Record<string, number>;
    
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
            const key = factor.key as keyof typeof weights;

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

  const currentWeights = useMemo(() => {
    return aggregates.find(a => a.role === selectedRole)?.weights || {};
  }, [aggregates, selectedRole]);

  const submissionCount = aggregates.find(a => a.role === selectedRole)?.count || 0;
  
  const totalSubmissions = aggregates.find(a => a.role === 'overall')?.count || 0; 
  
  return (
    <div className="min-h-screen pb-12 flex flex-col"> 
      {/* HEADER */}
      {/* FIX: Increased z-index from z-50 to z-[100] to always cover table headers */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm flex-none">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full md:w-auto gap-8">
                <Link href="/" className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                    Medical School Rankings
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    <Link href="/" className="text-blue-600">Home</Link>
                    <Link href="/calculate?open=true" className="hover:text-blue-600 transition-colors">Customize</Link>
                    <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
                </nav>
                
                {/* Right Side: Mobile Nav Toggle + Customize Button */}
                <div className="flex items-center gap-4 md:hidden">
                   {/* CUSTOMIZE BUTTON: Always visible */}
                   <Link 
                      href="/calculate?open=true"
                      className="flex items-center justify-center p-2 rounded-full bg-purple-600 text-white shadow-md"
                      title="Customize"
                   >
                      <SlidersIcon className="w-5 h-5" />
                   </Link>
                   
                   <button 
                      className="text-slate-600" 
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                   >
                      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                   </button>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="relative w-64">
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
        
        {/* Mobile Menu Content - Z-index is automatically higher than table since it's nested under z-100 parent */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 p-4 shadow-lg absolute top-full left-0 w-full z-10">
                <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600">
                    <Link href="/" className="text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/calculate?open=true" className="hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Customize</Link>
                    <Link href="/about" className="hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                    
                    <div className="relative mt-2">
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
                </nav>
            </div>
        )}
      </div>

      {/* TABLE CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-4 mt-6 w-full">
        <div className="flex items-center justify-between mb-4 flex-none">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Overall Crowdsourced Rankings</h2>
                <p className="text-sm text-slate-500">
                    Ranked by the aggregated priorities of all contributors.
                </p>
            </div>
            {/* Hiding Submissions Badge on mobile to save space */}
            <div className="hidden sm:block text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wide">
                {totalSubmissions} Submissions
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