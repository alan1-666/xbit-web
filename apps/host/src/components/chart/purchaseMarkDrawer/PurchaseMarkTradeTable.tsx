import { TxType } from '@/@generated/gql/graphql-future.ts'
import { TransactionDto } from '@/@generated/gql/graphql-meme2'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useActiveChain, useActiveChainId, useNativeTokenSymbol } from '@/hooks/useActiveChain'
import { CHAIN_EXPLORER_IMAGES_PC, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import { getDataUnitByChain } from '@/lib/currency'
import { formatAmount, formatPrice, formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'
import { setDataUnit } from '@/redux/modules/userSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, DisplayPriceType } from '@/types/enums'
import { formatSmartTimeDiff } from '@/utils/helpers'
import IconArrowSwap from '@components/icon/stroke/IconArrowSwap.tsx'
import IconClock from '@components/icon/stroke/IconClock.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import { IconInfo } from '@components/icon/stroke/iconInfo.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PureDataTable } from '@components/common/datatables/PureDataTable.tsx'

interface TxRow {
  type: string
  price: number
  mc: number
  baseAmount: number
  usdAmount: number
  totalFee: number
  totalFeeUSD: number
  timestamp: number
  nativeAmount: number
  nativePrice: number
  txHash: string
  chainId: number
}

interface PurchaseMarkTradeTableProps {
  txType?: TxType
  setTxType?: (type: TxType) => void
  transactions?: TransactionDto[]
  loading?: boolean
  totalSupply?: number
}

const calculateMarketCap = (price: number, totalSupply: number): number => {
  if (price <= 0 || totalSupply <= 0) return 0
  return price * totalSupply
}

const mapTransactionToTxRow = (tx: TransactionDto): TxRow | null => {
  if (!tx) return null

  const type = tx.type
  const price = Number(tx.usdPrice ?? tx.price ?? 0)
  const totalSupply = Number(tx.totalSupply ?? 0)
  const mc = calculateMarketCap(price, totalSupply)
  const baseAmount = Number(tx.baseAmount ?? 0)
  const usdAmount = Number(tx.usdAmount ?? 0)
  const totalFee = Number(tx.totalFee ?? 0)
  const totalFeeUSD = Number(tx.totalFeeUSD ?? 0)
  const timestamp = Number(tx.timestamp ?? 0)
  const nativeAmount = Number(tx.nativeAmount ?? 0)
  const nativePrice = Number(tx.nativePrice ?? 0)
  const txHash = tx.txHash ?? ''
  const chainId = tx.chainId ?? 0

  return {
    type,
    price,
    mc,
    baseAmount,
    usdAmount,
    totalFee,
    totalFeeUSD,
    timestamp,
    nativeAmount,
    nativePrice,
    txHash,
    chainId,
  }
}

export const PurchaseMarkTradeTable = ({
  txType,
  setTxType,
  transactions = [],
  totalSupply = 0,
}: PurchaseMarkTradeTableProps) => {
  const { t } = useTranslation()
  const nativeToken = useNativeTokenSymbol()
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const activeChain = useActiveChain()
  const dispatch = useAppDispatch()
  const chainId = useActiveChainId()
  const [displayPriceType, setDisplayPriceType] = useState<DisplayPriceType>(DisplayPriceType.PRICE)
  const [timeType, setTimeType] = useState<'diff' | 'time'>('diff')

  const TRANSACTION_TYPES: { label: string; value: TxType }[] = [
    { label: t('history.all'), value: TxType.All },
    { label: t('history.buy'), value: TxType.Buy },
    { label: t('history.sell'), value: TxType.Sell },
  ]
  const [openTypeFilter, setOpenTypeFilter] = useState(false)

  const handleClickPriceType = () => {
    setDisplayPriceType((prev) => (prev === DisplayPriceType.PRICE ? DisplayPriceType.MC : DisplayPriceType.PRICE))
  }

  const handleChangeCurrency = () => {
    if (dataUnit === 'USD') {
      dispatch(setDataUnit(getDataUnitByChain(activeChain)))
    } else {
      dispatch(setDataUnit('USD'))
    }
  }

  const rows: TxRow[] = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    return transactions.map(mapTransactionToTxRow).filter((row: TxRow | null): row is TxRow => row !== null)
  }, [transactions])

  useEffect(() => {
    return () => {
      setDisplayPriceType(DisplayPriceType.PRICE)
      setTxType?.(TxType.All)
      setTimeType('diff')
    }
  }, [])

  const columns: ColumnDef<TxRow>[] = [
    {
      accessorKey: 'type',
      header: () => (
        <div className="text-[12px] font-[330] text-white/60">
          <div
            className="flex items-center gap-[2px] cursor-pointer"
            onClick={() => {
              setOpenTypeFilter((prev) => !prev)
            }}
          >
            <div>{t('history.type')}</div>
            <div className="flex items-center justify-center w-[14px] h-[14px]">
              {txType !== TxType.All ? (
                <img src="/images/icons/icon-filter-solid.svg" className="w-[10px] h-[10px]" alt="" />
              ) : (
                <img src="/images/icons/icon-filter.svg" className="w-[10px] h-[10px]" alt="" />
              )}
            </div>
          </div>
          <Popover open={openTypeFilter} onOpenChange={setOpenTypeFilter}>
            <PopoverAnchor />
            <PopoverContent className="w-[80px] bg-[#212127] p-1 z-[9999]" align="center" side="bottom" sideOffset={2}>
              {TRANSACTION_TYPES.map((e) => (
                <div
                  key={e.value}
                  className={cn(
                    'hover:bg-[#27272a] cursor-pointer px-2 py-1 rounded text-center',
                    txType === e.value && 'text-[#FBFBFB] bg-[#2B2B33]',
                  )}
                  onClick={() => {
                    setTxType?.(e.value)
                    setOpenTypeFilter(false)
                  }}
                >
                  <span className="font-[380] text-[13px] text-center mx-auto">{e.label}</span>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={cn(
            'text-sm font-medium',
            row.original.type === 'Buy' ? 'text-rise' : row.original.type === 'Sell' ? 'text-fall' : 'text-reduce',
          )}
        >
          {row.original.type == 'Buy' ? t('history.buy') : t('history.sell')}
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: () => (
        <div
          className="flex cursor-pointer items-center gap-1 transition-colors hover:text-white"
          onClick={handleClickPriceType}
        >
          <span className="text-[12px] font-[330]">
            {displayPriceType === DisplayPriceType.PRICE
              ? t('detail.tokenDetail.finalPrice')
              : t('detail.tokenDetail.marketCap')}
          </span>
          <IconArrowSwap className="size-3" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-white/90">
          {displayPriceType === DisplayPriceType.PRICE
            ? formatPrice(row.original.price, { showCurrency: true })
            : formatVolume(row.original.price * totalSupply, {
                showCurrency: true,
              })}
        </div>
      ),
    },
    {
      accessorKey: 'baseAmount',
      header: () => <div className="text-[12px] font-[330] text-white/60">{t('history.amount')}</div>,
      cell: ({ row }) => {
        return (
          <div className="text-sm text-white/90">
            {formatAmount(row.original.baseAmount, {
              roundMode: 'floor',
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'usd',
      header: () => (
        <div className="flex min-w-[110px] items-center gap-[4px]">
          <div className="text-[12px] font-[330]">{t('detail.tokenDetail.columnVolume')}</div>
          <div className="flex items-center gap-0.5 cursor-pointer hover:text-white" onClick={handleChangeCurrency}>
            <div className="text-[12px] font-[330] leading-none">{dataUnit}</div>
            <IconFund className="size-3 -mt-0.5" />
          </div>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div
            className={cn(
              row.original.type === 'Buy' ? 'text-rise' : 'text-fall',
              'text-[calc(13rem/16)] font-medium whitespace-nowrap',
            )}
          >
            {dataUnit !== 'USD'
              ? formatAmount(row.original.nativeAmount, { unit: nativeToken, roundMode: 'floor' })
              : formatVolume(row.original.usdAmount, { showCurrency: true, roundMode: 'floor' })}
          </div>
        )
      },
    },
    {
      accessorKey: 'totalFee',
      header: () => (
        <div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger className="mr-auto ml-[-5px] flex items-center gap-1">
                <div className="flex items-center gap-1 text-white/60 hover:text-white">
                  <div className="text-[12px] font-[330]">{t('detail.header.totalFees')}</div>
                  <IconInfo className="size-3 -mt-0.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="border border-[#79778C29] bg-[#212127] text-[#908E98]">
                <p className="text-[12px] tracking-wide">{t('detail.header.totalFeesTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-white/90">
          {dataUnit !== 'USD'
            ? formatAmount(row.original.totalFee, { unit: nativeToken, roundMode: 'ceil' })
            : formatVolume(row.original.totalFeeUSD, { showCurrency: true, roundMode: 'ceil' })}
        </div>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: () => (
        <div
          className="flex cursor-pointer items-center gap-1 transition-colors hover:text-white"
          onClick={() => {
            setTimeType((prev) => (prev === 'diff' ? 'time' : 'diff'))
          }}
        >
          <span className="text-[12px] font-[330]">{t('history.time')}</span>
          <IconClock className="size-3 -mt-0.5" />
        </div>
      ),
      cell: ({ row }) => (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger className="mr-auto">
              <div className="text-sm text-white/70">
                {timeType === 'time'
                  ? dayjs(row.original.timestamp).format('MM/DD HH:mm:ss')
                  : formatSmartTimeDiff(row.original.timestamp)}
              </div>
            </TooltipTrigger>
            <TooltipContent className="border border-[#79778C29] bg-[#212127] text-[#908E98]">
              <p className="text-[12px] tracking-wide">{dayjs(row.original.timestamp).format('YYYY/MM/DD HH:mm:ss')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: 'txHash',
      header: () => <div></div>,
      cell: ({ row }) => (
        <div className="flex justify-center min-w-4">
          <a
            href={`${CHAIN_EXPLORER_TX_URLS[chainId as ChainIds]}/${row.original.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={CHAIN_EXPLORER_IMAGES_PC[chainId as ChainIds]} alt="" className="size-4" />
          </a>
        </div>
      ),
    },
  ]

  return (
    <PureDataTable
      data={rows}
      columns={columns}
      headerCellClassName="sticky top-0 z-20 text-[12px] font-[330] text-white/60 bg-[#212127]"
    />
  )
}
