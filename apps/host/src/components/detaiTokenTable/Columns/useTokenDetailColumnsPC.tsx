import LaunchPlatformIcon from '@/components/common/Card/LaunchPlatformIcon'
import { Button } from '@/components/ui/button'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { CHAIN_EXPLORER_IMAGES_PC, CHAIN_EXPLORER_TX_URLS } from '@/lib/constant'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  setDisplayDateTimeMode,
  setDisplayPriceType,
  setSortByCreatedAt,
  TokenDetailState,
} from '@/redux/modules/tokenDetail.slice'
import { RealtimeTransaction } from '@/redux/modules/transactionsHistory.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, DisplayPriceType, SortByCreateAtType, TokenDetailColumnKeys } from '@/types/enums'
import VolumeHeaderTrade from '@components/detaiTokenTable/VolumeHeaderTrade.tsx'
import { WalletCell } from '@components/detaiTokenTable/WalletCell.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { ColumnDef } from '@tanstack/react-table'
import { RefObject, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { WalletInfo } from '..'
import ColumnTime from '../ColumnTime'
import DropdownFilterType from '../DropdownFilterType'
import { FilterAddressHandle } from '../FilterAddress'
import { FilterVolumeHandle } from '../FilterVolume'
import uesDetailTokenTable from '../hooks/uesDetailTokenTable'
import { TypeCell } from '../TypeCell'
import { VolumeCell } from '../VolumeCell'

const useTokenDetailColumnsPC = ({
  price,
  symbol,
  // decimals,
  volumeRef,
  addressRef,
  walletsInfo,
  totalSupply,
  tokenAddress,
  followingWallets,
}: {
  tokenAddress: string
  volumeRef: RefObject<FilterVolumeHandle | null>
  addressRef: RefObject<FilterAddressHandle | null>
  followingWallets: string[]
  symbol?: string
  price?: string
  totalSupply?: string
  decimals?: number
  walletsInfo: Record<string, WalletInfo>
}) => {
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const dispatch = useAppDispatch()
  // const { minVolume, maxVolume, startDate, endDate } = useAppSelector(
  //   (state: RootState) => state.tokenDetail as TokenDetailState,
  // )
  const { currency, formatPriceAndMc, handleTextColor } = uesDetailTokenTable()

  const tokenDetailColumnsPC: ColumnDef<RealtimeTransaction>[] = useMemo(() => {
    return [
      {
        accessorKey: TokenDetailColumnKeys.TIME,
        header: () => {
          const { t } = useTranslation()
          const { displayDateTimeMode, sortByCreatedAt } = useAppSelector(
            (state: RootState) => state.tokenDetail as TokenDetailState,
          )

          const handleSort = () => {
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
                <img
                  src={'/images/icons/arrow-down-bold-active.svg'}
                  className={cn('size-[12px]', sortByCreatedAt === SortByCreateAtType.DESC ? 'rotate-0' : 'rotate-180')}
                  onClick={handleSort}
                  alt={'icon sort'}
                />
              )}
              <div className="font-[330] text-[10px]">/</div>
              <div
                className={cn('font-[330] text-[12px]', displayDateTimeMode && 'text-white')}
                onClick={() => dispatch(setDisplayDateTimeMode(true))}
              >
                {t('detail.tokenDetail.Duration')}
              </div>

              {displayDateTimeMode && (
                <img
                  src={'/images/icons/arrow-down-bold-active.svg'}
                  className={cn('size-[12px]', sortByCreatedAt === SortByCreateAtType.DESC ? 'rotate-0' : 'rotate-180')}
                  onClick={handleSort}
                  alt={'icon sort'}
                />
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
        accessorKey: TokenDetailColumnKeys.TRANSACTION_AMOUNT, // volume
        header: () => <VolumeHeaderTrade />,
        cell: ({ row }) => {
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
        accessorKey: TokenDetailColumnKeys.SOLD_PRICE,
        header: () => {
          const { t } = useTranslation()
          const { displayPriceType } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
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
          const { displayPriceType } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

          return (
            <div className={cn(handleTextColor(row?.original?.type), 'font-[330] text-[14px]')}>
              {formatPriceAndMc(
                row.original,
                displayPriceType === DisplayPriceType.PRICE ? 'usd' : 'marketcap',
                totalSupply ? +totalSupply : 0,
              )}
            </div>
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.VOLUME, // volume
        header: () => {
          const { minVolume, maxVolume } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
          const { t } = useTranslation()
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
          return (
            <div className={cn(handleTextColor(row?.original?.type), 'font-[330] text-[14px]')}>
              {formatAmount(row.original.baseAmount, {
                roundMode: 'floor',
                unit: symbol,
              })}
            </div>
          )
        },
      },
      {
        accessorKey: TokenDetailColumnKeys.WALLET, // maker
        header: () => {
          const { address } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
          const { t } = useTranslation()
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
          const { address } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

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
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <a
              href={`${CHAIN_EXPLORER_TX_URLS[activeChainId]}/${row.original.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={CHAIN_EXPLORER_IMAGES_PC[activeChainId]} alt="" className="size-4" />
            </a>
          </div>
        ),
      },
    ]
  }, [
    dispatch,
    symbol,
    currency,
    price,
    walletsInfo,
    followingWallets,
    handleTextColor,
    formatPriceAndMc,
    volumeRef.current,
    addressRef.current,
  ])

  return {
    tokenDetailColumnsPC,
  }
}

export default useTokenDetailColumnsPC
