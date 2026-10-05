import React from 'react';
import {
  GraduationCap,
  Sparkles,
  BarChart3,
  Sliders,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Brand Heading */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <BrandLogo variant="dashboard" />
      </div>

      {/* Purpose & Scope */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <span>Project Purpose & Objectives</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>CETScope</strong> is designed to empower aspiring engineering students,
          educators, and counselors in navigating multi-year cutoff trajectories across prominent
          engineering institutes in the Navi Mumbai region.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          By modeling historical-style benchmark parameters across five consecutive admission cycles
          (2021 through 2025) and multiple CAP rounds, the system reveals competitive patterns
          between branches, categories, and institutions.
        </p>
      </div>

      {/* Key Analytical Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span>Interactive Data Visualizations</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dynamic SVG trend lines, college distribution bar charts, and percentile-to-rank
            correlation scatter plots that update dynamically upon adjusting admission criteria.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <span>Multi-Factor Filtering</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict domain controls for Academic Year (2021–2025), CAP Rounds (1, 2, 3), and standard
            reservation categories (Open, OBC, NT, SC, ST, Others) with percentile threshold bounds.
          </p>
        </div>
      </div>

      {/* Regional Institutional Coverage */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Building className="h-5 w-5 text-slate-700" />
          <span>Navi Mumbai Regional Coverage</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The benchmark dataset models cutoff distributions across established engineering
          campuses located across Navi Mumbai:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Fr. C. Rodrigues Institute of Technology (FCRIT), Vashi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>SIES Graduate School of Technology, Nerul</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pillai College of Engineering (PCE), New Panvel</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Terna Engineering College, Nerul</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Bharati Vidyapeeth College of Engineering, Belapur</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Datta Meghe College of Engineering (DMCE), Airoli</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Saraswati College of Engineering (SCOE), Kharghar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
