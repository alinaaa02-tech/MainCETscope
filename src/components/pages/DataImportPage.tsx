import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { CutoffRecord } from '../../types';
import { parseCSVToObjects, RAW_CSV_HEADER } from '../../data/initialData';
import { cleanAndValidateDataset } from '../../services/dataCleaning';

interface DataImportPageProps {
  currentRecordCount: number;
  onAppendData: (records: CutoffRecord[]) => void;
  onReplaceData: (records: CutoffRecord[]) => void;
  onResetData: () => void;
}

const SAMPLE_CSV = `${RAW_CSV_HEADER}
101,Fr. C. Rodrigues Institute of Technology (FCRIT),Vashi,Computer Engineering,2025,1,Open,96.85,3200
102,SIES Graduate School of Technology,Nerul,Information Technology,2025,1,OBC,93.40,6850
103,Pillai College of Engineering (PCE),New Panvel,Computer Engineering,2025,2,SC,89.15,12400`;

export const DataImportPage: React.FC<DataImportPageProps> = ({
  currentRecordCount,
  onAppendData,
  onReplaceData,
  onResetData,
}) => {
  const [csvInput, setCsvInput] = useState('');
  const [previewResult, setPreviewResult] = useState<{
    cleanRecords: CutoffRecord[];
    invalidRows: Array<{ rowNumber: number; reason: string }>;
    totalParsed: number;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setCsvInput(text);
        processCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const processCSV = (text: string) => {
    try {
      const rawRows = parseCSVToObjects(text);
      const validation = cleanAndValidateDataset(rawRows);
      setPreviewResult({
        cleanRecords: validation.cleanRecords,
        invalidRows: validation.report.invalidRecords,
        totalParsed: rawRows.length,
      });
      setNotification(null);
    } catch (err) {
      console.error('Failed to parse CSV', err);
    }
  };

  const handleApplyAppend = () => {
    if (!previewResult || previewResult.cleanRecords.length === 0) return;
    onAppendData(previewResult.cleanRecords);
    setNotification(`Successfully added ${previewResult.cleanRecords.length} records to existing data.`);
    setPreviewResult(null);
    setCsvInput('');
  };

  const handleApplyReplace = () => {
    if (!previewResult || previewResult.cleanRecords.length === 0) return;
    onReplaceData(previewResult.cleanRecords);
    setNotification(`Successfully replaced dataset with ${previewResult.cleanRecords.length} valid records.`);
    setPreviewResult(null);
    setCsvInput('');
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mht_cet_sample_cutoff_format.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">CSV Data Import & Validation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Import new cutoff datasets, validate data integrity, and merge with current analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Dataset</span>
          </button>
        </div>
      </div>

      {/* Success/Action notification banner */}
      {notification && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Upload & Input Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload File Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Upload CSV File</h3>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample Template</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select any standard CSV file conforming to the admissions cutoff schema.
            </p>

            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
              <UploadCloud className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-semibold text-slate-700">Choose CSV File</span>
              <span className="text-xs text-slate-400 mt-1">.csv format supported</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Current system capacity: <strong>{currentRecordCount.toLocaleString()}</strong> active cutoffs
          </div>
        </div>

        {/* Paste Raw CSV text */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Or Paste CSV Text</h3>
              <button
                type="button"
                onClick={() => {
                  setCsvInput(SAMPLE_CSV);
                  processCSV(SAMPLE_CSV);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Insert Sample Format
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Paste comma-separated rows including the column header.
            </p>

            <textarea
              rows={6}
              value={csvInput}
              onChange={e => {
                setCsvInput(e.target.value);
                processCSV(e.target.value);
              }}
              placeholder={SAMPLE_CSV}
              className="w-full rounded-lg border border-slate-200 p-3 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={!csvInput.trim()}
              onClick={() => processCSV(csvInput)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
            >
              Analyze & Validate
            </button>
          </div>
        </div>
      </div>

      {/* Validation & Import Summary */}
      {previewResult && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Data Validation Report</h3>
              <p className="text-xs text-slate-500">
                Found {previewResult.cleanRecords.length} valid rows from {previewResult.totalParsed} parsed lines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={previewResult.cleanRecords.length === 0}
                onClick={handleApplyAppend}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add to Existing Data</span>
              </button>

              <button
                type="button"
                disabled={previewResult.cleanRecords.length === 0}
                onClick={handleApplyReplace}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Replace Existing Data</span>
              </button>
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Ready to Import</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-950">
                {previewResult.cleanRecords.length}
              </div>
              <div className="text-[11px] text-emerald-700">Validated records</div>
            </div>

            <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Rejected / Anomalous</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-950">
                {previewResult.invalidRows.length}
              </div>
              <div className="text-[11px] text-amber-700">Ignored for safety</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-700">Enforced Domain Rules</div>
              <ul className="mt-1 text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                <li>Years strictly 2021 – 2025</li>
                <li>Rounds strictly 1, 2, or 3</li>
                <li>Standard category mapping</li>
              </ul>
            </div>
          </div>

          {/* Invalid Rows Explanation (if any) */}
          {previewResult.invalidRows.length > 0 && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                Skipped Entries
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1 text-xs text-amber-800">
                {previewResult.invalidRows.map((inv, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-mono font-semibold">Row #{inv.rowNumber}:</span>
                    <span>{inv.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid preview sample table */}
          {previewResult.cleanRecords.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2">College</th>
                    <th className="px-3 py-2">Branch</th>
                    <th className="px-2 py-2">Admission Year</th>
                    <th className="px-2 py-2">CAP Round</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-3 py-2 text-right">Cutoff Percentile</th>
                    <th className="px-3 py-2 text-right">Closing Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewResult.cleanRecords.slice(0, 5).map(r => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 font-medium text-slate-800">{r.college_name}</td>
                      <td className="px-3 py-2">{r.branch}</td>
                      <td className="px-2 py-2">{r.year}</td>
                      <td className="px-2 py-2">Round {r.round}</td>
                      <td className="px-2 py-2">{r.category}</td>
                      <td className="px-3 py-2 text-right font-bold">{r.cutoff_percentile}%</td>
                      <td className="px-3 py-2 text-right font-mono">#{r.closing_rank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
