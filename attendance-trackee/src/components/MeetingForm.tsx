import React, { useState } from 'react';
import { verticalLeadAPI } from '../api';
import type { CreateMeetingData } from '../types';

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateMeetingData>({
    meeting_name: '',
    date: '',
    m_o_m: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.meeting_name.trim()) {
      return 'Meeting name is required';
    }
    if (!formData.date) {
      return 'Date and time are required';
    }
    if (!formData.m_o_m.trim()) {
      return 'Meeting description/agenda is required';
    }

    const selectedDate = new Date(formData.date);
    const now = new Date();
    if (selectedDate < now) {
      return 'Please select a future date and time';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await verticalLeadAPI.createMeeting(formData);

      if (response.message && response.meeting) {
        setFormData({
          meeting_name: '',
          date: '',
          m_o_m: '',
        });
        onSuccess();
        onClose();
      } else {
        setError('Failed to create meeting');
      }
    } catch (err: any) {
      console.error('Error creating meeting:', err);
      setError(err?.error || err?.message || 'Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFormData({
      meeting_name: '',
      date: '',
      m_o_m: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800 shadow-xl shadow-blue-500/10 dark:shadow-slate-900/40 transition-colors">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Create New Meeting</h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="meeting_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Meeting Name *
              </label>
              <input
                type="text"
                id="meeting_name"
                name="meeting_name"
                value={formData.meeting_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter meeting name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Date and Time *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="m_o_m" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Meeting Agenda / Description *
              </label>
              <textarea
                id="m_o_m"
                name="m_o_m"
                value={formData.m_o_m}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Describe the meeting agenda, topics to be covered, or any important notes..."
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-300 text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Creating...
                  </>
                ) : (
                  'Create Meeting'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingForm;