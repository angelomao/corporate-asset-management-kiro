import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

interface ScanMode {
  type: 'camera' | 'upload';
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, onClose }) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera on mobile
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
          setSelectedCamera(backCamera?.id || devices[0].id);
        } else {
          setError('No cameras found');
          onError?.('No cameras found');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('Failed to access camera');
        onError?.('Failed to access camera');
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // Ignore scanning errors (they happen continuously while scanning)
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start scanner');
      onError?.(err.message || 'Failed to start scanner');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader-upload');
      
      const result = await scanner.scanFile(file, true);
      onScan(result);
      onClose();
    } catch (err: any) {
      console.error('Error scanning file:', err);
      setError('Failed to scan QR code from image. Please try another image.');
      onError?.('Failed to scan QR code from image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Selection */}
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setScanMode('upload')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
              scanMode === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📁 Upload Image
          </button>
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
              scanMode === 'camera'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📷 Use Camera
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {scanMode === 'upload' ? (
          /* Upload Mode */
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to upload QR code image
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
            <div id="qr-reader-upload" className="hidden"></div>
          </div>
        ) : (
          /* Camera Mode */
          <>
            {cameras.length > 1 && !isScanning && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden bg-gray-100"
                style={{ minHeight: '300px' }}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleClose}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
              {!isScanning ? (
                <Button onClick={startScanning} disabled={!selectedCamera}>
                  Start Scanning
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Stop Scanning
                </Button>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Position the QR code within the frame to scan it.</p>
            </div>
          </>
        )}

        {scanMode === 'upload' && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Upload a QR code image from your computer to scan it.</p>
          </div>
        )}
      </div>
    </div>
  );
};
