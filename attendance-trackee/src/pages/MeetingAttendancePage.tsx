import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verticalLeadAPI, globalAdminOperationsAPI } from '../api';
import type { Meeting, Member, AttendanceData } from '../types';
import ThemeToggle from '../components/ThemeToggle';

const MeetingAttendancePage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState<AttendanceData>({});
  const [originalAttendance, setOriginalAttendance] = useState<AttendanceData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for unsaved changes
  const checkForChanges = useCallback(() => {
    const hasChanges = Object.keys(attendance).some(rollNo => 
      attendance[rollNo] !== originalAttendance[rollNo]
    );
    setHasUnsavedChanges(hasChanges);
    return hasChanges;
  }, [attendance, originalAttendance]);

  // Helper function to get the correct dashboard path based on user role
  const getDashboardPath = () => {
    return user?.role === 'global_admin' ? '/admin/dashboard' : '/dashboard';
  };

  useEffect(() => {
    checkForChanges();
  }, [attendance, checkForChanges]);

  // Prevent leaving page with unsaved changes
  useBeforeUnload(
    React.useCallback(
      (event: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          const message = 'You have unsaved changes. Are you sure you want to leave?';
          event.preventDefault();
          event.returnValue = message;
          return message;
        }
      },
      [hasUnsavedChanges]
    )
  );

  useEffect(() => {
    if (meetingId) {
      fetchMeetingData();
    }
  }, [meetingId]);

  const fetchMeetingData = async () => {
    if (!meetingId) return;
    
    try {
      setLoading(true);
      setError('');

  // Choose API based on user role: vertical_head uses verticalLeadAPI, global_admin uses globalAdminOperationsAPI
  const apiToUse = user?.role === 'global_admin' ? globalAdminOperationsAPI : verticalLeadAPI;

  // Fetch meeting details and members attendance (combined in one API call based on backend)
  const response = await apiToUse.getMembersAttendance(meetingId);

      if (response.message && response.meeting && response.members) {
        setMeeting(response.meeting);
        setMembers(response.members);
        
        // Initialize attendance state from members' is_attended field
        const initialAttendance: AttendanceData = {};
        response.members.forEach((member: Member & { is_attended: boolean | null }) => {
          initialAttendance[member.roll_no] = member.is_attended || false;
        });
        
        setAttendance(initialAttendance);
        setOriginalAttendance({ ...initialAttendance });
      } else {
        throw new Error('Failed to fetch meeting and attendance data');
      }
    } catch (err: any) {
      console.error('Error fetching meeting data:', err);
      setError(err.error || 'Failed to load meeting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (rollNo: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [rollNo]: isPresent
    }));
  };

  const handleSaveChanges = async () => {
    if (!meetingId) return;

    try {
      setSaving(true);
      setError('');

  const apiToUse = user?.role === 'global_admin' ? globalAdminOperationsAPI : verticalLeadAPI;
  const response = await apiToUse.updateAttendance(meetingId, attendance);
      
      if (response.message && (response.modified !== undefined || response.upserted !== undefined)) {
        setOriginalAttendance({ ...attendance });
        setHasUnsavedChanges(false);
        // Show success message (you could add a toast notification here)
        alert('Attendance updated successfully!');
      } else {
        throw new Error('Failed to save attendance');
      }
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setError(err.error || 'Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const dashboardPath = getDashboardPath();
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Do you want to save before leaving?'
      );
      if (confirmLeave) {
        handleSaveChanges().then(() => navigate(dashboardPath));
      } else if (window.confirm('Are you sure you want to leave without saving?')) {
        navigate(dashboardPath);
      }
    } else {
      navigate(dashboardPath);
    }
  };

  const handleLogout = async () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Do you want to save before logging out?'
      );
      if (confirmLeave) {
        await handleSaveChanges();
      } else if (!window.confirm('Are you sure you want to logout without saving?')) {
        return;
      }
    }
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPresentCount = () => {
    return Object.values(attendance).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors">
        <div className="text-center bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 rounded-xl px-8 py-10 shadow-md shadow-blue-500/5 dark:shadow-blue-900/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Meeting Not Found</h2>
          <button
            onClick={() => navigate(getDashboardPath())}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter members by roll number or name
  const filteredMembers = members.filter((member) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      member.roll_no.toLowerCase().includes(term) ||
      member.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Meeting Attendance</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, {user?.name || user?.roll_no}
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <ThemeToggle className="mx-auto sm:mx-0" />
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 transition-colors duration-200 min-h-[40px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meeting Info */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{meeting.meeting_name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{formatDate(meeting.date)}</p>
          {meeting.m_o_m && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Minutes of Meeting:</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{meeting.m_o_m}</p>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Attendance Summary</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium text-green-600 dark:text-emerald-300">{getPresentCount()}</span> present out of{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{members.length}</span> members
              {hasUnsavedChanges && (
                <span className="ml-4 text-amber-600 dark:text-amber-300 font-medium">● Unsaved changes</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Members List with Search */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Mark Attendance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Check the boxes to mark members as present
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by roll no or name..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">No members found for this vertical.</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">No members match your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {filteredMembers.map((member) => (
                <div key={member.roll_no} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`attendance-${member.roll_no}`}
                      checked={attendance[member.roll_no] || false}
                      onChange={(e) => handleAttendanceChange(member.roll_no, e.target.checked)}
                      className="h-5 w-5 sm:h-4 sm:w-4 text-primary-600 border-gray-300 dark:border-slate-700 rounded focus:ring-primary-500 focus:ring-offset-0"
                    />
                    <div className="ml-4">
                      <label 
                        htmlFor={`attendance-${member.roll_no}`} 
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer select-none"
                      >
                        {member.name}
                      </label>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {member.roll_no} • {member.department} • Year {member.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      attendance[member.roll_no]
                        ? 'bg-green-100 text-green-800 dark:bg-emerald-600/30 dark:text-emerald-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-slate-700/60 dark:text-gray-200'
                    }`}>
                      {attendance[member.roll_no] ? 'Present' : 'Absent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        {members.length > 0 && (
          <div className="mt-8 flex justify-center sm:justify-end">
            <button
              onClick={handleSaveChanges}
              disabled={saving || !hasUnsavedChanges}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Changes...
                </>
              ) : hasUnsavedChanges ? (
                'Save Changes'
              ) : (
                'No Changes to Save'
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeetingAttendancePage;