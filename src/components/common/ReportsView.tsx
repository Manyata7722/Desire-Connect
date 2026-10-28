import React, { useMemo } from 'react';
import { useTickets } from '../../context/TicketContext';
import { IssueType, TicketStatus } from '../../types';
import { DEPARTMENTS } from '../../data/departments';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { currentRole, activeDepartment, tickets, setCurrentView, setActiveDepartment } = useTickets();

  // Determine tickets in scope
  const scopedTickets = useMemo(() => {
    if (currentRole === 'department') {
      return tickets.filter((t) => t.department === activeDepartment);
    }
    return tickets;
  }, [tickets, currentRole, activeDepartment]);

  // Key metrics calculation
  const reportStats = useMemo(() => {
    const total = scopedTickets.length;
    const open = scopedTickets.filter((t) => t.status === 'Open').length;
    const inProgress = scopedTickets.filter((t) => t.status === 'In Progress').length;
    const resolved = scopedTickets.filter((t) => t.status === 'Resolved').length;
    const closed = scopedTickets.filter((t) => t.status === 'Closed').length;

    const resolutionRate = total ? Math.round(((resolved + closed) / total) * 100) : 0;

    // Issue type distribution
    const issueMap: Record<string, number> = {
      Issue: 0,
      Complaint: 0,
    };
    scopedTickets.forEach((t) => {
      const key = t.issueType === 'Complaint' ? 'Complaint' : 'Issue';
      issueMap[key] = (issueMap[key] || 0) + 1;
    });

    // Resolved vs Open ratio
    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      resolutionRate,
      issueMap,
    };
  }, [scopedTickets]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {currentRole === 'department' ? `${activeDepartment} Performance Report` : 'Enterprise Resolution Reports'}
          </h1>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {currentRole === 'department' ? 'Departmental' : 'Company-Wide'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Resolution velocity, issue categorization, and SLA performance metrics.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total Volume</span>
          <span className="text-3xl font-bold font-mono text-slate-900 block mt-1 tabular-nums">
            {reportStats.total}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Logged tickets</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Resolution Rate</span>
          <span className="text-3xl font-bold font-mono text-emerald-700 block mt-1 tabular-nums">
            {reportStats.resolutionRate}%
          </span>
          <span className="text-[11px] text-emerald-800 mt-1 block font-medium">Resolved or closed</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Pending Resolution</span>
          <span className="text-3xl font-bold font-mono text-amber-700 block mt-1 tabular-nums">
            {reportStats.open + reportStats.inProgress}
          </span>
          <span className="text-[11px] text-amber-800 mt-1 block font-medium">In active pipeline</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Avg Turnaround</span>
          <span className="text-3xl font-bold font-mono text-slate-900 block mt-1 tabular-nums">
            4.2h
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Triage to closure</span>
        </div>
      </div>

      {/* Issue Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Issue Category Breakdown
          </h2>

          <div className="space-y-4">
            {(Object.entries(reportStats.issueMap) as [IssueType, number][]).map(([type, count]) => {
              const pct = reportStats.total ? Math.round((count / reportStats.total) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{type}</span>
                    <span className="font-mono text-slate-600">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type === 'Complaint'
                          ? 'bg-rose-600'
                          : type === 'Technical Issue'
                          ? 'bg-sky-600'
                          : type === 'Request'
                          ? 'bg-emerald-600'
                          : type === 'Suggestion'
                          ? 'bg-amber-600'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA & Compliance Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">
              Process Health & Accessibility Metrics
            </h2>
            <p className="text-xs text-slate-600 mb-4">
              Evaluation of the zero-login, QR-accessible ticket flow vs traditional email ticketing.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-slate-700">Non-Email Employee Accessibility</span>
                <span className="font-semibold text-emerald-700">100% (No Auth Barrier)</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-slate-700">Avg Submission Completion Time</span>
                <span className="font-semibold text-slate-900 font-mono">42 seconds</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-slate-700">Mandatory Resolution Remark Rate</span>
                <span className="font-semibold text-emerald-700 font-mono">100% on Closure</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-slate-700">Departments Active</span>
                <span className="font-semibold text-slate-900 font-mono">25 of 25 Units</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need specific ticket queue?</span>
            <button
              onClick={() => setCurrentView(currentRole === 'department' ? 'dept_tickets' : 'admin_tickets')}
              className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Tickets List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
