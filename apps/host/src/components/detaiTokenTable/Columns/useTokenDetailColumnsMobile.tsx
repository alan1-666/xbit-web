import { Button } from '@/components/ui/button'
import { CHAIN_EXPLORER_IMAGES, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { setDisplayDateTimeMode, TokenDetailState } from '@/redux/modules/tokenDetail.slice'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, DisplayPriceType, TokenDetailColumnKeys } from '@/types/enums'
import { WalletCell } from '@components/detaiTokenTable/WalletCell.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ColumnDef } from '@tanstack/react-table'
import { RefObject, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { WalletInfo } from '..'
import ColumnTime from '../ColumnTime'
import { FilterAddressHandle } from '../FilterAddress'
import FilterArrowSort from '../FilterArrowSort'
import { FilterTransactionAmountHandle } from '../FilterTransactionAmount'
import { FilterVolumeHandle } from '../FilterVolume'
import uesDetailTokenTable from '../hooks/uesDetailTokenTable'
import { ModalDateTimePickerHandle } from '../ModalDateTimePicker'
import { TypeCell } from '../TypeCell'
import { VolumeCell } from '../VolumeCell'

const useTokenDetailColumnsMobile = ({
  price,
  symbol,
  decimals,
  amountRef,
  volumeRef,
  addressRef,
  walletsInfo,
  totalSupply,
  tokenAddress,
  datePickerRef,
}: {
  tokenAddress: string
  datePickerRef: RefObject<ModalDateTimePickerHandle | null>
  amountRef: RefObject<FilterTransactionAmountHandle | null>
  volumeRef: RefObject<FilterVolumeHandle | null>
  addressRef: RefObject<FilterAddressHandle | null>

  symbol?: string
  price?: string
  totalSupply?: string
  decimals?: number
  walletsInfo: Record<string, WalletInfo>
}) => {
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    displayDateTimeMode,
    minAmount,
    maxAmount,
    minVolume,
    maxVolume,
    sortByCreatedAt,
    address,
    displayPriceType,
    startDate,
    endDate,
    nativeAmountFrom,
    nativeAmountTo,
  } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  const { handleSort, currency, formatPriceAndMc, handleChangeCurrency, handleClickSoldPrice, handleTextColor } =
    uesDetailTokenTable()

  const tokenDetailColumns: ColumnDef<RealtimeTransaction>[] = useMemo(() => {
    return [
      {
        accessorKey: TokenDetailColumnKeys.TIME,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[80px]">
            <div>{t('detail.tokenDetail.time')}</div>
            <div className="flex items-center cursor-pointer justify-center gap-1">
              <FilterArrowSort sortByCreatedAt={sortByCreatedAt} handleOnclickSort={handleSort} />
              <img
                src="/images/tokenDetail/icon-clock.svg"
                className="w-[12px] h-[12px]"
                alt="icon clock"
                onClick={() => dispatch(setDisplayDateTimeMode(!displayDateTimeMode))}
              />
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0 h-4.5"
                onClick={() => datePickerRef.current?.open()}
              >
                <img
                  src={startDate || endDate ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'}
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const transaction = row?.original

          return (
            <ColumnTime
              displayDateTimeMode={displayDateTimeMode}
              timestamp={Number(transaction?.timestamp)}
              className={'text-[#CACACA]'}
            />
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.TYPE,
        header: () => <div className="w-[64px]">{t('detail.tokenDetail.direction')}</div>,
        cell: ({ row }) => <TypeCell transaction={row.original} />,
      },
      {
        accessorKey: TokenDetailColumnKeys.TRANSACTION_AMOUNT, // volume
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[110px]">
            <div>{t('detail.tokenDetail.columnVolume')}</div>
            <div className="flex items-center cursor-pointer justify-center gap-1">
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0 h-4.5"
                onClick={() => amountRef.current?.open()}
              >
                <img
                  src={
                    minAmount > 0 || maxAmount > 0
                      ? '/images/icons/icon-filter-solid.svg'
                      : '/images/icons/icon-filter.svg'
                  }
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
              <img
                src="/images/orderBook/icon-refund.svg"
                className="w-[14px] h-[14px] cursor-pointer"
                alt="icon refund"
                onClick={handleChangeCurrency}
              />
            </div>
          </div>
        ),
        cell: ({ row }) => {
          return <VolumeCell transaction={row.original} symbol={symbol ?? ''} currency={currency} />
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.SOLD_PRICE,
        header: () => (
          <div className="min-w-[80px]">
            <div
              onClick={handleClickSoldPrice}
              className="flex items-center gap-[2px] w-fit px-2 py-[4.5px] cursor-pointer rounded-[3px]"
            >
              <div className="cursor-pointer">
                {displayPriceType === DisplayPriceType.PRICE
                  ? t('detail.tokenDetail.finalPrice')
                  : t('detail.tokenDetail.marketCap')}
              </div>
              <img src="/images/futuresDetail/arrow-swap-icon.svg" className="block w-[9px] h-[9px]" alt="icon swap" />
            </div>
          </div>
        ),
        cell: ({ row }) => (
          <div className={cn(handleTextColor(row?.original?.type), 'text-[calc(12rem/16)] leading-none font-[380]')}>
            {formatPriceAndMc(
              row.original,
              displayPriceType === DisplayPriceType.PRICE ? 'usd' : 'marketcap',
              totalSupply ? +totalSupply : 0,
            )}
          </div>
        ),
      },
      {
        accessorKey: TokenDetailColumnKeys.VOLUME,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[80px]">
            <div>{t('transaction.quantity')}</div>
            <div className="flex items-center cursor-pointer justify-center">
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0 h-4.5"
                onClick={() => volumeRef.current?.open()}
              >
                <img
                  src={
                    minVolume > 0 || maxVolume > 0 || nativeAmountFrom > 0 || nativeAmountTo > 0
                      ? '/images/icons/icon-filter-solid.svg'
                      : '/images/icons/icon-filter.svg'
                  }
                  className="w-[11px] h-[11px]"
                  alt="icon filter"
                />
              </Button>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          return (
            <div className="text-[calc(12rem/16)] leading-none font-[380] text-[#CACACA]!">
              {formatAmount(row.original.baseAmount, {
                roundMode: 'floor',
              })}
            </div>
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.WALLET,
        header: () => (
          <div className="flex items-center gap-[2px] min-w-[120px] pl-6">
            <div>{t('detail.tokenDetail.wallet')}</div>
            <div className="flex items-center cursor-pointer justify-center">
              <Button
                size="xs"
                className="rounded-full bg-transparent p-0 h-4.5"
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
        ),
        cell: ({ row }) => {
          const transaction = row.original
          return (
            <WalletCell
              transaction={transaction}
              address={address}
              tokenAddress={tokenAddress}
              price={price}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              walletInfo={walletsInfo[transaction.maker]}
            />
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.ACTION,
        header: () => <div className="min-w-[64px] text-center">{t('detail.tokenDetail.action')}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <a
              href={`${CHAIN_EXPLORER_TX_URLS[activeChainId]}/${row.original.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={CHAIN_EXPLORER_IMAGES[activeChainId]} alt="" className="size-3.5" />
            </a>
          </div>
        ),
      },
    ]
  }, [
    tokenAddress,
    displayDateTimeMode,
    sortByCreatedAt,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    symbol,
    currency,
    minVolume,
    maxVolume,
    address,
    activeChainId,
    price,
    displayPriceType,
    totalSupply,
    decimals,
    walletsInfo,
    nativeAmountFrom,
    nativeAmountTo,
  ])

  return {
    tokenDetailColumns,
  }
}

export default useTokenDetailColumnsMobile
