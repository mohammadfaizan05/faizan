import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  CreditCard,
  Building2,
  PieChart,
  DollarSign,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { Language } from '../types';
import { translations, serviceCategoryLabels } from '../utils/translations';
import { formatINR } from '../utils/formatters';

interface AnalyticsReportsProps {
  language: Language;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({ language }) => {
  const t = translations[language];

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'month' | 'today' | 'year'>('month');

  const fetchAnalytics = async () => {
    setLoading(true);
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      const res = await fetch('/api/reports/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDownloadCsv = () => {
    const token = localStorage.getItem('mfjsk_auth_token');
    window.location.href = `/api/reports/export-csv?token=${token}`;
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading || !analytics) {
    return (
      <div className="p-16 text-center text-zinc-500 text-xs font-mono">
        LOADING FINANCIAL ANALYTICS AND REPORTS...
      </div>
    );
  }

  const { today, thisMonth, khataSummary, serviceBreakdown, paymentBreakdown } = analytics;

  // Sort services by profit
  const sortedServices: [string, { count: number; volume: number; profit: number }][] = Object.entries(
    serviceBreakdown || {}
  ).sort((a: any, b: any) => (b[1].profit || 0) - (a[1].profit || 0)) as any;

  return (
    <div id="analytics-reports-view" className="space-y-6">
      {/* Editorial Masthead Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              FINANCIAL PERFORMANCE & INTELLIGENCE (वित्तीय रिपोर्ट एवं विश्लेषण)
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-zinc-900 font-editorial-serif">
              Analytics & Reports <span className="text-zinc-400 font-sans font-light">/ STATEMENTS</span>
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-1">
              मासिक टर्नओवर, सेवा-वार लाभ रैंकिंग, व्यय विश्लेषण एवं सी.एस.वी. एक्सेल एक्सपोर्ट
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 font-mono font-bold text-xs uppercase tracking-wider rounded border border-zinc-300 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly & Today KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Monthly Turnover Volume */}
        <div className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block font-bold">This Month Volume (टर्नओवर)</span>
          <span className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 font-mono mt-2 block">
            {formatINR(thisMonth.volume)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Processed Volume</span>
            <span className="font-semibold">{thisMonth.txCount} txs</span>
          </div>
        </div>

        {/* Monthly Gross Profit */}
        <div className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block font-bold">Monthly Gross Profit (कुल बचत)</span>
          <span className="text-2xl md:text-3xl font-light tracking-tight text-emerald-700 font-mono mt-2 block">
            +{formatINR(thisMonth.grossProfit)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-700 font-mono font-semibold">
            <span>Fees + Commission</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block font-bold">Monthly Expenses (दुकान खर्च)</span>
          <span className="text-2xl md:text-3xl font-light tracking-tight text-red-600 font-mono mt-2 block">
            -{formatINR(thisMonth.expenses)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[10px] text-red-600 font-mono font-semibold">
            <span>Rent, Paper, Supplies</span>
          </div>
        </div>

        {/* Monthly Net Shop Earnings */}
        <div className="border border-emerald-300 p-4 bg-emerald-50 rounded shadow-2xs">
          <span className="text-emerald-800 text-[10px] uppercase font-mono tracking-widest block font-bold">Net Take-Home (शुद्ध लाभ)</span>
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-700 font-mono mt-2 block">
            +{formatINR(thisMonth.netProfit)}
          </span>
          <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-700 font-mono font-semibold">
            <span>After shop expenses</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Service Performance Ranking & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Highest Earning Services Ranking */}
        <div className="lg:col-span-7 border border-zinc-200 bg-white rounded p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Highest Earning Services (सर्वाधिक कमाई वाली सेवाएं)</span>
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono font-semibold">Ranked by Profit</span>
          </div>

          <div className="space-y-2 font-mono">
            {sortedServices.map(([catKey, data]: [string, any], idx) => {
              const meta = serviceCategoryLabels[catKey as any] || {
                hi: catKey,
                en: catKey,
                hinglish: catKey,
              };

              const maxProfit = sortedServices[0]?.[1]?.profit || 1;
              const percent = Math.min(100, Math.round((data.profit / maxProfit) * 100));

              return (
                <div key={catKey} className="p-3 bg-zinc-50 border border-zinc-200 rounded space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-white border border-zinc-300 text-zinc-700 text-[10px] font-bold flex items-center justify-center shadow-2xs">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-900 font-sans">{meta[language]}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-700 text-sm">
                        +{formatINR(data.profit)}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {data.count} txs • Vol: {formatINR(data.volume)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden border border-zinc-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Payment Channels & Outstanding Khata Insights */}
        <div className="lg:col-span-5 space-y-5">
          {/* Payment Modes Breakdown */}
          <div className="border border-zinc-200 bg-white rounded p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 pb-3">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>Payment Mode Breakdown (भुगतान माध्यम)</span>
            </h3>

            <div className="space-y-2 font-mono">
              {Object.entries(paymentBreakdown || {}).map(([mode, data]: [string, any]) => (
                <div key={mode} className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded text-xs">
                  <span className="font-semibold text-zinc-800 font-sans">{mode.replace(/_/g, ' ')}</span>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900">{formatINR(data.volume)}</span>
                    <span className="text-[10px] text-zinc-500 block">{data.count} txs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Udhar Recovery Status */}
          <div className="border border-zinc-200 bg-white rounded p-5 space-y-3 font-mono shadow-2xs">
            <h3 className="text-xs font-mono font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 pb-3">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Market Outstanding Debt vs Deposit</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-[10px] uppercase tracking-widest text-red-700 block font-bold">Market Udhar</span>
                <span className="text-base font-bold text-red-600 mt-1 block">
                  {formatINR(khataSummary.totalMarketUdhar)}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="text-[10px] uppercase tracking-widest text-emerald-800 block font-bold">Advance Deposits</span>
                <span className="text-base font-bold text-emerald-700 mt-1 block">
                  {formatINR(khataSummary.totalAdvanceJama)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
