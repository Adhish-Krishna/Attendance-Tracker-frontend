import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { globalAdminOperationsAPI, globalAdminAPI } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import type { Meeting } from '../types';

interface VerticalLead {
  roll_no: string;
  name: string;
  department: string;
  year: number;
  vertical: string;
}

const GlobalAdminVerticalAttendance: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState<string[]>([]);
  const [selectedVertical, setSelectedVertical] = useState<string>('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchVerticalsAndMeetings();
  }, []);

  useEffect(() => {
    if (selectedVertical) {
      const filtered = meetings.filter(meeting => meeting.vertical === selectedVertical);
      setFilteredMeetings(filtered);
    } else {
      setFilteredMeetings([]);
    }
  }, [selectedVertical, meetings]);

  const fetchVerticalsAndMeetings = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all vertical leads to get unique verticals
      const leadsResponse = await globalAdminAPI.getVerticalLeads();
      let leadsData: VerticalLead[] = [];
      
      if (Array.isArray(leadsResponse)) {
        leadsData = leadsResponse;
      } else if (leadsResponse?.vertical_leads && Array.isArray(leadsResponse.vertical_leads)) {
        leadsData = leadsResponse.vertical_leads;
      } else if (leadsResponse?.verticalLeads && Array.isArray(leadsResponse.verticalLeads)) {
        leadsData = leadsResponse.verticalLeads;
      } else if (leadsResponse?.data && Array.isArray(leadsResponse.data)) {
        leadsData = leadsResponse.data;
      } else if (leadsResponse?.leads && Array.isArray(leadsResponse.leads)) {
        leadsData = leadsResponse.leads;
      }

      // Extract unique verticals
      const uniqueVerticals = Array.from(new Set(leadsData.map(lead => lead.vertical).filter(Boolean)));
      setVerticals(uniqueVerticals);

      // Fetch all meetings
      const meetingsResponse = await globalAdminOperationsAPI.getMeetings();
      if (meetingsResponse.meetings && Array.isArray(meetingsResponse.meetings)) {
        const sortedMeetings = meetingsResponse.meetings
          .filter((m: Meeting) => m.vertical) // Only show meetings with a vertical
          .sort((a: Meeting, b: Meeting) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        setMeetings(sortedMeetings);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(`Failed to load data: ${err?.response?.data?.error || err?.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewAttendance = (meetingId: string) => {
    // Navigate to read-only attendance view
    navigate(`/meeting/${meetingId}/attendance`);
  };

  const handleShowAttendanceSummary = async () => {
    if (!selectedVertical) {
      setError('Please select a vertical first');
      return;
    }

    try {
      setLoadingSummary(true);
      setError('');
      const response = await globalAdminAPI.getAllVerticalsAttendanceSummary();
      
      if (response.attendance_summary && Array.isArray(response.attendance_summary)) {
        // Filter summary for selected vertical
        const verticalSummary = response.attendance_summary.filter(
          (item: any) => item.vertical === selectedVertical
        );
        setAttendanceSummary(verticalSummary);
        setShowAttendanceSummary(true);
      } else {
        setError('No attendance summary found');
      }
    } catch (err: any) {
      console.error('Error fetching attendance summary:', err);
      setError(`Failed to load attendance summary: ${err?.response?.data?.error || err?.message || 'Network error'}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      <header className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vertical Attendance</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View attendance records across all verticals
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 sm:w-auto"
              >
                Back to Dashboard
              </button>
              <ThemeToggle className="mx-auto sm:mx-0" />
              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 sm:w-auto"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 mb-8 transition-colors">
          <div className="mb-6">
            <label htmlFor="vertical-select" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Select Vertical
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                id="vertical-select"
                value={selectedVertical}
                onChange={(e) => setSelectedVertical(e.target.value)}
                className="flex-1 sm:w-64 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">-- Select a Vertical --</option>
                {verticals.map((vertical) => (
                  <option key={vertical} value={vertical}>
                    {vertical}
                  </option>
                ))}
              </select>
              <button
                onClick={handleShowAttendanceSummary}
                disabled={!selectedVertical || loadingSummary}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {loadingSummary ? 'Loading...' : 'View Attendance Summary'}
              </button>
            </div>
          </div>

          {!selectedVertical ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No vertical selected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please select a vertical from the dropdown above to view meetings
              </p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h4z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No meetings found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are no meetings for the "{selectedVertical}" vertical
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Meetings for {selectedVertical}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMeetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 hover:border-primary-100 dark:hover:border-primary-400/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                          {meeting.meeting_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(meeting.date)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {meeting.m_o_m || 'No minutes recorded'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewAttendance(meeting._id)}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                    >
                      View Attendance
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Attendance Summary Modal */}
      {showAttendanceSummary && (
        <div className="fixed inset-0 bg-gray-600/60 dark:bg-slate-950/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-slate-800 w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-slate-900 transition-colors">
            <button
              onClick={() => setShowAttendanceSummary(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 text-center mb-4">
                Attendance Summary - {selectedVertical}
              </h3>
              {attendanceSummary.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No attendance data found for this vertical</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-900 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roll No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900/40 divide-y divide-gray-200 dark:divide-slate-800">
                      {attendanceSummary.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.roll_no || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.department || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {item.year ? `${item.year}${item.year === 1 ? 'st' : item.year === 2 ? 'nd' : item.year === 3 ? 'rd' : 'th'} Year` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                (item.percentage || 0) >= 75 
                                  ? 'bg-green-100 dark:bg-green-600/30 text-green-800 dark:text-green-200'
                                  : (item.percentage || 0) >= 50
                                  ? 'bg-yellow-100 dark:bg-yellow-600/30 text-yellow-800 dark:text-yellow-200'
                                  : 'bg-red-100 dark:bg-red-600/30 text-red-800 dark:text-red-200'
                              }`}>
                                {item.percentage != null ? `${item.percentage}%` : 'N/A'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAttendanceSummary(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalAdminVerticalAttendance;
