'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import schoolsData from '@/data/schools.json';
import { CATEGORY_CONFIG } from '@/lib/rankingConfig';
import { useAggregates } from '@/lib/useAggregates';
import RankingsTable from '@/components/RankingsTable';
import { GraduationCap, SlidersIcon, Search } from '@/components/Icons'; // Added Search icon

// ... (calculateRanking function remains unchanged) ...

const calculateRanking = (weights: Record<string, number>) => {
    // ... (Your ranking logic here - leave it unchanged) ...
    const flattenedFactors = CATEGORY_CONFIG.flatMap(g => g.factors).filter(f => f.type !== 'display_only');
    
    const stats: Record<string, { min: number, max: number }> = {};
    flattenedFactors.forEach(factor => {
        const values = schoolsData.map((d: any) => d[factor.key]).filter((v: any) => v !== null && !isNaN(v));
        if (values.length) {
            stats[factor.key] = { min: Math.min(...values), max: Math.max(...values) };
        } else {
            stats[factor.key] = { min: 0, max: 1 };
        }
    });

    const scored = schoolsData.map((school: any) => {
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

    return scored;
};


export default function HomePage() {
  const { aggregates, loading } = useAggregates();
  const [selectedRole, setSelectedRole] = useState('overall');
  const [rankedSchools, setRankedSchools] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Added Search Term state

  // 1. Update ranking when aggregates load or role changes
  useEffect(() => {
    if (aggregates.length === 0) return;
    const activeAgg = aggregates.find(a => a.role === selectedRole) || aggregates[0];
    if (activeAgg) {
      const ranked = calculateRanking(activeAgg.weights);
      setRankedSchools(ranked);
    }
  }, [aggregates, selectedRole]);

  // 2. Filter schools based on search term
  const filteredSchools = useMemo(() => {
      if (!searchTerm) return rankedSchools;
      const lowerTerm = searchTerm.toLowerCase();
      return rankedSchools.filter((school: any) => 
          (school["AAMC_Institution"] || '').toLowerCase().includes(lowerTerm) ||
          (school["canonical_name"] || '').toLowerCase().includes(lowerTerm)
      );
  }, [rankedSchools, searchTerm]);

  // Get current active weights for display
  const currentWeights = useMemo(() => {
    return aggregates.find(a => a.role === selectedRole)?.weights || {};
  }, [aggregates, selectedRole]);
  
  return (
    <div className="min-h-screen pb-12 flex flex-col h-screen">
      {/* HEADER - COPIED EXACTLY FROM CALCULATOR/REFERENCE HTML */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm flex-none">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {/* Icon is now correct size: w-8 h-8 */}
              <GraduationCap className="w-8 h-8 text-blue-600" />
              Med School Rankings
            </Link>
            <div className="flex items-center gap-3">
              {/* Search Bar - Copied from Reference HTML */}
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
              
              {/* Customize Rankings Button - Copied from Reference HTML, linking to /calculate */}
              <Link 
                href="/calculate"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform shadow-md 
                  bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 ring-2 ring-purple-500 ring-offset-2
                `}
              >
                <SlidersIcon className="w-4 h-4" />
                Customize Rankings
              </Link>
              
              {/* REMOVED the "Contribute" button to match the visual style of the reference HTML */}
            </div>
          </div>
        </div>
      </div>

      {/* CROWDSOURCED AGGREGATE PANEL (The unique content for the home page) */}
      <div className="bg-slate-50 border-b border-gray-200 shadow-inner flex-none">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <h3 className="font-bold text-slate-800 text-lg mb-4">
            Crowdsourced Aggregated Ranks 
            <span className="text-sm font-normal text-slate-500 ml-2">({aggregates.find(a => a.role === 'overall')?.count || 0} Submissions)</span>
          </h3>
          
          {/* Role Toggles */}
          <div className="flex flex-wrap gap-2 mb-6">
            {aggregates.map((agg) => (
            <button
                key={agg.role}
                onClick={() => setSelectedRole(agg.role)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                selectedRole === agg.role
                    ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-inner'
                    : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-100'
                }`}
            >
                {agg.displayRole} ({agg.count})
            </button>
            ))}
          </div>

          {/* Active Weights Preview (Simple List) */}
          {currentWeights && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-2">
                  <span className="font-bold text-slate-800 mr-2">
                      <span className="capitalize">{aggregates.find(a => a.role === selectedRole)?.displayRole || 'Overall'}</span> Priorities:
                  </span>
                  {Object.entries(currentWeights)
                      .filter(([_, val]) => (val as number) > 0)
                      .sort((a, b) => (b[1] as number) - (a[1] as number)) 
                      .slice(0, 8)
                      .map(([key, val]) => (
                          <span key={key}>{key}: <span className="font-medium text-blue-600">{val as number}%</span></span>
                      ))}
              </div>
          )}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="max-w-[1600px] mx-auto px-4 mt-6 flex-1 min-h-0 flex flex-col w-full">
        {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading live data...</div>
        ) : (
            <RankingsTable data={filteredSchools} />
        )}
      </div>
    </div>
  );
}