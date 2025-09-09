import React, { useState, useEffect } from 'react';
import { Button, ErrorDisplay } from './index';
import { assetService } from '../../services/assetService';
import { handleApiError, FormattedError } from '../../utils/errorHandler';

interface StatusHistoryEntry {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  reason: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface StatusHistoryProps {
  assetId: string;
  assetName: string;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
  LOST: 'Lost',
};

export const StatusHistory: React.FC<StatusHistoryProps> = ({
  assetId,
  assetName,
  isOpen,
  onClose,
}) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FormattedError | null>(null);

  useEffect(() => {
    if (isOpen && assetId) {
      loadStatusHistory();
    }
  }, [isOpen, assetId]);

  const loadStatusHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assetService.getAssetStatusHistory(assetId);
      setHistory(data);
    } catch (err) {
      const formattedError = handleApiError(err, 'Load Status History');
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChangeText = (entry: StatusHistoryEntry) => {
    const oldLabel = entry.oldStatus ? STATUS_LABELS[entry.oldStatus] : 'None';
    const newLabel = STATUS_LABELS[entry.newStatus];
    return `${oldLabel} → ${newLabel}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Status History - {assetName}
          </h2>
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400 px-3 py-1"
          >
            ×
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <ErrorDisplay 
              error={error}
              onRetry={loadStatusHistory}
              onDismiss={() => setError(null)}
            />
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading status history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No status changes recorded for this asset.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {getStatusChangeText(entry)}
                        </span>
                        <span className="text-sm text-gray-500">
                          by {entry.changedBy.name}
                        </span>
                      </div>
                      
                      {entry.reason && (
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {entry.reason}
                        </p>
                      )}
                      
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};