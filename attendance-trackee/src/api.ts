import axios from 'axios';

const API_BASE_URL = (import.meta as any).env.VITE_BACKEND_URL;
const ATTENDANCE_THRESHOLD = import.meta.env.VITE_ATTENDANCE_THRESHOLD;

// Configure axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for JWT cookies
});

// Global Admin APIs
export const globalAdminAPI = {
  signup: async (username: string, password: string) => {
    const response = await api.post('/auth/globaladmin/signup', {
      username,
      password
    });
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post('/auth/globaladmin/login', {
      username,
      password
    });
  // Removed debug log
    return response; // Return full response object, not just response.data
  },

  logout: async () => {
    const response = await api.post('/auth/globaladmin/logout');
    return response.data;
  },

  createVerticalLead: async (leadData: {
    name: string;
    roll_no: string;
    year: number;
    department: string;
    vertical: string;
    password: string;
  }) => {
    const response = await api.post('/globaladmin/verticalleads/create', leadData);
    return response.data;
  },

  getVerticalLeads: async () => {
    const response = await api.get('/globaladmin/verticalleads');
    return response.data;
  },

  getVerticalLeadById: async (roll_no: string) => {
    const response = await api.get(`/globaladmin/verticalleads/${roll_no}`);
    return response.data;
  },

  updateVerticalLead: async (
    roll_no: string,
    updateData: {
      name?: string;
      rollno?: string;
      year?: number;
      department?: string;
      vertical?: string;
    }
  ) => {
    const response = await api.put(`/globaladmin/verticalleads/${roll_no}`, updateData);
    return response.data;
  },

  deleteVerticalLead: async (roll_no: string) => {
    const response = await api.delete(`/globaladmin/verticalleads/${roll_no}`);
    return response.data;
  },

  // Get attendance summary for all verticals (Global Admin only)
  getAllVerticalsAttendanceSummary: async () => {
    const response = await api.get('/globaladmin/attendance-summary/all');
    return response.data;
  },

  // Delete member directly (Global Admin endpoint)
  deleteMember: async (roll_no: string) => {
    const response = await api.delete(`/globaladmin/members/${roll_no}`);
    return response.data;
  },

  // Delete request management
  getAllDeleteRequests: async (status?: 'pending' | 'approved' | 'rejected') => {
    const params = status ? { status } : {};
    const response = await api.get('/globaladmin/delete-requests', { params });
    return response.data;
  },

  getDeleteRequestById: async (requestId: string) => {
    const response = await api.get(`/globaladmin/delete-requests/${requestId}`);
    return response.data;
  },

  reviewDeleteRequest: async (requestId: string, action: 'approve' | 'reject') => {
    const response = await api.put(`/globaladmin/delete-requests/${requestId}`, { action });
    return response.data;
  }
};

// Global Admin operations (meetings, attendance, reports)
export const globalAdminOperationsAPI = {
  // Meetings (created by Global Admin / OB)
  createMeeting: async (meetingData: { meeting_name: string; date: string; m_o_m?: string }) => {
    const response = await api.post('/globaladmin/meetings', meetingData);
    return response.data;
  },

  getMeetings: async () => {
    const response = await api.get('/globaladmin/meetings');
    return response.data; // { message, count, meetings }
  },

  getMeetingById: async (meetingId: string) => {
    const response = await api.get(`/globaladmin/meetings/${meetingId}`);
    return response.data;
  },

  updateMeeting: async (meetingId: string, updateData: { meeting_name?: string; date?: string; m_o_m?: string }) => {
    const response = await api.put(`/globaladmin/meetings/${meetingId}`, updateData);
    return response.data;
  },

  deleteMeeting: async (meetingId: string) => {
    const response = await api.delete(`/globaladmin/meetings/${meetingId}`);
    return response.data;
  },

  // Attendance (for meetings created by OB)
  getMembersAttendance: async (meetingId: string) => {
    const response = await api.get(`/globaladmin/meetings/${meetingId}/members-attendance`);
    return response.data; // { message, meeting, members, count }
  },

  updateAttendance: async (meetingId: string, memberAttendance: { [roll_no: string]: boolean }) => {
    const response = await api.put(`/globaladmin/meetings/${meetingId}/attendance`, { memberAttendance });
    return response.data; // { message, modified, upserted }
  },

  // Attendance report (CSV)
  generateAttendanceReport: async (threshold?: number) => {
    const params: any = {};
    if (threshold !== undefined) params.threshold = threshold;
    const response = await api.get(`/globaladmin/attendance-report?threshold=${parseInt(ATTENDANCE_THRESHOLD)}`, { params, responseType: 'blob' });
    return response; // caller can handle blob to download
  }
};

