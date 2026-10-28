import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Department, EmployeeUser } from '../../types';
import { DepartmentInfo } from '../../data/departments';
import { 
  Building2, 
  Users, 
  Search, 
  Plus, 
  Check, 
  X, 
  ExternalLink,
  Lock,
  UserCheck,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Water Projects',
  'Technical & Operations',
  'Corporate & Commercial',
  'Executive'
];

export const DepartmentMaster: React.FC = () => {
  const { 
    tickets, 
    employees, 
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    updateEmployee, 
    setCurrentView, 
    setActiveDepartment 
  } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentInfo | null>(null);
  const [selectedDeptForRights, setSelectedDeptForRights] = useState<Department | null>(null);
  
  // Create / Edit Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptFullName, setDeptFullName] = useState('');
  const [deptCategory, setDeptCategory] = useState('Technical & Operations');
  const [deptDescription, setDeptDescription] = useState('');
  const [assignedStaffIds, setAssignedStaffIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filtered department list
  const filteredDepartments = departments.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.fullName && d.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.domain || d.category).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      (d.domain || d.category).toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Get users assigned to a department
  const getStaffForDepartment = (departmentName: Department): EmployeeUser[] => {
    return employees.filter(
      (e) => e.role === 'admin' || e.assignedDepartments.includes(departmentName)
    );
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setDeptName('');
    setDeptCode('');
    setDeptFullName('');
    setDeptCategory('Technical & Operations');
    setDeptDescription('');
    setAssignedStaffIds([]);
    setFormError('');
    setEditingDept(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (dept: DepartmentInfo) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptFullName(dept.fullName || '');
    setDeptCategory(dept.category || 'Technical & Operations');
    setDeptDescription(dept.description || '');
    setFormError('');
    setShowCreateModal(true);
  };

  // Save Department (Create or Edit)
  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!deptName.trim()) {
      setFormError('Department Name is required (e.g. Logistics, Solar O&M).');
      return;
    }
    if (!deptCode.trim()) {
      setFormError('Department Code is required (e.g. LOG, SOL).');
      return;
    }

    if (editingDept) {
      // Update existing
      updateDepartment(editingDept.name, {
        code: deptCode.trim().toUpperCase(),
        fullName: deptFullName.trim() || `${deptName.trim()} Operational Department`,
        category: deptCategory,
        description: deptDescription.trim() || `Department handling ${deptName.trim()} tickets and requests`
      });

      setSuccessToast(`Department '${deptName.trim()}' updated successfully.`);
      setShowCreateModal(false);
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      // Create new
      const res = addDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        fullName: deptFullName.trim() || `${deptName.trim()} Operational Department`,
        description: deptDescription.trim() || `Department handling ${deptName.trim()} tickets and requests`,
        category: deptCategory,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create department.');
        return;
      }

      // If initial staff were checked, assign them this new department
      if (assignedStaffIds.length > 0) {
        assignedStaffIds.forEach((empId) => {
          const emp = employees.find((u) => u.id === empId);
          if (emp && !emp.assignedDepartments.includes(deptName.trim())) {
            updateEmployee(emp.id, {
              assignedDepartments: [...emp.assignedDepartments, deptName.trim()],
              role: emp.role === 'admin' ? 'admin' : 'department_staff'
            });
          }
        });
      }

      setSuccessToast(`Department '${deptName.trim()}' created successfully.`);
      setShowCreateModal(false);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // Delete Department
  const handleDeleteDepartment = (dept: DepartmentInfo) => {
    if (confirm(`Are you sure you want to remove the department '${dept.name}'?`)) {
      const res = deleteDepartment(dept.name);
      if (!res.success) {
        alert(res.error);
      } else {
        setSuccessToast(`Department '${dept.name}' removed.`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    }
  };

  // Toggle user assignment for a department
  const handleToggleUserDepartment = (emp: EmployeeUser, deptNameStr: Department) => {
    if (emp.role === 'admin') return; // admin has global access

    const hasDept = emp.assignedDepartments.includes(deptNameStr);
    let newDepts: Department[];

    if (hasDept) {
      newDepts = emp.assignedDepartments.filter((d) => d !== deptNameStr);
    } else {
      newDepts = [...emp.assignedDepartments, deptNameStr];
    }

    updateEmployee(emp.id, {
      assignedDepartments: newDepts,
      role: newDepts.length > 0 ? 'department_staff' : 'employee'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-950 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0A5C36]" />
            <span>{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast(null)} 
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with "+ Create Department" and "User Master" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#0A5C36]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Department Master
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#0A5C36] border border-emerald-200">
              {departments.length} Active Units
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Create, configure and manage operational departments, ticket routing categories, and staff authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* PRIMARY CREATE DEPARTMENT BUTTON */}
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>

          <button
            onClick={() => setCurrentView('admin_employees')}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>User Master</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search department name, code, or domain..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0A5C36] text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const deptTickets = tickets.filter((t) => t.department === dept.name);
          const openCount = deptTickets.filter((t) => t.status === 'Open').length;
          const inProgressCount = deptTickets.filter((t) => t.status === 'In Progress').length;
          const assignedStaff = getStaffForDepartment(dept.name);

          return (
            <div
              key={dept.name}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between group"
            >
              <div>
                {/* Header: Name, Code & Action Controls */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="pr-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">{dept.name}</h2>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-semibold">
                        {dept.code}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                      {dept.domain || dept.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dept)}
                      title="Edit Department"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept)}
                      title="Delete Department"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded ml-1">
                      {deptTickets.length} tickets
                    </span>
                  </div>
                </div>

                {dept.fullName && dept.fullName !== dept.name && (
                  <p className="text-[11px] text-slate-700 font-medium mb-1">
                    {dept.fullName}
                  </p>
                )}

                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                  {dept.description}
                </p>

                {/* Staff with Ticket Rights */}
                <div className="pt-2.5 border-t border-slate-100 mb-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      Assigned Staff Rights ({assignedStaff.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDeptForRights(dept.name)}
                      className="text-[10px] text-[#0A5C36] hover:underline font-bold cursor-pointer"
                    >
                      Assign Staff
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {assignedStaff.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 text-[10px] bg-slate-50 text-slate-700 rounded border border-slate-200 font-mono"
                      >
                        {s.firstName} ({s.employeeId})
                      </span>
                    ))}
                    {assignedStaff.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded">
                        +{assignedStaff.length - 3} more
                      </span>
                    )}
                    {assignedStaff.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">
                        No specific staff assigned yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Summary & Quick Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-amber-700 font-medium">
                    {openCount} Open
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-blue-700 font-medium">
                    {inProgressCount} Active
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveDepartment(dept.name);
                    setCurrentView('dept_dashboard');
                  }}
                  className="text-xs font-semibold text-[#0A5C36] hover:text-[#08482b] flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Desk</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No departments match "{searchTerm}"</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tap "Create Department" above to add a new operational unit or adjust your search filter.
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CREATE / EDIT DEPARTMENT MODAL */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0A5C36]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingDept ? `Edit Department · ${editingDept.name}` : 'Create New Department'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Department Master directory and ticket routing configuration
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDepartment} className="p-5 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Department Name & Code in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    disabled={!!editingDept}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Logistics, Solar O&M"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] disabled:bg-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Short unique name</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Department Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LOG, SOL, SAFE"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] font-mono uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Used in ticket prefixes & barcodes</span>
                </div>
              </div>

              {/* Full Operational Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Full Operational Title
                </label>
                <input
                  type="text"
                  value={deptFullName}
                  onChange={(e) => setDeptFullName(e.target.value)}
                  placeholder="e.g. Logistics & Supply Fleet Execution Division"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                />
              </div>

              {/* Category / Sector */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Category / Domain
                </label>
                <select
                  value={deptCategory}
                  onChange={(e) => setDeptCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                >
                  <option value="Technical & Operations">Technical & Operations</option>
                  <option value="Water Projects">Water Projects</option>
                  <option value="Corporate & Commercial">Corporate & Commercial</option>
                  <option value="Executive">Executive</option>
                  <option value="Other">Other Operational Unit</option>
                </select>
              </div>

              {/* Scope & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Scope & Issue Responsibilities
                </label>
                <textarea
                  rows={2}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Types of complaints, requests, or breakdowns this department manages..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] resize-none"
                />
              </div>

              {/* Initial Staff Authorization Checkbox (Only on Create) */}
              {!editingDept && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Assign Staff Authorization (Optional)
                  </label>
                  <p className="text-[10px] text-slate-500 mb-1.5">
                    Select existing employees who will immediately receive rights to triage tickets for this department:
                  </p>
                  <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5 bg-slate-50/50">
                    {employees.map((emp) => {
                      const isChecked = assignedStaffIds.includes(emp.id);
                      return (
                        <label
                          key={emp.id}
                          className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer hover:bg-white p-1 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAssignedStaffIds((prev) => [...prev, emp.id]);
                              } else {
                                setAssignedStaffIds((prev) => prev.filter((id) => id !== emp.id));
                              }
                            }}
                            className="rounded border-slate-300 text-[#0A5C36] focus:ring-[#0A5C36]"
                          />
                          <span className="font-medium">
                            {emp.firstName} {emp.surname}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            ({emp.employeeId})
                          </span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {emp.role}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingDept ? 'Save Changes' : 'Create Department'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: STAFF RIGHTS ASSIGNMENT MODAL */}
      {/* ============================================================ */}
      {selectedDeptForRights && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#0A5C36]" />
                  Staff Rights · {selectedDeptForRights}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Authorize employees to inspect and manage tickets for {selectedDeptForRights}.
                </p>
              </div>
              <button
                onClick={() => setSelectedDeptForRights(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {employees.map((emp) => {
                const isAdmin = emp.role === 'admin';
                const hasRights = isAdmin || emp.assignedDepartments.includes(selectedDeptForRights);

                return (
                  <div
                    key={emp.id}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {emp.firstName} {emp.surname}
                        </span>
                        <span className="text-[10px] font-mono text-[#0A5C36] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {emp.employeeId}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {isAdmin ? 'Global Administrator' : `Assigned to ${emp.assignedDepartments.length} depts`}
                      </span>
                    </div>

                    {isAdmin ? (
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Admin Rights
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleUserDepartment(emp, selectedDeptForRights)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                          hasRights
                            ? 'bg-[#0A5C36] text-white border-[#0A5C36]'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {hasRights ? 'Authorized' : 'Grant Access'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedDeptForRights(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
