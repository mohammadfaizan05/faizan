import React, { useState, useEffect } from 'react';
import {
  Coins,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CashDenominationRecord, Language } from '../types';
import { translations } from '../utils/translations';
import { formatINR, formatDateIndian } from '../utils/formatters';

interface CashDrawerProps {
  language: Language;
}

export const CashDrawer: React.FC<CashDrawerProps> = ({ language }) => {
  const t = translations[language];

  const [openingCash, setOpeningCash] = useState<string>('50000');
  const [n500, setN500] = useState<string>('0');
  const [n200, setN200] = useState<string>('0');
  const [n100, setN100] = useState<string>('0');
  const [n50, setN50] = useState<string>('0');
  const [n20, setN20] = useState<string>('0');
  const [n10, setN10] = useState<string>('0');
  const [coins, setCoins] = useState<string>('0');
  const [drawerNotes, setDrawerNotes] = useState<string>('');

  const [drawerRecord, setDrawerRecord] = useState<CashDenominationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fetchDrawer = async () => {
    setLoading(true);
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      const res = await fetch('/api/cash-drawer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.drawer) {
        setDrawerRecord(data.drawer);
        setOpeningCash(data.drawer.openingCash?.toString() || '50000');
        setN500(data.drawer.notes500?.toString() || '0');
        setN200(data.drawer.notes200?.toString() || '0');
        setN100(data.drawer.notes100?.toString() || '0');
        setN50(data.drawer.notes50?.toString() || '0');
        setN20(data.drawer.notes20?.toString() || '0');
        setN10(data.drawer.notes10?.toString() || '0');
        setCoins(data.drawer.coinsTotal?.toString() || '0');
        setDrawerNotes(data.drawer.notes || '');
      }
    } catch (err) {
      console.error('Error fetching cash drawer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawer();
  }, []);

  // Compute live physical count
  const sum500 = (Number(n500) || 0) * 500;
  const sum200 = (Number(n200) || 0) * 200;
  const sum100 = (Number(n100) || 0) * 100;
  const sum50 = (Number(n50) || 0) * 50;
  const sum20 = (Number(n20) || 0) * 20;
  const sum10 = (Number(n10) || 0) * 10;
  const sumCoins = Number(coins) || 0;

  const totalPhysicalCash = sum500 + sum200 + sum100 + sum50 + sum20 + sum10 + sumCoins;
  const digitalLedgerCash = drawerRecord ? drawerRecord.digitalLedgerCash : Number(openingCash) || 0;
  const discrepancy = totalPhysicalCash - digitalLedgerCash;

  const handleSaveDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    const token = localStorage.getItem('mfjsk_auth_token');

    try {
      const res = await fetch('/api/cash-drawer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          openingCash: Number(openingCash) || 0,
          notes500: Number(n500) || 0,
          notes200: Number(n200) || 0,
          notes100: Number(n100) || 0,
          notes50: Number(n50) || 0,
          notes20: Number(n20) || 0,
          notes10: Number(n10) || 0,
          coinsTotal: Number(coins) || 0,
          notes: drawerNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.drawer) {
        setDrawerRecord(data.drawer);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error saving drawer record:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="cash-drawer-view" className="space-y-6">
      {/* Editorial Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              PHYSICAL CASH RECONCILIATION (गल्ला मिलान एवं नोटों की गिनती)
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-zinc-900 font-editorial-serif">
              Cash Drawer <span className="text-zinc-400 font-sans font-light">/ VAULT & TILL</span>
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-1">
              दैनिक नकद गल्ला, नोटों का भौतिक मिलान एवं AEPS कैश फ्लो वेरिफिकेशन
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchDrawer}
              className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 font-mono text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
              <span>Reload Drawer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Status & Reconciliation Indicator - Editorial Banner */}
      <div className={`p-4 md:p-5 rounded border transition-colors ${
        discrepancy === 0
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : discrepancy < 0
          ? 'bg-red-50 border-red-300 text-red-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded border ${
              discrepancy === 0
                ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                : discrepancy < 0
                ? 'bg-red-100 border-red-400 text-red-800'
                : 'bg-amber-100 border-amber-400 text-amber-800'
            }`}>
              {discrepancy === 0 ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : discrepancy < 0 ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <TrendingUp className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600">
                {t.drawerReconciliation} (गल्ला स्थिति)
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 font-mono mt-0.5">
                {discrepancy === 0
                  ? t.perfectMatch
                  : discrepancy < 0
                  ? `${t.cashShortage}: -${formatINR(Math.abs(discrepancy))}`
                  : `${t.cashSurplus}: +${formatINR(discrepancy)}`}
              </h2>
              <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
                Last Verified: {drawerRecord?.verifiedAt || 'Pending verification'} by{' '}
                <strong className="text-zinc-900">Mohammad Faizan</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-200 font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-bold">
                {t.physicalCashCount}
              </span>
              <span className="text-2xl font-light tracking-tight text-emerald-700">
                {formatINR(totalPhysicalCash)}
              </span>
            </div>

            <div className="text-zinc-400 text-xl">/</div>

            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-bold">
                {t.ledgerBalance}
              </span>
              <span className="text-2xl font-light tracking-tight text-zinc-800">
                {formatINR(digitalLedgerCash)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Denomination Counting Form & Breakdown */}
      <form onSubmit={handleSaveDrawer} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Note Denominations Counter */}
        <div className="lg:col-span-7 border border-zinc-200 bg-white rounded shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-900">
                Physical Cash Denominations (नोटों की संख्या)
              </h3>
            </div>
          </div>

          {/* Opening Cash Input */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-between font-mono">
            <div>
              <label className="text-xs font-bold text-zinc-900 block">
                Morning Opening Cash (सुबह का गल्ला ₹)
              </label>
              <span className="text-[10px] text-zinc-500">
                Base float for AEPS cash payout
              </span>
            </div>
            <input
              type="number"
              min="0"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              className="w-36 bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1.5 text-right font-mono font-bold text-sm text-emerald-700 outline-none"
            />
          </div>

          {/* Denominations Table Grid */}
          <div className="space-y-2 font-mono">
            {/* ₹500 */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded text-[10px] font-bold">
                  ₹500
                </span>
                <span className="text-zinc-600">× Notes</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={n500}
                  onChange={(e) => setN500(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-emerald-700">
                = {formatINR(sum500)}
              </div>
            </div>

            {/* ₹200 */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 rounded text-[10px] font-bold">
                  ₹200
                </span>
                <span className="text-zinc-600">× Notes</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={n200}
                  onChange={(e) => setN200(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-amber-700">
                = {formatINR(sum200)}
              </div>
            </div>

            {/* ₹100 */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-blue-100 border border-blue-300 text-blue-800 rounded text-[10px] font-bold">
                  ₹100
                </span>
                <span className="text-zinc-600">× Notes</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={n100}
                  onChange={(e) => setN100(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-blue-700">
                = {formatINR(sum100)}
              </div>
            </div>

            {/* ₹50 */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-cyan-100 border border-cyan-300 text-cyan-800 rounded text-[10px] font-bold">
                  ₹50
                </span>
                <span className="text-zinc-600">× Notes</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={n50}
                  onChange={(e) => setN50(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-cyan-700">
                = {formatINR(sum50)}
              </div>
            </div>

            {/* ₹20 */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 text-rose-800 rounded text-[10px] font-bold">
                  ₹20
                </span>
                <span className="text-zinc-600">× Notes</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={n20}
                  onChange={(e) => setN20(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-rose-700">
                = {formatINR(sum20)}
              </div>
            </div>

            {/* ₹10 */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded text-[10px] font-bold">
                  ₹10
                </span>
                <span className="text-zinc-600">× Notes</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={n10}
                  onChange={(e) => setN10(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-yellow-700">
                = {formatINR(sum10)}
              </div>
            </div>

            {/* Coins */}
            <div className="grid grid-cols-12 gap-3 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
              <div className="col-span-4 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-zinc-200 border border-zinc-300 text-zinc-800 rounded text-[10px] font-bold">
                  Coins
                </span>
                <span className="text-zinc-500">(1, 2, 5, 10)</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={coins}
                  onChange={(e) => setCoins(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-1 text-center font-mono font-bold text-xs text-zinc-900 outline-none"
                />
              </div>
              <div className="col-span-4 text-right font-bold text-xs text-zinc-800">
                = {formatINR(sumCoins)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Save Action */}
        <div className="lg:col-span-5 space-y-4">
          {/* Total Count Summary Box */}
          <div className="border border-zinc-200 bg-white rounded shadow-2xs p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-widest">
              Reconciliation Summary
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Morning Starting Cash:</span>
                <span className="font-bold text-zinc-900">{formatINR(Number(openingCash) || 0)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Digital Ledger Target:</span>
                <span className="font-bold text-zinc-900">{formatINR(digitalLedgerCash)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-zinc-100 text-emerald-700 font-bold">
                <span>Counted Physical Cash:</span>
                <span className="text-sm">{formatINR(totalPhysicalCash)}</span>
              </div>

              <div className="flex justify-between py-2 text-sm font-bold">
                <span className="text-zinc-700">Reconciliation Diff:</span>
                <span
                  className={`${
                    discrepancy === 0
                      ? 'text-emerald-700'
                      : discrepancy < 0
                      ? 'text-red-600'
                      : 'text-amber-700'
                  }`}
                >
                  {discrepancy === 0
                    ? '₹0 (Exact Match)'
                    : discrepancy < 0
                    ? `-${formatINR(Math.abs(discrepancy))} (Shortage)`
                    : `+${formatINR(discrepancy)} (Surplus)`}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                Verification Remarks / Note
              </label>
              <textarea
                rows={3}
                value={drawerNotes}
                onChange={(e) => setDrawerNotes(e.target.value)}
                placeholder="e.g. Counter balanced after evening shift AEPS reconciliation..."
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded p-3 text-xs text-zinc-900 outline-none resize-none font-mono"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Cash drawer counts verified and recorded successfully!</span>
              </div>
            )}

            <button
              id="save-drawer-btn"
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4 text-white" />
              <span>{saving ? 'Verifying & Saving...' : 'Save & Verify Cash Drawer'}</span>
            </button>
          </div>

          {/* Security & Responsibility Card */}
          <div className="border border-zinc-200 bg-zinc-50 rounded p-4 text-[11px] text-zinc-600 space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Daily Cash Reconciliation Protocol</span>
            </div>
            <p className="leading-relaxed">
              Every cash drawer verification is time-stamped and logged under admin <strong>Mohammad Faizan</strong>. Keeping the drawer balanced daily ensures zero cash leakages.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
