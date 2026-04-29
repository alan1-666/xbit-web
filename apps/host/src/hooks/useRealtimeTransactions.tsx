import { useEffect, useMemo, useRef } from 'react'
import { useSubscription } from '@/lib/mqtt'
import {
  RealtimeTransaction,
  RealtimeTransactionType,
  transactionsHistoryActions,
} from '@/redux/modules/transactionsHistory.slice.ts'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/redux/store'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ReasonFiltering } from '@/@generated/gql/graphql-future.ts'

type NewDetailTransactionType = 'buy' | 'sell' | 'add' | 'remove' | 'burn'

export type NewDetailTransaction = {
  reasonFiltering: ReasonFiltering
  timestamp: string
  chainId: number
  txHash: string
  type: NewDetailTransactionType
  maker: string
  baseAmount: string
  quoteAmount: string
  quoteToken: string
  price: string
  usdAmount: string
  usdPrice: string
  liquidity: string
  isHugeValue: boolean
  isWhale: boolean
  isDev: boolean
  isFreshWallet: boolean
  isInsider: boolean
  isNativeWallet: boolean
  isNewActivity: boolean
  isKOL: boolean
  isSmartMoney: boolean
  isTopTrader: boolean
  holderPct: string
  totalSupply: string
  decimals: number
  nativeAmount: string
  nativePrice: string
  isPoolContract: boolean
  isSingleSideTransaction: boolean
  logIndex: number
  eventIndex?: number
  ts?: number // timestamp in milliseconds
  dex?: string
}

export type TransactionUpdate = {
  txid: string
} & Partial<{
  isInsider: boolean
  eventIndex: number
  isBot: boolean
  isHugeValue: boolean
  isWhale: boolean
  isDev: boolean
  isFreshWallet: boolean
  isNativeWallet: boolean
  isNewActivity: boolean
  isKOL: boolean
  isSmartMoney: boolean
  isTopTrader: boolean
}>

// const newDetailTransactionTypeMap: Record<NewDetailTransactionType, RealtimeTransactionType> = {
//   buy: RealtimeTransactionType.Buy,
//   sell: RealtimeTransactionType.Sell,
//   add: RealtimeTransactionType.AddLiquidity,
//   remove: RealtimeTransactionType.RemoveLiquidity,
//   burn: RealtimeTransactionType.Burn,
// }

export type NewTransaction = {
  reasonFiltering: any
  baseAmount: string
  chainId: number
  isDev: boolean
  isFreshWallet: boolean
  isInsider: boolean
  isHugeValue: boolean
  isKOL: boolean
  isNativeWallet: boolean
  isNewActivity: boolean
  isPoolContract: boolean
  isSmartMoney: boolean
  isTopTrader: boolean
  isWhale: boolean
  logIndex: number
  maker: string
  priceUsd: string
  quoteAmount: string
  quoteToken: string
  timestamp: number
  token: string
  transactionType: 'Buy' | 'Sell'
  txid: string
  usdAmount: string
  eventIndex?: number
  nativeAmount: string
  isKlineTx?: boolean
  dex: string
  ts: number // timestamp in milliseconds
}

// type NewDetailTransactionsPayload = {
//   data: NewDetailTransaction[]
// }

type NewTransactionsPayload = NewTransaction[]

const sortFn = (a: RealtimeTransaction, b: RealtimeTransaction) => {
  if (a.timestamp === b.timestamp) {
    const bLogIndex = b.logIndex ?? 0
    const aLogIndex = a.logIndex ?? 0
    if (aLogIndex === bLogIndex) {
      return (a.eventIndex ?? 0) - (b.eventIndex ?? 0) // Sort by eventIndex ascending if logIndexes are equal
    }
    return bLogIndex - aLogIndex // Sort by logIndex descending if timestamps are equal
  }
  return +b.timestamp - +a.timestamp // Sort by timestamp descending
}

const mapTransactionType = (type: string): RealtimeTransactionType => {
  switch (type.toLowerCase()) {
    case 'buy':
      return RealtimeTransactionType.Buy
    case 'sell':
      return RealtimeTransactionType.Sell
    case 'add':
      return RealtimeTransactionType.AddLiquidity
    case 'remove':
      return RealtimeTransactionType.RemoveLiquidity
    case 'burn':
      return RealtimeTransactionType.Burn
    default:
      return RealtimeTransactionType.Unknown
  }
}

