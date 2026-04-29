import { ColumnDef } from '@tanstack/react-table'
import { ChainIds, TokenDetailColumnKeys } from '@/types/enums.ts'
import { TypeCell } from '@components/detaiTokenTable/TypeCell.tsx'
import { VolumeCell } from '@components/detaiTokenTable/VolumeCell.tsx'
import { formatAmount } from '@/lib/format.ts'
import { CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { TimeHeaderCell } from '@components/detaiTokenTable/header/TimeHeaderCell.tsx'
import { TimeCell } from '@components/detaiTokenTable/cells/TimeCell.tsx'
import { Trans } from 'react-i18next'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice.ts'
import { VolumeHeaderCell } from '@components/detaiTokenTable/header/VolumeHeaderCell.tsx'
import { useContext } from 'react'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { getFilterTransactionAmountTypeByDataUnit } from '@/lib/currency.ts'
import { RootState, useAppSelector } from '@/redux/store'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { PriceHeaderCell } from '@components/detaiTokenTable/header/PriceHeaderCell.tsx'
import { PriceCell } from '@components/detaiTokenTable/cells/PriceCell.tsx'
import { AmountHeaderCell } from '@components/detaiTokenTable/header/AmountHeaderCell.tsx'
import { WalletHeaderCell } from '@components/detaiTokenTable/header/WalletHeaderCell.tsx'
import { WalletInfoCell } from '@components/detaiTokenTable/cells/WalletInfoCell.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { TypeHeaderCell } from '@components/detaiTokenTable/header/TypeHeaderCell.tsx'

export const mobileColumns: ColumnDef<RealtimeTransaction>[] = [
  {
    accessorKey: TokenDetailColumnKeys.TIME,
    header: () => <TimeHeaderCell />,
    cell: ({ row }) => {
      const transaction = row.original
      return <TimeCell transaction={transaction} />
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.TYPE,
    header: () => <TypeHeaderCell />,
    cell: ({ row }) => <TypeCell transaction={row.original} />,
  },
  {
    accessorKey: TokenDetailColumnKeys.TRANSACTION_AMOUNT, // volume
    header: () => <VolumeHeaderCell />,
    cell: ({ row }) => {
      const { symbol } = useContext(TradingTransactionsContext)
      const dataUnit = useAppSelector((state: RootState) => (state.userSettings as UserSettingsState).dataUnit)
      const currency = getFilterTransactionAmountTypeByDataUnit(dataUnit)
      return <VolumeCell transaction={row.original} symbol={symbol ?? ''} currency={currency} />
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.SOLD_PRICE,
    header: () => <PriceHeaderCell />,
    cell: ({ row }) => <PriceCell transaction={row.original} />,
  },
  {
    accessorKey: TokenDetailColumnKeys.VOLUME, // quantity
    header: () => <AmountHeaderCell />,
    cell: ({ row }) => {
      return (
        <div className="text-[calc(12rem/16)] leading-none font-[380] text-[#CACACA]">
          {formatAmount(row.original.baseAmount, {
            roundMode: 'floor',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.WALLET,
    header: () => <WalletHeaderCell />,
    cell: ({ row }) => {
      const transaction = row.original
      return <WalletInfoCell transaction={transaction} />
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.ACTION,
    header: () => (
      <div className="min-w-[64px] text-center">
        <Trans i18nKey="detail.tokenDetail.action" />
      </div>
    ),
    cell: ({ row }) => {
      const activeChainId = useActiveChainId() || ChainIds.Solana
      return (
        <div className="flex items-center justify-center gap-2">
          <a
            href={`${CHAIN_EXPLORER_TX_URLS[activeChainId]}/${row.original.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={CHAIN_EXPLORER_IMAGES[activeChainId]} alt="" className="size-3.5" />
          </a>
        </div>
      )
    },
  },
]
