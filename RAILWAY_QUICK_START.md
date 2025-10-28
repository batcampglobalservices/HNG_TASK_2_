# 🚀 Railway Deployment - Quick Reference

## Files Added for Railway Deployment

### Configuration Files
- ✅ `railway.json` - Railway build & deployment configuration
- ✅ `nixpacks.toml` - Nixpacks build settings
- ✅ `Procfile` - Process configuration (Heroku-compatible)
- ✅ `.gitignore` - Excludes node_modules, .env, cache, logs
- ✅ `.env.example` - Template for environment variables
- ✅ `start.sh` - Startup script (optional)

### Documentation
- ✅ `RAILWAY_DEPLOYMENT.md` - Complete step-by-step deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Pre/post deployment checklist
- ✅ `README.md` - Updated with Railway instructions

## Environment Variables for Railway

Copy these to Railway's Variables section:

```env
DB_HOST=mysql-xxxxx-yourproject.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=defaultdb
DB_SSL=true
NODE_ENV=production
```

**Get Aiven credentials from:** https://console.aiven.io → Your MySQL Service → Overview

## Automatic Railway Configuration

Railway will automatically:
1. ✅ Detect Node.js project (from package.json)
2. ✅ Install dependencies (`npm install`)
3. ✅ Run migrations (`npm run migrate` - via railway.json)
4. ✅ Start server (`npm start`)
5. ✅ Assign a public URL
6. ✅ Enable auto-deploy on git push
7. ✅ Provide health checks & monitoring

## Build Process

```
1. Railway clones your GitHub repo
   ↓
2. Runs: npm install
   ↓
3. Runs: npm run migrate (creates tables)
   ↓
4. Runs: npm start (starts Express server)
   ↓
5. Health check: /health endpoint
   ↓
6. Deployment live! 🎉
```

## Quick Deploy Steps

### 1. Aiven Setup (5 minutes)
```
1. Go to https://aiven.io
2. Sign up (free tier available)
3. Create MySQL service
4. Wait for service to start
5. Copy connection details
```

### 2. Railway Setup (3 minutes)
```
1. Go to https://railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub
4. Select your repo: HNG_TASK_2
5. Add environment variables (paste Aiven credentials)
6. Deploy automatically starts
```

### 3. Verify (2 minutes)
```bash
# Railway gives you a URL like: https://yourapp.up.railway.app

# Test health
curl https://yourapp.up.railway.app/health

# Check status
curl https://yourapp.up.railway.app/status

# Refresh data
curl -X POST https://yourapp.up.railway.app/countries/refresh

# Get countries
curl https://yourapp.up.railway.app/countries?region=Africa
```

## Monitoring

**Railway Dashboard:**
- 📊 Metrics - CPU, Memory, Network usage
- 📝 Logs - Real-time application logs
- 🔄 Deployments - History and rollback
- ⚙️ Settings - Domain, environment, etc.

**View Logs:**
```bash
# Via Railway CLI
railway logs --follow

# Or in Dashboard → Deployments → View Logs
```

## Troubleshooting

### "Database connection failed"
- ✅ Verify Aiven service is running (green status in Aiven console)
- ✅ Check DB_HOST, DB_USER, DB_PASSWORD in Railway variables
- ✅ Ensure DB_SSL=true is set
- ✅ Confirm database name matches DB_NAME

### "Migrations failed"
- ✅ Check Railway build logs for error details
- ✅ Verify Aiven user has CREATE/ALTER permissions
- ✅ Ensure database exists (check Aiven console)

### "External API timeout (503)"
- ✅ Normal on first refresh if APIs are slow
- ✅ Wait 30 seconds and try again
- ✅ Check Railway logs for specific error

### "Build failed"
- ✅ Verify package.json is committed
- ✅ Check Node version in engines (should be >=18)
- ✅ Review build logs in Railway dashboard

## Cost

**Aiven MySQL:**
- Free tier: Shared resources, good for testing
- Paid: From $8/month

**Railway:**
- Hobby: $5/month (includes $5 usage credit)
- Free tier: Available with limitations

**Total: Can start FREE for testing! 💰**

## Next Steps After Deployment

1. ✅ Test all endpoints thoroughly
2. ✅ Run POST /countries/refresh to populate data
3. ✅ Verify image generation works
4. ✅ Test filters and sorting
5. ✅ Note your Railway URL
6. ✅ Submit via Slack: `/stage-two-backend`

## Support Resources

- 📖 Railway Docs: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway
- 📧 Aiven Support: https://aiven.io/support
- 🐛 GitHub Issues: Create in your repo

## Submission Format

When ready, use `/stage-two-backend` in Slack stage-2-backend channel:

```
API Base URL: https://yourapp.up.railway.app
GitHub Repo: https://github.com/batcampglobalservices/HNG_TASK_2
Full Name: Your Name
Email: your.email@example.com
Stack: Express + MySQL (Aiven) + Knex
```

---

**🎯 You're all set for Railway deployment!**

Need help? Check:
- `RAILWAY_DEPLOYMENT.md` for detailed guide
- `DEPLOYMENT_CHECKLIST.md` for step-by-step checklist
- `README.md` for API documentation
