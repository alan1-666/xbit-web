export type SortType = 'desc' | 'asc'

export type ChainType = 'ALL' | 'EVM' | 'SOLANA'

export type TransactionType = 'All' | 'Buy' | 'Sell' | 'AddLiquidity' | 'RemoveLiquidity'

export const TRANSACTION_TYPES = {
  all: 'All',
  buy: 'Buy',
  sell: 'Sell',
  addLiquidity: 'AddLiquidity',
  removeLiquidity: 'RemoveLiquidity',
}

export const CHAIN_TYPES = {
  all: 'ALL',
  evm: 'EVM',
  sol: 'SOLANA',
}