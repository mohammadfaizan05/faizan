import React, { useState, useEffect } from 'react';
import {
  Receipt,
  PlusCircle,
  Trash2,
  Calendar,
  Layers,
  Wallet,
  Tag,
  DollarSign,
} from 'lucide-react';
import { ExpenseRecord, Language, PaymentMode } from '../types';
import { translations } from '../utils/translations';
import { formatINR, formatDateIndian, getTodayDateString } from '../utils/formatters';

interface ExpensesManagerProps {
  language: Language;
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ language }) => {
  const t = translations[language];

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  // Form fields
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ExpenseRecord['category']>('PAPER_STATIONERY');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchExpenses = async () => {
    setLoading(true);
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      const res = await fetch('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    const token = localStorage.getItem('mfjsk_auth_token');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          amount: Number(amount),
          paymentMode,
          notes: notes.trim(),
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        setTitle('');
        setAmount('');
        setNotes('');
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error creating expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Delete this expense entry?')) return;
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div id="expenses-view" className="space-y-6">
      {/* Editorial Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              SHOP OPERATING EXPENSES (दुकान खर्च प्रबंधन)
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-zinc-900 font-editorial-serif">
              Expenditures <span className="text-zinc-400 font-sans font-light">/ OPEX LOG</span>
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-1">
              कागज़, इंक, बिजली बिल, दुकान किराया, चाय-नाश्ता एवं मशीन मेंटेनेंस खर्च
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono border-r border-zinc-200 pr-4">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 block font-bold">Total Recorded Expenses</span>
              <span className="text-xl md:text-2xl font-light tracking-tight text-red-600">
                -{formatINR(totalExpenseSum)}
              </span>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="border border-zinc-200 bg-white rounded shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-200 flex items-center justify-between font-mono bg-zinc-50">
          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            Recorded Expense Items ({expenses.length})
          </span>
          <span className="text-[10px] text-zinc-500 font-semibold">OPEX_ENTRIES</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">LOADING EXPENSES...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs space-y-3 font-mono">
            <p className="font-medium text-zinc-700">No shop expenses recorded yet.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs uppercase tracking-wider cursor-pointer shadow-sm font-semibold"
            >
              + Record First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-mono tracking-wider">
                  <th className="py-2.5 px-4 font-bold">Date & Time</th>
                  <th className="py-2.5 px-4 font-bold">Expense Title</th>
                  <th className="py-2.5 px-4 font-bold">Category</th>
                  <th className="py-2.5 px-4 font-bold">Payment Mode</th>
                  <th className="py-2.5 px-4 font-bold text-right">Amount (₹)</th>
                  <th className="py-2.5 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {formatDateIndian(exp.date)} • {exp.time}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      <div>{exp.title}</div>
                      {exp.notes && <div className="text-[10px] text-zinc-500 font-normal font-mono">{exp.notes}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded text-[10px] font-medium">
                        {exp.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 font-mono">{exp.paymentMode}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-red-600">
                      -{formatINR(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Expense */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-md p-6 space-y-4 text-zinc-900 shadow-2xl font-mono">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-600" />
              <span>Record New Shop Expense</span>
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Expense Title (खर्च का नाम) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Photocopy Paper 75 GSM, Electricity Bill, Tea"
                  required
                  autoFocus
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₹ 0.00"
                    required
                    className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs font-mono font-bold text-zinc-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-2 text-xs text-zinc-900 outline-none"
                  >
                    <option value="CASH">Cash (नकद)</option>
                    <option value="UPI_PHONEPE">PhonePe UPI</option>
                    <option value="UPI_GPAY">Google Pay</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseRecord['category'])}
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                >
                  <option value="PAPER_STATIONERY">Paper & Stationery (कागज़ / स्याही)</option>
                  <option value="ELECTRICITY_INTERNET">Electricity & Internet (बिजली / नेट)</option>
                  <option value="SHOP_RENT">Shop Rent (दुकान किराया)</option>
                  <option value="TEA_SNACKS">Tea & Refreshments (चाय / नाश्ता)</option>
                  <option value="MAINTENANCE">Machine / Printer Maintenance</option>
                  <option value="STAFF_HELPER">Helper / Staff Salary</option>
                  <option value="OTHER">Other Operating Expense</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Vendor name, bill receipt number..."
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold uppercase tracking-wider rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
