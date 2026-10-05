import { CutoffRecord, StatisticalSummary } from '../types';

export function calculateStatistics(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const min = sorted[0];
  const max = sorted[count - 1];
  
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = Number((sum / count).toFixed(2));

  let median = 0;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  } else {
    median = Number(sorted[mid].toFixed(2));
  }

  // Sample Standard Deviation
  const variance = count > 1
    ? sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1)
    : 0;
  const stdDev = Number(Math.sqrt(variance).toFixed(2));

  return { mean, median, min, max, stdDev, count };
}

export interface GroupSummary {
  key: string | number;
  label: string;
  count: number;
  avgCutoff: number;
  avgClosingRank: number;
  minCutoff: number;
  maxCutoff: number;
}

export function groupByField(
  records: CutoffRecord[],
  keyExtractor: (r: CutoffRecord) => string | number,
  labelExtractor?: (r: CutoffRecord) => string
): GroupSummary[] {
  const groups = new Map<string | number, { cutoffs: number[]; ranks: number[]; label: string }>();

  records.forEach(r => {
    const key = keyExtractor(r);
    const label = labelExtractor ? labelExtractor(r) : String(key);
    if (!groups.has(key)) {
      groups.set(key, { cutoffs: [], ranks: [], label });
    }
    const g = groups.get(key)!;
    g.cutoffs.push(r.cutoff_percentile);
    g.ranks.push(r.closing_rank);
  });

  const result: GroupSummary[] = [];
  groups.forEach((data, key) => {
    const cutoffStats = calculateStatistics(data.cutoffs);
    const rankStats = calculateStatistics(data.ranks);
    result.push({
      key,
      label: data.label,
      count: data.cutoffs.length,
      avgCutoff: cutoffStats.mean,
      avgClosingRank: Math.round(rankStats.mean),
      minCutoff: cutoffStats.min,
      maxCutoff: cutoffStats.max
    });
  });

  return result;
}

export interface TrendAnalysisResult {
  year: number;
  cutoff_percentile: number;
  closing_rank: number;
  cutoffDelta?: number;
  rankDelta?: number;
  percentChange?: number;
}

export function calculateYearlyTrends(records: CutoffRecord[]): TrendAnalysisResult[] {
  const years = [2021, 2022, 2023, 2024, 2025];
  const results: TrendAnalysisResult[] = [];

  years.forEach(year => {
    const matched = records.filter(r => r.year === year);
    if (matched.length > 0) {
      const avgCutoff = calculateStatistics(matched.map(m => m.cutoff_percentile)).mean;
      const avgRank = Math.round(calculateStatistics(matched.map(m => m.closing_rank)).mean);
      results.push({
        year,
        cutoff_percentile: avgCutoff,
        closing_rank: avgRank
      });
    }
  });

  // Calculate delta step-by-step
  for (let i = 0; i < results.length; i++) {
    if (i > 0) {
      const prev = results[i - 1];
      const curr = results[i];
      curr.cutoffDelta = Number((curr.cutoff_percentile - prev.cutoff_percentile).toFixed(2));
      curr.rankDelta = curr.closing_rank - prev.closing_rank;
      curr.percentChange = prev.cutoff_percentile > 0
        ? Number(((curr.cutoffDelta / prev.cutoff_percentile) * 100).toFixed(2))
        : 0;
    }
  }

  return results;
}

export function generateDatasetInsights(records: CutoffRecord[]): string[] {
  if (records.length === 0) return ['No records available to generate insights.'];

  const insights: string[] = [];

  // 1. Branch comparison
  const csRecords = records.filter(r => r.branch.toLowerCase().includes('computer'));
  const mechRecords = records.filter(r => r.branch.toLowerCase().includes('mechanical'));
  if (csRecords.length > 0 && mechRecords.length > 0) {
    const csAvg = calculateStatistics(csRecords.map(r => r.cutoff_percentile)).mean;
    const mechAvg = calculateStatistics(mechRecords.map(r => r.cutoff_percentile)).mean;
    const diff = (csAvg - mechAvg).toFixed(2);
    insights.push(
      `Computer Engineering demonstrates higher cutoffs (average: ${csAvg}% percentile) compared to Mechanical Engineering (average: ${mechAvg}% percentile), reflecting a spread of ${diff} percentile points.`
    );
  }

  // 2. Year-over-year competition
  const records2021 = records.filter(r => r.year === 2021);
  const records2025 = records.filter(r => r.year === 2025);
  if (records2021.length > 0 && records2025.length > 0) {
    const avg2021 = calculateStatistics(records2021.map(r => r.cutoff_percentile)).mean;
    const avg2025 = calculateStatistics(records2025.map(r => r.cutoff_percentile)).mean;
    const diff = (avg2025 - avg2021).toFixed(2);
    const direction = Number(diff) >= 0 ? 'increased' : 'decreased';
    insights.push(
      `Overall cutoffs across Navi Mumbai institutions ${direction} by ${Math.abs(Number(diff))} percentile points between 2021 and 2025 across all recorded CAP rounds.`
    );
  }

  // 3. Round competitiveness
  const round1 = records.filter(r => r.round === 1);
  const round3 = records.filter(r => r.round === 3);
  if (round1.length > 0 && round3.length > 0) {
    const r1Avg = calculateStatistics(round1.map(r => r.cutoff_percentile)).mean;
    const r3Avg = calculateStatistics(round3.map(r => r.cutoff_percentile)).mean;
    insights.push(
      `CAP Round 1 maintains the most competitive threshold (average: ${r1Avg}% percentile), followed by adjustments through CAP Round 3 (average: ${r3Avg}% percentile).`
    );
  }

  return insights;
}
