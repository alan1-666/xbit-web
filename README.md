# Xbit App Web V2

This repository contains the web applications for the **Xbit** platform, including `futures-app` and `host-app`.  
Follow the steps below to install dependencies, serve, and build each app.

## Prerequisites
- **Node.js** (v22.4.0)
- **pnpm** package manager
- **Nx** CLI

Note: The current project’s legacy architecture uses Yarn as the package manager. Going forward, we will standardize on pnpm for dependency management.

## Installation
```bash
cd xbit-app-web-v2
pnpm install
cd apps/host
yarn install
```

## Development
```bash
nx serve futures-app
nx serve host-app

nx serve host-app --mode development
nx serve host-app --mode unstable
nx serve host-app --mode staging
nx serve host-app --mode prod

```

## Build
```bash
nx build futures-app
nx build host-app

nx build host-app --mode unstable
nx build host-app --mode staging
nx build host-app --mode prod

```

## Notes
Configure the host app to load sub-applications
```typescript
// host app vite.config.ts
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/host',
  server:{
    port: 4200,
    host: 'localhost',
    proxy: {
      '/assets/remoteEntry.js': 'http://localhost:4173'
    }
  },
  preview:{
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    federation({
      name: 'host',
      remotes: {
        futures: 'http://localhost:4173/dist/assets/remoteEntry.js' // 子应用服务地址
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['futures/Routes']
  }
}));
```

### Sub App Configuration
```typescript
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join, resolve } from 'path';
import federation from '@originjs/vite-plugin-federation';

console.log('public path', resolve(__dirname, 'src/assets'));

export default defineConfig(() => ({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'src/assets'),
  cacheDir: '../../node_modules/.vite/apps/futures',
  server:{
    port: 4173,
    host: 'localhost',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /\/assets\/.*/, to: (context) => context.parsedUrl.pathname }
      ]
    }
  },
  resolve: {
    alias: {
      '@xbit/design-system': join(__dirname, '../../libs/design-system/src')
    }
  },
  preview:{
    port: 4173,
    host: 'localhost',
  },
  plugins: [
    react(),
    federation({
      name: 'futures',
      filename: 'remoteEntry.js',
      exposes: {
        './Routes': './src/routes.tsx',
        './store': './src/store/index.ts'
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    assetsDir: 'assets',
    target: 'esnext',
    cssCodeSplit: false,
    minify: false,
    modulePreload: false,
    rollupOptions: {
      output: { 
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js'
      }
    }
  },
}));
```
