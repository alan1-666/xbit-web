import { ColumnDef } from '@tanstack/react-table'
import { RealtimeTransaction, RealtimeTransactionType } from '@/redux/modules/transactionsHistory.slice.ts'
import { ChainIds, DisplayPriceType, SortByCreateAtType, TokenDetailColumnKeys } from '@/types/enums.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import {
  selectFromTokenDetailState,
  setDisplayDateTimeMode,
  setDisplayPriceType,
  setSortByCreatedAt,
  TokenDetailState,
} from '@/redux/modules/tokenDetail.slice.ts'
import { cn } from '@/lib/utils.ts'
import ColumnTime from '@components/detaiTokenTable/ColumnTime.tsx'
import DropdownFilterType from '@components/detaiTokenTable/DropdownFilterType.tsx'
import { TypeCell } from '@components/detaiTokenTable/TypeCell.tsx'
import VolumeHeaderTrade from '@components/detaiTokenTable/VolumeHeaderTrade.tsx'
import { VolumeCell } from '@components/detaiTokenTable/VolumeCell.tsx'
import { Button } from '@components/ui/button.tsx'
import { formatAmount } from '@/lib/format.ts'
import { WalletCell } from '@components/detaiTokenTable/WalletCell.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import LaunchPlatformIcon from '@components/common/Card/LaunchPlatformIcon.tsx'
import { CHAIN_EXPLORER_IMAGES_PC, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'
import { useContext, MouseEvent, useCallback } from 'react'
import { TradingTransactionsContext } from '@components/detaiTokenTable/TradingTransactionsContext.ts'
import { UserSettingsState } from '@/redux/modules/userSettings.slice.ts'
import { getFilterTransactionAmountTypeByDataUnit } from '@/lib/currency.ts'
import { PriceCell } from '@components/detaiTokenTable/cells/PriceCell.tsx'

export const desktopColumns: ColumnDef<RealtimeTransaction>[] = [
  {
    accessorKey: TokenDetailColumnKeys.TIME,
    header: () => {
      // const { displayDateTimeMode, sortByCreatedAt } = useAppSelector(
      //   (state: RootState) => state.tokenDetail as TokenDetailState,
      // )
      const displayDateTimeMode = useAppSelector(selectFromTokenDetailState('displayDateTimeMode'))
      const sortByCreatedAt = useAppSelector(selectFromTokenDetailState('sortByCreatedAt'))
      const dispatch = useAppDispatch()
      const { t } = useTranslation()

      const handleSort = () => {
        console.log('handleSort', sortByCreatedAt)
        if (sortByCreatedAt === SortByCreateAtType.DESC) {
          dispatch(setSortByCreatedAt(SortByCreateAtType.ASC))
        } else {
          dispatch(setSortByCreatedAt(SortByCreateAtType.DESC))
        }
      }

      return (
        <div className="flex items-center gap-[2px] min-w-[80px] cursor-pointer">
          <div
            className={cn('font-[330] text-[12px]', !displayDateTimeMode && 'text-white')}
            onClick={() => {
              dispatch(setDisplayDateTimeMode(false))
            }}
          >
            {t('detail.tokenDetail.time')}
          </div>
          {!displayDateTimeMode && (
            <div onClick={handleSort}>
              <img
                src={'/images/icons/arrow-down-bold-active.svg'}
                className={cn(
                  'size-[12px] pointer-events-auto',
                  sortByCreatedAt === SortByCreateAtType.DESC ? 'rotate-0' : 'rotate-180',
                )}
                alt={'icon sort'}
              />
            </div>
          )}
          <div className="font-[330] text-[10px]">/</div>
          <div
            className={cn('font-[330] text-[12px]', displayDateTimeMode && 'text-white')}
            onClick={() => dispatch(setDisplayDateTimeMode(true))}
          >
            {t('detail.tokenDetail.Duration')}
          </div>

          {displayDateTimeMode && (
            <div onClick={handleSort}>
              <img
                src={'/images/icons/arrow-down-bold-active.svg'}
                className={cn(
                  'size-[12px] pointer-events-auto',
                  sortByCreatedAt === SortByCreateAtType.DESC ? 'rotate-0' : 'rotate-180',
                )}
                alt={'icon sort'}
              />
            </div>
          )}

          <div className="flex items-center cursor-pointer justify-center gap-1"></div>
        </div>
      )
    },

    cell: ({ row }) => {
      const transaction = row?.original
      const { displayDateTimeMode } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

      return (
        <ColumnTime
          displayDateTimeMode={displayDateTimeMode}
          timestamp={Number(transaction?.timestamp)}
          className="font-[330] text-[14px]"
          isKlineTx={transaction?.isKlineTx ?? true}
          filteringReason={transaction?.reasonFiltering}
        />
      )
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.TYPE,
    header: () => {
      const { t } = useTranslation()
      return (
        <div className="flex items-center gap-[2px]">
          <div className="font-[330] text-[12px]">{t('transaction.type')}</div>
          <div className="flex items-center cursor-pointer justify-center gap-1 pl-1">
            <DropdownFilterType />
          </div>
        </div>
      )
    },
    cell: ({ row }) => <TypeCell transaction={row.original} className="font-[330] text-[14px]" />,
  },
  {
    accessorKey: TokenDetailColumnKeys.SOLD_PRICE,
    header: () => {
      const { displayPriceType } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
      const dispatch = useAppDispatch()
      const { t } = useTranslation()
      const handleClickSoldPrice = () => {
        dispatch(
          setDisplayPriceType(
            displayPriceType === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE,
          ),
        )
      }

      return (
        <div className="min-w-[80px]">
          <div
            className="flex items-center gap-[2px] w-fit py-[4.5px] cursor-pointer rounded-[3px]"
            onClick={handleClickSoldPrice}
          >
            <div className="cursor-pointer font-[330] text-[12px] w-[40px]">
              {displayPriceType === DisplayPriceType.PRICE
                ? t('detail.tokenDetail.finalPrice')
                : t('detail.tokenDetail.marketCap')}
            </div>
            <div className="items-center cursor-pointer justify-center gap-1 pl-1">
              <Button size="xs" className="rounded-full bg-transparent p-0 flex flex-col">
                <img src="/images/icons/swap-currency.svg" alt="icon swap" />
              </Button>
            </div>
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original
      return <PriceCell transaction={transaction} className="font-[330] text-[14px]" />
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.VOLUME,
    header: () => {
      const { minVolume, maxVolume } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
      const { t } = useTranslation()
      const { volumeRef } = useContext(TradingTransactionsContext)
      return (
        <div className="flex items-center gap-[2px] min-w-[80px]">
          <div className="font-[330] text-[12px]">{t('transaction.quantity')}</div>
          <div className="flex items-center cursor-pointer justify-center pl-1">
            <Button size="xs" className="rounded-full bg-transparent p-0" onClick={() => volumeRef.current?.open()}>
              <img
                src={
                  minVolume > 0 || maxVolume > 0
                    ? '/images/icons/icon-filter-solid.svg'
                    : '/images/icons/icon-filter.svg'
                }
                className="w-[11px] h-[11px]"
                alt="icon filter"
              />
            </Button>
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      const txType = row.original.type
      const { symbol } = useContext(TradingTransactionsContext)
      return (
        <div
          className={cn(
            'font-[330] text-[14px] text-white',
            txType === RealtimeTransactionType.Buy ? 'text-rise' : '',
            txType === RealtimeTransactionType.Sell ? 'text-fall' : '',
          )}
        >
          {txType === RealtimeTransactionType.Buy && '+'}
          {txType === RealtimeTransactionType.Sell && '-'}
          {formatAmount(row.original.baseAmount, {
            roundMode: 'floor',
          })}{' '}
          <span className="text-[#6C6A74]">{symbol}</span>
        </div>
      )
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.TRANSACTION_AMOUNT, // volume
    header: () => <VolumeHeaderTrade />,
    cell: ({ row }) => {
      const { symbol } = useContext(TradingTransactionsContext)
      const dataUnit = useAppSelector((state: RootState) => (state.userSettings as UserSettingsState).dataUnit)
      const currency = getFilterTransactionAmountTypeByDataUnit(dataUnit)
      return (
        <VolumeCell
          transaction={row.original}
          symbol={symbol ?? ''}
          currency={currency}
          className="font-[330] text-[14px]"
        />
      )
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.WALLET,
    header: () => {
      const { address } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
      const { t } = useTranslation()
      const { addressRef } = useContext(TradingTransactionsContext)
      return (
        <div className="flex items-center gap-[2px] min-w-[120px]">
          <div className="font-[330] text-[12px]">{t('detail.tokenDetail.wallet')}</div>
          <div className="flex items-center cursor-pointer justify-center">
            <Button
              size="xs"
              className="rounded-full bg-transparent p-0"
              onClick={() => addressRef.current?.open(address)}
            >
              <img
                src={address ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                className="w-[11px] h-[11px]"
                alt="icon filter"
              />
            </Button>
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      const transaction = row.original
      const address = useAppSelector(selectFromTokenDetailState('address'))
      const { tokenAddress, price, walletsInfo, followingWallets } = useContext(TradingTransactionsContext)
      return (
        <WalletCell
          isPc
          transaction={transaction}
          address={address}
          tokenAddress={tokenAddress}
          price={price}
          walletInfo={walletsInfo[transaction.maker]}
          isFollowingWallet={followingWallets.includes(transaction.maker)}
          txHash={transaction.txHash}
        />
      )
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.FUND_POOL,
    header: () => {
      const { t } = useTranslation()
      return <div className="font-[330] text-[12px] max-w-[70px]">{t('liquidityChart.fundPool')}</div>
    },
    cell: ({ row }) => {
      const activeChainId = useActiveChainId()
      return (
        <div className="font-[330] text-[14px]">
          {row.original.dex && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <LaunchPlatformIcon
                    value={row.original.dex}
                    className={'rounded-full !size-4 !pointer-event-auto'}
                    chainId={activeChainId}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#191919] text-white">{row.original.dex}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: TokenDetailColumnKeys.ACTION,
    header: () => {
      const { t } = useTranslation()
      return <div className="min-w-[64px] text-center font-[330] text-[12px]">{t('detail.tokenDetail.action')}</div>
    },
    cell: ({ row }) => {
      const activeChainId = useActiveChainId() || ChainIds.Solana
      const handleClick = useCallback((e: MouseEvent) => {
        e.stopPropagation()
      }, [])
      return (
        <div className="flex items-center justify-center gap-2">
          <a
            href={`${CHAIN_EXPLORER_TX_URLS[activeChainId]}/${row.original.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
          >
            <img src={CHAIN_EXPLORER_IMAGES_PC[activeChainId]} alt="" className="size-4" />
          </a>
        </div>
      )
    },
  },
]
