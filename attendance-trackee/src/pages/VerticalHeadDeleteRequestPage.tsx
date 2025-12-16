import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verticalLeadAPI } from '../api';

interface FormData {
  rollNumber: string;
  reason: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const VerticalHeadDeleteRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    rollNumber: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rollNumber.trim()) {
      setMessage({ type: 'error', text: 'Please enter a roll number' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response: ApiResponse = await verticalLeadAPI.requestMemberDeletion(
        formData.rollNumber.trim(),
        formData.reason.trim() || undefined
      );

      setMessage({ 
        type: 'success', 
        text: response.message || 'Delete request submitted successfully! The global admin will review your request.' 
      });
      
      // Reset form after successful submission
      setFormData({ rollNumber: '', reason: '' });
      
    } catch (error: any) {
      console.error('Error submitting delete request:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit delete request. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800 shadow-xl shadow-blue-500/10 dark:shadow-slate-900/40 transition-colors">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Request Member Deletion
            </h3>
            <button
              onClick={() => navigate('/vertical-head/dashboard')}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter member's roll number"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Reason (Optional)
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Provide a reason for the deletion request (optional)"
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-md border ${
                message.type === 'success' 
                  ? 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/40'
                  : 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/40'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/vertical-head/dashboard')}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.rollNumber.trim()}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerticalHeadDeleteRequestPage;