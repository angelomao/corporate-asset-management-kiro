# QR Code Feature - Quick Start Guide

## Installation

The QR code feature has been added to your asset management system. To get started:

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Rebuild the Application

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### 3. Restart the Services

If using Docker:
```bash
docker-compose down
docker-compose up --build
```

If running manually:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Quick Usage Guide

### Scenario 1: Register a New Device with QR Code

**Step 1: Generate QR Code**
1. Login as Admin or Manager
2. Click "QR Generator" in the sidebar
3. Fill in:
   - Device Name: "MacBook Pro 2023"
   - Serial Number: "C02XY1234567"
   - Category: "Hardware"
4. Click "Generate QR Code"
5. Click "Print" to print the QR code
6. Attach the printed QR code to the device

**Step 2: Register the Device**
1. Go to "Assets" page
2. Click "Scan QR" button (green button with QR icon)
3. Allow camera access when prompted
4. Point camera at the QR code on the device
5. The form will auto-fill with:
   - Name: "MacBook Pro 2023"
   - Serial Number: "C02XY1234567"
   - Category: "Hardware"
6. Fill in additional details (vendor, location, price, etc.)
7. Click "Create Asset"

Done! The device is now registered in the system.

### Scenario 2: Generate QR Code for Existing Asset

**Use Case**: You want to add a QR code label to an asset that's already in the system.

1. Go to "Assets" page
2. Find the asset (use search if needed)
3. Click the "QR Code" button next to the asset
4. A modal will show the QR code
5. Click "Download" to save as PNG, or "Print" to print directly
6. Attach the QR code to the physical device

### Scenario 3: Quick Asset Lookup via QR Code

**Use Case**: You found a device and want to know what it is and who it's assigned to.

1. Go to "Assets" page
2. Click "Scan QR" button
3. Scan the QR code on the device
4. If the asset exists, you'll see an alert with the asset name
5. The asset will be visible in the list (you can search for it)

## Tips and Best Practices

### QR Code Placement
- Place QR codes in easily accessible locations
- Avoid placing on curved surfaces (QR codes may not scan well)
- Protect QR codes with clear laminate or protective covering
- Ensure QR codes are visible but not obstructing device vents or ports

### Scanning Tips
- Ensure good lighting when scanning
- Hold the camera steady
- Keep the QR code flat and fully visible
- Adjust distance if the QR code won't scan (try 6-12 inches away)

### Bulk Operations
For registering multiple devices:
1. Generate QR codes for all devices first
2. Print all QR codes at once
3. Attach QR codes to devices
4. Scan and register devices one by one

### Mobile Usage
The QR scanner works great on mobile devices:
- Use your phone's camera for scanning
- The interface is responsive and mobile-friendly
- Perfect for warehouse or field asset registration

## Troubleshooting

### "Camera not found" Error
**Solution**: 
- Ensure you're accessing the site via HTTPS
- Check browser permissions (Settings > Privacy > Camera)
- Try a different browser
- Restart your browser

### QR Code Won't Scan
**Solution**:
- Improve lighting conditions
- Clean the camera lens
- Ensure QR code is not damaged or faded
- Try holding the camera at different distances
- Make sure the QR code is flat (not curved or wrinkled)

### "Failed to generate QR code" Error
**Solution**:
- Check your internet connection
- Ensure you're logged in
- Verify you have Admin or Manager role
- Check browser console for detailed error
- Try refreshing the page

### Form Doesn't Auto-Fill After Scanning
**Solution**:
- Ensure the QR code is from this system
- Check that the QR code is not damaged
- Try scanning again
- Manually enter the information if scanning continues to fail

## Browser Compatibility

### Fully Supported
- ✅ Chrome 53+ (Desktop & Mobile)
- ✅ Firefox 36+ (Desktop & Mobile)
- ✅ Safari 11+ (Desktop & Mobile)
- ✅ Edge 79+

### Limited Support
- ⚠️ Older browsers may not support camera access
- ⚠️ HTTP connections won't work (HTTPS required)

### Not Supported
- ❌ Internet Explorer (not supported)
- ❌ Very old mobile browsers

## Security Notes

- Camera access requires user permission
- QR codes are generated server-side for security
- Only authenticated users can scan QR codes
- Only Admin/Manager roles can generate QR codes
- All QR operations are logged for audit purposes

## Next Steps

1. **Test the Feature**: Try generating and scanning a QR code
2. **Train Your Team**: Show other admins/managers how to use it
3. **Create QR Codes**: Generate QR codes for your existing assets
4. **Label Devices**: Print and attach QR codes to physical devices
5. **Start Scanning**: Use QR codes for quick asset registration

## Need Help?

- Check the full documentation: `docs/QR_CODE_FEATURE.md`
- Review the implementation summary: `QR_CODE_IMPLEMENTATION_SUMMARY.md`
- Check the main README: `README.md`

## Feedback

If you encounter any issues or have suggestions for improvement, please:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Document the steps to reproduce the issue
4. Contact your system administrator

---

**Happy Scanning! 📱✨**
