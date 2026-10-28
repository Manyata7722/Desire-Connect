import React, { useState, useMemo, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Ticket, TicketStatus, IssueType, Department } from '../../types';
import { DEPARTMENTS } from '../../data/departments';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { 
  Building2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  UserCheck, 
  Calendar,
  Layers,
  Inbox,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  Lock
} from 'lucide-react';

export const DepartmentDashboard: React.FC = () => {
  const { 
    tickets, 
    activeDepartment, 
    setActiveDepartment,
    selectedTicketId,
    setSelectedTicketId,
    setCurrentView,
    currentUser,
    currentRole,
    setIsAuthModalOpen
  } = useTickets();

  // Strict department access enforcement (Requirement 7)
  const allowedDepartments = useMemo(() => {
    if (currentRole === 'admin') {
      return DEPARTMENTS.map((d) => d.name);
    }
    if (currentUser && currentUser.assignedDepartments && currentUser.assignedDepartments.length > 0) {
      return currentUser.assignedDepartments;
    }
    return [activeDepartment];
  }, [currentRole, currentUser, activeDepartment]);

  // Clamp active department if not in allowed list
  useEffect(() => {
    if (!allowedDepartments.includes(activeDepartment) && allowedDepartments.length > 0) {
      setActiveDepartment(allowedDepartments[0]);
    }
  }, [allowedDepartments, activeDepartment, setActiveDepartment]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');
  const [issueTypeFilter, setIssueTypeFilter] = useState<'All' | IssueType>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Drawer state
  const [drawerTicketId, setDrawerTicketId] = useState<string | null>(null);

  // Department info
  const currentDeptInfo = DEPARTMENTS.find((d) => d.name === activeDepartment);

  // Tickets belonging to this department
  const deptTickets = useMemo(() => {
    return tickets.filter((t) => t.department === activeDepartment);
  }, [tickets, activeDepartment]);

  // Status Metrics
  const metrics = useMemo(() => {
    return {
      total: deptTickets.length,
      open: deptTickets.filter((t) => t.status === 'Open').length,
      inProgress: deptTickets.filter((t) => t.status === 'In Progress').length,
      resolved: deptTickets.filter((t) => t.status === 'Resolved').length,
      closed: deptTickets.filter((t) => t.status === 'Closed').length,
    };
  }, [deptTickets]);

  // Filtered & Sorted tickets
  const filteredTickets = useMemo(() => {
    let result = [...deptTickets];

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Issue Type filter
    if (issueTypeFilter !== 'All') {
      result = result.filter((t) => t.issueType === issueTypeFilter);
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.employeeName && t.employeeName.toLowerCase().includes(q)) ||
          (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
          (t.location && t.location.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      result = result.filter((t) => {
        const created = new Date(t.createdAt).getTime();
        const diff = now - created;
        if (dateFilter === 'today') return diff <= oneDay;
        if (dateFilter === 'week') return diff <= 7 * oneDay;
        return true;
      });
    }

    // Sort order
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [deptTickets, statusFilter, issueTypeFilter, searchTerm, dateFilter, sortOrder]);

  if (!currentUser && currentRole !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A5C36] flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Staff Desk Sign In Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Only employees with authorized department ticket rights can access this desk. Please sign in with your User ID (e.g. <strong>1756</strong>) and password.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-xl shadow-xs cursor-pointer"
        >
          Staff Sign In
        </button>
      </div>
    );
  }

  if (currentUser?.role === 'department_staff' && currentUser.assignedDepartments.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Department Rights Assigned</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your account (User ID: <strong>{currentUser.employeeId}</strong>) has not yet been assigned to any department ticket queue. Please request the administrator to assign department rights in <strong>User Master</strong>.
        </p>
        <button
          onClick={() => setCurrentView('public_raise')}
          className="px-5 py-2.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-xl shadow-xs cursor-pointer"
        >
          Raise a Ticket
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Department Title & Quick Dept Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {activeDepartment} Department
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
              {currentDeptInfo?.code || activeDepartment}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {currentDeptInfo?.fullName} · {currentDeptInfo?.description}
          </p>
        </div>

        {/* Department Switcher / Single Dept Lock (Requirement 7) */}
        <div className="flex items-center gap-2">
          {allowedDepartments.length === 1 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-[#0A5C36]" />
              <span>Dept: <strong>{activeDepartment}</strong></span>
              <span className="text-[10px] text-[#0A5C36] font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Assigned Unit
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
                Department:
              </label>
              <select
                value={activeDepartment}
                onChange={(e) => setActiveDepartment(e.target.value as Department)}
                className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 shadow-2xs"
              >
                {allowedDepartments.map((deptName) => {
                  const dInfo = DEPARTMENTS.find((d) => d.name === deptName);
                  return (
                    <option key={deptName} value={deptName}>
                      {deptName} {dInfo ? `(${dInfo.code})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Top Summary Cards (Tabular Numerals, Zero Slop) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'All' 
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${statusFilter === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
            Total Tickets
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums block mt-1">
            {metrics.total}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('Open')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Open' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${statusFilter === 'Open' ? 'text-amber-100' : 'text-slate-500'}`}>
            Open
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums block mt-1">
            {metrics.open}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('In Progress')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress' 
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs' 
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${statusFilter === 'In Progress' ? 'text-sky-100' : 'text-slate-500'}`}>
            In Progress
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums block mt-1">
            {metrics.inProgress}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('Resolved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Resolved' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${statusFilter === 'Resolved' ? 'text-emerald-100' : 'text-slate-500'}`}>
            Resolved
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums block mt-1">
            {metrics.resolved}
          </span>
        </div>

        <div 
          onClick={() => setStatusFilter('Closed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'Closed' 
              ? 'bg-slate-700 text-white border-slate-700 shadow-xs' 
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${statusFilter === 'Closed' ? 'text-slate-300' : 'text-slate-500'}`}>
            Closed
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums block mt-1">
            {metrics.closed}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, name, site..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Issue Type Filter */}
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="All">All Issue Types</option>
              <option value="Issue">Issue</option>
              <option value="Complaint">Complaint</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'latest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Active filter count / clear */}
        {(statusFilter !== 'All' || issueTypeFilter !== 'All' || dateFilter !== 'all' || searchTerm) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing {filteredTickets.length} of {deptTickets.length} tickets
            </span>
            <button
              onClick={() => {
                setStatusFilter('All');
                setIssueTypeFilter('All');
                setDateFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Ticket Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">No tickets found</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no tickets matching your current search or status filter for {activeDepartment}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setDrawerTicketId(t.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.id}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>

                    {/* Issue Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800">
                        {t.issueType}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-1 text-slate-700">
                        {t.description}
                      </p>
                    </td>

                    {/* Employee Name & ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-medium text-slate-900 block">
                          {t.employeeName || 'Anonymous'}
                        </span>
                        {t.employeeId && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.employeeId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Pill (clean, zero-pill aesthetic) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          t.status === 'Open'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : t.status === 'In Progress'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : t.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {t.status}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {t.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerTicketId(t.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Drawer Modal */}
      {drawerTicketId && (
        <TicketDetailDrawer
          ticketId={drawerTicketId}
          onClose={() => setDrawerTicketId(null)}
        />
      )}
    </div>
  );
};
