import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { DesireLogo } from '../common/DesireLogo';
import { useTickets } from '../../context/TicketContext';
import { Department } from '../../types';
import { 
  Printer, 
  Download, 
  Building2, 
  Sparkles, 
  Copy, 
  Check, 
  QrCode,
  Info,
  Layers,
  MapPin
} from 'lucide-react';

export const QRCodeGenerator: React.FC = () => {
  const { departments } = useTickets();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [placementLocation, setPlacementLocation] = useState<string>('General Notice Board');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Generate target URL
  const baseUrl = window.location.origin;
  const targetUrl = selectedDept === 'ALL'
    ? `${baseUrl}?raise=true`
    : `${baseUrl}?raise=true&dept=${encodeURIComponent(selectedDept)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Configuration Controls (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Notice Board QR Code Generator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Printable posters for office notice boards, reception, site gates, and department areas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied URL' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Poster (A4)</span>
            </button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              Target Department (Routing)
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Departments (User chooses on landing page)</option>
              {departments.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} — {d.fullName || d.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Selecting a specific department automatically pre-selects it when employees scan this QR code.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              Poster Placement Label
            </label>
            <input
              type="text"
              value={placementLocation}
              onChange={(e) => setPlacementLocation(e.target.value)}
              placeholder="e.g. Reception Desk / Cafeteria / Site Gate 3"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Custom subtitle printed at the bottom of the poster for location attribution.
            </p>
          </div>
        </div>
      </div>

      {/* Printable Poster Preview Container */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-8 sm:p-12 max-w-2xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Poster Top Banner */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex justify-center mb-3">
            <DesireLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-mono font-bold tracking-wider uppercase mb-3">
            Desire Connect · Integrated Water Management
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Scan to Raise an Issue
          </h2>
          <p className="text-base text-slate-700 mt-2 font-medium">
            {selectedDept === 'ALL' ? (
              'Complaints · Technical Issues · Requests · Suggestions'
            ) : (
              <>Direct Desk: <strong className="text-slate-900">{selectedDept} Department</strong></>
            )}
          </p>
        </div>

        {/* Center QR Code */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="p-4 bg-white border-4 border-slate-900 rounded-3xl shadow-sm inline-block">
            <QRCodeCanvas value={targetUrl} size={240} includeMargin={false} />
          </div>

          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              NO LOGIN OR OFFICIAL EMAIL REQUIRED
            </span>
            <p className="text-xs text-slate-600 mt-2 font-mono">
              Takes less than 1 minute to raise
            </p>
          </div>
        </div>

        {/* 3 Step Visual Instructions for Site Workers */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 text-center">
            How to use on any smartphone
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
                1
              </div>
              <p className="text-xs font-bold text-slate-900">Scan QR</p>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                Use camera or Google Lens
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
                2
              </div>
              <p className="text-xs font-bold text-slate-900">Enter Details</p>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                Select type, write note, attach photo
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mx-auto mb-1.5">
                3
              </div>
              <p className="text-xs font-bold text-slate-900">Get Ticket ID</p>
              <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                Instant tracking & department follow-up
              </p>
            </div>
          </div>
        </div>

        {/* Poster Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div>
            <span>Placement: <strong>{placementLocation}</strong></span>
          </div>
          <div className="text-right">
            <span>Desire Energy Solution PVT LTD · Employee Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
