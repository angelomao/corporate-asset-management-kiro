# QR Code Feature - Flow Diagrams

## 1. QR Code Generation for New Devices

```
┌─────────────────────────────────────────────────────────────────┐
│                    QR Code Generation Flow                       │
└─────────────────────────────────────────────────────────────────┘

Admin/Manager                QR Generator Page              System
     │                              │                          │
     │  1. Navigate to             │                          │
     │     "QR Generator"          │                          │
     ├────────────────────────────>│                          │
     │                              │                          │
     │  2. Fill device info         │                          │
     │     - Name                   │                          │
     │     - Serial Number          │                          │
     │     - Category               │                          │
     ├────────────────────────────>│                          │
     │                              │                          │
     │  3. Click "Generate"         │                          │
     ├────────────────────────────>│                          │
     │                              │  4. Create QR data       │
     │                              │     (JSON format)        │
     │                              ├─────────────────────────>│
     │                              │                          │
     │                              │  5. Generate QR image    │
     │                              │<─────────────────────────┤
     │                              │                          │
     │  6. Display QR code          │                          │
     │<─────────────────────────────┤                          │
     │                              │                          │
     │  7. Download/Print           │                          │
     ├────────────────────────────>│                          │
     │                              │                          │
     │  8. Attach to device         │                          │
     │     (Physical action)        │                          │
     │                              │                          │
```

## 2. Asset Registration via QR Code Scanning

```
┌─────────────────────────────────────────────────────────────────┐
│                  QR Code Scanning Flow                           │
└─────────────────────────────────────────────────────────────────┘

Admin/Manager          Assets Page          QR Scanner          Backend
     │                      │                    │                  │
     │  1. Click           │                    │                  │
     │     "Scan QR"       │                    │                  │
     ├────────────────────>│                    │                  │
     │                      │  2. Open scanner   │                  │
     │                      ├───────────────────>│                  │
     │                      │                    │                  │
     │  3. Allow camera     │                    │                  │
     │     permission       │                    │                  │
     ├─────────────────────────────────────────>│                  │
     │                      │                    │                  │
     │  4. Position QR      │                    │                  │
     │     code in frame    │                    │                  │
     ├─────────────────────────────────────────>│                  │
     │                      │                    │                  │
     │                      │  5. Decode QR data │                  │
     │                      │<───────────────────┤                  │
     │                      │                    │                  │
     │                      │  6. Send to backend│                  │
     │                      ├───────────────────────────────────────>│
     │                      │                    │                  │
     │                      │                    │  7. Validate &   │
     │                      │                    │     process data │
     │                      │                    │                  │
     │                      │  8. Return result  │                  │
     │                      │<───────────────────────────────────────┤
     │                      │                    │                  │
     │  9. Pre-fill form    │                    │                  │
     │<─────────────────────┤                    │                  │
     │                      │                    │                  │
     │  10. Complete form   │                    │                  │
     │      & submit        │                    │                  │
     ├────────────────────>│                    │                  │
     │                      │  11. Create asset  │                  │
     │                      ├───────────────────────────────────────>│
     │                      │                    │                  │
     │  12. Success!        │                    │                  │
     │<─────────────────────┤                    │                  │
     │                      │                    │                  │
```

## 3. QR Code Generation for Existing Assets

```
┌─────────────────────────────────────────────────────────────────┐
│              Existing Asset QR Code Generation                   │
└─────────────────────────────────────────────────────────────────┘

User                Assets Page              Backend              QR Display
 │                       │                       │                     │
 │  1. Find asset        │                       │                     │
 ├──────────────────────>│                       │                     │
 │                       │                       │                     │
 │  2. Click "QR Code"   │                       │                     │
 ├──────────────────────>│                       │                     │
 │                       │  3. Request QR code   │                     │
 │                       │      for asset ID     │                     │
 │                       ├──────────────────────>│                     │
 │                       │                       │                     │
 │                       │  4. Fetch asset data  │                     │
 │                       │                       │                     │
 │                       │  5. Generate QR code  │                     │
 │                       │      with asset info  │                     │
 │                       │                       │                     │
 │                       │  6. Return QR image   │                     │
 │                       │<──────────────────────┤                     │
 │                       │                       │                     │
 │                       │  7. Show modal        │                     │
 │                       ├────────────────────────────────────────────>│
 │                       │                       │                     │
 │  8. View QR code      │                       │                     │
 │<──────────────────────────────────────────────────────────────────┤
 │                       │                       │                     │
 │  9. Download/Print    │                       │                     │
 ├──────────────────────────────────────────────────────────────────>│
 │                       │                       │                     │
```

## 4. QR Code Data Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    QR Code Data Format                           │
└─────────────────────────────────────────────────────────────────┘

For New Device Registration:
┌──────────────────────────────────┐
│ {                                │
│   "type": "asset",               │
│   "name": "MacBook Pro 2023",    │
│   "serialNumber": "C02XY123",    │
│   "category": "HARDWARE"         │
│ }                                │
└──────────────────────────────────┘
         │
         │ Scanned
         ▼
