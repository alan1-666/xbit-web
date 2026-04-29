import { Order, TransactionType } from '@/@generated/gql/graphql-trading'
import Decimal from 'decimal.js'
import { ChainIds } from './enums'
import { getDefaultDecimalsByChain, TYPE_CHAIN } from '@/lib/blockchain'

export interface PortfolioDTO {
  userAddress: string
  token: string
  symbol: string
  totalBaseAmount: number
  avgPriceUsd: number
  totalBuyBaseAmount: number | string
  totalSellBaseAmount: number
  avgMarketCap: number
  totalUsdValue: number
  holdingRatio: number
  totalBuyQty: number
  totalBuyUsd: number
  totalSellQty: number
  totalSellUsd: number
  totalTradedQty: number
  chainId: number
  updatedAt: string // or Date if you plan to convert to Date object
  realizedPnL: number
  logoUrl: string
  maxHoldingQty: number
  price: number
  price24hChange: number
  liquidity?: number
  decimals?: number
  isProcessing?: boolean
  estimateOrderValue?: number | string
  isLastUpdated?: boolean
  isSellAll?: boolean
  isFromPendingOrder?: boolean
  isXStock?: boolean
  lastTxTime?: string
  totalFee?: number | string
  totalFeeUsd?: number | string
  lowLiquidity?: boolean
  balanceUpdatedTime?: number
  completedTxs?: string[]
  isShadow?: boolean
  relatedTxHashes?: string[]
  isQuoteToken?: boolean
  avatarUrl?: string
}

export interface OrderDTO {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  transactionType: 'Sell' | 'Buy'
  type: 'Market' | 'Limit' | 'TPSL' | 'TrailingTPSL'
  baseAddress: string
  quoteAddress: string
  userAddress: string
  limitPrice: string
  openPrice: string
  baseAmount: string
  quoteAmount: string
  exit: string
  tp: string
  sl: string
  openSubmitMeta: string
  closeSubmitMeta: string
  filledAt: string | null
  exitAt: string | null
  status: string
  txid: string
  openTxid: string
  closeTxid: string
  chainId: string
  baseDecimal: number
  baseSymbol: string
  quoteSymbol: string
  slippage: string
  triggerPrice: string
  callbackRate: string
  trailingOrderTriggered: boolean
  triggerAt: string | null
  mevProtect: boolean
  priorityFeePrice: string
  doublePrincipalAfterPurchase: boolean
  openBaseUsdRate: string
  openQuoteUsdRate: string
  openPriceUsd: string
  openPriceQuote: string
  closeBaseUsdRate: string
  closeQuoteUsdRate: string
  closePriceQuote: string
  closePriceUsd: string
  marketCap: string
  totalFee: string
  totalFeeUsd: string
  slippageLoss: string
  pnl: string
  avgCostPrice: string
  gasFee: string
  pumpFee: string
  antiMevFee: string
  platformFee: string
  priorityFee: string
}

export interface WalletTokenData {
  address: string
  token: string
  symbol: string
  balance: number // from decimal.Decimal
  rawBalance: string
  totalUsdValue: number
  buys: number
  totalBuyQty: number
  totalBuyUsd: number
  sells: number
  totalSellQty: number
  totalSellUsd: number
  totalTradedQty: number
  avgPriceUsd: number
  marketCapSum: number
  avgMarketCap: number
  chainId: number
  updatedAt: string // use Date if you plan to parse it
  // New properties added
  logoUrl: string
  lastTxTime: string
  maxHoldingQty: number
  realizedPnL: number
  realizedPnL7D: string
  realizedPnL30D: string
  list30DWins: number[]
  list30DLosses: number[]
  listRealizedPnL30D: string[]
  listAvgPriceUsd7D: string[]
  total30DWins: number
  total30DLosses: number
  total7DWins: number
  total7DLosses: number
  tags: string[]
  totalBaseAmount: number
  liquidity: number
  totalFee: number | string
  totalFeeUsd: number | string
  completedTxs?: string[]
}

export type TTLData<T> = {
  value: T
  expiry: number
}

export type TTLWrapper<T> = {
  value: T[]
  expiry: number
}

export type PendingOrder = Order & {
  logoUrl?: string | undefined
  lastTxTime?: string | undefined
}

export type PortfolioWithOrders = PortfolioDTO & {
  pendingOrders: PendingOrder[]
  estimateOrderValue: string | number
  logoUrl?: string | undefined
  isProcessing?: boolean
}

const getChainTypeFromChainId = (chainId: number): TYPE_CHAIN => {
  switch (chainId) {
    case ChainIds.Ethereum:
      return TYPE_CHAIN.ETH
    case ChainIds.Arbitrum:
      return TYPE_CHAIN.ARB
    case ChainIds.Bsc:
      return TYPE_CHAIN.BSC
    default:
      return TYPE_CHAIN.SOLANA
  }
}

