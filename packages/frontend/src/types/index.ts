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
  email?: string
  password?: string
  role?: UserRole
  provider?: 'google' | 'apple'
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
  totalHours?: number | null
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


// @/types/attendance.ts or integrated into @/types/index.ts

// --- Base Types from Database Schema ---

/**
 * Represents the structure of the 'work_shifts' table.
 */
export interface WorkShift {
  id: string; // UUID
  name: string;
  start_time: string; // TIME 'HH:MM:SS'
  end_time: string; // TIME 'HH:MM:SS'
  work_hours: number; // NUMERIC(4, 2)
  grace_period_minutes: number; // INTEGER
  created_at?: string; // TIMESTAMPTZ (ISO string)
  updated_at?: string; // TIMESTAMPTZ (ISO string)
}

/**
 * Represents the structure of the 'employee_shifts' table.
 */
export interface EmployeeShift {
  id: string; // UUID
  employee_id: string; // UUID (references employees.id)
  shift_id: string; // UUID (references work_shifts.id)
  effective_from: string; // DATE 'YYYY-MM-DD'
  created_at?: string; // TIMESTAMPTZ (ISO string)
}

/**
 * Represents the structure of the 'attendance_records' table.
 * Status values align with the CHECK constraint.
 */
export type AttendanceRecordStatus =
  | 'Present' | 'Absent' | 'Late' | 'Half Day - First Half' | 'Half Day - Second Half'
  | 'Leave' | 'Holiday' | 'Weekend' | 'Missing Punch'
  | 'Regularized - Present' | 'Regularized - Late';

export interface AttendanceRecord {
  id: string; // UUID
  employee_id: string; // UUID
  attendance_date: string; // DATE 'YYYY-MM-DD'
  clock_in_time: string | null; // TIMESTAMPTZ (ISO string) or null
  clock_out_time: string | null; // TIMESTAMPTZ (ISO string) or null 
  hours_worked: number | null; // NUMERIC(4, 2) or null
  status: AttendanceRecordStatus;
  work_location: string | null; // e.g., 'Office', 'Home', 'Client Site'
  notes?: string | null;
  created_at?: string; // TIMESTAMPTZ (ISO string)
  updated_at?: string; // TIMESTAMPTZ (ISO string)
}

/**
 * Represents the structure of the 'regularization_requests' table.
 * Status values align with the CHECK constraint.
 */
export type RegularizationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type RequestedAttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day - First Half' | 'Half Day - Second Half';


export interface RegularizationRequest {
  checkIn: any
  checkOut: any
  date?: string // Optional if you want a direct property for UI
  id: string
  employee_id: string
  attendance_record_id: string | null
  request_date: string // 'YYYY-MM-DD'
  original_clock_in: string | null
  original_clock_out: string | null
  requested_clock_in: string | null
  requested_clock_out: string | null
  requested_status: RequestedAttendanceStatus | null
  reason: string
  status: RegularizationStatus
  processed_by: string | null
  processed_at: string | null
  comments: string | null
  created_at?: string
  updated_at?: string

  employeeName?: string
  processedByName?: string
}

// --- Helper Types for Frontend Components ---

/**
 * Structure for displaying daily status in the AttendanceCalendar.
 * Backend controllers will assemble this using data from multiple tables.
 */
export interface AttendanceDayStatus {
  clock_in_time: AttendanceDayStatus | undefined
  clock_out_time: any
  attendance_date: string
  date: string; // YYYY-MM-DD
  status: AttendanceRecordStatus | 'Leave' | 'Holiday' | 'Weekend'; // Combines statuses
  clockIn?: string | null; // HH:mm format (formatted by backend)
  clockOut?: string | null; // HH:mm format (formatted by backend)
  hoursWorked?: number | null;
  needsRegularization?: boolean; // Flag for UI indicator
  leaveType?: string; // From leave_requests table
  holidayName?: string; // From company_holidays table
}

/**
 * Structure for the AttendanceSummaryWidget.
 * Calculated by backend controllers.
 */
export interface AttendanceSummaryData {
    present: number;    // Count of present days (incl. regularized)
    absent: number;     // Count of absent days
    late: number;       // Count of late days (incl. regularized)
    workFromHome: number;// Count based on work_location
    totalDays: number;  // Total working days in the period (month - weekends - holidays)
    totalHoursMonth?: number; // Sum of hours_worked
    avgHoursDay?: number;   // Calculated average
    todayStatus?: AttendanceDayStatus['status'] | 'Not Clocked In' | null; // Status for today
    todayClockIn?: string | null; // HH:mm format for today
}


// --- API Response Types for Views ---

/**
 * Data structure returned by GET /api/attendance/employee-view
 */
export interface EmployeeAttendanceViewData {
  // Stats Cards
  presentDays: number;
  todaysHours: number; // Formatted to 1 or 2 decimal places
  pendingRegularizationsCount: number;
  currentWorkLocation: string;
  // Calendar Data
  monthlyAttendance: AttendanceDayStatus[];
  // History List
  regularizationHistory: RegularizationRequest[]; // Should include employeeName potentially
  // Summary Widget
  attendanceSummary: AttendanceSummaryData;
}

/**
 * Data structure returned by GET /api/attendance/manager-view
 */
export interface ManagerAttendanceViewData {
  // Stats Cards
  teamPresentToday: string; // "Count/Total"
  teamLateToday: number;
  pendingApprovalsCount: number;
  teamAverageAttendance: string; // "Percent%"
  // Calendar Data (Aggregated)
  teamMonthlyAttendanceSummary: {
     date: string; // YYYY-MM-DD
     presentCount: number;
     absentCount: number;
     lateCount: number;
     onLeaveCount: number; // Count of team members on leave
  }[];
  // Other Sections
  teamInsights: string[];
  pendingRegularizationApprovals: RegularizationRequest[]; // MUST include employeeName
  // Summary Widget (Aggregated)
  teamAttendanceSummary: AttendanceSummaryData;
}

/**
 * Data structure returned by GET /api/attendance/admin-view
 */
export interface AdminAttendanceViewData {
  // Stats Cards (Company-wide or filtered scope)
  companyPresentToday: string;
  companyLateToday: number;
  totalPendingRequests: number;
  companyAverageAttendance: string;
  // Calendar Data (Aggregated)
  companyAttendanceSummary: {
     date: string;
     presentCount: number;
     absentCount: number;
     lateCount: number;
     onLeaveCount: number;
  }[];
  // Other Sections
  systemAlerts: string[];
  // Optional: All pending requests if admin approves
  allPendingRegularizations?: RegularizationRequest[]; // MUST include employeeName
  // Summary Widget (Aggregated)
  companyWideAttendanceSummary: AttendanceSummaryData;
}

// --- Types for API Action Payloads/Responses (Optional but good practice) ---

export interface ClockInPayload {
    location: string;
    // Potentially add timestamp if frontend allows overriding
}

export interface ClockInOutResponse {
    message: string;
    record: AttendanceRecord;
}

export interface RegularizePayload {
    date: string; // YYYY-MM-DD
    reason: string;
    requestedClockIn?: string | null; // HH:mm
    requestedClockOut?: string | null; // HH:mm
    requestedStatus?: RequestedAttendanceStatus | null;
}

export interface RegularizeResponse {
    message: string;
    request: RegularizationRequest;
}

export interface RegularizeActionPayload {
    requestId: string | number; // UUID or ID
    status: 'approved' | 'rejected';
    comments?: string | null;
}

export interface RegularizeActionResponse {
    message: string;
    request: RegularizationRequest; // The updated request
}
// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
