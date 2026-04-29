import { ChainIds } from '@/types/enums.ts'
import { LifecycleStates, TokenDirection } from '@/@generated/gql/graphql-core.ts'

export type DexInfo = {
  value: string
  label: string
  icon: string
  alias?: string
  isLaunchpad?: boolean
  alternativeValue?: string
}

export const LaunchPlatformOptions: DexInfo[] = [
  // {
  //   value: 'All',
  //   label: '全部',
  //   icon: '/images/icons/icon-category-2.svg',
  // },
  {
    value: 'Pumpfun',
    label: 'Pump',
    alias: 'Pumpfun',
    icon: '/images/icons/pump-icon.svg',
  },
  {
    value: 'Moonit',
    label: 'Moonit',
    icon: '/images/icons/ic-moonit.svg',
  },
  {
    value: 'Launchlab',
    label: 'Launchlab',
    icon: '/images/icons/dex/launchlab.svg',
  },
  {
    value: 'Bonk',
    label: 'Bonk',
    icon: '/images/icons/dex/bonk.svg',
  },
  {
    value: 'Bags',
    label: 'Bags',
    icon: '/images/icons/dex/bags.svg',
  },
  {
    value: 'Believe',
    label: 'Believe',
    icon: '/images/icons/dex/believe.svg',
  },
  {
    value: 'MeteoraDBC',
    label: 'Dynamic BC',
    icon: '/images/icons/dex/meteora-dbc.svg',
  },
  {
    value: 'Boop',
    label: 'Boop',
    icon: '/images/icons/dex/boop.png',
  },
  {
    value: 'Moonshot',
    label: 'Moonshot',
    icon: '/images/icons/dex/moonshot.svg',
  },
  {
    value: 'Raydium',
    label: 'Raydium',
    icon: '/images/icons/icon-raydium.svg',
  },
  {
    value: 'PumpSwap',
    label: 'PumpSwap',
    icon: '/images/icons/icon-pumpswap.webp',
  },
  {
    value: 'Mercurial',
    label: 'Mercurial',
    icon: '/images/icons/mercurial.png',
  },
  {
    value: 'Meteora',
    label: 'Meteora',
    icon: '/images/icons/meteora.svg',
  },
  {
    value: 'GooseFX',
    label: 'GooseFX',
    icon: '/images/icons/goosefx.svg',
  },
  {
    value: 'Aldrin',
    label: 'Aldrin',
    icon: '/images/icons/aldrin.png',
  },
  {
    value: 'Step',
    label: 'Step',
    icon: '/images/icons/step.png',
  },
  {
    value: 'Saros',
    label: 'Saros',
    icon: '/images/icons/saros.png',
  },
  {
    value: 'Stepn',
    label: 'Stepn',
    icon: '/images/icons/dex/stepn.avif',
  },
  {
    value: 'Dradex',
    label: 'Dradex',
    icon: '/images/icons/dex/dradex.png',
  },
  {
    value: 'ObricV2',
    label: 'ObricV2',
    icon: '/images/icons/dex/obric.webp',
  },
  {
    value: 'Lifinity',
    label: 'Lifinity',
    icon: '/images/icons/lifinity.svg',
  },
  {
    value: 'LifinityV2',
    label: 'LifinityV2',
    icon: '/images/icons/lifinity.svg',
  },
  {
    value: 'Orca',
    label: 'Orca',
    icon: '/images/icons/orca.webp',
  },
  {
    value: 'FluxBeam',
    label: 'FluxBeam',
    icon: '/images/icons/fluxbeam.png',
  },
  {
    value: 'Whirlpool',
    label: 'Orca Whirlpool',
    icon: '/images/icons/orca.webp',
  },
  {
    value: 'SolFi',
    label: 'SolFi',
    icon: '/images/icons/solfi.png',
  },
  {
    value: 'Meteora_DAMM_v2',
    label: 'Meteora DAMM v2',
    icon: '/images/icons/meteora.svg',
  },
  {
    value: 'Meteora_DAMM_v3',
    label: 'Meteora DAMM v3',
    icon: '/images/icons/meteora.svg',
  },
  {
    value: 'SolFiV2',
    label: 'SolFi V2',
    icon: '/images/icons/solfi.png',
  },
  {
    value: 'Aquifer',
    label: 'Aquifer',
    icon: '/images/icons/dex/aquifer.webp',
  },
  {
    value: 'HumidiFi',
    label: 'HumidiFi',
    icon: '/images/icons/dex/humidifi.webp',
  },
  {
    value: 'GoonFi',
    label: 'GoonFi',
    icon: '/images/icons/dex/goonfi.webp',
  },
  {
    value: 'ZeroFi',
    label: 'ZeroFi',
    icon: '/images/icons/dex/zerofi.webp',
  },
  {
    value: 'TesseraV',
    label: 'TesseraV',
    icon: '/images/icons/dex/tesserav.jpg',
  },
  {
    value: 'Fusion',
    label: 'Fusion',
    icon: '/images/icons/dex/fusion.webp',
    isLaunchpad: false,
  },
  {
    value: 'PancakeSwap',
    label: 'PancakeSwap',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'PancakeSwapV2',
    label: 'PancakeSwapV2',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'PancakeSwapV3',
    label: 'PancakeSwapV3',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
]

export const BscDexOptions: DexInfo[] = [
  {
    value: 'Fourmeme',
    label: 'Fourmeme',
    icon: '/images/icons/dex/fourmeme.svg',
    alternativeValue: 'FourmemeLaunchPad',
    isLaunchpad: true,
  },
  {
    value: 'Flap',
    label: 'Flap',
    icon: '/images/icons/dex/flap.svg',
    isLaunchpad: true,
  },
  {
    value: 'PancakeSwap',
    label: 'PancakeSwap',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'PancakeSwapV2',
    label: 'PancakeSwapV2',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'PancakeSwapV3',
    label: 'PancakeSwapV3',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'ApeSwap',
    label: 'ApeSwap',
    icon: '/images/icons/dex/ic-apeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'Biswap',
    label: 'Biswap',
    icon: '/images/icons/dex/biswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'MDEX',
    label: 'MDEX',
    icon: '/images/icons/dex/ic-mdex.svg',
    isLaunchpad: false,
  },
  {
    value: 'BabySwap',
    label: 'BabySwap',
    icon: '/images/icons/dex/ic-babyswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'Nomiswap',
    label: 'Nomiswap',
    icon: '/images/icons/dex/nomiswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'KnightSwap',
    label: 'KnightSwap',
    icon: '/images/icons/dex/ic-knightswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'BakerySwap',
    label: 'BakerySwap',
    icon: '/images/icons/dex/bakeryswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'JSwap',
    label: 'JSwap',
    icon: '/images/icons/dex/ic-jswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'MarsEcosystem',
    label: 'MarsEcosystem',
    icon: '/images/icons/dex/mars.png',
    isLaunchpad: false,
  },
]

export const MonDexOptions: DexInfo[] = [
  {
    value: 'Nadfun',
    label: 'Nad.fun',
    icon: '/images/icons/dex/nadfun.webp',
    isLaunchpad: true,
  },
  {
    value: 'Flap',
    label: 'Flap',
    icon: '/images/icons/dex/flap.svg',
    isLaunchpad: true,
  },
  {
    value: 'PancakeSwapV2',
    label: 'PancakeSwapV2',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  //   {
  //   value: 'PancakeSwapV3',
  //   label: 'PancakeSwapV3',
  //   icon: '/images/icons/dex/pancakeswap.svg',
  //   isLaunchpad: false,
  // },
  {
    value: 'OctoSwapV2Factory',
    label: 'OctoSwapV2Factory',
    icon: '/images/icons/dex/octoswap.webp',
    isLaunchpad: false,
  },
  {
    value: 'OctoswapV1Factory',
    label: 'OctoswapV1Factory',
    icon: '/images/icons/dex/octoswap.webp',
    isLaunchpad: false,
  },
  {
    value: 'LFJ: JoeV1Factory',
    label: 'LFJ: JoeV1Factory',
    icon: '/images/icons/dex/traderjoe.webp',
    isLaunchpad: false,
  },
  {
    value: 'Pinot Finance: UniswapV3Factory',
    label: 'Pinot Finance: UniswapV3Factory',
    icon: '/images/icons/dex/pinot.svg',
    isLaunchpad: false,
  },
  {
    value: 'Pinot Finance: UniswapV2Factory',
    label: 'Pinot Finance: UniswapV2Factory',
    icon: '/images/icons/dex/pinot.svg',
    isLaunchpad: false,
  },
  {
    value: 'MondayFactory',
    label: 'MondayFactory',
    icon: '/images/icons/dex/purps.png',
    isLaunchpad: false,
  },
  {
    value: 'PurpsV2Factory',
    label: 'PurpsV2Factory',
    icon: '/images/icons/dex/purps.png',
    isLaunchpad: false,
  },
  {
    value: 'CapricornCLFactory',
    label: 'CapricornCLFactory',
    icon: '/images/icons/dex/capricorn.webp',
    isLaunchpad: false,
  },
  {
    value: 'ZFV3Factory',
    label: 'ZFV3Factory',
    icon: '/images/icons/dex/zkswap.webp',
    isLaunchpad: false,
  },
  {
    value: 'ZFFactory',
    label: 'ZFFactory',
    icon: '/images/icons/dex/zkswap.webp',
    isLaunchpad: false,
  },
  {
    value: 'SomeFactory',
    label: 'SomeFactory',
    icon: '/images/icons/dex/pancakeswap.svg',
    isLaunchpad: false,
  },
  {
    value: 'AlgebraFactory',
    label: 'SwyrlV3Factory',
    icon: '/images/icons/dex/swyrl.webp',
    isLaunchpad: false,
  },
  {
    value: 'AlgebraFactory',
    label: 'AlgebraFactory',
    icon: '/images/icons/dex/algebra.webp',
    isLaunchpad: false,
  },
]

// TODO: add constant app router
export const APP_PATH = {
  // crypto paths
  FUTURES_DISCOVER: '/futures/discover',
  FUTURES: '/futures',
  FUTURES_MARKET: '/futures/market',
  EDIT_FAVORITES: '/edit-favorites',
  MARKET: '/market',

  REDPACKET: '/redpacket',

  // crypto not used path
  TRANSACTION_HISTORY: '/futures/transaction-history',
  ALL_ALERTS: '/futures/all-alerts',
  FUTURES_TRANSFER: '/futures/transfer',
  FUTURES_POSITION: '/futures/position',

  // meme paths
  MEME_NEW_PAIRS_DEMO: '/meme/new-pairs-demo',
  MEME_DISCOVER: '/meme/discover',
  MEME_DISCOVER_OLD: '/meme/discover-old',
  MEME_DISCOVER_NEW: '/meme/discover-new',
  MEME_TOKEN: '/meme/token',
  MEME_TOKEN_DETAIL: '/meme/:chain/token/:address',
  MEME_DEV_PROJECTS: '/meme/:chain/token/:address/dev-projects',
  MEME_TREND: '/meme/trend/:id',
  MEME_TELEGRAM_AUTH: '/telegram-auth',
  MEME_MONITORING: '/meme/monitoring',
  MEME_SMART_MONEY: '/meme/smart-money',
  MEME_POSITION: '/meme/position',
  MEME_SETTINGS_GOOGLE_AUTH: '/meme/settings/google-authenticator',
  MEME_SETTINGS_RESET_GOOGLE_AUTH: '/meme/settings/reset-google-authenticator',
  MEME_SETTINGS_CONNECT_GOOGLE_AUTH: '/meme/settings/connect-google-authenticator',
  MEME_SETTINGS_VERIFY_GOOGLE_AUTH: '/meme/settings/verify-google-authenticator',
  MEME_SETTINGS_WHITELIST_GOOGLE_AUTH: '/meme/settings/whitelist-google-authenticator',
  MEME_SETTINGS_ABOUT_US: '/meme/settings/about-us',
  MEME_SETTINGS_LANGUAGE: '/meme/settings/language',
  MEME_COLORS_SETTINGS: '/meme/settings/colors',
  MEME_NOTIFICATION_SETTINGS: '/meme/settings/notification',
  MEME_SETTINGS_FUNDING_HISTORY: '/meme/settings/funding-history',
  MEME_SETTINGS_BROWSING_HISTORY: '/meme/settings/browsing-history',
  MEME_SETTINGS_USER_FEEDBACK: '/meme/settings/user-feedback',
  MEME_SETTINGS_USER_FEEDBACK_PROGRESS: '/meme/settings/user-feedback/progress',
  MEME_SETTINGS_SYSTEM_SETTINGS: '/meme/settings/system',
  MEME_CROSS_CHAIN_BRIDGE: '/meme/cross-chain-bridge',
  MEME_CROSS_CHAIN_BRIDGE_STATUS: '/meme/cross-chain-bridge/tx',
  MEME_NOTIFICATIONS: '/meme/notifications',

  MEME_WALLET_BACKUP_MNEMONIC_PROMPT: '/meme/wallet-backup/mnemonic-prompt',
  MEME_WALLET_BACKUP_MNEMONIC_CHECKLIST: '/meme/wallet-backup/mnemonic-checklist',
  MEME_WALLET: '/meme/wallet',

  // prediction
  PREDICTION_ASSETS: '/assets/prediction',
  PREDICTION_DEPOSIT: '/prediction-deposit',
  PREDICTION_WITHDRAW: '/prediction-withdraw',

  // assets
  ASSETS: '/assets',
  ASSETS_TOKEN: '/assets/token',
  DEPOSIT: '/deposit',
  DEPOSIT_SHARE: '/deposit/share',
  TRANSFER: '/transfer',
  WITHDRAWAL: '/withdrawal',
  PERPS_DEPOSIT: '/perps-deposit',
  PERPS_WITHDRAW: '/perps-withdraw',

  // smart money
  SMART_MONEY: '/futures/smart-money',
  SMART_MONEY_Address_Detail: '/futures/smart-money/:address',
  SUPERVISORY: '/futures/supervisory',

  // category paths
  CATEGORY: '/category',
  CATEGORY_DETAIL: '/category/:category',
  // copy trading paths
  COPY_TRADING_WALLET_SETTINGS: '/wallet-copy/settings',

  // webview
  WEBVIEW_PRICE_CHART: '/webview/price-chart/:address',
  WEBVIEW_PRICE_CHART_2: '/webview/price-chart',
  WEBVIEW_ASSET_CHART: '/webview/asset-chart',
  WEBVIEW_PRIVACY_POLICY: '/webview/privacy-policy',
  WEBVIEW_TERMS_OF_USE: '/webview/terms-of-use',
  WEBVIEW_FUTURES_CHART: '/webview/futures-chart',
  WEBVIEW_FUTURES_TREND_CHART: '/webview/futures-trend-chart',
  // wallet copy
  WALLET_COPY: '/wallet-copy',

  // terms of use
  TERMS_OF_USE: '/terms-of-use',
  PRIVACY_POLICY: '/privacy-policy',

  GOOGLE_AUTH: '/google-auth',
  // transfer
  CRYPTO_DEPOSIT: '/crypto-deposit',
  // transfer
  CRYPTO_DEPOSIT_STATUS: '/crypto-transfer-status',
  //share holding
  SHARE_HOLDING: '/share/holding',
  XSTOCKS: '/xstocks/discover',
  X_STOCK_DETAIL: '/xstocks/:chain/token/:address',

  // node agent
  INVITE_FRIENDS: '/invite-friends',
  NODE_AGENT: '/agent',
  NODE_AGENT_DATA_OVERVIEW: '/agent/data-overview',
  INVITE_FRIENDS_USER: '/invite-friends/user',
  NODE_AGENT_REWARDS: '/agent/agent-rewards',
  TRADE_REWARDS: '/trade-rewards',
  LOYALTY: '/loyalty',
  LOYALTY_RANKINGS: '/loyalty/rankings',

  PC_VERSION: '/pc',

  DOWNLOAD_APP: '/apps',

  LOGIN: '/login',
  // maintenance
  MAINTENANCE: '/maintenance',

  //funding-rate
  FUNDING_RATE: '/funding-rate',
  ASSET_HISTORY: '/assets/asset-history',
  TRADE_HISTORY: '/assets/trade-history',
  PREDICTION_PORTFOLIO: '/assets/prediction/portfolio',

  PREDICTION: {
    ROOT: '/prediction',
    HOME: '/',
    SEARCH: '/search',
    BREAKING: '/breaking',
    NEW: '/new',
    FAVORITES: '/favorites',
    EVENTS: '/:categoryId',
    EVENT_DETAILS: '/event/:eventId',
    PORTFOLIO: '/portfolio',
    USER_PROFILE: '/portfolio/:userId',
    PORTFOLIO_USER: '/portfolio/:user-id',
    SPORTS: '/sports',
    EARNINGS: '/earnings',
    CRYPTO: '/crypto',
    FINANCE: '/finance',
    DEPOSIT: '/deposit',
  },
}

export const COLORS = {
  SEL_RISE_COLOR: '47,255,150',
  UNSEL_RISE_COLOR: '5,72,53',
  SEL_FALL_COLOR: '132,59,234',
  UNSEL_FALL_COLOR: '69,22,156',
}

export const LAUNCHPADS = [
  'Pumpfun',
  'Moonit',
  'Launchlab',
  'Bonk',
  'Bags',
  'Believe',
  'MeteoraDBC',
  'Boop',
  'Moonshot',
] as string[]

export const LAUNCHPADS_MON = [
  'Nadfun',
  'Flap',
  // 'PancakeSwapV2',
  // 'PancakeSwapV3',
  // 'OctoSwapV2Factory',
  // 'JoeV1Factory',
  // 'UniswapV3Factory',
  // 'UniswapV2Factory',
  // 'MondayFactory',
  // 'PurpsV2Factory',
  // 'CapricornCLFactory',
  // 'ZFV3Factory',
  // 'ZFFactory',
  // 'SwyrlV3Factory',
  // 'AlgebraFactory',
] as string[]

export const LAUNCHPADS_BY_CHAINS = {
  [ChainIds.Solana]: LAUNCHPADS,
  [ChainIds.Bsc]: ['Fourmeme', 'Flap'],
  [ChainIds.Mon]: LAUNCHPADS_MON,
}

export const CHAIN_SYMBOLS: Record<number, string> = {
  [ChainIds.Solana]: 'sol',
  [ChainIds.Ethereum]: 'eth',
  [ChainIds.Arbitrum]: 'arb',
  [ChainIds.Bsc]: 'bsc',
  [ChainIds.Mon]: 'mon',
}

export const LAUNCHPAD_LOGOS: Record<string, string> = {
  Pumpfun: '/images/icons/pump-icon.svg',
  Moonit: '/images/icons/ic-moonit.svg',
  Bonk: '/images/icons/dex/bonk.svg',
  Bags: '/images/icons/dex/bags.svg',
  Believe: '/images/icons/dex/believe.svg',
  Launchlab: '/images/icons/dex/launchlab.svg',
  MeteoraDBC: '/images/icons/dex/meteora-dbc.svg',
}

export const IMAGES_CONSTANTS = {
  DEFAULT: {
    FALLBACK: '/images/icons/icon-fallback.svg?v=2',
  },
}

export const CHAIN_EXPLORER_URLS: Record<number, string> = {
  [ChainIds.Solana]: 'https://solscan.io',
  [ChainIds.Ethereum]: 'https://etherscan.io',
  [ChainIds.Arbitrum]: 'https://arbiscan.io',
  [ChainIds.Mon]: 'https://monadvision.com/',
}

export const CHAIN_EXPLORER_TX_URLS: Record<number, string> = {
  [ChainIds.Solana]: 'https://solscan.io/tx',
  [ChainIds.Ethereum]: 'https://etherscan.io/tx',
  [ChainIds.Arbitrum]: 'https://arbiscan.io/tx',
  [ChainIds.Bsc]: 'https://bscscan.com/tx',
  [ChainIds.Mon]: 'https://monadvision.com//tx',
  [ChainIds.Polygon]: 'https://polygonscan.com/tx/',
}

export const CHAIN_EXPLORER_ADDRESS_URLS: Record<number, string> = {
  [ChainIds.Solana]: 'https://solscan.io/account',
  [ChainIds.Ethereum]: 'https://etherscan.io/address',
  [ChainIds.Arbitrum]: 'https://arbiscan.io/address',
  [ChainIds.Bsc]: 'https://bscscan.com/address',
  [ChainIds.Mon]: 'https://monadvision.com/address',
}

export const CHAIN_EXPLORER_IMAGES: Record<number, string> = {
  [ChainIds.Solana]: '/images/tokenDetail/icon-solana.svg',
  [ChainIds.Ethereum]: '/images/icons/brands/etherscan.svg',
  [ChainIds.Bsc]: '/images/icons/brands/bscscan.svg',
  [ChainIds.Mon]: '/images/icons/brands/monad.png',
}

export const CHAIN_EXPLORER_IMAGES_PC: Record<number, string> = {
  [ChainIds.Solana]: '/images/tokenDetail/PC/icon-solana.svg',
  [ChainIds.Ethereum]: '/images/icons/brands/etherscan.svg',
  [ChainIds.Bsc]: '/images/icons/brands/bscscan.svg',
  [ChainIds.Mon]: '/images/icons/brands/monad.png',
}

export const CHAIN_IMAGE_URLS: Record<number, string> = {
  [ChainIds.Solana]: '/images/icons/chains/ic-solana2.png',
  [ChainIds.Ethereum]: '/images/icons/chains/ic-ethereum.svg',
  [ChainIds.Bsc]: '/images/icons/chains/ic-bnb.svg',
}

export const MEME_TABS = {
  NEW: 'new',
  COMPLETING: 'completing',
  SOARING: 'soaring',
  COMPLETED: 'completed',
}

export const TRENDING_TABS = {
  HOT: 'hot',
  GAINERS: 'gainers',
  LOSERS: 'losers',
  AI_MINING: 'ai',
}

export const MEME_TABS_MAP: Record<LifecycleStates, string> = {
  [LifecycleStates.NewCreation]: MEME_TABS.NEW,
  [LifecycleStates.Completing]: MEME_TABS.COMPLETING,
  [LifecycleStates.Soaring]: MEME_TABS.SOARING,
  [LifecycleStates.Completed]: MEME_TABS.COMPLETED,
}

export const TRENDING_TABS_MAP: Record<TokenDirection, string> = {
  [TokenDirection.Popular]: TRENDING_TABS.HOT,
  [TokenDirection.Gainer]: TRENDING_TABS.GAINERS,
  [TokenDirection.Loser]: TRENDING_TABS.LOSERS,
  [TokenDirection.AiAnalysis]: TRENDING_TABS.AI_MINING,
}

export const TOKEN_BLACK_LIST = [
  'So11111111111111111111111111111111111111111', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT TRC20
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC BSC
  '0x55d398326f99059ff775485246999027b3197955', // USDT BSC
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // DAI BSC
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC POLYGON
  '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', // USDC AVAX
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH ARBITRUM
]

export const X_STOCK_TAG = 'XStock'

export const ARB_USDC_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
export const ARB_USDC_ADDRESS_V2 = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

export const NATIVE_TOKEN_ADDRESS = {
  sol: {
    SOL: 'So11111111111111111111111111111111111111111',
  },
  eth: {
    ETH: '0x0000000000000000000000000000000000000000',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  arb: {
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  },
  bsc: {
    BNB: '0x0000000000000000000000000000000000000000',
    WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    USD1: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d',
    USDT: '0x55d398326f99059ff775485246999027b3197955',
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    LISUSD: '0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5',
    ASTER: '0x000Ae314E2A2172a039B26378814C252734f556A',
  },
  mon: {
    MON: '0x0000000000000000000000000000000000000000',
    WMON: '0x3bd359c1119da7da1d913d1c4d2b7c461115433a',
    USD1: '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d',
    USDT: '0x55d398326f99059ff775485246999027b3197955',
    USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    LISUSD: '0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5',
    ASTER: '0x000Ae314E2A2172a039B26378814C252734f556A',
  },
  polygon: {
    USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  },
}

export const NATIVE_TOKENS = {
  sol: {
    SOL: {
      address: 'So11111111111111111111111111111111111111111',
      name: 'Solana',
      token: 'SOL',
      symbol: 'SOL',
    },
    USDC: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USDC',
      token: 'USDC',
      symbol: 'USDC',
    },
    USDT: {
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      name: 'USDT',
      token: 'USDT',
      symbol: 'USDT',
    },
    USDS: {
      address: 'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA',
      name: 'USDS',
      token: 'USDS',
      symbol: 'USDS',
    },
  },
  eth: {
    ETH: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum',
      token: 'ETH',
      symbol: 'ETH',
    },
    USDC: {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      name: 'USDC',
      token: 'USDC',
      symbol: 'USDC',
    },
    WETH: {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'Wrapped Ether',
      token: 'WETH',
      symbol: 'WETH',
    },
  },
  arb: {
    ETH: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Arbitrum Ethereum',
      token: 'ETH',
      symbol: 'ETH',
    },
    WETH: {
      address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      name: 'Arbitrum Wrapped Ether',
      token: 'WETH',
      symbol: 'WETH',
    },
    USDC: {
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      name: 'Arbitrum USDC',
      token: 'USDC',
      symbol: 'USDC',
    },
  },
  bsc: {
    BNB: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'BNB',
      token: 'BNB',
      symbol: 'BNB',
    },
    WBNB: {
      address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      name: 'BNB',
      token: 'BNB',
      symbol: 'BNB',
    },
  },
  mon: {
    MON: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Monad',
      token: 'MON',
      symbol: 'MON',
    },
  },
}

