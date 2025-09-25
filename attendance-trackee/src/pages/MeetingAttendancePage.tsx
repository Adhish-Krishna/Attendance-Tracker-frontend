import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verticalLeadAPI } from '../api';
import type { Meeting, Member, AttendanceData } from '../types';

const MeetingAttendancePage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
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

      // Fetch meeting details and members attendance (combined in one API call based on backend)
      const response = await verticalLeadAPI.getMembersAttendance(meetingId);

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

      const response = await verticalLeadAPI.updateAttendance(meetingId, attendance);
      
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
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Do you want to save before leaving?'
      );
      if (confirmLeave) {
        handleSaveChanges().then(() => navigate('/dashboard'));
      } else if (window.confirm('Are you sure you want to leave without saving?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Meeting Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meeting Attendance</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name || user?.roll_no}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 min-h-[40px]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meeting Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{meeting.meeting_name}</h2>
          <p className="text-sm text-gray-600 mb-4">{formatDate(meeting.date)}</p>
          {meeting.m_o_m && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description:</h3>
              <p className="text-sm text-gray-700">{meeting.m_o_m}</p>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Attendance Summary</h3>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-green-600">{getPresentCount()}</span> present out of{' '}
              <span className="font-medium">{members.length}</span> members
              {hasUnsavedChanges && (
                <span className="ml-4 text-amber-600 font-medium">● Unsaved changes</span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Check the boxes to mark members as present
            </p>
          </div>
          
          {members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No members found for this vertical.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.roll_no} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`attendance-${member.roll_no}`}
                      checked={attendance[member.roll_no] || false}
                      onChange={(e) => handleAttendanceChange(member.roll_no, e.target.checked)}
                      className="h-5 w-5 sm:h-4 sm:w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="ml-4">
                      <label 
                        htmlFor={`attendance-${member.roll_no}`} 
                        className="text-sm font-medium text-gray-900 cursor-pointer select-none"
                      >
                        {member.name}
                      </label>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {member.roll_no} • {member.department} • Year {member.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      attendance[member.roll_no]
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
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
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 min-h-[48px]"
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