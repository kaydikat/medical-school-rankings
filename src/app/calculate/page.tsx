'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import schoolsData from '@/data/schools.json';
import { CATEGORY_CONFIG, DEFAULT_WEIGHTS } from '@/lib/rankingConfig';
import RankingsTable from '@/components/RankingsTable';
import { 
  GraduationCap, Search, SlidersIcon, Save, Percent, 
  XCircle, RefreshCw, UploadCloud 
} from '@/components/Icons';

// Helper to match the exact styling from the reference HTML
const CATEGORY_STYLES: Record<string, string> = {
  'Academics': 'bg-blue-50 text-blue-800 border-blue-200',
  'Research': 'bg-purple-50 text-purple-800 border-purple-200',
  'Finances': 'bg-green-50 text-green-800 border-green-200',
  'Clinical Quality': 'bg-orange-50 text-orange-800 border-orange-200',
  'Student Body': 'bg-pink-50 text-pink-800 border-pink-200',
};

export default function CalculatePage() {
    // --- State ---
    const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
    const [searchTerm, setSearchTerm] = useState('');
    // Reference UI has this defaulting to false usually, but let's keep it consistent with your preference
    const [showRankingsPanel, setShowRankingsPanel] = useState(false);

    // --- Core Ranking Logic ---
    const rankedData = useMemo(() => {
        const flattenedFactors = CATEGORY_CONFIG.flatMap(g => g.factors).filter(f => f.type !== 'display_only');
        
        // 1. Calculate Min/Max for normalization
        const stats: Record<string, { min: number, max: number }> = {};
        flattenedFactors.forEach(factor => {
            const values = schoolsData.map((d: any) => d[factor.key]).filter((v: any) => v !== null && !isNaN(v));
            if (values.length) {
                stats[factor.key] = { min: Math.min(...values), max: Math.max(...values) };
            } else {
                stats[factor.key] = { min: 0, max: 1 };
            }
        });

        // 2. Score each school
        const scored = schoolsData.map((school: any) => {
            let totalScore = 0;
            flattenedFactors.forEach(factor => {
                const weight = weights[factor.key] || 0;
                if (weight === 0) return;

                let rawVal = school[factor.key];
                const { min, max } = stats[factor.key];

                // Handle missing data
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

        // 3. Sort by Score Descending
        scored.sort((a: any, b: any) => {
            const diff = b.rawScore - a.rawScore;
            if (Math.abs(diff) < 0.00001) {
                return (a.AAMC_Institution || '').localeCompare(b.AAMC_Institution || '');
            }
            return diff;
        });

        // 4. Assign Ranks
        scored.forEach((row: any, index: number) => {
            if (index > 0 && Math.abs(row.rawScore - scored[index-1].rawScore) < 0.00001) {
                row.CustomRank = scored[index-1].CustomRank;
            } else {
                row.CustomRank = index + 1;
            }
        });

        return scored;
    }, [weights]);

    // --- Filtering ---
    const filteredData = useMemo(() => {
        if (!searchTerm) return rankedData;
        const lowerTerm = searchTerm.toLowerCase();
        return rankedData.filter((school: any) => 
            (school["AAMC_Institution"] || '').toLowerCase().includes(lowerTerm) ||
            (school["canonical_name"] || '').toLowerCase().includes(lowerTerm)
        );
    }, [rankedData, searchTerm]);

    // --- Handlers ---
    const handleWeightChange = (key: string, val: string) => {
        setWeights(prev => ({ ...prev, [key]: parseInt(val) || 0 }));
    };

    // DOWNLOAD Feature (Separated)
    const handleDownloadWeights = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(weights, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "weights.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const rescaleWeights = () => {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        if (total === 0) return;
        const newWeights: Record<string, number> = {};
        let currentTotal = 0;
        
        Object.keys(weights).forEach(key => {
            const val = Math.round((weights[key] / total) * 100);
            newWeights[key] = val;
            currentTotal += val;
        });

        const diff = 100 - currentTotal;
        if (diff !== 0) {
            const maxKey = Object.keys(newWeights).reduce((a, b) => newWeights[a] > newWeights[b] ? a : b);
            newWeights[maxKey] += diff;
        }
        setWeights(newWeights);
    };

    const setWeightsToZero = () => {
        const zeroWeights: Record<string, number> = {};
        Object.keys(weights).forEach(key => zeroWeights[key] = 0);
        setWeights(zeroWeights);
    };

    const totalWeight = Object.values(weights).reduce((a,b) => a+b, 0);

    return (
        <div className="min-h-screen pb-12 flex flex-col h-screen">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm flex-none">
                <div className="max-w-[1600px] mx-auto px-4 py-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-2 text-decoration-none">
                            <GraduationCap className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-slate-800">
                                Med School Rankings
                            </h1>
                        </Link>
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
                            <button 
                                onClick={() => setShowRankingsPanel(!showRankingsPanel)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all transform shadow-md ${
                                    showRankingsPanel 
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 ring-2 ring-gray-400' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 ring-2 ring-purple-500 ring-offset-2'
                                }`}
                            >
                                <SlidersIcon className="w-4 h-4" />
                                {showRankingsPanel ? 'Close Customization' : 'Customize Rankings'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* WEIGHTS PANEL */}
            {showRankingsPanel && (
                <div className="bg-slate-50 border-b border-gray-200 shadow-inner animate-in slide-in-from-top-2 duration-200 flex-none">
                    <div className="max-w-[1600px] mx-auto px-4 py-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Custom Ranking Weights</h3>
                                <p className="text-sm text-slate-500">Adjust priorities to generate your own personalized list. Missing data results in 0 points for that category.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`text-sm font-bold px-4 py-1.5 rounded-full border ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    Total Weight: {totalWeight}%
                                </div>
                                
                                {/* SEPARATE SUBMIT AND DOWNLOAD BUTTONS */}
                                <Link 
                                    href={{ pathname: '/submit', query: { weights: JSON.stringify(weights) } }} 
                                    className="text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded flex items-center gap-1 font-medium shadow-sm transition-colors"
                                >
                                    <UploadCloud className="w-3 h-3" /> Submit
                                </Link>

                                <button onClick={handleDownloadWeights} className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium border-l pl-4 border-gray-300">
                                    <Save className="w-3 h-3" /> Download JSON
                                </button>

                                <button onClick={rescaleWeights} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                                    <Percent className="w-3 h-3" /> Rescale to 100%
                                </button>

                                <button onClick={setWeightsToZero} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">
                                    <XCircle className="w-3 h-3" /> Zero
                                </button>

                                <button onClick={() => setWeights(DEFAULT_WEIGHTS)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Reset
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {CATEGORY_CONFIG.map((group) => (
                                <div key={group.id} className="space-y-3">
                                    <h4 className={`font-semibold text-xs uppercase tracking-wider px-2 py-1 rounded border w-fit ${CATEGORY_STYLES[group.id] || 'bg-gray-50 border-gray-200'}`}>
                                        {group.id}
                                    </h4>
                                    <div className="space-y-4 pl-1">
                                        {group.factors.filter(f => f.type !== 'display_only').map(factor => (
                                            <div key={factor.key}>
                                                <div className="flex justify-between mb-1 items-end">
                                                    <label className="text-xs font-medium text-slate-700 cursor-help border-b border-dotted border-gray-400" title={factor.tooltip}>
                                                        {factor.label}
                                                    </label>
                                                    <span className="text-xs text-slate-500">{weights[factor.key]}%</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0" max="100" 
                                                    value={weights[factor.key]}
                                                    onChange={(e) => handleWeightChange(factor.key, e.target.value)}
                                                    className="w-full accent-purple-600"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TABLE CONTAINER */}
            <div className="max-w-[1600px] mx-auto px-4 mt-6 flex-1 min-h-0 flex flex-col w-full">
                <RankingsTable data={filteredData} />
            </div>
        </div>
    );
}