'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORY_CONFIG } from '@/lib/rankingConfig';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Info } from '@/components/Icons';

const CATEGORY_STYLES: Record<string, string> = {
  'Academics': 'bg-blue-50 text-blue-800 border-blue-200',
  'Research': 'bg-purple-50 text-purple-800 border-purple-200',
  'Finances': 'bg-green-50 text-green-800 border-green-200',
  'Clinical Excellence': 'bg-orange-50 text-orange-800 border-orange-200',
  'Student Body': 'bg-pink-50 text-pink-800 border-pink-200',
};

// Short names for mobile filter
const MOBILE_ROLE_NAMES: Record<string, string> = {
  "Current US medical student": "US Med Student",
  "Prospective US medical student enrolled in 4-year degree program": "Pre-Med",
  "Medical school faculty member": "Faculty",
  "Physician (resident, attending, etc)": "Physician",
  "Other": "Other"
};

const formatCurrency = (val: any) => val ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val) : '-';
const formatPercent = (val: any) => val ? `${(Number(val)).toFixed(1)}%` : '-';

interface RankingsTableProps {
  data: any[];
  isInState?: boolean;
  onToggleInState?: (val: boolean) => void;
  availableRoles?: any[];
  selectedRole?: string;
  onRoleSelect?: (role: string) => void;
  currentWeights?: Record<string, number>;
  submissionCount?: number;
}

