/**
 * 期货币种图标 URL（分享海报等场景）。
 *
 * - **本地 `vite dev`**：`html-to-image` 需同源才能稳定导出，故在「页面域 ≠ CDN 域」时使用
 *   `/coins/{COIN}.svg`，由 `vite.config` 的 `/coins` 代理到 CDN。
 * - **生产构建**：使用 `VITE_FUTURES_COINS_ICON` 的完整 CDN 地址，避免依赖线上网关是否配置 `/coins` 反代。
 *
 * 若需强制同源路径（例如线上已配置反代且希望导出也可用）：设置 `VITE_FUTURES_COINS_ICON_PUBLIC_PATH`。
 */
function getFuturesCoinCdnBase(): string {
  const v = import.meta.env.VITE_FUTURES_COINS_ICON as string | undefined
  if (v != null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '')
  }
  const mode = import.meta.env.MODE
  if (mode === 'staging') return 'https://staging-cdn.xbit.live/coins'
  if (mode === 'prod' || mode === 'production') return 'https://cdn.xbit.com/coins'
  return 'https://unstable-cdn.xbit.live/coins'
}

export function getFuturesCoinIconSrc(coin: string | undefined): string {
  const c = (coin ?? '').trim()
  if (!c) return '/images/logoweb.png'

  const explicit = import.meta.env.VITE_FUTURES_COINS_ICON_PUBLIC_PATH as string | undefined
  if (explicit != null && String(explicit).length > 0) {
    return `${String(explicit).replace(/\/$/, '')}/${c}.svg`
  }

  const normalized = getFuturesCoinCdnBase()

  // 仅开发时走同源 /coins，配合 Vite proxy；生产包走下方完整 CDN URL
  if (import.meta.env.DEV) {
    try {
      const cdnOrigin = new URL(normalized).origin
      const pageOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      if (!pageOrigin || cdnOrigin !== pageOrigin) {
        return `/coins/${c}.svg`
      }
    } catch {
      /* empty */
    }
  }

  return `${normalized}/${c}.svg`
}
