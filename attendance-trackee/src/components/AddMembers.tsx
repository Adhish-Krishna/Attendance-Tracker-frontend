import React, { useState } from 'react';
import { verticalLeadAPI } from '../api';
import type { Member } from '../types';

interface AddMembersProps {
  onSuccess: () => void;
  onDownloadTemplate?: () => void;
}

const AddMembers: React.FC<AddMembersProps> = ({ onSuccess, onDownloadTemplate }) => {
  const [form, setForm] = useState<Member>({
    name: '',
    roll_no: '',
    year: 1,
    department: '',
    role: 'Member', // Default role
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await verticalLeadAPI.addMember(form);
      setSuccess('Member added successfully!');
      setForm({ name: '', roll_no: '', year: 1, department: '', role: 'Member' });
      onSuccess();
    } catch (err: any) {
      setError(err.error || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadXlsx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel file.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await verticalLeadAPI.uploadMembersXlsx(formData);
      setSuccess('Members added successfully!');
      setFile(null);
      onSuccess();
    } catch (err: any) {
      setError(err.error || 'Failed to upload members.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="bg-white/90 dark:bg-slate-900/80 rounded-lg shadow-md shadow-blue-500/5 dark:shadow-blue-900/30 border border-gray-200 dark:border-slate-800 p-8 mb-8 transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Add Members</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr] gap-8">
        {/* Individual Add Member Form */}
  <form onSubmit={handleAddMember} className="space-y-5 bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">Add Single Member</h3>
          <div className="grid grid-cols-1 gap-4">
            <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Name" className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500" required disabled={loading} />
            <input type="text" name="roll_no" value={form.roll_no} onChange={handleInputChange} placeholder="Roll No" className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500" required disabled={loading} />
            <input type="number" name="year" value={form.year} onChange={handleInputChange} placeholder="Year" className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500" min={1} max={5} required disabled={loading} />
            <input type="text" name="department" value={form.department} onChange={handleInputChange} placeholder="Department" className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500" required disabled={loading} />
            <select name="role" value={form.role || 'Member'} onChange={handleInputChange} className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500" required disabled={loading}>
              <option value="Member">Member</option>
              <option value="Team Coordinator">Team Coordinator</option>
              <option value="Vertical Lead">Vertical Lead</option>
            </select>
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 transition-colors duration-200 font-medium" disabled={loading}>Add Member</button>
        </form>
        {/* Bulk Upload Form */}
  <form onSubmit={handleUploadXlsx} className="space-y-5 bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start sm:gap-6">
            <div className="sm:max-w-lg">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 leading-tight">Bulk Upload via Excel</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed sm:pr-4">
                Download the template, fill in member details, and upload the completed file to add everyone in one go.
              </p>
            </div>
            {onDownloadTemplate && (
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 transition-colors duration-200 min-h-[40px] sm:self-start"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                Template
              </button>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Excel file (.xlsx)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors duration-200 ${file ? 'border-primary-600 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              onClick={() => !loading && document.getElementById('file-upload')?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                if (!loading && e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                }
              }}
              style={{ minHeight: 100 }}
            >
              <input
                id="file-upload"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <svg className="w-8 h-8 text-primary-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-5 4l-4-4m0 0l4-4m-4 4h12" />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {file ? file.name : 'Click or drag and drop to select an Excel file'}
              </span>
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 transition-colors duration-200 font-medium" disabled={loading}>Upload Excel</button>
        </form>
      </div>
      {(error || success) && (
        <div className="mt-6">
          {error && <div className="text-red-600 dark:text-red-300 text-center font-medium bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 rounded-md p-3 mb-2">{error}</div>}
          {success && <div className="text-green-600 dark:text-emerald-300 text-center font-medium bg-green-50 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-500/40 rounded-md p-3">{success}</div>}
        </div>
      )}
    </div>
  );
};

export default AddMembers;
