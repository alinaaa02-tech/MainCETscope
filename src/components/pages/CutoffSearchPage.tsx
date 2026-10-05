import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { CutoffRecord, VALID_YEARS, VALID_ROUNDS } from '../../types';
import { CategoryFilter } from '../common/CategoryFilter';

interface CutoffSearchPageProps {
  records: CutoffRecord[];
  onSelectCollegeForComparison?: (collegeName: string) => void;
}

export const CutoffSearchPage: React.FC<CutoffSearchPageProps> = ({ records }) => {
  // Filters state
  const [selectedCollege, setSelectedCollege] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedRound, setSelectedRound] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPercentile, setMinPercentile] = useState<number>(40);
  const [maxPercentile, setMaxPercentile] = useState<number>(100);

  // Sorting state
  const [sortField, setSortField] = useState<keyof CutoffRecord>('cutoff_percentile');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Detail Modal record
  const [selectedRecord, setSelectedRecord] = useState<CutoffRecord | null>(null);

  // Options derived strictly from dataset
  const collegeOptions = useMemo(() => {
    return Array.from(new Set(records.map(r => r.college_name))).sort();
  }, [records]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(records.map(r => r.location))).sort();
  }, [records]);

  const branchOptions = useMemo(() => {
    return Array.from(new Set(records.map(r => r.branch))).sort();
  }, [records]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // College
      if (selectedCollege !== 'All' && r.college_name !== selectedCollege) return false;

      // Location
      if (selectedLocation !== 'All' && r.location !== selectedLocation) return false;

      // Branch
      if (selectedBranch !== 'All' && r.branch !== selectedBranch) return false;

      // Year
      if (selectedYear !== 'All' && r.year !== parseInt(selectedYear, 10)) return false;

      // Round
      if (selectedRound !== 'All' && r.round !== parseInt(selectedRound, 10)) return false;

      // Category
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Others') {
          if (customCategory.trim()) {
            const matchesCustom = r.category.toLowerCase().includes(customCategory.trim().toLowerCase());
            if (!matchesCustom) return false;
          }
        } else if (r.category !== selectedCategory) {
          return false;
        }
      }

      // Percentile Bounds
      if (r.cutoff_percentile < minPercentile || r.cutoff_percentile > maxPercentile) {
        return false;
      }

      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.college_name.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    records,
    selectedCollege,
    selectedLocation,
    selectedBranch,
    selectedYear,
    selectedRound,
    selectedCategory,
    customCategory,
    minPercentile,
    maxPercentile,
    searchQuery,
  ]);

  // Sorted
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [filteredRecords, sortField, sortAsc]);

  const handleSort = (field: keyof CutoffRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCollege('All');
    setSelectedLocation('All');
    setSelectedBranch('All');
    setSelectedYear('All');
    setSelectedRound('All');
    setSelectedCategory('All');
    setCustomCategory('');
    setMinPercentile(40);
    setMaxPercentile(100);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Heading */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Cutoff Search & Filter</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and inspect engineering admission cutoffs across Navi Mumbai institutes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="h-4 w-4 text-blue-600" />
            <span>Filter Parameters</span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {filteredRecords.length} matching records
          </span>
        </div>

        {/* Row 1: Search, College, Branch */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search by Keyword
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search college, branch, location..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">College</label>
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Colleges</option>
              {collegeOptions.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Engineering Branch
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Branches</option>
              {branchOptions.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Location, Admission Year, CAP Round, Category */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Navi Mumbai Locations</option>
              {locationOptions.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Years (2021–2025)</option>
              {VALID_YEARS.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">CAP Round</label>
            <select
              value={selectedRound}
              onChange={e => setSelectedRound(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Rounds</option>
              {VALID_ROUNDS.map(r => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              customCategory={customCategory}
              onCustomCategoryChange={setCustomCategory}
              allowAll={true}
            />
          </div>
        </div>

        {/* Row 3: Percentile Range Sliders */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Minimum Cutoff Percentile</span>
              <span className="font-bold text-blue-600">{minPercentile}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={0.5}
              value={minPercentile}
              onChange={e => setMinPercentile(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Maximum Cutoff Percentile</span>
              <span className="font-bold text-blue-600">{maxPercentile}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={0.5}
              value={maxPercentile}
              onChange={e => setMaxPercentile(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        {sortedRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              No cutoff records found for the selected filters.
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Try relaxing your cutoff percentile range or select "All" for category, year, or branch.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th
                    onClick={() => handleSort('college_name')}
                    className="cursor-pointer px-4 py-3 hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>College</span>
                      {sortField === 'college_name' &&
                        (sortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('location')}
                    className="cursor-pointer px-3 py-3 hover:text-slate-900"
                  >
                    Location
                  </th>
                  <th
                    onClick={() => handleSort('branch')}
                    className="cursor-pointer px-3 py-3 hover:text-slate-900"
                  >
                    Branch
                  </th>
                  <th
                    onClick={() => handleSort('year')}
                    className="cursor-pointer px-3 py-3 hover:text-slate-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Admission Year</span>
                      {sortField === 'year' &&
                        (sortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('round')}
                    className="cursor-pointer px-3 py-3 hover:text-slate-900"
                  >
                    CAP Round
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="cursor-pointer px-3 py-3 hover:text-slate-900"
                  >
                    Category
                  </th>
                  <th
                    onClick={() => handleSort('cutoff_percentile')}
                    className="cursor-pointer px-3 py-3 text-right hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Cutoff Percentile</span>
                      {sortField === 'cutoff_percentile' &&
                        (sortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('closing_rank')}
                    className="cursor-pointer px-4 py-3 text-right hover:text-slate-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Closing Rank</span>
                      {sortField === 'closing_rank' &&
                        (sortAsc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.slice(0, 100).map(r => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{r.college_name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {r.location}, Navi Mumbai
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.location}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {r.branch}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{r.year}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-slate-600">
                      Round {r.round}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/50">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      {r.cutoff_percentile.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-600">
                      #{r.closing_rank.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                        title="View Record Details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Detail Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>Cutoff Record Detail</span>
              <span>•</span>
              <span>{selectedRecord.location}</span>
            </div>

            <h3 className="mt-2 text-lg font-bold text-slate-900">
              {selectedRecord.college_name}
            </h3>
            <p className="text-xs text-slate-500">{selectedRecord.location}, Navi Mumbai</p>

            <div className="mt-5 grid grid-cols-2 gap-3.5 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Branch
                </span>
                <div className="mt-1 font-semibold text-slate-800">{selectedRecord.branch}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </span>
                <div className="mt-1 font-semibold text-blue-700">{selectedRecord.category}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Admission Year
                </span>
                <div className="mt-1 font-semibold text-slate-800">{selectedRecord.year}</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  CAP Round
                </span>
                <div className="mt-1 font-semibold text-slate-800">Round {selectedRecord.round}</div>
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Cutoff Percentile
                </span>
                <div className="mt-1 text-xl font-extrabold text-blue-900">
                  {selectedRecord.cutoff_percentile.toFixed(2)}%
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Closing State Merit Rank
                </span>
                <div className="mt-1 text-xl font-extrabold text-emerald-900">
                  #{selectedRecord.closing_rank.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
