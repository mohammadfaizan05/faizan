import React, { useState } from 'react';
import { X, CheckCircle2, Calculator, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ServiceCategory, PaymentMode, TransactionType, Language } from '../types';
import { translations, serviceCategoryLabels } from '../utils/translations';
import { calculateDefaultCommission, getTodayDateString, getCurrentTimeString } from '../utils/formatters';

interface TransactionModalProps {
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ language, onClose, onSuccess }) => {
  const t = translations[language];

  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('AEPS_WITHDRAWAL');
  const [transactionType, setTransactionType] = useState<TransactionType>('outflow');
  const [amount, setAmount] = useState<string>('3000');
  const [customerCharge, setCustomerCharge] = useState<string>('20');
  const [bankCommission, setBankCommission] = useState<string>('8');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [aadhaarLast4, setAadhaarLast4] = useState<string>('');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill commission defaults when category or amount changes
  const handleCategoryChange = (cat: ServiceCategory) => {
    setServiceCategory(cat);
    if (cat === 'AEPS_WITHDRAWAL') {
      setTransactionType('outflow'); // Shopkeeper gives cash out
    } else {
      setTransactionType('inflow'); // Shopkeeper takes cash/payment in
    }

    const currentAmt = Number(amount) || 0;
    const { customerCharge: cc, bankCommission: bc } = calculateDefaultCommission(cat, currentAmt);
    setCustomerCharge(cc.toString());
    setBankCommission(bc.toString());
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val) || 0;
    const { customerCharge: cc, bankCommission: bc } = calculateDefaultCommission(serviceCategory, num);
    setCustomerCharge(cc.toString());
    setBankCommission(bc.toString());
  };

  const netProfit = (Number(customerCharge) || 0) + (Number(bankCommission) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('mfjsk_auth_token');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: getTodayDateString(),
          time: getCurrentTimeString(),
          customerName: customerName.trim() || 'Walk-in Customer',
          customerMobile: customerMobile.trim(),
          serviceCategory,
          transactionType,
          amount: Number(amount),
          customerCharge: Number(customerCharge) || 0,
          bankCommission: Number(bankCommission) || 0,
          netProfit,
          paymentMode,
          referenceNumber: referenceNumber.trim(),
          aadhaarLast4: aadhaarLast4.trim(),
          bankName: bankName.trim(),
          notes: notes.trim(),
          status: 'COMPLETED',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save transaction');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Server error saving transaction');
      setLoading(false);
    }
  };

  return (
    <div id="transaction-modal-backdrop" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl relative text-zinc-900 my-6 font-mono">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>{t.addTransactionTitle}</span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Service Category Selector */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
              {t.serviceCategory}
            </label>
            <select
              id="service-category-select"
              value={serviceCategory}
              onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory)}
              className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
            >
              {Object.entries(serviceCategoryLabels).map(([catKey, val]) => (
                <option key={catKey} value={catKey}>
                  {val[language]} ({val.defaultCommissionRate})
                </option>
              ))}
            </select>
          </div>

          {/* Flow Direction & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                Cash Flow (लेनदेन दिशा)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType('inflow')}
                  className={`py-2 px-3 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    transactionType === 'inflow'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jama / In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('outflow')}
                  className={`py-2 px-3 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    transactionType === 'outflow'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                  <span>Nikasi / Out</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                {t.amountVolume} (₹)
              </label>
              <input
                id="transaction-amount-input"
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="₹ 0.00"
                required
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 font-mono font-bold outline-none"
              />
            </div>
          </div>

          {/* Commission & Net Profit Breakdown */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded space-y-2.5">
            <div className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 flex items-center justify-between">
              <span>Commission & Profit Calculation</span>
              <span className="text-zinc-500 font-normal">Real-time auto compute</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 block mb-1 font-semibold">
                  Customer Fee (₹)
                </label>
                <input
                  type="number"
                  value={customerCharge}
                  onChange={(e) => setCustomerCharge(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs text-zinc-900 font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 block mb-1 font-semibold">
                  Bank Comm (₹)
                </label>
                <input
                  type="number"
                  value={bankCommission}
                  onChange={(e) => setBankCommission(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-xs text-zinc-900 font-mono outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                <span className="text-[9px] text-emerald-800 uppercase font-bold tracking-widest block">
                  Net Shop Profit
                </span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  + ₹{netProfit}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                {t.customerName}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rashid Khan"
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                {t.customerMobile}
              </label>
              <input
                type="tel"
                maxLength={10}
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 9837123456"
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* Payment Mode & Bank/Aadhaar details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                {t.paymentMode}
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-2 text-xs text-zinc-900 outline-none"
              >
                <option value="CASH">Cash (नकद)</option>
                <option value="UPI_PHONEPE">PhonePe UPI</option>
                <option value="UPI_GPAY">Google Pay UPI</option>
                <option value="UPI_PAYTM">Paytm UPI</option>
                <option value="BANK_TRANSFER">Bank IMPS/NEFT</option>
                <option value="CARD">Debit / ATM Card</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                Aadhaar Last 4
              </label>
              <input
                type="text"
                maxLength={4}
                value={aadhaarLast4}
                onChange={(e) => setAadhaarLast4(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 4512"
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-2 text-xs text-zinc-900 font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
                {t.referenceNo}
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="RRN / UTR / Ack"
                className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-2 text-xs text-zinc-900 font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1 block">
              {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pension withdrawal, UPPCL bill, Ration card KYC..."
              className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-mono uppercase tracking-wider text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              id="save-transaction-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : t.saveBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