┌──────────────────────────────────┐
│  Pre-filled Registration Form    │
│  ┌────────────────────────────┐  │
│  │ Name: MacBook Pro 2023     │  │
│  │ Serial: C02XY123           │  │
│  │ Category: HARDWARE         │  │
│  │ [Additional fields empty]  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘


For Existing Asset:
┌──────────────────────────────────┐
│ {                                │
│   "type": "asset",               │
│   "id": "asset-uuid-123",        │
│   "name": "MacBook Pro 2023",    │
│   "serialNumber": "C02XY123",    │
│   "category": "HARDWARE"         │
│ }                                │
└──────────────────────────────────┘
         │
         │ Scanned
         ▼
┌──────────────────────────────────┐
│    Asset Information Display     │
│  ┌────────────────────────────┐  │
│  │ Asset: MacBook Pro 2023    │  │
│  │ Status: ASSIGNED           │  │
│  │ Assigned to: John Doe      │  │
│  │ Location: Office 3B        │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QR Code System Architecture                   │
└─────────────────────────────────────────────────────────────────┘

Frontend Layer
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ QR Generator │  │  QR Scanner  │  │ QR Display   │        │
│  │    Page      │  │  Component   │  │   Modal      │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │ Asset Service  │                          │
│                    └───────┬────────┘                          │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Backend Layer                              │
│                                                                 │
│                    ┌───────────────┐                           │
│                    │  QR Code API  │                           │
│                    │    Routes     │                           │
│                    └───────┬───────┘                           │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐               │
│         │                  │                  │                │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼─────┐        │
│  │   QRCode    │  │     Prisma      │  │   Auth    │        │
│  │   Library   │  │      ORM        │  │Middleware │        │
│  └─────────────┘  └────────┬────────┘  └───────────┘        │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Database Layer                             │
│                                                                 │
│                    ┌───────────────┐                           │
│                    │   PostgreSQL  │                           │
│                    │   (Assets DB) │                           │
│                    └───────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6. User Roles and Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│                  QR Code Feature Permissions                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Feature    │    ADMIN     │   MANAGER    │     USER     │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Generate QR  │      ✅      │      ✅      │      ❌      │
│ (New Device) │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Scan QR Code │      ✅      │      ✅      │      ❌      │
│              │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Generate QR  │      ✅      │      ✅      │      ✅      │
│ (Existing)   │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ View QR Code │      ✅      │      ✅      │      ✅      │
│              │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Download QR  │      ✅      │      ✅      │      ✅      │
│              │              │              │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Print QR     │      ✅      │      ✅      │      ✅      │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## 7. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Handling Flow                           │
└─────────────────────────────────────────────────────────────────┘

Scanning Process
     │
     ├─> Camera Access Denied
     │        │
     │        └─> Show error: "Camera permission required"
     │            Provide instructions to enable camera
     │
     ├─> Invalid QR Code Format
     │        │
     │        └─> Show error: "Invalid QR code"
     │            Suggest trying again or manual entry
     │
     ├─> Network Error
     │        │
     │        └─> Show error: "Connection failed"
     │            Provide retry button
     │
     ├─> Asset Not Found
     │        │
     │        └─> Show error: "Asset not found"
     │            Suggest registering as new asset
     │
     └─> Success
              │
              └─> Process normally
```

## 8. Mobile vs Desktop Experience

```
┌─────────────────────────────────────────────────────────────────┐
│              Mobile vs Desktop QR Code Usage                     │
└─────────────────────────────────────────────────────────────────┘

Mobile Device                          Desktop Computer
┌──────────────┐                      ┌──────────────┐
│   📱 Phone   │                      │   💻 Laptop  │
└──────┬───────┘                      └──────┬───────┘
       │                                     │
       │ Scanning                            │ Scanning
       │ ✅ Built-in camera                  │ ⚠️ Requires webcam
       │ ✅ Easy to position                 │ ⚠️ Less mobile
       │ ✅ Perfect for field use            │ ✅ Larger screen
       │ ✅ One-handed operation             │ ✅ Easier typing
       │                                     │
       │ Generation                          │ Generation
       │ ✅ Can generate                     │ ✅ Can generate
       │ ⚠️ Smaller preview                  │ ✅ Larger preview
       │ ✅ Easy to print                    │ ✅ Easy to print
       │ ✅ Can share directly               │ ✅ Better for bulk
       │                                     │
       │ Best For:                           │ Best For:
       │ • Field scanning                    │ • Bulk generation
       │ • Quick lookups                     │ • Detailed editing
       │ • On-the-go registration            │ • Office work
       │                                     │
```

---

These diagrams provide a visual understanding of how the QR code feature works throughout the system. Use them as a reference when implementing, troubleshooting, or explaining the feature to others.
