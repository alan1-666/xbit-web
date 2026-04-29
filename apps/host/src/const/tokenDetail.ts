import { ChainIds } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding.ts'

export const TYPE_BUY = 'Buy'
export const TYPE_SELL = 'Sell'
export const TYPE_TPSL = 'TPSL'
export const TYPE_ADD_LIQUIDITY = 'Add'
export const TYPE_REMOVE_LIQUIDITY = 'Remove'
export const TYPE_BURN = 'Burn'

export const EDITING_ALIAS_POOL = 'EDIT_ALIAS_POOL'
export const REFETCH_ALIAS_POOL = 'FetchAliasPool'
export const EDITING_ALIAS_HOLDER = 'EDIT_ALIAS_HOLDER'
export const REFETCH_ALIAS_HOLDER = 'FetchAliasHolder'
export const EDITING_ALIAS_LATEST = 'EDIT_ALIAS_LATEST'
export const REFETCH_ALIAS_LATEST = 'FetchAliasLatest'
export const EDITING_ALIAS_TRADES = 'EDIT_ALIAS_TRADES'
export const REFETCH_ALIAS_TRADES = 'FetchAliasTrades'

export const REFETCH_FOLLOWED_HOLDERS = 'FetchFollowedHolders'

export const MOCK_PORTFOLIO: PortfolioDTO = {
  avgMarketCap: 0,
  avgPriceUsd: 0,
  chainId: ChainIds.Solana,
  decimals: 0,
  isProcessing: false,
  liquidity: 0,
  logoUrl: '',
  maxHoldingQty: 0,
  price: 0,
  price24hChange: 0,
  realizedPnL: 0,
  symbol: '',
  token: '',
  totalBaseAmount: 0,
  totalBuyBaseAmount: 0,
  totalBuyQty: 0,
  totalBuyUsd: 0,
  totalSellBaseAmount: 0,
  totalSellQty: 0,
  totalSellUsd: 0,
  totalTradedQty: 0,
  totalUsdValue: 0,
  updatedAt: '',
  userAddress: '',
  estimateOrderValue: 0,
  isSellAll: false,
  isXStock: false,
  isLastUpdated: false,
  isFromPendingOrder: false,
}
