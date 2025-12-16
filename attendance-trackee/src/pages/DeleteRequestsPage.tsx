import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { globalAdminAPI } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmationModal from '../components/ConfirmationModal';

interface DeleteRequest {
  _id: string;
  member_roll_no: string;
  member_name: string;
  vertical: string;
  requested_by: string;
  attendance_percentage: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: Date;
  createdAt: Date;
}

const DeleteRequestsPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DeleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<DeleteRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDeleteRequests();
  }, [statusFilter]);

  const fetchDeleteRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await globalAdminAPI.getAllDeleteRequests(status);
      setRequests(response.requests || []);
    } catch (err: any) {
      setError(err?.error || 'Failed to fetch delete requests');
      setRequests([]);
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

  const handleReviewClick = (request: DeleteRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      await globalAdminAPI.reviewDeleteRequest(selectedRequest._id, reviewAction);
      setShowReviewModal(false);
      setSelectedRequest(null);
      await fetchDeleteRequests(); // Refresh list
    } catch (err: any) {
      setError(err?.error || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelReview = () => {
    if (processing) return;
    setShowReviewModal(false);
    setSelectedRequest(null);
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getAttendanceChip = (percentage: number) => {
    if (percentage >= 75) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100/80 dark:bg-emerald-600/30 text-green-800 dark:text-emerald-200">
          {percentage.toFixed(1)}%
        </span>
      );
    } else if (percentage >= 60) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100/80 dark:bg-amber-500/30 text-yellow-800 dark:text-amber-200">
          {percentage.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100/80 dark:bg-rose-600/30 text-red-800 dark:text-rose-200">
          {percentage.toFixed(1)}%
        </span>
      );
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Requests
                  {pendingCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                      {pendingCount} pending
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Review member deletion requests from vertical heads
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`${
                  statusFilter === status
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {status}
                {status === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 py-0.5 px-2 rounded-full text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No requests</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No {statusFilter !== 'all' ? statusFilter : ''} delete requests found.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {request.member_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Roll No: {request.member_roll_no} • Vertical: {request.vertical}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                        <div className="mt-1">{getAttendanceChip(request.attendance_percentage)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Requested By</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                          {request.requested_by}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Requested On</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                      {request.reason && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                            {request.reason}
                          </p>
                        </div>
                      )}
                      {request.reviewed_by && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reviewed By</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              {request.reviewed_by}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reviewed On</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                              {request.reviewed_at ? formatDate(request.reviewed_at) : 'N/A'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2 lg:flex-shrink-0">
                      <button
                        onClick={() => handleReviewClick(request, 'approve')}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve & Delete
                      </button>
                      <button
                        onClick={() => handleReviewClick(request, 'reject')}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Confirmation Modal */}
      {showReviewModal && selectedRequest && (
        <ConfirmationModal
          isOpen={showReviewModal}
          title={reviewAction === 'approve' ? 'Approve Delete Request' : 'Reject Delete Request'}
          message={
            reviewAction === 'approve'
              ? `Are you sure you want to approve this request and delete ${selectedRequest.member_name} (${selectedRequest.member_roll_no})? This action cannot be undone.`
              : `Are you sure you want to reject the delete request for ${selectedRequest.member_name} (${selectedRequest.member_roll_no})?`
          }
          onConfirm={handleConfirmReview}
          onClose={handleCancelReview}
          confirmText={reviewAction === 'approve' ? 'Approve & Delete' : 'Reject Request'}
          cancelText="Cancel"
          confirmButtonClass={
            reviewAction === 'approve'
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
          }
          isLoading={processing}
        />
      )}
    </div>
  );
};

export default DeleteRequestsPage;
