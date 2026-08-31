import React from 'react';
import { ShieldCheck, PhoneCall, Mail, Code, Landmark, Heart } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer id="main-footer" className="mt-20 border-t border-zinc-200 text-zinc-600 text-xs py-10 px-4 print:hidden bg-zinc-50/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Store Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm tracking-tight font-editorial-serif">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-base uppercase">Mohammad Faizan Jan Seva Kendra</span>
          </div>
          <p className="text-xs text-zinc-600 max-w-xl font-sans">
            दैनिक एवं मासिक वित्तीय हिसाब-किताब व डिजिटल सेवा केंद्र • AEPS, मनी ट्रांसफर, बिल भुगतान, ग्राहक खाता बही एवं गल्ला मिलान पोर्टल।
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-600 font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              <span>Admin: <strong className="text-zinc-900">Mohammad Faizan</strong> (+91 9045174146)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-emerald-600" />
              <span>faizantaj9045@gmail.com</span>
            </span>
          </div>
        </div>

        {/* Right Developer & Security Credit */}
        <div className="flex flex-col md:items-end gap-2.5 font-mono">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded text-zinc-800 text-[11px] shadow-2xs">
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>Developed by: <strong className="text-emerald-700 font-bold">Mohammad Shahrukh</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>2-Step Cryptographic 2FA & Audit Trail Active</span>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} MOHAMMAD FAIZAN JAN SEVA KENDRA. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};
