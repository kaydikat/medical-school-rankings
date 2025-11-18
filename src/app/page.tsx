'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import schoolsData from '@/data/schools.json';
import { CATEGORY_CONFIG } from '@/lib/rankingConfig';
import { useAggregates } from '@/lib/useAggregates';
import RankingsTable from '@/components/RankingsTable';
import { GraduationCap, SlidersIcon, UploadCloud } from '@/components/Icons';

export default function HomePage() {
  const { aggregates, loading } = useAggregates();
  const [selectedRole, setSelectedRole] = useState('overall');
  const [rankedSchools, setRankedSchools] = useState<any[]>([]);

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
    scored.sort((a: any, b: any) => b.rawScore - a.rawScore);

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

  // Update ranking when aggregates load or role changes
  useEffect(() => {
    if (aggregates.length === 0) return;
    const activeAgg = aggregates.find(a => a.role === selectedRole) || aggregates[0];
    if (activeAgg) {
      const ranked = calculateRanking(activeAgg.weights);
      setRankedSchools(ranked);
    }
  }, [aggregates, selectedRole]);

  // Get current active weights for display
  const currentWeights = useMemo(() => {
    return aggregates.find(a => a.role === selectedRole)?.weights || {};
  }, [aggregates, selectedRole]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero / Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                <GraduationCap className="w-10 h-10 text-blue-600" />
                Crowdsourced Med Rankings
              </h1>
              <p className="text-slate-500 text-lg">
                Live rankings based on {aggregates[0]?.count || 0} user submissions.
              </p>
            </div>
            <div className="flex gap-3">
               <Link href="/calculate" className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg ring-2 ring-purple-500 ring-offset-2">
                  <SlidersIcon className="w-5 h-5" /> Create Your Own
               </Link>
               <Link href="/submit" className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all hover:scale-105 shadow-lg ring-2 ring-emerald-500 ring-offset-2">
                  <UploadCloud className="w-5 h-5" /> Contribute
               </Link>
            </div>
          </div>

          {/* Role Toggles */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start">
            {aggregates.map((agg) => (
              <button
                key={agg.role}
                onClick={() => setSelectedRole(agg.role)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  selectedRole === agg.role
                    ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-inner'
                    : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {agg.displayRole}
              </button>
            ))}
          </div>
          
          {/* Active Weights Preview (Simple List) */}
          {currentWeights && (
             <div className="mt-6 p-4 bg-slate-50 border border-gray-200 rounded-lg text-sm text-slate-600 flex flex-wrap gap-x-6 gap-y-2">
                <span className="font-bold text-slate-800 mr-2">Current Weights:</span>
                {Object.entries(currentWeights)
                  .filter(([_, val]) => (val as number) > 0)
                  .sort((a, b) => (b[1] as number) - (a[1] as number)) // Cast to number to fix TS error
                  .slice(0, 8) // Show top 8
                  .map(([key, val]) => (
                    <span key={key}>{key}: <span className="font-medium text-blue-600">{val as number}%</span></span>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6">
        {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Loading live data...</div>
        ) : (
            <RankingsTable data={rankedSchools} />
        )}
      </div>
    </div>
  );
}