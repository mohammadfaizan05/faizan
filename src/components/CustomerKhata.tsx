import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  MessageSquare,
  ArrowDownRight,
  ArrowUpRight,
  Printer,
  Trash2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Customer, Language, CustomerKhataEntry, PaymentMode } from '../types';
import { translations } from '../utils/translations';
import { formatINR, formatDateIndian, getTodayDateString, getCurrentTimeString } from '../utils/formatters';

interface CustomerKhataProps {
  language: Language;
}

export const CustomerKhata: React.FC<CustomerKhataProps> = ({ language }) => {
  const t = translations[language];

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [isKhataEntryOpen, setIsKhataEntryOpen] = useState<boolean>(false);
  const [entryType, setEntryType] = useState<'jama' | 'udhar'>('udhar');
  const [entryAmount, setEntryAmount] = useState<string>('');
  const [entryDesc, setEntryDesc] = useState<string>('');
  const [entryPaymentMode, setEntryPaymentMode] = useState<PaymentMode>('CASH');

  // New Customer Form State
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustMobile, setNewCustMobile] = useState<string>('');
  const [newCustArea, setNewCustArea] = useState<string>('');
  const [newCustAadhaar, setNewCustAadhaar] = useState<string>('');
  const [newCustOpeningUdhar, setNewCustOpeningUdhar] = useState<string>('0');
  const [newCustNotes, setNewCustNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(data.customers || []);

      // If a customer was selected, refresh their data
      if (selectedCustomer) {
        const found = (data.customers || []).find((c: Customer) => c.id === selectedCustomer.id);
        if (found) setSelectedCustomer(found);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustMobile.trim()) {
      setActionError('Customer Name and Mobile Number are required.');
      return;
    }

    setSubmitting(true);
    setActionError(null);
    const token = localStorage.getItem('mfjsk_auth_token');

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCustName.trim(),
          mobile: newCustMobile.trim(),
          villageOrArea: newCustArea.trim(),
          aadhaarLast4: newCustAadhaar.trim(),
          initialUdhar: Number(newCustOpeningUdhar) || 0,
          notes: newCustNotes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to add customer');
        setSubmitting(false);
        return;
      }

      setIsAddCustomerOpen(false);
      setNewCustName('');
      setNewCustMobile('');
      setNewCustArea('');
      setNewCustAadhaar('');
      setNewCustOpeningUdhar('0');
      setNewCustNotes('');
      fetchCustomers();
    } catch (err) {
      setActionError('Server error creating customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddKhataEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !entryAmount || Number(entryAmount) <= 0) {
      setActionError('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    setActionError(null);
    const token = localStorage.getItem('mfjsk_auth_token');

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: entryType,
          amount: Number(entryAmount),
          description: entryDesc.trim() || (entryType === 'jama' ? 'Cash Received' : 'Udhar / Service given'),
          paymentMode: entryPaymentMode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Failed to record entry');
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      setSelectedCustomer(data.customer);
      setIsKhataEntryOpen(false);
      setEntryAmount('');
      setEntryDesc('');
      fetchCustomers();
    } catch (err) {
      setActionError('Server error recording entry');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp 1-Click Reminder Generator
  const generateWhatsAppReminder = (customer: Customer) => {
    const shopName = 'Mohammad Faizan Jan Seva Kendra';
    const mobile = '9045174146';
    const dueAmount = customer.balanceDue;

    if (dueAmount <= 0) {
      alert(`Customer has no pending dues (Current balance: ₹${dueAmount})`);
      return;
    }

    const message = `🙏 नमस्ते ${customer.name} जी,\n\nयह *${shopName}* (संचालक: मोहम्मद फैज़ान) की तरफ से आपके जन सेवा केंद्र / AEPS खाते का विनम्र भुगतान संदेश है।\n\n💰 आपका कुल बकाया उधार: *${formatINR(dueAmount)}*\n📅 अंतिम लेनदेन तिथि: ${formatDateIndian(customer.lastTransactionDate)}\n\nकृपया सुविधा अनुसार अपनी बकाया राशि का भुगतान नकद या PhonePe / GooglePay / Paytm UPI द्वारा (+91 ${mobile}) पर करने की कृपा करें।\n\nधन्यवाद!\n*${shopName}*\nसम्पर्क: ${mobile}`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/91${customer.mobile}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Outstanding Metrics
  const totalMarketUdhar = customers.reduce((sum, c) => sum + (c.balanceDue > 0 ? c.balanceDue : 0), 0);
  const totalAdvanceJama = customers.reduce((sum, c) => sum + (c.balanceDue < 0 ? Math.abs(c.balanceDue) : 0), 0);

  return (
    <div id="customer-khata-view" className="space-y-6">
      {/* Editorial Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              CUSTOMER CREDIT & LEDGER RECOVERY (ग्राहक खाता बही)
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-zinc-900 font-editorial-serif">
              Khata Passbook <span className="text-zinc-400 font-sans font-light">/ UDHAR & JAMA</span>
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-1">
              दुकानदार व ग्राहक उधारी-जमा हिसाब • 1-क्लिक व्हाट्सएप तगादा रिमाइंडर एवं लेजर पासबुक
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="add-new-customer-btn"
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>{t.addNewCustomer}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Khata Summary Cards - Editorial Minimalist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block">{t.totalMarketUdhar}</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-light tracking-tight text-red-600 font-mono">
              {formatINR(totalMarketUdhar)}
            </span>
            <span className="text-[10px] text-red-700 font-mono uppercase tracking-wider font-semibold">Pending Recovery</span>
          </div>
        </div>

        <div className="border border-zinc-200 p-4 bg-white rounded shadow-2xs">
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block">{t.totalAdvanceJama}</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-light tracking-tight text-emerald-700 font-mono">
              {formatINR(totalAdvanceJama)}
            </span>
            <span className="text-[10px] text-emerald-700 font-mono uppercase tracking-wider font-semibold">Advance Balance</span>
          </div>
        </div>

        <div className="border border-zinc-200 p-4 bg-white rounded shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest block">Registered Customers</span>
            <span className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 font-mono mt-1 block">
              {customers.length} <span className="text-xs text-zinc-500 font-normal">ACCOUNTS</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-zinc-600 font-mono text-xs font-semibold">
            KHATA_ACTIVE
          </div>
        </div>
      </div>

      {/* Main Khata Workspace (Split View: Customer Directory & Detail Ledger) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Customer Directory */}
        <div className="lg:col-span-5 border border-zinc-200 bg-white rounded shadow-2xs overflow-hidden flex flex-col h-[650px]">
          {/* Search Header */}
          <div className="p-3 border-b border-zinc-200 bg-zinc-50">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Customer Name or Mobile..."
                className="w-full bg-white border border-zinc-200 focus:border-emerald-600 rounded pl-9 pr-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* Customer Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">LOADING CUSTOMER DIRECTORY...</div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs space-y-3 font-mono">
                <p className="font-medium text-zinc-700">No customer accounts recorded in Khata yet.</p>
                <button
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs uppercase tracking-wider shadow-sm"
                >
                  + Add First Customer
                </button>
              </div>
            ) : (
              customers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-3 border-emerald-600'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5 font-sans">
                          <span>{cust.name}</span>
                          {cust.villageOrArea && (
                            <span className="text-[10px] text-zinc-500 font-normal">
                              ({cust.villageOrArea})
                            </span>
                          )}
                        </h4>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          📱 {cust.mobile}
                          {cust.aadhaarLast4 && ` • UID: **${cust.aadhaarLast4}`}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs font-mono font-bold ${
                            cust.balanceDue > 0
                              ? 'text-red-600'
                              : cust.balanceDue < 0
                              ? 'text-emerald-700'
                              : 'text-zinc-400'
                          }`}
                        >
                          {cust.balanceDue > 0
                            ? `Udhar: ${formatINR(cust.balanceDue)}`
                            : cust.balanceDue < 0
                            ? `Advance: ${formatINR(Math.abs(cust.balanceDue))}`
                            : 'Settled ₹0'}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {formatDateIndian(cust.lastTransactionDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Khata Passbook & Quick Actions */}
        <div className="lg:col-span-7 border border-zinc-200 bg-white rounded shadow-2xs overflow-hidden flex flex-col h-[650px]">
          {selectedCustomer ? (
            <>
              {/* Selected Customer Top Bar */}
              <div className="p-3.5 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 font-sans">{selectedCustomer.name}</h3>
                    <span className="text-xs text-zinc-600 font-mono">({selectedCustomer.mobile})</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {selectedCustomer.address || selectedCustomer.villageOrArea || 'Customer Khata Record'}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateWhatsAppReminder(selectedCustomer)}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-zinc-300 text-zinc-800 font-mono text-[11px] uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setEntryType('jama');
                      setIsKhataEntryOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[11px] uppercase tracking-wider rounded transition-colors cursor-pointer shadow-2xs"
                  >
                    + {t.jamaCredit}
                  </button>

                  <button
                    onClick={() => {
                      setEntryType('udhar');
                      setIsKhataEntryOpen(true);
                    }}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-mono font-bold text-[11px] uppercase tracking-wider rounded transition-colors cursor-pointer shadow-2xs"
                  >
                    - {t.udharDebit}
                  </button>
                </div>
              </div>

              {/* Outstanding Balance Banner */}
              <div className={`p-4 border-b flex items-center justify-between font-mono ${
                selectedCustomer.balanceDue > 0
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : selectedCustomer.balanceDue < 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 block font-bold">
                    Current Net Account Status
                  </span>
                  <div className="text-xl font-light tracking-tight mt-0.5">
                    {selectedCustomer.balanceDue > 0 ? (
                      <span className="text-red-700 font-bold">Total Udhar Due: {formatINR(selectedCustomer.balanceDue)}</span>
                    ) : selectedCustomer.balanceDue < 0 ? (
                      <span className="text-emerald-700 font-bold">Advance Deposited: {formatINR(Math.abs(selectedCustomer.balanceDue))}</span>
                    ) : (
                      <span className="text-zinc-600 font-semibold">Account Fully Settled (₹0.00)</span>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-zinc-600">
                  <div>Udhar Given: <strong className="text-zinc-900">{formatINR(selectedCustomer.totalUdhar)}</strong></div>
                  <div>Jama Paid: <strong className="text-zinc-900">{formatINR(selectedCustomer.totalJama)}</strong></div>
                </div>
              </div>

              {/* Passbook Transaction History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-white">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 flex items-center justify-between font-bold">
                  <span>Khata Ledger Entries ({selectedCustomer.history?.length || 0})</span>
                  <span>Sorted latest first</span>
                </div>

                {(!selectedCustomer.history || selectedCustomer.history.length === 0) ? (
                  <div className="text-center py-12 text-zinc-500 text-xs font-mono">
                    No entries recorded yet for this customer.
                  </div>
                ) : (
                  selectedCustomer.history.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-between text-xs font-mono"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                              entry.type === 'jama'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-red-50 border-red-300 text-red-800'
                            }`}
                          >
                            {entry.type === 'jama' ? 'Jama (+)' : 'Udhar (-)'}
                          </span>
                          <span className="font-semibold text-zinc-900 font-sans">{entry.description}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {formatDateIndian(entry.date)} at {entry.time} • via {entry.paymentMode}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-bold text-sm ${
                            entry.type === 'jama' ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {entry.type === 'jama' ? '+' : '-'} {formatINR(entry.amount)}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Bal: {formatINR(entry.balanceAfter)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-xs font-mono">
              <Users className="w-10 h-10 text-zinc-300 mb-3" />
              <h4 className="text-sm font-semibold text-zinc-700">Select a Customer Account</h4>
              <p className="text-zinc-500 max-w-xs mt-1">
                Choose a customer from the left directory to view passbook history, record Jama/Udhar, or send WhatsApp reminders.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 text-zinc-900">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{t.addNewCustomer}</span>
            </h3>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-mono">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 font-mono">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Customer Name (ग्राहक का नाम) *
                </label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  required
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9045174146"
                    required
                    className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                    Aadhaar Last 4
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newCustAadhaar}
                    onChange={(e) => setNewCustAadhaar(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="8834"
                    className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Village / Area (पता / मोहल्ला)
                </label>
                <input
                  type="text"
                  value={newCustArea}
                  onChange={(e) => setNewCustArea(e.target.value)}
                  placeholder="e.g. Main Bazaar / Ward 2"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Opening Udhar Balance (पुराना बकाया ₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCustOpeningUdhar}
                  onChange={(e) => setNewCustOpeningUdhar(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold uppercase tracking-wider rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Jama / Udhar Entry */}
      {isKhataEntryOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 text-zinc-900 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                entryType === 'jama' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
              }`}>
                {entryType === 'jama' ? 'जमा (Jama +)' : 'उधार (Udhar -)'}
              </span>
              <span>for {selectedCustomer.name}</span>
            </h3>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddKhataEntry} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Amount (राशि ₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  placeholder="₹ 0.00"
                  required
                  autoFocus
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2.5 text-base font-mono font-bold text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Description / Service Details (विवरण)
                </label>
                <input
                  type="text"
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  placeholder={entryType === 'jama' ? 'e.g. Cash paid in person' : 'e.g. Bijli Bill / Form on credit'}
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3.5 py-2 text-xs text-zinc-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold block mb-1">
                  Payment Mode
                </label>
                <select
                  value={entryPaymentMode}
                  onChange={(e) => setEntryPaymentMode(e.target.value as PaymentMode)}
                  className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-3 py-2 text-xs text-zinc-900 outline-none"
                >
                  <option value="CASH">Cash (नकद)</option>
                  <option value="UPI_PHONEPE">PhonePe UPI</option>
                  <option value="UPI_GPAY">Google Pay UPI</option>
                  <option value="UPI_PAYTM">Paytm UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKhataEntryOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold uppercase tracking-wider rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded cursor-pointer shadow-sm ${
                    entryType === 'jama' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {submitting ? 'Saving...' : `Confirm ${entryType === 'jama' ? 'Jama (+)' : 'Udhar (-)'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
