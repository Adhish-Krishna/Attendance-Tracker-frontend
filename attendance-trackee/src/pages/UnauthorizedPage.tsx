import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8 bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl shadow-xl backdrop-blur-sm p-8 transition-colors duration-300">
          <svg
            className="mx-auto h-16 w-16 text-red-500 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
            Access Denied
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 transition-colors duration-300">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-5 py-2.5 border border-slate-300/80 dark:border-slate-600/80 rounded-xl shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100/90 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
          >
            Go Back
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 hover:from-primary-600 hover:via-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;