# 🚀 Starting the System with QR Code Feature

The QR code feature is now fully integrated into your system. Follow these steps to start everything:

## Quick Start (3 Steps)

### Step 1: Start Docker Desktop

1. Open **Docker Desktop** application on your Mac
2. Wait for Docker to fully start (whale icon in menu bar should be steady)
3. Verify Docker is running:
   ```bash
   docker info
   ```

### Step 2: Start the System

Run the startup script:
```bash
./scripts/start-system.sh
```

This will:
- ✅ Build all containers with the new QR code feature
- ✅ Start PostgreSQL database
- ✅ Start backend API (with QR routes)
- ✅ Start frontend (with QR components)
- ✅ Run database migrations
- ✅ Seed initial data

**Wait time:** 2-5 minutes on first run

### Step 3: Access the Application

Once you see "🎉 System is ready for use!", open your browser:

**Frontend:** http://localhost:3000

**Login Credentials:**
- **Admin:** admin@example.com / admin123
- **Manager:** manager@example.com / manager123
- **User:** user@example.com / user123

## 📱 Using the QR Code Feature

### 1. Generate QR Code for New Device

1. Login as **Admin** or **Manager**
2. Click **"QR Generator"** in the sidebar (📱 icon)
3. Fill in device information:
   - Device Name: e.g., "MacBook Pro 2023"
   - Serial Number: e.g., "C02XY123"
   - Category: Select "Hardware"
4. Click **"Generate QR Code"**
5. Click **"Download"** or **"Print"**
6. Attach the QR code to your physical device

### 2. Register Device by Scanning QR Code

1. Go to **"Assets"** page
2. Click the green **"Scan QR"** button
3. Allow camera access when prompted
4. Point your camera at the QR code
5. The form will auto-fill with device information
6. Complete remaining fields (vendor, location, price, etc.)
7. Click **"Create Asset"**

### 3. Generate QR Code for Existing Asset

1. Go to **"Assets"** page
2. Find any asset in the list
3. Click the **"QR Code"** button next to the asset
4. Download or print the QR code
5. Attach to the physical device

## 🔧 Alternative: Manual Start (Without Docker)

If you prefer to run services manually:

### Terminal 1 - Database
```bash
# Start PostgreSQL (if installed locally)
brew services start postgresql@15
# or use Docker for just the database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine
```

### Terminal 2 - Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Terminal 3 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Then access: http://localhost:3000

## 📊 Verify QR Feature is Working

### Check Backend Routes
```bash
# Test health endpoint
curl http://localhost:3001/health

# Check if QR routes are registered (requires auth token)
curl http://localhost:3001/api/qrcode/asset/test-id
# Should return 401 Unauthorized (which means route exists)
```

### Check Frontend
1. Open browser console (F12)
2. Navigate to http://localhost:3000
3. Login as Admin
4. Click "QR Generator" in sidebar
5. You should see the QR Generator page

## 🛑 Stopping the System

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 🔄 Restarting the System

```bash
# Quick restart
./scripts/restart-all.sh

# Or manually
docker-compose restart
```

## 📋 Troubleshooting

### Docker Not Running
**Error:** "Docker is not running"
**Solution:** 
1. Open Docker Desktop
2. Wait for it to fully start
3. Try again

### Port Already in Use
**Error:** "Port 3000/3001/5432 is already allocated"
**Solution:**
```bash
# Find and kill process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9

# Then restart
./scripts/start-system.sh
```

### Camera Not Working
**Error:** "Camera access denied"
**Solution:**
1. Ensure you're using **HTTPS** or **localhost** (HTTP on localhost is allowed)
2. Check browser permissions: Settings → Privacy → Camera
3. Try a different browser
4. Restart the browser

### QR Code Not Scanning
**Solution:**
1. Improve lighting conditions
2. Hold camera steady
3. Adjust distance (6-12 inches)
4. Ensure QR code is not damaged or blurry

### Services Not Starting
**Solution:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

## 📱 Testing the QR Feature

### Quick Test Workflow

1. **Start System:**
   ```bash
   ./scripts/start-system.sh
   ```

2. **Login:** http://localhost:3000
   - Email: admin@example.com
   - Password: admin123

3. **Generate QR Code:**
   - Click "QR Generator" in sidebar
   - Enter: Name="Test Laptop", Serial="TEST123", Category="Hardware"
   - Click "Generate QR Code"
   - Click "Download"

4. **Scan QR Code:**
   - Go to "Assets" page
   - Click "Scan QR" button
   - Allow camera access
   - Hold the downloaded QR code in front of camera
   - Verify form auto-fills
   - Complete and submit

5. **Success!** You've registered an asset via QR code! 🎉

## 🌐 Browser Requirements

For QR scanning to work, you need:
- ✅ Modern browser (Chrome, Firefox, Safari, Edge)
- ✅ Camera access permission
- ✅ HTTPS or localhost connection
- ✅ JavaScript enabled

## 📚 Documentation

- **Quick Start:** [docs/QR_CODE_QUICK_START.md](docs/QR_CODE_QUICK_START.md)
- **Full Guide:** [docs/QR_CODE_FEATURE.md](docs/QR_CODE_FEATURE.md)
- **UI Guide:** [docs/QR_CODE_UI_GUIDE.md](docs/QR_CODE_UI_GUIDE.md)
- **Testing:** [QR_CODE_TEST_RESULTS.md](QR_CODE_TEST_RESULTS.md)

## ✅ System Status Check

After starting, verify everything is running:

```bash
# Check all containers
docker-compose ps

# Should show:
# asset-management-db        Up (healthy)
# asset-management-backend   Up (healthy)
# asset-management-frontend  Up (healthy)

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3001/health  # Should return {"status":"ok"}
curl http://localhost:3000         # Should return HTML
```

## 🎯 What's New with QR Feature

When you start the system, you'll see:

### In the Sidebar (Admin/Manager only):
```
📊 Dashboard
📦 Assets
📱 QR Generator  ← NEW!
👥 Users
👤 Profile
```

### On Assets Page:
```
[📱 Scan QR]  [+ Add Asset]  ← NEW Scan QR button
```

### On Each Asset:
```
Asset Name [Status] [History] [QR Code]  ← NEW QR Code button
```

## 🚀 You're Ready!

The QR code feature is fully integrated and will be available as soon as you start the system. No additional configuration needed!

**Start now:**
```bash
# 1. Open Docker Desktop
# 2. Run this command:
./scripts/start-system.sh

# 3. Wait for "System is ready for use!"
# 4. Open http://localhost:3000
# 5. Login and start using QR codes!
```

---

**Need Help?** Check the troubleshooting section above or review the documentation in the `docs/` folder.

**Happy Scanning!** 📱✨
