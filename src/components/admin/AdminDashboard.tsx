import React, { useMemo, useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Ticket, TicketStatus, IssueType, Department } from '../../types';
import { DEPARTMENTS } from '../../data/departments';
import { TicketDetailDrawer } from '../department/TicketDetailDrawer';
import { 
  Building2, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PieChart, 
  ArrowUpRight, 
  QrCode, 
  Layers, 
  Search,
  Filter,
  Users,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    tickets, 
    setCurrentView, 
    setActiveDepartment,
    setCurrentRole
  } = useTickets();

  const [searchDept, setSearchDept] = useState('');
  const [selectedTicketForDrawer, setSelectedTicketForDrawer] = useState<string | null>(null);

  // Global Company-Wide Metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    const closed = tickets.filter((t) => t.status === 'Closed').length;

    // Issue Type breakdown
    const issueTypes: Record<string, number> = {
      Issue: 0,
      Complaint: 0,
    };
    tickets.forEach((t) => {
      const typeKey = t.issueType === 'Complaint' ? 'Complaint' : 'Issue';
      issueTypes[typeKey] = (issueTypes[typeKey] || 0) + 1;
    });

    // Average resolution time (mock calculated realistically from resolved/closed tickets)
    const resolvedTickets = tickets.filter((t) => t.resolvedAt || t.closedAt);
    let avgHours = 4.2;
    if (resolvedTickets.length > 0) {
      let totalDiffHours = 0;
      resolvedTickets.forEach((t) => {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.resolvedAt || t.closedAt || t.updatedAt).getTime();
        const diffHours = Math.max(0.5, (end - start) / (1000 * 60 * 60));
        totalDiffHours += diffHours;
      });
      avgHours = +(totalDiffHours / resolvedTickets.length).toFixed(1);
    }

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      openPercent: total ? Math.round(((open + inProgress) / total) * 100) : 0,
      closedPercent: total ? Math.round(((resolved + closed) / total) * 100) : 0,
      avgHours,
      issueTypes,
    };
  }, [tickets]);

  // Department-wise ticket statistics
  const deptStats = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptTickets = tickets.filter((t) => t.department === dept.name);
      const openCount = deptTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
      const closedCount = deptTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
      return {
        ...dept,
        total: deptTickets.length,
        open: openCount,
        closed: closedCount,
        tickets: deptTickets,
      };
    });
  }, [tickets]);

  // Filtered departments for table
  const filteredDepts = useMemo(() => {
    return deptStats.filter(
      (d) =>
        d.name.toLowerCase().includes(searchDept.toLowerCase()) ||
        d.fullName.toLowerCase().includes(searchDept.toLowerCase()) ||
        d.code.toLowerCase().includes(searchDept.toLowerCase()) ||
        d.category.toLowerCase().includes(searchDept.toLowerCase())
    );
  }, [deptStats, searchDept]);

  // Top departments by ticket volume
  const topDepartments = useMemo(() => {
    return [...deptStats]
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [deptStats]);

  const handleJumpToDept = (deptName: Department) => {
    setActiveDepartment(deptName);
    setCurrentRole('department');
    setCurrentView('dept_dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Central Management Dashboard
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-white">
              Executive View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Company-wide monitoring across 25 departments · Real-time tickets, resolution velocity, and volume breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('admin_employees')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>User Master</span>
          </button>

          <button
            onClick={() => setCurrentView('admin_departments')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Department Master</span>
          </button>

          <button
            onClick={() => setCurrentView('admin_qrcode')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Notice QR</span>
          </button>

          <button
            onClick={() => setCurrentView('admin_tickets')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>All Tickets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Core Metrics (Strict Anti-Slop, Tabular Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Total Tickets Across Company</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-500">tickets logged</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-slate-800">25 active departments</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Open vs Closed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-700 tabular-nums">
              {metrics.open + metrics.inProgress}
            </span>
            <span className="text-xs text-slate-500">pending</span>
            <span className="text-slate-300">/</span>
            <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {metrics.resolved + metrics.closed}
            </span>
            <span className="text-xs text-slate-500">done</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${metrics.openPercent}%` }} 
              title={`Open: ${metrics.openPercent}%`}
            />
            <div 
              className="bg-emerald-500 h-full" 
              style={{ width: `${metrics.closedPercent}%` }} 
              title={`Closed: ${metrics.closedPercent}%`}
            />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Average Resolution Velocity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.avgHours}
            </span>
            <span className="text-xs text-slate-500">hours avg</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            From QR submission to verified sign-off
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">Active Status Breakdown</span>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Open</span>
              <span className="font-mono font-bold text-amber-600 text-lg tabular-nums">
                {metrics.open}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">In Progress</span>
              <span className="font-mono font-bold text-sky-600 text-lg tabular-nums">
                {metrics.inProgress}
              </span>
            </div>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            {metrics.resolved + metrics.closed} resolved or closed
          </div>
        </div>
      </div>

      {/* Two-Column Analytics: Tickets by Department & Tickets by Issue Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Department Volume Breakdown (Simple Clean Bars) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Tickets by Department (High Volume)
            </h2>
            <span className="text-xs text-slate-500">Top active units</span>
          </div>

          <div className="space-y-3.5">
            {topDepartments.map((dept) => {
              const maxVol = Math.max(...topDepartments.map((d) => d.total), 1);
              const barWidth = Math.round((dept.total / maxVol) * 100);
              return (
                <div 
                  key={dept.name} 
                  onClick={() => handleJumpToDept(dept.name)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-slate-950 transition-colors flex items-center gap-1.5">
                      {dept.name}
                      <span className="text-[10px] text-slate-400 font-mono">[{dept.code}]</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-600 font-mono">{dept.open} open</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono font-bold text-slate-900">{dept.total} tickets</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-800 group-hover:bg-slate-950 transition-all h-full rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Tickets by Issue Type */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Tickets by Issue Type
            </h2>
            <span className="text-xs text-slate-500">Categorical demand</span>
          </div>

          <div className="space-y-4">
            {(Object.entries(metrics.issueTypes) as [IssueType, number][]).map(([type, count]) => {
              const percentage = metrics.total ? Math.round((count / metrics.total) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{type}</span>
                    <span className="font-mono text-slate-700">
                      <strong>{count}</strong> ({percentage}%)
                    </span>
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
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comprehensive Department Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        
        {/* Table Header & Search Filter */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Department Performance & Ticket Queue (All 25 Departments)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any department to jump directly into its operational triage desk.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDept}
              onChange={(e) => setSearchDept(e.target.value)}
              placeholder="Search department..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Department Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Cluster / Domain</th>
                <th className="py-3 px-4 text-center">Total Tickets</th>
                <th className="py-3 px-4 text-center">Open / Pending</th>
                <th className="py-3 px-4 text-center">Resolved / Closed</th>
                <th className="py-3 px-4 text-right">Triage Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepts.map((d) => (
                <tr
                  key={d.name}
                  onClick={() => handleJumpToDept(d.name)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block group-hover:text-slate-950">
                      {d.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block line-clamp-1">
                      {d.fullName}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-slate-600">
                    {d.code}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {d.category}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                    {d.total}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-semibold ${d.open > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                      {d.open}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-semibold ${d.closed > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {d.closed}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJumpToDept(d.name);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Open Queue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
