import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { CutoffRecord, VALID_ROUNDS, ValidRound } from '../../types';
import { CategoryFilter } from '../common/CategoryFilter';
import { InteractiveLineChart } from '../charts/InteractiveCharts';

interface TrendAnalysisPageProps {
  records: CutoffRecord[];
}

export const TrendAnalysisPage: React.FC<TrendAnalysisPageProps> = ({ records }) => {
  // Available colleges & branches
  const collegeOptions = useMemo(() => {
    return Array.from(new Set(records.map(r => r.college_name))).sort();
  }, [records]);

  const branchOptions = useMemo(() => {
    return Array.from(new Set(records.map(r => r.branch))).sort();
  }, [records]);

  // Selected filters
  const [selectedCollege, setSelectedCollege] = useState<string>(
    collegeOptions[0] || 'Fr. C. Rodrigues Institute of Technology (FCRIT)'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>('Computer Engineering');
  const [selectedCategory, setSelectedCategory] = useState<string>('Open');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [selectedRound, setSelectedRound] = useState<ValidRound>(1);

  // Filtered multi-year records for this specific combination
  const trendRecords = useMemo(() => {
    return records
      .filter(r => {
        if (r.college_name !== selectedCollege) return false;
        if (r.branch !== selectedBranch) return false;
        if (r.round !== Number(selectedRound)) return false;

        if (selectedCategory === 'Others') {
          if (customCategory.trim()) {
            if (!r.category.toLowerCase().includes(customCategory.trim().toLowerCase())) {
              return false;
            }
          }
        } else {
          if (r.category !== selectedCategory) return false;
        }

        return true;
      })
      .sort((a, b) => a.year - b.year);
  }, [records, selectedCollege, selectedBranch, selectedCategory, customCategory, selectedRound]);

  // Chart data: Cutoff Percentile Trend
  const percentileLineData = useMemo(() => {
    return trendRecords.map(r => ({
      label: r.year,
      value: r.cutoff_percentile,
    }));
  }, [trendRecords]);

  // Chart data: Closing Rank Trend
  const rankLineData = useMemo(() => {
    return trendRecords.map(r => ({
      label: r.year,
      value: r.closing_rank,
    }));
  }, [trendRecords]);

  // Table rows with delta calculation
  const tableDataWithDeltas = useMemo(() => {
    return trendRecords.map((item, index) => {
      if (index === 0) {
        return {
          ...item,
          cutoffDelta: 0,
          rankDelta: 0,
          percentChange: 0,
        };
      }
      const prev = trendRecords[index - 1];
      const cutoffDelta = Number((item.cutoff_percentile - prev.cutoff_percentile).toFixed(2));
      const rankDelta = item.closing_rank - prev.closing_rank;
      const percentChange = Number(((cutoffDelta / prev.cutoff_percentile) * 100).toFixed(2));
      return {
        ...item,
        cutoffDelta,
        rankDelta,
        percentChange,
      };
    });
  }, [trendRecords]);

  // Interpretation summary
  const interpretationText = useMemo(() => {
    if (trendRecords.length < 2) {
      return 'Insufficient consecutive years to calculate multi-year trajectory.';
    }
    const first = trendRecords[0];
    const last = trendRecords[trendRecords.length - 1];
    const diff = Number((last.cutoff_percentile - first.cutoff_percentile).toFixed(2));
    const rankDiff = last.closing_rank - first.closing_rank;

    const direction = diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'remained steady';
    const rankDir = rankDiff < 0 ? 'more competitive (lower merit rank)' : 'less competitive';

    return `Between ${first.year} and ${last.year}, the cutoff percentile ${direction} by ${Math.abs(
      diff
    )} percentile points for ${selectedBranch} in ${selectedCollege} under CAP Round ${selectedRound}. The corresponding closing rank became ${rankDir} by ${Math.abs(
      rankDiff
    ).toLocaleString()} ranks.`;
  }, [trendRecords, selectedBranch, selectedCollege, selectedRound]);

  return (
    <div className="space-y-6 pb-12">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Multi-Year Cutoff Trend Analysis
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track 5-year longitudinal percentile movements and State General Merit Rank fluctuations.
        </p>
      </div>

      {/* Filter Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select College
            </label>
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
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
              {branchOptions.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

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
      </div>

      {/* Empty State vs Charts */}
      {trendRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            No cutoff records found for the selected filters.
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Please adjust the college, branch, or round filters to view available historical trends.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InteractiveLineChart
              data={percentileLineData}
              title={`Cutoff Percentile Trend (${selectedYearRange(trendRecords)})`}
              yAxisLabel="Cutoff Percentile (%)"
              color="#2563eb"
              valueSuffix="%"
            />

            <InteractiveLineChart
              data={rankLineData}
              title={`Closing Merit Rank Trend (${selectedYearRange(trendRecords)})`}
              yAxisLabel="Closing State Merit Rank"
              color="#0d9488"
              isRank={true}
            />
          </div>

          {/* Simple Interpretation Box */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-950 mb-0.5">Trend Interpretation</div>
              <p>{interpretationText}</p>
            </div>
          </div>

          {/* Historical Delta Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Year-by-Year Cutoff & Merit Rank Progression
              </h4>
              <span className="text-xs text-slate-500">{trendRecords.length} recorded cycles</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Academic Year</th>
                    <th className="px-3 py-3">CAP Round</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3 text-right">Cutoff Percentile</th>
                    <th className="px-3 py-3 text-right">Percentile Delta</th>
                    <th className="px-4 py-3 text-right">Closing Rank</th>
                    <th className="px-4 py-3 text-right">Rank Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableDataWithDeltas.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-bold text-slate-900">{row.year}</td>
                      <td className="px-3 py-3 text-xs">Round {row.round}</td>
                      <td className="px-3 py-3 text-xs">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700 font-medium">
                          {row.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900">
                        {row.cutoff_percentile.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 text-right text-xs">
                        {idx === 0 ? (
                          <span className="text-slate-400 font-medium">— Baseline</span>
                        ) : row.cutoffDelta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
                            <TrendingUp className="h-3 w-3" />+{row.cutoffDelta}%
                          </span>
                        ) : row.cutoffDelta < 0 ? (
                          <span className="inline-flex items-center gap-0.5 font-semibold text-rose-600">
                            <TrendingDown className="h-3 w-3" />
                            {row.cutoffDelta}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-400">
                            <Minus className="h-3 w-3" /> 0.0%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-700">
                        #{row.closing_rank.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {idx === 0 ? (
                          <span className="text-slate-400 font-medium">— Baseline</span>
                        ) : row.rankDelta < 0 ? (
                          <span className="font-medium text-emerald-600">
                            ▲ {Math.abs(row.rankDelta).toLocaleString()} (Higher rank)
                          </span>
                        ) : row.rankDelta > 0 ? (
                          <span className="font-medium text-rose-600">
                            ▼ {row.rankDelta.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">No shift</span>
                        )}
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

function selectedYearRange(recs: CutoffRecord[]): string {
  if (recs.length === 0) return '';
  if (recs.length === 1) return String(recs[0].year);
  return `${recs[0].year} – ${recs[recs.length - 1].year}`;
}
