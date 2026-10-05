import React from 'react';
import { Database, RotateCcw, Menu, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  totalRecords: number;
  onResetData: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalRecords,
  onResetData,
  mobileNavOpen,
  setMobileNavOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <BrandLogo variant="header" />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 font-medium">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <span>{totalRecords.toLocaleString()} cutoffs active</span>
          </div>

          <button
            type="button"
            onClick={onResetData}
            title="Reset to default benchmark dataset"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
