export interface CutoffRecord {
  id: string;
  college_id: number;
  college_name: string;
  location: string;
  branch: string;
  year: number; // 2021 | 2022 | 2023 | 2024 | 2025
  round: number; // 1 | 2 | 3
  category: string; // 'Open' | 'OBC' | 'NT' | 'SC' | 'ST' | 'Others' | custom
  cutoff_percentile: number;
  closing_rank: number;
}

export type ValidYear = 2021 | 2022 | 2023 | 2024 | 2025;
export type ValidRound = 1 | 2 | 3;
export type StandardCategory = 'Open' | 'OBC' | 'NT' | 'SC' | 'ST' | 'Others';

export const VALID_YEARS: ValidYear[] = [2021, 2022, 2023, 2024, 2025];
export const VALID_ROUNDS: ValidRound[] = [1, 2, 3];
export const STANDARD_CATEGORIES: StandardCategory[] = ['Open', 'OBC', 'NT', 'SC', 'ST', 'Others'];

export const STANDARD_BRANCHES: string[] = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Automobile Engineering'
];

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  removedDuplicates: number;
  missingValues: number;
  invalidRecords: number;
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
}

export type PageId =
  | 'dashboard'
  | 'search'
  | 'comparison'
  | 'trends'
  | 'explorer'
  | 'table'
  | 'import'
  | 'about';
