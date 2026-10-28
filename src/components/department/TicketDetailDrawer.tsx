import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Ticket, TicketStatus } from '../../types';
import { DEPARTMENTS } from '../../data/departments';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Check, 
  Upload, 
  Phone, 
  MapPin, 
  Building2,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface TicketDetailDrawerProps {
  ticketId: string;
  onClose: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticketId,
  onClose,
}) => {
  const { 
    tickets, 
    updateTicketStatus, 
    assignTicket, 
    addComment, 
    closeTicket 
  } = useTickets();

  const ticket = tickets.find((t) => t.id === ticketId);

  // Local state for actions
  const [newComment, setNewComment] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(ticket?.assignedTo || '');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRemark, setCloseRemark] = useState('');
  const [closeRemarkError, setCloseRemarkError] = useState('');

  if (!ticket) return null;

  const currentDeptInfo = DEPARTMENTS.find((d) => d.name === ticket.department);
  const availableStaff = currentDeptInfo?.staff || ['Senior Engineer', 'Department Lead', 'Officer on Duty'];

  const handleStatusChange = (status: TicketStatus) => {
    if (status === 'Closed') {
      setShowCloseModal(true);
    } else {
      updateTicketStatus(ticket.id, status);
    }
  };

  const handleAssign = (staff: string) => {
    setSelectedAssignee(staff);
    assignTicket(ticket.id, staff);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(ticket.id, newComment.trim(), selectedAssignee || 'Dept Staff', 'Department Staff');
    setNewComment('');
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeRemark.trim() || closeRemark.trim().length < 5) {
      setCloseRemarkError('Resolution remark is required to close a ticket (min 5 characters).');
      return;
    }
    closeTicket(ticket.id, closeRemark.trim());
    setShowCloseModal(false);
    setCloseRemark('');
    setCloseRemarkError('');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold text-slate-900">
                  {ticket.id}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800">
                  {ticket.department}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{ticket.issueType}</span>
                <span aria-hidden="true">·</span>
                <span>Created {new Date(ticket.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Actions Panel: Status & Assignee */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Status</span>
                <div className="flex items-center gap-1.5">
                  {(['Open', 'In Progress', 'Resolved', 'Closed'] as TicketStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        ticket.status === st
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                <span className="text-xs font-semibold text-slate-900">Assign To Staff</span>
                <select
                  value={ticket.assignedTo || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">Unassigned</option>
                  {availableStaff.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Issue Description
              </h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            {/* Attached Image if any */}
            {ticket.attachmentUrl && (
              <div>
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                  Attachment / Photo
                </h2>
                <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 inline-block">
                  <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer">
                    <img
                      src={ticket.attachmentUrl}
                      alt={ticket.attachmentName || 'Attachment'}
                      className="max-h-60 rounded-lg object-contain cursor-zoom-in"
                    />
                  </a>
                  {ticket.attachmentName && (
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">{ticket.attachmentName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Resolution Remark Box if already closed/resolved */}
            {ticket.resolutionRemark && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs mb-1">
                  <FileCheck className="w-4 h-4" />
                  <span>Resolution / Closing Remark</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {ticket.resolutionRemark}
                </p>
                {ticket.closedAt && (
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">
                    Closed: {new Date(ticket.closedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Employee Details Card */}
            <div>
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Employee Information
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs bg-white border border-slate-200 rounded-xl p-4">
                <div>
                  <span className="text-slate-600 text-[11px] block">Name</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">
                    {ticket.employeeName || 'Anonymous / Not Provided'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-600 text-[11px] block">Employee ID</span>
                  <span className="font-mono text-slate-800 block mt-0.5">
                    {ticket.employeeId || 'Not Provided'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-600 text-[11px] block">Contact Number</span>
                  <span className="font-mono text-slate-800 block mt-0.5">
                    {ticket.mobileNumber || 'Not Provided'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-600 text-[11px] block">Location / Site</span>
                  <span className="text-slate-800 block mt-0.5">
                    {ticket.location || 'Not Specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Internal Activity & Comments Thread */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  Activity & Internal Notes ({ticket.comments.length})
                </h2>
              </div>

              {ticket.comments.length === 0 ? (
                <div className="p-4 border border-slate-100 rounded-xl text-center text-xs text-slate-600 bg-slate-50/50">
                  No comments or updates yet. Add the first update below.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {ticket.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800">
                          {c.author} · <span className="text-slate-500 font-normal">{c.authorRole}</span>
                        </span>
                        <span className="font-mono text-[10px]">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add internal progress note or resolution update..."
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>

            {ticket.status !== 'Closed' && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Close Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Closing Remark Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Close Ticket #{ticket.id}
              </h2>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setCloseRemarkError('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmClose} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Resolution / Closing Remark <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Describe what actions were taken to fix or address this ticket. The employee can see this upon tracking.
                </p>
                <textarea
                  required
                  rows={3}
                  value={closeRemark}
                  onChange={(e) => {
                    setCloseRemark(e.target.value);
                    setCloseRemarkError('');
                  }}
                  placeholder="e.g. Technician replaced leaking valve on Floor 2 and verified with building supervisor."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-y"
                  autoFocus
                />
                {closeRemarkError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{closeRemarkError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Confirm & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
