import type { Plugin } from 'vite'
import { SitemapStream, streamToPromise } from 'sitemap'
import { createWriteStream, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { resolve, join, dirname } from 'path'
import fetchOrig, { type RequestInit as NFRequestInit } from 'node-fetch'

/* =========================
 *  ENV / CONSTANTS
 * ========================= */
function getEnvFilePath(): string {
  const envName = process.env.CI_ENVIRONMENT || process.env.VITE_STAGE || 'development'
  console.log('envName', envName)
  const envFileMap: Record<string, string> = {
    unstable: '.env.unstable',
    staging: '.env.staging',
    production: '.env.prod',
    prod: '.env.prod',
    development: '.env.development',
  }
  const fileName = envFileMap[envName] || '.env'
  return resolve(__dirname, `../${fileName}`)
}

function loadEnvFromFile(filePath: string): Record<string, string> {
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const map: Record<string, string> = {}
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) return
      const k = trimmed.slice(0, eqIdx).trim()
      const v = trimmed.slice(eqIdx + 1).trim()
      if (k) map[k] = v
    })
    return map
  } catch {
    return {}
  }
}

const ENV_FILE_PATH = getEnvFilePath()
const ENV_FILE_VARS = loadEnvFromFile(ENV_FILE_PATH)

function envOrFile(key: string, fallback?: string): string | undefined {
  return ENV_FILE_VARS[key] ?? process.env[key] ?? fallback
}

const SITE_ORIGIN = envOrFile('VITE_APP_DOMAIN', 'https://unstable.xbit.live') as string
const VITE_GRAPHQL_MEME2_URL = (envOrFile('VITE_GRAPHQL_MEME2_URL', 'https://api.xbit.com/api/meme2/meme-gql') ||
  'https://api.xbit.com/api/meme2/meme-gql') as string
const VITE_STAGE = ((envOrFile('VITE_STAGE', 'unstable') || 'unstable') as string).toLowerCase()
const BRAND_NAME = 'KairoX'

// Optional: allowlist for non-prod robots
const NON_PROD_ALLOWLIST: string[] = []

const STATIC_PATHS = [
  '/meme/discover',
  '/meme/smart-money',
  '/meme/monitoring',
  '/assets',
  '/meme/settings/system',
  '/meme/settings/about-us',
  '/privacy-policy',
  '/terms-of-use',
  '/tokenByCategories/discover',
  '/tokenByCategories/assets',
  '/futures/discover',
] as const

type ChainSlug = 'sol' | 'bsc'
const CHAINS = [
  { gql: 'SOLANA', id: 501424, slug: 'sol' as ChainSlug },
  { gql: 'BSC', id: 56, slug: 'bsc' as ChainSlug },
] as const

const PAGES = [1, 2, 3, 4, 5] as const

/* =========================
 *  GQL QUERIES
 * ========================= */
const GQL_GET_TOKEN_TRENDING = `
query GetTokenTrending($input: TokenTrendingInput!) {
  getTokenTrending(input: $input) {
    data {
      token
      price
      marketcap
      volume24h
      symbol
    }
  }
}
`

const GQL_GET_TOP_TRADERS = `
query rankTraders($input: SmartMoneyFilterInput!) {
  rank(filter: $input) {
    address
    pnl7d
  }
}
`

const GQL_GET_tokenByCategories = `
query getTokenByCategory($input: TokensByCategoryInput!) {
  tokensByCategory(input: $input) {
    data {
      address
      marketCap
      volume24h
      price24hChange
      chainId
      name
      logoUrl
      price
      symbol
    }
  }
}
`

const GQL_GET_ALL_CATEGORIES = `
query GetAllCategories($input: AllCategoriesInput!){
  getAllCategories(input: $input){
    data {
      categoryId
    }
  }
}
`

/* =========================
 *  FETCH WRAPPER
 * ========================= */
const fetch = fetchOrig as unknown as typeof fetchOrig
type FetchInit = NFRequestInit & { signal?: unknown }

