# 🚀 Deployment Alternatives Guide

Complete guide to deploying the Retail Management System on various cloud platforms - alternatives to Render and Railway.

## Table of Contents
1. [Quick Comparison](#quick-comparison)
2. [Fly.io (Recommended)](#flyio-recommended)
3. [DigitalOcean App Platform](#digitalocean-app-platform)
4. [Cyclic](#cyclic)
5. [Vercel](#vercel)
6. [Koyeb](#koyeb)
7. [AWS Options](#aws-options)
8. [Google Cloud Platform](#google-cloud-platform)
9. [Azure](#azure)
10. [Self-Hosted VPS](#self-hosted-vps)

---

## Quick Comparison

| Platform | Free Tier | Persistent Storage | Ease of Use | Best For |
|----------|-----------|-------------------|-------------|----------|
| **Fly.io** | ✅ 3 VMs free | ✅ 3GB volumes | ⭐⭐⭐⭐ | Node.js apps with SQLite |
| **DigitalOcean** | ❌ ~$5/mo | ✅ Built-in | ⭐⭐⭐⭐⭐ | Production apps |
| **Cyclic** | ✅ Yes | ⚠️ S3-based | ⭐⭐⭐⭐⭐ | Serverless Node.js |
| **Vercel** | ✅ Yes | ❌ Serverless only | ⭐⭐⭐ | Stateless APIs |
| **Koyeb** | ✅ Yes | ✅ Volumes | ⭐⭐⭐⭐ | Docker containers |
| **AWS Lightsail** | ❌ ~$3.50/mo | ✅ Built-in | ⭐⭐⭐ | Simple VPS |
| **GCP Cloud Run** | ✅ Generous | ⚠️ Complex | ⭐⭐⭐ | Containerized apps |
| **Azure** | ✅ Credits | ✅ Built-in | ⭐⭐⭐ | Enterprise apps |
| **VPS (Hetzner)** | ❌ ~€4/mo | ✅ Full control | ⭐⭐ | Cost-effective |

---

## Fly.io (Recommended)

**Best alternative to Render/Railway for Node.js apps with SQLite**

### Why Fly.io?
- ✅ **Free tier**: 3 VMs (256MB RAM each) + 3GB persistent storage
- ✅ **Perfect for SQLite**: Designed for apps with persistent volumes
- ✅ **Global deployment**: Deploy close to users worldwide
- ✅ **Auto HTTPS**: Automatic SSL certificates
- ✅ **No credit card** required for free tier
- ✅ **CLI-based**: Simple deployment workflow

### Deployment Steps

#### 1. Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

#### 2. Sign Up & Login

```bash
fly auth signup
# Or if you already have an account:
fly auth login
```

#### 3. Create fly.toml Configuration

I'll create this for you:

```toml
# fly.toml
app = "retail-management-unique-name"
primary_region = "sjc"  # Change to nearest: sjc, iad, lhr, etc.

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/nodejs"]

[env]
  NODE_ENV = "production"
  PORT = "8080"
  DATA_DIR = "/data"
  DB_PATH = "/data/retail.db"
  UPLOADS_DIR = "/data/uploads"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[mounts]
  source = "retail_data"
  destination = "/data"
```

#### 4. Deploy

```bash
# Initialize and deploy
fly launch --config fly.toml

# Create persistent volume (first time only)
fly volumes create retail_data --size 1

# Deploy updates
fly deploy

# Open in browser
fly open
```

#### 5. Set Secrets

```bash
# Generate and set JWT secret
fly secrets set JWT_SECRET=$(openssl rand -hex 32)
```

### Managing Your App

```bash
# View logs
fly logs

# SSH into your app
fly ssh console

# Check status
fly status

# Scale up (if needed)
fly scale memory 512  # Increase to 512MB
```

### Cost
- **Free tier**: Up to 3 VMs + 3GB storage = $0/month
- **Beyond free tier**: ~$2-5/month for small apps

---

## DigitalOcean App Platform

**Best for production-ready deployments**

### Why DigitalOcean?
- ✅ **Reliable**: Enterprise-grade infrastructure
- ✅ **Simple pricing**: Fixed $5/month starter plan
- ✅ **Persistent storage**: Built-in support
- ✅ **Great docs**: Excellent documentation
- ✅ **Managed platform**: No server management
- ❌ **No free tier**: Paid only (~$5/month)

### Deployment Steps

#### 1. Sign Up

1. Go to https://www.digitalocean.com
2. Sign up (you may get $200 free credit for 60 days)
3. Add billing info

#### 2. Create App

1. **Click "Create" → "Apps"**
2. **Connect GitHub:**
   - Authorize DigitalOcean
   - Select `Retail-management` repository
   - Choose branch: `main` or your deployment branch

#### 3. Configure App

**Resources:**
- Type: **Web Service**
- Name: `retail-management`
- Build Command: `npm install`
- Run Command: `node server.js`
- HTTP Port: `3001` (or `8080`)

**Environment Variables:**
```
NODE_ENV=production
DATA_DIR=/data
DB_PATH=/data/retail.db
UPLOADS_DIR=/data/uploads
JWT_SECRET=<generate-random-string>
```

**Add Persistent Storage:**
1. Under "Storage" → Click "Add"
2. Name: `retail-data`
3. Mount path: `/data`
4. Size: 1GB

#### 4. Deploy

1. Choose region closest to users
2. Select plan: **Basic ($5/month)**
3. Click "Create Resources"
4. Wait for deployment (~5 minutes)

### Managing Your App

- **Dashboard**: Full web UI for logs, metrics, scaling
- **CLI**: Install with `snap install doctl` (optional)
- **Auto-deploy**: Pushes to GitHub auto-deploy

### Cost
- **Basic**: $5/month (512MB RAM, 1 vCPU)
- **Professional**: $12/month (1GB RAM, better performance)

---

## Cyclic

**Best for serverless Node.js deployments**

### Why Cyclic?
- ✅ **Free tier**: Generous limits
- ✅ **Zero config**: Deploy directly from GitHub
- ✅ **Serverless**: Scales automatically
- ✅ **Simple**: Easiest deployment
- ⚠️ **S3 storage**: SQLite stored on S3 (works but slower than local disk)

### Deployment Steps

#### 1. Deploy

1. Go to https://www.cyclic.sh
2. Click "Login with GitHub"
3. Click "Deploy" → Select your repository
4. That's it! Cyclic auto-configures everything

#### 2. Add Environment Variables

1. Go to your app → "Variables"
2. Add:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-random>
   ```

#### 3. Notes on SQLite

Cyclic stores files on S3, so:
- Database persists between deployments
- Slightly slower than local disk
- Works fine for small-medium apps

### Cost
- **Free tier**: Unlimited apps, reasonable limits
- **Pro**: $5/month per app (better performance)

---

## Vercel

**Good for APIs, limited for SQLite apps**

### Why Vercel?
- ✅ **Free tier**: Very generous
- ✅ **Easy deployment**: Git push to deploy
- ✅ **Great DX**: Developer experience
- ❌ **Serverless only**: Not ideal for SQLite (ephemeral storage)
- ⚠️ **Workaround needed**: Use external database

### Deployment Steps

#### Option 1: Use Vercel (Not Recommended for This App)

SQLite won't persist on Vercel due to serverless architecture.

#### Option 2: Use Vercel + External DB (Recommended)

1. **Replace SQLite with PostgreSQL:**
   - Use Vercel Postgres (free tier)
   - Or use Supabase (PostgreSQL as a service)

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

**Note**: Requires code changes to use PostgreSQL instead of SQLite.

### Cost
- **Free tier**: Enough for most apps
- **Pro**: $20/month (better limits)

---

## Koyeb

**Similar to Render, good alternative**

### Why Koyeb?
- ✅ **Free tier**: 1 web service + 1 database
- ✅ **Persistent volumes**: Support for SQLite
- ✅ **Global edge network**: Fast worldwide
- ✅ **Auto HTTPS**: Free SSL
- ✅ **Container or Git deployment**: Flexible

### Deployment Steps

#### 1. Sign Up

1. Go to https://www.koyeb.com
2. Sign up with GitHub
3. No credit card required for free tier

#### 2. Create Service

1. **Click "Create App"**
2. **Select "GitHub"**
3. Choose `Retail-management` repository
4. Configure:
   ```
   Build: npm install
   Run: node server.js
   Port: 8080
   ```

#### 3. Add Volume

1. Under "Volumes" → Click "Add"
2. Name: `retail-data`
3. Mount path: `/data`
4. Size: 1GB

#### 4. Environment Variables

```
NODE_ENV=production
PORT=8080
DATA_DIR=/data
DB_PATH=/data/retail.db
UPLOADS_DIR=/data/uploads
JWT_SECRET=<generate>
```

#### 5. Deploy

Click "Deploy" and wait ~2-3 minutes.

### Cost
- **Free tier**: 1 service + 2GB storage
- **Paid**: Starting at $5/month

---

## AWS Options

**Best for: Scalability, enterprise features**

### Option 1: AWS Elastic Beanstalk (Easiest)

**Managed platform for Node.js apps**

#### Setup

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize:**
   ```bash
   eb init
   # Follow prompts: select Node.js platform
   ```

3. **Create app.yaml:**
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "node server.js"
   ```

4. **Deploy:**
   ```bash
   eb create retail-management
   eb deploy
   ```

**Cost**: ~$10-20/month (t2.micro instance)

### Option 2: AWS Lightsail (Simple VPS)

**Best for: Cost-effective, simple VPS**

#### Setup

1. Go to https://lightsail.aws.amazon.com
2. Click "Create instance"
3. Select:
   - Platform: **Linux/Unix**
   - Blueprint: **Node.js**
   - Plan: **$3.50/month** (512MB RAM)
4. Create instance
5. SSH in and deploy:
   ```bash
   git clone https://github.com/pntme/Retail-management.git
   cd Retail-management
   npm install
   npm start
   ```

**Cost**: $3.50-5/month

### Option 3: AWS EC2 (Full Control)

**Best for: Custom requirements, full control**

See DEPLOYMENT.md for full EC2 setup instructions.

**Cost**: ~$5-10/month (t2.micro/t3.micro)

---

## Google Cloud Platform

### Option 1: Cloud Run (Serverless Containers)

**Best for: Containerized apps, pay-per-use**

#### Setup

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 8080
   CMD ["node", "server.js"]
   ```

2. **Deploy:**
   ```bash
   gcloud run deploy retail-management \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

**Limitation**: Ephemeral storage (need Cloud SQL or Filestore for persistence)

**Cost**: Very generous free tier, then pay-per-use

### Option 2: Google App Engine

**Managed platform for Node.js**

#### Setup

1. **Create app.yaml:**
   ```yaml
   runtime: nodejs18
   instance_class: F1
   automatic_scaling:
     min_instances: 0
     max_instances: 1
   ```

2. **Deploy:**
   ```bash
   gcloud app deploy
   ```

**Cost**: ~$5-10/month

---

## Azure

### Azure App Service

**Best for: Enterprise, Microsoft ecosystem**

#### Setup

1. Go to https://portal.azure.com
2. Create "App Service"
3. Configure:
   - Runtime: **Node 18**
   - OS: **Linux**
   - Region: Choose nearest
   - Plan: **F1 Free** or **B1 Basic** ($13/month)

4. Deploy via:
   - GitHub Actions (recommended)
   - Or VS Code extension
   - Or Azure CLI

**Free tier**: Available but limited
**Cost**: $13/month for basic plan

---

## Self-Hosted VPS

**Best for: Full control, lowest cost**

### Recommended Providers

| Provider | Price | Location | RAM/CPU |
|----------|-------|----------|---------|
| **Hetzner** | €4/mo | Germany, Finland, USA | 2GB/1 vCPU |
| **Contabo** | €5/mo | Germany, USA, Asia | 4GB/2 vCPU |
| **Linode** | $5/mo | Global | 1GB/1 vCPU |
| **Vultr** | $6/mo | Global | 1GB/1 vCPU |

### Setup (Ubuntu Server)

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Clone repository
cd /var/www
git clone https://github.com/pntme/Retail-management.git
cd Retail-management

# 4. Install dependencies
npm install

# 5. Install PM2
sudo npm install -g pm2

# 6. Start app
pm2 start server.js --name retail-management
pm2 save
pm2 startup

# 7. Setup Nginx reverse proxy
sudo apt install nginx -y
```

**Nginx config** (`/etc/nginx/sites-available/retail`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/retail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL (optional)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## Recommendation by Use Case

### For Learning/Testing
1. **Cyclic** - Easiest, completely free
2. **Fly.io** - Free tier, good for learning
3. **Railway/Render** - Original options still good

### For Production (Small Business)
1. **DigitalOcean App Platform** - Reliable, simple
2. **Fly.io** - Scalable, global
3. **Hetzner VPS** - Cheapest, full control

### For Enterprise
1. **AWS Elastic Beanstalk** - Scalable, feature-rich
2. **Azure App Service** - Enterprise support
3. **Google Cloud Run** - Modern, serverless

### For Lowest Cost
1. **Hetzner VPS** - €4/month
2. **AWS Lightsail** - $3.50/month
3. **Fly.io Free Tier** - $0/month

---

## Migration Guide

### From Render/Railway to Fly.io

```bash
# 1. Download your database from Render/Railway
# (Use their shell or download feature)

# 2. Deploy to Fly.io
fly launch

# 3. Upload database
fly ssh console
# Then upload via scp or other method

# 4. Restart
fly deploy
```

### From Render/Railway to DigitalOcean

1. Create new app on DigitalOcean (follow steps above)
2. Download database from old platform
3. Upload to DigitalOcean using their console
4. Update DNS to point to new app

---

## Quick Decision Tree

```
Need free tier?
├─ Yes
│  ├─ Want easiest? → Cyclic
│  ├─ Want SQLite on disk? → Fly.io
│  └─ Learning/testing? → Render/Railway
│
└─ No (can pay)
   ├─ Production app? → DigitalOcean ($5/mo)
   ├─ Enterprise? → AWS/Azure
   └─ Lowest cost? → Hetzner VPS (€4/mo)
```

---

## Summary Table

| Platform | Setup Time | Monthly Cost | Difficulty | SQLite Support |
|----------|-----------|--------------|------------|----------------|
| Fly.io | 10 min | $0-5 | Medium | ✅ Excellent |
| DigitalOcean | 5 min | $5+ | Easy | ✅ Excellent |
| Cyclic | 2 min | $0-5 | Very Easy | ⚠️ S3-based |
| Koyeb | 5 min | $0-5 | Easy | ✅ Good |
| AWS Lightsail | 15 min | $3.50+ | Medium | ✅ Excellent |
| Hetzner VPS | 30 min | €4+ | Hard | ✅ Excellent |
| Vercel | 5 min | $0+ | Easy | ❌ Not suitable |

---

## Need Help Choosing?

**Answer these questions:**

1. **Budget?**
   - $0 → Fly.io or Cyclic
   - $5/mo → DigitalOcean
   - €4/mo → Hetzner VPS

2. **Technical level?**
   - Beginner → Cyclic or DigitalOcean
   - Intermediate → Fly.io or Render
   - Advanced → VPS or AWS

3. **Production or testing?**
   - Testing → Free tier (Cyclic, Fly.io)
   - Production → DigitalOcean or VPS

4. **Need support?**
   - Yes → DigitalOcean or AWS
   - No → VPS or Fly.io

---

**Questions?** Check the specific platform's documentation or ask for help setting up your preferred option!
