// User and Authentication Types
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department?: string
  position?: string
  employeeId?: string
  joinDate?: string
  phone?: string
  address?: string
  salary?: number
  manager?: string
  directReports?: string[]
  permissions?: Permission[]
}

export type UserRole = 'employee' | 'hr' | 'manager' | 'admin'

export interface Permission {
  module: string
  actions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
  role?: UserRole
}

// Employee Types
export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  department: string
  position: string
  salary: number
  joinDate: string
  status: EmployeeStatus
  avatar?: string
  manager?: string
  location?: string
  employeeType?: 'full-time' | 'part-time' | 'contract' | 'intern'
  skills?: string[]
  leaveBalance: LeaveBalance
  performanceScore?: number
}

export type EmployeeStatus = 'active' | 'inactive' | 'on-leave' | 'terminated'

// Leave Management Types
export interface LeaveBalance {
  casual: number
  sick: number
  vacation: number
  maternity?: number
  paternity?: number
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  approvedBy?: string
  appliedDate: string
  comments?: string
}

export type LeaveType = 'casual' | 'sick' | 'vacation' | 'maternity' | 'paternity' | 'emergency' | 'earned' | 'bereavement'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

// New interfaces for LeavesPage.tsx
export interface LeaveBalanceCard {
  type: LeaveType | string; // Allow string for now if not all types are in LeaveType
  used: number;
  total: number;
  icon: any; // Lucide icon component
  color: string;
}

export interface LeaveHistoryEntry {
  id: number;
  type: LeaveType | string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

export interface CompanyHoliday {
  date: string;
  name: string;
}

export interface LeavePolicyDetails {
  [key: string]: string; // e.g., 'Casual Leave': 'Policy text'
}

export interface PendingApprovalRequest {
  id: number;
  employee: string;
  type: LeaveType | string;
  from: string;
  to: string;
  days: number;
  reason: string;
  balance: string; // e.g., '5 / 20'
}

export interface TeamLeaveBalanceSummary {
  employee: string;
  casual: string;
  sick: string;
  earned: string;
  // Add other leave types as needed
}

export interface AIConflictAdvisorData {
  [employeeName: string]: string[]; // e.g., 'John Doe': ['Conflict message']
}

export interface LeavePolicyConfiguration {
  accrual: string;
  carryForward: string;
  encashment: string;
  approvalWorkflow: string;
}

export interface CompanyWideLeaveDashboardData {
  consumptionByDepartment: { [key: string]: string };
  trendsInLeaveTypes: { [key: string]: string };
  totalLeaveBalances: string;
}

export type AIAbsenteeismForecasterData = string[]; // Array of insight strings

export interface LeaveFormState {
  leaveType: string;
  fromDate: string;
  toDate: string;
  startSession: 'Full Day' | 'First Half' | 'Second Half';
  endSession: 'Full Day' | 'First Half' | 'Second Half';
  reason: string;
  document: File | null;
}


// Recruitment Types
export interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  description: string
  requirements: string[]
  benefits?: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  status: 'active' | 'paused' | 'closed' | 'draft'
  postedDate: string
  deadline?: string
  applicants: number
  hiringManager: string
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  jobId: string
  stage: CandidateStage
  source: string
  appliedDate: string
  resume?: string
  portfolio?: string
  linkedIn?: string
  experience: number
  skills: string[]
  education: Education[]
  aiScore?: number
  aiSummary?: string
  notes?: Note[]
  interviews?: Interview[]
  status: CandidateStatus
}

export type CandidateStage = 'applied' | 'screening' | 'phone-interview' | 'technical-interview' | 'final-interview' | 'offer' | 'hired' | 'rejected'
export type CandidateStatus = 'active' | 'hired' | 'rejected' | 'withdrawn'

export interface Education {
  degree: string
  institution: string
  year: string
  grade?: string
}

export interface Note {
  id: string
  content: string
  author: string
  date: string
  type: 'general' | 'interview' | 'feedback'
}

export interface Interview {
  id: string
  candidateId: string
  type: 'phone' | 'video' | 'in-person' | 'technical'
  date: string
  time: string
  duration: number
  interviewer: string[]
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  feedback?: string
  rating?: number
  round: number
}

// Payroll Types
export interface Payslip {
  id: string
  employeeId: string
  month: string
  year: number
  basicSalary: number
  allowances: Allowance[]
  deductions: Deduction[]
  grossPay: number
  netPay: number
  taxes: number
  providentFund?: number
  overtime?: number
  bonus?: number
  generatedDate: string
  status: 'draft' | 'processed' | 'paid'
}

export interface Allowance {
  type: string
  amount: number
  taxable: boolean
}

export interface Deduction {
  type: string
  amount: number
  mandatory: boolean
}

export interface TaxDeclaration {
  id: string
  employeeId: string
  year: number
  section80C: number
  section80D: number
  houseRent: number
  homeLoan: number
  others: number
  totalDeduction: number
  status: 'draft' | 'submitted' | 'approved'
  submittedDate?: string
}

// Attendance Types
export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  breakTime?: number
  totalHours?: number
  overtime?: number
  status: AttendanceStatus
  location?: string
  notes?: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'work-from-home'

export interface AttendanceSummary {
  employeeId: string
  month: string
  year: number
  totalWorkingDays: number
  daysPresent: number
  daysAbsent: number
  daysLate: number
  totalHours: number
  overtimeHours: number
  averageHours: number
}

// Performance Types
export interface Goal {
  id: string
  employeeId: string
  title: string
  description: string
  category: 'professional' | 'personal' | 'team' | 'company'
  priority: 'low' | 'medium' | 'high' | 'critical'
  target: string
  metric: string
  startDate: string
  endDate: string
  progress: number
  status: 'not-started' | 'in-progress' | 'completed' | 'cancelled'
  assignedBy: string
  notes?: string[]
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  period: string
  type: 'quarterly' | 'annual' | 'probation' | 'project'
  selfRating: number
  managerRating: number
  finalRating: number
  goals: Goal[]
  achievements: string[]
  improvements: string[]
  feedback: string
  status: 'draft' | 'submitted' | 'reviewed' | 'completed'
  submittedDate?: string
  reviewedDate?: string
}

// Dashboard Types
export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  data: any
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  visible: boolean
  userRole: UserRole[]
}

export type WidgetType = 
  | 'kpi' 
  | 'chart' 
  | 'table' 
  | 'calendar' 
  | 'notifications' 
  | 'quick-actions' 
  | 'profile' 
  | 'attendance-summary'
  | 'leave-balance'
  | 'recruitment-funnel'
  | 'team-performance'
  | 'payroll-overview'
  | 'company-announcements'

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  recipient: string
  sender?: string
  read: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
  category: 'leave' | 'payroll' | 'recruitment' | 'performance' | 'announcement' | 'system'
}

// Analytics Types
export interface AnalyticsData {
  period: string
  metrics: {
    [key: string]: number | string
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

// Company Types
export interface Department {
  id: string
  name: string
  description?: string
  manager: string
  employees: number
  budget?: number
  location?: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  type: 'national' | 'regional' | 'company'
  optional: boolean
  description?: string
}

export interface CompanyPolicy {
  id: string
  title: string
  category: string
  content: string
  effectiveDate: string
  version: string
  approvedBy: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file'
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  placeholder?: string
  disabled?: boolean
  defaultValue?: any
}

// Theme Types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    success: string
    warning: string
    error: string
    info: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
  }
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    categories: string[]
  }
  dashboard: {
    widgets: string[]
    layout: 'grid' | 'list'
  }
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
