import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { CutoffRecord } from '../../types';
import { exportRecordsToCSV } from '../../data/initialData';

interface DataTablePageProps {
  records: CutoffRecord[];
}

export const DataTablePage: React.FC<DataTablePageProps> = ({ records }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof CutoffRecord>('cutoff_percentile');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      r =>
        r.college_name.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        String(r.year).includes(q) ||
        String(r.college_id).includes(q)
    );
  }, [records, searchQuery]);

  // Sorted
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [filtered, sortField, sortAsc]);

  // Paginated
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (field: keyof CutoffRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportRecordsToCSV(sorted);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mht_cet_cutoffs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Complete Cutoff Master Table</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabular directory of all {records.length.toLocaleString()} admissions benchmark entries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search records by keyword..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-600">
          <span>Showing {sorted.length} results</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th onClick={() => handleSort('college_id')} className="cursor-pointer px-3 py-3 hover:text-slate-900">
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('college_name')} className="cursor-pointer px-4 py-3 hover:text-slate-900">
                  <div className="flex items-center gap-1">
                    <span>College</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('location')} className="cursor-pointer px-3 py-3 hover:text-slate-900">
                  Location
                </th>
                <th onClick={() => handleSort('branch')} className="cursor-pointer px-3 py-3 hover:text-slate-900">
                  Branch
                </th>
                <th onClick={() => handleSort('year')} className="cursor-pointer px-3 py-3 hover:text-slate-900">
                  <div className="flex items-center gap-1">
                    <span>Admission Year</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('round')} className="cursor-pointer px-3 py-3 hover:text-slate-900">
                  CAP Round
                </th>
                <th onClick={() => handleSort('category')} className="cursor-pointer px-3 py-3 hover:text-slate-900">
                  Category
                </th>
                <th onClick={() => handleSort('cutoff_percentile')} className="cursor-pointer px-3 py-3 text-right hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Cutoff Percentile</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('closing_rank')} className="cursor-pointer px-4 py-3 text-right hover:text-slate-900">
                  <div className="flex items-center justify-end gap-1">
                    <span>Closing Rank</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">
                    No cutoff records found for the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2.5 font-mono text-slate-400">{row.college_id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{row.college_name}</td>
                    <td className="px-3 py-2.5">{row.location}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        {row.branch}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{row.year}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-600">Round {row.round}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 border border-blue-200/50">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                      {row.cutoff_percentile.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-700">
                      #{row.closing_rank.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 bg-slate-50/50">
          <div>
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2 text-slate-500 font-medium">
              {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, sorted.length)}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
