import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketStatus, Department, IssueType, AppView, UserRole, EmployeeUser } from '../types';
import { INITIAL_TICKETS } from '../data/initialTickets';
import { INITIAL_EMPLOYEES } from '../data/initialEmployees';
import { DEPARTMENTS, DepartmentInfo } from '../data/departments';

interface TicketContextType {
  tickets: Ticket[];
  departments: DepartmentInfo[];
  addDepartment: (payload: {
    name: string;
    code: string;
    fullName: string;
    description: string;
    category?: string;
    staff?: string[];
  }) => { success: boolean; error?: string };
  updateDepartment: (name: string, updates: Partial<DepartmentInfo>) => void;
  deleteDepartment: (name: string) => { success: boolean; error?: string };

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeDepartment: Department;
  setActiveDepartment: (dept: Department) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  lastSubmittedTicketId: string | null;
  setLastSubmittedTicketId: (id: string | null) => void;
  preselectedDepartmentForForm: Department | null;
  setPreselectedDepartmentForForm: (dept: Department | null) => void;

  // Auth & Employee Management
  employees: EmployeeUser[];
  currentUser: EmployeeUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (employeeId: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addEmployee: (data: {
    firstName: string;
    surname: string;
    employeeId: string;
    password: string;
    assignedDepartments: Department[];
    role?: 'employee' | 'department_staff' | 'admin';
  }) => { success: boolean; error?: string };
  bulkAddEmployees: (
    employeesList: Array<{
      firstName: string;
      surname: string;
      employeeId: string;
      password?: string;
      assignedDepartments?: Department[];
      role?: 'employee' | 'department_staff' | 'admin';
      status?: 'active' | 'inactive';
    }>,
    options?: { updateExisting?: boolean }
  ) => { added: number; updated: number; skipped: number };
  updateEmployee: (id: string, updates: Partial<EmployeeUser>) => void;
  deleteEmployee: (id: string) => void;
  assignDepartmentRights: (employeeIdStr: string, departments: Department[]) => void;

  // Department-Scoped Tickets
  accessibleTickets: Ticket[];
  userCanAccessDepartment: (dept: Department) => boolean;

  // Ticket Operations
  createTicket: (payload: {
    department: Department;
    issueType: IssueType;
    description: string;
    attachmentUrl?: string;
    attachmentName?: string;
    employeeName?: string;
    employeeId?: string;
    mobileNumber?: string;
    location?: string;
  }) => string;

  updateTicketStatus: (ticketId: string, status: TicketStatus, remark?: string) => void;
  assignTicket: (ticketId: string, staffName: string) => void;
  addComment: (ticketId: string, text: string, author?: string, authorRole?: 'Department Staff' | 'Admin' | 'Employee') => void;
  closeTicket: (ticketId: string, remark: string, resolutionAttachmentUrl?: string, resolutionAttachmentName?: string) => void;
  findTicketById: (query: string) => Ticket | undefined;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'company_connect_tickets_v4';
const EMPLOYEES_STORAGE_KEY = 'company_connect_employees_v3';
const CURRENT_USER_KEY = 'company_connect_current_user_v3';
const DEPARTMENTS_STORAGE_KEY = 'company_connect_departments_v1';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<DepartmentInfo[]>(() => {
    try {
      const stored = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEPARTMENTS;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_TICKETS;
  });

  const [employees, setEmployees] = useState<EmployeeUser[]>(() => {
    try {
      const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_EMPLOYEES;
  });

  const [currentUser, setCurrentUser] = useState<EmployeeUser | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (currentUser?.role === 'admin') return 'admin';
    if (currentUser?.role === 'department_staff') return 'department';
    return 'public';
  });

  const [activeDepartment, setActiveDepartment] = useState<Department>(() => {
    if (currentUser && currentUser.assignedDepartments.length > 0) {
      return currentUser.assignedDepartments[0];
    }
    return 'IT';
  });

  const [currentView, setCurrentView] = useState<AppView>('public_home');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [lastSubmittedTicketId, setLastSubmittedTicketId] = useState<string | null>(null);
  const [preselectedDepartmentForForm, setPreselectedDepartmentForForm] = useState<Department | null>(null);

  // Sync tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  // Sync employees to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // ignore
    }
  }, [employees]);

  // Sync departments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));
    } catch {
      // ignore
    }
  }, [departments]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Check if current user has access rights to a specific department
  const userCanAccessDepartment = (dept: Department): boolean => {
    if (currentRole === 'public') return true; // public can submit to any department
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.assignedDepartments.includes(dept);
  };

  // Department-Scoped Tickets: Enforce that non-admin department users can only see their department
  const accessibleTickets = React.useMemo(() => {
    if (currentRole === 'public') {
      return tickets;
    }
    if (currentRole === 'admin') {
      return tickets;
    }
    if (currentUser && currentUser.role === 'department_staff') {
      return tickets.filter((t) => currentUser.assignedDepartments.includes(t.department));
    }
    return tickets.filter((t) => t.department === activeDepartment);
  }, [tickets, currentRole, currentUser, activeDepartment]);

  // Login handler
  const login = (employeeId: string, password: string): { success: boolean; error?: string } => {
    const cleanId = employeeId.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = employees.find(
      (e) => e.employeeId.toLowerCase() === cleanId && e.password === cleanPass
    );

    if (!found) {
      return { success: false, error: 'Invalid Employee ID or Password.' };
    }

    if (found.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated by administrator.' };
    }

    setCurrentUser(found);
    setIsAuthModalOpen(false);

    if (found.role === 'admin') {
      setCurrentRole('admin');
      setCurrentView('admin_dashboard');
    } else if (found.role === 'department_staff' && found.assignedDepartments && found.assignedDepartments.length > 0) {
      setCurrentRole('department');
      const defaultDept = found.assignedDepartments[0];
      setActiveDepartment(defaultDept);
      setCurrentView('dept_dashboard');
    } else {
      // Normal employee user: raise ticket screen is the standard view
      setCurrentRole('employee');
      setCurrentView('public_raise');
    }

    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('public');
    setCurrentView('public_raise');
  };

  // Add Employee (Basic: emp name, surname, employee id, password, assigned departments)
  const addEmployee = (data: {
    firstName: string;
    surname: string;
    employeeId: string;
    password: string;
    assignedDepartments: Department[];
    role?: 'employee' | 'department_staff' | 'admin';
  }): { success: boolean; error?: string } => {
    const cleanId = data.employeeId.trim();
    if (!cleanId) {
      return { success: false, error: 'Employee ID is required.' };
    }

    // Check duplicate ID
    const exists = employees.some((e) => e.employeeId.toLowerCase() === cleanId.toLowerCase());
    if (exists) {
      return { success: false, error: `Employee ID "${cleanId}" already exists.` };
    }

    const newEmp: EmployeeUser = {
      id: `emp-${Date.now()}`,
      firstName: data.firstName.trim(),
      surname: data.surname.trim(),
      employeeId: cleanId,
      password: data.password.trim() || 'password123',
      assignedDepartments: data.assignedDepartments || [],
      role: data.role || (data.assignedDepartments?.length > 0 ? 'department_staff' : 'employee'),
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setEmployees((prev) => [newEmp, ...prev]);
    return { success: true };
  };

  const bulkAddEmployees = (
    employeesList: Array<{
      firstName: string;
      surname: string;
      employeeId: string;
      password?: string;
      assignedDepartments?: Department[];
      role?: 'employee' | 'department_staff' | 'admin';
      status?: 'active' | 'inactive';
    }>,
    options: { updateExisting?: boolean } = { updateExisting: true }
  ): { added: number; updated: number; skipped: number } => {
    let added = 0;
    let updated = 0;
    let skipped = 0;

    setEmployees((prev) => {
      const next = [...prev];
      const idMap = new Map<string, number>();
      next.forEach((emp, index) => {
        idMap.set(emp.employeeId.toLowerCase().trim(), index);
      });

      employeesList.forEach((item, idx) => {
        const cleanId = (item.employeeId || '').trim();
        if (!cleanId) {
          skipped++;
          return;
        }

        const existingIdx = idMap.get(cleanId.toLowerCase());
        const role = item.role || (item.assignedDepartments && item.assignedDepartments.length > 0 ? 'department_staff' : 'employee');
        const assignedDepts = item.assignedDepartments || [];

        if (existingIdx !== undefined) {
          if (options.updateExisting) {
            const current = next[existingIdx];
            next[existingIdx] = {
              ...current,
              firstName: item.firstName ? item.firstName.trim() : current.firstName,
              surname: item.surname ? item.surname.trim() : current.surname,
              password: item.password && item.password.trim() ? item.password.trim() : current.password,
              role: role,
              assignedDepartments: assignedDepts.length > 0 ? assignedDepts : current.assignedDepartments,
              status: item.status || current.status,
            };
            updated++;
          } else {
            skipped++;
          }
        } else {
          const newEmp: EmployeeUser = {
            id: `emp-bulk-${Date.now()}-${idx}`,
            firstName: (item.firstName || '').trim() || 'Employee',
            surname: (item.surname || '').trim() || '',
            employeeId: cleanId,
            password: (item.password || '').trim() || 'password123',
            assignedDepartments: assignedDepts,
            role: role,
            status: item.status || 'active',
            createdAt: new Date().toISOString(),
          };
          next.push(newEmp);
          idMap.set(cleanId.toLowerCase(), next.length - 1);
          added++;
        }
      });

      return next;
    });

    return { added, updated, skipped };
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeUser>) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp;
        const updated = { ...emp, ...updates };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
        }
        return updated;
      })
    );
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (currentUser && currentUser.id === id) {
      logout();
    }
  };

  const assignDepartmentRights = (employeeIdStr: string, departments: Department[]) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.employeeId.toLowerCase() === employeeIdStr.toLowerCase()) {
          const updated = { ...emp, assignedDepartments: departments };
          if (currentUser && currentUser.employeeId.toLowerCase() === employeeIdStr.toLowerCase()) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return emp;
      })
    );
  };

  const addDepartment = (payload: {
    name: string;
    code: string;
    fullName: string;
    description: string;
    category?: string;
    staff?: string[];
  }): { success: boolean; error?: string } => {
    const trimmedName = payload.name.trim();
    const trimmedCode = payload.code.trim().toUpperCase();

    if (!trimmedName) {
      return { success: false, error: 'Department Name is required.' };
    }
    if (!trimmedCode) {
      return { success: false, error: 'Department Code is required.' };
    }

    const existingName = departments.find(
      (d) => d.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingName) {
      return { success: false, error: `Department '${trimmedName}' already exists.` };
    }

    const existingCode = departments.find(
      (d) => d.code.toUpperCase() === trimmedCode
    );
    if (existingCode) {
      return { success: false, error: `Department code '${trimmedCode}' is already in use by '${existingCode.name}'.` };
    }

    const newDept: DepartmentInfo = {
      name: trimmedName,
      code: trimmedCode,
      fullName: payload.fullName.trim() || `${trimmedName} Operational Department`,
      description: payload.description.trim() || `Department handling ${trimmedName} tickets, requests, and site complaints`,
      category: payload.category || 'Technical & Operations',
      staff: payload.staff || [],
    };

    setDepartments((prev) => [newDept, ...prev]);
    return { success: true };
  };

  const updateDepartment = (name: string, updates: Partial<DepartmentInfo>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.name.toLowerCase() === name.toLowerCase() ? { ...d, ...updates } : d))
    );
  };

  const deleteDepartment = (name: string): { success: boolean; error?: string } => {
    const hasTickets = tickets.some(
      (t) => t.department.toLowerCase() === name.toLowerCase()
    );
    if (hasTickets) {
      return {
        success: false,
        error: `Cannot delete '${name}' because there are tickets registered under this department.`,
      };
    }
    setDepartments((prev) => prev.filter((d) => d.name.toLowerCase() !== name.toLowerCase()));
    return { success: true };
  };

  const createTicket = (payload: {
    department: Department;
    issueType: IssueType;
    description: string;
    attachmentUrl?: string;
    attachmentName?: string;
    employeeName?: string;
    employeeId?: string;
    mobileNumber?: string;
    location?: string;
  }): string => {
    let nextNum = 129;
    const existingNums = tickets
      .map((t) => {
        const match = t.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    if (existingNums.length > 0) {
      nextNum = Math.max(...existingNums) + 1;
    }
    const id = `#CC-${String(nextNum).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newTicket: Ticket = {
      id,
      department: payload.department,
      issueType: payload.issueType,
      description: payload.description.trim(),
      attachmentUrl: payload.attachmentUrl,
      attachmentName: payload.attachmentName,
      employeeName: payload.employeeName?.trim() || undefined,
      employeeId: payload.employeeId?.trim() || undefined,
      mobileNumber: payload.mobileNumber?.trim() || undefined,
      location: payload.location?.trim() || undefined,
      status: 'Open',
      createdAt: now,
      updatedAt: now,
      comments: [],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setLastSubmittedTicketId(id);
    return id;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, remark?: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id.toLowerCase() !== ticketId.toLowerCase()) return t;
        const updated: Ticket = {
          ...t,
          status,
          updatedAt: now,
        };
        if (status === 'Resolved') {
          updated.resolvedAt = now;
        }
        if (status === 'Closed') {
          updated.closedAt = now;
          if (remark) updated.resolutionRemark = remark;
        }
        if (remark) {
          const author = currentUser
            ? `${currentUser.firstName} ${currentUser.surname}`
            : 'Department Staff';
          updated.comments = [
            ...t.comments,
            {
              id: `c-${Date.now()}`,
              author,
              authorRole: 'Department Staff',
              text: `Status changed to ${status}. Note: ${remark}`,
              createdAt: now,
            },
          ];
        }
        return updated;
      })
    );
  };

  const assignTicket = (ticketId: string, staffName: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id.toLowerCase() !== ticketId.toLowerCase()) return t;
        return {
          ...t,
          assignedTo: staffName,
          status: t.status === 'Open' ? 'In Progress' : t.status,
          updatedAt: now,
          comments: [
            ...t.comments,
            {
              id: `c-${Date.now()}`,
              author: 'System',
              authorRole: 'Department Staff',
              text: `Ticket assigned to ${staffName}`,
              createdAt: now,
            },
          ],
        };
      })
    );
  };

  const addComment = (
    ticketId: string,
    text: string,
    author: string = 'Department Staff',
    authorRole: 'Department Staff' | 'Admin' | 'Employee' = 'Department Staff'
  ) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id.toLowerCase() !== ticketId.toLowerCase()) return t;
        return {
          ...t,
          updatedAt: now,
          comments: [
            ...t.comments,
            {
              id: `c-${Date.now()}`,
              author,
              authorRole,
              text: text.trim(),
              createdAt: now,
            },
          ],
        };
      })
    );
  };

  const closeTicket = (
    ticketId: string,
    remark: string,
    resolutionAttachmentUrl?: string,
    resolutionAttachmentName?: string
  ) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id.toLowerCase() !== ticketId.toLowerCase()) return t;
        return {
          ...t,
          status: 'Closed',
          closedAt: now,
          resolvedAt: t.resolvedAt || now,
          resolutionRemark: remark.trim(),
          resolutionAttachmentUrl,
          resolutionAttachmentName,
          updatedAt: now,
          comments: [
            ...t.comments,
            {
              id: `c-${Date.now()}`,
              author: currentUser
                ? `${currentUser.firstName} ${currentUser.surname}`
                : 'Department Staff',
              authorRole: 'Department Staff',
              text: `Ticket Closed with remark: ${remark.trim()}`,
              createdAt: now,
            },
          ],
        };
      })
    );
  };

  const findTicketById = (query: string): Ticket | undefined => {
    if (!query) return undefined;
    const clean = query.trim().toUpperCase().replace('#', '');
    return tickets.find((t) => {
      const tClean = t.id.toUpperCase().replace('#', '');
      if (tClean === clean) return true;
      if (tClean === `CC-${clean}`) return true;
      const numericQuery = clean.replace(/[^0-9]/g, '');
      const tNumeric = tClean.replace(/[^0-9]/g, '');
      if (numericQuery && tNumeric.endsWith(numericQuery)) {
        return true;
      }
      return false;
    });
  };

  const resetDemoData = () => {
    setTickets(INITIAL_TICKETS);
    setEmployees(INITIAL_EMPLOYEES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
      localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    } catch {
      // ignore
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        currentRole,
        setCurrentRole,
        activeDepartment,
        setActiveDepartment,
        currentView,
        setCurrentView,
        selectedTicketId,
        setSelectedTicketId,
        lastSubmittedTicketId,
        setLastSubmittedTicketId,
        preselectedDepartmentForForm,
        setPreselectedDepartmentForForm,
        employees,
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,
        addEmployee,
        bulkAddEmployees,
        updateEmployee,
        deleteEmployee,
        assignDepartmentRights,
        accessibleTickets,
        userCanAccessDepartment,
        createTicket,
        updateTicketStatus,
        assignTicket,
        addComment,
        closeTicket,
        findTicketById,
        resetDemoData,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
