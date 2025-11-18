'use client';

import React, { useState, useMemo } from 'react';
import { CATEGORY_CONFIG } from '@/lib/rankingConfig';
import { ArrowUpDown, ChevronLeft, ChevronRight } from '@/components/Icons';

// Formatters
const formatCurrency = (val: number) => val ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val) : '-';
const formatPercent = (val: number) => val ? `${(val * 100).toFixed(1)}%` : '-';

interface RankingsTableProps {
  data: any[];
}

export default function RankingsTable({ data }: RankingsTableProps) {
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'CustomRank', direction: 'asc' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Sort Data
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

  // Paginate Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    // Default asc for rank and costs
    if (['CustomRank', 'Average Graduate Indebtedness', 'Total Cost of Attendance', 'Tuition and Fees'].includes(key)) {
      direction = 'asc';
    }
    if (sortConfig.key === key && sortConfig.direction === direction) {
      direction = direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* SCROLLABLE AREA */}
      <div className="overflow-auto custom-scroll h-full relative" style={{ maxHeight: '70vh' }}>
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-40 shadow-sm">
            <tr>
              <th rowSpan={2} onClick={() => requestSort('CustomRank')} className="cursor-pointer sticky left-0 z-50 w-16 bg-blue-50 text-center text-xs font-bold text-blue-800 border-b border-r border-blue-100 shadow hover:bg-blue-100">
                Rank
              </th>
              <th rowSpan={2} className="sticky left-16 z-50 w-64 bg-slate-50 text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-r border-gray-200 shadow">
                Institution
              </th>
              {CATEGORY_CONFIG.map(group => (
                <th key={group.id} colSpan={group.factors.length} className={`text-center py-1 text-[10px] uppercase font-bold tracking-widest border-b border-l border-gray-200 ${group.color}`}>
                  {group.id}
                </th>
              ))}
            </tr>
            <tr>
              {CATEGORY_CONFIG.flatMap(g => g.factors).map(col => (
                <th
                  key={col.key}
                  onClick={() => requestSort(col.key)}
                  title={col.tooltip}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-slate-50 border-b border-l border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-600 transition-colors select-none group relative"
                  style={{ textAlign: ['Average GPA','Average MCAT','#n_ranked_specialties','#n_top10_specialties','URM%','Class Size'].includes(col.key) ? 'center' : 'right' }}
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
                <td className="sticky left-0 z-30 bg-white text-center font-bold text-blue-600 border-r border-gray-200 py-3 text-sm shadow group-hover:bg-blue-50">
                  {row.CustomRank}
                </td>
                <td className="sticky left-16 z-30 bg-white text-left px-4 py-3 border-r border-gray-200 shadow group-hover:bg-blue-50">
                  <div className="font-medium text-gray-900 text-sm truncate w-64" title={row.AAMC_Institution}>
                    {row.AAMC_Institution || row.canonical_name}
                  </div>
                </td>
                {CATEGORY_CONFIG.flatMap(g => g.factors).map((col, i) => (
                  <td 
                    key={i} 
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-l border-gray-100"
                    style={{ textAlign: ['Average GPA','Average MCAT','#n_ranked_specialties','#n_top10_specialties','URM%','Class Size'].includes(col.key) ? 'center' : 'right' }}
                  >
                    {(() => {
                      const val = row[col.key];
                      if (col.key.includes('Funding') || col.key.includes('Cost') || col.key.includes('Tuition') || col.key.includes('Indebtedness')) return formatCurrency(val);
                      if (col.key === 'Average GPA') return val ? val.toFixed(2) : '-';
                      if (col.key === 'Average MCAT') return val ? Math.round(val) : '-';
                      if (col.key.includes('%')) return formatPercent(val);
                      return val || '-';
                    })()}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr><td colSpan={15} className="p-8 text-center text-gray-500">No results found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* PAGINATION */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-none z-40 relative">
        <div className="text-xs text-gray-500 hidden sm:block">
          Showing {((currentPage-1)*itemsPerPage)+1} - {Math.min(currentPage*itemsPerPage, data.length)} of {data.length}
        </div>
        <div className="flex items-center gap-3">
          <select value={itemsPerPage} onChange={e => {setItemsPerPage(Number(e.target.value)); setCurrentPage(1)}} className="text-xs border rounded p-1">
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={9999}>All</option>
          </select>
          <div className="flex">
            <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="px-2 py-1 border rounded-l bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
            <span className="px-3 py-1 border-t border-b bg-white text-xs font-medium pt-2">{currentPage}</span>
            <button disabled={currentPage>=Math.ceil(data.length/itemsPerPage)} onClick={()=>setCurrentPage(p=>p+1)} className="px-2 py-1 border rounded-r bg-white hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
    </div>
  );
}