import { CutoffRecord, DataQualityReport, VALID_YEARS, VALID_ROUNDS } from '../types';

export function normalizeCategory(rawCategory: string): string {
  if (!rawCategory) return 'Open';
  const clean = rawCategory.trim();
  const lower = clean.toLowerCase();

  if (lower === 'gopen' || lower === 'open' || lower === 'g-o-p-e-n' || lower === 'gen' || lower === 'general') {
    return 'Open';
  }
  if (lower === 'gobch' || lower === 'gobc' || lower === 'obc') {
    return 'OBC';
  }
  if (lower === 'gsch' || lower === 'gsc' || lower === 'sc') {
    return 'SC';
  }
  if (lower === 'gsth' || lower === 'gst' || lower === 'st') {
    return 'ST';
  }
  if (lower.startsWith('gnt') || lower === 'nt' || lower === 'vjnt' || lower === 'nt-1' || lower === 'nt-2') {
    return 'NT';
  }
  if (lower === 'others' || lower === 'other') {
    return 'Others';
  }

  // Strip leading 'G' or 'g' if present on standard abbreviations
  if (clean.length > 1 && (clean.startsWith('G') || clean.startsWith('g')) && /^[A-Z]+$/.test(clean)) {
    const stripped = clean.substring(1);
    if (stripped === 'OPEN') return 'Open';
    return stripped;
  }

  return clean;
}

export function cleanAndValidateDataset(
  rawRows: Array<Record<string, any>>
): { cleanRecords: CutoffRecord[]; report: DataQualityReport } {
  let totalRows = rawRows.length;
  let missingValues = 0;
  let invalidRecords = 0;
  let removedDuplicates = 0;

  const validRecordsMap = new Map<string, CutoffRecord>();

  rawRows.forEach((row, index) => {
    // Check required fields presence
    if (
      row.college_name == null ||
      row.branch == null ||
      row.year == null ||
      row.round == null ||
      row.cutoff_percentile == null ||
      row.closing_rank == null
    ) {
      missingValues++;
      return;
    }

    const college_name = String(row.college_name).trim();
    const branch = String(row.branch).trim();
    const location = row.location ? String(row.location).trim() : 'Navi Mumbai';

    if (!college_name || !branch) {
      missingValues++;
      return;
    }

    // Strict year validation
    const parsedYear = parseInt(String(row.year).trim(), 10);
    if (isNaN(parsedYear) || !VALID_YEARS.includes(parsedYear as any)) {
      invalidRecords++;
      return;
    }

    // Strict round validation
    let parsedRound = parseInt(String(row.round).trim().replace(/round\s*/i, ''), 10);
    if (isNaN(parsedRound) || !VALID_ROUNDS.includes(parsedRound as any)) {
      invalidRecords++;
      return;
    }

    // Numeric cutoff_percentile
    const parsedPercentile = parseFloat(String(row.cutoff_percentile).trim());
    if (isNaN(parsedPercentile) || parsedPercentile < 0 || parsedPercentile > 100) {
      invalidRecords++;
      return;
    }

    // Numeric closing_rank
    const parsedRank = parseInt(String(row.closing_rank).trim(), 10);
    if (isNaN(parsedRank) || parsedRank <= 0) {
      invalidRecords++;
      return;
    }

    // College ID
    const college_id = parseInt(String(row.college_id || '101').trim(), 10) || 101;

    // Standardize Category
    const category = normalizeCategory(String(row.category || 'Open'));

    // Unique compound key for deduplication
    const dedupKey = `${college_id}-${branch.toLowerCase()}-${parsedYear}-${parsedRound}-${category.toLowerCase()}`;

    if (validRecordsMap.has(dedupKey)) {
      removedDuplicates++;
      // Keep the existing or latest
      return;
    }

    const record: CutoffRecord = {
      id: row.id ? String(row.id) : `rec_${college_id}_${parsedYear}_${parsedRound}_${index}`,
      college_id,
      college_name,
      location,
      branch,
      year: parsedYear as any,
      round: parsedRound as any,
      category,
      cutoff_percentile: Number(parsedPercentile.toFixed(2)),
      closing_rank: parsedRank
    };

    validRecordsMap.set(dedupKey, record);
  });

  const cleanRecords = Array.from(validRecordsMap.values());

  return {
    cleanRecords,
    report: {
      totalRows,
      validRows: cleanRecords.length,
      removedDuplicates,
      missingValues,
      invalidRecords
    }
  };
}
