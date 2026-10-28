import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  PlusCircle, 
  Share2, 
  Printer, 
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const SubmissionSuccess: React.FC = () => {
  const { 
    lastSubmittedTicketId, 
    tickets, 
    setCurrentView, 
    setSelectedTicketId 
  } = useTickets();

  const [copied, setCopied] = useState(false);

  // Find the submitted ticket object
  const ticket = tickets.find((t) => t.id === lastSubmittedTicketId) || tickets[0];

  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackTicket = () => {
    if (ticket) {
      setSelectedTicketId(ticket.id);
      setCurrentView('public_track');
    }
  };

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <p className="text-sm text-slate-500">No recent submission found.</p>
        <button
          onClick={() => setCurrentView('public_raise')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs"
        >
          Raise an Issue
        </button>
      </div>
    );
  }

  // Construct a tracking URL representation
  const trackUrl = `${window.location.origin}?track=${encodeURIComponent(ticket.id)}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Top Celebration Banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 p-6 text-center">
          <span className="text-[11px] font-bold text-[#0A5C36] uppercase tracking-wider block mb-2">
            Desire Connect · Integrated Water Management
          </span>
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Your issue has been submitted successfully.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-emerald-800">
            Assigned to <strong>{ticket.department}</strong> department for triage and resolution.
          </p>
        </div>

        {/* Core Ticket Details Card */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Ticket ID Highlight Box with Copy Button */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Reference Ticket ID
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 tracking-tight mt-0.5">
                {ticket.id}
              </div>
            </div>

            <button
              onClick={handleCopyId}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-slate-600 text-[11px] block">Department</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                {ticket.department}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-slate-600 text-[11px] block">Issue Type</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                {ticket.issueType}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-slate-600 text-[11px] block">Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 text-sm mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {ticket.status}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl">
              <span className="text-slate-600 text-[11px] block">Submission Time</span>
              <span className="font-mono text-slate-800 text-xs mt-0.5 block">
                {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Description Snippet */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
              Issue Summary
            </span>
            <p className="line-clamp-2 italic text-slate-800">"{ticket.description}"</p>
          </div>

          {/* QR Code for Direct Mobile Re-tracking */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="shrink-0">
              <QRCodeCanvas value={trackUrl} size={96} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-900">
                Scan on your mobile to track
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Take a photo or screenshot of this screen. You can check updates without logging in.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleTrackTicket}
              className="w-full py-3.5 px-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Track Ticket Now</span>
            </button>

            <button
              onClick={() => setCurrentView('public_raise')}
              className="w-full py-3 px-4 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-500" />
              <span>Raise Another Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
