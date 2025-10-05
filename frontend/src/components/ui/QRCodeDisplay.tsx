import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { assetService } from '../../services/assetService';

interface QRCodeDisplayProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ assetId, assetName, onClose }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQRCode();
  }, [assetId]);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assetService.generateQRCode(assetId);
      setQrCode(data.qrCode);
    } catch (err: any) {
      console.error('Error loading QR code:', err);
      setError(err.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${assetName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!qrCode) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${assetName}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              h1 {
                margin-bottom: 20px;
              }
              img {
                max-width: 400px;
              }
            </style>
          </head>
          <body>
            <h1>${assetName}</h1>
            <img src="${qrCode}" alt="QR Code" />
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Asset QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Asset: {assetName}</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {qrCode && !loading && (
          <div className="mb-6">
            <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Close
          </Button>
          {qrCode && (
            <>
              <Button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Download
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700"
              >
                Print
              </Button>
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Scan this QR code to quickly access asset information or register the device.</p>
        </div>
      </div>
    </div>
  );
};
