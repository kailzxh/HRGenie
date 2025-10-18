'use client'

import { useState, FC } from 'react' // Import FC
import { X } from 'lucide-react'
import { format } from 'date-fns' // Import format

// Define the structure of data submitted by the form
interface RegularizationFormData {
  date: Date; // The original Date object passed in
  checkInTime: string; // HH:mm format
  checkOutTime: string; // HH:mm format
  reason: string;
}

interface RegularizationFormProps {
  date: Date;
  onClose: () => void;
  // Update onSubmit prop type
  onSubmit: (data: RegularizationFormData) => void;
}


export const RegularizationForm: FC<RegularizationFormProps> = ({ date, onClose, onSubmit }) => {
  // Use field names matching the onSubmit type
  const [formData, setFormData] = useState({
    date: date, // Keep original date object
    checkInTime: '', // HH:mm string
    checkOutTime: '', // HH:mm string
    reason: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Ensure times are provided if needed by your logic (basic validation)
    if (!formData.checkInTime && !formData.checkOutTime) {
        alert("Please provide at least one corrected time (Check-in or Check-out).");
        return;
    }
    if (!formData.reason) {
        alert("Please provide a reason.");
        return;
    }
    onSubmit(formData) // Submit the structured data
  }

  return (
    // The modal structure wraps this component in AttendancePage.tsx
    // This component is just the form content
    <div className="card p-6 rounded-xl shadow-lg relative bg-white dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close regularization form"
        >
          <X className="w-5 h-5" />
        </button>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
        Attendance Regularization
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="text"
            value={format(date, 'MMMM d, yyyy')} // Display formatted date
            disabled
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Corrected Check-in
            </label>
            <input
              type="time"
              id="checkInTime"
              value={formData.checkInTime}
              // Update state correctly
              onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500"
              // required // Make optional - user might only correct one time
            />
          </div>

          <div>
            <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Corrected Check-out
            </label>
            <input
              type="time"
              id="checkOutTime"
              value={formData.checkOutTime}
               // Update state correctly
              onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500"
              // required // Make optional
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={formData.reason}
             // Update state correctly
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100"
            rows={3}
            required
            placeholder="e.g., Forgot to clock out, client meeting delay..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  )
}