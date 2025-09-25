// User types
export interface User {
  roll_no?: string;
  username?: string;
  name?: string;
  year?: number;
  department?: string;
  vertical?: string;
  role: 'vertical_head' | 'global_admin';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Meeting types
export interface Meeting {
  _id: string;
  meeting_name: string;
  date: string;
  m_o_m: string;
  vertical?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMeetingData {
  meeting_name: string;
  date: string;
  m_o_m: string;
}

// Member types
export interface Member {
  _id?: string;
  name: string;
  roll_no: string;
  year: number;
  department: string;
  vertical?: string;
}

export interface MemberAttendance {
  member: Member;
  isPresent: boolean;
}

export interface AttendanceData {
  [roll_no: string]: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Form types
export interface LoginFormData {
  identifier: string; // can be roll_no or username
  password: string;
  role: 'vertical_head' | 'global_admin';
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (formData: LoginFormData) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Component props types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('vertical_head' | 'global_admin')[];
}