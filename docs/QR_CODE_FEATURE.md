# QR Code Asset Registration Feature

## Overview

The QR Code feature allows you to quickly register and manage assets by scanning QR codes attached to physical devices. This streamlines the asset registration process and makes it easy to access asset information on the go.

## Features

### 1. QR Code Generation
- Generate QR codes for new devices before registration
- Include device name, serial number, and category in the QR code
- Download or print QR codes to attach to physical devices

### 2. QR Code Scanning
- Scan QR codes using your device's camera
- Automatically pre-fill asset registration form with scanned data
- Quick access to existing asset information

### 3. Asset QR Codes
- Generate QR codes for existing assets
- Download or print asset QR codes for labeling
- Quick asset lookup by scanning

## How to Use

### Generating QR Codes for New Devices

1. Navigate to **QR Generator** in the sidebar (Admin/Manager only)
2. Fill in the device information:
   - Device Name (required)
   - Serial Number (optional)
   - Category (required)
3. Click **Generate QR Code**
4. Download or print the QR code
5. Attach the QR code to the physical device

### Registering Assets via QR Code

1. Go to the **Assets** page
2. Click the **Scan QR** button
3. Allow camera access when prompted
4. Position the QR code within the camera frame
5. The system will:
   - For new devices: Pre-fill the registration form with scanned data
   - For existing assets: Display asset information
6. Complete the registration by filling in additional details

### Generating QR Codes for Existing Assets

1. Go to the **Assets** page
2. Find the asset you want to generate a QR code for
3. Click the **QR Code** button next to the asset
4. Download or print the QR code
5. Attach it to the physical device for easy identification

## Technical Details

### Backend API Endpoints

#### Generate QR Code for Asset
```
GET /api/qrcode/asset/:id
```
Returns a QR code image (data URL) for the specified asset.

#### Process Scanned QR Code
```
POST /api/qrcode/scan
Body: { data: string }
```
Processes scanned QR code data and returns asset information or registration data.

### QR Code Data Format

QR codes contain JSON data with the following structure:

```json
{
  "type": "asset",
  "id": "asset-id",           // For existing assets
  "name": "Device Name",
  "serialNumber": "SN12345",
  "category": "HARDWARE"
}
```

### Frontend Components

- **QRCodeDisplay**: Modal component for displaying and downloading asset QR codes
- **QRScanner**: Camera-based QR code scanner component
- **QRCodeGenerator**: Page for generating QR codes for new devices

## Browser Compatibility

The QR code scanner requires:
- Modern browser with camera access support
- HTTPS connection (required for camera access)
- User permission to access camera

Supported browsers:
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

## Security Considerations

- QR codes are generated server-side to ensure data integrity
- Camera access requires user permission
- QR code scanning is only available to authenticated users
- Asset registration via QR code still requires proper authentication and authorization

## Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS (camera access requires secure connection)
- Check browser permissions for camera access
- Try a different camera if multiple cameras are available
- Ensure no other application is using the camera

### QR Code Not Scanning
- Ensure good lighting conditions
- Hold the camera steady
- Position the QR code within the frame
- Try adjusting the distance between camera and QR code

### QR Code Not Generating
- Check network connection
- Ensure you have proper permissions (Admin/Manager role)
- Verify the asset exists in the database

## Future Enhancements

- Bulk QR code generation for multiple assets
- Custom QR code styling and branding
- NFC tag support for contactless asset identification
- Mobile app for dedicated asset scanning
- QR code history and analytics
