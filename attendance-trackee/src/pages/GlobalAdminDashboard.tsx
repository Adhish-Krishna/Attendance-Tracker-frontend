import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { globalAdminOperationsAPI } from '../api';
import MeetingForm from '../components/MeetingForm';
import ConfirmationModal from '../components/ConfirmationModal';
import ThemeToggle from '../components/ThemeToggle';
import type { Meeting } from '../types';

const GlobalAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await globalAdminOperationsAPI.getMeetings();
      if (response.meetings && Array.isArray(response.meetings)) {
        // Filter to show only meetings created by Global Admin (OB)
        const obMeetings = response.meetings.filter((meeting: any) => meeting.created_by === 'OB');
        // Sort meetings by date (most recent first)
        const sortedMeetings = obMeetings.sort((a: Meeting, b: Meeting) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setMeetings(sortedMeetings);
      } else {
        setError('No meetings found');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Error loading meetings. Please try again.');
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

  const handleViewMeeting = (meetingId: string) => {
    navigate(`/meeting/${meetingId}/attendance`);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setShowCreateForm(true);
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setShowDeleteModal(true);
  };

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;

    try {
      setDeletingMeeting(meetingToDelete._id);
      await globalAdminOperationsAPI.deleteMeeting(meetingToDelete._id);
      await fetchMeetings(); // Refresh the meetings list
      setShowDeleteModal(false);
      setMeetingToDelete(null);
    } catch (err: any) {
      console.error('Error deleting meeting:', err);
      setError(err?.error || err?.message || 'Failed to delete meeting. Please try again.');
    } finally {
      setDeletingMeeting('');
    }
  };

  const handleCancelDelete = () => {
    if (deletingMeeting) return; // Prevent closing if delete is in progress
    setShowDeleteModal(false);
    setMeetingToDelete(null);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingMeeting(null);
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
      <div className="flex">
        {/* Desktop Sidebar Container */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out hidden lg:block flex-shrink-0`}>
          <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-64'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-800">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Navigation Menu */}
            <div className="mt-6 px-3 pb-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px - 140px)' }}>
              <div className="space-y-1">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Meeting
                </button>
                
                <button
                  onClick={() => navigate('/admin/manage-members')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Members
                </button>
                
                <button
                  onClick={() => navigate('/admin/delete-requests')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Delete Requests
                </button>
                
                <button
                  onClick={() => navigate('/admin/add-vertical-head')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Add Vertical Head
                </button>
                
                <button
                  onClick={() => navigate('/admin/vertical-attendance')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Vertical Meetings
                </button>
                
                <button
                  onClick={() => navigate('/global-admin/all-attendance')}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  All Attendance
                </button>
              </div>
            </div>
            
            {/* Bottom section with Theme Toggle and Logout - Absolutely positioned */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
              <div className="flex items-center justify-center mb-4">
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-800">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="mt-6 px-3 pb-6 overflow-y-auto" style={{ height: 'calc(100vh - 64px - 120px)' }}>
            <div className="space-y-1">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Meeting
              </button>
              
              <button
                onClick={() => navigate('/admin/manage-members')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Manage Members
              </button>
              
              <button
                onClick={() => navigate('/admin/delete-requests')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Delete Requests
              </button>
              
              <button
                onClick={() => navigate('/admin/add-vertical-head')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Add Vertical Head
              </button>
              
              <button
                onClick={() => navigate('/admin/vertical-attendance')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Vertical Meetings
              </button>
              
              <button
                onClick={() => navigate('/global-admin/all-attendance')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 group"
              >
                <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                All Attendance
              </button>
            </div>
          </div>
          
          {/* Bottom section with Theme Toggle and Logout */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center justify-center mb-4">
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 group"
            >
              <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {!sidebarOpen && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  <div className="ml-4 lg:ml-0">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Global Admin Dashboard</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Welcome back, {user?.name || user?.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meetings Created by You</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage meetings and track attendance across all verticals
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Meetings List */}
            {meetings.length === 0 ? (
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
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first meeting.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Meeting
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 hover:border-primary-100 dark:hover:border-primary-400/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                          {meeting.meeting_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(meeting.date)}
                        </p>
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                            {meeting.m_o_m || 'No minutes recorded'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewMeeting(meeting._id)}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 mb-2"
                      >
                        Manage Attendance
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMeeting(meeting)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-slate-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                        >
                          <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeeting(meeting)}
                          disabled={deletingMeeting === meeting._id}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Meeting Form Modal */}
      <MeetingForm
        isOpen={showCreateForm}
        onClose={handleCloseForm}
        onSuccess={fetchMeetings}
        meeting={editingMeeting}
        api={globalAdminOperationsAPI}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={confirmDeleteMeeting}
        title="Delete Meeting"
        message={`Are you sure you want to delete the meeting "${meetingToDelete?.meeting_name}"?\n\nThis action cannot be undone and will permanently remove all attendance data associated with this meeting.`}
        confirmText="Delete Meeting"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        isLoading={deletingMeeting === meetingToDelete?._id}
      />
    </div>
  );
};

export default GlobalAdminDashboard;