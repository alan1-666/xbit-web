import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { analyzer } from 'vite-bundle-analyzer'
import inject from '@rollup/plugin-inject'
// import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import pluginSEO from './plugins/plugin-seo.ts'
import vitePluginAASALegacyAuto from './plugins/vitePluginAASA.ts'
import vitePluginAssetLinksAuto from './plugins/vitePluginAssetLink.ts'
import svgr from '@svgr/rollup'
// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isLocalDev = command === 'serve'

  const isProd = mode === 'prod'

  const env = loadEnv(mode, path.resolve(__dirname), '')
  const localHypertraderTarget = env.VITE_LOCAL_HYPERTRADER_PROXY_TARGET || 'http://127.0.0.1:8086'
  let coinCdnOrigin = 'https://unstable-cdn.xbit.live'
  try {
    coinCdnOrigin = new URL(env.VITE_FUTURES_COINS_ICON || 'https://unstable-cdn.xbit.live/coins').origin
  } catch {
    /* keep default */
  }

  return {
    plugins: [
      react(),
      svgr({
        exportType: 'named',
        icon: true,
        // svgo: true,
      }),
      tailwindcss(),
      ...(isLocalDev
        ? [
            analyzer({
              analyzerPort: 8686,
            }),
          ]
        : []),
      // firebaseSwEnvLoader(),
      pluginSEO(),
      vitePluginAASALegacyAuto(),
      vitePluginAssetLinksAuto(),
      nodePolyfills(),
      // nodeModulesPolyfillPlugin({
      //   globals: {
      //     Buffer: true,
      //   },
      // }),
    ],
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@redux': path.resolve(__dirname, './src/redux'),
        '@services': path.resolve(__dirname, './src/services'),
        '@const': path.resolve(__dirname, './src/const'),
        '@i18n': path.resolve(__dirname, './src/18n'),
        '@generated': path.resolve(__dirname, './src/@generated'),
      },
    },
    build: {
      target: 'esnext',
      manifest: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          onchainSigning: path.resolve(__dirname, 'onchain-signing.html'),
        },
        plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
        output: {
          entryFileNames: 'xbitAssets/[name].[hash].js',
          chunkFileNames: 'xbitAssets/[name].[hash].js',
          assetFileNames: 'xbitAssets/[name].[hash].[ext]',
        },
      },
      minify: 'terser',
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }
        : {},
    },

    optimizeDeps: {
      // include: ['esm-dep > cjs-dep'],
      force: true,
    },
    server: {
      historyApiFallback: true,
      proxy: {
        '/api/gamma': {
          target: 'https://gamma-api.polymarket.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gamma/, ''),
        },
        '/api/data': {
          target: 'https://data-api.polymarket.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/data/, ''),
        },
        '/api/profile': {
          target: 'https://polymarket.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/profile/, '/api/profile'),
        },
        '/api/pnl': {
          target: 'https://user-pnl-api.polymarket.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/pnl/, ''),
        },
        '/api/graphql-dex': {
          target: localHypertraderTarget,
          changeOrigin: true,
        },
        '/api/dex-hypertrader/graphql': {
          target: localHypertraderTarget,
          changeOrigin: true,
        },
        '/api/user/user-gql': {
          target: localHypertraderTarget,
          changeOrigin: true,
        },
        '/v1/futures': {
          target: localHypertraderTarget,
          changeOrigin: true,
        },
        // 与 getFuturesCoinIconSrc 同源 /coins 一致，本地开发转发到 CDN，避免导出跨域
        '/coins': {
          target: coinCdnOrigin,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
