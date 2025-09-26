import React, { useState } from 'react';
import { verticalLeadAPI } from '../api';
import type { Member } from '../types';

interface AddMembersProps {
  onSuccess: () => void;
}

const AddMembers: React.FC<AddMembersProps> = ({ onSuccess }) => {
  const [form, setForm] = useState<Member>({
    name: '',
    roll_no: '',
    year: 1,
    department: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm({ name: '', roll_no: '', year: 1, department: '' });
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Members</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Individual Add Member Form */}
        <form onSubmit={handleAddMember} className="space-y-5 bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-primary-700 mb-2">Add Single Member</h3>
          <div className="grid grid-cols-1 gap-4">
            <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Name" className="px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" required disabled={loading} />
            <input type="text" name="roll_no" value={form.roll_no} onChange={handleInputChange} placeholder="Roll No" className="px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" required disabled={loading} />
            <input type="number" name="year" value={form.year} onChange={handleInputChange} placeholder="Year" className="px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" min={1} max={5} required disabled={loading} />
            <input type="text" name="department" value={form.department} onChange={handleInputChange} placeholder="Department" className="px-3 py-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500" required disabled={loading} />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400 transition-colors duration-200 font-medium" disabled={loading}>Add Member</button>
        </form>
        {/* Bulk Upload Form */}
        <form onSubmit={handleUploadXlsx} className="space-y-5 bg-gray-50 rounded-lg p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-primary-700 mb-2">Bulk Upload via Excel</h3>
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Excel file (.xlsx)</label>
            <div
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors duration-200 ${file ? 'border-primary-600 bg-primary-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
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
              <span className="text-sm text-gray-700">
                {file ? file.name : 'Click or drag and drop to select an Excel file'}
              </span>
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400 transition-colors duration-200 font-medium" disabled={loading}>Upload Excel</button>
        </form>
      </div>
      {(error || success) && (
        <div className="mt-6">
          {error && <div className="text-red-600 text-center font-medium bg-red-50 border border-red-200 rounded-md p-3 mb-2">{error}</div>}
          {success && <div className="text-green-600 text-center font-medium bg-green-50 border border-green-200 rounded-md p-3">{success}</div>}
        </div>
      )}
    </div>
  );
};

export default AddMembers;
