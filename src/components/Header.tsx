import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { AppView, Department } from '../types';
import { DEPARTMENTS } from '../data/departments';
import { DesireLogo } from './common/DesireLogo';
import { 
  Building2, 
  QrCode, 
  PlusCircle, 
  Search, 
  LayoutDashboard, 
  ListFilter, 
  Menu, 
  X, 
  ChevronDown,
  Users,
  LogIn,
  LogOut,
  Lock,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView,
    activeDepartment,
    setActiveDepartment,
    currentUser,
    logout,
    setIsAuthModalOpen
  } = useTickets();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isDeptStaff = currentUser?.role === 'department_staff';
  const isNormalEmployee = currentUser?.role === 'employee';
  const hasAssignedDepts = Boolean(isDeptStaff && currentUser?.assignedDepartments && currentUser.assignedDepartments.length > 0);
  const staffAllowedDepts = isDeptStaff ? currentUser.assignedDepartments : [];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isAdmin) setCurrentView('admin_dashboard');
                else if (hasAssignedDepts && (currentView === 'dept_dashboard' || currentView === 'dept_tickets')) {
                  setCurrentView('dept_dashboard');
                } else {
                  setCurrentView('public_raise');
                }
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <DesireLogo size="md" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            
            {/* PUBLIC OR REGULAR EMPLOYEE NAVIGATION */}
            {!isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('public_raise')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'public_raise'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#0A5C36]" />
                    Raise Ticket
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('public_track')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'public_track'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-slate-500" />
                    Track Ticket
                  </span>
                </button>

                {/* IF EMPLOYEE HAS ASSIGNED DEPARTMENT RIGHTS (Requirement 5): Show Department Desk */}
                {hasAssignedDepts && (
                  <>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    
                    <button
                      onClick={() => handleNavClick('dept_dashboard')}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                        currentView === 'dept_dashboard' || currentView === 'dept_tickets'
                          ? 'text-slate-900 bg-slate-100 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutDashboard className="w-4 h-4 text-[#0A5C36]" />
                        <span>Department Desk</span>
                      </span>
                    </button>

                    {/* Department Switcher Restricted Strictly to Allowed Depts */}
                    {staffAllowedDepts.length === 1 ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 rounded-md border border-slate-200">
                        <Lock className="w-3 h-3 text-[#0A5C36]" />
                        <span>Dept: <strong>{staffAllowedDepts[0]}</strong></span>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors cursor-pointer"
                        >
                          <span>Dept: <strong>{activeDepartment}</strong></span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                        </button>

                        {deptDropdownOpen && (
                          <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Assigned Departments
                            </div>
                            {staffAllowedDepts.map((deptName) => (
                              <button
                                key={deptName}
                                onClick={() => {
                                  setActiveDepartment(deptName);
                                  setDeptDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                  activeDepartment === deptName ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600'
                                }`}
                              >
                                <span>{deptName}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {!isNormalEmployee && !isDeptStaff && (
                  <button
                    onClick={() => handleNavClick('public_home')}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                      currentView === 'public_home'
                        ? 'text-slate-900 bg-slate-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      How It Works
                    </span>
                  </button>
                )}
              </>
            )}

            {/* ADMIN ONLY NAVIGATION (Requirement 4) */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('admin_dashboard')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'admin_dashboard'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('admin_tickets')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'admin_tickets'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ListFilter className="w-4 h-4" />
                    All Tickets
                  </span>
                </button>

                {/* Requirement 1 & 4: User Master */}
                <button
                  onClick={() => handleNavClick('admin_employees')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'admin_employees'
                      ? 'text-[#0A5C36] bg-emerald-50 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0A5C36]" />
                    <span>User Master</span>
                  </span>
                </button>

                {/* Requirement 4: Department Master */}
                <button
                  onClick={() => handleNavClick('admin_departments')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'admin_departments'
                      ? 'text-[#0A5C36] bg-emerald-50 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Department Master</span>
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('admin_qrcode')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer ${
                    currentView === 'admin_qrcode'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Notice QR
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* User Auth & Actions */}
          <div className="flex items-center gap-2">
            
            {/* If Logged in: Show Employee / Admin Credentials & Sign Out */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#0A5C36]" />
                  <span className="font-semibold text-emerald-950">
                    {currentUser.firstName} {currentUser.surname}
                  </span>
                  <span className="font-mono text-[#0A5C36] font-bold">
                    ({currentUser.employeeId})
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              /* If Not Logged In: Show Staff / Admin Sign In Trigger & Direct Admin Access */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => {
                    // Quick one-click sign in as admin to directly show User Master & Admin Panel
                    setIsAuthModalOpen(true);
                  }}
                  title="Admin / User Master Access"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0A5C36]" />
                  <span>Admin / User Master</span>
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {currentUser && (
            <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">
                  {currentUser.firstName} {currentUser.surname}
                </span>
                <span className="font-mono text-[#0A5C36] text-[11px]">
                  User ID: {currentUser.employeeId} {isAdmin ? '(Admin)' : ''}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 rounded border border-rose-200"
              >
                Sign Out
              </button>
            </div>
          )}

          {!isAdmin && (
            <>
              <button
                onClick={() => handleNavClick('public_raise')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-900 bg-slate-50 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-[#0A5C36]" />
                Raise Ticket
              </button>
              <button
                onClick={() => handleNavClick('public_track')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-500" />
                Track Ticket
              </button>

              {hasAssignedDepts && (
                <button
                  onClick={() => handleNavClick('dept_dashboard')}
                  className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-[#0A5C36] bg-emerald-50 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Department Desk ({staffAllowedDepts.join(', ')})
                </button>
              )}

              {!isNormalEmployee && !isDeptStaff && (
                <button
                  onClick={() => handleNavClick('public_home')}
                  className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  How It Works
                </button>
              )}
            </>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => handleNavClick('admin_dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-900 hover:bg-slate-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </button>
              <button
                onClick={() => handleNavClick('admin_tickets')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <ListFilter className="w-4 h-4" />
                All Tickets
              </button>
              <button
                onClick={() => handleNavClick('admin_employees')}
                className="w-full text-left px-3 py-2 text-sm font-bold rounded-md text-[#0A5C36] bg-emerald-50 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                User Master
              </button>
              <button
                onClick={() => handleNavClick('admin_departments')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Department Master
              </button>
              <button
                onClick={() => handleNavClick('admin_qrcode')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Notice QR
              </button>
            </>
          )}

          {!currentUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-white bg-[#0A5C36] rounded-md flex items-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              Staff Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
};
