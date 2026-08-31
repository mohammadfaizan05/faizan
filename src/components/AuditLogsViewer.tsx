import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, RefreshCw, Lock, Globe } from 'lucide-react';
import { AuditLog, Language } from '../types';
import { translations } from '../utils/translations';

interface AuditLogsViewerProps {
  language: Language;
}

export const AuditLogsViewer: React.FC<AuditLogsViewerProps> = ({ language }) => {
  const t = translations[language];

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('mfjsk_auth_token');
    try {
      const res = await fetch('/api/auth/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div id="audit-logs-view" className="space-y-6">
      {/* Editorial Header Section */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-emerald-700 text-xs font-mono font-bold tracking-widest uppercase mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              SECURITY & CRYPTOGRAPHIC AUDIT TRAIL (सुरक्षा एवं ऑडिट लॉग)
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-zinc-900 font-editorial-serif">
              Audit Logs <span className="text-zinc-400 font-sans font-light">/ SYSTEM TRAIL</span>
            </h1>
            <p className="text-xs text-zinc-600 font-mono mt-1">
              लॉगिन सत्यापन, ओ.टी.पी. डिस्पेच, वित्तीय संशोधन एवं आई.पी. ट्रैकिंग का अपरिवर्तनीय इतिहास
            </p>
          </div>

          <button
            onClick={fetchLogs}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-mono font-bold uppercase tracking-wider rounded border border-zinc-300 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Trail</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-zinc-200 bg-white rounded shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-200 flex items-center justify-between font-mono bg-zinc-50">
          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
            Security Events ({logs.length})
          </span>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            2-Step Real Gmail 2FA Active
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">LOADING AUDIT RECORDS...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs font-mono">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-mono tracking-wider">
                  <th className="py-2.5 px-4 font-bold">Event ID & Time</th>
                  <th className="py-2.5 px-4 font-bold">Action Type</th>
                  <th className="py-2.5 px-4 font-bold">Event Description</th>
                  <th className="py-2.5 px-4 font-bold">Client IP</th>
                  <th className="py-2.5 px-4 font-bold">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                      <div className="font-bold text-zinc-800">{log.id}</div>
                      <div>{log.dateStr}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.severity === 'SUCCESS'
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                            : log.severity === 'DANGER'
                            ? 'bg-red-50 border border-red-300 text-red-700'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-50 border border-amber-300 text-amber-800'
                            : 'bg-zinc-100 border border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {log.severity === 'SUCCESS' && <ShieldCheck className="w-3 h-3 text-emerald-700" />}
                        {log.severity === 'DANGER' && <ShieldAlert className="w-3 h-3 text-red-600" />}
                        {log.severity === 'WARNING' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {log.severity === 'INFO' && <Info className="w-3 h-3 text-zinc-600" />}
                        <span>{log.action}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-zinc-900 font-medium">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-zinc-400" />
                        {log.ip}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-zinc-800 font-mono text-xs font-medium">
                      {log.user || 'Mohammad Faizan'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
