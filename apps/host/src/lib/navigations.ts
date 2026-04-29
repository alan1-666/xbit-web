import { getPath } from '@/lib/utils.ts'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'

export const NAVIGATIONS = {
  memeTokenDetail: (chainId: number, address: string) => {
    return getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: address, chain: CHAIN_SYMBOLS[chainId] })
  },
  memeWalletDetail: (address: string) => {
    return `${APP_PATH.MEME_WALLET}/${address}`
  },
  referrals: () => {
    return APP_PATH.NODE_AGENT
  },
  airdrop: () => {
    return APP_PATH.LOYALTY
  },
  redpacket: () => {
    return APP_PATH.REDPACKET
  },
  tradeRewards: () => {
    return APP_PATH.TRADE_REWARDS
  },
  perpetual: {
    details: (symbol: string) => {
      return `${APP_PATH.FUTURES}/${symbol}`
    },
    smartMoney: () => {
      return APP_PATH.SMART_MONEY
    },
    supervisory: () => {
      return APP_PATH.SUPERVISORY
    },
    fundingRate: () => {
      return '/funding-rate'
    },
  },
  meme: {
    discover: () => {
      return APP_PATH.MEME_DISCOVER + '/meme'
    },
    smartMoney: () => {
      return APP_PATH.MEME_SMART_MONEY
    },
    monitoringRealtimeTx: () => {
      return APP_PATH.MEME_MONITORING + '?tab=realTimeTransactions'
    },
    assets: () => {
      return APP_PATH.ASSETS
    },
  },
  xStocks: {
    discover: () => {
      return APP_PATH.XSTOCKS + '?page=popular'
    },
  },
  prediction: {
    home: () => {
      return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.HOME}`
    },
    breaking: () => {
      return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.BREAKING}`
    },
    new: () => {
      return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.NEW}`
    },
    favorites: () => {
      return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.FAVORITES}`
    },
    events: (categoryId: string) => {
      return `${APP_PATH.PREDICTION.ROOT}${getPath(APP_PATH.PREDICTION.EVENTS, { categoryId })}`
    },
    eventDetails: (eventId: string) => {
      return `${APP_PATH.PREDICTION.ROOT}${getPath(APP_PATH.PREDICTION.EVENT_DETAILS, { eventId })}`
    },
    marketDetails: (eventId: string, marketId: string) => {
      return `${APP_PATH.PREDICTION.ROOT}${getPath(APP_PATH.PREDICTION.EVENT_DETAILS, { eventId })}?market=${marketId}`
    },
    portfolio: () => {
      return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.PORTFOLIO}`
    },
    portfolioUser: (userId: string) => {
      return `${APP_PATH.PREDICTION.ROOT}${getPath(APP_PATH.PREDICTION.USER_PROFILE, { userId })}`
    },
    search: (q: string) => {
      return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.SEARCH}?q=${encodeURIComponent(q)}`
    },
    sports: {
      root: () => {
        return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.SPORTS}`
      },
      live: () => {
        return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.SPORTS}/live`
      },
      category: (slug: string, tab: string = 'games') => {
        return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.SPORTS}/${slug}/${tab}`
      },
      futures: (slug: string) => {
        return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.SPORTS}/futures/${slug}`
      },
      event: (slug: string) => {
        return `${APP_PATH.PREDICTION.ROOT}${APP_PATH.PREDICTION.SPORTS}/event/${slug}`
      },
    },
    assets: () => {
      return `${APP_PATH.PREDICTION_ASSETS}`
    },
    deposit: () => {
      return APP_PATH.PREDICTION_DEPOSIT
    },
  },
}
