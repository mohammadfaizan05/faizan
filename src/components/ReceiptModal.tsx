import React from 'react';
import { Printer, X, CheckCircle2, Shield, Landmark } from 'lucide-react';
import { Transaction, Language } from '../types';
import { formatINR, formatDateIndian } from '../utils/formatters';
import { serviceCategoryLabels } from '../utils/translations';

interface ReceiptModalProps {
  transaction: Transaction | null;
  language: Language;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, language, onClose }) => {
  if (!transaction) return null;

  const catMeta = serviceCategoryLabels[transaction.serviceCategory] || {
    hi: transaction.serviceCategory,
    en: transaction.serviceCategory,
    hinglish: transaction.serviceCategory,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div className="bg-white border border-zinc-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative text-zinc-900 my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Digital & Thermal Customer Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt-area" className="p-6 bg-white text-zinc-900 font-sans print:p-0 print:m-0">
          {/* Shop Header */}
          <div className="text-center border-b-2 border-zinc-900 pb-3 font-mono">
            <div className="inline-flex items-center justify-center gap-1.5 font-black text-base text-zinc-900 uppercase tracking-tight font-editorial-serif">
              🏛️ Mohammad Faizan Jan Seva Kendra
            </div>
            <p className="text-[11px] font-semibold text-zinc-700 mt-0.5">
              दैनिक एवं मासिक वित्तीय हिसाब-किताब व डिजिटल सेवा केंद्र
            </p>
            <div className="text-[10px] text-zinc-600 mt-1 flex items-center justify-center gap-3 font-mono">
              <span>Admin: <strong>Mohammad Faizan</strong></span>
              <span>•</span>
              <span>Mob: <strong>+91 9045174146</strong></span>
            </div>
            <div className="mt-1.5 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-950 text-[9px] font-bold tracking-widest uppercase rounded">
              GOVERNMENT & AEPS DIGITALLY VERIFIED TRANSACTION
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="py-3 border-b border-dashed border-zinc-400 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-600">Receipt / Tx ID:</span>
              <span className="font-bold">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Date & Time:</span>
              <span className="font-medium">{formatDateIndian(transaction.date)} at {transaction.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Customer Name:</span>
              <span className="font-bold">{transaction.customerName}</span>
            </div>
            {transaction.customerMobile && (
              <div className="flex justify-between">
                <span className="text-zinc-600">Customer Mobile:</span>
                <span>{transaction.customerMobile}</span>
              </div>
            )}
            {transaction.aadhaarLast4 && (
              <div className="flex justify-between">
                <span className="text-zinc-600">Aadhaar (Last 4):</span>
                <span>XXXX-XXXX-{transaction.aadhaarLast4}</span>
              </div>
            )}
            {transaction.bankName && (
              <div className="flex justify-between">
                <span className="text-zinc-600">Bank Name:</span>
                <span>{transaction.bankName}</span>
              </div>
            )}
            {transaction.referenceNumber && (
              <div className="flex justify-between">
                <span className="text-zinc-600">RRN / UTR / Ack No:</span>
                <span className="font-bold text-zinc-900">{transaction.referenceNumber}</span>
              </div>
            )}
          </div>

          {/* Service & Payment Breakdown */}
          <div className="py-3 border-b-2 border-zinc-900 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
              <span>Service Type:</span>
              <span className="text-right font-sans font-bold">{catMeta[language]}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>Payment Mode:</span>
              <span className="font-semibold text-zinc-900">{transaction.paymentMode.replace(/_/g, ' ')}</span>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-700">Principal Volume / Amount:</span>
                <span className="font-semibold">{formatINR(transaction.amount)}</span>
              </div>
              {transaction.customerCharge > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Service Fee / Portal Charge:</span>
                  <span>+ {formatINR(transaction.customerCharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-zinc-950 pt-1 border-t border-zinc-300 font-mono">
                <span>Total Net Settled:</span>
                <span className="font-bold text-base">{formatINR(transaction.amount + (transaction.customerCharge || 0))}</span>
              </div>
            </div>
          </div>

          {/* Status & Security Stamp */}
          <div className="pt-4 flex items-center justify-between font-mono">
            <div className="text-left">
              <div className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>STATUS: SUCCESSFUL</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Authorized by Mohammad Faizan Jan Seva Kendra
              </p>
            </div>

            <div className="text-center border border-zinc-400 p-1.5 rounded text-[9px] text-zinc-600">
              <Shield className="w-3 h-3 text-zinc-700 mx-auto" />
              OFFICIAL CSC SEAL
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 pt-2 border-t border-dashed border-zinc-300 text-center text-[10px] text-zinc-500 font-mono">
            Thank you for choosing our Digital Banking & Jan Seva Kendra services!
            <br />
            For any queries, please call: <strong>9045174146</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
