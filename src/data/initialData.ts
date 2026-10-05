import { CutoffRecord } from '../types';
import { cleanAndValidateDataset } from '../services/dataCleaning';

export const RAW_CSV_HEADER = 'college_id,college_name,location,branch,year,round,category,cutoff_percentile,closing_rank';

export function parseCSVToObjects(csvText: string): Array<Record<string, string>> {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle commas inside quotes if any, or standard split
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = '';
    
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    if (values.length >= headers.length) {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      rows.push(obj);
    }
  }

  return rows;
}

// Generate the complete benchmark synthetic dataset for 2021-2025
export function getInitialDataset(): CutoffRecord[] {
  const colleges = [
    { id: 101, name: 'Fr. C. Rodrigues Institute of Technology (FCRIT)', loc: 'Vashi', basePercentile: 96.5 },
    { id: 102, name: 'SIES Graduate School of Technology', loc: 'Nerul', basePercentile: 94.8 },
    { id: 103, name: 'Pillai College of Engineering (PCE)', loc: 'New Panvel', basePercentile: 93.0 },
    { id: 104, name: 'Terna Engineering College', loc: 'Nerul', basePercentile: 91.5 },
    { id: 105, name: 'Bharati Vidyapeeth College of Engineering (BVCOE)', loc: 'Belapur', basePercentile: 91.0 },
    { id: 106, name: 'Datta Meghe College of Engineering (DMCE)', loc: 'Airoli', basePercentile: 92.2 },
    { id: 107, name: 'Saraswati College of Engineering (SCOE)', loc: 'Kharghar', basePercentile: 88.0 }
  ];

  const branchOffsets: Record<string, number> = {
    'Computer Engineering': 0.0,
    'Information Technology': -1.8,
    'Electronics & Telecommunication': -9.2,
    'Mechanical Engineering': -24.5,
    'Civil Engineering': -30.0,
    'Automobile Engineering': -35.5
  };

  const categoryOffsets: Record<string, number> = {
    'Open': 0.0,
    'OBC': -2.0,
    'NT': -2.8,
    'SC': -4.5,
    'ST': -6.0,
    'Others': -3.2
  };

  const yearTrendOffsets: Record<number, number> = {
    2021: -1.2,
    2022: -0.6,
    2023: 0.0,
    2024: 0.6,
    2025: 1.1
  };

  const roundOffsets: Record<number, number> = {
    1: 0.0,
    2: -0.6,
    3: -1.2
  };

  const generatedRows: Array<Record<string, any>> = [];

  colleges.forEach(col => {
    // Determine branches offered by college
    const branches = [
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication',
      'Mechanical Engineering',
      'Civil Engineering',
      'Automobile Engineering'
    ];

    [2021, 2022, 2023, 2024, 2025].forEach(year => {
      [1, 2, 3].forEach(round => {
        ['Open', 'OBC', 'NT', 'SC', 'ST', 'Others'].forEach(category => {
          branches.forEach(branch => {
            const base = col.basePercentile;
            const bOffset = branchOffsets[branch] || -10;
            const cOffset = categoryOffsets[category] || -2;
            const yOffset = yearTrendOffsets[year] || 0;
            const rOffset = roundOffsets[round] || 0;

            // Small deterministic variance
            const variance = ((col.id * 17 + year * 7 + round * 13) % 20 - 10) / 50;
            let finalPercentile = Math.max(40.0, Math.min(99.5, base + bOffset + cOffset + yOffset + rOffset + variance));
            finalPercentile = Number(finalPercentile.toFixed(2));

            // Approximate closing rank mapped mathematically from percentile:
            // Top percentiles (98+) have low ranks (1,000-4,000); lower percentiles (50-70) have higher ranks (40,000-80,000)
            const approxTotalCandidates = 140000;
            const rawRank = Math.round((1 - finalPercentile / 100) * approxTotalCandidates);
            const closingRank = Math.max(500, Math.round(rawRank / 50) * 50);

            generatedRows.push({
              college_id: col.id,
              college_name: col.name,
              location: col.loc,
              branch,
              year,
              round,
              category,
              cutoff_percentile: finalPercentile,
              closing_rank: closingRank
            });
          });
        });
      });
    });
  });

  const { cleanRecords } = cleanAndValidateDataset(generatedRows);
  return cleanRecords;
}

export function exportRecordsToCSV(records: CutoffRecord[]): string {
  const headers = [
    'college_id',
    'college_name',
    'location',
    'branch',
    'year',
    'round',
    'category',
    'cutoff_percentile',
    'closing_rank'
  ];

  const rows = records.map(r => [
    r.college_id,
    `"${r.college_name.replace(/"/g, '""')}"`,
    `"${r.location.replace(/"/g, '""')}"`,
    `"${r.branch.replace(/"/g, '""')}"`,
    r.year,
    r.round,
    `"${r.category.replace(/"/g, '""')}"`,
    r.cutoff_percentile,
    r.closing_rank
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
