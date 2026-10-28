import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTickets } from '../../context/TicketContext';
import { EmployeeUser, Department } from '../../types';
import { DEPARTMENTS } from '../../data/departments';
import { BulkEmployeeImportModal } from './BulkEmployeeImportModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Lock, 
  ShieldCheck, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  KeyRound, 
  Building2,
  AlertCircle,
  Hash,
  FileSpreadsheet,
  Download,
  CheckCircle2
} from 'lucide-react';

export const EmployeeMaster: React.FC = () => {
  const { 
    employees, 
    departments,
    addEmployee, 
    updateEmployee, 
    deleteEmployee 
  } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(null);

  // Form State for Add / Edit
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<Department[]>(['IT']);
  const [userRole, setUserRole] = useState<'employee' | 'department_staff' | 'admin'>('employee');
  const [formError, setFormError] = useState('');

  const handleExportEmployees = () => {
    const exportData = employees.map((emp) => ({
      'Employee ID': emp.employeeId,
      'First Name': emp.firstName,
      'Surname': emp.surname,
      'Password': emp.password,
      'Role': emp.role,
      'Assigned Departments': emp.role === 'admin' ? 'All 25 Departments' : (emp.assignedDepartments || []).join(', '),
      'Status': emp.status,
      'Created Date': new Date(emp.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 35 },
      { wch: 12 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, `Desire_Connect_Employees_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Open modal for new user with numeric 4-digit ID like 1756
  const handleOpenAdd = () => {
    setFirstName('');
    setSurname('');
    const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
    setEmployeeId(randomDigits);
    setPassword('password123');
    setSelectedDepts([]);
    setUserRole('employee');
    setFormError('');
    setEditingEmployee(null);
    setShowAddModal(true);
  };

  // Open modal for editing user
  const handleOpenEdit = (emp: EmployeeUser) => {
    setEditingEmployee(emp);
    setFirstName(emp.firstName);
    setSurname(emp.surname);
    setEmployeeId(emp.employeeId);
    setPassword(emp.password);
    setSelectedDepts(emp.assignedDepartments || []);
    setUserRole(emp.role || 'employee');
    setFormError('');
    setShowAddModal(true);
  };

  const handleToggleDept = (dept: Department) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length === 1 && userRole !== 'admin') {
        setFormError('Staff user must have at least one department assigned.');
        return;
      }
      setSelectedDepts(selectedDepts.filter((d) => d !== dept));
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
    setFormError('');
  };

  const handleSelectAllDepts = () => {
    setSelectedDepts(departments.map((d) => d.name));
  };

  const handleClearDepts = () => {
    setSelectedDepts([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !surname.trim()) {
      setFormError('Both Employee Name and Surname are required.');
      return;
    }
    const cleanId = employeeId.trim();
    if (!cleanId) {
      setFormError('User ID is required (e.g. 1756).');
      return;
    }

    if (!password.trim()) {
      setFormError('Password is required.');
      return;
    }

    if (userRole === 'department_staff' && selectedDepts.length === 0) {
      setFormError('Please select at least one department for department staff ticket rights.');
      return;
    }

    const assigned = userRole === 'admin' 
      ? DEPARTMENTS.map((d) => d.name) 
      : userRole === 'department_staff' 
        ? selectedDepts 
        : [];

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        firstName: firstName.trim(),
        surname: surname.trim(),
        employeeId: cleanId,
        password: password.trim(),
        assignedDepartments: assigned,
        role: userRole,
      });
      setShowAddModal(false);
    } else {
      const res = addEmployee({
        firstName: firstName.trim(),
        surname: surname.trim(),
        employeeId: cleanId,
        password: password.trim(),
        assignedDepartments: assigned,
        role: userRole,
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create user.');
      } else {
        setShowAddModal(false);
      }
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.assignedDepartments.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header: Prominently titled User Master */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0A5C36]" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              User Master
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              Admin Access Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Create user credentials with User ID (format: <strong>1756</strong>), assign department ticket rights, and manage logins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2.5 text-xs font-bold text-[#0A5C36] hover:text-[#08482b] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Upload Excel (.xlsx, .xls) or CSV file to import bulk employees"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0A5C36]" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportEmployees}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Export all current employees to Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Import Success Notification Banner */}
      {importSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in slide-in-from-top-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{importSuccessMessage}</span>
          </div>
          <button
            onClick={() => setImportSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID (e.g. 1756), department..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">User Name & Surname</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Assigned Department Ticket Rights</th>
                <th className="py-3 px-4">Access Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name & Surname */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block text-xs">
                      {emp.firstName} {emp.surname}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Created: {new Date(emp.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  {/* User ID (e.g. 1756) */}
                  <td className="py-3 px-4 font-mono font-bold text-sm text-[#0A5C36]">
                    {emp.employeeId}
                  </td>

                  {/* Password */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                      {emp.password}
                    </span>
                  </td>

                  {/* Assigned Department Ticket Rights */}
                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex flex-wrap gap-1">
                      {emp.role === 'admin' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 rounded border border-emerald-200">
                          All 25 Departments (Global Admin)
                        </span>
                      ) : (
                        emp.assignedDepartments.map((dept) => (
                          <span
                            key={dept}
                            className="px-2 py-0.5 text-[10px] font-medium text-slate-700 bg-slate-100 rounded border border-slate-200"
                          >
                            {dept}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        emp.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : emp.role === 'department_staff'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {emp.role === 'admin' 
                        ? 'Administrator' 
                        : emp.role === 'department_staff'
                        ? 'Department Staff'
                        : 'Staff (Raise & Track)'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Edit User & Department Rights"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {emp.employeeId !== 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete user ${emp.firstName} ${emp.surname} (${emp.employeeId})?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0A5C36]" />
                {editingEmployee ? 'Edit User Credentials & Rights' : 'Create User (User Master)'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Emp Name & Surname */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Emp Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Manyata"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Surname <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="e.g. Shekhar"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                  />
                </div>
              </div>

              {/* User ID: 1756 format & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    User ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. 1756"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Numeric ID format (e.g. 1756)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. password123"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Login password
                  </span>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  User Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserRole('employee');
                      setSelectedDepts([]);
                    }}
                    className={`p-2.5 text-xs rounded-xl border text-left transition-colors cursor-pointer ${
                      userRole === 'employee'
                        ? 'bg-blue-50 border-blue-500 text-blue-950 font-semibold ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-blue-900">Normal User</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Raise & Track tickets only. Restricted from all masters.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserRole('department_staff');
                      if (selectedDepts.length === 0) setSelectedDepts(['IT']);
                    }}
                    className={`p-2.5 text-xs rounded-xl border text-left transition-colors cursor-pointer ${
                      userRole === 'department_staff'
                        ? 'bg-emerald-50 border-[#0A5C36] text-emerald-950 font-semibold ring-1 ring-[#0A5C36]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-emerald-950">Department Staff</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Triages tickets for assigned departments.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserRole('admin');
                      setSelectedDepts(departments.map((d) => d.name));
                    }}
                    className={`p-2.5 text-xs rounded-xl border text-left transition-colors cursor-pointer ${
                      userRole === 'admin'
                        ? 'bg-purple-50 border-purple-500 text-purple-950 font-semibold ring-1 ring-purple-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-purple-950">Administrator</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Full access to User & Dept Master.
                    </div>
                  </button>
                </div>
              </div>

              {/* Assign Department Ticket Rights - Only for Department Staff */}
              {userRole === 'department_staff' ? (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-900">
                      Assign Department Ticket Rights <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSelectAllDepts}
                        className="text-[#0A5C36] hover:underline font-semibold cursor-pointer"
                      >
                        All
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={handleClearDepts}
                        className="text-slate-500 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    This employee will <strong>ONLY</strong> be able to see tickets for the selected departments.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50/50">
                    {departments.map((dept) => {
                      const isChecked = selectedDepts.includes(dept.name);
                      return (
                        <button
                          key={dept.name}
                          type="button"
                          onClick={() => handleToggleDept(dept.name)}
                          className={`px-2 py-1.5 rounded text-left text-xs flex items-center justify-between border transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#0A5C36] text-white border-[#0A5C36] font-semibold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{dept.name}</span>
                          {isChecked && <Check className="w-3 h-3 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                  <span className="font-semibold">Administrator Privileges:</span> Has global rights across all {departments.length} operational departments.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-lg shadow-xs cursor-pointer"
                >
                  {editingEmployee ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Employee Import Modal */}
      <BulkEmployeeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(summary) => {
          setImportSuccessMessage(
            `Excel Bulk Import successful: ${summary.added} new employee(s) created, ${summary.updated} updated.`
          );
        }}
      />
    </div>
  );
};
