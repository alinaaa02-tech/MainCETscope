import React from 'react';
import {
  LayoutDashboard,
  Search,
  Scale,
  TrendingUp,
  Building2,
  Table,
  UploadCloud,
  Info,
} from 'lucide-react';
import { PageId } from '../../types';
import { BrandLogo } from './BrandLogo';

interface NavigationProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Cutoff Search', icon: Search },
  { id: 'comparison', label: 'College Comparison', icon: Scale },
  { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
  { id: 'explorer', label: 'College Explorer', icon: Building2 },
  { id: 'table', label: 'Data Table', icon: Table },
  { id: 'import', label: 'Data Import', icon: UploadCloud },
  { id: 'about', label: 'About Project', icon: Info },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onSelectPage,
  mobileNavOpen,
  setMobileNavOpen,
}) => {
  const handleNavClick = (page: PageId) => {
    onSelectPage(page);
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white lg:block">
        <div className="sticky top-20 p-4 space-y-3">
          <div className="pb-2 border-b border-slate-100">
            <BrandLogo variant="sidebar" />
          </div>

          <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-6">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 mb-1">Navi Mumbai Dataset</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Covers 7 engineering colleges across Vashi, Nerul, Belapur, Panvel, Airoli, and Kharghar.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 pb-3 border-b border-slate-200 flex items-center justify-between">
              <BrandLogo variant="sidebar" className="px-0 py-0" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
