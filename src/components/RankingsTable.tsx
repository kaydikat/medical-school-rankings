// src/components/RankingsTable.tsx
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { School } from '@/types/school';

const columnHelper = createColumnHelper<School>();

const columns = [
  columnHelper.accessor('Rank', { header: 'Rank' }),
  columnHelper.accessor('MSAR Name', { header: 'School Name' }),
  columnHelper.accessor('Median MCAT', { header: 'Median MCAT' }),
  columnHelper.accessor('Median GPA', {
    header: 'Median GPA',
    cell: info => info.getValue().toFixed(2),
  }),
  columnHelper.accessor('Count T10 Ranked Specialties', { header: 'T10 Specialties' }),
  columnHelper.accessor('Avg Indebtedness ($)', {
    header: 'Avg Indebtedness',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('Full NIH Funding 2024', {
    header: 'Total NIH Funding',
    cell: info => `$${info.getValue().toLocaleString()}`,
  }),
  columnHelper.accessor('Yield %', {
    header: 'Yield',
    cell: info => info.getValue() ? `${(info.getValue()! * 100).toFixed(1)}%` : 'N/A',
  }),
];

interface RankingsTableProps {
  data: School[];
}

export default function RankingsTable({ data }: RankingsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="table-light">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
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