async function fetchJSON<T>(
  url: string,
  init: FetchInit,
  { timeoutMs = 12_000, retries = 1 }: { timeoutMs?: number; retries?: number } = {},
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const AC: typeof AbortController = (globalThis as any).AbortController || (await import('abort-controller')).default
    const controller = new AC()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        ...(init as NFRequestInit),
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      return (await res.json()) as T
    } catch (err) {
      clearTimeout(timer)
      if (attempt === retries) throw err
      // retry next loop
    }
  }
  return {} as any
}

/* =========================
 *  API CALLS
 * ========================= */
type TrendingToken = {
  token: string
  price?: number
  marketcap?: number
  volume24h?: number
  symbol?: string
}

async function fetchTrendingTokensOnce(params: {
  chain: (typeof CHAINS)[number]['gql']
  page: number
  limit?: number
  dex?: string
  timeRange?: string
}): Promise<TrendingToken[]> {
  const body = {
    query: GQL_GET_TOKEN_TRENDING,
    variables: {
      input: {
        chain: params.chain,
        limit: params.limit ?? 20,
        page: params.page,
        dex: params.dex ?? 'All',
        timeRange: params.timeRange ?? 'h24',
      },
    },
  }

  type Resp = {
    data?: {
      getTokenTrending?: {
        data?: Array<{
          token?: string
          price?: number
          marketcap?: number
          volume24h?: number
          symbol?: string
        }>
      }
    }
  }
  const json = await fetchJSON<Resp>(VITE_GRAPHQL_MEME2_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  const list = json?.data?.getTokenTrending?.data ?? []
  return list
    .map((x) => ({
      token: x?.token || '',
      price: x?.price,
      marketcap: x?.marketcap,
      volume24h: x?.volume24h,
      symbol: x?.symbol,
    }))
    .filter((t) => !!t.token && t.token.length > 0)
}

type TopTrader = { address: string; pnl7d?: number }

async function fetchTopTradersOnce(params: {
  chain: (typeof CHAINS)[number]['gql']
  page: number
  limit?: number
}): Promise<TopTrader[]> {
  const body = {
    query: GQL_GET_TOP_TRADERS,
    variables: {
      input: {
        chain: params.chain,
        limit: params.limit ?? 20,
        page: params.page,
        type: 'TopTrader',
      },
    },
  }

  type Resp = { data?: { rank?: Array<{ address?: string; pnl7d?: number }> } }
  const json = await fetchJSON<Resp>(VITE_GRAPHQL_MEME2_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  const list = json?.data?.rank ?? []
  return list
    .map((x) => ({ address: x?.address || '', pnl7d: x?.pnl7d }))
    .filter((t) => !!t.address && t.address.length > 0)
}

type TokenByCategory = {
  address: string
  marketCap?: number
  volume24h?: number
  price24hChange?: number
  chainId?: number
  name?: string
  logoUrl?: string
  price?: number
  symbol?: string
  chainSlug?: ChainSlug
}

async function fetchTokensByCategoryOnce(params: {
  chainId: (typeof CHAINS)[number]['id']
  categoryId: string
  page: number
  limit?: number
}): Promise<TokenByCategory[]> {
  const body = {
    query: GQL_GET_tokenByCategories,
    variables: {
      input: {
        chainId: params.chainId,
        limit: params.limit ?? 20,
        page: params.page,
        categoryId: params.categoryId,
        sortBy: 'MarketCap',
        sortType: 'desc',
      },
    },
  }

  type Resp = {
    data?: {
      tokensByCategory?: {
        data?: Array<{
          address?: string
          marketCap?: number
          volume24h?: number
          price24hChange?: number
          chainId?: number
          name?: string
          logoUrl?: string
          price?: number
          symbol?: string
        }>
      }
    }
  }
  const json = await fetchJSON<Resp>(VITE_GRAPHQL_MEME2_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  const list = json?.data?.tokensByCategory?.data ?? []
  return list
    .map((x) => ({
      address: x?.address || '',
      marketCap: x?.marketCap,
      volume24h: x?.volume24h,
      price24hChange: x?.price24hChange,
      chainId: x?.chainId,
      name: x?.name,
      logoUrl: x?.logoUrl,
      price: x?.price,
      symbol: x?.symbol,
    }))
    .filter((t) => !!t.address && t.address.length > 0)
}

type Category = {
  categoryId: string
}

async function fetchAllCategoriesOnce(params: { chainId: (typeof CHAINS)[number]['id'] }): Promise<Category[]> {
  const body = {
    query: GQL_GET_ALL_CATEGORIES,
    variables: { input: { chainId: params.chainId } },
  }
  type Resp = { data?: { getAllCategories?: { data?: Array<{ categoryId?: string }> } } }
  const json = await fetchJSON<Resp>(VITE_GRAPHQL_MEME2_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const list = json?.data?.getAllCategories?.data ?? []
  return list.map((x) => ({ categoryId: x?.categoryId || '' })).filter((t) => !!t.categoryId && t.categoryId.length > 0)
}

/* =========================
 *  COLLECTORS (dedup + join)
 * ========================= */
async function collectTokenPages() {
  const pairs: Array<TrendingToken & { chainSlug: ChainSlug }> = []
  await Promise.all(
    CHAINS.flatMap((c) =>
      PAGES.map(async (p) => {
        try {
          const tokens = await fetchTrendingTokensOnce({ chain: c.gql, page: p })
          tokens.forEach((t) => pairs.push({ ...t, chainSlug: c.slug }))
        } catch {
          // ignore a failing page to keep sitemap generation robust
        }
      }),
    ),
  )

  const seen = new Set<string>()
  return pairs.filter((r) => {
    const k = `${r.chainSlug}:${r.token}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

async function collectWalletPages() {
  const wallets: Array<{ wallet: string; pnl7d?: number }> = []
  await Promise.all(
    CHAINS.flatMap((c) =>
      PAGES.map(async (p) => {
        try {
          const addrs = await fetchTopTradersOnce({ chain: c.gql, page: p })
          wallets.push(...addrs.map((a) => ({ wallet: a.address, pnl7d: a.pnl7d })))
        } catch {
          // ignore
        }
      }),
    ),
  )

  const seen = new Set<string>()
  const result: Array<{ wallet: string; pnl7d?: number }> = []
  for (const w of wallets) {
    if (seen.has(w.wallet)) continue
    seen.add(w.wallet)
    result.push(w)
  }
  return result
}

async function collectTokensByCategoryPages() {
  const tokens: TokenByCategory[] = []
  // Fetch categories for each chain, then fetch tokens per category & page
  await Promise.all(
    CHAINS.flatMap((chain) =>
      (async () => {
        let categoryIds: string[] = []
        try {
          const categories = await fetchAllCategoriesOnce({ chainId: chain.id })
          categoryIds = Array.from(new Set(categories.map((c) => c.categoryId)))
        } catch {
          categoryIds = []
        }
        await Promise.all(
          categoryIds.flatMap((categoryId) =>
            PAGES.map(async (p) => {
              try {
                const list = await fetchTokensByCategoryOnce({ chainId: chain.id, categoryId, page: p })
                list.forEach((t) => tokens.push({ ...t, chainSlug: chain.slug }))
              } catch {
                // ignore
              }
            }),
          ),
        )
      })(),
    ),
  )

  const seen = new Set<string>()
  const result: TokenByCategory[] = []
  for (const t of tokens) {
    const key = `${t.chainSlug || ''}:${t.address}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(t)
  }
  return result
}

/* =========================
 *  FUTURES PAGES FROM dex.json
 * ========================= */
function collectFuturesPagesFromDexJson(
  jsonPath = resolve(process.cwd(), 'plugins/dex.json'),
): Array<{ coin: string }> {
  try {
    const raw = readFileSync(jsonPath, 'utf-8')
    const arr = JSON.parse(raw) as unknown

    if (!Array.isArray(arr)) return []

    const cleaned = arr
      .filter((v) => typeof v === 'string')
      .map((v: string) => v.trim().toUpperCase())
      .filter((v) => v.length > 0)

    // Dedup and keep URL-safe symbols
    const uniq = Array.from(new Set(cleaned))
    return uniq.map((coin) => ({ coin }))
  } catch {
    return []
  }
}

/* =========================
 *  ROBOTS BY STAGE
 * ========================= */
function buildRobots(stage: string) {
  const baseHeader = `User-agent: *\n`
  if (stage === 'prod') {
    return `${baseHeader}Allow: /\n\nSitemap: ${SITE_ORIGIN.replace(/\/$/, '')}/sitemap.xml\n`
  }
  const allowLines = NON_PROD_ALLOWLIST.map((p) => `Allow: ${p}`).join('\n')
  return `# ${stage.toUpperCase()} environment — block indexing\n${baseHeader}Disallow: /\n${
    allowLines ? '\n' + allowLines + '\n' : ''
  }`
}

/* =========================
 *  OG META BUILDERS (per route type)
 * ========================= */
type Og = { title: string; desc: string; url: string; image: string; site?: string; type?: string }

const ogForStatic = (path: string): Og => ({
  title: `${BRAND_NAME} — On-chain Trading Intelligence`,
  desc: `Real-time token intel, smart money tracking, holders and alerts. Trade faster with ${BRAND_NAME}.`,
  url: new URL(path, SITE_ORIGIN).toString(),
  image: `${SITE_ORIGIN.replace(/\/$/, '')}/favicon.ico`,
  site: BRAND_NAME,
  type: 'website',
})

const ogForToken = (
  chainSlug: ChainSlug,
  token: string,
  extra?: { symbol?: string; price?: number; marketcap?: number; volume24h?: number },
): Og => ({
  title: `${extra?.symbol || token} | ${BRAND_NAME}`,
  desc: buildTokenDesc(token, extra),
  url: `${SITE_ORIGIN.replace(/\/$/, '')}/meme/${chainSlug}/token/${token}`,
  image: `${SITE_ORIGIN.replace(/\/$/, '')}/favicon.ico`,
  site: BRAND_NAME,
  type: 'website',
})

const ogForWallet = (wallet: string, extra?: { pnl7d?: number }): Og => ({
  title: `Wallet ${short(wallet)} — Smart Money Profile | ${BRAND_NAME}`,
  desc: buildWalletDesc(wallet, extra),
  url: `${SITE_ORIGIN.replace(/\/$/, '')}/meme/wallet/${encodeURIComponent(wallet)}`,
  image: `${SITE_ORIGIN.replace(/\/$/, '')}/favicon.ico`,
  site: BRAND_NAME,
  type: 'profile',
})

const ogForTokenByCategory = (token: string, extra?: Partial<TokenByCategory>): Og => ({
  title: `${extra?.name || token} | ${BRAND_NAME}`,
  desc: buildTokenByCategoryDesc(token, extra),
  url: `${SITE_ORIGIN.replace(/\/$/, '')}/meme/${CHAINS[0].slug}/token/${token}`,
  image: `${SITE_ORIGIN.replace(/\/$/, '')}/favicon.ico`,
  site: BRAND_NAME,
  type: 'website',
})

const ogForFutures = (coin: string): Og => ({
  title: `${coin} Futures — Prices & Funding | ${BRAND_NAME}`,
  desc: `Track ${coin} futures markets, funding and open interest.`,
  url: `${SITE_ORIGIN.replace(/\/$/, '')}/futures/${encodeURIComponent(coin)}`,
  image: `${SITE_ORIGIN.replace(/\/$/, '')}/favicon.ico`,
  site: BRAND_NAME,
  type: 'website',
})

function short(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

function num(n?: number) {
  if (typeof n !== 'number' || !isFinite(n)) return undefined
  return n
}

function formatUSD(n?: number) {
  const v = num(n)
  if (v === undefined) return undefined
  if (Math.abs(v) >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
  return `$${v.toFixed(2)}`
}

function buildTokenDesc(
  token: string,
  extra?: { symbol?: string; price?: number; marketcap?: number; volume24h?: number },
) {
  const name = extra?.symbol ? `${extra.symbol} (${token})` : token
  const price = formatUSD(extra?.price)
  const mcap = formatUSD(extra?.marketcap)
  const vol = formatUSD(extra?.volume24h)
  const stats: string[] = []
  if (price) stats.push(`price ${price}`)
  if (mcap) stats.push(`mcap ${mcap}`)
  if (vol) stats.push(`24h vol ${vol}`)
  const statsStr = stats.length ? ` — ${stats.join(', ')}` : ``
  return `${name} live on ${BRAND_NAME}${statsStr}. Track whales, holders & flows. Trade smarter.`
}

function buildWalletDesc(wallet: string, extra?: { pnl7d?: number }) {
  const pnl = num(extra?.pnl7d)
  const pnlStr = typeof pnl === 'number' ? ` — 7d PnL ${pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}%` : ''
  return `Smart money wallet ${wallet}: positions, entries/exits, on-chain moves${pnlStr}. Follow and react fast on ${BRAND_NAME}.`
}

function buildTokenByCategoryDesc(token: string, extra?: Partial<TokenByCategory>) {
  const nameSym = extra?.name || extra?.symbol ? `${extra?.name || extra?.symbol} (${token})` : token
  const price = formatUSD(extra?.price)
  const mcap = formatUSD(extra?.marketCap)
  const vol = formatUSD(extra?.volume24h)
  const parts: string[] = []
  if (price) parts.push(`price ${price}`)
  if (mcap) parts.push(`mcap ${mcap}`)
  if (vol) parts.push(`24h vol ${vol}`)
  const statsStr = parts.length ? ` — ${parts.join(', ')}` : ``
  return `${nameSym} on ${BRAND_NAME}${statsStr}. Liquidity, holders & real-time flows.`
}

/* =========================
 *  HTML INJECTION
 * ========================= */
// Minimal, fast tag injection without parsing libraries.
function injectOgIntoHtml(html: string, og: Og) {
  const headCloseIdx = html.indexOf('</head>')
  const before = html.slice(0, headCloseIdx)
  const after = html.slice(headCloseIdx)

  const tags = `
    <title>${escapeHtml(og.title)}</title>
    <meta name="description" content="${escapeAttr(og.desc)}" />
    <link rel="canonical" href="${escapeAttr(og.url)}" />
    <meta property="og:type" content="${escapeAttr(og.type || 'website')}" />
    <meta property="og:site_name" content="${escapeAttr(og.site || BRAND_NAME)}" />
    <meta property="og:title" content="${escapeAttr(og.title)}" />
    <meta property="og:description" content="${escapeAttr(og.desc)}" />
    <meta property="og:url" content="${escapeAttr(og.url)}" />
    <meta property="og:image" content="${escapeAttr(og.image)}" />
    <meta property="og:image:alt" content="${escapeAttr(og.title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(og.title)}" />
    <meta name="twitter:description" content="${escapeAttr(og.desc)}" />
    <meta name="twitter:image" content="${escapeAttr(og.image)}" />
  `.trim()

  // Remove existing <title> and only meta description (both ' and ") to avoid duplicates (keep og/twitter)
  const cleaned = before
    .replace(/<title\b[^>]*>.*?<\/title>/gi, '')
    .replace(/<meta\s+[^>]*\bname\s*=\s*(["'])description\1[^>]*>/gi, '')

  return `${cleaned}\n${tags}\n${after}`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]!)
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

/* =========================
 *  STRUCTURED DATA (JSON-LD)
 * ========================= */
function buildJsonLd(og: Og, kind: 'static' | 'token' | 'wallet' | 'tokenByCategory' | 'futures', details?: any) {
  const base: any = {
    '@context': 'https://schema.org',
    '@type': kind === 'wallet' ? 'ProfilePage' : 'WebPage',
    name: og.title,
    description: og.desc,
    url: og.url,
    image: og.image,
    publisher: { '@type': 'Organization', name: BRAND_NAME, url: SITE_ORIGIN.replace(/\/$/, '') },
  }

  if (kind === 'token') {
    const props: any[] = []
    if (typeof details?.price === 'number') props.push({ name: 'price', value: details.price })
    if (typeof details?.marketcap === 'number') props.push({ name: 'marketcap', value: details.marketcap })
    if (typeof details?.volume24h === 'number') props.push({ name: 'volume24h', value: details.volume24h })
    base.about = {
      '@type': 'Thing',
      name: details?.symbol || details?.token || '',
      identifier: details?.token || '',
      additionalProperty: props,
    }
  }

  if (kind === 'wallet') {
    const props: any[] = []
    if (typeof details?.pnl7d === 'number') props.push({ name: 'pnl7d', value: details.pnl7d })
    base.about = {
      '@type': 'Person',
      identifier: details?.wallet || '',
      additionalProperty: props,
    }
  }

  if (kind === 'tokenByCategory') {
    const props: any[] = []
    if (typeof details?.price === 'number') props.push({ name: 'price', value: details.price })
    if (typeof details?.marketCap === 'number') props.push({ name: 'marketCap', value: details.marketCap })
    if (typeof details?.volume24h === 'number') props.push({ name: 'volume24h', value: details.volume24h })
    base.about = {
      '@type': 'Thing',
      name: details?.name || details?.symbol || details?.address || '',
      identifier: details?.address || '',
      additionalProperty: props,
    }
  }

  if (kind === 'futures') {
    base.about = { '@type': 'Thing', name: details?.coin || '' }
  }

  return base
}

function injectJsonLdBelowRoot(html: string, json: object) {
  const script = `\n<script type="application/ld+json">${JSON.stringify(json)}</script>`
  const marker = '<div id="root"></div>'
  if (html.includes(marker)) return html.replace(marker, marker + script)

  const idIdx = html.indexOf('id="root"')
  if (idIdx >= 0) {
    const gtIdx = html.indexOf('>', idIdx)
    const closeDivIdx = html.indexOf('</div>', gtIdx)
    if (closeDivIdx >= 0) {
      const insertAt = closeDivIdx + 6
      return html.slice(0, insertAt) + script + html.slice(insertAt)
    }
  }

  const bodyClose = html.lastIndexOf('</body>')
  if (bodyClose >= 0) return html.slice(0, bodyClose) + script + html.slice(bodyClose)
  return html + script
}

/* =========================
 *  FILE HELPERS
 * ========================= */
function writeRouteHtml(outDirAbs: string, routePath: string, html: string) {
  const safe = routePath.startsWith('/') ? routePath.slice(1) : routePath
  const filePath = join(outDirAbs, safe + '.html')
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, html, 'utf-8')
}

/* =========================
 *  VITE PLUGIN
 * ========================= */
export default function pluginSEO(): Plugin {
  let outDir = 'dist'
  console.log(`[SEO] stage=${VITE_STAGE} origin=${SITE_ORIGIN}`)

  return {
    name: 'plugin-seo-sitemap-robots-og',
    apply: 'build',
    configResolved(config) {
      outDir = config.build?.outDir || 'dist'
    },
    async closeBundle() {
      const outDirAbs = resolve(process.cwd(), outDir)
      mkdirSync(outDirAbs, { recursive: true })

      const indexPath = resolve(outDirAbs, 'index.html')
      let baseIndexHtml = ''
      try {
        baseIndexHtml = readFileSync(indexPath, 'utf-8')
      } catch (e) {
        console.error('[SEO] Cannot read built index.html. Ensure Vite emitted it at', indexPath)
        return
      }

      try {
        // Collect dynamic pages
        const [tokens, wallets, tokenByCategories] = await Promise.all([
          collectTokenPages(),
          collectWalletPages(),
          collectTokensByCategoryPages(),
        ])

        // Futures pages from dex.json
        const futuresCoins = collectFuturesPagesFromDexJson() // reads plugins/dex.json

        // ===== SITEMAP GENERATION =====
        const smStream = new SitemapStream({ hostname: SITE_ORIGIN })
        const sitemapPath = resolve(outDirAbs, 'sitemap.xml')
        smStream.pipe(createWriteStream(sitemapPath))

        // Static
        for (const p of STATIC_PATHS) {
          smStream.write({
            url: p,
            changefreq: p === '/meme/discover' ? 'daily' : 'weekly',
            priority: p === '/meme/discover' ? 1.0 : 0.7,
          })
        }

        // Tokens
        for (const { token, chainSlug } of tokens) {
          smStream.write({
            url: `/meme/${chainSlug}/token/${token}`,
            changefreq: 'always',
            priority: 0.8,
          })
        }

        // Wallets
        for (const { wallet } of wallets) {
          smStream.write({
            url: `/meme/wallet/${encodeURIComponent(wallet)}`,
            changefreq: 'weekly',
            priority: 0.6,
          })
        }

        // Tokens by Category
        for (const { address, chainSlug } of tokenByCategories) {
          smStream.write({
            url: `/meme/${chainSlug || CHAINS[0].slug}/token/${address}`,
            changefreq: 'always',
            priority: 0.8,
          })
        }

        // Futures pages from dex.json
        for (const { coin } of futuresCoins) {
          smStream.write({
            url: `/futures/${encodeURIComponent(coin)}`,
            changefreq: 'daily',
            priority: 0.7,
          })
        }

        smStream.end()
        await streamToPromise(smStream)

        // ===== ROBOTS.TXT GENERATION =====
        const robots = buildRobots(VITE_STAGE)
        writeFileSync(resolve(outDirAbs, 'robots.txt'), robots, 'utf-8')

        // ===== OG PRERENDER GENERATION =====
        // 1) Static pages
        for (const path of STATIC_PATHS) {
          const og = ogForStatic(path)
          let html = injectOgIntoHtml(baseIndexHtml, og)
          html = injectJsonLdBelowRoot(html, buildJsonLd(og, 'static'))
          writeRouteHtml(outDirAbs, path, html)
        }

        // 2) Token pages
        for (const { token, chainSlug, symbol, price, marketcap, volume24h } of tokens) {
          const route = `/meme/${chainSlug}/token/${token}`
          const og = ogForToken(chainSlug, token, { symbol, price, marketcap, volume24h })
          let html = injectOgIntoHtml(baseIndexHtml, og)
          html = injectJsonLdBelowRoot(html, buildJsonLd(og, 'token', { token, symbol, price, marketcap, volume24h }))
          writeRouteHtml(outDirAbs, route, html)
        }

        // 3) Wallet pages
        for (const { wallet, pnl7d } of wallets) {
          const route = `/meme/wallet/${encodeURIComponent(wallet)}`
          const og = ogForWallet(wallet, { pnl7d })
          let html = injectOgIntoHtml(baseIndexHtml, og)
          html = injectJsonLdBelowRoot(html, buildJsonLd(og, 'wallet', { wallet, pnl7d }))
          writeRouteHtml(outDirAbs, route, html)
        }

        // 4) Tokens by Category
        for (const { address, name, symbol, price, marketCap, volume24h, chainSlug } of tokenByCategories) {
          const token = address
          const route = `/meme/${chainSlug || CHAINS[0].slug}/token/${token}`
          const og = ogForTokenByCategory(token, { name, symbol, price, marketCap, volume24h })
          let html = injectOgIntoHtml(baseIndexHtml, og)
          html = injectJsonLdBelowRoot(
            html,
            buildJsonLd(og, 'tokenByCategory', { address, name, symbol, price, marketCap, volume24h }),
          )
          writeRouteHtml(outDirAbs, route, html)
        }

        // 5) Futures from dex.json
        for (const { coin } of futuresCoins) {
          const route = `/futures/${encodeURIComponent(coin)}`
          const og = ogForFutures(coin)
          let html = injectOgIntoHtml(baseIndexHtml, og)
          html = injectJsonLdBelowRoot(html, buildJsonLd(og, 'futures', { coin }))
          writeRouteHtml(outDirAbs, route, html)
        }

        console.log(
          `[SEO] Generated: sitemap.xml + robots.txt + OG prerender (${tokens.length} tokens, ${wallets.length} wallets, ${tokenByCategories.length} tokenByCategory, ${futuresCoins.length} futures)`,
        )
      } catch (e: any) {
        console.error('[SEO] plugin failed:', e?.message || e)
      }
    },
  }
}
