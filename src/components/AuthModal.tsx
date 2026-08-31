import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface AuthModalProps {
  language: Language;
  onSuccess: (session: { token: string; user: any }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, onSuccess }) => {
  const t = translations[language];
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tempSessionId, setTempSessionId] = useState('');
  const [targetEmailMasked, setTargetEmailMasked] = useState('f***5@gmail.com');
  const [isRealSmtp, setIsRealSmtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [resending, setResending] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (step === 2 && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Step 1: Verify Master Password
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter master password');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/step1-verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Password verification failed');
        if (data.locked) setIsLocked(true);
        if (data.remainingAttempts !== undefined) setRemainingAttempts(data.remainingAttempts);
        setLoading(false);
        return;
      }

      setTempSessionId(data.tempSessionId);
      setTargetEmailMasked(data.targetEmail || 'faizantaj9045@gmail.com');
      setIsRealSmtp(data.isRealSmtp);
      setTimerSeconds(data.expiresInSeconds || 300);
      setStep(2);
      setSuccessMsg(data.message || 'OTP sent successfully to faizantaj9045@gmail.com');
    } catch (err: any) {
      setError('Connection error with server. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      setError('Please enter 6-digit numeric OTP code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/step2-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempSessionId, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP code');
        setLoading(false);
        return;
      }

      // Store in localStorage for session permanence
      localStorage.setItem('mfjsk_auth_token', data.token);
      localStorage.setItem('mfjsk_user_profile', JSON.stringify(data.user));

      onSuccess(data);
    } catch (err: any) {
      setError('Failed to verify OTP with server');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resending || !tempSessionId) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempSessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimerSeconds(300);
        setSuccessMsg(data.message || 'Fresh OTP code resent to your Gmail inbox.');
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error resending OTP');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="auth-screen-wrapper" className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden text-zinc-900 selection:bg-emerald-600 selection:text-white">
      {/* Background Decorative Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-200/50 via-zinc-100 to-zinc-100 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Login Card */}
      <div id="auth-card" className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden relative z-10 font-mono">
        {/* Header Ribbon */}
        <div className="bg-zinc-50 px-6 py-6 border-b border-zinc-200 text-center relative">
          <div className="inline-flex p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700 mb-3 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-[10px] text-emerald-800 uppercase tracking-widest font-bold mb-1">
            SECURE MANAGEMENT PORTAL
          </div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase font-editorial-serif">
            Mohammad Faizan Jan Seva Kendra
          </h1>
          <p className="text-xs text-zinc-600 font-sans mt-1">
            दैनिक एवं मासिक वित्तीय हिसाब-किताब पोर्टल
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white border border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-700 shadow-2xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            2-Step Real Gmail 2FA Enabled
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Notification Messages */}
          {error && (
            <div id="auth-error-box" className="p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 font-medium">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div id="auth-success-box" className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: MASTER PASSWORD */
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                    {t.masterPasswordLabel}
                  </label>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Step 1 of 2</span>
                </div>
                <div className="relative">
                  <input
                    id="master-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Master Password..."
                    disabled={isLocked || loading}
                    className="w-full bg-white border border-zinc-300 focus:border-emerald-600 rounded px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none font-mono"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                  Admin: <strong className="text-zinc-800">Mohammad Faizan</strong> • Registered: 9045174146
                </p>
              </div>

              <button
                id="step1-submit-btn"
                type="submit"
                disabled={loading || isLocked}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>{t.sendOtpBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 6-DIGIT REAL GMAIL OTP */
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    Dispatched to:
                  </span>
                  <span className="font-mono font-semibold text-emerald-700">
                    faizantaj9045@gmail.com
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                  Please open your Gmail inbox (or Spam folder) for the 6-digit security code.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                    6-Digit Security OTP (ओटीपी)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-700">
                    ⏳ {formatTimer(timerSeconds)}
                  </span>
                </div>
                <input
                  id="otp-input-field"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  disabled={loading}
                  className="w-full bg-white border-2 border-emerald-600 focus:border-emerald-700 rounded py-2.5 px-4 text-center text-2xl font-mono tracking-widest text-emerald-800 placeholder-zinc-300 outline-none transition-all"
                  autoFocus
                />
              </div>

              <button
                id="step2-verify-btn"
                type="submit"
                disabled={loading || otp.length < 6 || timerSeconds <= 0}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.verifyOtpBtn}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-900 uppercase tracking-wider text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  ← Back to Password
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-emerald-700 hover:text-emerald-800 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  {t.resendOtp}
                </button>
              </div>
            </form>
          )}

          {/* Security Footer Details */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col items-center gap-1 text-center text-[10px] text-zinc-500 uppercase tracking-wider">
            <p>
              🔒 256-Bit Cryptographic 2FA Session • Max 5 Attempts Lockout Protection
            </p>
            <p className="text-zinc-500">
              Developer: <strong className="text-zinc-700">Mohammad Shahrukh</strong> | Portal Version 2.4 Pro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
