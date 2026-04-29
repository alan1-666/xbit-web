import { Order, OrderSortField, OrderType, SortDirection, TransactionType } from '@/@generated/gql/graphql-trading'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import useTimeAgoGlobal from '@/hooks/useTimeAgoGlobal'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatAmount, formatPrice, formatVolume } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { _activeWallet, mappedTypeChain } from '@/redux/modules/newWallet.slice.ts'
import { selectAllTokens } from '@/redux/modules/tokens.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { cancelOrderMutation } from '@/services/order.service'
import { ChainIds, FollowedHolderColumnKeys, SortByCreateAtType } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import AppConfirm from '@components/common/AppConfirm.tsx'
import { Loading } from '@components/common/Loading.tsx'
import FilterArrowSort from '@components/detaiTokenTable/FilterArrowSort.tsx'
import { SkeletonList } from '@components/ui/skeleton.tsx'
import { DataTableInfiniteScroll } from '@components/ui/XTableInfiniteScroll.tsx'
import { ColumnDef } from '@tanstack/react-table'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { throttle } from 'lodash-es'
import React, { MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { OrdersListFilter } from '.'
import AppDrawer from '../common/AppDrawer'
import LogoWithChain from '../common/LogoWithChain'
import IconArrowSwap2 from '../icon/stroke/IconArrowSwap2'
import { IconWallet } from '../icon/stroke/IconWallet'
import ModifyOrder from './ModifyOrder'

type SortByType = {
  type: SortByCreateAtType | undefined
  field?: string
}

type TableCurrentOrderProps = {
  pendingOrders: Order[]
  refetch?: () => void
  manyTokenData: any
  filter: OrdersListFilter
  setFilter: React.Dispatch<React.SetStateAction<OrdersListFilter>>
}
interface ActionButtonProps {
  icon: string
  iconClassName?: string
  label: string
  labelClassName?: string
  containerClassName?: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  iconClassName,
  label,
  labelClassName,
  containerClassName,
  onClick,
}) => {
  return (
    <div className={cn('flex items-center gap-[6px] cursor-pointer select-none', containerClassName)} onClick={onClick}>
      <img src={icon} className={cn('', iconClassName)} alt="" />
      <div className={cn('app-font-medium text-[calc(1rem*(13/16))] text-[#B9B9B9] leading-[1]', labelClassName)}>
        {label}
      </div>
    </div>
  )
}

