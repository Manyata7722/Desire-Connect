import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useTickets } from '../../context/TicketContext';
import { Department } from '../../types';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw,
  FileCheck,
  Info
} from 'lucide-react';

interface ParsedEmployeeRow {
  rowNum: number;
  employeeId: string;
  firstName: string;
  surname: string;
  password?: string;
  role: 'employee' | 'department_staff' | 'admin';
  assignedDepartments: Department[];
  status: 'active' | 'inactive';
  isValid: boolean;
  isExisting: boolean;
  validationErrors: string[];
}

interface BulkEmployeeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summary: { added: number; updated: number; skipped: number }) => void;
}

export const BulkEmployeeImportModal: React.FC<BulkEmployeeImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { employees, departments, bulkAddEmployees } = useTickets();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'existing' | 'errors'>('all');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  if (!isOpen) return null;

  // Available valid department names
  const validDepartmentNames = departments.map((d) => d.name);

  // Normalize column keys
  const normalizeKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Employee ID': '1001',
        'First Name': 'Rahul',
        'Surname': 'Sharma',
        'Password': 'password123',
        'Role': 'employee',
        'Assigned Departments': '',
        'Status': 'active',
      },
      {
        'Employee ID': '1002',
        'First Name': 'Priya',
        'Surname': 'Patel',
        'Password': 'password123',
        'Role': 'department_staff',
        'Assigned Departments': 'IT, Jal',
        'Status': 'active',
      },
      {
        'Employee ID': '1756',
        'First Name': 'Manyata',
        'Surname': 'Shekhar',
        'Password': 'password123',
        'Role': 'department_staff',
        'Assigned Departments': 'Engineering, Tender',
        'Status': 'active',
      },
      {
        'Employee ID': '9001',
        'First Name': 'Amit',
        'Surname': 'Verma',
        'Password': 'password123',
        'Role': 'admin',
        'Assigned Departments': 'All',
        'Status': 'active',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 14 }, // Employee ID
      { wch: 16 }, // First Name
      { wch: 16 }, // Surname
      { wch: 16 }, // Password
      { wch: 18 }, // Role
      { wch: 30 }, // Assigned Departments
      { wch: 12 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees Template');

    // Add Instructions sheet
    const instructionsData = [
      ['Desire Connect - Bulk Employee Import Instructions'],
      [''],
      ['Column Name', 'Required', 'Accepted Values', 'Example'],
      ['Employee ID', 'Yes', 'Numeric or alphanumeric ID', '1756 or 1001'],
      ['First Name', 'Yes', 'Employee first name', 'Rahul'],
      ['Surname', 'Yes', 'Employee last name / surname', 'Sharma'],
      ['Password', 'No', 'Default is password123 if left blank', 'welcome2026'],
      ['Role', 'No', 'employee, department_staff, admin (default: employee)', 'department_staff'],
      ['Assigned Departments', 'No', 'Comma-separated department names for department_staff', 'IT, Jal, Engineering'],
      ['Status', 'No', 'active or inactive (default: active)', 'active'],
      [''],
      ['Valid Department Names for Desire Connect:'],
      ...validDepartmentNames.map((d) => [d]),
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 35 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Departments & Guide');

    XLSX.writeFile(wb, 'Desire_Connect_Employee_Import_Template.xlsx');
  };

  const processFile = async (file: File) => {
    setSelectedFileName(file.name);
    setIsLoading(true);
    setParseError(null);
    setParsedRows([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('The uploaded Excel file does not contain any sheets.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        throw new Error('The spreadsheet is empty. Please ensure it has headers and at least one employee row.');
      }

      // Existing employee ID lookup
      const existingIdSet = new Set(employees.map((e) => e.employeeId.toLowerCase().trim()));

      // Department matching map (case-insensitive)
      const deptMap = new Map<string, Department>();
      validDepartmentNames.forEach((name) => {
        deptMap.set(name.toLowerCase().trim(), name);
      });

      const parsed: ParsedEmployeeRow[] = [];

      rawRows.forEach((row, index) => {
        // Find mapped fields by normalized keys
        const rowMap = new Map<string, string>();
        Object.entries(row).forEach(([k, v]) => {
          rowMap.set(normalizeKey(k), String(v ?? '').trim());
        });

        const employeeId =
          rowMap.get('employeeid') ||
          rowMap.get('empid') ||
          rowMap.get('userid') ||
          rowMap.get('id') ||
          rowMap.get('code') ||
          '';

        let firstName =
          rowMap.get('firstname') ||
          rowMap.get('fname') ||
          rowMap.get('first') ||
          rowMap.get('empname') ||
          rowMap.get('employeename') ||
          rowMap.get('name') ||
          '';

        let surname =
          rowMap.get('surname') ||
          rowMap.get('lastname') ||
          rowMap.get('lname') ||
          rowMap.get('last') ||
          '';

        // If only 'name' or 'empname' was provided and surname is empty, attempt to split
        if (firstName && !surname && firstName.includes(' ')) {
          const parts = firstName.split(/\s+/);
          firstName = parts[0];
          surname = parts.slice(1).join(' ');
        }

        const password =
          rowMap.get('password') ||
          rowMap.get('pass') ||
          rowMap.get('pwd') ||
          'password123';

        const rawRole = (
          rowMap.get('role') ||
          rowMap.get('userrole') ||
          rowMap.get('accessrole') ||
          ''
        ).toLowerCase();

        const rawDepts =
          rowMap.get('assigneddepartments') ||
          rowMap.get('assigneddepartment') ||
          rowMap.get('departments') ||
          rowMap.get('department') ||
          rowMap.get('dept') ||
          '';

        const rawStatus = (
          rowMap.get('status') ||
          rowMap.get('userstatus') ||
          'active'
        ).toLowerCase();

        // Resolve assigned departments
        const assignedDepartments: Department[] = [];
        if (rawDepts) {
          const splitDepts = rawDepts.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
          splitDepts.forEach((d) => {
            if (d.toLowerCase() === 'all' || d.toLowerCase() === 'all departments') {
              validDepartmentNames.forEach((vd) => {
                if (!assignedDepartments.includes(vd)) assignedDepartments.push(vd);
              });
            } else {
              const matched = deptMap.get(d.toLowerCase());
              if (matched && !assignedDepartments.includes(matched)) {
                assignedDepartments.push(matched);
              }
            }
          });
        }

        // Determine Role
        let role: 'employee' | 'department_staff' | 'admin' = 'employee';
        if (rawRole.includes('admin') || rawDepts.toLowerCase() === 'all') {
          role = 'admin';
        } else if (rawRole.includes('staff') || rawRole.includes('dept') || assignedDepartments.length > 0) {
          role = 'department_staff';
        } else {
          role = 'employee';
        }

        const status: 'active' | 'inactive' = rawStatus.includes('inact') ? 'inactive' : 'active';

        // Validation
        const validationErrors: string[] = [];
        if (!employeeId) {
          validationErrors.push('Missing Employee ID');
        }
        if (!firstName) {
          validationErrors.push('Missing First Name');
        }

        const isExisting = Boolean(employeeId && existingIdSet.has(employeeId.toLowerCase()));
        const isValid = validationErrors.length === 0;

        parsed.push({
          rowNum: index + 2, // Excel row numbering
          employeeId,
          firstName,
          surname: surname || '',
          password,
          role,
          assignedDepartments,
          status,
          isValid,
          isExisting,
          validationErrors,
        });
      });

      setParsedRows(parsed);
    } catch (err: unknown) {
      console.error(err);
      setParseError(err instanceof Error ? err.message : 'Failed to parse Excel file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const payload = validRows.map((r) => ({
      firstName: r.firstName,
      surname: r.surname,
      employeeId: r.employeeId,
      password: r.password,
      role: r.role,
      assignedDepartments: r.assignedDepartments,
      status: r.status,
    }));

    const result = bulkAddEmployees(payload, { updateExisting });
    onSuccess(result);
    onClose();
  };

  // Stats
  const totalCount = parsedRows.length;
  const validCount = parsedRows.filter((r) => r.isValid).length;
  const existingCount = parsedRows.filter((r) => r.isValid && r.isExisting).length;
  const newCount = parsedRows.filter((r) => r.isValid && !r.isExisting).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  const displayedRows = parsedRows.filter((r) => {
    if (filterView === 'valid') return r.isValid;
    if (filterView === 'existing') return r.isValid && r.isExisting;
    if (filterView === 'errors') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0A5C36] flex items-center justify-center border border-emerald-200 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Bulk Import Employee Details (Excel / CSV)
              </h2>
              <p className="text-xs text-slate-500">
                Fast-track onboarding for bulk staff records into Desire Connect User Master.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-[#0A5C36] hover:text-[#08482b] bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download pre-formatted Excel template"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Sample Template</span>
              <span className="sm:hidden">Template</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* File Upload Box */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#0A5C36] bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0A5C36] flex items-center justify-center border border-emerald-200">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {selectedFileName ? (
                    <span className="text-[#0A5C36] flex items-center justify-center gap-1.5 font-bold">
                      <FileCheck className="w-4 h-4" />
                      {selectedFileName}
                    </span>
                  ) : (
                    <>Click to browse or drag & drop Excel file here</>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports Microsoft Excel (.xlsx, .xls) and standard CSV files
                </p>
              </div>

              {selectedFileName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 text-xs text-[#0A5C36] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Choose different file
                </button>
              )}
            </div>
          </div>

          {/* Parsing Errors Banner */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong className="block font-semibold">Error reading Excel file:</strong>
                <p>{parseError}</p>
              </div>
            </div>
          )}

          {/* Quick Guidance Box */}
          {!parsedRows.length && !parseError && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Info className="w-4 h-4 text-[#0A5C36]" />
                <span>Bulk Import Columns:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] list-disc list-inside text-slate-700">
                <li><strong>Employee ID</strong> (e.g. 1756, 1001) <span className="text-rose-500 font-bold">*</span></li>
                <li><strong>First Name / Name</strong> (e.g. Manyata) <span className="text-rose-500 font-bold">*</span></li>
                <li><strong>Surname</strong> (e.g. Shekhar)</li>
                <li><strong>Password</strong> (defaults to <em>password123</em>)</li>
                <li><strong>Role</strong> (<em>employee</em>, <em>department_staff</em>, <em>admin</em>)</li>
                <li><strong>Assigned Departments</strong> (e.g. <em>IT, Jal, Purchase</em>)</li>
              </ul>
            </div>
          )}

          {/* Parsed Results & Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              {/* Summary Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {/* Stats Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 mr-1">
                    Found {totalCount} records:
                  </span>
                  <button
                    onClick={() => setFilterView('all')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      filterView === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    onClick={() => setFilterView('valid')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                      filterView === 'valid'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Valid ({validCount})
                  </button>
                  {existingCount > 0 && (
                    <button
                      onClick={() => setFilterView('existing')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        filterView === 'existing'
                          ? 'bg-amber-700 text-white'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      Existing Update ({existingCount})
                    </button>
                  )}
                  {errorCount > 0 && (
                    <button
                      onClick={() => setFilterView('errors')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        filterView === 'errors'
                          ? 'bg-rose-700 text-white'
                          : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      Errors ({errorCount})
                    </button>
                  )}
                </div>

                {/* Overwrite Toggle */}
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="w-4 h-4 text-[#0A5C36] rounded border-slate-300 focus:ring-[#0A5C36]"
                  />
                  <span>Update existing users with matching ID</span>
                </label>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Row</th>
                      <th className="py-2.5 px-3">Emp ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Department Ticket Rights</th>
                      <th className="py-2.5 px-3 text-right">Status / Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRows.map((row) => (
                      <tr
                        key={row.rowNum}
                        className={
                          !row.isValid
                            ? 'bg-rose-50/60'
                            : row.isExisting
                            ? 'bg-amber-50/40'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {row.rowNum}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {row.employeeId || <span className="text-rose-500 italic">None</span>}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {row.firstName} {row.surname}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              row.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : row.role === 'department_staff'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {row.role === 'admin'
                              ? 'Admin'
                              : row.role === 'department_staff'
                              ? 'Dept Staff'
                              : 'Normal Staff'}
                          </span>
                        </td>
                        <td className="py-2 px-3 max-w-xs">
                          {row.role === 'admin' ? (
                            <span className="text-[10px] font-semibold text-purple-700">All 25 Departments</span>
                          ) : row.assignedDepartments.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.assignedDepartments.map((d) => (
                                <span
                                  key={d}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">None (Raise/Track only)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {!row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              {row.validationErrors.join(', ')}
                            </span>
                          ) : row.isExisting ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              <RefreshCw className="w-3 h-3" />
                              {updateExisting ? 'Will Update' : 'Will Skip'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready (New)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                Ready to process <strong>{validCount}</strong> valid employee records ({newCount} new, {existingCount} updates).
              </span>
            ) : (
              <span>Select an Excel (.xlsx) file to preview and import employees.</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0 || isLoading}
              onClick={handleExecuteImport}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                validCount > 0 && !isLoading
                  ? 'bg-[#0A5C36] hover:bg-[#08482b]'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {validCount} Employees</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
