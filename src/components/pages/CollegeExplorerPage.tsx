import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  GitFork,
  ArrowRight,
  BarChart3,
  Calendar,
  Layers,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { CutoffRecord } from '../../types';
import { calculateStatistics, groupByField } from '../../services/statsEngine';
import { InteractiveBarChart, InteractiveLineChart } from '../charts/InteractiveCharts';

interface CollegeExplorerPageProps {
  records: CutoffRecord[];
  onNavigateToComparison: (collegeName?: string) => void;
}

export const CollegeExplorerPage: React.FC<CollegeExplorerPageProps> = ({
  records,
  onNavigateToComparison,
}) => {
  const [selectedCollegeName, setSelectedCollegeName] = useState<string | null>(null);

  // Group records by college
  const collegeSummaries = useMemo(() => {
    const collegesMap = new Map<string, CutoffRecord[]>();
    records.forEach(r => {
      if (!collegesMap.has(r.college_name)) {
        collegesMap.set(r.college_name, []);
      }
      collegesMap.get(r.college_name)!.push(r);
    });

    return Array.from(collegesMap.entries()).map(([college_name, list]) => {
      const first = list[0];
      const branches = Array.from(new Set(list.map(l => l.branch)));
      const years = Array.from(new Set(list.map(l => l.year))).sort();
      const latestYear = years[years.length - 1];
      const stats = calculateStatistics(list.map(l => l.cutoff_percentile));

      return {
        college_id: first.college_id,
        college_name,
        location: first.location,
        branches,
        latestYear,
        years,
        highestCutoff: stats.max,
        lowestCutoff: stats.min,
        averageCutoff: stats.mean,
        totalCutoffs: list.length,
        records: list,
      };
    });
  }, [records]);

  // If a college is selected, render its detailed view
  const activeCollege = useMemo(() => {
    if (!selectedCollegeName) return null;
    return collegeSummaries.find(c => c.college_name === selectedCollegeName) || null;
  }, [selectedCollegeName, collegeSummaries]);

  // Branch comparison chart for active college
  const activeBranchData = useMemo(() => {
    if (!activeCollege) return [];
    const grouped = groupByField(activeCollege.records, r => r.branch);
    return grouped
      .sort((a, b) => b.avgCutoff - a.avgCutoff)
      .map(g => ({
        label: g.label,
        value: g.avgCutoff,
        secondaryLabel: `Avg Rank: #${g.avgClosingRank.toLocaleString()}`,
      }));
  }, [activeCollege]);

  // 5-year cutoff trend for active college
  const activeYearTrend = useMemo(() => {
    if (!activeCollege) return [];
    const grouped = groupByField(activeCollege.records, r => r.year);
    return grouped
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map(g => ({
        label: g.key,
        value: g.avgCutoff,
      }));
  }, [activeCollege]);

  // 5-year closing rank trend for active college
  const activeRankTrend = useMemo(() => {
    if (!activeCollege) return [];
    const grouped = groupByField(activeCollege.records, r => r.year);
    return grouped
      .sort((a, b) => Number(a.key) - Number(b.key))
      .map(g => ({
        label: g.key,
        value: g.avgClosingRank,
      }));
  }, [activeCollege]);

  if (activeCollege) {
    return (
      <div className="space-y-6 pb-12">
        {/* Back Button & Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedCollegeName(null)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              title="Back to All Colleges"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {activeCollege.college_name}
                </h2>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{activeCollege.location}, Navi Mumbai</span>
                <span>•</span>
                <span>Institute Code: {activeCollege.college_id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToComparison(activeCollege.college_name)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Compare College</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-xs text-slate-400 font-medium">Highest Cutoff</div>
            <div className="mt-1 text-xl font-extrabold text-blue-700">
              {activeCollege.highestCutoff}%
            </div>
            <div className="text-[11px] text-slate-400">Peak threshold</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-xs text-slate-400 font-medium">Lowest Cutoff</div>
            <div className="mt-1 text-xl font-extrabold text-slate-700">
              {activeCollege.lowestCutoff}%
            </div>
            <div className="text-[11px] text-slate-400">Entry threshold</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-xs text-slate-400 font-medium">Average Cutoff</div>
            <div className="mt-1 text-xl font-extrabold text-slate-900">
              {activeCollege.averageCutoff}%
            </div>
            <div className="text-[11px] text-slate-400">Overall institute average</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="text-xs text-slate-400 font-medium">Offered Programs</div>
            <div className="mt-1 text-xl font-extrabold text-slate-900">
              {activeCollege.branches.length}
            </div>
            <div className="text-[11px] text-slate-400">Engineering disciplines</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InteractiveBarChart
            data={activeBranchData}
            title="Branch Cutoff Thresholds in this Institute"
            yAxisLabel="Cutoff Percentile (%)"
            valueSuffix="%"
          />

          <InteractiveLineChart
            data={activeYearTrend}
            title="Institute Average Cutoff Trend (2021 – 2025)"
            yAxisLabel="Cutoff Percentile (%)"
            color="#2563eb"
            valueSuffix="%"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InteractiveLineChart
            data={activeRankTrend}
            title="Closing Merit Rank Trajectory"
            yAxisLabel="State Merit Rank"
            color="#0d9488"
            isRank={true}
          />

          {/* College Meta Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Program Catalog</h4>
              <p className="text-xs text-slate-500 mb-3">
                All degree specializations offered at this institute:
              </p>
              <div className="flex flex-wrap gap-2">
                {activeCollege.branches.map(b => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <GitFork className="h-3 w-3 text-slate-400" />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>Rounds Supported: <strong>1, 2, 3</strong></div>
              <div>Categories: <strong>Open, OBC, NT, SC, ST, Others</strong></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Navi Mumbai Engineering College Directory
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse comprehensive cutoff benchmarks and academic profiles across accredited institutes.
        </p>
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collegeSummaries.map(college => (
          <div
            key={college.college_id}
            onClick={() => setSelectedCollegeName(college.college_name)}
            className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Location and Tag */}
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 border border-blue-200/50">
                  Navi Mumbai
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {college.location}
                </span>
              </div>

              {/* College Name */}
              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {college.college_name}
              </h3>

              {/* Stats Snippet */}
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Highest Cutoff</span>
                  <div className="font-bold text-blue-700 text-sm">
                    {college.highestCutoff.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Lowest Cutoff</span>
                  <div className="font-bold text-slate-700 text-sm">
                    {college.lowestCutoff.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Branches Tags */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Available Branches ({college.branches.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {college.branches.slice(0, 3).map(b => (
                    <span
                      key={b}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {b.replace('Engineering', 'Engg')}
                    </span>
                  ))}
                  {college.branches.length > 3 && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                      +{college.branches.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
              <span>View Institute Analytics</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
