import React, { useState, useEffect } from 'react';
import { PageId, CutoffRecord } from './types';
import {
  loadSavedRecords,
  appendRecords,
  replaceRecords,
  resetToDefaultDataset,
} from './services/storage';

import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { BrandLogo } from './components/common/BrandLogo';

import { DashboardPage } from './components/pages/DashboardPage';
import { CutoffSearchPage } from './components/pages/CutoffSearchPage';
import { CollegeComparisonPage } from './components/pages/CollegeComparisonPage';
import { TrendAnalysisPage } from './components/pages/TrendAnalysisPage';
import { CollegeExplorerPage } from './components/pages/CollegeExplorerPage';
import { DataTablePage } from './components/pages/DataTablePage';
import { DataImportPage } from './components/pages/DataImportPage';
import { AboutProjectPage } from './components/pages/AboutProjectPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [records, setRecords] = useState<CutoffRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize data on component mount
  useEffect(() => {
    const initialRecords = loadSavedRecords();
    setRecords(initialRecords);
    setIsLoaded(true);
  }, []);

  const handleResetData = () => {
    const reset = resetToDefaultDataset();
    setRecords(reset);
  };

  const handleAppendData = (incoming: CutoffRecord[]) => {
    const updated = appendRecords(records, incoming);
    setRecords(updated);
  };

  const handleReplaceData = (incoming: CutoffRecord[]) => {
    const updated = replaceRecords(incoming);
    setRecords(updated);
  };

  const handleNavigateToTab = (tabId: PageId) => {
    setCurrentPage(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Loading admissions dataset...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Global Header */}
      <Header
        totalRecords={records.length}
        onResetData={handleResetData}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      {/* Main Container with Sidebar + Page View */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-stretch">
        <Navigation
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentPage === 'dashboard' && (
            <DashboardPage
              records={records}
              onNavigateToTab={handleNavigateToTab}
            />
          )}

          {currentPage === 'search' && (
            <CutoffSearchPage records={records} />
          )}

          {currentPage === 'comparison' && (
            <CollegeComparisonPage records={records} />
          )}

          {currentPage === 'trends' && (
            <TrendAnalysisPage records={records} />
          )}

          {currentPage === 'explorer' && (
            <CollegeExplorerPage
              records={records}
              onNavigateToComparison={_collegeName => {
                handleNavigateToTab('comparison');
              }}
            />
          )}

          {currentPage === 'table' && (
            <DataTablePage records={records} />
          )}

          {currentPage === 'import' && (
            <DataImportPage
              currentRecordCount={records.length}
              onAppendData={handleAppendData}
              onReplaceData={handleReplaceData}
              onResetData={handleResetData}
            />
          )}

          {currentPage === 'about' && (
            <AboutProjectPage />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-center space-y-2">
          <BrandLogo variant="footer" />
          <p className="text-[11px] text-slate-400">
            Engineering Admissions Intelligence & Cutoff Analytics for Navi Mumbai Region
          </p>
        </div>
      </footer>
    </div>
  );
}
