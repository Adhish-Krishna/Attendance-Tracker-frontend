
import React from 'react';
import AddMembers from '../components/AddMembers';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const AddMembersPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // handle error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Members</h1>
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
      <main className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AddMembers onSuccess={() => {}} />
        </div>
      </main>
    </div>
  );
};

export default AddMembersPage;
