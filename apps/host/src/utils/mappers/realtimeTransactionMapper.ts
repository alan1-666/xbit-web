import { TransactionDto } from '@/@generated/gql/graphql-meme2.ts'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'

const txTypeMap: Record<string, RealtimeTransactionType> = {
  Buy: RealtimeTransactionType.Buy,
  Sell: RealtimeTransactionType.Sell,
  Add: RealtimeTransactionType.AddLiquidity,
  Remove: RealtimeTransactionType.RemoveLiquidity,
  Burn: RealtimeTransactionType.Burn,
}

export const RealtimeTransactionMapper = {
  fromTradingTransaction: (transaction: TransactionDto) => {
    return {
      ...transaction,
      timestamp: transaction.timestamp ? +transaction.timestamp : Date.now(), // Convert to seconds
      type: txTypeMap[transaction.type] || RealtimeTransactionType.Buy,
      maker: transaction.maker,
      baseAmount: transaction.baseAmount ? parseFloat(transaction.baseAmount) : 0,
      quoteAmount: transaction.quoteAmount ? parseFloat(transaction.quoteAmount) : 0,
      quoteToken: transaction.quoteToken || '',
      nativeAmount: transaction.nativeAmount ? parseFloat(transaction.nativeAmount) : 0,
      usdPrice: transaction.usdPrice ? parseFloat(transaction.usdPrice) : 0,
      volumeUsd: transaction.usdAmount ? parseFloat(transaction.usdAmount) : 0,
      txCount: transaction.tx24h || 0, // Placeholder, should be updated by another topic
      txHash: transaction.txHash || '',
      isSmartMoney: transaction.isSmartMoney || false,
      isWhale: transaction.isWhale || false,
      isSniper: false,
      isBundler: transaction.isDev || false,
      isDev: transaction.isDev || false,
      isNewWallet: transaction.isFreshWallet || false,
      isKOL: transaction.isKOL || false,
      isInsider: transaction.isInsider || false,
      isTopTrader: transaction.isTopTrader || false,
      dex: transaction.dex,
      isKlineTx: transaction.isKlineTx ?? true,
      reasonFiltering: transaction.reasonFiltering,
      logIndex: transaction.logIndex,
      eventIndex: transaction.eventIndex,
      holderPct: transaction.holderPct ? +transaction.holderPct : 0,
      source: 'api',
      fetchedAt: Date.now(),
    } as RealtimeTransaction
  },
}
