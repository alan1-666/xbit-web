import { useInfiniteQuery } from '@tanstack/react-query'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getFundingWalletHistory } from '@services/wallet.service.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { ChainIds, TransferType } from '@/types/enums.ts'
import { ARB_USDC_ADDRESS_V2 } from '@/lib/constant.ts'
import { SOL_ADDRESS } from '@/lib/blockchain'
import { useEffect, useMemo } from 'react'
import { useSubscription } from '@/lib/mqtt'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice.ts'
import dayjs from 'dayjs'

export interface UseFundingRecordsOptions {
  type: string
  asset: string
}

const tokenAddressMap: Record<string, string> = {
  SOL: SOL_ADDRESS,
  ETH: '0x0000000000000000000000000000000000000000',
  'ARB-ETH': '0x0000000000000000000000000000000000000000',
  USDC: ARB_USDC_ADDRESS_V2,
  BNB: '0x0000000000000000000000000000000000000000',
  'USDC-POLYGON': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  'MON': '0x0000000000000000000000000000000000000000',
}

const mapTransferType = (type: string) => {
  switch (type) {
    case 'all':
      return undefined
    case 'DEPOSIT':
      return [TransferType.Deposit, TransferType.DepositFutureExternal, TransferType.PredictionDepositExternal]
    case 'TRANSFER':
      return [TransferType.Swap, TransferType.DepositFuture, TransferType.WithdrawFuture]
    case 'WITHDRAW':
      return [TransferType.Withdraw, TransferType.WithdrawFutureExternal, TransferType.PredictionWithdrawExternal]
    default:
      return [type]
  }
}

const tokenChainMap: Record<string, ChainIds> = {
  SOL: ChainIds.Solana,
  ETH: ChainIds.Ethereum,
  'ARB-ETH': ChainIds.Arbitrum,
  USDC: ChainIds.Arbitrum,
  BNB: ChainIds.Bsc,
  'MON': ChainIds.Monad,
}

export const useFundingRecords = (options: UseFundingRecordsOptions) => {
  const { type, asset } = options
  const userId = useSelector(_userInfo)?.userId

  const {
    data: recordsData,
    refetch,
    ...restQuery
  } = useInfiniteQuery({
    queryKey: ['fundingRecords', type, asset],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await gqlClient.query({
        query: getFundingWalletHistory,
        variables: {
          input: {
            limit: 20,
            page: pageParam,
            types: mapTransferType(type),
            token: tokenAddressMap[asset] || undefined,
            chainId: tokenChainMap[asset] || undefined,
          },
        },
      })
      return (response.data.getFundingWalletHistory || []) as FundingRecord[]
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined
    },
  })

  const records = useMemo(() => {
    if (!recordsData || recordsData.pages?.length === 0) return []
    return recordsData.pages.flat()
  }, [recordsData])

  const { message: messageWithdrawStatisticsUpdate } = useSubscription(`users/${userId}/withdraw_statistics_updated`, {
    clientOptions: { qos: 1 },
  })
  const { message: messageFundingHistoriesUpdated } = useSubscription(`users/${userId}/funding_histories_updated`)

  useEffect(() => {
    if (!messageWithdrawStatisticsUpdate) return
    try {
      const message = messageWithdrawStatisticsUpdate?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        setTimeout(() => {
          refetch()
        })
      }
    } catch (error) {
      console.error('Error parsing messageWithdrawStatisticsUpdate:', error)
    }
  }, [messageWithdrawStatisticsUpdate])

  useEffect(() => {
    if (!messageFundingHistoriesUpdated) return
    try {
      const message = messageFundingHistoriesUpdated?.message
      const data = JSON.parse(message?.toString() || '')
      if (data) {
        setTimeout(() => {
          refetch()
        })
      }
    } catch (error) {
      console.error('Error parsing messageFundingHistoriesUpdated:', error)
    }
  }, [messageFundingHistoriesUpdated])

  const recordGroupedByDate = useMemo(() => {
    return records.reduce((acc: Record<string, FundingRecord[]>, record) => {
      const date = dayjs(record.createdAt).format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(record)
      return acc
    }, {})
  }, [records])

  return {
    ...restQuery,
    records,
    recordGroupedByDate,
  }
}
