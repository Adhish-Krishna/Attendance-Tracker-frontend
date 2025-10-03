import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LoginFormData } from '../types';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    role: 'vertical_head',
  });
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    if (user.role === 'global_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    try {
      const success = await login(formData);
      if (success === false) {
  // Removed debug log
        setError('Invalid credentials. Please try again.');
      }

    } catch (err) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-start justify-center bg-gray-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:flex sm:items-center sm:pt-12 transition-colors duration-500">
      <ThemeToggle className="absolute left-1/2 top-6 -translate-x-1/2 sm:left-auto sm:right-8 sm:top-8 sm:translate-x-0" />
      <div
        className="max-w-md w-full space-y-8 border-3 border-blue-500/80 dark:border-blue-400/60 bg-white dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-xl shadow-blue-400/10 dark:shadow-blue-900/30 p-8 transition-colors sm:mt-0 mt-4"
        style={{ borderWidth: '3px' }}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to Attendance Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Access your dashboard to manage meetings and attendance
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                required
              >
                <option value="vertical_head">Vertical Head</option>
                <option value="global_admin">Global Admin</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {formData.role === 'global_admin' ? 'Username' : 'Roll Number'}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={handleInputChange}
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={formData.role === 'global_admin' ? 'Enter your username' : 'Enter your roll number'}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md placeholder-gray-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-300 text-sm text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;