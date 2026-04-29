// TODO: Refactor this function to return list of token sources
import { TokenSource } from '@/@generated/gql/graphql-core.ts'
import { FilterFormData, SortType } from '@components/discover/filter/FilterFormData.ts'

export const dexListToTokenSource = (dexList: string[]) => {
  if (dexList.length === 0) return TokenSource.All
  if (dexList.includes('Pumpfun')) return TokenSource.Pumpfun
  if (dexList.includes('Moonshot')) return TokenSource.Moonshot
  if (dexList.includes('Raydium')) return TokenSource.Raydium
  if (dexList.includes('PumpSwap')) return TokenSource.Raydium
  return TokenSource.All
}

export const fieldMapper = (field: keyof FilterFormData, timeframe: string) => {
  switch (field) {
    case 'marketCap':
      return 'marketcap'
    case 'holders':
      return 'numberOfHolder'
    case 'transactions':
      return `txs${timeframe}`
    case 'volumes':
      return `volume${timeframe}`
    case 'liquidityPool':
      return 'liquidity'
    case 'progress':
      return 'internalMarketProgress'
    case 'price':
      return 'price'
    case 'price1hChange':
      return 'price1hChange'
    case 'symbol':
      return 'symbol'
  }
}

export const toSortBy = (sortBy: { field: keyof FilterFormData; type: SortType }, timeframe: string) => {
  const { field, type } = sortBy
  return `${type === 'asc' ? '' : '-'}${fieldMapper(field, timeframe)}`
}

export const toMarketCap = (filter: FilterFormData) => {
  if (!filter.marketCap) return undefined
  const { min, max } = filter.marketCap
  return {
    marketValueFrom: min !== undefined ? min.toString() : undefined,
    marketValueTo: max !== undefined ? max.toString() : undefined,
  }
}

export const toLiquidityPool = (filter: FilterFormData) => {
  if (!filter.liquidityPool) return undefined
  const { min, max } = filter.liquidityPool
  return {
    liquidityPoolFrom: min !== undefined ? min.toString() : undefined,
    liquidityPoolTo: max !== undefined ? max.toString() : undefined,
  }
}

export const toHolders = (filter: FilterFormData) => {
  if (!filter.holders) return undefined
  const { min, max } = filter.holders
  return {
    numberOfHolderFrom: min !== undefined ? min : undefined,
    numberOfHolderTo: max !== undefined ? max : undefined,
  }
}

export const toTransactions = (filter: FilterFormData) => {
  if (!filter.transactions) return undefined
  const { min, max } = filter.transactions
  return {
    transactionFrom: min !== undefined ? min : undefined,
    transactionTo: max !== undefined ? max : undefined,
  }
}

export const toVolumes = (filter: FilterFormData) => {
  if (!filter.volumes) return undefined
  const { min, max } = filter.volumes
  return {
    tradingVolumeFrom: min !== undefined ? min.toString() : undefined,
    tradingVolumeTo: max !== undefined ? max.toString() : undefined,
  }
}

export const toProgress = (filter: FilterFormData) => {
  if (!filter.progress) return undefined
  const { min, max } = filter.progress
  return {
    internalMarketProgressFrom: min !== undefined ? min : undefined,
    internalMarketProgressTo: max !== undefined ? max : undefined,
  }
}

export const filterToString = (filter: FilterFormData) => {
  const filterString = []
  if (filter.marketCap) {
    filterString.push(`Market Cap: ${filter.marketCap.min} - ${filter.marketCap.max}`)
  }
  if (filter.holders) {
    filterString.push(`Holders: ${filter.holders.min} - ${filter.holders.max}`)
  }
  if (filter.transactions) {
    filterString.push(`Transactions: ${filter.transactions.min} - ${filter.transactions.max}`)
  }
  if (filter.volumes) {
    filterString.push(`Volumes: ${filter.volumes.min} - ${filter.volumes.max}`)
  }
  if (filter.liquidityPool) {
    filterString.push(`Liquidity Pool: ${filter.liquidityPool.min} - ${filter.liquidityPool.max}`)
  }
  if (filter.progress) {
    filterString.push(`Progress: ${filter.progress.min} - ${filter.progress.max}`)
  }
  filterString.push(`Dex: ${filter.dexList.join(', ')}`)
  if (filter.sortBy) {
    filterString.push(`Sort By: ${filter.sortBy.field} (${filter.sortBy.type})`)
  }
  return filterString.join(', ')
}
