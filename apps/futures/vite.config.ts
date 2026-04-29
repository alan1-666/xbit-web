/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join, resolve } from 'path';
import federation from '@originjs/vite-plugin-federation';

console.log('public path', resolve(__dirname, 'src/assets'))

export default defineConfig(() => ({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'src/assets'), // 明确指定静态资源目录
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
        { from: /\/assets\/.*/, to: (context) => context.parsedUrl.pathname } // 不处理assets路径
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
    minify: false, // 调试时建议关闭
    modulePreload: false, // 禁用预加载避免冲突
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js'
      }
    }
  },
}));
