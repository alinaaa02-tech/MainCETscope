import React, { useMemo } from 'react';
import {
  Building2,
  GitFork,
  Layers,
  Sparkles,
  Award,
  BarChart3,
  Activity,
  TrendingDown,
  Hash,
  Scale,
} from 'lucide-react';
import { CutoffRecord } from '../../types';
import { calculateStatistics, groupByField, generateDatasetInsights } from '../../services/statsEngine';
import {
  InteractiveBarChart,
  InteractiveLineChart,
  InteractiveScatterPlot,
} from '../charts/InteractiveCharts';

interface DashboardPageProps {
  records: CutoffRecord[];
  onNavigateToTab: (tabId: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ records, onNavigateToTab }) => {
  // Summary Metrics calculated dynamically from records
  const summary = useMemo(() => {
    const totalRecords = records.length;
    const colleges = new Set(records.map(r => r.college_name));
    const branches = new Set(records.map(r => r.branch));
    const years = Array.from(new Set(records.map(r => r.year))).sort((a, b) => Number(a) - Number(b));
    const rounds = Array.from(new Set(records.map(r => r.round))).sort((a, b) => Number(a) - Number(b));

    const cutoffStats = calculateStatistics(records.map(r => r.cutoff_percentile));
    const rankStats = calculateStatistics(records.map(r => r.closing_rank));

    const yearsRange = years.length > 0 ? `${years[0]} – ${years[years.length - 1]}` : '2021 – 2025';

    return {
      totalRecords,
      totalColleges: colleges.size,
      totalBranches: branches.size,
      totalYears: years.length,
      years,
      yearsRange,
      roundsCount: rounds.length,
      cutoffStats,
      rankStats,
    };
  }, [records]);

  // Chart A: Year-wise avg cutoff percentile (2021-2025)
  const yearCutoffData = useMemo(() => {
    const grouped = groupByField(records, r => r.year);
    return grouped
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map(g => ({
        label: String(g.key),
        value: g.avgCutoff,
      }));
  }, [records]);

  // Chart B: Year-wise avg closing rank
  const yearRankData = useMemo(() => {
    const grouped = groupByField(records, r => r.year);
    return grouped
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map(g => ({
        label: String(g.key),
        value: g.avgClosingRank,
      }));
  }, [records]);

  // Chart C: Branch-wise avg cutoff percentile
  const branchCutoffData = useMemo(() => {
    const grouped = groupByField(records, r => r.branch);
    return grouped
      .sort((a, b) => b.avgCutoff - a.avgCutoff)
      .map(g => ({
        label: g.label,
        value: g.avgCutoff,
        color: g.label.toLowerCase().includes('computer')
          ? '#2563eb'
          : g.label.toLowerCase().includes('information')
          ? '#0284c7'
          : '#64748b',
      }));
  }, [records]);

  // Chart D: College-wise cutoff comparison
  const collegeCutoffData = useMemo(() => {
    const grouped = groupByField(records, r => r.college_name);
    return grouped
      .sort((a, b) => b.avgCutoff - a.avgCutoff)
      .map(g => ({
        label: g.label.split('(')[0].trim(),
        value: g.avgCutoff,
      }));
  }, [records]);

  // Scatter data sample for rendering clarity
  const scatterData = useMemo(() => {
    return records.filter((_, idx) => idx % 3 === 0);
  }, [records]);

  // Automated Insights
  const insights = useMemo(() => generateDatasetInsights(records), [records]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Admissions Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive cutoff analytics and merit distribution across Navi Mumbai engineering institutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('comparison')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Compare Colleges</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics: Cutoff Percentile, Closing Rank, Dataset Scope & Institutions */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Average Cutoff Percentile */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/50 via-white to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Average Cutoff Percentile
            </span>
            <div className="rounded-lg bg-blue-100/80 p-2 text-blue-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {summary.cutoffStats.mean.toFixed(2)}%
            </span>
            <span className="text-xs font-semibold text-blue-600">Mean Score</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Median: <strong className="text-slate-700">{summary.cutoffStats.median.toFixed(2)}%</strong></span>
            <span>Std Dev: <strong className="text-slate-700">±{summary.cutoffStats.stdDev}%</strong></span>
          </div>
        </div>

        {/* Metric 2: Average Closing Rank */}
        <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-linear-to-br from-teal-50/50 via-white to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              Average Closing Rank
            </span>
            <div className="rounded-lg bg-teal-100/80 p-2 text-teal-700">
              <Hash className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              #{Math.round(summary.rankStats.mean).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-teal-600">State Merit</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Median: <strong className="text-slate-700">#{Math.round(summary.rankStats.median).toLocaleString()}</strong></span>
            <span>Top Rank: <strong className="text-slate-700">#{summary.rankStats.min.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Metric 3: Total Dataset Scope */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/50 via-white to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Dataset Coverage
            </span>
            <div className="rounded-lg bg-indigo-100/80 p-2 text-indigo-700">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {summary.totalRecords.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-indigo-600">Cutoff Entries</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Years: <strong className="text-slate-700">{summary.yearsRange}</strong></span>
            <span>Rounds: <strong className="text-slate-700">1 – {summary.roundsCount}</strong></span>
          </div>
        </div>

        {/* Metric 4: Institutional Coverage */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-br from-slate-50/50 via-white to-white p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Regional Coverage
            </span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {summary.totalColleges} Colleges
            </span>
            <span className="text-xs font-semibold text-slate-500">Navi Mumbai</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Branches: <strong className="text-slate-700">{summary.totalBranches} Disciplines</strong></span>
            <span>Region: <strong className="text-slate-700">Navi Mumbai</strong></span>
          </div>
        </div>
      </div>

      {/* Secondary Benchmark Extremes */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Award className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Highest Cutoff</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-purple-700">
            {summary.cutoffStats.max.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400">Peak threshold</div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Lowest Cutoff</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-rose-700">
            {summary.cutoffStats.min.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-400">Entry threshold</div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Top Closing Rank</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 font-mono">
            #{summary.rankStats.min.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Most competitive merit</div>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Scale className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Entry Closing Rank</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-slate-900 font-mono">
            #{summary.rankStats.max.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Broadest merit threshold</div>
        </div>
      </div>

      {/* Automated Analytical Insights Section */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm mb-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Automated Trend Insights</span>
        </div>
        <ul className="space-y-1.5 text-xs text-blue-950/80">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Row 1 Charts: Year-wise Cutoff Percentile vs Closing Rank */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InteractiveLineChart
          data={yearCutoffData}
          title="Year-wise Average Cutoff Percentile (2021 – 2025)"
          yAxisLabel="Cutoff Percentile (%)"
          color="#2563eb"
          valueSuffix="%"
        />

        <InteractiveLineChart
          data={yearRankData}
          title="Year-wise Average Closing Merit Rank"
          yAxisLabel="Closing Rank (Merit)"
          color="#0d9488"
          isRank={true}
        />
      </div>

      {/* Row 2 Charts: Branch popularity & College-wise cutoff */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InteractiveBarChart
          data={branchCutoffData}
          title="Branch-wise Average Cutoff Percentile"
          yAxisLabel="Average Cutoff (%)"
          valueSuffix="%"
        />

        <InteractiveBarChart
          data={collegeCutoffData}
          title="College-wise Cutoff Comparison"
          yAxisLabel="Average Cutoff (%)"
          valueSuffix="%"
        />
      </div>

      {/* Row 3: Cutoff Percentile vs Closing Rank Correlation Scatter Plot */}
      <div>
        <InteractiveScatterPlot data={scatterData} />
      </div>

      {/* Statistical Summary Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h4 className="text-sm font-semibold text-slate-900">
            Statistical Analysis Summary ({summary.yearsRange})
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            Sample Size: {summary.totalRecords.toLocaleString()} Records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Mean Cutoff</div>
            <div className="text-base font-bold text-slate-900 mt-1">{summary.cutoffStats.mean.toFixed(2)}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Average percentile</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Median Cutoff</div>
            <div className="text-base font-bold text-slate-900 mt-1">{summary.cutoffStats.median.toFixed(2)}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">50th percentile rank</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cutoff Std Dev</div>
            <div className="text-base font-bold text-slate-900 mt-1">±{summary.cutoffStats.stdDev}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Score dispersion</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cutoff Range</div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {summary.cutoffStats.min.toFixed(1)}% – {summary.cutoffStats.max.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Min to max spread</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Mean Closing Rank</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              #{Math.round(summary.rankStats.mean).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Average state merit</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Median Closing Rank</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              #{Math.round(summary.rankStats.median).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Median merit rank</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Rank Std Dev</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              ±{Math.round(summary.rankStats.stdDev).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Rank dispersion</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Closing Rank Range</div>
            <div className="text-base font-bold text-slate-900 font-mono mt-1">
              #{summary.rankStats.min.toLocaleString()} – #{summary.rankStats.max.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Merit rank bounds</div>
          </div>
        </div>
      </div>
    </div>
  );
};
