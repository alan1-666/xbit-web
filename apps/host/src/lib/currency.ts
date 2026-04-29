import { CurrencyUnit } from '@/types/currency'
import { TYPE_CHAIN } from './blockchain'
import { FilterTransactionAmountType } from '@/types/enums'

export function getDataUnitByChain(chain: TYPE_CHAIN): CurrencyUnit {
  if (chain === TYPE_CHAIN.SOLANA) return 'SOL'
  if (chain === TYPE_CHAIN.ETH) return 'ETH'
  if (chain === TYPE_CHAIN.BSC) return 'BNB'
  if (chain === TYPE_CHAIN.MON) return 'MON'
  return 'USD'
}

export function getFilterTransactionAmountTypeByDataUnit(dataUnit: CurrencyUnit): FilterTransactionAmountType {
  switch (dataUnit) {
    case 'SOL':
      return FilterTransactionAmountType.SOL
    case 'ETH':
      return FilterTransactionAmountType.ETH
    case 'BNB':
      return FilterTransactionAmountType.BNB
    case 'MON':
      return FilterTransactionAmountType.MON
    case 'USD':
      return FilterTransactionAmountType.USDT
    default:
      return FilterTransactionAmountType.USDT
  }
}
