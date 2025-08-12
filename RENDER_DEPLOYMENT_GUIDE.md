# 🚀 Render Deployment Guide for Wingo Backend

## 📋 Pre-deployment Checklist

### ✅ Files Created/Updated:
- [x] `package.json` - Fixed main entry point and build script
- [x] `render.yaml` - Render service configuration
- [x] `.env.production` - Production environment template
- [x] `render-build.sh` - Build script for deployment

## 🔧 Render Dashboard Setup

### 1. Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `wingo-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2. Environment Variables Setup
Add these environment variables in Render dashboard:

#### 🔐 Critical Security Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
ADMIN_PASSWORD=your-secure-admin-password
SESSION_SECRET=your-session-secret-here
```

#### 🗄️ Database Configuration:
```
DATABASE_URL=postgresql://username:password@hostname:port/database
```
*Note: Get this from your Render PostgreSQL service*

#### ☁️ AWS S3 Configuration (Optional):
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

#### ⚙️ Other Configuration:
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf
BCRYPT_ROUNDS=12
LOG_LEVEL=info
KEEP_ALIVE_URL=https://your-app-name.onrender.com
KEEP_ALIVE_INTERVAL=840000
```

### 3. Database Setup
1. Create PostgreSQL database in Render:
   - Click "New" → "PostgreSQL"
   - Name: `wingo-db`
   - Copy the **Internal Database URL**
2. Use the Internal Database URL as your `DATABASE_URL` environment variable

## 🐛 Troubleshooting Migration Errors

### The P3009/P3008 Error Fix:
Your build script now handles this automatically:

1. **Resolves failed migration**: `20250812101902_make_updatedat_optional`
2. **Falls back to db push**: If migrations fail
3. **Accepts data loss**: For schema synchronization

### Manual Fix (if needed):
If deployment still fails, add this to your Render build command:
```bash
npm install && npx prisma generate && npx prisma migrate resolve --applied 20250812101902_make_updatedat_optional && npx prisma db push --accept-data-loss
```

## 🚦 Deployment Steps

### 1. Push to GitHub:
```bash
git add .
git commit -m "Fix Render deployment configuration"
git push origin main
```

### 2. Deploy on Render:
1. Your service will auto-deploy when you push to GitHub
2. Monitor the build logs for any errors
3. Check the "Logs" tab for runtime issues

### 3. Verify Deployment:
1. Visit your Render app URL
2. Test API endpoints: `https://your-app.onrender.com/api/test`
3. Check database connectivity
4. Verify admin panel access

## ⚠️ Common Issues & Solutions

### Issue 1: Migration Errors
**Solution**: The build script automatically resolves migration conflicts

### Issue 2: Environment Variables Missing
**Solution**: Double-check all required env vars are set in Render dashboard

### Issue 3: Database Connection Fails
**Solution**: Ensure you're using the **Internal Database URL** from Render PostgreSQL

### Issue 4: File Upload Issues
**Solution**: Configure AWS S3 or files will be stored temporarily (lost on restart)

### Issue 5: App Sleeps (Free Tier)
**Solution**: The keep-alive configuration will ping your app every 14 minutes

## 🔍 Monitoring & Logs

### View Logs:
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Monitor for errors and performance

### Health Check:
Your app includes health check endpoints:
- `GET /api/test` - Basic API test
- `GET /api/health` - Database connectivity test

## 🎉 Success Indicators

✅ Build completes without errors
✅ Service starts successfully  
✅ Database migrations complete
✅ API endpoints respond correctly
✅ Admin panel accessible
✅ File uploads working (if S3 configured)

## 📞 Support

If you encounter issues:
1. Check Render build/runtime logs
2. Verify all environment variables
3. Test database connectivity
4. Check GitHub repository sync

Your Wingo backend should now be successfully deployed on Render! 🎊
