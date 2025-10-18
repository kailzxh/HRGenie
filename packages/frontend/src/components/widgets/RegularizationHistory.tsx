'use client'

import { Clock, Check, X, AlertCircle, XCircle } from 'lucide-react'
import type { FC } from 'react'
import type { RegularizationRequest } from '@/types'
import { format, parseISO } from 'date-fns'

interface RegularizationHistoryProps { 
  requests: RegularizationRequest[] | null
}

export const RegularizationHistory: FC<RegularizationHistoryProps> = ({ requests }) => {
  const validRequests = requests ?? []

  const getStatusColor = (status: RegularizationRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700'
      case 'approved':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
      case 'cancelled':
        return 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600'
      default:
        return 'text-gray-500 bg-gray-100 dark:border-gray-600'
    }
  }

  const getStatusIcon = (status: RegularizationRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />
      case 'approved': return <Check className="w-3.5 h-3.5" />
      case 'rejected': return <X className="w-3.5 h-3.5" />
      case 'cancelled': return <XCircle className="w-3.5 h-3.5" />
      default: return null
    }
  }

  return (
    <div className="card p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Regularization History
      </h2>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {validRequests.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No regularization requests found.
            </p>
          </div>
        ) : (
          validRequests.map((request) => {
            // Ensure proper Date object for formatting
            const requestDate =
              typeof request.date === 'string' ? parseISO(request.date) : request.date || new Date()

            return (
              <div
                key={request.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-white">
                      {format(requestDate, 'MMM d, yyyy')}
                    </p>

                    {(request.checkIn || request.checkOut || request.requested_clock_in || request.requested_clock_out) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Times: {request.checkIn ?? request.requested_clock_in ?? '?'} - {request.checkOut ?? request.requested_clock_out ?? '?'}
                      </p>
                    )}
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded-full flex items-center space-x-1 text-xs whitespace-nowrap ${getStatusColor(
                      request.status
                    )} flex-shrink-0`}
                  >
                    {getStatusIcon(request.status)}
                    <span className="capitalize font-medium">{request.status}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 break-words">
                  {request.reason}
                </p>

                {request.comments && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 border-t border-gray-100 dark:border-gray-600 pt-1">
                    Mgr Comment: {request.comments}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RegularizationHistory
