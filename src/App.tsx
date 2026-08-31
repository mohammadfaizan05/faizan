import React, { useState, useEffect } from 'react';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { DailyLedger } from './components/DailyLedger';
import { CustomerKhata } from './components/CustomerKhata';
import { CashDrawer } from './components/CashDrawer';
import { AnalyticsReports } from './components/AnalyticsReports';
import { ExpensesManager } from './components/ExpensesManager';
import { AuditLogsViewer } from './components/AuditLogsViewer';
import { TransactionModal } from './components/TransactionModal';
import { Footer } from './components/Footer';
import { Language } from './types';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<'ledger' | 'khata' | 'drawer' | 'reports' | 'expenses' | 'audit'>('ledger');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isNewTxOpen, setIsNewTxOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Check existing session token on startup
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('mfjsk_auth_token');
      if (!token) {
        setCheckingAuth(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminProfile(data.user);
        } else {
          localStorage.removeItem('mfjsk_auth_token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (session: { token: string; user: any }) => {
    setIsAuthenticated(true);
    setAdminProfile(session.user);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('mfjsk_auth_token');
    localStorage.removeItem('mfjsk_user_profile');
    setIsAuthenticated(false);
    setAdminProfile(null);
  };

  const handleTransactionSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-zinc-600 gap-3 font-mono">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold">Verifying 2FA Security Credentials...</span>
      </div>
    );
  }

  // If not authenticated, show the 2-Step Real Gmail OTP login screen
  if (!isAuthenticated) {
    return <AuthModal language={language} onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-950 font-mono">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenNewTransaction={() => setIsNewTxOpen(true)}
        onLogout={handleLogout}
        adminProfile={adminProfile}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'ledger' && (
          <DailyLedger
            key={`ledger-${refreshKey}`}
            language={language}
            onOpenNewTransaction={() => setIsNewTxOpen(true)}
          />
        )}

        {activeTab === 'khata' && (
          <CustomerKhata key={`khata-${refreshKey}`} language={language} />
        )}

        {activeTab === 'drawer' && (
          <CashDrawer key={`drawer-${refreshKey}`} language={language} />
        )}

        {activeTab === 'reports' && (
          <AnalyticsReports key={`reports-${refreshKey}`} language={language} />
        )}

        {activeTab === 'expenses' && (
          <ExpensesManager key={`expenses-${refreshKey}`} language={language} />
        )}

        {activeTab === 'audit' && (
          <AuditLogsViewer key={`audit-${refreshKey}`} language={language} />
        )}
      </main>

      {/* New Transaction Modal */}
      {isNewTxOpen && (
        <TransactionModal
          language={language}
          onClose={() => setIsNewTxOpen(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Store Footer */}
      <Footer language={language} />
    </div>
  );
}

