# Railway Deployment Guide - Data Persistence Fix

## Problem
Railway uses an **ephemeral file system**, which means any data stored locally (SQLite database, uploaded files) gets deleted on every deployment. This causes data loss.

## Solution
This application is now configured to use **Railway Volumes** for persistent data storage.

---

## Deployment Steps

### Step 1: Deploy to Railway

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Railway volume support"
   git push origin main
   ```

2. **Create a new Railway project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Railway will automatically detect** the configuration from `railway.json`

### Step 2: Add a Persistent Volume

This is the **critical step** to prevent data loss!

1. **In your Railway project dashboard**, click on your service
2. Go to the **"Data"** or **"Volumes"** tab
3. Click **"New Volume"**
4. Configure the volume:
   - **Mount Path**: `/data`
   - **Size**: Start with 1GB (can increase later)
5. Click **"Add"**

### Step 3: Set Environment Variables

In Railway, go to **"Variables"** tab and add:

```
RAILWAY_VOLUME_MOUNT_PATH=/data
```

**Optional variables** (if you want to customize paths):
```
DB_PATH=/data/retail.db
UPLOADS_DIR=/data/uploads
DATA_DIR=/data
```

### Step 4: Deploy

1. Railway will automatically redeploy after adding the volume
2. Check the deployment logs to verify:
   ```
   Created data directory: /data
   Created uploads directory: /data/uploads
   Connected to SQLite database at: /data/retail.db
   ```

---

## How It Works

### File Structure on Railway

```
/app/                          (Ephemeral - gets wiped on redeploy)
├── server.js
├── package.json
├── public/
└── ...

/data/                         (Persistent Volume - survives redeploys)
├── retail.db                  (Your SQLite database)
└── uploads/                   (Uploaded files)
    ├── image1.jpg
    └── document.pdf
```

### Code Changes Made

1. **server.js** now uses environment-aware paths:
   ```javascript
   const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data');
   const DB_PATH = path.join(DATA_DIR, 'retail.db');
   const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
   ```

2. **Automatic directory creation** on startup:
   - Creates `/data` directory if it doesn't exist
   - Creates `/data/uploads` subdirectory

3. **Works locally too**:
   - In development: Uses `./data/retail.db`
   - On Railway: Uses `/data/retail.db` (persistent volume)

---

## Verification

After deployment, verify data persistence:

1. **Add some data** (customers, products, sales)
2. **Trigger a redeploy**:
   - Make a small code change and push
   - Or click "Redeploy" in Railway dashboard
3. **Check if data is still there** after redeploy

If data persists, you're all set! ✅

---

## Volume Management

### Checking Volume Usage

In Railway dashboard:
- Go to your service
- Click on the volume
- View current usage and capacity

### Backing Up Your Database

**Option 1: Manual Backup via Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Download database
railway run cat /data/retail.db > retail-backup.db
```

**Option 2: Automated Backups**
Add a backup endpoint to your app (see below).

### Backup Endpoint (Optional)

Add this to your `server.js`:

```javascript
// Backup endpoint (protect this with authentication in production!)
app.get('/api/admin/backup-db', (req, res) => {
  res.download(DB_PATH, 'retail-backup.db', (err) => {
    if (err) {
      console.error('Backup error:', err);
      res.status(500).json({ error: 'Backup failed' });
    }
  });
});
```

Then download backups by visiting: `https://your-app.railway.app/api/admin/backup-db`

⚠️ **Security Warning**: Protect this endpoint with authentication in production!

---

## Troubleshooting

### Data Still Getting Lost?

**Check these:**

1. **Volume is mounted**
   - Go to Railway dashboard → Service → Volumes
   - Ensure volume shows as "Active"
   - Verify mount path is `/data`

2. **Environment variable is set**
   ```
   RAILWAY_VOLUME_MOUNT_PATH=/data
   ```

3. **Check deployment logs**
   - Look for: `Connected to SQLite database at: /data/retail.db`
   - Should NOT show: `./retail.db` or `/app/retail.db`

4. **Restart the service**
   - Sometimes a restart is needed after adding a volume

### Volume Full?

If you run out of space:

1. Go to Railway dashboard → Volume settings
2. Increase the volume size
3. Railway will expand it automatically (no downtime)

### Migrating Existing Data

If you already deployed and have data you want to keep:

1. **Before adding volume**: Download your current database
   - Use Railway CLI or add a temporary download endpoint

2. **Add the volume** (follow Step 2 above)

3. **Upload your database back**:
   ```bash
   # Using Railway CLI
   railway run 'cat > /data/retail.db' < your-backup.db
   ```

---

## Cost Considerations

**Railway Volume Pricing** (as of 2024):
- **Included**: First 1GB is typically included in free tier
- **Paid**: ~$0.25/GB/month for additional storage

**Tips to minimize costs:**
- Start with 1GB (plenty for most retail operations)
- Clean up old uploaded files periodically
- Compress images before upload
- Use SQLite VACUUM to optimize database size

---

## Alternative Solutions

### Option 1: Use Railway PostgreSQL (Recommended for Production)

For better performance and scalability:

1. Add PostgreSQL database in Railway
2. Install PostgreSQL driver: `npm install pg`
3. Update your code to use PostgreSQL instead of SQLite

**Pros:**
- Better for concurrent users
- Built-in Railway backups
- Better performance at scale

**Cons:**
- Requires code changes
- Costs more than volumes

### Option 2: External Database (Supabase, PlanetScale)

Use a managed database service:
- [Supabase](https://supabase.com) - Free PostgreSQL tier
- [PlanetScale](https://planetscale.com) - Free MySQL tier

---

## Best Practices

1. **Regular Backups**
   - Download database weekly
   - Store backups in multiple locations (Google Drive, Dropbox, etc.)

2. **Monitor Volume Usage**
   - Check Railway dashboard monthly
   - Set up alerts when approaching capacity

3. **Optimize Storage**
   - Compress images before upload
   - Delete old/unused data
   - Run SQLite VACUUM monthly:
     ```sql
     VACUUM;
     ```

4. **Test Deployments**
   - Always test in a staging environment first
   - Verify data persists after test deployments

---

## Summary

✅ **What was fixed:**
- SQLite database now uses persistent volume (`/data/retail.db`)
- Uploaded files use persistent storage (`/data/uploads/`)
- Works in development and production
- Automatic directory creation

✅ **What you need to do:**
1. Add a volume in Railway dashboard (mount path: `/data`)
2. Set environment variable: `RAILWAY_VOLUME_MOUNT_PATH=/data`
3. Deploy and verify

🎉 **Result:** Your data will now persist across deployments!

---

## Need Help?

- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Review the code changes in `server.js`

**Important Files:**
- `server.js` - Updated database and upload paths
- `railway.json` - Railway configuration
- `.env.example` - Environment variable examples
