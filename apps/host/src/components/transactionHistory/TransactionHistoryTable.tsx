import { Order, SortDirection, Status, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import TokenFilter from '@/components/transactionHistory/TokenFilter'
import LoadingSpinner from '@/components/ui/loading-spinner.tsx'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { SkeletonList } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { APP_PATH } from '@/lib/constant'
import { formatAmount, formatBalance, formatPrice, formatVolume } from '@/lib/format'
import { cn, getPath } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { getBlockchainLogo2, getLinkExplorer } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconSortDown, IconSortUp } from '@components/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { DataTable } from '@pages/home/data-table.tsx'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { RefObject, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import FilterByToken from './FilterByToken'
import FilterByType from './FilterByType'
import { TYPE_CHAIN } from '@/lib/blockchain'

type TransactionHistoryTableProps = {
  platformFee: number
  containerClassName?: string
  transactions: Order[]
  dataUnit: 'USD' | 'SOL' | 'ETH' | 'BNB'
  tokenFilter: string | undefined
  sortByCreatedAt: SortDirection
  typeFilter?: TransactionType
  onFilterByTokenChange: (value: string | undefined) => void
  onSortByCreatedAtChange: (value: SortDirection) => void
  onFilterByTypeChange: (value?: TransactionType) => void
  onBottomReached?: () => void
  loading?: boolean
  loadingMore?: boolean
  loaderRef?: RefObject<null>
  isCurrentToken?: boolean
}

