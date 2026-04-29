import { TokenMarketStats, TokenTrending, WalletTokenBalanceMsg } from '@/types/token.ts'
import {
  TYPE_ADD_LIQUIDITY,
  TYPE_BURN,
  TYPE_BUY,
  TYPE_REMOVE_LIQUIDITY,
  TYPE_SELL,
  TYPE_TPSL,
} from '@const/tokenDetail.ts'
import { tConst } from '@/utils/helpers.ts'
import { PortfolioDTO, WalletTokenData } from '@/types/holding.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { LiquidityChartDto } from '@/@generated/gql/graphql-core.ts'
import { ChainType } from '@/@generated/gql/graphql-meme2.ts'
import { Order, OrderType } from '@/@generated/gql/graphql-trading.ts'
import dayjs from 'dayjs'
import { PendingOrder } from '@/components/myPositions/useHoldingData'

export function mapTokenTrendingToMarketStats(token: TokenTrending): TokenMarketStats {
  return {
    chainId: token?.chainId,
    createdTime: token?.createdTime,
    firstPrice: token?.firstPrice?.toString(),
    initLiquidity: token?.initLiquidity?.toString(),
    internalMarketProgress: token?.internalMarketProgress,
    liquidity: token?.liquidity?.toString(),
    marketcap: token?.marketcap,
    marketcap5m: token?.marketcap, // No separate marketcap5m in TokenTrending, using marketcap
    numberOfHolder: token?.numberOfHolder,
    price: token?.price,
    price1hAgo: token?.price1hAgo?.toString(),
    price1hChange: token?.price1hChange,
    price1mAgo: token?.price1mAgo?.toString(),
    price1mChange: token?.price1mChange,
    price24hAgo: token?.price24hAgo?.toString(),
    price24hChange: token?.price24hChange,
    price5mAgo: token?.price5mAgo?.toString(),
    price5mChange: token?.price5mChange,
    price6hAgo: '0', // TokenTrending has no price6hAgo, default to "0" or handle as needed
    price6hChange: token?.price6hChange,
    token: token?.token,
    updatedAt: new Date()?.toISOString(), // You can replace with your actual update logic
    volume1h: token?.volume1h?.toString(),
    volume1m: token?.volume1m?.toString(),
    volume24h: token?.volume24h?.toString(),
    volume5m: token?.volume5m?.toString(),
    volume6h: token?.volume6h?.toString(),
  }
}

export function mapTransactionType(type: string): string {
  switch (type) {
    case TYPE_BUY:
      return tConst('detail.tokenDetail.buy')
    case TYPE_SELL:
      return tConst('detail.tokenDetail.sell')
    case TYPE_TPSL:
      return tConst('detail.tokenDetail.tpsl')
    case TYPE_ADD_LIQUIDITY:
      return tConst('detail.tokenDetail.addLiquidity')
    case TYPE_REMOVE_LIQUIDITY:
      return tConst('detail.tokenDetail.removeLiquidity')
    case TYPE_BURN:
      return tConst('detail.tokenDetail.burn')
    default:
      return type
  }
}

export const mapWalletTokenDataToPortfolio = (walletData: WalletTokenData | undefined): PortfolioDTO | undefined => {
  if (!walletData) {
    return undefined
  }
  return {
    ...walletData,
    // decimals: 0,
    // price: 0,
    // price24hChange: 0,
    logoUrl: walletData?.logoUrl,
    realizedPnL: walletData?.realizedPnL,
    totalBuyQty: walletData?.totalBuyQty,
    totalBuyUsd: walletData?.totalBuyUsd,
    totalSellQty: walletData?.totalSellQty,
    totalSellUsd: walletData?.totalSellUsd,
    totalFeeUsd: walletData?.totalFeeUsd,
    totalTradedQty: walletData?.totalTradedQty,
    totalUsdValue: walletData?.totalUsdValue,
    updatedAt: walletData?.updatedAt,
    maxHoldingQty: walletData?.maxHoldingQty,
    userAddress: walletData?.address,
    token: walletData?.token,
    totalBaseAmount: walletData?.balance,
    avgPriceUsd: walletData?.avgPriceUsd,
    totalBuyBaseAmount: walletData?.totalBuyQty,
    totalSellBaseAmount: walletData?.totalSellQty,
    avgMarketCap: walletData?.avgMarketCap,
    symbol: walletData?.symbol,
    chainId: walletData?.chainId,
    liquidity: walletData?.liquidity,
    // isProcessing: false,
    // estimateOrderValue: 0,
    // isSellAll: false,
    totalFee: walletData?.totalFee || 0,
  }
}

export const mapOrderToPortfolio = (
  order: PendingOrder | any,
  rateSolU: number,
  tokenPrice: number = 1,
  isSuccess: boolean = false,
): PortfolioDTO | undefined => {
  if (!order) {
    return undefined
  }

  const openPrice = order?.marketCap / Math.pow(10, 6)
  const adjustBalance =
    order?.baseAmount && Number(order?.baseAmount) > 0
      ? 0
      : (order?.quoteAmount * rateSolU) / (openPrice != 0 ? openPrice : tokenPrice)
  return {
    avgMarketCap: order?.marketCap,
    avgPriceUsd: order?.openPrice ? order?.openPrice : openPrice != 0 ? openPrice : tokenPrice,
    chainId: Number(order?.chainId),
    decimals: 0,
    isProcessing: !isSuccess,
    liquidity: 0,
    logoUrl: order?.logoUrl,
    maxHoldingQty: adjustBalance,
    price: 0,
    price24hChange: 0,
    realizedPnL: 0,
    openPrice: order?.openPrice ?? 0,
    symbol: order?.baseSymbol,
    token: order?.baseAddress,
    totalBaseAmount: order?.totalBaseAmount ?? 0,
    totalBuyBaseAmount: order?.totalBuyBaseAmount ?? 0,
    totalBuyQty: order?.totalBuyQty ?? 0,
    totalBuyUsd: order?.totalBuyUsd ?? 0,
    totalSellBaseAmount: order?.totalSellBaseAmount ?? 0,
    totalSellQty: order?.totalSellQty ?? 0,
    totalSellUsd: order?.totalSellUsd ?? 0,
    totalTradedQty: order?.totalTradedQty ?? 0,
    totalUsdValue: Number(adjustBalance * openPrice),
    updatedAt: order?.updatedAt,
    userAddress: order?.userAddress,
    estimateOrderValue: order?.estimateOrderValue ?? 0,
    isSellAll: false,
    ...order,
  }
}

export const mappingTypeChain = (typeChain: TYPE_CHAIN) => {
  switch (typeChain) {
    case TYPE_CHAIN.SOLANA:
      return ChainType.Solana
    case TYPE_CHAIN.ETH:
      return ChainType.Evm
    case TYPE_CHAIN.BSC:
      return ChainType.Bsc
    case TYPE_CHAIN.MON:
      return ChainType.Mon   
    default:
      return ChainType.Solana
  }
}

export const mapLiquidityChartDataToChartItem = (rawData: LiquidityChartDto[]) => {
  if (!rawData || rawData?.length === 0) return []
  return rawData
    ?.map((item) => ({
      time: dayjs(item?.liquidity1hAt).format('HH:mm'),
      value: item?.liquiditySum1h,
      hour: dayjs(item?.liquidity1hAt).hour(),
      rawDate: item?.liquidity1hAt,
    }))
    .reverse()
}
