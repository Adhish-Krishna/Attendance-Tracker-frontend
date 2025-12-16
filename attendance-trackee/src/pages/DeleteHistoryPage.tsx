import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { globalAdminAPI } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import type { DeletedMember } from '../types';

const DeleteHistoryPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [deletedMembers, setDeletedMembers] = useState<DeletedMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchDeletedMembers();
    }, []);

    const fetchDeletedMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await globalAdminAPI.getDeletedMembers();

            let membersData: DeletedMember[] = [];
            if (Array.isArray(response)) {
                membersData = response;
            } else if (response?.deleted_members && Array.isArray(response.deleted_members)) {
                membersData = response.deleted_members;
            } else if (response?.data && Array.isArray(response.data)) {
                membersData = response.data;
            }

            // Sort by deleted_at (most recent first)
            membersData.sort((a, b) =>
                new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
            );

            setDeletedMembers(membersData);
        } catch (err: any) {
            console.error('Error fetching deleted members:', err);
            setError(err?.message || err?.error || 'Failed to load deleted members history');
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

    const getDeletedByBadge = (member: DeletedMember) => {
        if (member.deleted_by_type === 'GlobalAdmin') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-600/30 text-purple-800 dark:text-purple-200">
                    Admin: {member.deleted_by_identifier}
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-600/30 text-amber-800 dark:text-amber-200">
                    Request: {member.deleted_by_identifier}
                </span>
            );
        }
    };

    const getRoleBadge = (role: string) => {
        const roleColors: Record<string, string> = {
            'Vertical Lead': 'bg-primary-100 dark:bg-primary-600/30 text-primary-800 dark:text-primary-200',
            'Team Coordinator': 'bg-blue-100 dark:bg-blue-600/30 text-blue-800 dark:text-blue-200',
            'Member': 'bg-gray-100 dark:bg-gray-600/30 text-gray-800 dark:text-gray-200',
        };
        return (
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[role] || roleColors['Member']}`}>
                {role}
            </span>
        );
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Delete History</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                View history of deleted members (soft-deleted)
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
                        <button
                            onClick={() => setError('')}
                            className="float-right text-red-400 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Deleted Members</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {deletedMembers.length} member{deletedMembers.length !== 1 ? 's' : ''} in history
                            </p>
                        </div>
                        <button
                            onClick={fetchDeletedMembers}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>

                    {deletedMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No deleted members</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Members that are deleted will appear here for record keeping.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                                <thead className="bg-gray-50 dark:bg-slate-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roll No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vertical</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deleted At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Deleted By</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/80 dark:bg-slate-900/40 divide-y divide-gray-200 dark:divide-slate-800">
                                    {deletedMembers.map((member, index) => (
                                        <tr key={`${member.roll_no}-${index}`} className="hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{member.department}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {member.roll_no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-600/30 text-primary-800 dark:text-primary-200">
                                                    {member.vertical}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(member.role)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {formatDate(member.deleted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getDeletedByBadge(member)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DeleteHistoryPage;
