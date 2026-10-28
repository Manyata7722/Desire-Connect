export type Department =
  | 'Jal'
  | 'Jal O&M'
  | 'Paani'
  | 'Neer'
  | 'Aqualogix'
  | 'BD'
  | 'Engineering'
  | 'E&I'
  | 'MMC'
  | 'F&A'
  | 'Tender'
  | 'Contracts'
  | 'DTT'
  | 'IT'
  | 'PPC'
  | 'Purchase'
  | 'HR'
  | 'Admin'
  | 'CSC'
  | 'Operations'
  | 'MD Office'
  | 'Paani O&M'
  | 'Paani SECI'
  | 'QHSE'
  | 'COE'
  | (string & {});

export type IssueType =
  | 'Issue'
  | 'Complaint'
  | 'Technical Issue'
  | 'Request'
  | 'Suggestion'
  | 'Other';

export type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface TicketComment {
  id: string;
  author: string;
  authorRole: 'Department Staff' | 'Admin' | 'Employee';
  text: string;
  createdAt: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface Ticket {
  id: string;
  department: Department;
  issueType: IssueType;
  description: string;
  attachmentUrl?: string;
  attachmentName?: string;
  employeeName?: string;
  employeeId?: string;
  mobileNumber?: string;
  location?: string;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionRemark?: string;
  resolutionAttachmentUrl?: string;
  resolutionAttachmentName?: string;
  comments: TicketComment[];
}

export interface EmployeeUser {
  id: string;
  firstName: string; // emp name
  surname: string;   // surname
  employeeId: string; // e.g. 1001, 1756
  password: string;
  assignedDepartments: Department[]; // Department ticket rights assigned by admin (empty for general employees)
  role: 'employee' | 'department_staff' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

export type AppView =
  | 'public_home'
  | 'public_raise'
  | 'public_success'
  | 'public_track'
  | 'user_portal'
  | 'dept_dashboard'
  | 'dept_tickets'
  | 'dept_reports'
  | 'admin_dashboard'
  | 'admin_tickets'
  | 'admin_departments'
  | 'admin_department_master'
  | 'admin_employees'
  | 'admin_reports'
  | 'admin_qrcode';

export type UserRole = 'public' | 'employee' | 'department' | 'admin';

