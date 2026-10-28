import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { DesireLogo } from '../common/DesireLogo';
import { 
  PlusCircle, 
  Search, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  Zap,
  Building,
  Users
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, findTicketById, setSelectedTicketId } = useTickets();
  const [quickTrackId, setQuickTrackId] = useState('');
  const [trackError, setTrackError] = useState('');

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackId.trim()) return;
    const ticket = findTicketById(quickTrackId.trim());
    if (ticket) {
      setSelectedTicketId(ticket.id);
      setCurrentView('public_track');
    } else {
      setTrackError(`Ticket "${quickTrackId.trim()}" not found. Please verify the ID.`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="pt-8 pb-16 sm:pt-14 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Brand Emblem & Company Name Badge */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="p-3 bg-white border border-slate-200/90 rounded-2xl shadow-xs mb-3">
            <DesireLogo size="lg" showSubtitle={false} />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-[#0A5C36]">
            Desire Energy Solution PVT LTD
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Integrated Water & Renewable Energy Management
          </span>
        </div>

        {/* Anti-slop clean metadata note */}
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/90 border border-slate-200/80 px-3.5 py-1.5 rounded-full mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>No login or official email required</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Takes under 1 minute</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight text-balance">
          Desire Connect
        </h1>

        <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Raise an issue, complaint, request or suggestion — quickly and easily.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('public_raise')}
            className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Raise an Issue</span>
          </button>

          <button
            onClick={() => setCurrentView('public_track')}
            className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>Track My Issue</span>
          </button>
        </div>

        {/* Quick inline track search */}
        <div className="mt-8 pt-8 border-t border-slate-200/80 max-w-md mx-auto">
          <p className="text-xs font-medium text-slate-500 mb-2">Already have a ticket reference number?</p>
          <form onSubmit={handleQuickTrack} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickTrackId}
                onChange={(e) => {
                  setQuickTrackId(e.target.value);
                  setTrackError('');
                }}
                placeholder="Enter e.g. #CC-000128"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Track
            </button>
          </form>
          {trackError && (
            <p className="text-xs text-rose-600 mt-1.5 text-left font-medium">{trackError}</p>
          )}
        </div>

        {/* Articulate How It Works Section */}
        <div className="mt-14 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
            <div>
              <span className="text-[11px] font-bold text-[#0A5C36] uppercase tracking-wider block">
                Simplified Grievance Redressal
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                How Desire Connect Works
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              Fast · Direct · Transparent
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0A5C36] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900">Scan QR Code or Link</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-9">
                Scan the QR code printed on site notice boards or access via web browser. No employee ID, official email, or password required.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0A5C36] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900">Select Dept & Submit</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-9">
                Choose the relevant department, write a brief description of the issue or complaint, and optionally attach a site photo or document.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0A5C36] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  3
                </div>
                <h3 className="text-sm font-bold text-slate-900">Track in Real Time</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-9">
                Get an instant tracking ID with 1-click copy. Track status, department assignment, and resolution remarks anytime from any phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Desire Connect · Minimum Complexity, Maximum Results</p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setCurrentView('admin_employees')}
              className="font-bold text-[#0A5C36] hover:text-[#08482b] transition-colors cursor-pointer"
            >
              User Master (Admin)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentView('admin_qrcode')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Print Notice Board Posters
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentView('dept_dashboard')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Department Staff Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
