import React, { useEffect } from 'react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { Header } from './components/Header';
import { LandingPage } from './components/public/LandingPage';
import { RaiseIssueForm } from './components/public/RaiseIssueForm';
import { SubmissionSuccess } from './components/public/SubmissionSuccess';
import { TrackIssue } from './components/public/TrackIssue';
import { DepartmentDashboard } from './components/department/DepartmentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAllTickets } from './components/admin/AdminAllTickets';
import { EmployeeMaster } from './components/admin/EmployeeMaster';
import { DepartmentMaster } from './components/admin/DepartmentMaster';
import { QRCodeGenerator } from './components/admin/QRCodeGenerator';
import { ReportsView } from './components/common/ReportsView';
import { LoginModal } from './components/auth/LoginModal';
import { UserPortal } from './components/portal/UserPortal';
import { Department } from './types';

const MainContent: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    setCurrentRole, 
    setSelectedTicketId,
    setPreselectedDepartmentForForm,
    currentUser,
    setIsAuthModalOpen
  } = useTickets();

  // Guard: Protect admin views from non-admin users (Requirement 3 & 4)
  useEffect(() => {
    const isAdminView = currentView.startsWith('admin_');
    if (isAdminView && currentUser?.role !== 'admin') {
      if (currentUser?.assignedDepartments && currentUser.assignedDepartments.length > 0) {
        setCurrentView('dept_dashboard');
      } else {
        // If not logged in yet or normal user, go to raise ticket
        setCurrentView('public_raise');
      }
    }
  }, [currentView, currentUser, setCurrentView]);

  // Check URL parameters for direct deep-linking (e.g. from QR codes)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const trackParam = urlParams.get('track');
      const raiseParam = urlParams.get('raise');
      const deptParam = urlParams.get('dept');

      if (trackParam) {
        setSelectedTicketId(trackParam);
        setCurrentRole('public');
        setCurrentView('public_track');
      } else if (raiseParam) {
        if (deptParam) {
          setPreselectedDepartmentForForm(deptParam as Department);
        }
        setCurrentRole('public');
        setCurrentView('public_raise');
      }
    } catch {
      // ignore
    }
  }, [setCurrentView, setCurrentRole, setSelectedTicketId, setPreselectedDepartmentForForm]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      
      <main className="flex-1">
        {/* Core Ticket Flow: Same user-friendly screens for all users & staff */}
        {currentView === 'public_raise' && <RaiseIssueForm />}
        {currentView === 'public_track' && <TrackIssue />}
        {currentView === 'public_success' && <SubmissionSuccess />}
        {currentView === 'public_home' && <LandingPage />}
        {currentView === 'user_portal' && <RaiseIssueForm />}

        {/* Department Views */}
        {(currentView === 'dept_dashboard' || currentView === 'dept_tickets') && <DepartmentDashboard />}
        {currentView === 'dept_reports' && <ReportsView />}

        {/* Admin Views */}
        {currentView === 'admin_dashboard' && <AdminDashboard />}
        {currentView === 'admin_tickets' && <AdminAllTickets />}
        {currentView === 'admin_employees' && <EmployeeMaster />}
        {currentView === 'admin_departments' && <DepartmentMaster />}
        {currentView === 'admin_reports' && <ReportsView />}
        {currentView === 'admin_qrcode' && <QRCodeGenerator />}
      </main>

      {/* Concise Staff Sign In Modal without Scroller */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <TicketProvider>
      <MainContent />
    </TicketProvider>
  );
}