const TransactionHistoryTable = ({
  platformFee,
  transactions,
  dataUnit,
  tokenFilter,
  sortByCreatedAt,
  typeFilter,
  onFilterByTokenChange,
  onSortByCreatedAtChange,
  onFilterByTypeChange,
  loading = false,
  loadingMore,
  loaderRef,
  isCurrentToken = false,
}: TransactionHistoryTableProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const { address } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const activeWallet = useSelector(_activeWallet)
  const walletAddress = activeWallet?.walletAddress
  const nativeTokenPrice = useNativeTokenPrice()
  const TRANSACTION_TYPES: { label: string; value?: TransactionType }[] = [
    { label: t('history.all'), value: undefined },
    { label: t('history.buy'), value: TransactionType.Buy },
    { label: t('history.sell'), value: TransactionType.Sell },
  ]

  const [openModalFilterByToken, setOpenModalFilterByToken] = useState(false)
  const [openModalFilterByType, setOpenModalFilterByType] = useState(false)

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: 'txHash',
        header: () => (
          <div className="min-w-[150px] flex items-center gap-[2px]">
            {isDesktop ? (
              <TokenFilter
                userAddresses={walletAddress ? [walletAddress] : []}
                value={tokenFilter || ''}
                onValueChange={(value) => {
                  onFilterByTokenChange(value || undefined)
                }}
              />
            ) : (
              <div
                className="flex items-center gap-[2px] cursor-pointer"
                onClick={() => {
                  setOpenModalFilterByToken(true)
                }}
              >
                <div>{t('history.token')}</div>
                <div className="flex items-center justify-center w-[14px] h-[14px]">
                  {tokenFilter ? (
                    <img src="/images/icons/icon-filter-solid.svg" className="w-[10px] h-[10px]" alt="" />
                  ) : (
                    <img src="/images/icons/icon-filter.svg" className="w-[10px] h-[10px]" alt="" />
                  )}
                </div>
              </div>
            )}
            /
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (sortByCreatedAt === SortDirection.Desc) {
                  onSortByCreatedAtChange(SortDirection.Asc)
                } else {
                  onSortByCreatedAtChange(SortDirection.Desc)
                }
              }}
            >
              {t('history.time')}
              <div className="flex items-center justify-center">
                <div className="flex flex-col ml-1">
                  <IconSortUp currentColor={sortByCreatedAt === 'asc' ? '#843BEA' : '#605E68'} />
                  <IconSortDown currentColor={sortByCreatedAt === 'desc' ? '#843BEA' : '#605E68'} />
                </div>
              </div>
            </div>
          </div>
        ),
        cell: ({ row }) => {
          const baseSymbol = row.original?.baseSymbol
          const baseToken = row.original?.baseAddress
          const chainId = Number(+row.original?.chainId as ChainIds) as ChainIds
          const createdAt = row.original?.createdAt
          const isXStock = row.original?.isXStock || false
          const { logo: logoToken } = useTokenInfo(baseToken, chainId)
          return (
            <div className="flex items-center gap-[5px]">
              <div className="relative">
                <LogoWithChain
                  chainImgClassName={'h-[unset]'}
                  logo={logoToken}
                  logoClassName="w-[30px] h-[30px]"
                  chainLogo={getBlockchainLogo2(chainId)}
                  name={baseSymbol}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="font-[500] text-[13px] text-[#CACACA] ">{baseSymbol}</div>
                  {isXStock && <IconXStock />}
                </div>
                <div className="flex items-center gap-[5px] font-[400] text-[10px] text-[#CACACA]">
                  {dayjs(createdAt).format('YYYY/MM/DD HH:mm:ss')}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        header: () => (
          <div className="min-w-[60px]">
            <div
              className="flex items-center gap-[2px] cursor-pointer"
              onClick={() => {
                setOpenModalFilterByType(true)
              }}
            >
              <div>{t('history.type')}</div>
              <div className="flex items-center justify-center w-[14px] h-[14px]">
                {typeFilter ? (
                  <img src="/images/icons/icon-filter-solid.svg" className="w-[10px] h-[10px]" alt="" />
                ) : (
                  <img src="/images/icons/icon-filter.svg" className="w-[10px] h-[10px]" alt="" />
                )}
              </div>
            </div>
            {isDesktop && (
              <Popover open={openModalFilterByType} onOpenChange={setOpenModalFilterByType}>
                <PopoverAnchor />
                <PopoverContent
                  className="w-[90px] bg-[#212127] p-1 z-[9999]"
                  align="center"
                  side="bottom"
                  sideOffset={2}
                >
                  {TRANSACTION_TYPES.map((e) => (
                    <div
                      key={e.value}
                      className={cn(
                        'hover:bg-[#27272a] cursor-pointer px-2 py-1 rounded text-center',
                        typeFilter === e.value && 'text-[#FBFBFB] bg-[#2B2B33]',
                      )}
                      onClick={() => {
                        onFilterByTypeChange(e.value)
                        setOpenModalFilterByType(false)
                      }}
                    >
                      <span className="font-[380] text-[13px] text-center mx-auto">{e.label}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const type = row.original?.transactionType
          return (
            <div
              className={`${type === TransactionType.Buy ? 'text-rise' : type === TransactionType.Sell ? 'text-fall' : ''}`}
            >
              {(() => {
                switch (type) {
                  case TransactionType.Buy:
                    return t('history.buy')
                  case TransactionType.Sell:
                    return t('history.sell')
                  // case 'add':
                  //   return t('history.addLiquidity')
                  // case 'remove':
                  //   return t('history.removeLiquidity')
                  default:
                    return type
                }
              })()}
            </div>
          )
        },
      },
      {
        accessorKey: 'quoteAmount',
        header: () => <div className="min-w-[100px]">{t('history.tradeVolume')}</div>,
        cell: ({ row }) => {
          const quoteAmount = Number(row.original?.quoteAmount)
          const baseAmount = Number(row.original?.baseAmount)
          const closePriceUsd = Number(row.original?.closePriceUsd)
          if (dataUnit === 'USD') {
            return (
              <div className="text-[#CACACA]">
                {formatVolume(baseAmount * Number(closePriceUsd), {
                  showCurrency: true,
                })}
              </div>
            )
          }
          return (
            <span className="flex items-center no-wrap w-full gap-1 text-[#CACACA]">
              <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
              {formatAmount(closePriceUsd ? quoteAmount : 0, {
                roundMode: 'floor',
              })}
            </span>
          )
        },
      },
      {
        accessorKey: 'pnl',
        header: () => <div className="min-w-[100px]">{t('history.pnl')}</div>,
        cell: ({ row }) => {
          const pnl = Number(row.original?.pnl)
          return (
            <div className={`${pnl > 0 ? 'text-rise' : pnl < 0 ? 'text-fall' : 'text-[#CACACA]'}`}>
              {dataUnit === 'USD' ? (
                formatBalance(pnl, {
                  roundMode: 'floor',
                  showCurrency: true,
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(pnl / Number(nativeTokenPrice), {
                    roundMode: 'floor',
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'price',
        header: () => <div className="min-w-[100px]">{t('history.price')}</div>,
        cell: ({ row }) => {
          const closePriceQuote = Number(row.original?.closePriceQuote)
          const closePriceUsd = Number(row.original?.closePriceUsd)
          const type = row.original?.transactionType
          return (
            <div
              className={`${type === TransactionType.Buy ? 'text-rise' : type === TransactionType.Sell ? 'text-fall' : ''}`}
            >
              {dataUnit === 'USD' ? (
                formatPrice(closePriceUsd, {
                  showCurrency: true,
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(closePriceQuote)}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div className="min-w-[100px]">{t('history.amount')}</div>,
        cell: ({ row }) => {
          const amount = Number(row.original?.baseAmount)
          return (
            <div className="text-[#CACACA]">
              {formatAmount(amount, {
                roundMode: 'floor',
              })}
            </div>
          )
        },
      },
      {
        accessorKey: 'gasFeeAmount',
        header: () => (
          <div className="min-w-[100px]">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="mr-auto ml-[-5px] flex items-center gap-1">
                  <span>{t('history.gasFee')}</span>{' '}
                  <img className="h-3 w-3 min-w-3" alt="" src="/images/orderSetting/icon-info.svg"></img>
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px] bg-[#191919]">
                  <p className="text-[11px] tracking-wide">{t('history.gasFeeTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        cell: ({ row }) => {
          const gasFee = Number(row.original?.gasFee)
          const gasFeeAmount = Number(row.original?.gasFeeAmount)
          return (
            <div className="text-[#CACACA]">
              {dataUnit === 'USD' ? (
                formatBalance(gasFee, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              ) : (
                <div className="flex items-center gap-1 text-[#CACACA]">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(gasFeeAmount, {
                    roundMode: 'ceil',
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'slippageLoss',
        header: () => <div className="min-w-[100px]">{t('history.slippageLoss')}</div>,
        cell: ({ row }) => {
          const slippageLoss = Number(row.original?.slippageLoss)
          const slippageLossAmount = Number(row.original?.slippageLossAmount)
          return (
            <div className="text-[#CACACA]">
              {dataUnit === 'USD' ? (
                formatBalance(slippageLoss, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(slippageLossAmount, {
                    roundMode: 'ceil',
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'facilitationPayment',
        header: () => <div className="min-w-[100px]">{t('history.facilitationPayment')}</div>,
        cell: ({ row }) => {
          const antiMevFee = Number(row.original?.antiMevFee)
          const antiMevFeeAmount = Number(row.original?.antiMevFeeAmount)
          return (
            <div className="text-[#CACACA]">
              {dataUnit === 'USD' ? (
                formatBalance(antiMevFee, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(antiMevFeeAmount, {
                    roundMode: 'ceil',
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'priorityFee',
        header: () => <div className="min-w-[100px]">{t('history.priorityFee')}</div>,
        cell: ({ row }) => {
          const priorityFee = Number(row.original?.priorityFee)
          const priorityFeeAmount = Number(row.original?.priorityFeeAmount)
          return (
            <div className="text-[#CACACA]">
              {dataUnit === 'USD' ? (
                formatBalance(priorityFee, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(priorityFeeAmount, {
                    roundMode: 'ceil',
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'pumpFeeAmount',
        header: () => <div className="min-w-[100px]">{t('history.pump')}</div>,
        cell: ({ row }) => {
          const pumpFee = Number(row.original?.pumpFee)
          const pumpFeeAmount = Number(row.original?.pumpFeeAmount)
          return (
            <div className="text-[#CACACA]">
              {dataUnit === 'USD' ? (
                formatBalance(pumpFee, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(pumpFeeAmount, {
                    roundMode: 'ceil',
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'platformFeeAmount',
        header: () => (
          <div className="min-w-[120px]">
            {t('history.xbitFee', {
              value: platformFee * 100,
            })}
          </div>
        ),
        cell: ({ row }) => {
          const platformFeeRecord = Number(row.original?.platformFee)
          const platformFeeAmountRecord = Number(row.original?.platformFeeAmount)
          const status = row?.original?.status
          const isSuccess = status === Status.Completed || status === Status.Confirmed
          const feeRate = row.original?.feeRate || 0
          return (
            <span className="flex items-center gap-0.5 text-[#CACACA]">
              {dataUnit === 'USD' ? (
                formatBalance(platformFeeRecord, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              ) : (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+row.original?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(platformFeeAmountRecord, {
                    roundMode: 'ceil',
                  })}
                </div>
              )}
              {isSuccess && feeRate != platformFee && <span className="text-white/60">({feeRate * 100}%)</span>}
            </span>
          )
        },
      },
      {
        accessorKey: 'txid',
        header: () => <div className="min-w-[115px]">{t('history.txHash')}</div>,
        cell: ({ row }) => {
          const txid = row.original?.txid
          const chanId = Number(+row.original?.chainId as ChainIds) as ChainIds
          const status = row?.original?.status
          const isSuccess = status === Status.Completed || status === Status.Confirmed
          const isFail = status === Status.Canceled

          if (!txid && status === Status.Canceled) {
            return (
              <div className="flex items-center gap-1 font-[400] text-[12px]">
                <img alt="icon status" className="w-3 h-3" src="/images/icons/icon-x-fill.svg" />
                {t('orderForm.errors.orderFailed')}
              </div>
            )
          }

          if (txid) {
            return (
              <a
                href={getLinkExplorer(chanId, txid)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-[400] text-[12px] text-[#CACACA] hover:text-[#843BEA] hover:underline"
              >
                {txid && (
                  <>
                    {isFail ? (
                      <img alt="icon status" className="w-3 h-3" src="/images/icons/icon-x-fill.svg" />
                    ) : isSuccess ? (
                      <img alt="icon status" className="w-3 h-3" src="/images/icons/icon-tick-rounded.svg?v=2" />
                    ) : (
                      <LoadingSpinner size={12} />
                    )}
                  </>
                )}
                {txid?.length > 10 ? `${txid?.slice(0, 5)}...${txid?.slice(-5)}` : txid}
              </a>
            )
          }

          return <LoadingSpinner size={12} />
        },
      },
    ],
    [tokenFilter, openModalFilterByType, activeWallet?.walletAddress, sortByCreatedAt, dataUnit, platformFee],
  )

  return (
    <div className="relative">
      {!isDesktop && (
        <>
          <FilterByToken
            open={openModalFilterByToken}
            setOpen={setOpenModalFilterByToken}
            tokenFilter={tokenFilter}
            onFilterByTokenChange={onFilterByTokenChange}
          />
          <FilterByType
            open={openModalFilterByType}
            setOpen={setOpenModalFilterByType}
            typeFilter={typeFilter}
            onFilterByTypeChange={onFilterByTypeChange}
          />
        </>
      )}
      <DataTable
        columns={columns}
        data={transactions}
        isStickyHeader
        isStickyFirstColumn
        stickyBg={isDesktop ? '#121214' : '#0A0A0A'}
        containerClassName={cn(
          isDesktop ? `border-none ${isCurrentToken ? 'max-h-[calc(100vh-460px)]' : 'max-h-[calc(100vh-360px)]'}` : '',
        )}
        tableClassName=""
        tableHeaderClassName="text-white/50 bg-[#0A0A0A]"
        tableHeaderRowClassName={cn(
          'border-b-[0.5px] border-[rgba(35,35,41,1)] text-[11px] text-[rgba(255, 255, 255, 0.48)] sticky top-0 whitespace-nowrap',
          isDesktop ? 'border-none' : 'border-b-[0.5px] border-[rgba(35,35,41,1)]',
        )}
        tableHeadClassName="app-font-light px-2 py-1 items-center justify-center"
        tableBodyClassName="min-h-[300px] overflow-y-auto"
        tableBodyRowClassName="group whitespace-nowrap !border-0"
        tableCellClassName="group-hover:!bg-[#27272a] cursor-pointer"
        noDataText={t('transactionHistory.noData')}
        onRowClick={(rowData) => {
          const baseAddress = rowData?.baseAddress
          const mainContent = document.getElementById('main-content')
          if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' })
          }
          if (baseAddress && baseAddress !== address) {
            navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: baseAddress, chain: activeChain }), {
              state: { symbol: rowData.baseSymbol },
            })
          }
        }}
        isLoading={loading}
        isShowLoadMore={loadingMore}
        loadMoreRef={loaderRef}
        skeletonComponent={<SkeletonList count={10} classNameItem="h-[52px]" />}
      />
    </div>
  )
}
export default TransactionHistoryTable
