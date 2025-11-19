'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; 
import schoolsData from '@/data/final_medical_school_data.json';
import { CATEGORY_CONFIG, DEFAULT_WEIGHTS } from '@/lib/rankingConfig';
import RankingsTable from '@/components/RankingsTable';
import SubmitModal from '@/components/SubmitModal';
import { 
  GraduationCap, Search, SlidersIcon, Save, Percent, 
  XCircle, RefreshCw, UploadCloud, Info, MoreHorizontal, FileText, Upload 
} from '@/components/Icons';

const CATEGORY_STYLES: Record<string, string> = {
  'Academics': 'bg-blue-50 text-blue-800 border-blue-200',
  'Research': 'bg-purple-50 text-purple-800 border-purple-200',
  'Finances': 'bg-green-50 text-green-800 border-green-200',
  'Clinical Excellence': 'bg-orange-50 text-orange-800 border-orange-200',
  'Student Body': 'bg-pink-50 text-pink-800 border-pink-200',
};

// 1. INTERNAL COMPONENT: Contains all the logic
function CalculateContent() {
    const searchParams = useSearchParams();
    const openParam = searchParams.get('open');
    
    const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRankingsPanel, setShowRankingsPanel] = useState(openParam === 'true');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isInState, setIsInState] = useState(false);
    
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowDownloadMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const rankedData = useMemo(() => {
        const flattenedFactors = CATEGORY_CONFIG.flatMap(g => g.factors).filter(f => f.type !== 'display_only');
        
        const stats: Record<string, { min: number, max: number }> = {};
        
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

        return scored;
    }, [weights, isInState]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return rankedData;
        const lowerTerm = searchTerm.toLowerCase();
        return rankedData.filter((school: any) => 
            (school["AAMC_Institution"] || '').toLowerCase().includes(lowerTerm) ||
            (school["canonical_name"] || '').toLowerCase().includes(lowerTerm)
        );
    }, [rankedData, searchTerm]);

    const handleWeightChange = (key: string, val: string) => {
        let num = parseInt(val);
        if (isNaN(num)) num = 0;
        if (num > 100) num = 100;
        if (num < 0) num = 0;
        setWeights(prev => ({ ...prev, [key]: num }));
    };

    const handleDownloadWeights = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(weights, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "ranking_weights.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setShowDownloadMenu(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const validKeys = Object.keys(DEFAULT_WEIGHTS);
                const cleanWeights = { ...DEFAULT_WEIGHTS };
                let hasValidData = false;
                Object.keys(json).forEach(key => {
                    if (validKeys.includes(key) && typeof json[key] === 'number') {
                        cleanWeights[key] = json[key];
                        hasValidData = true;
                    }
                });
                if (hasValidData) {
                    setWeights(cleanWeights);
                    setShowDownloadMenu(false);
                } else {
                    alert("Invalid weights file.");
                }
            } catch (error) {
                alert("Failed to parse file.");
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleDownloadRankings = () => {
        const factors = CATEGORY_CONFIG.flatMap(g => g.factors);
        const headers = ['Rank', 'Institution', ...factors.map(f => f.label)];
        const rows = filteredData.map(school => {
            return [
                school.CustomRank,
                `"${school.AAMC_Institution}"`,
                ...factors.map(f => {
                    const val = school[f.key];
                    return val !== null && val !== undefined ? val : '';
                })
            ].join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'medical_school_rankings.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowDownloadMenu(false);
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
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 text-decoration-none">
                                <GraduationCap className="w-8 h-8 text-blue-600" />
                                <h1 className="text-2xl font-bold text-slate-800">
                                    Med School Rankings
                                </h1>
                            </Link>
                            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                                <Link href="/calculate?open=true" className="text-blue-600">Customize</Link>
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
                                <p className="text-sm text-slate-500">Adjust priorities to generate your own personalized list.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`text-sm font-bold px-4 py-1.5 rounded-full border ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    Total Weight: {totalWeight}%
                                </div>
                                
                                <button onClick={() => setIsSubmitModalOpen(true)} className="text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded flex items-center gap-1 font-medium shadow-sm transition-colors">
                                    <UploadCloud className="w-3 h-3" /> Contribute
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

                                <div className="relative" ref={menuRef}>
                                    <button 
                                        onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                        className={`p-1.5 rounded hover:bg-gray-200 transition-colors text-slate-500 ${showDownloadMenu ? 'bg-gray-200 text-slate-800' : ''}`}
                                        title="More Options"
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                    {showDownloadMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100">
                                            <div className="py-1">
                                                <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                                <button onClick={handleDownloadRankings} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> Download CSV
                                                </button>
                                                <button onClick={handleDownloadWeights} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                                                    <Save className="w-4 h-4" /> Download Weights
                                                </button>
                                                <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 border-t border-gray-100">
                                                    <Upload className="w-4 h-4" /> Upload Weights
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Sliders Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {CATEGORY_CONFIG.map((group) => (
                                <div key={group.id} className="space-y-3">
                                    <h4 className={`font-semibold text-xs uppercase tracking-wider px-2 py-1 rounded border w-fit ${CATEGORY_STYLES[group.id] || 'bg-gray-50 border-gray-200'}`}>
                                        {group.id}
                                    </h4>
                                    <div className="space-y-4 pl-1">
                                        {group.factors.filter(f => f.type !== 'display_only').map(factor => (
                                            <div key={factor.key}>
                                                <div className="flex justify-between mb-1 items-center">
                                                    <div className="flex items-center gap-1.5">
                                                        <label className="text-xs font-medium text-slate-700">{factor.label}</label>
                                                        <div className="group relative flex items-center">
                                                            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                                {factor.tooltip}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={weights[factor.key]}
                                                            onChange={(e) => handleWeightChange(factor.key, e.target.value)}
                                                            className="w-12 text-xs text-right p-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                        <span className="text-xs text-slate-500">%</span>
                                                    </div>
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

            <div className="max-w-[1600px] mx-auto px-4 mt-6 flex-1 min-h-0 flex flex-col w-full">
                <div className="flex items-center justify-between mb-4 flex-none">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Your Personalized Rankings</h2>
                        <p className="text-sm text-slate-500">Based on your unique weights and preferences ({isInState ? 'In-State' : 'Out-of-State'} Costs)</p>
                    </div>
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-wide">
                        {filteredData.length} Schools
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <RankingsTable 
                        data={filteredData} 
                        isInState={isInState} 
                        onToggleInState={setIsInState} 
                    />
                </div>
            </div>

            <SubmitModal 
                isOpen={isSubmitModalOpen} 
                onClose={() => setIsSubmitModalOpen(false)} 
                weights={weights} 
            />
        </div>
    );
}

// 2. DEFAULT EXPORT (Wrapper with Suspense)
export default function CalculatePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-500">Loading...</div>}>
      <CalculateContent />
    </Suspense>
  );
}