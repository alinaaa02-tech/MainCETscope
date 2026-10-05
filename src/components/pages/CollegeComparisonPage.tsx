import React, { useState, useMemo } from 'react';
import { Scale, ArrowDownUp, CheckSquare, Square, Info } from 'lucide-react';
import { CutoffRecord, VALID_YEARS, VALID_ROUNDS, ValidYear, ValidRound } from '../../types';
import { CategoryFilter } from '../common/CategoryFilter';
import { InteractiveBarChart } from '../charts/InteractiveCharts';

interface CollegeComparisonPageProps {
  records: CutoffRecord[];
}

export const CollegeComparisonPage: React.FC<CollegeComparisonPageProps> = ({ records }) => {
  // Required Filter States
  const [selectedYear, setSelectedYear] = useState<ValidYear>(2025);
  const [selectedRound, setSelectedRound] = useState<ValidRound>(1);
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Engineering');
  const [selectedCategory, setSelectedCategory] = useState<string>('Open');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'highest-cutoff' | 'lowest-rank'>('highest-cutoff');

  // Branch list strictly from available records
  const availableBranches = useMemo(() => {
    return Array.from(new Set(records.map(r => r.branch))).sort();
  }, [records]);

  // College list
  const allColleges = useMemo(() => {
    return Array.from(new Set(records.map(r => r.college_name))).sort();
  }, [records]);

  // Filter logic strictly using database columns: year, round, branch, category
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (r.year !== Number(selectedYear)) return false;
      if (r.round !== Number(selectedRound)) return false;
      if (r.branch !== selectedBranch) return false;

      // Category matching
      if (selectedCategory === 'Others') {
        if (customCategory.trim()) {
          if (!r.category.toLowerCase().includes(customCategory.trim().toLowerCase())) {
            return false;
          }
        }
      } else {
        if (r.category !== selectedCategory) return false;
      }

      // College selection filter (if any specific selected)
      if (selectedColleges.length > 0 && !selectedColleges.includes(r.college_name)) {
        return false;
      }

      return true;
    });
  }, [
    records,
    selectedYear,
    selectedRound,
    selectedBranch,
    selectedCategory,
    customCategory,
    selectedColleges,
  ]);

  // Sorted records
  const comparisonList = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (sortOrder === 'highest-cutoff') {
        return b.cutoff_percentile - a.cutoff_percentile;
      }
      return a.closing_rank - b.closing_rank;
    });
  }, [filteredRecords, sortOrder]);

  // Chart 1: Bar chart of cutoff percentile by college
  const cutoffBarData = useMemo(() => {
    return comparisonList.map(item => ({
      label: item.college_name.split('(')[0].trim(),
      value: item.cutoff_percentile,
      secondaryLabel: `Merit Rank: #${item.closing_rank.toLocaleString()}`,
    }));
  }, [comparisonList]);

  // Chart 2: Bar chart of closing rank by college
  const rankBarData = useMemo(() => {
    return comparisonList.map(item => ({
      label: item.college_name.split('(')[0].trim(),
      value: item.closing_rank,
      color: '#0d9488',
      secondaryLabel: `Cutoff: ${item.cutoff_percentile}%`,
    }));
  }, [comparisonList]);

  const toggleCollegeSelection = (collegeName: string) => {
    if (selectedColleges.includes(collegeName)) {
      setSelectedColleges(selectedColleges.filter(c => c !== collegeName));
    } else {
      setSelectedColleges([...selectedColleges, collegeName]);
    }
  };

  const handleSelectAllColleges = () => {
    if (selectedColleges.length === allColleges.length) {
      setSelectedColleges([]);
    } else {
      setSelectedColleges([...allColleges]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">College Comparison</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Side-by-side cutoff benchmarks and rank competitiveness across Navi Mumbai engineering colleges.
        </p>
      </div>

      {/* Control Panel / Filter Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Scale className="h-4 w-4 text-blue-600" />
            <span>Comparison Parameters</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSortOrder(
                  sortOrder === 'highest-cutoff' ? 'lowest-rank' : 'highest-cutoff'
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Sort: {sortOrder === 'highest-cutoff' ? 'Highest Cutoff' : 'Lowest Closing Rank'}
              </span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Admission Year Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admission Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value) as ValidYear)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {VALID_YEARS.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* CAP Round Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">CAP Round</label>
            <select
              value={selectedRound}
              onChange={e => setSelectedRound(Number(e.target.value) as ValidRound)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {VALID_ROUNDS.map(r => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Engineering Branch
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {availableBranches.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              customCategory={customCategory}
              onCustomCategoryChange={setCustomCategory}
              allowAll={false}
            />
          </div>
        </div>

        {/* College Multi-Selector */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Select Colleges to Compare ({selectedColleges.length === 0 ? 'All 7' : selectedColleges.length})
            </label>
            <button
              type="button"
              onClick={handleSelectAllColleges}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              {selectedColleges.length === allColleges.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {allColleges.map(cName => {
              const isChecked =
                selectedColleges.length === 0 || selectedColleges.includes(cName);
              return (
                <button
                  key={cName}
                  type="button"
                  onClick={() => toggleCollegeSelection(cName)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                    isChecked
                      ? 'border-blue-300 bg-blue-50/80 text-blue-900 font-medium'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  ) : (
                    <Square className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>{cName.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Competitiveness Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Higher cutoff percentile generally indicates greater competitiveness in this
          demonstration dataset. This tool compares numerical thresholds based on historical-style
          records and does not rank colleges officially.
        </p>
      </div>

      {/* Empty State vs Results */}
      {comparisonList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Scale className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            No cutoff records found for the selected filters.
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Please select a different admission year (e.g. 2024 or 2025) or switch the engineering
            branch.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InteractiveBarChart
              data={cutoffBarData}
              title={`Cutoff Percentile Comparison (${selectedBranch} - ${selectedYear} Round ${selectedRound})`}
              yAxisLabel="Cutoff Percentile (%)"
              valueSuffix="%"
            />

            <InteractiveBarChart
              data={rankBarData}
              title={`Closing Rank Comparison (${selectedBranch} - ${selectedYear} Round ${selectedRound})`}
              yAxisLabel="Closing State Merit Rank"
              isRank={true}
            />
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Side-by-Side Comparison Metrics</h4>
              <span className="text-xs text-slate-500">{comparisonList.length} Institutes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">College</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Branch</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3 text-right">Cutoff Percentile</th>
                    <th className="px-4 py-3 text-right">Closing Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {idx + 1}
                          </span>
                          <span>{item.college_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">{item.location}</td>
                      <td className="px-3 py-3 text-xs font-medium text-slate-700">
                        {item.branch}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 font-semibold border border-blue-200/50">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-extrabold text-blue-700">
                        {item.cutoff_percentile.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-700">
                        #{item.closing_rank.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
