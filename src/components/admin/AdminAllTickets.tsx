import React, { useState, useMemo } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Ticket, TicketStatus, IssueType, Department } from '../../types';
import { DEPARTMENTS } from '../../data/departments';
import { TicketDetailDrawer } from '../department/TicketDetailDrawer';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Building2, 
  Inbox,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

export const AdminAllTickets: React.FC = () => {
  const { tickets } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'All' | Department>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TicketStatus>('All');
  const [issueTypeFilter, setIssueTypeFilter] = useState<'All' | IssueType>('All');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const [drawerTicketId, setDrawerTicketId] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (departmentFilter !== 'All') {
      result = result.filter((t) => t.department === departmentFilter);
    }

    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (issueTypeFilter !== 'All') {
      result = result.filter((t) => t.issueType === issueTypeFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.employeeName && t.employeeName.toLowerCase().includes(q)) ||
          (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
          (t.location && t.location.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [tickets, departmentFilter, statusFilter, issueTypeFilter, searchTerm, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Department', 'Issue Type', 'Description', 'Employee Name', 'Employee ID', 'Mobile', 'Location', 'Status', 'Assigned To', 'Created At'];
    const rows = filteredTickets.map((t) => [
      t.id,
      t.department,
      t.issueType,
      `"${t.description.replace(/"/g, '""')}"`,
      t.employeeName || 'Anonymous',
      t.employeeId || 'N/A',
      t.mobileNumber || 'N/A',
      t.location || 'N/A',
      t.status,
      t.assignedTo || 'Unassigned',
      t.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `company_connect_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            All Company Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Global ticket database covering all 25 divisions. Click any row to review or modify details.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          
          {/* Search box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search across all departments..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900 max-w-[160px] truncate"
            >
              <option value="All">All 25 Depts</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

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
              <option value="All">All Types</option>
              <option value="Complaint">Complaint</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Request">Request</option>
              <option value="Suggestion">Suggestion</option>
              <option value="Other">Other</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'latest' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        {/* Filter stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredTickets.length} of {tickets.length} total tickets</span>
          {(departmentFilter !== 'All' || statusFilter !== 'All' || issueTypeFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setDepartmentFilter('All');
                setStatusFilter('All');
                setIssueTypeFilter('All');
                setSearchTerm('');
              }}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
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
              No tickets match your active filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Created Date</th>
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
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.id}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {t.department}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      {t.issueType}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-1 text-slate-700">
                        {t.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900 block">
                        {t.employeeName || 'Anonymous'}
                      </span>
                      {t.location && (
                        <span className="text-[10px] text-slate-400 block line-clamp-1">
                          {t.location}
                        </span>
                      )}
                    </td>

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

                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      {t.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerTicketId(t.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawerTicketId && (
        <TicketDetailDrawer
          ticketId={drawerTicketId}
          onClose={() => setDrawerTicketId(null)}
        />
      )}
    </div>
  );
};
