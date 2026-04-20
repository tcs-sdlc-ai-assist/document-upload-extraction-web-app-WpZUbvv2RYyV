# Deployment Guide

This document describes how to deploy **doc-upload-extract** (TypeScript + React + Vite) to production, including environment variables, Vercel configuration, and CI/CD notes.

---

## 1. Environment Variables

Set the following environment variables in your deployment environment (e.g., Vercel dashboard, `.env.production`):

| Variable Name                    | Description                                | Example Value                |
|----------------------------------|--------------------------------------------|------------------------------|
| `VITE_API_URL`                   | Base URL for backend API                   | `https://api.example.com`    |
| `VITE_FEATURE_FLAG_X` (optional) | Toggle for experimental features           | `true` or `false`            |

**Note:**  
- All environment variables used in the frontend must be prefixed with `VITE_` to be exposed to the client by Vite.
- Never commit secrets to the repository.

---

## 2. Vercel Deployment

### Automatic Deployments

- Pushes to `main` (or your default branch) will trigger automatic deployments if the repository is connected to Vercel.

### Manual Deployment

1. Go to [Vercel Dashboard](https://vercel.com/).
2. Import your Git repository.
3. Set the environment variables as described above in the "Environment Variables" section.
4. Vercel will detect the Vite + React project and use the following build settings:

   ```
   Build Command:   npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. Click "Deploy".

### Vercel Configuration

No `vercel.json` is required for standard Vite + React deployments.  
If you need custom rewrites or redirects, add a `vercel.json` file in the project root.

---

## 3. Local Production Build

To test the production build locally:

```bash
npm install
npm run build
npm run preview
```

- The app will be available at `http://localhost:4173` by default.

---

## 4. CI/CD Notes

- **Recommended:** Use GitHub Actions or Vercel's built-in CI for automated builds and deployments.
- All code must pass `tsc` (TypeScript compiler) and Vite build before deploying.
- Add a status badge to your README for build status (if using GitHub Actions).

**Sample GitHub Actions workflow (`.github/workflows/deploy.yml`):**

```yaml
name: Build & Test

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

---

## 5. Troubleshooting

- **Build fails on Vercel:**  
  - Ensure all required `VITE_` environment variables are set in the Vercel dashboard.
  - Check build logs for missing dependencies or type errors.

- **API requests fail in production:**  
  - Confirm `VITE_API_URL` is correct and accessible from the deployed frontend.

---

## 6. Additional Notes

- For custom domains, configure them in the Vercel dashboard.
- For backend/API deployments, refer to your backend's deployment documentation.
- For SSR or API routes, additional Vercel configuration may be required (not covered here).

---

**For questions or deployment issues, contact the project maintainer.**