const TableCurrentOrders = ({ pendingOrders, refetch, manyTokenData, filter, setFilter }: TableCurrentOrderProps) => {
  const { t, i18n } = useTranslation()
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState<SortByType>({ type: SortByCreateAtType.DESC, field: 'created_at' })
  const [triggerType, setTriggerType] = useState<'mc' | 'price'>('mc')
  const [openModifyDrawer, setOpenModifyDrawer] = useState(false)
  const [orderSelected, setOrderSelected] = useState<Order>()
  // console.log('pendingOrders', pendingOrders)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const navigate = useNavigate()

  const listWalletsByActiveChain = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain, activeChain])

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return false
    setLoadingMore(true)
    return true
  }
  const handleSortByChange = (field: string) => {
    setSortBy((prev) => {
      if (prev.field === field) {
        return {
          type: prev.type === SortByCreateAtType.ASC ? SortByCreateAtType.DESC : SortByCreateAtType.ASC,
          field: field,
        }
      }
      return {
        type: SortByCreateAtType.DESC,
        field: field,
      }
    })
  }

  const getType = (order: Order) => {
    const transactionType = order?.transactionType
    const orderType = order?.type

    if (orderType === OrderType.TrailingTpsl) {
      return 'TrailingTpsl'
    }
    if (orderType === OrderType.Tpsl) {
      return 'Tpsl'
    }
    if (transactionType === TransactionType.Buy) {
      return 'Buy'
    }
    if (transactionType === TransactionType.Sell) {
      return 'Sell'
    }
  }

  const getCardTagType = (type: string | undefined) => {
    if (type === 'Buy') {
      return 'limitBuy'
    }
    if (type === 'Sell' || type === 'Tpsl') {
      return 'limitSell'
    }
    if (type === 'TrailingTpsl') {
      return 'movingStopLossSell'
    }
    return 'limitBuy'
  }

  const getTotalSupply = (address: string) => {
    if (!manyTokenData || manyTokenData.length === 0) return 1
    const token = manyTokenData?.find((token: any) => token.address === address)
    if (!token) return 1
    return token.totalSupply / Math.pow(10, token.decimals)
  }

  const handleClickLogo = (order: Order) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (!order) return
    navigate(
      getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: order?.baseAddress, chain: CHAIN_SYMBOLS[+order?.chainId] }),
      { state: { symbol: order?.baseSymbol } },
    )
  }

  // userAddress
  const pendingOrderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: FollowedHolderColumnKeys.INDEX,
      header: () => <div className="min-w-20">{t('detail.tokenDetail.wallet')}</div>,
      cell: ({ row }) => {
        const order = row?.original as Order
        const wallet = listWalletsByActiveChain.find(
          (item: any) => item?.walletAddress.toLowerCase() === order?.userAddress.toLowerCase(),
        )
        return (
          <div className="flex items-center gap-0.5">
            <IconWallet />
            <p className="text-xs leading-none font-[380] text-white/70">
              {wallet?.name ? wallet?.name : t('detail.tokenDetail.wallet')}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.WALLET,
      header: () => (
        <div className="flex items-center gap-0.5 min-w-10">
          <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">{t('detail.common.type')}</div>
        </div>
      ),
      cell: ({ row }) => {
        const order = row?.original as Order
        const type = getType(order)
        return (
          <p
            className={cn(
              'text-sm leading-none font-[380]',
              getCardTagType(type) === 'limitBuy' && 'text-rise',
              getCardTagType(type) === 'limitSell' && 'text-fall',
              getCardTagType(type) === 'movingStopLossSell' && 'text-fall',
            )}
          >
            {t(`cardTag.${getCardTagType(type)}`)}
          </p>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.POSITION_PERCENTAGE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[74px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer">
              {t('history.token')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original as Order
        const chain: ChainIds = order?.chainId as unknown as ChainIds
        const address = order?.baseAddress
        const { logo: logoUrl } = useTokenInfo(address, chain)
        const chainLogo = getBlockchainLogo2(chain)
        const symbol = order?.baseSymbol

        return (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleClickLogo(order)}>
            <LogoWithChain logo={logoUrl} chainLogo={chainLogo} name={symbol} className="w-6 h-6" />
            <p className="text-white/70 text-sm font-[380] leading-none">{symbol}</p>
          </div>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_BUY,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[74px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer">
              {t('modifyOrder.quantity')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original
        const limitPrice = order?.limitPrice ?? 0
        const limitMarketCap = order?.limitMarketCap ?? 0
        const baseAmount = order?.baseAmount ?? 0
        const quoteAmount = order?.quoteAmount ?? 0
        const totalSupply = getTotalSupply(order.baseAddress) ?? 1
        const openQuoteUsdRate = order?.openQuoteUsdRate
        const quantityLimitBuy =
          limitPrice != 0
            ? (quoteAmount * openQuoteUsdRate) / limitPrice // Limit BuyPrice
            : (quoteAmount * openQuoteUsdRate) / (limitMarketCap / totalSupply) // Limit Buy MarketCap
        const orderAmountLimitBuy = +quoteAmount
        // Sell
        const quantityLimitSell = baseAmount
        const quantityTPSL = baseAmount
        const orderAmountLimitSell =
          limitPrice != 0
            ? (quantityLimitSell * limitPrice) / openQuoteUsdRate // Limit SellPrice
            : (quantityLimitSell * (limitMarketCap / totalSupply)) / openQuoteUsdRate // Limit Sell MarketCap
        const orderAmountTPSL = quoteAmount
        // TrailingTPSL
        const quantityTrailingTPSL = baseAmount
        const type = getType(order)
        const getQuantity = (type: string | undefined) => {
          switch (type) {
            case 'Buy':
              return quantityLimitBuy
            case 'Sell':
              return quantityLimitSell
            case 'Tpsl':
              return quantityTPSL
            case 'TrailingTpsl':
              return quantityTrailingTPSL
            default:
              return '--'
          }
        }

        return (
          <>
            <p className="text-sm leading-[1.15] text-white/70 font-[380]">
              {formatAmount(getQuantity(type), {
                roundMode: 'floor',
                unit: order?.baseSymbol,
              })}
            </p>
            {order?.id === orderSelected?.id && (
              <>
                <AppDrawer
                  open={openModifyDrawer}
                  setOpen={setOpenModifyDrawer}
                  drawerHeaderClassName=""
                  drawerContent={
                    <ModifyOrder
                      order={order}
                      refetch={refetch}
                      setOpen={setOpenModifyDrawer}
                      quantityLimitBuy={quantityLimitBuy.toString()}
                      quantityLimitSell={quantityLimitSell}
                      quantityTPSL={quantityTPSL}
                      orderAmountTPSL={orderAmountTPSL}
                      quantityTrailingTPSL={quantityTrailingTPSL}
                      orderAmountLimitSell={orderAmountLimitSell.toString()}
                      orderAmountLimitBuy={orderAmountLimitBuy.toString()}
                    />
                  }
                />
              </>
            )}
            <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
          </>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_SELL,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[74px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {triggerType === 'mc' ? t('detail.tokenDetail.triggerMC') : t('futuresDetails.common.triggerPrice')}
            </div>
            <IconArrowSwap2
              className="cursor-pointer"
              onClick={() => {
                if (triggerType === 'mc') {
                  setTriggerType('price')
                } else {
                  setTriggerType('mc')
                }
              }}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original as Order
        const triggerMC = order?.limitMarketCap != 0 ? Number(order?.limitMarketCap) : '--'
        const mc = order?.marketCap != 0 ? Number(order?.marketCap) : '--'
        const triggerPrice = order?.limitPrice != 0 ? Number(order?.limitPrice) : '--'
        const totalSupply = getTotalSupply(order.baseAddress) ?? 1
        const value =
          triggerType === 'mc'
            ? triggerMC !== '--'
              ? triggerMC
              : totalSupply * +triggerPrice
            : triggerPrice !== '--'
              ? triggerPrice
              : +triggerMC / totalSupply
        const valueTraildingMc = triggerType === 'mc' ? mc : mc !== '--' ? +mc / totalSupply : '--'
        const tp2 =
          triggerType === 'mc' ? (!!order?.tp2 ? order?.tp2 * totalSupply : '--') : !!order?.tp2 ? order?.tp2 : '--'
        return (
          <p className="text-sm leading-[1.15] font-[330] text-white/70">
            {order?.type === 'TrailingTPSL'
              ? mc != '--'
                ? formatVolume(+valueTraildingMc, {
                    showCurrency: true,
                  })
                : '--'
              : order?.type === 'TPSL'
                ? tp2 !== '--'
                  ? formatVolume(+tp2, {
                      showCurrency: true,
                    })
                  : '--'
                : +value > 0
                  ? formatPrice(+value, {
                      showCurrency: true,
                    })
                  : '--'}
          </p>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.REALIZED,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 cursor-pointer">
              {triggerType === 'mc' ? t('detail.tokenDetail.filledMC') : t('detail.tokenDetail.filledPrice')}
            </div>
            <IconArrowSwap2
              className="cursor-pointer"
              onClick={() => {
                if (triggerType === 'mc') {
                  setTriggerType('price')
                } else {
                  setTriggerType('mc')
                }
              }}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original as Order
        const marketCap = order?.marketCap != 0 ? Number(order?.marketCap) : '--'
        const totalSupply = getTotalSupply(order.baseAddress) ?? 1
        const value = triggerType === 'mc' ? marketCap : +marketCap / totalSupply
        return (
          <p className="text-sm leading-[1.15] font-[330] text-white/70">
            {' '}
            {+value > 0
              ? formatPrice(+value, {
                  showCurrency: true,
                })
              : '--'}
          </p>
        )
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.UNREALIZED,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">
              {t('walletDetail.activity.time')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original as Order
        const createdTime = dayjs(order?.createdAt ?? '').format('YYYY/MM/DD HH:mm')
        return <p className="text-sm leading-[1.15] font-[330] text-white/70">{createdTime}</p>
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.TOTAL_PROFIT,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[88px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50">{t('wallet.create')}</div>
            <FilterArrowSort
              type={'created_at'}
              currentType={sortBy?.field}
              sortByCreatedAt={sortBy?.type}
              classNames="cursor-pointer"
              handleOnclickSort={() => handleSortByChange('created_at')}
            />
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original as Order
        const createdTime = dayjs(order?.createdAt ?? '').valueOf()
        const timeAgo = useTimeAgoGlobal(createdTime, {
          formatFn: (timestampMs) => {
            const lang = i18n.language || 'en'
            const time = dayjs(timestampMs)
            return time.locale(lang).fromNow()
          },
        })
        return <p className="text-sm leading-[1.15] font-[330] text-white/70">{timeAgo}</p>
      },
    },
    {
      accessorKey: FollowedHolderColumnKeys.SOL_BALANCE,
      header: () => {
        return (
          <div className="flex items-center gap-0.5 min-w-[112px]">
            <div className="text-[11px] leading-3 tracking-[0.28px] text-[#FFFFFF]/50 ml-auto">
              {t('detail.tokenDetail.action')}
            </div>
          </div>
        )
      },
      cell: ({ row }) => {
        const order = row?.original as Order
        const handleCancelOrder = useCallback(async () => {
          try {
            if (order.status === 'Confirmed') {
              toast.error(t('orderForm.errors.orderTriggered'))
              return
            }
            const id = order?.id
            const res = await tradingClient.mutate({
              mutation: cancelOrderMutation,
              variables: {
                id,
              },
            })
            if (res?.data?.cancelOrder?.id) {
              toast.success(t('toast.cancelOrderSuccess'))
              if (refetch) {
                refetch()
              }
            }
            return res
          } catch (error) {
            console.log(error)
            throw error
          }
        }, [order])

        return (
          <div className="flex justify-end gap-[16px]">
            <ActionButton
              icon="/images/tokenDetail/icon-edit.svg"
              iconClassName="w-[16px] min-w-[16px]"
              // containerClassName={exceptEnv.includes(env) ? 'cursor-not-allowed' : ''}
              label={t('currentOrdersList.modify')}
              onClick={() => handleModifyOrder(order)}
            />
            <AppConfirm
              title={t('currentOrdersList.cancelOrderConfirm')}
              triggerContent={
                <ActionButton
                  icon="/images/tokenDetail/icon-delete.svg"
                  iconClassName="w-[16px] min-w-[16px]"
                  label={t('currentOrdersList.cancelOrder')}
                />
              }
              onAccept={handleCancelOrder}
            />
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.95

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !loadingMore && hasMore) {
        setLoadingMore(true)
        handleLoadMore().finally(() => setLoadingMore(false))
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [loadingMore, hasMore, handleLoadMore])

  const handleModifyOrder = (order: Order) => {
    if (enabled) {
      setOpenRestrictRegiongDialog(true)
    } else {
      setOpenModifyDrawer(true)
      setOrderSelected(order)
    }
  }

  useEffect(() => {
    if (sortBy?.type) {
      setFilter({
        ...filter,
        sortDir: sortBy.type === SortByCreateAtType.ASC ? SortDirection.Asc : SortDirection.Desc,
        sortField: sortBy?.field as OrderSortField,
      })
    }
  }, [sortBy])

  return (
    <div className="sticky z-[1]">
      {/* Table */}
      <div className="relative mt-1.5 pb-1 z-[3]">
        {
          <>
            <DataTableInfiniteScroll
              columns={pendingOrderColumns}
              data={pendingOrders}
              // isLoading={loading && page === 1 && !filteredData}
              tableProps={{
                isStickyHeader: true,
                containerClassName: 'border-0 select-none',
                tableHeaderRowClassName: '!border-0 !bg-[#111] whitespace-nowrap',
                tableHeaderClassName:
                  'border-0 text-[#FFFFFF80] text-[11px] z-10 leading-3 app-font-medium [&_tr_th]:h-4.5',
                tableBodyRowClassName: 'even:bg-[#ececed0a] border-0',
                tableBodyClassName: '',
                skeletonComponent: <SkeletonList count={10} classNameItem="h-[40px]" />,
                tableCellClassName: 'group-hover:!bg-[#27272a] cursor-pointer',
                // isShowCta: isEmptyData && currentTab === tagFilters[1],
                noDataText: t('currentOrdersList.noData'),
                onRowClick: (data) => {
                  // handleModifyOrder()
                  // const address = data?.address
                  // const referrer = location.pathname
                  // navigate(`${APP_PATH.MEME_WALLET}/${address}?referrer=${referrer}`)
                },
              }}
            />
            {loadingMore && (
              <div className="flex justify-center items-center py-4">
                <Loading />
              </div>
            )}
          </>
        }
      </div>
    </div>
  )
}

export default React.memo(TableCurrentOrders)
