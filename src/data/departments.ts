import { Department, IssueType } from '../types';

export interface DepartmentInfo {
  name: Department;
  code: string;
  fullName: string;
  description: string;
  category: 'Water Projects' | 'Technical & Operations' | 'Corporate & Commercial' | 'Executive' | string;
  domain?: string;
  staff: string[];
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    name: 'Jal',
    code: 'JAL',
    fullName: 'Jal Water Systems & Execution',
    description: 'Drinking water distribution, pipeline execution & infrastructure',
    category: 'Water Projects',
    staff: ['Vikram Deshmukh', 'Kavita Rao', 'Suresh Nair'],
  },
  {
    name: 'Jal O&M',
    code: 'JAL-OM',
    fullName: 'Jal Operations & Maintenance',
    description: 'Day-to-day pumping station, pipeline repair & preventative maintenance',
    category: 'Water Projects',
    staff: ['Rajesh Shinde', 'Mahesh Patil', 'Santosh Jadhav'],
  },
  {
    name: 'Paani',
    code: 'PAANI',
    fullName: 'Paani Rural & Urban Supply',
    description: 'Rural and municipal community water schemes & bulk installations',
    category: 'Water Projects',
    staff: ['Ananya Sharma', 'Girish Kulkarni'],
  },
  {
    name: 'Neer',
    code: 'NEER',
    fullName: 'Neer Water Treatment',
    description: 'Filtration, RO plants, treatment chemistry & quality labs',
    category: 'Water Projects',
    staff: ['Dr. Meera Sen', 'Ketan Solanki'],
  },
  {
    name: 'Aqualogix',
    code: 'AQUA',
    fullName: 'Aqualogix Smart Automation',
    description: 'SCADA, IoT sensors, flow telemetry and digital water monitoring',
    category: 'Water Projects',
    staff: ['Arjun Menon', 'Deepak Bansal'],
  },
  {
    name: 'BD',
    code: 'BD',
    fullName: 'Business Development',
    description: 'Client acquisition, tender discovery, partnerships & proposals',
    category: 'Corporate & Commercial',
    staff: ['Rohan Singhal', 'Pooja Iyer'],
  },
  {
    name: 'Engineering',
    code: 'ENG',
    fullName: 'Engineering & Design Services',
    description: 'Civil structural drawings, CAD models, hydraulic calculations & BOQ',
    category: 'Technical & Operations',
    staff: ['Harish Chandran', 'Sneha Mukhopadhyay', 'Vikas Goyal'],
  },
  {
    name: 'E&I',
    code: 'EI',
    fullName: 'Electrical & Instrumentation',
    description: 'Switchgear, PLC panels, field sensors, transformer substations',
    category: 'Technical & Operations',
    staff: ['Naveen Kumar', 'Ashwin Reddy'],
  },
  {
    name: 'MMC',
    code: 'MMC',
    fullName: 'Materials & Machinery Control',
    description: 'Heavy equipment fleet, earthmovers, pipe inventory & mobilization',
    category: 'Technical & Operations',
    staff: ['Balwant Singh', 'Ramesh Tiwari'],
  },
  {
    name: 'F&A',
    code: 'FA',
    fullName: 'Finance & Accounts',
    description: 'Vendor bills, expense reimbursements, payroll disbursement, audit',
    category: 'Corporate & Commercial',
    staff: ['Siddharth Jain', 'Neelam Aggarwal', 'Sunil Ghosh'],
  },
  {
    name: 'Tender',
    code: 'TND',
    fullName: 'Tendering & Bid Management',
    description: 'Government bids, tender portal filings, EMDs and compliance checks',
    category: 'Corporate & Commercial',
    staff: ['Priyanka Varma', 'Kunal Soni'],
  },
  {
    name: 'Contracts',
    code: 'CON',
    fullName: 'Contracts & Legal Agreements',
    description: 'Sub-contractor SLAs, contract variations, legal disputes & clauses',
    category: 'Corporate & Commercial',
    staff: ['Adv. Tarun Mathur', 'Divya Nair'],
  },
  {
    name: 'DTT',
    code: 'DTT',
    fullName: 'Digital Transformation & Technology',
    description: 'Enterprise ERP, custom business workflows, field data sync apps',
    category: 'Technical & Operations',
    staff: ['Prashant Bhardwaj', 'Tanvi Mehta'],
  },
  {
    name: 'IT',
    code: 'IT',
    fullName: 'Information Technology & Helpdesk',
    description: 'Laptops, networking, WiFi, VPN, Zoho, server uptime, hardware support',
    category: 'Technical & Operations',
    staff: ['Amit Verma', 'Rahul Sharma', 'Gaurav Dutta'],
  },
  {
    name: 'PPC',
    code: 'PPC',
    fullName: 'Project Planning & Control',
    description: 'Gantt schedules, milestone tracking, resource leveling, progress reports',
    category: 'Technical & Operations',
    staff: ['Mohit Chawla', 'Bhavna Joshi'],
  },
  {
    name: 'Purchase',
    code: 'PUR',
    fullName: 'Procurement & Vendor Purchase',
    description: 'Purchase orders, steel, cement, pipes procurement & rate negotiations',
    category: 'Corporate & Commercial',
    staff: ['Alok Mishra', 'Hemant Tripathi'],
  },
  {
    name: 'HR',
    code: 'HR',
    fullName: 'Human Resources & People Care',
    description: 'Attendance, employee onboarding, leaves, PF/ESI, ID cards, grievances',
    category: 'Corporate & Commercial',
    staff: ['Priya Patel', 'Shalini Kapoor', 'Zaid Khan'],
  },
  {
    name: 'Admin',
    code: 'ADM',
    fullName: 'Administration & Facilities',
    description: 'Office maintenance, pantry, housekeeping, desk allocation, AC & travel',
    category: 'Corporate & Commercial',
    staff: ['Dinesh Rawat', 'Manoj Kumar', 'Sunita Bai'],
  },
  {
    name: 'CSC',
    code: 'CSC',
    fullName: 'Central Support Center',
    description: 'Site emergency helpline, cross-department coordination & dispatch',
    category: 'Corporate & Commercial',
    staff: ['Kiran Sawant', 'Sameer Ali'],
  },
  {
    name: 'Operations',
    code: 'OPS',
    fullName: 'Central Operations & Logistics',
    description: 'Regional dispatch, logistics routing, site handover protocols',
    category: 'Technical & Operations',
    staff: ['Jagdish Thapa', 'Ritu Saxena'],
  },
  {
    name: 'MD Office',
    code: 'MDO',
    fullName: 'Managing Director Office & Executive Secretariat',
    description: 'High-priority escalations, policy decisions, executive approvals',
    category: 'Executive',
    staff: ['Executive Secretary', 'Chief of Staff'],
  },
  {
    name: 'Paani O&M',
    code: 'PNI-OM',
    fullName: 'Paani Operations & Maintenance',
    description: 'Regional pipeline maintenance, pump upkeep, water supply regularity',
    category: 'Water Projects',
    staff: ['Devendra Yadav', 'Omkar Rane'],
  },
  {
    name: 'Paani SECI',
    code: 'PNI-SECI',
    fullName: 'Paani Solar Energy Corporation Project',
    description: 'Dedicated solar-powered water schemes and renewable pumping systems',
    category: 'Water Projects',
    staff: ['Suraj Narayanan', 'Vinay Prakash'],
  },
  {
    name: 'QHSE',
    code: 'QHSE',
    fullName: 'Quality, Health, Safety & Environment',
    description: 'Site safety gear, PPE compliance, ISO audits, accident reporting & hazards',
    category: 'Technical & Operations',
    staff: ['Major K.S. Rathore (Retd)', 'Pallavi Deshmukh'],
  },
  {
    name: 'COE',
    code: 'COE',
    fullName: 'Center of Excellence & Training',
    description: 'Technical training, best practice manuals, knowledge bank & testing labs',
    category: 'Technical & Operations',
    staff: ['Dr. R. Ramakrishnan', 'Swati Bhatt'],
  },
];

export const DEPARTMENT_NAMES: Department[] = DEPARTMENTS.map((d) => d.name);

export const ISSUE_TYPES: { type: IssueType; description: string }[] = [
  { type: 'Issue', description: 'Technical fault, machine breakdown, operational disruption or tool issue' },
  { type: 'Complaint', description: 'Grievance, service delay, workplace issue, or safety hazard' },
];

