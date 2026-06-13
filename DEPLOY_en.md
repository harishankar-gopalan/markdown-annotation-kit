# Deploying Documentation to Vercel

## Option 1: Via the Vercel Dashboard (Recommended)

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import the project**
   - Click "Add New Project"
   - Select the `Keekuun/markdown-annotation-kit` repository
   - Vercel will automatically detect the project configuration

3. **Configure project settings (important)**
   - **Framework Preset**: select "Other" or "Vite"
   - **Root Directory**: leave blank (root directory)
   - **Build Command**: `pnpm run docs:build` ⚠️ **must be set manually**
   - **Output Directory**: `docs/.vitepress/dist` ⚠️ **must be set manually**
   - **Install Command**: `pnpm install`
   
   ⚠️ **Note**: Vercel may automatically detect the `build` script in `package.json` (used to build the library),
   but what we need is `docs:build` (used to build the documentation). **Be sure to manually override these settings in the Dashboard!**

4. **Environment variables** (if needed)
   - Typically no additional environment variables are required

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Option 2: Via the Vercel CLI

1. **Install the Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Log in to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Base Path Configuration

The currently configured `base` path is `/markdown-annotation-kit/`, which is suitable for:
- GitHub Pages deployment
- Vercel sub-path deployment

If deploying to a custom domain (e.g. `docs.yourdomain.com`), update `docs/.vitepress/config.ts`:

```typescript
base: "/", // change to root path
```

## Notes

1. **Ensure dependencies are installed before building**
   ```bash
   pnpm install
   ```

2. **Test the build locally**
   ```bash
   pnpm docs:build
   pnpm docs:preview
   ```

3. **Automatic deployment**
   - Pushing to the `main` branch will automatically trigger a deployment
   - Branch deployment rules can be configured in the Vercel Dashboard

4. **Custom domain**
   - Add a custom domain under Project Settings > Domains in the Vercel Dashboard

## Important: Fixing the Build Command

If Vercel is using the wrong build command (e.g. `pnpm run build` instead of `pnpm run docs:build`), follow these steps to fix it:

1. **Set it manually in the Vercel Dashboard**:
   - Go to the project's Settings > General
   - Find "Build & Development Settings"
   - Click the "Override" button
   - Set the following:
     - **Build Command**: `pnpm run docs:build`
     - **Output Directory**: `docs/.vitepress/dist`
   - Save the settings

2. **Redeploy**:
   - Go to the Deployments page and click on the latest deployment
   - Click the "Redeploy" button
   - Either "Use existing Build Cache" or "Redeploy" will work

## Troubleshooting

If you encounter a build error:

1. **Check the Node.js version**
   - Vercel uses Node.js 18.x by default
   - You can specify a version in `package.json`:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

2. **Check dependency installation**
   - Ensure `pnpm-lock.yaml` has been committed to the repository
   - Vercel will automatically use pnpm if a lockfile is detected

3. **Review the build logs**
   - View detailed build logs in the Vercel Dashboard