export const PAGE_SIZE = 20

export const SOL_NATIVE_TOKENS = [
  'So11111111111111111111111111111111111111111',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT on Solana
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
  'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA', // USDS on Solana
]

export const ARB_NATIVE_TOKENS = [
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC on Arbitrum
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // ETH on Arbitrum
  '0x0000000000000000000000000000000000000000', // Native ETH on Arbitrum
]

export const ETH_NATIVE_TOKENS = [
  '0x0000000000000000000000000000000000000000',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
]

export const BSC_NATIVE_TOKENS = [
  '0x0000000000000000000000000000000000000000',
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
]

export const MON_NATIVE_TOKENS = [
  '0x0000000000000000000000000000000000000000',
  '0x3bd359c1119da7da1d913d1c4d2b7c461115433a',
]

export enum CACHE_KEY {
  WALLET_FAVORITE = 'wallet-favourite',
  WALLET_COPY_TRADE = 'wallet-copy-trade',
  MAINTENANCE_SCHEDULE = 'maintenance_schedule',
}

export const APP_STORE_URL = 'https://apps.apple.com/vn/app/xbit-buy-bitcoin-meme-coins/id6747072897'
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.xtech.xbitmobile&hl=en'

export enum Browser {
  CHROME = 'chrome',
  EDGE = 'edge',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  UNKNOWN = 'unknown',
}
