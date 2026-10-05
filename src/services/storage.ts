import { CutoffRecord } from '../types';
import { getInitialDataset } from '../data/initialData';
import { cleanAndValidateDataset } from './dataCleaning';

const STORAGE_KEY = 'cetscope_cutoff_records_v2';

export function loadSavedRecords(): CutoffRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 3780) {
        const { cleanRecords } = cleanAndValidateDataset(parsed);
        if (cleanRecords.length > 0) {
          return cleanRecords;
        }
      }
    }
  } catch (e) {
    console.error('Error reading localStorage records, resetting to default dataset', e);
  }

  // Initialize with the complete 2021-2025 benchmark dataset (3,780 records)
  const initial = getInitialDataset();
  saveRecords(initial);
  return initial;
}

export function saveRecords(records: CutoffRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save cutoff records to localStorage', e);
  }
}

export function appendRecords(existing: CutoffRecord[], incoming: CutoffRecord[]): CutoffRecord[] {
  const combined = [...existing, ...incoming];
  const { cleanRecords } = cleanAndValidateDataset(combined);
  saveRecords(cleanRecords);
  return cleanRecords;
}

export function replaceRecords(incoming: CutoffRecord[]): CutoffRecord[] {
  const { cleanRecords } = cleanAndValidateDataset(incoming);
  saveRecords(cleanRecords);
  return cleanRecords;
}

export function resetToDefaultDataset(): CutoffRecord[] {
  const initial = getInitialDataset();
  saveRecords(initial);
  return initial;
}
