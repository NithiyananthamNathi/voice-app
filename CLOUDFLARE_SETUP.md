# Cloudflare Pages Deployment - Quick Start Guide

## Step-by-Step Setup (5 Minutes)

### 1. Prerequisites
✅ GitHub repository: `NithiyananthamNathi/voice-app` (Already set up!)
✅ Cloudflare account (Free tier available)

### 2. Deploy to Cloudflare Pages

#### Option A: Using Cloudflare Dashboard (Easiest)

1. **Go to Cloudflare Pages**
   - Visit: https://pages.cloudflare.com
   - Sign in or create a free account

2. **Create New Project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose "GitHub" and authorize Cloudflare

3. **Select Repository**
   - Find and select: `NithiyananthamNathi/voice-app`
   - Click "Begin setup"

4. **Configure Build Settings**
   ```
   Project name: voice-app (or your preferred name)
   Production branch: main
   Framework preset: Next.js
   Build command: pnpm run build
   Build output directory: .next
   Root directory: (leave empty)
   ```

5. **Environment Variables**
   Click "Add variable" for each:
   ```
   NODE_VERSION = 18
   NEXTAUTH_SECRET = <run: openssl rand -base64 32>
   NEXTAUTH_URL = https://your-project.pages.dev
   ```
   
   > **Note**: After first deployment, update `NEXTAUTH_URL` with your actual Cloudflare Pages URL

6. **Deploy**
   - Click "Save and Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live! 🎉

#### Option B: Using Wrangler CLI (Advanced)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy .next --project-name=voice-app
```

### 3. Your Live URLs

After deployment, you'll get:
- **Production**: `https://voice-app.pages.dev`
- **Custom domain**: Can be added in project settings

### 4. Automatic Deployments

Now configured! Every time you push to GitHub:

```bash
git add .
git commit -m "your changes"
git push
```

Cloudflare automatically:
1. Detects the push
2. Builds your app
3. Deploys to global CDN
4. Provides preview URL for branches/PRs

### 5. Monitor Your Deployments

- **View deployments**: Cloudflare Dashboard → Workers & Pages → voice-app
- **Check logs**: Click any deployment to see build logs
- **Analytics**: Built-in Web Analytics (enable in settings)

## Configuration Files

The following files have been added to optimize Cloudflare Pages deployment:

- `.node-version` - Specifies Node.js 18 for builds
- `vercel.json` - Also works for other platforms (can be kept)

## Environment Variables Setup

### Generate NEXTAUTH_SECRET

On Linux/Mac:
```bash
openssl rand -base64 32
```

On Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))
```

### Update After First Deploy

1. Note your actual Cloudflare Pages URL (e.g., `https://voice-app-abc.pages.dev`)
2. Go to Project Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual URL
4. Redeploy (Settings → Deployments → Retry deployment)

## Custom Domain Setup

1. In Cloudflare Pages, go to your project
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `app.yourdomain.com`)
5. Follow DNS configuration steps:
   - Add CNAME record: `app` → `voice-app.pages.dev`
6. Wait for SSL certificate (automatic, ~5 minutes)
7. Done! Your app is now at your custom domain 🎉

## Performance Features

Cloudflare Pages automatically provides:

- ✅ Global CDN (300+ cities worldwide)
- ✅ Automatic HTTPS/SSL
- ✅ DDoS protection
- ✅ Web Application Firewall (WAF)
- ✅ Automatic cache invalidation
- ✅ Instant rollbacks
- ✅ Real-time analytics
- ✅ Preview deployments for all branches

## Free Tier Limits

Cloudflare Pages Free tier includes:
- ✅ Unlimited sites
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ 1 build at a time

This is more than enough for most projects!

## Troubleshooting

### Build Fails

**Problem**: Build fails with Node.js version error
**Solution**: Ensure `.node-version` file exists with value `18`

**Problem**: "Module not found" errors
**Solution**: Check that all dependencies are in `package.json`, not just `devDependencies`

### Runtime Errors

**Problem**: Authentication not working
**Solution**: 
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your actual domain
3. Redeploy after updating environment variables

**Problem**: API routes returning 404
**Solution**: Ensure Next.js API routes are in `src/app/api/` directory

### Deployment Doesn't Trigger

**Problem**: Pushing to GitHub but no deployment
**Solution**:
1. Check Cloudflare Pages dashboard for build queue
2. Verify GitHub integration is still authorized
3. Check branch name matches production branch setting

## Support & Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Community Forum**: https://community.cloudflare.com/c/developers/pages/

## Next Steps

1. ✅ Deploy to Cloudflare Pages (follow steps above)
2. ✅ Update `NEXTAUTH_URL` with your actual URL
3. ✅ Test authentication and core features
4. ✅ (Optional) Set up custom domain
5. ✅ (Optional) Enable Web Analytics
6. ✅ Share your app URL! 🚀

Your app will be live at: `https://voice-app-[random].pages.dev`

Happy deploying! 🎉
