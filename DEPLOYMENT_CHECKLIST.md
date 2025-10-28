# Railway Deployment Checklist

Use this checklist before deploying to Railway.

## Pre-Deployment

- [ ] **Code pushed to GitHub**
  ```bash
  git add .
  git commit -m "Prepare for Railway deployment"
  git push origin main
  ```

- [ ] **Aiven MySQL service created**
  - Go to https://console.aiven.io
  - Create MySQL service
  - Note connection details (host, port, user, password, database)

- [ ] **Environment variables ready**
  - DB_HOST
  - DB_PORT (usually 3306)
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - DB_SSL=true
  - PORT (optional, Railway sets this)

## Railway Setup

- [ ] **Create Railway project**
  - Go to https://railway.app
  - New Project → Deploy from GitHub repo
  - Select your repository

- [ ] **Add environment variables**
  - Go to Variables tab
  - Add all DB credentials from Aiven
  - Add DB_SSL=true

- [ ] **Verify build settings**
  - Build command: `npm install && npm run migrate` (auto from railway.json)
  - Start command: `npm start` (auto from railway.json)

## Post-Deployment

- [ ] **Check deployment logs**
  - Look for "Database connection successful"
  - Verify migrations ran successfully
  - Check for any errors

- [ ] **Test endpoints**
  ```bash
  # Health check
  curl https://your-app.up.railway.app/health
  
  # Status (should return 0 countries initially)
  curl https://your-app.up.railway.app/status
  
  # Refresh cache
  curl -X POST https://your-app.up.railway.app/countries/refresh
  
  # Get countries
  curl https://your-app.up.railway.app/countries
  
  # Get Africa countries
  curl https://your-app.up.railway.app/countries?region=Africa
  
  # Get summary image
  curl https://your-app.up.railway.app/countries/image --output summary.png
  ```

- [ ] **Verify database has data**
  - Check Railway logs for successful refresh
  - Verify `/status` shows total_countries > 0

## Troubleshooting

### Database Connection Issues
- Verify Aiven service is running (check Aiven console)
- Check environment variables are correct
- Ensure DB_SSL=true is set
- Check Railway logs for specific error

### Migration Issues
- Verify database exists in Aiven
- Check Aiven user has proper permissions
- Review Railway build logs

### App Crashes
- Check Railway logs for error messages
- Verify all required environment variables are set
- Ensure Node version is 18+ (set in package.json engines)

### 503 Errors on Refresh
- External APIs might be down/rate limited
- Check Railway logs for detailed error
- Try again after a few minutes

## Final Checks

- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Status endpoint works
- [ ] Refresh endpoint works and populates data
- [ ] Countries endpoint returns data with filters
- [ ] Image endpoint serves PNG
- [ ] All environment variables confirmed in Railway dashboard
- [ ] Domain/URL noted for submission

## Submission Ready

**Your API Base URL:** `https://your-app.up.railway.app`
**GitHub Repo:** `https://github.com/yourusername/HNG_TASK_2`

✅ Ready to submit via `/stage-two-backend` in Slack!
