import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../components/ui';
import { AssetCategory } from '../types/asset';

const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'HARDWARE', label: 'Hardware' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'OTHER', label: 'Other' },
];

export const QRCodeGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    category: 'HARDWARE' as AssetCategory,
    vendor: '',
    location: '',
    purchasePrice: '',
  });
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generateQRCode = async () => {
    // Create QR code data for new device registration
    const qrData = JSON.stringify({
      type: 'asset',
      name: formData.name,
      serialNumber: formData.serialNumber,
      category: formData.category.toUpperCase(),
      vendor: formData.vendor,
      location: formData.location,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
    });

    try {
      // Use the QRCode library to generate actual QR code
      const QRCode = (await import('qrcode')).default;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 2,
      });
      
      setQrCode(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-${formData.name.replace(/\s+/g, '-')}.png`;
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
            <title>QR Code - ${formData.name}</title>
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
              .info {
                text-align: center;
                margin-bottom: 20px;
              }
              h1 {
                margin: 0 0 10px 0;
              }
              img {
                max-width: 400px;
                border: 2px solid #000;
                padding: 10px;
              }
            </style>
          </head>
          <body>
            <div class="info">
              <h1>${formData.name}</h1>
              <p>Serial: ${formData.serialNumber || 'N/A'}</p>
              <p>Category: ${formData.category}</p>
              ${formData.vendor ? `<p>Vendor: ${formData.vendor}</p>` : ''}
              ${formData.location ? `<p>Location: ${formData.location}</p>` : ''}
              ${formData.purchasePrice ? `<p>Price: $${formData.purchasePrice}</p>` : ''}
            </div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate QR codes for new devices before registration
        </p>
      </div>

      <Card title="Device Information">
        <div className="space-y-4">
          <Input
            label="Device Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter device name"
          />

          <Input
            label="Serial Number"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            placeholder="Enter serial number"
          />

          <Select
            label="Category *"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
            options={ASSET_CATEGORIES}
          />

          <Input
            label="Vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            placeholder="Enter vendor name"
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter location"
          />

          <Input
            label="Purchase Price"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
            placeholder="0.00"
          />

          <Button
            onClick={generateQRCode}
            disabled={!formData.name}
            className="w-full"
          >
            Generate QR Code
          </Button>
        </div>
      </Card>

      {qrCode && (
        <Card title="Generated QR Code">
          <div className="space-y-4">
            <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Print or download this QR code</li>
                <li>Attach it to the physical device</li>
                <li>Use the "Scan QR" button in the Assets page to register the device</li>
                <li>The device information will be pre-filled from the QR code</li>
              </ol>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Download
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Print
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QRCodeGenerator;
