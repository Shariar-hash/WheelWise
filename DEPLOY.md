# 🚀 WheelWise Deployment Guide

## Step-by-Step Vercel Deployment

### Step 1: Go to Vercel
1. Visit: **https://vercel.com**
2. Sign in with GitHub
3. Authorize Vercel to access your repositories

---

### Step 2: Import Your Project
1. Click **"Add New Project"**
2. Find and select **"WheellWise"**
3. Click **"Import"**

---

### Step 3: Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Framework**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

### Step 4: Add Environment Variables

⚠️ **IMPORTANT**: Get these values from your local `.env` file

Click **"Environment Variables"** and add:

#### DATABASE_URL
```
Copy from your .env file - the full Neon PostgreSQL connection string
```

#### DIRECT_URL  
```
Copy from your .env file - the direct Neon connection string
```

#### NEXTAUTH_SECRET
```
Copy from your .env file - your authentication secret
```

#### NEXTAUTH_URL
```
https://your-app-name.vercel.app
```
*Leave blank initially - update after first deployment*

#### NEXT_PUBLIC_API_URL
```
https://your-app-name.vercel.app/api
```
*Leave blank initially - update after first deployment*

---

### Step 5: Deploy
1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. You'll get a production URL like: `https://wheellwise-xyz.vercel.app`

---

### Step 6: Update Environment Variables

**IMPORTANT**: After first deployment, update these:

1. Go to: **Project Settings** → **Environment Variables**
2. Edit **NEXTAUTH_URL**: Use your actual Vercel URL
3. Edit **NEXT_PUBLIC_API_URL**: Add `/api` to your Vercel URL
4. Click **"Redeploy"** from the Deployments tab

---

## 🧪 Testing Your Deployment

1. **Homepage**: Visit your Vercel URL
2. **Create Room**: Test room creation with a name
3. **Join Room**: Open incognito, join with the room code
4. **Test Chat**: Send messages from both browsers
5. **Test Wheel**: Owner adjusts weights and spins
6. **Verify Sync**: All users should see changes in real-time

---

## ✅ Deployment Checklist

- [ ] Pushed all code to GitHub
- [ ] Imported project in Vercel
- [ ] Added all 5 environment variables
- [ ] First deployment successful
- [ ] Updated NEXTAUTH_URL with actual URL
- [ ] Updated NEXT_PUBLIC_API_URL with actual URL
- [ ] Redeployed after URL updates
- [ ] Tested all features in production

---

## 🔧 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Ensure DATABASE_URL is correct and accessible

### Socket.IO Issues  
- Check browser console for errors
- Verify NEXT_PUBLIC_API_URL is correct
- Hard refresh browser (Ctrl+Shift+R)

### Connection Errors
- Wait 30 seconds after deployment
- Clear browser cache
- Try incognito mode

---

**Production deployment will fix all the Socket.IO connection issues you experienced in development!** 🎉