export const useRealtimeTransactionsListener = (tokenAddress: string) => {
  const transactionsRef = useRef<RealtimeTransaction[]>([])
  const dispatch = useDispatch()
  const { solPrice } = useNativeTokenPrices()
  const activeChainId = useActiveChainId()

  const solPriceRef = useRef<number>(Number(solPrice))

  useEffect(() => {
    solPriceRef.current = Number(solPrice)
  }, [solPrice])

  const topics = useMemo(() => {
    return [
      // `public/transaction/new_detail/${tokenAddress}`,
      `public/transaction/new/${activeChainId}/${tokenAddress}`,
      `public/transaction/update/${activeChainId}/${tokenAddress}`,
    ]
  }, [tokenAddress, activeChainId])

  const { message } = useSubscription(topics)

  useEffect(() => {
    transactionsRef.current = []
  }, [tokenAddress])

  // Handle new transaction events
  useEffect(() => {
    const msg = message?.message
    if (!msg) return
    const topic = message.topic

    // Handle if the message is a transaction
    if (topic === `public/transaction/new/${activeChainId}/${tokenAddress}`) {
      const newTxs = JSON.parse(msg.toString()) as NewTransactionsPayload
      const transactions: RealtimeTransaction[] = newTxs
        .map((tx) => {
          return {
            timestamp: tx.ts,
            type: mapTransactionType(tx.transactionType),
            volumeUsd: Number(tx.usdAmount || 0),
            nativeAmount: tx.nativeAmount ? +tx.nativeAmount : 0,
            usdPrice: Number(tx.priceUsd || 0),
            baseAmount: Number(tx.baseAmount || 0),
            maker: tx.maker,
            txCount: 0, // Placeholder, should be updated by another topic
            txHash: tx.txid,
            isSmartMoney: tx.isSmartMoney || false,
            isWhale: tx.isWhale || false,
            isSniper: tx.isDev, // Temporary mapping sniper as dev
            isBundler: tx.isDev, // Temporary mapping bundler as dev
            isDev: tx.isDev || false,
            isNewWallet: tx.isFreshWallet || false,
            isKOL: tx.isKOL || false,
            isInsider: tx.isInsider || false,
            source: 'ws',
            eventIndex: tx.eventIndex,
            logIndex: tx.logIndex,
            isTopTrader: tx.isTopTrader,
            isKlineTx: tx.isKlineTx,
            reasonFiltering: tx?.reasonFiltering,
            dex: tx.dex,
            quoteAmount: Number(tx.quoteAmount || 0),
            quoteToken: tx.quoteToken,
            fetchedAt: Date.now(),
          } as RealtimeTransaction
        })
        .filter((tx) => tx.nativeAmount > 0 && tx.usdPrice > 0 && tx.volumeUsd > 0) // Filter out transactions with zero price or amount
      transactionsRef.current = transactions.concat(transactionsRef.current).slice(0, 1000).sort(sortFn) // Limit to 1000 transactions
    } else if (topic === `public/transaction/new_detail/${tokenAddress}`) {
      // const payload = JSON.parse(msg.toString()) as NewDetailTransactionsPayload
      // const newTxs = payload.data.filter((tx) => {
      //   if (tx.type === 'buy' || tx.type === 'sell') {
      //     // Filter buy/sell transactions
      //     return false
      //   }
      //   // Filter out transactions with zero price or amount
      //   return +tx.usdPrice > 0 && +tx.usdAmount > 0 && +tx.nativeAmount > 0
      // })
      //
      // const transactions: RealtimeTransaction[] = newTxs.map((tx) => {
      //   return {
      //     timestamp: tx.ts ?? dayjs(tx.timestamp).valueOf(),
      //     type: newDetailTransactionTypeMap[tx.type],
      //     volumeUsd: Number(tx.usdAmount || 0),
      //     nativeAmount: Number(tx.nativeAmount || 0),
      //     usdPrice: Number(tx.usdPrice || 0),
      //     baseAmount: Number(tx.baseAmount || 0),
      //     maker: tx.maker,
      //     txCount: 0, // Placeholder, should be updated by another topic
      //     txHash: tx.txHash,
      //     isSmartMoney: tx.isSmartMoney || false,
      //     isWhale: tx.isWhale || false,
      //     isSniper: tx.isDev, // Temporary mapping sniper as dev
      //     isBundler: tx.isDev, // Temporary mapping bundler as dev
      //     isDev: tx.isDev || false,
      //     isNewWallet: tx.isFreshWallet || false,
      //     isKOL: tx.isKOL || false,
      //     isInsider: tx.isInsider || false,
      //     isTopTrader: tx.isTopTrader || false,
      //     source: 'new_detail' as 'new' | 'new_detail',
      //     eventIndex: tx.eventIndex,
      //     logIndex: tx.logIndex,
      //     holderPct: tx.holderPct ? Number(tx.holderPct) : undefined,
      //     isKlineTx: true,
      //     reasonFiltering: tx?.reasonFiltering,
      //     quoteAmount: Number(tx.quoteAmount || 0),
      //     quoteToken: tx.quoteToken,
      //   }
      // })
      // transactionsRef.current = transactions.concat(transactionsRef.current).slice(0, 1000).sort(sortFn) // Limit to 1000 transactions
      // for (const tx of newTxs) {
      //   const existingTxIndex = transactionsRef.current.findIndex(
      //     (t) => t.txHash === tx.txHash && t.eventIndex === tx.eventIndex,
      //   )
      //   const existingTx = existingTxIndex !== -1 ? transactionsRef.current[existingTxIndex] : null
      //   if (existingTx) {
      //     // Update existing transaction
      //     const updatedTransaction: RealtimeTransaction = {
      //       ...existingTx,
      //       isKOL: tx.isKOL || existingTx.isKOL,
      //       isSmartMoney: tx.isSmartMoney || existingTx.isSmartMoney,
      //       isWhale: tx.isWhale || existingTx.isWhale,
      //       isDev: tx.isDev || existingTx.isDev,
      //       isNewWallet: tx.isFreshWallet || existingTx.isNewWallet,
      //       isInsider: tx.isInsider || existingTx.isInsider,
      //       isSniper: tx.isDev || existingTx.isSniper, // Temporary mapping sniper as dev
      //       isBundler: tx.isDev || existingTx.isBundler, // Temporary mapping bundler as dev
      //       isTopTrader: tx.isTopTrader || existingTx.isTopTrader,
      //       logIndex: tx.logIndex || existingTx.logIndex,
      //       eventIndex: tx.eventIndex || existingTx.eventIndex,
      //       holderPct: tx.holderPct ? Number(tx.holderPct) : existingTx.holderPct,
      //       isKlineTx: true,
      //     }
      //     // Update the existing transaction in the array
      //     transactionsRef.current = transactionsRef.current.map((t) =>
      //       t.txHash === tx.txHash && t.eventIndex === tx.eventIndex ? updatedTransaction : t,
      //     )
      //   } else {
      //     // Add new transaction
      //     const newTransaction: RealtimeTransaction = {
      //       timestamp: dayjs(tx.timestamp).valueOf(),
      //       type: newDetailTransactionTypeMap[tx.type],
      //       volumeUsd: Number(tx.usdAmount || 0),
      //       nativeAmount: Number(tx.nativeAmount || 0),
      //       usdPrice: Number(tx.usdPrice || 0),
      //       baseAmount: Number(tx.baseAmount || 0),
      //       maker: tx.maker,
      //       txCount: 0, // Placeholder, should be updated by another topic
      //       txHash: tx.txHash,
      //       isSmartMoney: tx.isSmartMoney || false,
      //       isWhale: tx.isWhale || false,
      //       isSniper: tx.isDev, // Temporary mapping sniper as dev
      //       isBundler: tx.isDev, // Temporary mapping bundler as dev
      //       isDev: tx.isDev || false,
      //       isNewWallet: tx.isFreshWallet || false,
      //       isKOL: tx.isKOL || false,
      //       isInsider: tx.isInsider || false,
      //       isTopTrader: tx.isTopTrader || false,
      //       source: 'new_detail',
      //       eventIndex: tx.eventIndex,
      //       logIndex: tx.logIndex,
      //       holderPct: tx.holderPct ? Number(tx.holderPct) : undefined,
      //       isKlineTx: true,
      //     }
      //     transactionsRef.current = [newTransaction].concat(transactionsRef.current).slice(0, 1000).sort(sortFn) // Limit to 1000 transactions
      //   }
      // }
    } else if (topic === `public/transaction/update/${activeChainId}/${tokenAddress}`) {
      const payload = JSON.parse(msg.toString()) as TransactionUpdate[]
      for (const update of payload) {
        const existingTxIndex = transactionsRef.current.findIndex(
          (t) => t.txHash === update.txid && (t.eventIndex === update.eventIndex || update.eventIndex === undefined),
        )
        if (existingTxIndex !== -1) {
          const existingTx = transactionsRef.current[existingTxIndex]
          const updatedTransaction: RealtimeTransaction = {
            ...existingTx,
            isInsider: update.isInsider ?? existingTx.isInsider,
          }
          // Update the existing transaction in the array
          transactionsRef.current = transactionsRef.current.map((t, index) =>
            index === existingTxIndex ? updatedTransaction : t,
          )
        }
      }
    }
  }, [message, tokenAddress])

  // Update the realtime transactions state, batching updates
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(transactionsHistoryActions.setTransactions(transactionsRef.current))
    }, 200) // Update every second
    return () => {
      clearInterval(interval)
      // Clear the transactions on unmount
      transactionsRef.current = []
      dispatch(transactionsHistoryActions.resetTransactions())
    }
  }, [tokenAddress])
}

export const useRealtimeTransactions = () => {
  return useAppSelector((state) => state.transactionsHistory.transactions as RealtimeTransaction[])
}
