// src/components/RankingsTable.tsx
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { School } from '@/types/school';

const columnHelper = createColumnHelper<School>();

const columns = [
  columnHelper.accessor('Rank', { header: 'Rank' }),
  columnHelper.accessor('canonical_name', { header: 'School Name' }),
  columnHelper.accessor('Average MCAT', { header: 'Average MCAT' }),
  columnHelper.accessor('Average GPA', {
    header: 'Average GPA',
    cell: info => {
      const value = info.getValue();
      return value != null ? value.toFixed(2) : 'N/A';
    },
  }),
  columnHelper.accessor('#n_top10_specialties', { header: '# Top 10 Specialties' }),
  columnHelper.accessor('#n_ranked_specialties', { header: '# Ranked Specialties' }),
  columnHelper.accessor('Average Graduate Indebtedness', {
    header: 'Avg Indebtedness',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('NIH Research Funding per Faculty', {
    header: 'NIH Funding / Faculty',
    cell: info => `$${Math.round(info.getValue()).toLocaleString()}`,
  }),
  columnHelper.accessor('NIH Research Funding', {
    header: 'Total NIH Funding',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('Tuition and Fees', {
    header: 'Tuition & Fees',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('Total Cost of Attendance', {
    header: 'Total Cost',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('URM%', {
    header: 'URM %',
    cell: info => `${(info.getValue() * 100).toFixed(1)}%`,
  }),
  // Additional display columns (not weighted)
  columnHelper.accessor('Class Size', { header: 'Class Size' }),
  columnHelper.accessor('#n_top1_specialties', { header: '# Top 1 Specialties' }),
  columnHelper.accessor('% Receiving Aid', { header: '% Receiving Aid' }),
];

interface RankingsTableProps {
  data: School[];
}

export default function RankingsTable({ data }: RankingsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Enables sorting
  });

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="table-light">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: 'pointer' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}