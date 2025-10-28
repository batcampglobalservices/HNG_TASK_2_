# Railway Deployment Guide

This guide walks you through deploying the Country Currency & Exchange API to Railway with Aiven MySQL.

## Prerequisites

1. **GitHub account** with your code pushed to a repository
2. **Railway account** - Sign up at https://railway.app
3. **Aiven account** with a MySQL service - Sign up at https://aiven.io

## Step 1: Set up Aiven MySQL

1. Go to https://console.aiven.io
2. Click **Create Service**
3. Select **MySQL**
4. Choose a cloud provider and region (pick one close to your Railway deployment)
5. Select a plan (Free tier available)
6. Name your service (e.g., `countries-db`)
7. Click **Create Service**
8. Wait for the service to start (takes 2-3 minutes)
9. Once running, go to the **Overview** tab and note:
   - Service URI (or individual: Host, Port, User, Password, Database)

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway to access your GitHub account
5. Select your repository (e.g., `HNG_TASK_2`)
6. Railway will automatically detect it's a Node.js app

### Option B: Deploy using Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Step 3: Configure Environment Variables

In your Railway project dashboard:

1. Go to your service
2. Click **Variables** tab
3. Click **+ New Variable** and add each of these:

```
PORT=3000
DB_HOST=mysql-xxxxx-yourproject.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password_here
DB_NAME=defaultdb
DB_SSL=true
NODE_ENV=production
```

**Get these values from your Aiven console** → Service Overview → Connection Information

### Quick Add (Raw Editor)

Click **RAW Editor** and paste:

```
PORT=3000
DB_HOST=mysql-xxxxx-yourproject.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password_here
DB_NAME=defaultdb
DB_SSL=true
NODE_ENV=production
```

## Step 4: Run Migrations

Railway will automatically run migrations during build (configured in `railway.json`).

If you need to run migrations manually:

1. Go to your Railway service
2. Click **Deployments** tab
3. Find the latest deployment
4. Click the **three dots** → **View Logs**
5. Verify migrations ran successfully

Or use Railway CLI:

```bash
railway run npm run migrate
```

## Step 5: Verify Deployment

1. Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)
2. Test the health endpoint:

```bash
curl https://your-app.up.railway.app/health
```

3. Refresh the cache:

```bash
curl -X POST https://your-app.up.railway.app/countries/refresh
```

4. Fetch countries:

```bash
curl https://your-app.up.railway.app/countries?region=Africa
```

## Step 6: Monitor & Troubleshoot

### View Logs

- Railway Dashboard → Your Service → **Deployments** → Click deployment → **View Logs**

### Common Issues

**Database connection fails:**
- Verify Aiven service is running
- Check environment variables are correct
- Ensure `DB_SSL=true` is set
- Verify Aiven allows connections from Railway (Aiven allows all IPs by default)

**Migrations fail:**
- Check database credentials
- Verify database exists
- Check logs for specific error

**App crashes on start:**
- Check logs for error messages
- Verify all environment variables are set
- Ensure Node version matches (18+)

## Step 7: Custom Domain (Optional)

1. In Railway Dashboard → Settings → Domains
2. Click **+ Generate Domain** for a custom Railway subdomain
3. Or add your own custom domain

## Environment Variables Reference

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3000` | No | Port (Railway sets this automatically) |
| `DB_HOST` | `mysql-xxx.aivencloud.com` | Yes | Aiven MySQL host |
| `DB_PORT` | `3306` | Yes | MySQL port |
| `DB_USER` | `avnadmin` | Yes | Aiven MySQL username |
| `DB_PASSWORD` | `your_password` | Yes | Aiven MySQL password |
| `DB_NAME` | `defaultdb` | Yes | Database name |
| `DB_SSL` | `true` | Yes | Enable SSL (required for Aiven) |
| `NODE_ENV` | `production` | No | Environment mode |

## Railway Features Used

- **Automatic deployments** from GitHub (push to main → auto deploy)
- **Build command**: `npm install && npm run migrate` (via `railway.json`)
- **Start command**: `npm start`
- **Health checks**: Railway monitors your app
- **Auto-restart**: On failure (configured in `railway.json`)

## Cost Estimates

- **Railway**: $5/month for Hobby plan (includes $5 credit) - Free tier available
- **Aiven MySQL**: Free tier available (limited resources)

## Useful Commands

```bash
# View logs
railway logs

# Run migrations manually
railway run npm run migrate

# Open app in browser
railway open

# SSH into container
railway shell

# Link to existing project
railway link
```

## Next Steps

1. Set up **monitoring** (Railway provides basic metrics)
2. Configure **custom domain** if needed
3. Set up **GitHub Actions** for CI/CD (optional)
4. Enable **auto-deploy** from main branch

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Aiven Support: https://aiven.io/support

---

**Your API should now be live!** 🚀

Test it at: `https://your-app.up.railway.app`