// Vertical Lead APIs
export const verticalLeadAPI = {
  uploadMembersXlsx: async (formData: FormData) => {
    const response = await api.post('/verticalleads/members/upload-xlsx', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  login: async (roll_no: string, password: string) => {
    const response = await api.post('/auth/verticalleads/login', {
      roll_no,
      password
    });
    return response; // Return full response object, not just response.data
  },

  logout: async () => {
    const response = await api.post('/auth/verticalleads/logout');
    return response.data;
  },

  // Members management
  addMember: async (memberData: {
    name: string;
    roll_no: string;
    year: number;
    department: string;
  }) => {
    const response = await api.post('/verticalleads/members', memberData);
    return response.data;
  },

  getMembers: async () => {
    const response = await api.get('/verticalleads/members');
    return response.data; // Returns { message, count, members }
  },

  getMemberById: async (roll_no: string) => {
    const response = await api.get(`/verticalleads/members/${roll_no}`);
    return response.data;
  },

  updateMember: async (
    roll_no: string,
    updateData: {
      name?: string;
      year?: number;
      department?: string;
    }
  ) => {
    const response = await api.put(`/verticalleads/members/${roll_no}`, updateData);
    return response.data;
  },

  deleteMember: async (roll_no: string) => {
    const response = await api.delete(`/verticalleads/members/${roll_no}`);
    return response.data;
  },

  // Request member deletion (creates delete request for global admin)
  requestMemberDeletion: async (roll_no: string, reason?: string) => {
    const response = await api.post('/verticalleads/delete-requests', { 
      roll_no,
      reason 
    });
    return response.data;
  },

  // Meetings management
  createMeeting: async (meetingData: {
    meeting_name: string;
    date: string;
    m_o_m?: string;
  }) => {
    const response = await api.post('/verticalleads/meetings', meetingData);
    return response.data; // Returns { message, meeting }
  },

  getMeetings: async () => {
    const response = await api.get('/verticalleads/meetings');
    return response.data; // Returns { message, count, meetings }
  },

  getMeetingById: async (meetingId: string) => {
    const response = await api.get(`/verticalleads/meetings/${meetingId}`);
    return response.data;
  },

  updateMeeting: async (
    meetingId: string,
    updateData: {
      meeting_name?: string;
      date?: string;
      m_o_m?: string;
    }
  ) => {
    const response = await api.put(`/verticalleads/meetings/${meetingId}`, updateData);
    return response.data;
  },

  deleteMeeting: async (meetingId: string) => {
    const response = await api.delete(`/verticalleads/meetings/${meetingId}`);
    return response.data;
  },

  // Attendance management
  getMembersAttendance: async (meetingId: string) => {
    const response = await api.get(`/verticalleads/meetings/${meetingId}/members-attendance`);
    return response.data; // Returns { message, meeting, members, count }
  },

  updateAttendance: async (
    meetingId: string,
    memberAttendance: { [roll_no: string]: boolean }
  ) => {
    const response = await api.put(`/verticalleads/meetings/${meetingId}/attendance`, {
      memberAttendance
    });
    return response.data; // Returns { message, modified, upserted }
  }
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
  // Removed debug error
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
  // Removed debug error
      return Promise.reject({ error: 'Network error occurred' });
    } else {
      // Something happened in setting up the request that triggered an Error
  // Removed debug error
      return Promise.reject({ error: 'Request failed' });
    }
  }
);

export default api;
