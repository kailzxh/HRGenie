'use client'

import { Clock, Check, X, AlertCircle } from 'lucide-react'

interface RegularizationRequest {
  id: string
  date: string
  checkIn: string
  checkOut: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
}

export default function RegularizationHistory() {
  // Sample data - in real app, this would come from an API
  const requests: RegularizationRequest[] = [
    {
      id: '1',
      date: '2025-10-02',
      checkIn: '09:45',
      checkOut: '17:30',
      reason: 'Traffic delay due to heavy rain',
      status: 'pending'
    },
    {
      id: '2',
      date: '2025-10-01',
      checkIn: '09:30',
      checkOut: '17:30',
      reason: 'System issues during check-in',
      status: 'approved',
      comments: 'Verified with IT team'
    },
    {
      id: '3',
      date: '2025-09-30',
      checkIn: '09:00',
      checkOut: '16:30',
      reason: 'Early leave for medical appointment',
      status: 'rejected',
      comments: 'No prior notification received'
    }
  ]

  const getStatusColor = (status: RegularizationRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
      case 'approved':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      case 'rejected':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20'
    }
  }

  const getStatusIcon = (status: RegularizationRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <Check className="w-4 h-4" />
      case 'rejected':
        return <X className="w-4 h-4" />
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Regularization History
      </h2>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No regularization requests found</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.checkIn} - {request.checkOut}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded flex items-center space-x-1 text-sm ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="capitalize">{request.status}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {request.reason}
              </p>
              
              {request.comments && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Comment: {request.comments}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}