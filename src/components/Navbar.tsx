import React from 'react';
import {
  BookOpen,
  Users,
  Coins,
  BarChart3,
  Receipt,
  ShieldCheck,
  PlusCircle,
  LogOut,
  Languages,
  Shield,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  activeTab: 'ledger' | 'khata' | 'drawer' | 'reports' | 'expenses' | 'audit';
  setActiveTab: (tab: 'ledger' | 'khata' | 'drawer' | 'reports' | 'expenses' | 'audit') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenNewTransaction: () => void;
  onLogout: () => void;
  adminProfile: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenNewTransaction,
  onLogout,
  adminProfile,
}) => {
  const t = translations[language];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
      {/* Top Banner with Store Profile, Admin Details & Language Switcher */}
      <div className="border-b border-zinc-100 px-4 py-2 bg-zinc-50/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold uppercase tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              EST. 2024 • CSC & DIGITAL BANKING
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-zinc-600 text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Admin: <span className="text-zinc-900 font-semibold">Mohammad Faizan</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-600 text-xs font-mono">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              +91 9045174146
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-zinc-500 font-mono text-[11px]">
              Dev: <span className="text-zinc-700 font-medium">Mohammad Shahrukh</span>
            </span>
            <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2 py-0.5 rounded shadow-2xs">
              <Languages className="w-3 h-3 text-emerald-600" />
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 text-[11px] font-mono transition-colors cursor-pointer rounded ${
                  language === 'hi' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                हिंदी
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setLanguage('hinglish')}
                className={`px-1.5 py-0.5 text-[11px] font-mono transition-colors cursor-pointer rounded ${
                  language === 'hinglish' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Hinglish
              </button>
              <span className="text-zinc-300">|</span>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 text-[11px] font-mono transition-colors cursor-pointer rounded ${
                  language === 'en' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar with Editorial Styling */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            id="nav-tab-ledger"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'ledger' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{t.navDailyLedger}</span>
          </button>

          <button
            id="nav-tab-khata"
            onClick={() => setActiveTab('khata')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'khata'
                ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === 'khata' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{t.navKhataBook}</span>
          </button>

          <button
            id="nav-tab-drawer"
            onClick={() => setActiveTab('drawer')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'drawer'
                ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${activeTab === 'drawer' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{t.navCashDrawer}</span>
          </button>

          <button
            id="nav-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'reports' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{t.navReports}</span>
          </button>

          <button
            id="nav-tab-expenses"
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <Receipt className={`w-3.5 h-3.5 ${activeTab === 'expenses' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{t.navExpenses}</span>
          </button>

          <button
            id="nav-tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-zinc-900 text-white border border-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'audit' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{t.navAuditLogs}</span>
          </button>
        </nav>

        {/* Action Controls: Quick Add & Logout */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="quick-add-transaction-btn"
            onClick={onOpenNewTransaction}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">{t.quickNewEntry}</span>
            <span className="sm:hidden">+ Entry</span>
          </button>

          <button
            id="logout-btn"
            onClick={onLogout}
            title={t.logoutBtn}
            className="p-1.5 bg-zinc-100 hover:bg-red-50 text-zinc-600 hover:text-red-600 border border-zinc-200 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

