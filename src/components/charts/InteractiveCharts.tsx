import React, { useState, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  Table2,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Activity,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';

// ==========================================
// CETSCOPE ACADEMIC COLOR PALETTE (Blue to Teal)
// ==========================================
export const CETSCOPE_PALETTE = [
  '#1d4ed8', // Academic Blue
  '#0284c7', // Slate Azure
  '#0d9488', // Deep Teal
  '#059669', // Emerald Teal
  '#2563eb', // Royal Blue
  '#0891b2', // Cyan Teal
  '#14b8a6', // Bright Teal
];

export const CETSCOPE_COLORS = {
  primaryBlue: '#1d4ed8',
  secondarySky: '#0284c7',
  primaryTeal: '#0d9488',
  lightTeal: '#14b8a6',
  axisLine: '#e2e8f0',
  textSecondary: '#64748b',
  textPrimary: '#0f172a',
  white: '#ffffff',
};

// ==========================================
// EXPORT UTILITIES (Slide PNG & CSV)
// ==========================================
function exportSvgToPng(svgElement: SVGSVGElement | null, filename: string) {
  if (!svgElement) return;
  try {
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 400;

    svgClone.setAttribute('width', `${width * 2}`);
    svgClone.setAttribute('height', `${height * 2}`);

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_presentation.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = url;
  } catch (err) {
    console.error('Error exporting chart image:', err);
  }
}

function exportDataToCsv(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ];
  const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 1. ACADEMIC INTERACTIVE BAR CHART
// ==========================================
export interface BarItem {
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number;
  secondaryLabel?: string;
}

interface BarChartProps {
  data: BarItem[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
  valueSuffix?: string;
  isRank?: boolean;
}

export const InteractiveBarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Benchmark Comparison',
  yAxisLabel,
  height = 290,
  valueSuffix = '%',
  isRank = false,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        <BarChart3 className="mb-2 h-7 w-7 text-slate-300" />
        <p className="font-medium text-slate-600">No chart records found</p>
        <p className="text-xs text-slate-400 mt-0.5">Please adjust the selected filters.</p>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const meanValue = values.reduce((sum, v) => sum + v, 0) / values.length;
  const maxValue = Math.max(...values, isRank ? 1000 : 100);
  const minValue = isRank ? 0 : Math.max(0, Math.floor(Math.min(...values) * 0.85));
  const range = maxValue - minValue || 1;

  const chartPadding = { top: 24, right: 24, bottom: 62, left: 56 };
  const viewBoxWidth = 620;
  const viewBoxHeight = height;
  const graphWidth = viewBoxWidth - chartPadding.left - chartPadding.right;
  const graphHeight = viewBoxHeight - chartPadding.top - chartPadding.bottom;

  const barWidth = Math.min(48, Math.max(16, (graphWidth / data.length) * 0.60));
  const step = graphWidth / data.length;

  const handleCopy = () => {
    const text = data
      .map(d => `${d.label}\t${isRank ? `#${d.value.toLocaleString()}` : `${d.value}${valueSuffix}`}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const chartCard = (
    <div className={`relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs ${isFullscreen ? 'w-full max-w-5xl' : 'w-full'}`}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              {isRank ? 'Closing Rank Benchmark' : 'Cutoff Percentile Benchmark'}
            </span>
            {yAxisLabel && <span className="text-xs text-slate-400 font-sans">• {yAxisLabel}</span>}
          </div>
          <h4 className="mt-0.5 text-base font-bold text-slate-900 tracking-tight font-sans">
            {title}
          </h4>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              title="Graph View"
              className={`rounded-md px-2 py-1 text-xs font-sans font-medium transition-colors ${
                viewMode === 'chart' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="inline h-3.5 w-3.5 mr-1" />
              Chart
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`rounded-md px-2 py-1 text-xs font-sans font-medium transition-colors ${
                viewMode === 'table' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table2 className="inline h-3.5 w-3.5 mr-1" />
              Table
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-sans font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    exportSvgToPng(svgRef.current, title);
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Download PNG Slide</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportDataToCsv(
                      data.map(d => ({
                        Category: d.label,
                        [isRank ? 'Closing Rank' : 'Cutoff Percentile']: d.value,
                      })),
                      title
                    );
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Table'}</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main View: Clean White SVG Canvas */}
      {viewMode === 'chart' ? (
        <div className="relative w-full overflow-x-auto pt-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="h-auto w-full min-w-[340px] bg-white"
            preserveAspectRatio="none"
          >
            {/* Minimal Baseline only - No colored gridlines */}
            <line
              x1={chartPadding.left}
              y1={chartPadding.top + graphHeight}
              x2={viewBoxWidth - chartPadding.right}
              y2={chartPadding.top + graphHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Y-Axis Ticks & Labels - Clean Standard Sans-Serif */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = chartPadding.top + graphHeight * (1 - ratio);
              const gridVal = minValue + range * ratio;
              return (
                <g key={i}>
                  <line
                    x1={chartPadding.left - 4}
                    y1={yVal}
                    x2={chartPadding.left}
                    y2={yVal}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={chartPadding.left - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className="fill-slate-500 text-[10px] font-normal"
                  >
                    {isRank ? Math.round(gridVal).toLocaleString() : gridVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Bars - CETScope Blue-to-Teal Palette */}
            {data.map((item, idx) => {
              const barHeight = Math.max(6, ((item.value - minValue) / range) * graphHeight);
              const x = chartPadding.left + idx * step + (step - barWidth) / 2;
              const y = chartPadding.top + graphHeight - barHeight;
              const isHovered = hoveredIdx === idx;
              // Alternate through CETScope Blue-to-Teal palette
              const barColor = item.color || CETSCOPE_PALETTE[idx % CETSCOPE_PALETTE.length];

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={3}
                    fill={barColor}
                    opacity={hoveredIdx !== null ? (isHovered ? 1 : 0.55) : 0.92}
                    className="transition-opacity duration-150"
                  />

                  {/* Standard Numerical Value Label */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className={`text-[9.5px] font-medium transition-colors ${
                      isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                    }`}
                  >
                    {isRank ? item.value.toLocaleString() : `${item.value.toFixed(1)}${valueSuffix}`}
                  </text>

                  {/* Standard Sans-Serif Category Label */}
                  <text
                    x={x + barWidth / 2}
                    y={viewBoxHeight - chartPadding.bottom + 18}
                    textAnchor="end"
                    transform={`rotate(-28, ${x + barWidth / 2}, ${viewBoxHeight - chartPadding.bottom + 18})`}
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className={`text-[10px] font-normal transition-colors ${
                      isHovered ? 'fill-slate-900 font-medium' : 'fill-slate-600'
                    }`}
                  >
                    {item.label.length > 20 ? item.label.slice(0, 18) + '…' : item.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Academic Clean Light Tooltip */}
          {hoveredIdx !== null && data[hoveredIdx] && (
            <div className="pointer-events-none absolute right-4 top-3 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs text-slate-800 shadow-md backdrop-blur-xs font-sans">
              <div className="font-semibold text-slate-900">{data[hoveredIdx].label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-bold text-blue-700 text-sm">
                  {isRank
                    ? `Rank #${data[hoveredIdx].value.toLocaleString()}`
                    : `${data[hoveredIdx].value.toFixed(2)}${valueSuffix}`}
                </span>
                <span className="text-[10.5px] text-slate-500 font-normal">
                  {data[hoveredIdx].value >= meanValue
                    ? `+${(data[hoveredIdx].value - meanValue).toFixed(1)} vs mean`
                    : `${(data[hoveredIdx].value - meanValue).toFixed(1)} vs mean`}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Clean Presentation Table */
        <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2 font-sans">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-3.5 py-2">Category</th>
                <th className="px-3.5 py-2 text-right">{isRank ? 'Closing Rank' : 'Cutoff Percentile'}</th>
                <th className="px-3.5 py-2 text-right">Deviation from Mean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.map((item, i) => {
                const diff = item.value - meanValue;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3.5 py-2 font-medium text-slate-900">{item.label}</td>
                    <td className="px-3.5 py-2 text-right font-semibold text-blue-700">
                      {isRank ? item.value.toLocaleString() : `${item.value.toFixed(2)}${valueSuffix}`}
                    </td>
                    <td className="px-3.5 py-2 text-right text-slate-500">
                      {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
        {chartCard}
      </div>
    );
  }

  return chartCard;
};

// ==========================================
// 2. ACADEMIC INTERACTIVE LINE CHART
// ==========================================
export interface LinePoint {
  label: string | number;
  value: number;
  secondaryValue?: number;
}

interface LineChartProps {
  data: LinePoint[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
  color?: string;
  valueSuffix?: string;
  isRank?: boolean;
}

export const InteractiveLineChart: React.FC<LineChartProps> = ({
  data,
  title = 'Longitudinal Trend Analysis',
  yAxisLabel,
  height = 290,
  color,
  valueSuffix = '%',
  isRank = false,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Default series color: CETScope Academic Blue for Cutoffs, CETScope Deep Teal for Merit Rank
  const seriesColor = color || (isRank ? CETSCOPE_COLORS.primaryTeal : CETSCOPE_COLORS.primaryBlue);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        <TrendingUp className="mb-2 h-7 w-7 text-slate-300" />
        <p className="font-medium text-slate-600">No trend records available</p>
        <p className="text-xs text-slate-400 mt-0.5">Select a college and branch to view time-series trends.</p>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const meanValue = values.reduce((sum, v) => sum + v, 0) / values.length;
  const maxValue = Math.max(...values);
  const minValue = isRank ? 0 : Math.max(0, Math.floor(Math.min(...values) * 0.90));
  const range = maxValue - minValue || 1;

  const padding = { top: 28, right: 32, bottom: 44, left: 56 };
  const viewBoxWidth = 620;
  const viewBoxHeight = height;
  const graphWidth = viewBoxWidth - padding.left - padding.right;
  const graphHeight = viewBoxHeight - padding.top - padding.bottom;

  const points = data.map((d, idx) => {
    const x = padding.left + (idx / Math.max(1, data.length - 1)) * graphWidth;
    const y = padding.top + (1 - (d.value - minValue) / range) * graphHeight;
    return { x, y, ...d };
  });

  const pathString = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  const areaString =
    points.length > 0
      ? `${pathString} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
      : '';

  const handleCopy = () => {
    const text = data.map(d => `${d.label}\t${d.value}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const chartCard = (
    <div className={`relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs ${isFullscreen ? 'w-full max-w-5xl' : 'w-full'}`}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: seriesColor }}
            >
              {isRank ? 'Closing Merit Rank Trajectory' : 'Cutoff Percentile Trend'}
            </span>
            {yAxisLabel && <span className="text-xs text-slate-400 font-sans">• {yAxisLabel}</span>}
          </div>
          <h4 className="mt-0.5 text-base font-bold text-slate-900 tracking-tight font-sans">
            {title}
          </h4>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`rounded-md px-2 py-1 text-xs font-sans font-medium transition-colors ${
                viewMode === 'chart' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="inline h-3.5 w-3.5 mr-1" />
              Chart
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md px-2 py-1 text-xs font-sans font-medium transition-colors ${
                viewMode === 'table' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table2 className="inline h-3.5 w-3.5 mr-1" />
              Table
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-sans font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    exportSvgToPng(svgRef.current, title);
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Download PNG Slide</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportDataToCsv(
                      data.map(d => ({
                        Year: d.label,
                        [isRank ? 'Closing Rank' : 'Cutoff Percentile']: d.value,
                      })),
                      title
                    );
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Table'}</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Chart: Clean White SVG Canvas with no colored background gridlines */}
      {viewMode === 'chart' ? (
        <div className="relative w-full overflow-x-auto pt-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="h-auto w-full min-w-[340px] bg-white"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`area-${title?.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesColor} stopOpacity="0.14" />
                <stop offset="100%" stopColor={seriesColor} stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Baseline */}
            <line
              x1={padding.left}
              y1={padding.top + graphHeight}
              x2={viewBoxWidth - padding.right}
              y2={padding.top + graphHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Y-Axis Ticks & Labels - Clean Standard Sans-Serif */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = padding.top + graphHeight * (1 - ratio);
              const gridVal = minValue + range * ratio;
              return (
                <g key={i}>
                  <line
                    x1={padding.left - 4}
                    y1={yVal}
                    x2={padding.left}
                    y2={yVal}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className="fill-slate-500 text-[10px] font-normal"
                  >
                    {isRank ? Math.round(gridVal).toLocaleString() : gridVal.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaString} fill={`url(#area-${title?.replace(/[^a-zA-Z0-9]/g, '')})`} />

            {/* Primary Series Line */}
            <path
              d={pathString}
              fill="none"
              stroke={seriesColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Nodes and Labels */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 4}
                    fill="#ffffff"
                    stroke={seriesColor}
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all"
                  />

                  {/* Standard Value Label */}
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className={`text-[9.5px] font-medium transition-colors ${
                      isHovered ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                    }`}
                  >
                    {isRank ? pt.value.toLocaleString() : `${pt.value.toFixed(1)}${valueSuffix}`}
                  </text>

                  {/* Standard Sans-Serif Year Label on X Axis */}
                  <text
                    x={pt.x}
                    y={viewBoxHeight - padding.bottom + 16}
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className={`text-[11px] font-normal transition-colors ${
                      isHovered ? 'fill-slate-900 font-medium' : 'fill-slate-600'
                    }`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Academic Light Tooltip */}
          {hoveredIdx !== null && data[hoveredIdx] && (
            <div className="pointer-events-none absolute right-4 top-3 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs text-slate-800 shadow-md backdrop-blur-xs font-sans">
              <div className="font-semibold text-slate-900">Academic Year {data[hoveredIdx].label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-bold text-sm" style={{ color: seriesColor }}>
                  {isRank
                    ? `Closing Rank: #${data[hoveredIdx].value.toLocaleString()}`
                    : `Cutoff: ${data[hoveredIdx].value.toFixed(2)}${valueSuffix}`}
                </span>
                {hoveredIdx > 0 && (
                  <span className="text-[10.5px] text-slate-500 font-normal">
                    {data[hoveredIdx].value >= data[hoveredIdx - 1].value
                      ? `+${(data[hoveredIdx].value - data[hoveredIdx - 1].value).toFixed(2)} YoY`
                      : `${(data[hoveredIdx].value - data[hoveredIdx - 1].value).toFixed(2)} YoY`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2 font-sans">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-3.5 py-2">Year</th>
                <th className="px-3.5 py-2 text-right">{isRank ? 'Closing Rank' : 'Cutoff Percentile'}</th>
                <th className="px-3.5 py-2 text-right">YoY Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.map((item, i) => {
                const prev = i > 0 ? data[i - 1].value : null;
                const yoy = prev !== null ? item.value - prev : 0;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3.5 py-2 font-medium text-slate-900">{item.label}</td>
                    <td className="px-3.5 py-2 text-right font-semibold" style={{ color: seriesColor }}>
                      {isRank ? item.value.toLocaleString() : `${item.value.toFixed(2)}${valueSuffix}`}
                    </td>
                    <td className="px-3.5 py-2 text-right text-slate-500">
                      {i === 0 ? '—' : yoy > 0 ? `+${yoy.toFixed(2)}` : yoy.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
        {chartCard}
      </div>
    );
  }

  return chartCard;
};

// ==========================================
// 3. ACADEMIC INTERACTIVE SCATTER PLOT
// ==========================================
export interface ScatterDataPoint {
  college_name: string;
  branch: string;
  year: number;
  cutoff_percentile: number;
  closing_rank: number;
}

export const InteractiveScatterPlot: React.FC<{
  data: ScatterDataPoint[];
  title?: string;
  height?: number;
}> = ({
  data,
  title = 'Cutoff Percentile vs Closing Rank Correlation',
  height = 320,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ScatterDataPoint | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        <Activity className="mb-2 h-7 w-7 text-slate-300" />
        <p className="font-medium text-slate-600">No correlation data available</p>
      </div>
    );
  }

  const padding = { top: 28, right: 28, bottom: 50, left: 60 };
  const viewBoxWidth = 620;
  const viewBoxHeight = height;
  const graphWidth = viewBoxWidth - padding.left - padding.right;
  const graphHeight = viewBoxHeight - padding.top - padding.bottom;

  const minX = 40;
  const maxX = 100;
  const rangeX = maxX - minX;

  const ranks = data.map(d => d.closing_rank);
  const maxY = Math.max(...ranks, 50000);
  const minY = 0;
  const rangeY = maxY - minY || 1;

  const handleCopy = () => {
    const text = data
      .map(d => `${d.college_name}\t${d.branch}\t${d.year}\t${d.cutoff_percentile}%\t#${d.closing_rank}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const chartCard = (
    <div className={`relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs ${isFullscreen ? 'w-full max-w-5xl' : 'w-full'}`}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
            Correlation Distribution
          </span>
          <h4 className="mt-0.5 text-base font-bold text-slate-900 tracking-tight font-sans">
            {title}
          </h4>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`rounded-md px-2 py-1 text-xs font-sans font-medium transition-colors ${
                viewMode === 'chart' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="inline h-3.5 w-3.5 mr-1" />
              Scatter
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-md px-2 py-1 text-xs font-sans font-medium transition-colors ${
                viewMode === 'table' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table2 className="inline h-3.5 w-3.5 mr-1" />
              Table
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-sans font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            {exportMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    exportSvgToPng(svgRef.current, title);
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Download PNG Slide</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportDataToCsv(
                      data.map(d => ({
                        College: d.college_name,
                        Branch: d.branch,
                        Year: d.year,
                        CutoffPercentile: d.cutoff_percentile,
                        ClosingRank: d.closing_rank,
                      })),
                      title
                    );
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                    setExportMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Table'}</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      {viewMode === 'chart' ? (
        <div className="relative w-full overflow-x-auto pt-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="h-auto w-full min-w-[340px] bg-white"
            preserveAspectRatio="none"
          >
            {/* Clean X & Y Axes - No colored gridlines */}
            <line
              x1={padding.left}
              y1={padding.top + graphHeight}
              x2={viewBoxWidth - padding.right}
              y2={padding.top + graphHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + graphHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Y Axis Ticks */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = padding.top + graphHeight * (1 - ratio);
              const rankVal = minY + rangeY * ratio;
              return (
                <g key={i}>
                  <line
                    x1={padding.left - 4}
                    y1={yVal}
                    x2={padding.left}
                    y2={yVal}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className="fill-slate-500 text-[10px] font-normal"
                  >
                    {Math.round(rankVal).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* X Axis Ticks */}
            {[40, 55, 70, 85, 100].map((pct, i) => {
              const xVal = padding.left + ((pct - minX) / rangeX) * graphWidth;
              return (
                <g key={i}>
                  <line
                    x1={xVal}
                    y1={padding.top + graphHeight}
                    x2={xVal}
                    y2={padding.top + graphHeight + 4}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={xVal}
                    y={viewBoxHeight - padding.bottom + 16}
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    className="fill-slate-500 text-[10px] font-normal"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Clean Standard Sans-Serif Axis Titles */}
            <text
              x={padding.left + graphWidth / 2}
              y={viewBoxHeight - 8}
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              className="fill-slate-600 text-[11px] font-medium"
            >
              Cutoff Percentile (%)
            </text>
            <text
              x={16}
              y={padding.top + graphHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, 16, ${padding.top + graphHeight / 2})`}
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              className="fill-slate-600 text-[11px] font-medium"
            >
              Closing Merit Rank
            </text>

            {/* Points: CETScope Blue-to-Teal */}
            {data.map((d, idx) => {
              const cx = padding.left + ((d.cutoff_percentile - minX) / rangeX) * graphWidth;
              const cy = padding.top + ((d.closing_rank - minY) / rangeY) * graphHeight;
              const isHovered = hoveredPoint === d;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? CETSCOPE_COLORS.primaryBlue : CETSCOPE_COLORS.secondarySky}
                  fillOpacity={isHovered ? 1 : 0.7}
                  stroke={isHovered ? '#ffffff' : CETSCOPE_COLORS.primaryTeal}
                  strokeWidth={isHovered ? 2 : 0.75}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(d)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>

          {/* Academic Light Hover Tooltip */}
          {hoveredPoint && (
            <div className="pointer-events-none absolute right-4 top-3 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 text-xs text-slate-800 shadow-md backdrop-blur-xs font-sans">
              <div className="font-semibold text-blue-700">{hoveredPoint.college_name}</div>
              <div className="text-[11px] text-slate-500">
                {hoveredPoint.branch} • Year {hoveredPoint.year}
              </div>
              <div className="mt-1 flex gap-3 text-xs font-sans">
                <span>
                  Cutoff: <strong className="text-slate-900 font-semibold">{hoveredPoint.cutoff_percentile}%</strong>
                </span>
                <span>
                  Rank: <strong className="text-slate-900 font-semibold">#{hoveredPoint.closing_rank.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2 max-h-80 font-sans">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-3.5 py-2">College</th>
                <th className="px-3.5 py-2">Branch</th>
                <th className="px-3.5 py-2">Year</th>
                <th className="px-3.5 py-2 text-right">Cutoff %</th>
                <th className="px-3.5 py-2 text-right">Closing Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.slice(0, 100).map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3.5 py-1.5 font-medium text-slate-900">{d.college_name}</td>
                  <td className="px-3.5 py-1.5 text-slate-600">{d.branch}</td>
                  <td className="px-3.5 py-1.5 text-slate-500">{d.year}</td>
                  <td className="px-3.5 py-1.5 text-right font-semibold text-blue-700">{d.cutoff_percentile}%</td>
                  <td className="px-3.5 py-1.5 text-right text-slate-800">#{d.closing_rank.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
        {chartCard}
      </div>
    );
  }

  return chartCard;
};
