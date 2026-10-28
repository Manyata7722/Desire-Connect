import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { DEPARTMENTS } from '../../data/departments';
import { Department } from '../../types';
import { 
  Building2, 
  Search, 
  Users, 
  QrCode, 
  ArrowRight, 
  PlusCircle, 
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DepartmentDirectory: React.FC = () => {
  const { 
    tickets, 
    setActiveDepartment, 
    setCurrentRole, 
    setCurrentView,
    setPreselectedDepartmentForForm
  } = useTickets();

  const [search, setSearch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('All');

  const clusters = ['All', 'Water Projects', 'Technical & Operations', 'Corporate & Commercial', 'Executive'];

  const filtered = DEPARTMENTS.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCluster = selectedCluster === 'All' || d.category === selectedCluster;

    return matchesSearch && matchesCluster;
  });

  const handleOpenDept = (deptName: Department) => {
    setActiveDepartment(deptName);
    setCurrentRole('department');
    setCurrentView('dept_dashboard');
  };

  const handleDirectRaise = (deptName: Department) => {
    setPreselectedDepartmentForForm(deptName);
    setCurrentRole('public');
    setCurrentView('public_raise');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Department Registry
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              25 Departments
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Directory of all operational units, designated triage leads, and routing gateways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('admin_qrcode')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Generate Posters</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments, codes or descriptions..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {clusters.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCluster(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCluster === c
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => {
          const deptTickets = tickets.filter((t) => t.department === dept.name);
          const openCount = deptTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
          const closedCount = deptTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

          return (
            <div
              key={dept.name}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base font-bold text-slate-900 block">
                      {dept.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block">
                      {dept.fullName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {dept.code}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {dept.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Domain</span>
                  <span className="font-medium text-slate-800">{dept.category}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Active Queue</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={openCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                      {openCount} open
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-700">
                      {deptTickets.length} total
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  <span>Staff: </span>
                  <span className="text-slate-700">{dept.staff.slice(0, 2).join(', ')}{dept.staff.length > 2 ? '...' : ''}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenDept(dept.name)}
                  className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center cursor-pointer"
                >
                  Triage Queue
                </button>

                <button
                  onClick={() => handleDirectRaise(dept.name)}
                  title="Raise issue directly for this department"
                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
