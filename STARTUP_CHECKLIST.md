# ✅ System Startup Checklist

## Before You Start

- [ ] Docker Desktop is installed
- [ ] You have at least 4GB of free RAM
- [ ] Ports 3000, 3001, and 5432 are available

## Starting the System

### Step 1: Start Docker
- [ ] Open Docker Desktop application
- [ ] Wait for Docker to be fully running (whale icon steady)
- [ ] Verify: Run `docker info` in terminal

### Step 2: Start the System
- [ ] Open terminal in project root
- [ ] Run: `./scripts/start-system.sh`
- [ ] Wait for "System is ready for use!" message (2-5 minutes)

### Step 3: Verify Services
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:3001/health
- [ ] Can login with admin@example.com / admin123

## Testing QR Code Feature

### Step 4: Access QR Generator
- [ ] Login as Admin or Manager
- [ ] See "QR Generator" in sidebar (📱 icon)
- [ ] Click "QR Generator"
- [ ] Page loads successfully

### Step 5: Generate a QR Code
- [ ] Fill in device name: "Test Device"
- [ ] Fill in serial: "TEST123"
- [ ] Select category: "Hardware"
- [ ] Click "Generate QR Code"
- [ ] QR code displays
- [ ] Can download QR code
- [ ] Can print QR code

### Step 6: Test QR Scanner
- [ ] Go to "Assets" page
- [ ] See green "Scan QR" button
- [ ] Click "Scan QR" button
- [ ] Camera permission dialog appears
- [ ] Allow camera access
- [ ] Camera feed displays
- [ ] Can scan the generated QR code
- [ ] Form auto-fills with device data

### Step 7: Test Asset QR Code
- [ ] Find any asset in the list
- [ ] See "QR Code" button next to asset
- [ ] Click "QR Code" button
- [ ] QR code modal displays
- [ ] Can download asset QR code
- [ ] Can print asset QR code

## Success Criteria

✅ All checkboxes above are checked
✅ No error messages in browser console
✅ QR codes can be generated and scanned
✅ Camera access works properly

## If Something Fails

### Docker Issues
```bash
# Restart Docker Desktop
# Then try again:
./scripts/start-system.sh
```

### Port Conflicts
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5432 | xargs kill -9

# Restart
./scripts/start-system.sh
```

### Camera Issues
- Use Chrome or Firefox (best support)
- Ensure HTTPS or localhost
- Check browser camera permissions
- Try different browser

### Complete Reset
```bash
# Nuclear option - clean everything
docker-compose down -v
docker system prune -a
./scripts/start-system.sh
```

## Quick Commands

```bash
# Start system
./scripts/start-system.sh

# Stop system
docker-compose down

# Restart system
./scripts/restart-all.sh

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

## Expected Timeline

- Docker startup: 30 seconds
- System startup: 2-5 minutes
- First QR generation: < 2 seconds
- Camera startup: < 3 seconds
- QR scanning: Real-time

## Support

- **Documentation:** See `docs/` folder
- **Quick Start:** [START_WITH_QR_FEATURE.md](START_WITH_QR_FEATURE.md)
- **Troubleshooting:** [docs/QR_CODE_QUICK_START.md](docs/QR_CODE_QUICK_START.md)

---

**Ready to start?** 
1. Open Docker Desktop
2. Run `./scripts/start-system.sh`
3. Wait for success message
4. Open http://localhost:3000
5. Start scanning! 📱✨
