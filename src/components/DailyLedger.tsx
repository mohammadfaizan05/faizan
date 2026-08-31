import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Trash2,
  TrendingUp,
  Coins,
  RefreshCw,
  PlusCircle,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, Language, ServiceCategory } from '../types';
import { translations, serviceCategoryLabels } from '../utils/translations';
import { formatINR, formatDateIndian, getTodayDateString } from '../utils/formatters';
import { ReceiptModal } from './ReceiptModal';

interface DailyLedgerProps {
  language: Language;
  onOpenNewTransaction: () => void;
}

export const DailyLedger: React.FC<DailyLedgerProps> = ({ language, onOpenNewTransaction }) => {
  const t = translations[language];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>(getTodayDateString());
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    const token = localStorage.getItem('mfjsk_auth_token');

    let url = '/api/transactions?';
    if (dateFilter === 'today') {
      url += `date=${getTodayDateString()}&`;
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      url += `date=${yesterday}&`;
    } else if (dateFilter === 'custom' && customDate) {
      url += `date=${customDate}&`;
    }

    if (selectedCategory !== 'ALL') {
      url += `category=${selectedCategory}&`;
    }

    if (searchQuery.trim()) {
      url += `search=${encodeURIComponent(searchQuery.trim())}&`;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [dateFilter, selectedCategory, customDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this financial transaction? This action will be recorded in audit logs.')) {
      return;
    }

    setDeletingId(id);
    const token = localStorage.getItem('mfjsk_auth_token');

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Export full filtered ledger to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = [
      'Tx ID',
      'Date',
      'Time',
      'Customer Name',
      'Customer Mobile',
      'Aadhaar Last 4',
      'Service Category',
      'Transaction Type',
      'Principal Amount (INR)',
      'Customer Charge (INR)',
      'Bank Commission (INR)',
      'Net Shop Profit (INR)',
      'Payment Mode',
      'Reference RRN',
      'Bank Name',
      'Notes',
      'Status',
    ];

    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.time}"`,
      `"${t.customerName.replace(/"/g, '""')}"`,
      `"${t.customerMobile || ''}"`,
      `"${t.aadhaarLast4 || ''}"`,
      `"${t.serviceCategory}"`,
      `"${t.transactionType}"`,
      t.amount,
      t.customerCharge || 0,
      t.bankCommission || 0,
      t.netProfit || 0,
      `"${t.paymentMode}"`,
      `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${(t.bankName || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MFJSK_Ledger_History_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for summary metric cards
  const totalInflow = transactions
    .filter((t) => t.transactionType === 'inflow')
    .reduce((sum, t) => sum + t.amount + (t.customerCharge || 0), 0);

  const totalOutflow = transactions
    .filter((t) => t.transactionType === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalNetProfit = transactions.reduce((sum, t) => sum + (t.netProfit || 0), 0);
  const totalCommissionEarned = transactions.reduce((sum, t) => sum + (t.bankCommission || 0), 0);

  const cashInflow = transactions
    .filter((t) => t.transactionType === 'inflow' && t.paymentMode === 'CASH')
    .reduce((sum, t) => sum + t.amount + (t.customerCharge || 0), 0);

  const cashOutflow = transactions
    .filter((t) => t.transactionType === 'outflow' && t.paymentMode === 'CASH')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashChange = cashInflow - cashOutflow;

  return (
    <div id="daily-ledger-view" className="space-y-6">
      {/* Editorial Masthead Header */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              ESTABLISHED 2024 • FINANCIAL LEDGER & KHATA
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-zinc-900 font-editorial-serif">
              Mohammad Faizan <span className="text-zinc-400 font-sans font-light">/ LEDGER</span>
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-1">
              दैनिक एवं मासिक वित्तीय हिसाब-किताब पोर्टल • AEPS, मनी ट्रांसफर व डिजिटल सेवाएं
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono shadow-2xs">
              <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                ● 2FA SECURED
              </span>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-600 text-[11px]">ADMIN: M. FAIZAN</span>
            </div>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>{t.quickNewEntry}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Financial Summary Metrics Grid - Editorial Minimalist Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Inflow */}
        <div id="metric-inflow" className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest">{t.totalInflow}</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 font-mono">
              {formatINR(totalInflow)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-100 pt-2">
            <span className="text-emerald-700 font-medium">₹ Cash + Digital</span>
            <span>{transactions.filter((t) => t.transactionType === 'inflow').length} txs</span>
          </div>
        </div>

        {/* Total Outflow */}
        <div id="metric-outflow" className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest">{t.totalOutflow}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 font-mono">
              {formatINR(totalOutflow)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-100 pt-2">
            <span className="text-red-700 font-medium">AEPS / Withdrawal</span>
            <span>{transactions.filter((t) => t.transactionType === 'outflow').length} txs</span>
          </div>
        </div>

        {/* Net Shop Profit - Standout Highlight Card */}
        <div id="metric-profit" className="border border-emerald-600 p-4 bg-emerald-600 text-white rounded shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-emerald-100 font-mono font-bold text-[10px] uppercase tracking-widest">{t.totalProfit}</span>
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-white font-mono">
              +{formatINR(totalNetProfit)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono font-medium text-emerald-100 border-t border-emerald-500/60 pt-2">
            <span>Customer Fee + Comm</span>
            <span>{transactions.length} Total</span>
          </div>
        </div>

        {/* Net Cash Movement */}
        <div id="metric-cashflow" className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest">Net Cash Movement</span>
            <Coins className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className={`text-2xl md:text-3xl font-light tracking-tight font-mono ${netCashChange >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {netCashChange >= 0 ? `+${formatINR(netCashChange)}` : formatINR(netCashChange)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-100 pt-2">
            <span>In: {formatINR(cashInflow)}</span>
            <span>Out: {formatINR(cashOutflow)}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar - Editorial Controls */}
      <div className="border border-zinc-200 bg-white p-3.5 rounded shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-emerald-600 focus:bg-white rounded pl-9 pr-20 py-2 text-xs text-zinc-900 placeholder-zinc-400 font-mono outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[10px] font-mono uppercase tracking-wider rounded transition-colors cursor-pointer font-bold"
            >
              Search
            </button>
          </form>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded border border-zinc-200 shrink-0">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                dateFilter === 'all' ? 'bg-white text-zinc-900 font-bold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                dateFilter === 'today' ? 'bg-white text-zinc-900 font-bold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.filterToday}
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                dateFilter === 'yesterday' ? 'bg-white text-zinc-900 font-bold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.filterYesterday}
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                dateFilter === 'custom' ? 'bg-white text-zinc-900 font-bold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Date
            </button>
          </div>

          {dateFilter === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-white border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-900 font-mono outline-none shrink-0"
            />
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            title="Download CSV Statement"
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer font-semibold transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-zinc-100">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-zinc-900 text-white font-bold'
                : 'bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900'
            }`}
          >
            All Services
          </button>
          {Object.entries(serviceCategoryLabels).map(([catKey, val]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === catKey
                  ? 'bg-zinc-900 text-white font-bold'
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900'
              }`}
            >
              {val[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table - Editorial Typography and Grid */}
      <div className="border border-zinc-200 bg-white rounded shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900">
              {t.todayTransactions} <span className="text-zinc-500 font-normal">({transactions.length} RECORDS)</span>
            </h2>
          </div>
          <button
            onClick={fetchTransactions}
            title="Refresh list"
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded transition-colors cursor-pointer hover:bg-zinc-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2 font-mono">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>LOADING LEDGER ENTRIES...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-3 font-mono">
            <p className="text-sm font-medium text-zinc-700">No transactions recorded in the ledger yet.</p>
            <p className="text-xs text-zinc-400">All newly added live transactions will appear here with complete audit history, receipts, and profit tracking.</p>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record First Live Transaction</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 uppercase text-[10px] tracking-widest bg-zinc-50 font-medium">
                  <th className="py-3 px-4">Time & Tx ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service Category</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Volume (₹)</th>
                  <th className="py-3 px-4 text-right">Fee / Comm</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {transactions.map((tx) => {
                  const cat = serviceCategoryLabels[tx.serviceCategory] || {
                    hi: tx.serviceCategory,
                    en: tx.serviceCategory,
                    hinglish: tx.serviceCategory,
                  };

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* Time & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{tx.id}</div>
                        <div className="text-[11px] text-zinc-500">
                          {formatDateIndian(tx.date)} • {tx.time}
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900 font-sans">{tx.customerName}</div>
                        {tx.customerMobile ? (
                          <div className="text-[11px] text-zinc-500">{tx.customerMobile}</div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 uppercase">Counter</div>
                        )}
                        {tx.aadhaarLast4 && (
                          <div className="text-[10px] text-emerald-700 font-medium">UID: **{tx.aadhaarLast4}</div>
                        )}
                      </td>

                      {/* Service Category */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-900 font-sans">{cat[language]}</div>
                        {tx.referenceNumber && (
                          <div className="text-[10px] text-zinc-500">RRN: {tx.referenceNumber}</div>
                        )}
                        {tx.notes && (
                          <div className="text-[10px] text-zinc-500 truncate max-w-[150px]" title={tx.notes}>
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono border font-semibold ${
                          tx.paymentMode === 'CASH'
                            ? 'border-amber-300 text-amber-900 bg-amber-50'
                            : 'border-blue-300 text-blue-900 bg-blue-50'
                        }`}>
                          {tx.paymentMode.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Volume & Direction */}
                      <td className="py-3 px-4 text-right">
                        <div className={`font-bold ${
                          tx.transactionType === 'inflow' ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          {tx.transactionType === 'inflow' ? '+' : '-'} {formatINR(tx.amount)}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase">
                          {tx.transactionType === 'inflow' ? 'Inflow (जमा)' : 'Outflow (निकासी)'}
                        </div>
                      </td>

                      {/* Customer Fee & Portal Commission */}
                      <td className="py-3 px-4 text-right text-[11px] text-zinc-600">
                        <div>Fee: +₹{tx.customerCharge || 0}</div>
                        <div>Comm: +₹{tx.bankCommission || 0}</div>
                      </td>

                      {/* Net Profit */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          +₹{tx.netProfit || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTxForReceipt(tx)}
                            title="Print Thermal Receipt"
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors cursor-pointer border border-zinc-200"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={deletingId === tx.id}
                            title="Delete Entry"
                            className="p-1.5 bg-zinc-100 hover:bg-red-50 text-zinc-500 hover:text-red-600 rounded transition-colors cursor-pointer border border-zinc-200 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedTxForReceipt && (
        <ReceiptModal
          transaction={selectedTxForReceipt}
          language={language}
          onClose={() => setSelectedTxForReceipt(null)}
        />
      )}
    </div>
  );
};

