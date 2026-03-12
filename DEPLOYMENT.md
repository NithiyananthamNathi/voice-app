# Deployment Guide

This guide will help you deploy your Voice AI Conversation Intelligence Platform with automatic deployments from GitHub.

## Quick Setup with Cloudflare Pages (Recommended)

Cloudflare Pages offers exceptional global performance with their CDN, generous free tier, and seamless GitHub integration. Perfect for Next.js applications with automatic deployments.

### Step 1: Create a Cloudflare Account

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Click "Sign Up" (or use your existing Cloudflare account)
3. Complete the account setup

### Step 2: Connect Your GitHub Repository

1. From the Cloudflare Dashboard, navigate to "Workers & Pages"
2. Click "Create Application" → "Pages" → "Connect to Git"
3. Authorize Cloudflare to access your GitHub account
4. Select the `voice-app` repository
5. Click "Begin setup"

### Step 3: Configure Build Settings

Configure your project with these settings:

- **Production branch**: `main`
- **Framework preset**: Select "Next.js (Static HTML Export)" or "Next.js"
- **Build command**: `pnpm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (leave empty)
- **Node version**: `18` or `20` (set via NODE_VERSION env var)

### Step 4: Add Environment Variables

Click "Add environment variables" and add:

```
NODE_VERSION=18
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-project.pages.dev
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 5: Deploy

1. Click "Save and Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at: `https://your-project-name.pages.dev`

## Automatic Deployments with Cloudflare

Once connected, **automatic deployments are enabled**:

- ✅ **Push to main branch** → Automatic production deployment
- ✅ **Push to other branches** → Automatic preview deployments
- ✅ **Pull requests** → Automatic preview deployments with unique URLs

Every push to GitHub triggers:
1. Automatic build on Cloudflare's global network
2. Deploy to Cloudflare's edge servers worldwide
3. Instant cache invalidation
4. Real-time deployment status

## Custom Domain (Optional)

1. In Cloudflare Pages, go to your project
2. Navigate to "Custom domains"
3. Click "Set up a custom domain"
4. Follow the DNS configuration instructions

---

## Alternative: Deploy with Vercel

Vercel is another excellent option, built by the creators of Next.js.

---

## Alternative: Deploy with Vercel

Vercel is another excellent option, built by the creators of Next.js.

### Step 1: Create a Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### Step 2: Import Your Repository

1. Once logged in, click "Add New Project"
2. Select "Import Git Repository"
3. Find and select your `voice-app` repository from the list
4. Click "Import"

### Step 3: Configure Your Project

Vercel will automatically detect that this is a Next.js project. You'll need to:

1. **Framework Preset**: Should be auto-detected as "Next.js"
2. **Root Directory**: Leave as `.` (root)
3. **Build Command**: `pnpm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `pnpm install` (auto-detected)

### Step 4: Add Environment Variables

Click on "Environment Variables" and add the following required variables:

```
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

To generate a secure `NEXTAUTH_SECRET`, run this command:
```bash
openssl rand -base64 32
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait for the deployment to complete (usually 2-3 minutes)
3. Once done, you'll get a production URL like: `https://voice-app-xxx.vercel.app`

## Automatic Deployments

Now that your project is connected to Vercel, **automatic deployments are enabled**:

- ✅ **Push to main branch** → Automatic production deployment
- ✅ **Push to other branches** → Automatic preview deployment
- ✅ **Pull requests** → Automatic preview deployments with unique URLs

Every time you push code to GitHub, Vercel will automatically:
1. Detect the changes
2. Build your application
3. Deploy it to a URL
4. Run health checks

## Development Environment URL

After deployment, you'll have:

- **Production URL**: `https://your-app-name.vercel.app` (from main branch)
- **Preview URLs**: Unique URLs for each branch and PR

## Managing Your Deployment

### View Deployments
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Select your project to see all deployments

### View Deployment Logs
- Click on any deployment
- View build logs, function logs, and runtime logs

### Update Environment Variables
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add, edit, or remove variables
4. Redeploy for changes to take effect

## Alternative: Deploy with Railway

If you prefer Railway:

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Railway will auto-deploy on every push

## Alternative: Deploy with Netlify

For Netlify:

1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure build settings:
   - Build command: `pnpm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy

## Post-Deployment Checklist

After deployment, make sure to:

- ✅ Test the production URL
- ✅ Verify authentication works
- ✅ Check that API routes are functioning
- ✅ Test file uploads
- ✅ Verify database connections (if applicable)
- ✅ Monitor the application logs

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly

### Runtime Errors
- Check Function logs in Vercel dashboard
- Verify API routes are working
- Check external service connections

### Environment Variables Not Working
- Redeploy after adding new variables
- Check variable names match your code exactly
- Ensure sensitive values are properly set

## GitHub Repository

Your code is now at: https://github.com/NithiyananthamNathi/voice-app

## Next Steps

1. Complete the Vercel setup above
2. Test your production deployment
3. Share your app URL with users
4. Monitor deployments in Vercel dashboard

Happy deploying! 🚀
