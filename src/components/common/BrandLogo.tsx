import React from 'react';

interface GraduationCapIconProps {
  className?: string;
  size?: number;
}

/**
 * Custom Professional Academic & Analytics Graduation Cap Logo
 * Symbolizes: Education + Engineering + College Admissions + Data Analytics
 * Clean geometric lines, mortarboard diamond, subtle analytical trendline and node.
 */
export const GraduationCapIcon: React.FC<GraduationCapIconProps> = ({
  className = 'h-7 w-7',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle academic gradient for the mortarboard */}
        <linearGradient id="cetscopeMortarboard" x1="4" y1="8" x2="36" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Tassel gradient */}
        <linearGradient id="cetscopeTassel" x1="20" y1="15" x2="34" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* 1. Cap Base / Skullcap with subtle depth */}
      <path
        d="M10 20.5V26C10 29.2 14.5 31.8 20 31.8C25.5 31.8 30 29.2 30 26V20.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />

      {/* 2. Analytical Upward Trend & Graph Node within the cap base */}
      <path
        d="M13.5 26.8L17.5 24.2L21.5 25.5L26 21.8"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="21.8" r="1.3" fill="#38bdf8" />

      {/* 3. Mortarboard Diamond Top - Primary Visual Symbol */}
      <polygon
        points="20,7.5 36.5,14.8 20,22.2 3.5,14.8"
        fill="url(#cetscopeMortarboard)"
      />

      {/* 4. Refined Geometric Facet Line for Architectural/Engineering Precision */}
      <polygon
        points="20,7.5 36.5,14.8 20,22.2"
        fill="#ffffff"
        fillOpacity="0.16"
      />

      {/* 5. Center Button / Apex Node */}
      <circle cx="20" cy="14.8" r="1.7" fill="#ffffff" />

      {/* 6. Precision Tassel & Academic Ribbon ending in Analytical Node */}
      <path
        d="M20 14.8C24 15.5 32.5 17 33.5 19.5V26.5"
        stroke="url(#cetscopeTassel)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="33.5" cy="26.8" r="1.8" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
  );
};

interface BrandLogoProps {
  variant?: 'header' | 'sidebar' | 'dashboard' | 'footer';
  className?: string;
}

/**
 * Standardized Horizontal Brand Lockup:
 * [ PROFESSIONAL GRADUATION CAP ICON ] CETScope
 *                                     MHT-CET Cutoff Analyzer
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
}) => {
  if (variant === 'dashboard') {
    return (
      <div className={`flex items-center gap-3.5 ${className}`}>
        {/* Emblem icon container */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white shadow-md ring-1 ring-slate-800/20">
          <GraduationCapIcon className="h-8 w-8" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
              CETScope
            </span>
            <span className="hidden sm:inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/60">
              Navi Mumbai
            </span>
          </div>
          <span className="text-xs sm:text-sm font-medium text-slate-500 tracking-normal mt-1">
            MHT-CET Cutoff Analyzer
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`flex items-center gap-3 px-3 py-2 ${className}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white shadow-xs ring-1 ring-slate-800/20">
          <GraduationCapIcon className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
            CETScope
          </span>
          <span className="text-[11px] font-medium text-slate-500 leading-tight">
            MHT-CET Cutoff Analyzer
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
          <GraduationCapIcon className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight">
            CETScope
          </span>
          <span className="text-[10px] font-medium text-slate-500 leading-tight">
            MHT-CET Cutoff Analyzer
          </span>
        </div>
      </div>
    );
  }

  // Default: Header variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-slate-900 via-slate-900 to-blue-950 text-white shadow-xs ring-1 ring-slate-800/10">
        <GraduationCapIcon className="h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
            CETScope
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
            2021–2025
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 tracking-normal mt-0.5">
          MHT-CET Cutoff Analyzer
        </span>
      </div>
    </div>
  );
};