function _createPortfolioItem(
  basePortfolio: PortfolioDTO,
  matchedOrders: PendingOrder[],
  priceNativeToken: number,
  chainId: ChainIds,
): PortfolioWithOrders {
  const initialSum = new Decimal(0)
  const totalValue = matchedOrders.reduce((sum, order) => {
    const isBuy = order?.transactionType === TransactionType.Buy
    const decimal = getDefaultDecimalsByChain(getChainTypeFromChainId(chainId))
    const baseAmount = isBuy
      ? new Decimal(order.quoteAmount)
          .mul(priceNativeToken)
          .div(order?.openPrice)
          .toDecimalPlaces(decimal, Decimal.ROUND_DOWN)
      : order.baseAmount
    const amount = new Decimal(baseAmount || 0)
    return isBuy ? sum.plus(amount) : sum.minus(amount)
  }, initialSum)

  let logoUrl: string | undefined
  let latestUpdatedAt: string | undefined
  let symbol: string | undefined
  let price: string | undefined
  if (matchedOrders.length > 0) {
    logoUrl = matchedOrders?.[0]?.logoUrl
    symbol = matchedOrders?.[0]?.baseSymbol
    price = matchedOrders?.[0]?.openPrice
    latestUpdatedAt = matchedOrders.reduce((latestTime, order) => {
      if (!latestTime || order.updatedAt > latestTime) {
        return order.updatedAt
      }
      return latestTime
    }, matchedOrders[0].updatedAt)
  }

  return {
    ...basePortfolio,
    pendingOrders: matchedOrders,
    isProcessing: matchedOrders.length > 0,
    estimateOrderValue: totalValue.toString(),
    logoUrl: logoUrl ?? '',
    lastTxTime: matchedOrders.length > 0 && latestUpdatedAt ? latestUpdatedAt : basePortfolio.lastTxTime,
    totalBaseAmount: basePortfolio?.totalBaseAmount ? basePortfolio?.totalBaseAmount : 0,
    chainId: basePortfolio?.chainId ? basePortfolio?.chainId : chainId,
    symbol: basePortfolio?.symbol ? basePortfolio?.symbol : (symbol ?? ''),
    price: basePortfolio?.price ? basePortfolio?.price : price,
  } as PortfolioWithOrders
}

export function mergePortfolioWithPendingOrders(
  portfolios: PortfolioDTO[],
  orders: PendingOrder[],
  priceNativeToken: number,
  chainId: ChainIds,
  shadowHoldingUpdates: PortfolioDTO[],
  currentData?: PortfolioDTO,
): PortfolioWithOrders[] {
  const ordersMap = new Map<string, PendingOrder[]>()
  for (const order of orders) {
    const address = order.baseAddress
    if (address) {
      if (!ordersMap.has(address)) ordersMap.set(address, [])
      ordersMap.get(address)?.push(order)
    }
  }

  const shadowUpdatesMap = new Map<string, PortfolioDTO>()
  for (const update of shadowHoldingUpdates) {
    if (update.token) shadowUpdatesMap.set(update.token, update)
  }

  const existingTokensInPortfolios = new Set(portfolios.map((p) => p.token))

  const existingItems = portfolios.map((base) => {
    const token = base.token
    let mergedBase = { ...base }

    if (currentData && currentData.token === token) {
      mergedBase = { ...mergedBase, ...currentData }
    }

    const shadow = shadowUpdatesMap.get(token)
    if (shadow) mergedBase = { ...mergedBase, ...shadow }

    return _createPortfolioItem(mergedBase, ordersMap.get(token) || [], priceNativeToken, chainId)
  })

  const newItemsFromOrders: PortfolioWithOrders[] = []

  const potentialNewTokens = new Set([...ordersMap.keys(), ...shadowUpdatesMap.keys()])

  for (const token of potentialNewTokens) {
    const isAlreadyInPortfolios = existingTokensInPortfolios.has(token)
    const isCurrentFocusToken = currentData && currentData.token === token

    if (!isAlreadyInPortfolios && !isCurrentFocusToken) {
      const shadow = shadowUpdatesMap.get(token)
      const basePortfolio: PortfolioDTO = {
        token: token,
        lastTxTime: '',
        isShadow: true,
        totalBaseAmount: 0,
        ...(shadow || {}),
      } as PortfolioDTO

      const item = _createPortfolioItem(basePortfolio, ordersMap.get(token) || [], priceNativeToken, chainId)
      newItemsFromOrders.push(item)
    }
  }

  return [...newItemsFromOrders, ...existingItems]
}
