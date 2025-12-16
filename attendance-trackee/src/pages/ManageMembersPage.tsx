import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { globalAdminAPI } from '../api';
import ConfirmationModal from '../components/ConfirmationModal';
import ThemeToggle from '../components/ThemeToggle';

const ManageMembersPage: React.FC = () => {
  const { logout } = useAuth();
  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteMember = () => {
    if (!rollNumber.trim()) {
      setError('Please enter a roll number');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!rollNumber.trim()) return;

    try {
      setDeletingMember(true);
      setError('');
      setSuccess('');
      await globalAdminAPI.deleteMember(rollNumber.trim());
      setSuccess(`Member with roll number "${rollNumber}" has been deleted successfully.`);
      setRollNumber(''); // Clear the input
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Error deleting member:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to delete member. Please try again.');
      setShowDeleteModal(false);
    } finally {
      setDeletingMember(false);
    }
  };

  const handleCancelDelete = () => {
    if (deletingMember) return; // Prevent closing if delete is in progress
    setShowDeleteModal(false);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Delete Member</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Delete a member by entering their roll number
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
            {/* Header */}
          {/* Delete Member Form */}
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-slate-800">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Delete Member
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the roll number of the member you want to delete. This action cannot be undone.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 rounded-md text-sm">
                {error}
                <button 
                  onClick={clearMessages}
                  className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/40 text-green-700 dark:text-green-200 rounded-md text-sm">
                {success}
                <button 
                  onClick={clearMessages}
                  className="ml-2 text-green-500 hover:text-green-700 dark:hover:text-green-300"
                >
                  ×
                </button>
              </div>
            )}

            {/* Input Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value);
                  clearMessages();
                }}
                placeholder="e.g., 23N228"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:text-gray-100"
              />
            </div>

            {/* Delete Button */}
            <button
              onClick={handleDeleteMember}
              disabled={!rollNumber.trim() || deletingMember}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Member
            </button>
          </div>

          {/* Warning Note */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-500/40 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Warning
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  This action will permanently delete the member and cannot be undone. Make sure you have the correct roll number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={confirmDeleteMember}
        title="Delete Member"
        message={`Are you sure you want to delete the member with roll number "${rollNumber}"?\n\nThis action cannot be undone and will permanently remove this member from the system.`}
        confirmText="Delete Member"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        isLoading={deletingMember}
      />
    </div>
  );
};

export default ManageMembersPage;