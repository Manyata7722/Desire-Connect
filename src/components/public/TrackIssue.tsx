import React, { useState, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Ticket, TicketStatus } from '../../types';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Building2, 
  Calendar, 
  User, 
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  FileCheck,
  ShieldCheck,
  Check
} from 'lucide-react';

export const TrackIssue: React.FC = () => {
  const { 
    findTicketById, 
    selectedTicketId, 
    setSelectedTicketId, 
    setCurrentView,
    addComment,
    tickets
  } = useTickets();

  const [searchQuery, setSearchQuery] = useState(selectedTicketId || '');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [employeeFollowUp, setEmployeeFollowUp] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    if (selectedTicketId) {
      setSearchQuery(selectedTicketId);
      const found = findTicketById(selectedTicketId);
      if (found) {
        setTicket(found);
        setNotFound(false);
      }
    }
  }, [selectedTicketId, tickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = findTicketById(searchQuery.trim());
    if (found) {
      setTicket(found);
      setSelectedTicketId(found.id);
      setNotFound(false);
    } else {
      setTicket(null);
      setNotFound(true);
    }
  };

  const handleQuickSelect = (id: string) => {
    setSearchQuery(id);
    const found = findTicketById(id);
    if (found) {
      setTicket(found);
      setSelectedTicketId(found.id);
      setNotFound(false);
    }
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !employeeFollowUp.trim()) return;

    addComment(
      ticket.id, 
      employeeFollowUp.trim(), 
      ticket.employeeName || 'Ticket Creator', 
      'Employee'
    );
    setEmployeeFollowUp('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
  };

  // Status progress helper
  const getStatusStepIndex = (status: TicketStatus): number => {
    switch (status) {
      case 'Open':
        return 0;
      case 'In Progress':
        return 1;
      case 'Resolved':
        return 2;
      case 'Closed':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = ticket ? getStatusStepIndex(ticket.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => setCurrentView('public_home')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1">
          Track Ticket Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Enter your reference ID (e.g. #CC-000128) to view real-time department updates.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. #CC-000128 or 128"
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Check Status
          </button>
        </form>

        {/* Quick sample chips for instant reviewer testing */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-600 text-[11px]">Quick test tickets:</span>
          {tickets.slice(0, 4).map((t) => (
            <button
              key={t.id}
              onClick={() => handleQuickSelect(t.id)}
              className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200"
            >
              {t.id} ({t.department} - {t.status})
            </button>
          ))}
        </div>
      </div>

      {notFound && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold">No Ticket Found with ID "{searchQuery}"</p>
          <p className="text-xs text-rose-600 mt-1 max-w-sm mx-auto">
            Please verify the number. All IDs follow the format #CC-XXXXXX (or just the numeric digits).
          </p>
        </div>
      )}

      {/* Ticket Result Display */}
      {ticket && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Ticket Header & Status Pill */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
                    {ticket.id}
                  </span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {ticket.department}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                  <span>Type: <strong className="text-slate-700">{ticket.issueType}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Submitted: {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Current Status:</span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${
                    ticket.status === 'Open'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : ticket.status === 'In Progress'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : ticket.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="p-6 bg-slate-50/70 border-b border-slate-100">
              <div className="grid grid-cols-4 gap-2 text-center">
                {['Open', 'In Progress', 'Resolved', 'Closed'].map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-600'
                        } ${isCurrent ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] mt-1.5 font-medium ${isDone ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6">
              
              {/* Description */}
              <div>
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Issue Description
                </h2>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed">
                  {ticket.description}
                </div>
              </div>

              {/* Attachment if present */}
              {ticket.attachmentUrl && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    Attached Photo / Evidence
                  </h2>
                  <div className="inline-block p-2 border border-slate-200 rounded-xl bg-slate-50">
                    <img
                      src={ticket.attachmentUrl}
                      alt={ticket.attachmentName || 'Ticket attachment'}
                      className="max-h-56 max-w-full rounded-lg object-contain"
                    />
                    {ticket.attachmentName && (
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">{ticket.attachmentName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Resolution Remark Box if resolved/closed */}
              {ticket.resolutionRemark && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-1">
                    <FileCheck className="w-4 h-4" />
                    <span>Department Resolution Remark</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {ticket.resolutionRemark}
                  </p>
                  {ticket.resolvedAt && (
                    <p className="text-[10px] text-slate-600 mt-1 font-mono">
                      Completed: {new Date(ticket.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Assignment & Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-600 block">Assigned Staff</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {ticket.assignedTo || 'Pending Triage'}
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-600 block">Location</span>
                  <span className="font-medium text-slate-800 block mt-0.5">
                    {ticket.location || 'Not Specified'}
                  </span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-600 block">Last Updated</span>
                  <span className="font-mono text-slate-800 block mt-0.5">
                    {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Comments & Activity Log */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    Updates & Comments ({ticket.comments.length})
                  </h2>
                </div>

                {ticket.comments.length === 0 ? (
                  <p className="text-xs text-slate-600 italic py-2">
                    No department updates posted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-semibold text-slate-800">
                            {comment.author} · <span className="text-slate-500 font-normal">{comment.authorRole}</span>
                          </span>
                          <span className="font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Follow-up Note */}
                <form onSubmit={handleAddFollowUp} className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Add Employee Note / Response
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={employeeFollowUp}
                      onChange={(e) => setEmployeeFollowUp(e.target.value)}
                      placeholder="Add supplementary details or check-in on progress..."
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!employeeFollowUp.trim()}
                      className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 border border-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </div>
                  {commentSuccess && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                      Note posted successfully to ticket thread.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
