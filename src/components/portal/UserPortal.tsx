import React, { useState, useRef, useEffect } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Department, IssueType, Ticket, TicketStatus } from '../../types';
import { DEPARTMENTS, ISSUE_TYPES } from '../../data/departments';
import { 
  PlusCircle, 
  Search, 
  QrCode, 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Building2, 
  X, 
  ChevronDown, 
  ChevronRight,
  Upload, 
  Image as ImageIcon,
  User,
  MapPin,
  FileCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Smartphone
} from 'lucide-react';

type PortalTab = 'raise' | 'track' | 'scan';

export const UserPortal: React.FC = () => {
  const { 
    currentUser, 
    tickets, 
    departments,
    createTicket, 
    findTicketById, 
    addComment, 
    selectedTicketId, 
    setSelectedTicketId,
    preselectedDepartmentForForm,
    setPreselectedDepartmentForForm
  } = useTickets();

  const [activeTab, setActiveTab] = useState<PortalTab>('raise');

  // --- RAISE TICKET FORM STATE ---
  const [department, setDepartment] = useState<Department>(
    preselectedDepartmentForForm || 'IT'
  );
  const [issueType, setIssueType] = useState<IssueType>('Issue');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitSuccessTicketId, setSubmitSuccessTicketId] = useState<string | null>(null);
  const [raiseError, setRaiseError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync preselected department if set from QR scan
  useEffect(() => {
    if (preselectedDepartmentForForm) {
      setDepartment(preselectedDepartmentForForm);
      setActiveTab('raise');
    }
  }, [preselectedDepartmentForForm]);

  // --- TRACK TICKET STATE ---
  const [searchQuery, setSearchQuery] = useState(selectedTicketId || '');
  const [activeTrackTicket, setActiveTrackTicket] = useState<Ticket | null>(null);
  const [trackNotFound, setTrackNotFound] = useState(false);
  const [followUpText, setFollowUpText] = useState('');
  const [followUpSuccess, setFollowUpSuccess] = useState(false);

  // Filter tickets raised by this logged-in employee
  const myTickets = React.useMemo(() => {
    if (!currentUser) return tickets.slice(0, 3);
    const id = currentUser.employeeId.toLowerCase();
    const fullName = `${currentUser.firstName} ${currentUser.surname}`.toLowerCase();
    return tickets.filter(
      (t) => 
        (t.employeeId && t.employeeId.toLowerCase() === id) ||
        (t.employeeName && t.employeeName.toLowerCase().includes(fullName))
    );
  }, [tickets, currentUser]);

  // Auto-load selected ticket or most recent
  useEffect(() => {
    if (selectedTicketId) {
      setSearchQuery(selectedTicketId);
      const found = findTicketById(selectedTicketId);
      if (found) {
        setActiveTrackTicket(found);
        setTrackNotFound(false);
      }
    } else if (myTickets.length > 0 && !activeTrackTicket) {
      setActiveTrackTicket(myTickets[0]);
      setSearchQuery(myTickets[0].id);
    }
  }, [selectedTicketId, myTickets, findTicketById]);

  // --- SCAN QR CAMERA STATE ---
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setScanMessage('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setScanMessage(null);
    } catch {
      setScanMessage('Camera unavailable or permission denied. Use one-tap test scan options below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSimulatedQRScan = (type: 'dept' | 'ticket', value: string) => {
    // Play subtle haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(50); } catch { /* ignore */ }
    }

    if (type === 'dept') {
      const dept = value as Department;
      setDepartment(dept);
      setPreselectedDepartmentForForm(dept);
      setScanMessage(`Scanned QR: Department ${dept}`);
      setTimeout(() => {
        setScanMessage(null);
        setActiveTab('raise');
      }, 400);
    } else {
      setSelectedTicketId(value);
      setSearchQuery(value);
      const found = findTicketById(value);
      if (found) {
        setActiveTrackTicket(found);
        setTrackNotFound(false);
      }
      setScanMessage(`Scanned QR: Ticket ${value}`);
      setTimeout(() => {
        setScanMessage(null);
        setActiveTab('track');
      }, 400);
    }
  };

  // Raise Form Handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setRaiseError('Image exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setImageName(file.name);
      setRaiseError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setRaiseError('Please enter a brief description of the issue.');
      return;
    }

    setIsSubmitting(true);
    setRaiseError('');

    try {
      const newId = createTicket({
        department,
        issueType,
        description: description.trim(),
        attachmentUrl: imagePreview || undefined,
        attachmentName: imageName || undefined,
        employeeName: currentUser ? `${currentUser.firstName} ${currentUser.surname}` : 'Rahul Sharma',
        employeeId: currentUser ? currentUser.employeeId : '1001',
        location: location.trim() || 'Desire Head Office',
      });

      setSubmitSuccessTicketId(newId);
      setDescription('');
      setLocation('');
      setImagePreview(null);
      setImageName(null);
      setIsSubmitting(false);
    } catch {
      setRaiseError('Failed to submit ticket. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Track Ticket Handlers
  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = findTicketById(searchQuery.trim());
    if (found) {
      setActiveTrackTicket(found);
      setSelectedTicketId(found.id);
      setTrackNotFound(false);
    } else {
      setActiveTrackTicket(null);
      setTrackNotFound(true);
    }
  };

  const handlePostFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrackTicket || !followUpText.trim()) return;

    addComment(
      activeTrackTicket.id,
      followUpText.trim(),
      currentUser ? `${currentUser.firstName} ${currentUser.surname}` : 'Employee',
      'Employee'
    );
    setFollowUpText('');
    setFollowUpSuccess(true);
    setTimeout(() => setFollowUpSuccess(false), 2500);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-50 text-[#0A5C36] border-emerald-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden flex flex-col bg-slate-50 touch-manipulation">
      
      {/* Top Segmented Tabs: Fitted on Mobile, zero scroll */}
      <div className="bg-white border-b border-slate-200 shrink-0 px-3 py-2 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          
          <button
            onClick={() => setActiveTab('raise')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'raise'
                ? 'bg-white text-[#0A5C36] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span>Raise Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'track'
                ? 'bg-white text-[#0A5C36] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span>Track Ticket</span>
            {myTickets.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#0A5C36] text-[10px] font-bold flex items-center justify-center">
                {myTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('scan');
              if (!cameraActive) startCamera();
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-white text-[#0A5C36] shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#0A5C36]" />
            <span>Scan QR</span>
          </button>

        </div>
      </div>

      {/* Main Tab Viewport: Fits completely in one page without dragging */}
      <div className="flex-1 overflow-y-auto sm:overflow-hidden p-3 sm:p-4 flex flex-col justify-start sm:justify-center">
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* ============================================================ */}
          {/* TAB 1: RAISE TICKET (Zero Scroller Drag Layout) */}
          {/* ============================================================ */}
          {activeTab === 'raise' && (
            <div className="p-3.5 sm:p-4 flex flex-col space-y-2.5">
              
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Raise New Ticket
                  </h1>
                  <p className="text-[10px] text-slate-500">
                    Routing to operational department queue
                  </p>
                </div>

                {currentUser ? (
                  <div className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[10px] font-mono text-[#0A5C36] font-bold">
                    User: {currentUser.employeeId}
                  </div>
                ) : (
                  <div className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">
                    Employee Portal
                  </div>
                )}
              </div>

              {/* Success Notification Alert */}
              {submitSuccessTicketId && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0A5C36] shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-emerald-950 block leading-tight">
                        Ticket Created: <span className="font-mono">{submitSuccessTicketId}</span>
                      </span>
                      <span className="text-[10px] text-emerald-800">
                        Assigned to {department} department
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(submitSuccessTicketId);
                      setSearchQuery(submitSuccessTicketId);
                      const found = findTicketById(submitSuccessTicketId);
                      if (found) setActiveTrackTicket(found);
                      setSubmitSuccessTicketId(null);
                      setActiveTab('track');
                    }}
                    className="px-2 py-1 text-[10px] font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-md transition-colors shrink-0 cursor-pointer"
                  >
                    Track Now
                  </button>
                </div>
              )}

              {raiseError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span className="leading-tight">{raiseError}</span>
                </div>
              )}

              <form onSubmit={handleRaiseSubmit} className="space-y-2.5">
                
                {/* Department Select & Issue Type in 2 compact columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as Department)}
                        className="w-full pl-2.5 pr-6 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] appearance-none"
                      >
                        {departments.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name} ({d.fullName || d.name})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                      Issue Type
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value as IssueType)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                    >
                      {ISSUE_TYPES.map((item) => (
                        <option key={item.type} value={item.type}>
                          {item.type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description (Concise 2 to 3 rows to avoid scrolling) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-800">
                      Problem Description <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Brief & precise</span>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setRaiseError('');
                    }}
                    placeholder="Describe the issue, defect, or request..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] resize-none"
                  />
                </div>

                {/* Location Input (Single line) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                    Site / Office Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Pump House #2, Floor 2, Server Room"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                    />
                  </div>
                </div>

                {/* Photo / Evidence Attachment (Compact line) */}
                <div className="pt-0.5">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="flex items-center justify-between p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-7 h-7 rounded object-cover border border-emerald-300 shrink-0"
                        />
                        <span className="text-[11px] text-emerald-950 font-mono truncate max-w-[170px]">
                          {imageName || 'photo_attached.jpg'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageName(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-1.5 px-3 border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg text-slate-600 hover:text-[#0A5C36] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-50/50"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#0A5C36]" />
                      <span>Attach Photo / Site Evidence (Optional)</span>
                    </button>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Ticket Now'}</span>
                </button>

              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: TRACK TICKET (Check Ticket Status & My Tickets) */}
          {/* ============================================================ */}
          {activeTab === 'track' && (
            <div className="p-3.5 sm:p-4 flex flex-col space-y-2.5">
              
              {/* Search Bar */}
              <form onSubmit={handleSearchTicket} className="flex gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. #CC-000128)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Check
                </button>
              </form>

              {trackNotFound && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>No ticket found matching "{searchQuery}". Check the ID or select below.</span>
                </div>
              )}

              {/* Active Ticket Status Card */}
              {activeTrackTicket ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  
                  {/* Top Bar: ID + Status Pill */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-xs block">
                        {activeTrackTicket.id}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Dept: <strong>{activeTrackTicket.department}</strong> · {activeTrackTicket.issueType}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getStatusBadge(activeTrackTicket.status)}`}>
                      {activeTrackTicket.status}
                    </span>
                  </div>

                  {/* Problem text snippet */}
                  <p className="text-slate-700 leading-snug line-clamp-2 text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                    "{activeTrackTicket.description}"
                  </p>

                  {/* Resolution remark if present */}
                  {activeTrackTicket.resolutionRemark && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-950">
                      <div className="font-bold flex items-center gap-1 text-[10px] text-[#0A5C36] uppercase tracking-wider mb-0.5">
                        <FileCheck className="w-3 h-3" />
                        <span>Resolution Remark</span>
                      </div>
                      <p className="leading-snug">{activeTrackTicket.resolutionRemark}</p>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <div>
                      <span>Assigned Staff: </span>
                      <strong className="text-slate-700">{activeTrackTicket.assignedTo || 'Triage in progress'}</strong>
                    </div>
                    <div>
                      <span>Updated: </span>
                      <strong className="text-slate-700">
                        {new Date(activeTrackTicket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </strong>
                    </div>
                  </div>

                  {/* Follow-up Note */}
                  <form onSubmit={handlePostFollowUp} className="pt-1.5 border-t border-slate-200/60 flex gap-1.5">
                    <input
                      type="text"
                      value={followUpText}
                      onChange={(e) => setFollowUpText(e.target.value)}
                      placeholder="Add follow-up note to this ticket..."
                      className="flex-1 px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0A5C36]"
                    />
                    <button
                      type="submit"
                      disabled={!followUpText.trim()}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-800 bg-white hover:bg-slate-100 disabled:opacity-50 border border-slate-300 rounded-md transition-colors cursor-pointer"
                    >
                      Post
                    </button>
                  </form>
                  {followUpSuccess && (
                    <span className="text-[10px] text-emerald-600 font-medium block">
                      ✓ Note added to ticket thread
                    </span>
                  )}
                </div>
              ) : null}

              {/* My Raised Tickets Quick List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-800">
                    My Tickets ({myTickets.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Tap to check status</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {myTickets.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No tickets raised yet. Tap "Raise Ticket" to submit your first issue.
                    </div>
                  ) : (
                    myTickets.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setActiveTrackTicket(t);
                          setSearchQuery(t.id);
                          setSelectedTicketId(t.id);
                          setTrackNotFound(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          activeTrackTicket?.id === t.id
                            ? 'bg-emerald-50/80 border-[#0A5C36] font-semibold'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="overflow-hidden pr-2">
                          <span className="font-mono text-[11px] text-slate-900 block font-bold">
                            {t.id} · <span className="text-[#0A5C36]">{t.department}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {t.description}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded shrink-0 border ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: SCAN QR (Raise or Check Status) */}
          {/* ============================================================ */}
          {activeTab === 'scan' && (
            <div className="p-3.5 sm:p-4 flex flex-col space-y-3">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Scan Notice Board / Ticket QR
                  </h1>
                  <p className="text-[10px] text-slate-500">
                    Auto-opens department form or ticket status
                  </p>
                </div>
                <Smartphone className="w-4 h-4 text-[#0A5C36]" />
              </div>

              {scanMessage && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0A5C36] shrink-0" />
                  <span>{scanMessage}</span>
                </div>
              )}

              {/* Camera Scanner Viewfinder (Compact) */}
              <div className="relative aspect-video w-full max-h-44 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400">
                    <QrCode className="w-8 h-8 mx-auto mb-1 text-slate-500 opacity-60" />
                    <p className="text-[11px] leading-tight">Point camera at Department Notice QR or Ticket ID</p>
                  </div>
                )}

                {/* Animated Scanner Laser overlay */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-emerald-400/60 m-3 rounded-lg flex flex-col justify-between p-2">
                  <span className="text-[9px] font-mono text-emerald-300/80 bg-slate-900/60 px-1 py-0.5 rounded self-start">
                    QR VIEWFINDER
                  </span>
                  <div className="w-full h-0.5 bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                </div>
              </div>

              {/* Camera Toggle Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (cameraActive) stopCamera();
                    else startCamera();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cameraActive ? 'Turn Off Camera' : 'Start Device Camera'}</span>
                </button>
              </div>

              {/* Instant 1-Tap Simulated QR Scans (Guaranteed to work without physical camera permissions) */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1-Tap Instant QR Simulators:
                </span>

                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSimulatedQRScan('dept', 'IT')}
                      className="px-2 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#0A5C36] font-semibold border border-emerald-200 rounded-md transition-colors text-center"
                    >
                      IT Dept QR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatedQRScan('dept', 'Admin')}
                      className="px-2 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#0A5C36] font-semibold border border-emerald-200 rounded-md transition-colors text-center"
                    >
                      Admin Dept QR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatedQRScan('dept', 'Jal O&M')}
                      className="px-2 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#0A5C36] font-semibold border border-emerald-200 rounded-md transition-colors text-center"
                    >
                      Jal O&M QR
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSimulatedQRScan('ticket', '#CC-000128')}
                      className="px-2 py-1 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-mono font-semibold border border-blue-200 rounded-md transition-colors text-center"
                    >
                      Scan #CC-000128 (IT)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSimulatedQRScan('ticket', '#CC-000127')}
                      className="px-2 py-1 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-mono font-semibold border border-blue-200 rounded-md transition-colors text-center"
                    >
                      Scan #CC-000127 (Admin)
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
