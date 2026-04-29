// import { useQuery } from '@apollo/client'
// import { getWithdrawalHistory } from '@services/assets.service.ts'
// import { useCallback, useMemo } from 'react'
// import { walletClient } from '@/lib/gql/apollo-client.ts'
// import { FundingRecord } from '@components/assets/overview/FundingRecordItem.tsx'
// import { getBlockChainLogo } from '@/utils/helpers.ts'
// import dayjs from 'dayjs'
// import { WithdrawStatus } from '@/@generated/gql/graphql-wallet.ts'
// import { useTranslation } from 'react-i18next'
// import { useAppSelector } from '@/redux/store'
// import { priceChain } from '@/redux/modules/price.slice'

// export const useWithdrawalHistory = (walletAddress?: string) => {
//   const { data, ...rest } = useQuery(getWithdrawalHistory, {
//     variables: {
//       input: {
//         walletAddress,
//       },
//     },
//     skip: !walletAddress,
//     client: walletClient,
//   })
//   const { t } = useTranslation()
//   const getStatusLabel = useCallback(
//     (status: WithdrawStatus) => {
//       switch (status) {
//         case WithdrawStatus.Success:
//           return t('assets.overview.fundingHistory.success')
//         case WithdrawStatus.Pending:
//           return t('assets.overview.fundingHistory.pending')
//         case WithdrawStatus.Failed:
//           return t('assets.overview.fundingHistory.failed')
//       }
//     },
//     [t],
//   )
//   const priceSol = useAppSelector(priceChain('SOL'))
//   const records = useMemo(() => {
//     if (!data) return [] as FundingRecord[]
//     const withdrawHistory = data.getWithdrawHistory ?? []
//     const records: FundingRecord[] = withdrawHistory.map((record) => ({
//       chainId: record.chainId,
//       type: 'Withdrawal',
//       fromToken: {
//         symbol: 'SOL',
//         icon: getBlockChainLogo(+record.chainId, record.token),
//       },
//       timestamp: dayjs(record.createdAt).unix() * 1000, // Convert to milliseconds
//       status: record.status === WithdrawStatus.Success ? 'success' : 'failed',
//       statusLabel: getStatusLabel(record.status),
//       direction: 'out',
//       directionLabel: t('assets.fundingHistory.withdrawal'),
//       amount: -record.amount,
//       unit: 'SOL',
//       fee: 0,
//       transactionHash: record.txid as string,
//       senderAddress: record.fromAddress,
//       senderAddressTypes: [],
//       receiverAddress: record.toAddress,
//       receiverAddressTypes: [],
//       amountInUSD: record.amount * priceSol,
//     }))
//     return records
//   }, [data?.getWithdrawHistory])
//   return {
//     data,
//     records,
//     ...rest,
//   }
// }
