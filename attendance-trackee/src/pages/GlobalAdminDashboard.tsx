import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { globalAdminAPI } from '../api';

interface VerticalLead {
  roll_no: string;
  name: string;
  department: string;
  year: number;
  vertical: string;
}

interface CreateLeadForm {
  name: string;
  roll_no: string;
  year: number;
  department: string;
  vertical: string;
  password: string;
}



const GlobalAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [verticalLeads, setVerticalLeads] = useState<VerticalLead[]>([]);
  const [analytics, setAnalytics] = useState({ totalVerticals: 0, totalMembers: 0, avgAttendance: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLead, setEditingLead] = useState<VerticalLead | null>(null);
  const [createForm, setCreateForm] = useState<CreateLeadForm>({
    name: '',
    roll_no: '',
    year: 1,
    department: '',
    vertical: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed unused attendanceSummary state
  // Grouped and averaged attendance by vertical
  const [verticalAverages, setVerticalAverages] = useState<{ vertical: string, percentage: number }[]>([]);

  useEffect(() => {
    fetchLeadsAndAnalytics();
    fetchAttendanceAnalytics();
  }, []);

  // Fetch analytics from attendance summary
  const fetchAttendanceAnalytics = async () => {
    try {
      const data = await globalAdminAPI.getAllVerticalsAttendanceSummary();
      const summary = data.attendance_summary || [];
  // Removed setAttendanceSummary as it's not used

      // Group by vertical and calculate average percentage for each
      const verticalMap: Record<string, { total: number, count: number }> = {};
      summary.forEach((item: any) => {
        const v = item.vertical || 'N/A';
        if (!verticalMap[v]) verticalMap[v] = { total: 0, count: 0 };
        if (typeof item.percentage === 'number') {
          verticalMap[v].total += item.percentage;
          verticalMap[v].count += 1;
        }
      });
      const averages = Object.entries(verticalMap).map(([vertical, { total, count }]) => ({
        vertical,
        percentage: count > 0 ? Math.round(total / count) : 0
      }));
      setVerticalAverages(averages);

      // Calculate total members (unique roll_no), total verticals, avg attendance
      const uniqueMembers = new Set(summary.map((m: any) => m.roll_no));
      const uniqueVerticals = new Set(summary.map((m: any) => m.vertical));
      const avgAttendance = summary.length > 0
        ? (summary.reduce((acc: number, m: any) => acc + (typeof m.percentage === 'number' ? m.percentage : 0), 0) / summary.length)
        : 0;
      setAnalytics({
        totalVerticals: uniqueVerticals.size,
        totalMembers: uniqueMembers.size,
        avgAttendance: avgAttendance ? Number(avgAttendance.toFixed(1)) : 0,
      });
    } catch (err) {
      // fallback: do not update analytics
    }
  };

  const fetchLeadsAndAnalytics = async () => {
    setLoading(true);
    setError(''); // Clear any existing errors
    try {
      
      const response = await globalAdminAPI.getVerticalLeads();
      
      
      // Handle different response formats - check all possible structures
      let leadsData = [];
      if (Array.isArray(response)) {
        leadsData = response;
      } else if (response?.vertical_leads && Array.isArray(response.vertical_leads)) {
        // Backend returns data in 'vertical_leads' field
        leadsData = response.vertical_leads;
      } else if (response?.verticalLeads && Array.isArray(response.verticalLeads)) {
        leadsData = response.verticalLeads;
      } else if (response?.data && Array.isArray(response.data)) {
        leadsData = response.data;
      } else if (response?.leads && Array.isArray(response.leads)) {
        leadsData = response.leads;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        leadsData = [];
      }
      
   
      
      setVerticalLeads(leadsData);

      // Calculate analytics
      const totalVerticals = leadsData.length;
      setAnalytics({
        totalVerticals,
        totalMembers: leadsData.reduce((acc: number, lead: any) => acc + (lead.memberCount || 0), 0),
        avgAttendance: 85.2,
      });
      
      
    } catch (err: any) {
      console.error('❌ Error fetching leads and analytics:', err);
      console.error('❌ Error details:', {
        message: err?.message,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data
      });
      setVerticalLeads([]);
      setAnalytics({ totalVerticals: 0, totalMembers: 0, avgAttendance: 0 });
      setError(`Failed to load dashboard data: ${err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Network error - check if backend is running'}`);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    // Validation
    if (!createForm.name.trim() || !createForm.roll_no.trim() || !createForm.department.trim() || 
        !createForm.vertical.trim() || (!editingLead && !createForm.password.trim())) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (editingLead) {
        // Update existing lead
        await globalAdminAPI.updateVerticalLead(editingLead.roll_no, {
          name: createForm.name,
          year: createForm.year,
          department: createForm.department,
          vertical: createForm.vertical
        });
        setSuccess('Vertical lead updated successfully!');
      } else {
        // Create new lead
        await globalAdminAPI.createVerticalLead(createForm);
        setSuccess('Vertical lead created successfully!');
      }
      
      setShowCreateForm(false);
      resetForm();
     
      await fetchLeadsAndAnalytics(); // Refresh the list
    } catch (err: any) {
      console.error('❌ Error creating/updating lead:', err);
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.error || err?.message || 'Failed to save vertical lead';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (rollNo: string) => {
    if (window.confirm('Are you sure you want to delete this vertical lead?')) {
      try {
        
        await globalAdminAPI.deleteVerticalLead(rollNo);
        setSuccess('Vertical lead deleted successfully!');
      
        await fetchLeadsAndAnalytics(); // Refresh the list
      } catch (err: any) {
        console.error('❌ Error deleting lead:', err);
        setError(err?.response?.data?.error || err?.response?.data?.message || err?.error || err?.message || 'Failed to delete vertical lead');
      }
    }
  };

  const handleEditLead = (lead: VerticalLead) => {
    setEditingLead(lead);
    setCreateForm({
      name: lead.name,
      roll_no: lead.roll_no,
      year: lead.year,
      department: lead.department,
      vertical: lead.vertical,
      password: '' // Don't pre-fill password
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingLead(null);
    setCreateForm({
      name: '',
      roll_no: '',
      year: 1,
      department: '',
      vertical: '',
      password: ''
    });
    setError('');
    setSuccess('');
  };



  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || user?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
            <button 
              onClick={() => setSuccess('')}
              className="float-right text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* View All Attendance Card (now navigates to a page) */}
          <button
            onClick={() => navigate('/global-admin/all-attendance')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="ml-3 font-medium text-gray-900">View All Attendance</h3>
            </div>
            <p className="text-sm text-gray-600">View attendance statistics for all verticals</p>
          </button>

       
        </div>


        {/* System Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Verticals</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalVerticals}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Members</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalMembers}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Avg Attendance (%)</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.avgAttendance}</div>
          </div>
        </div>

        {/* Average Attendance by Vertical Progress Circles */}
        {verticalAverages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Average Attendance by Vertical</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {verticalAverages.map((vertical, idx) => (
                <div key={vertical.vertical || idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center">
                  <div className="mb-2 text-lg font-semibold text-gray-700">{vertical.vertical || 'N/A'}</div>
                  <svg width="140" height="140" viewBox="0 0 70 70" className="mb-2">
                    <circle cx="35" cy="35" r="32" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    <circle
                      cx="35"
                      cy="35"
                      r="32"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={2 * Math.PI * 32 * (1 - (vertical.percentage || 0) / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s' }}
                    />
                    <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="0.9em" fill="#111" fontWeight="bold">
                      {vertical.percentage != null ? `${vertical.percentage}%` : 'N/A'}
                    </text>
                  </svg>
                  <div className="text-sm text-gray-500">Attendance</div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Vertical Leads Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">Vertical Heads</h2>
              {/* Debug button - remove in production */}

            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vertical Head
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : verticalLeads.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vertical heads</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new vertical head.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Vertical Head
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Removed checkbox column header */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertical</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verticalLeads.map((lead: any, index) => (
                    <tr key={lead.roll_no || index} className="hover:bg-gray-50">
                      {/* Removed checkbox cell */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.roll_no || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.year ? `${lead.year}${lead.year === 1 ? 'st' : lead.year === 2 ? 'nd' : lead.year === 3 ? 'rd' : 'th'} Year` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {lead.vertical || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.roll_no)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Vertical Head Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <button
                onClick={() => { setShowCreateForm(false); setEditingLead(null); }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                  {editingLead ? 'Edit Vertical Head' : 'Create New Vertical Head'}
                </h3>
                <form onSubmit={handleCreateLead} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={createForm.roll_no}
                      onChange={(e) => setCreateForm({...createForm, roll_no: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 23n206"
                      disabled={!!editingLead} // Don't allow editing roll number
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={createForm.department}
                      onChange={(e) => setCreateForm({...createForm, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., CSE AI ML"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={createForm.year}
                      onChange={(e) => setCreateForm({...createForm, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                    <input
                      type="text"
                      required
                      value={createForm.vertical}
                      onChange={(e) => setCreateForm({...createForm, vertical: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Tech, Marketing, Design"
                    />
                  </div>
                  {!editingLead && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={createForm.password}
                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter secure password"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : (editingLead ? 'Update' : 'Create')}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GlobalAdminDashboard;