export default function RankingsTable({ 
  data, 
  isInState, 
  onToggleInState, 
  availableRoles = [], 
  selectedRole = 'overall', 
  onRoleSelect,
  currentWeights,
  submissionCount = 0
}: RankingsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'CustomRank', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showMethodology, setShowMethodology] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen for shortening names
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sortedData = useMemo(() => {
    let items = [...data];
    if (sortConfig.key) {
      items.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (['CustomRank', 'Average Graduate Indebtedness', 'Total Cost of Attendance', 'Tuition and Fees'].includes(key)) {
      direction = 'asc';
    }
    if (sortConfig.key === key && sortConfig.direction === direction) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

  const RANK_WIDTH = 'var(--rank-w)';
  const INST_WIDTH = 'var(--inst-w)';
  const HEADER_HEIGHT = '40px';
  const SECOND_ROW_TOP = '39px'; 

  // Helper to get the display name based on screen size
  const getRoleLabel = (roleData: any) => {
    if (roleData.role === 'overall') return `All (${roleData.count})`;
    
    const fullName = roleData.displayRole.split(' (')[0];
    const count = roleData.count;

    if (isMobile && MOBILE_ROLE_NAMES[fullName]) {
      return `${MOBILE_ROLE_NAMES[fullName]} (${count})`;
    }
    return roleData.displayRole;
  };

  // FIX: Define roleLabel here so it can be used in the render block
  const roleLabel = selectedRole === 'overall' ? 'All' : 
                    availableRoles.find(r => r.role === selectedRole)?.displayRole.split(' (')[0] || selectedRole;

  // Also create a "currentRoleLabel" for the methodology header if you want shortened name there too
  const methodologyRoleLabel = isMobile && MOBILE_ROLE_NAMES[roleLabel] ? MOBILE_ROLE_NAMES[roleLabel] : roleLabel;

  return (
    <div className="flex flex-col h-full gap-3">
      
      {/* 1. TOP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 flex-none">
         <div className="flex items-center gap-2 flex-wrap">
            
            {/* Role Filter Dropdown */}
            {onRoleSelect && availableRoles.length > 0 && (
                <div className="relative">
                    <select 
                        value={selectedRole} 
                        onChange={(e) => onRoleSelect(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:border-blue-400 hover:text-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm max-w-[200px] md:max-w-none truncate"
                    >
                        {availableRoles.map(agg => (
                            <option key={agg.role} value={agg.role}>
                                {getRoleLabel(agg)}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3 h-3" />
                    </div>
                </div>
            )}

            {/* Methodology Toggle */}
            <button 
                onClick={() => setShowMethodology(!showMethodology)}
                className={`text-xs font-bold px-3 py-1.5 rounded-md border flex items-center gap-2 transition-all shadow-sm ${
                    showMethodology 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200' 
                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                }`}
            >
                <Info className="w-3.5 h-3.5" />
                Methodology
                {showMethodology ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
         </div>
      </div>

      {/* 2. METHODOLOGY PANEL (Formatted & Ordered) */}
      {showMethodology && currentWeights && (
        <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm animate-in slide-in-from-top-2 relative">
            <button onClick={() => setShowMethodology(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                <ChevronUp className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">
                        Aggregated Priorities: <span className="text-blue-600">{methodologyRoleLabel} Contributors</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                        These weights represent the median values submitted by {submissionCount} {roleLabel === 'All' ? 'total' : ''} users.
                    </p>
                </div>

                {/* Weights Grid - ORDERED BY TABLE COLUMNS */}
                <div className="flex flex-wrap gap-3">
                    {CATEGORY_CONFIG.flatMap(group => 
                        group.factors
                            .filter(f => currentWeights[f.key] > 0) // Only show active weights
                            .map(factor => (
                                <div key={factor.key} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                        {factor.label}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                        {currentWeights[factor.key]}%
                                    </span>
                                </div>
                            ))
                    )}
                </div>

                <div className="mt-2 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        Want to contribute yours? 
                        <Link href="/calculate?open=true" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                            Go to Customization →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* 3. TABLE CONTAINER */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0 relative">
        <div className="overflow-auto custom-scroll h-full relative">
            <table className="min-w-full divide-y divide-gray-200 border-collapse">
            <thead className="bg-slate-50 shadow-sm">
                <tr>
                <th 
                    rowSpan={2} 
                    onClick={() => requestSort('CustomRank')} 
                    className="sticky top-0 z-[61] bg-blue-50 text-center text-xs font-bold text-blue-800 border-b border-r border-blue-100 shadow hover:bg-blue-100 cursor-pointer"
                    style={{ width: RANK_WIDTH, minWidth: RANK_WIDTH, maxWidth: RANK_WIDTH, left: 0, boxShadow: '1px 0 0 #dbeafe' }}
                >
                    Rank
                </th>

                <th 
                    rowSpan={2} 
                    className="sticky top-0 z-[60] bg-slate-50 text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 shadow"
                    style={{ width: INST_WIDTH, minWidth: INST_WIDTH, maxWidth: INST_WIDTH, left: `calc(${RANK_WIDTH} - 1px)` }}
                >
                    Institution
                </th>

                {CATEGORY_CONFIG.map(group => (
                    <th 
                    key={group.id} 
                    colSpan={group.factors.length} 
                    className={`sticky top-0 z-50 text-center py-1 text-[10px] uppercase font-bold tracking-widest border-b border-l border-gray-200 whitespace-nowrap ${CATEGORY_STYLES[group.id] || 'bg-gray-50'}`}
                    style={{ height: HEADER_HEIGHT }}
                    >
                    <div className="relative w-full flex items-center justify-center h-full">
                        <span>{group.id}</span>
                        {group.id === 'Finances' && onToggleInState && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <button 
                                onClick={() => onToggleInState(!isInState)}
                                className={`w-6 h-3.5 rounded-full relative transition-colors shadow-sm border border-green-600/20 ${isInState ? 'bg-green-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-transform ${isInState ? 'left-[13px]' : 'left-[1px]'}`} />
                            </button>
                            <span className={`text-[9px] font-bold normal-case tracking-normal ${isInState ? 'text-green-700' : 'text-slate-400'}`}>
                            In-State
                            </span>
                        </div>
                        )}
                    </div>
                    </th>
                ))}
                </tr>

                <tr>
                {CATEGORY_CONFIG.flatMap(g => g.factors).map(col => (
                    <th
                    key={col.key}
                    onClick={() => requestSort(col.key)}
                    title={col.tooltip}
                    className="sticky z-40 px-4 py-2 text-xs font-semibold text-gray-600 bg-slate-50 border-b border-l border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-600 transition-colors select-none group relative"
                    style={{ top: SECOND_ROW_TOP, textAlign: ['Average GPA','Average MCAT','#n_ranked_specialties','#n_top10_specialties','URM%','Class Size'].includes(col.key) ? 'center' : 'right' }}
                    >
                    <div className={`flex items-center gap-1 ${['Average GPA','Average MCAT','#n_ranked_specialties','#n_top10_specialties','URM%','Class Size'].includes(col.key) ? 'justify-center' : 'justify-end'}`}>
                        <span className="border-b border-dotted border-gray-400" title={col.tooltip}>{col.label}</span>
                        <ArrowUpDown className={`w-3 h-3 transition-opacity ${sortConfig.key === col.key ? 'opacity-100 text-blue-600' : 'opacity-30 group-hover:opacity-100'}`} />
                    </div>
                    </th>
                ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-blue-50 transition-colors">
                    <td 
                    className="sticky left-0 z-[31] bg-white text-center font-bold text-blue-600 border-r border-gray-200 py-3 text-sm shadow group-hover:bg-blue-50" 
                    style={{ width: RANK_WIDTH, minWidth: RANK_WIDTH, maxWidth: RANK_WIDTH, left: 0, boxShadow: '1px 0 0 #e5e7eb' }}
                    >
                    {row.CustomRank}
                    </td>
                    <td className="sticky z-30 bg-white text-left px-4 py-3 border-r border-gray-200 shadow group-hover:bg-blue-50" style={{ width: INST_WIDTH, minWidth: INST_WIDTH, maxWidth: INST_WIDTH, left: `calc(${RANK_WIDTH} - 1px)` }}>
                    <div className="font-medium text-gray-900 text-sm whitespace-normal break-words leading-tight" title={row.AAMC_Institution}>
                        {row.AAMC_Institution || row.canonical_name}
                    </div>
                    </td>
                    {CATEGORY_CONFIG.flatMap(g => g.factors).map((col, i) => (
                    <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-l border-gray-100" style={{ textAlign: ['Average GPA','Average MCAT','#n_ranked_specialties','#n_top10_specialties','URM%','Class Size'].includes(col.key) ? 'center' : 'right' }}>
                        {(() => {
                        const val = row[col.key];
                        if (col.key.includes('Funding') || col.key.includes('Cost') || col.key.includes('Tuition') || col.key.includes('Indebtedness')) return formatCurrency(val);
                        if (col.key === 'Average GPA') return val ? Number(val).toFixed(2) : '-';
                        if (col.key === 'Average MCAT') return val ? Math.round(val) : '-';
                        if (col.key.includes('%')) return formatPercent(val);
                        return val || '-';
                        })()}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      
        {/* FOOTER BAR - Only Pagination */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end flex-none z-50 relative gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 hidden sm:block">
                {((currentPage-1)*itemsPerPage)+1}-{Math.min(currentPage*itemsPerPage, data.length)} of {data.length}
            </div>
            <select value={itemsPerPage} onChange={e => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1)}} className="text-xs border rounded p-1 shadow-sm">
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={9999}>All</option>
            </select>
            <div className="flex shadow-sm">
                <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="px-2 py-1 border rounded-l bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
                <span className="px-3 py-1 border-t border-b bg-white text-xs font-medium pt-2 min-w-[2rem] text-center">{currentPage}</span>
                <button disabled={currentPage>=Math.ceil(data.length/itemsPerPage)} onClick={()=>setCurrentPage(p=>p+1)} className="px-2 py-1 border rounded-r bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
            </div>
            </div>
        </div>
    </div>
    </div>
  );
}