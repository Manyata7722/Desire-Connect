import React, { useState, useRef, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Department, IssueType } from '../../types';
import { DEPARTMENTS, ISSUE_TYPES } from '../../data/departments';
import { 
  Building2, 
  HelpCircle, 
  Upload, 
  X, 
  Check, 
  ChevronDown, 
  Image as ImageIcon, 
  AlertCircle, 
  ArrowLeft, 
  Send,
  Sparkles,
  Camera
} from 'lucide-react';

export const RaiseIssueForm: React.FC = () => {
  const { 
    createTicket, 
    departments,
    setCurrentView, 
    preselectedDepartmentForForm,
    setPreselectedDepartmentForForm,
    currentUser
  } = useTickets();

  // Form State
  const [department, setDepartment] = useState<Department>(
    preselectedDepartmentForForm || 'IT'
  );
  const [issueType, setIssueType] = useState<IssueType>('Issue');
  const [description, setDescription] = useState('');
  const [employeeName, setEmployeeName] = useState(
    currentUser ? `${currentUser.firstName} ${currentUser.surname}` : ''
  );
  const [employeeId, setEmployeeId] = useState(
    currentUser ? currentUser.employeeId : ''
  );
  const [mobileNumber, setMobileNumber] = useState('');
  const [location, setLocation] = useState('');

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Department Dropdown Search State
  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement | null>(null);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Sync employee info when logged in user changes
  useEffect(() => {
    if (currentUser) {
      setEmployeeName(`${currentUser.firstName} ${currentUser.surname}`);
      setEmployeeId(currentUser.employeeId);
    }
  }, [currentUser]);

  // Sync preselected department if arrived via direct QR scan deep-link
  useEffect(() => {
    if (preselectedDepartmentForForm) {
      setDepartment(preselectedDepartmentForForm);
    }
  }, [preselectedDepartmentForForm]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter departments by search
  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      (d.fullName && d.fullName.toLowerCase().includes(deptSearch.toLowerCase())) ||
      d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please attach a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setImageName(file.name);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample quick photo attach helpers for fast testing
  const attachSampleSitePhoto = (label: string, dataUrl: string) => {
    setImagePreview(dataUrl);
    setImageName(label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!department) {
      setErrorMsg('Please select a department.');
      return;
    }
    if (!issueType) {
      setErrorMsg('Please choose an issue type.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg('Please describe the issue in at least a few words (minimum 5 characters).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    // Simulate snappy network turnaround (<400ms)
    setTimeout(() => {
      createTicket({
        department,
        issueType,
        description,
        attachmentUrl: imagePreview || undefined,
        attachmentName: imageName || undefined,
        employeeName: employeeName || undefined,
        employeeId: employeeId || undefined,
        mobileNumber: mobileNumber || undefined,
        location: location || undefined,
      });

      setIsSubmitting(false);
      setPreselectedDepartmentForForm(null);
      setCurrentView('public_success');
    }, 350);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Top back button */}
      <button
        onClick={() => setCurrentView('public_home')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#0A5C36] uppercase tracking-wider block">
                Desire Energy Solution PVT LTD
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                Raise an Issue
              </h1>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              No Login Needed
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Submit your complaint, request, or suggestion. Your ticket will be routed directly to the relevant department team.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Field 1: Department Searchable Dropdown */}
          <div ref={deptDropdownRef} className="relative">
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              Department <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Select which department should handle this ticket
            </p>

            <button
              type="button"
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="w-full px-3.5 py-3 text-left text-sm bg-white border border-slate-300 rounded-xl flex items-center justify-between hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-colors shadow-2xs"
            >
              <span className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <strong className="text-slate-900">{department}</strong>
                <span className="text-xs text-slate-500 truncate hidden sm:inline">
                  — {DEPARTMENTS.find((d) => d.name === department)?.fullName}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 flex flex-col">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <input
                    type="text"
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    placeholder="Search 25 departments (e.g. IT, Jal, HR, Admin)..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto p-1 divide-y divide-slate-50">
                  {filteredDepartments.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching department found
                    </div>
                  ) : (
                    filteredDepartments.map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => {
                          setDepartment(d.name);
                          setIsDeptDropdownOpen(false);
                          setDeptSearch('');
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors ${
                          department === d.name ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{d.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">[{d.code}]</span>
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{d.description}</div>
                        </div>
                        {department === d.name && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Field 2: Issue Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              Issue Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ISSUE_TYPES.map((it) => {
                const isSelected = issueType === it.type;
                return (
                  <button
                    key={it.type}
                    type="button"
                    onClick={() => setIssueType(it.type)}
                    className={`px-3.5 py-3 text-xs text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0A5C36] bg-[#0A5C36] text-white font-semibold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-bold">{it.type}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {it.type === 'Complaint' 
                        ? 'Grievance, delay, misconduct, or safety hazard' 
                        : 'Operational breakdown, technical problem, or tool issue'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Issue Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-900">
                Issue / Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-600 font-mono">
                {description.length} chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue clearly (e.g. Pump #2 making high-pitch knocking noise, AC water dripping on floor 2, Biometric device offline at site gate)..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-y shadow-2xs leading-relaxed"
            />
          </div>

          {/* Field 4: Attach Image (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-1.5">
              Attach Photo / Document <span className="text-slate-600 font-normal">(Optional)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Helpful for machine breakdowns, leaking pipes, error screens, or physical damage.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              onChange={handleImageChange}
              className="hidden"
            />

            {!imagePreview ? (
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600 mb-2">
                      <Camera className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-slate-800">
                      Click to take photo or upload file
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      PNG, JPG, PDF up to 5MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                    <img
                      src={imagePreview}
                      alt="Attachment preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                      {imageName || 'Attached Image'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">Ready to upload</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Optional Contact Fields Accordion */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 py-1"
            >
              <span>Employee & Location Details (Optional)</span>
              <span className="text-[11px] font-normal text-slate-500">
                {showOptionalFields ? 'Hide' : 'Add Name / Phone / Location'}
              </span>
            </button>

            {showOptionalFields && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="e.g. Rameshwar Gurjar"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. 1756"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. +91 98234 11209"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Location / Worksite
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pump House 4 / Site Gate 2"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-600 mt-2">
              You will receive a unique reference ID immediately after submission.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
