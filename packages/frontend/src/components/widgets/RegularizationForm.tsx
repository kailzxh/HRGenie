'use client'
export const dynamic = 'force-dynamic';
import { useState, FC } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'

// This interface now matches the data your parent's handler needs
interface RegularizationFormData {
  date: Date;
  checkInTime: string;
  checkOutTime: string;
  reason: string;
  requestedStatus: string; // <-- This field was missing
}

interface RegularizationFormProps {
  date: Date;
  onClose: () => void;
  onSubmit: (data: RegularizationFormData) => void;
}

export const RegularizationForm: FC<RegularizationFormProps> = ({ date, onClose, onSubmit }) => {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [reason, setReason] = useState('');
  const [requestedStatus, setRequestedStatus] = useState(''); // <-- State for the new field

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedStatus || !reason) {
      alert("Please select a request type and provide a reason.");
      return;
    }
    onSubmit({ date, checkInTime, checkOutTime, reason, requestedStatus });
  }

  return (
    <div className="card p-6 rounded-xl shadow-lg relative bg-white dark:bg-gray-800 w-full max-w-md">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        aria-label="Close"
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
            value={format(date, 'MMMM d, yyyy')}
            disabled
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Request Type <span className="text-red-500">*</span>
          </label>
          <select
            id="requestType"
            value={requestedStatus}
            onChange={(e) => setRequestedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            required
          >
            <option value="" disabled>Select a reason...</option>
            <option value="Present">Forgot to Clock In/Out</option>
            <option value="Absent">Mark as Absent (e.g., emergency)</option>
            <option value="Half Day - First Half">Request Half Day (First Half)</option>
            <option value="Half Day - Second Half">Request Half Day (Second Half)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Corrected Check-in
            </label>
            <input
              type="time"
              id="checkInTime"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Corrected Check-out
            </label>
            <input
              type="time"
              id="checkOutTime"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            rows={3}
            required
            placeholder="e.g., Forgot to clock in, biometric issue..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  )
}