import { ConfigStatus } from '@/@generated/gql/graphql-trading'
import {
  DataTableInfiniteScroll,
  TSortConfig,
  TSortDirection,
  XCustomSortFunction,
  XFilterHead,
  XNormalHead,
  XSortHead,
} from '@/components/ui/XTableInfiniteScroll'
import { SMART_MONEY_ALLOWED_CHAINS } from '@/const/smartMoney'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { APP_PATH, PAGE_SIZE } from '@/lib/constant'
import { formatAmount, formatPercent, formatVolume, getStyleRiseFall } from '@/lib/format'
import { tradingClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { selectShouldShowMaintenanceNotification } from '@/redux/modules/maintenance.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { store, useAppSelector } from '@/redux/store'
import { listCopyTradeConfig, updateCopyTradeConfig, updateCopyTradeConfigStatus } from '@/services/copytrade.service'
import { ChainIds } from '@/types/enums'
import { totalListKeysInArray } from '@/utils/array'
import { getStatusColor } from '@/utils/copy-trade-helper'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { formatToTimeAgoI18n, getTimeAgo } from '@/utils/time'
import { useQuery } from '@apollo/client'
import Container from '@components/common/Container.tsx'
import SwitchChains from '@components/header/switch-chains.tsx'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { useActiveChain, useActiveChainId } from '@hooks/useActiveChain.ts'
import { ColumnDef } from '@tanstack/react-table'
import { get } from 'lodash-es'
import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ButtonConnectWallet } from '../common/ButtonConnectWallet'
import ChainCurrencyIcon from '../common/ChainCurrencyIcon'
import { CurrencyToggleClient } from '../detailTokenTabs/CurrencyToggle'
import { IconCloseCircle, IconEditParams, IconPause, IconPlay, Wallet } from '../icon'
import RestrictRegiongDialog from '../RestrictRegiongDialog'
import { XModal } from '../ui'
import { Button } from '../ui/button'
import { SkeletonList } from '../ui/skeleton'
import AliasCard from './card/AliasCard'
import DrawerCopyTrade from './drawer/DrawerCopyTrade'
import { useSmartMoneyContextFields } from './SmartMoneyContext'

// TODO: make type details
const CopyTradeActions = memo(
  ({
    row,
    onChangeStatus,
    isPC = false,
  }: {
    row: any
    onChangeStatus: (id: string, status: string) => void
    isPC?: boolean
  }) => {
    const { status, id, leaderAddress } = row.original
    const [open, setOpen] = useState(false)
    const walletCopyTradeRef = useRef<(() => void) | null>(null)
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const enabled = useFeatureIsOn('trading_block_zone')
    const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

    // Use the current status from props instead of state
    const currentStatus = status

    const onEditParamsSetting = useCallback(() => {
      if (isPC) {
        setOpen(true)
      } else {
        navigate(APP_PATH.COPY_TRADING_WALLET_SETTINGS + `/${id}`)
      }
    }, [navigate, id, isPC])

    const handleChangeStatus = useCallback(
      async (setStatus: keyof typeof ConfigStatus) => {
        if (enabled && currentStatus !== ConfigStatus.Active) {
          setOpenRestrictRegiongDialog(true)
        } else {
          setIsLoading(true)
          let _status: keyof typeof ConfigStatus
          switch (setStatus) {
            case ConfigStatus.Active:
              _status = ConfigStatus.Paused
              break
            case ConfigStatus.Paused:
              _status = ConfigStatus.Active
              break
            case ConfigStatus.Canceled:
              _status = ConfigStatus.Canceled
              break
            default:
              _status = ConfigStatus.Active
              break
          }
          try {
            await tradingClient.mutate({
              mutation: updateCopyTradeConfigStatus,
              variables: {
                input: {
                  id,
                  status: _status,
                },
              },
            })
            //update to cache
            const _data: any[] = loadFirstPageFromStorage('smartMoneyList.walletCopyTrade')
            const _index = _data.findIndex((item: any) => item.id === id)
            if (_index !== -1) {
              _data[_index].status = _status
              saveFirstPageToStorage('smartMoneyList.walletCopyTrade', _data)
            }
            onChangeStatus(id, _status)
          } catch (error) {
            console.error('Error updating status:', error)
          } finally {
            setIsLoading(false)
          }
        }
      },
      [id, onChangeStatus, enabled],
    )

    const handleDeleteConfirm = useCallback(() => {
      setShowDeleteModal(false)
      handleChangeStatus(ConfigStatus.Canceled)
    }, [handleChangeStatus])

    return (
      <div className={cn('flex items-center gap-1 pl-[4px]', status === ConfigStatus.Canceled ? 'hidden' : '')}>
        <Button
          type="button"
          disabled={currentStatus === ConfigStatus.Canceled}
          isLoading={isLoading}
          status={currentStatus}
          showStatusLabel={true}
          onClick={() => {
            handleChangeStatus(currentStatus)
          }}
          variant="secondary"
          className="flex items-center gap-1 bg-[#ECECED14] text-[#FFFFFFB2] px-2.5 text-[calc(11rem/16)] rounded-full h-7 min-w-[80px] justify-start"
        />
        <Button
          variant="secondary"
          disabled={currentStatus === ConfigStatus.Canceled}
          className="flex items-center gap-1 bg-[#ECECED14] text-[#FFFFFFB2] px-2.5 text-[calc(11rem/16)] rounded-full h-7 min-w-[60px] justify-start"
          onClick={onEditParamsSetting}
        >
          <IconEditParams className="!size-3" />
          <span className="flex-1">{t('listCoin.copyTrade.copyTradeEditParams')}</span>
        </Button>
        <Button
          disabled={currentStatus === ConfigStatus.Canceled}
          variant="secondary"
          className="flex items-center gap-1 bg-[#ECECED14] text-[#FFFFFFB2] px-2.5 text-[calc(11rem/16)] rounded-full h-7 min-w-[60px] justify-start"
          onClick={() => setShowDeleteModal(true)}
        >
          <img src="/images/icons/close-circle.svg" className="" alt="close circle" />
          <span className="flex-1">{t('listCoin.copyTrade.copyTradeDelete')}</span>
        </Button>
        <XModal.Confirmation
          showModal={showDeleteModal}
          setShowModal={setShowDeleteModal}
          title={t('walletCopy.confirmDelete')}
          description={`${t('walletCopy.deleteMessage', { AddressLeader: listCoinHelper.formatWalletNameCustom(leaderAddress ? leaderAddress : '') })}`}
          onConfirm={handleDeleteConfirm}
        />
        {isPC ? (
          <DrawerCopyTrade
            open={open}
            setOpen={setOpen}
            currentId={id}
            onSuccess={() => {
              // Trigger reload of WalletCopyTrade when copy trade is created
              if (walletCopyTradeRef.current) {
                walletCopyTradeRef.current()
              }
            }}
          />
        ) : null}

        <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
      </div>
    )
  },
)

CopyTradeActions.displayName = 'CopyTradeActions'

export const MemoizedCopyTradeActions = memo(CopyTradeActions, (prevProps, nextProps) => {
  return (
    prevProps.row.original.status === nextProps.row.original.status &&
    prevProps.row.original.id === nextProps.row.original.id
  )
})

const CopyTradeInfo = memo(({ row }: any) => {
  const { isDesktop } = useResponsive()
  const navigate = useNavigate()
  const { status, leaderAddress, leaderNickname, currencyIcon, createdAt } = row.original
  const { t } = useTranslation()

  const handleClick = useCallback(() => {
    navigate(isDesktop ? `${APP_PATH.WALLET_COPY}/${row.original.id}` : `${APP_PATH.WALLET_COPY}/${row.original.id}`)
  }, [navigate, row.original.id, isDesktop])

  const handleChangeCopyTradeName = async (name: string, id: string) => {
    // try {
    //   const response = await mutate({
    //     variables: {
    //       input: {
    //         id: address || '',
    //         leaderNickname: name,
    //       },
    //     },
    //   })
    //   toast.success(t('walletCopy.toast.modifyNameSuccess'))
    //   setDisplayWalletName(name || leaderAddress)
    //   return response.data
    // } catch (err) {
    //   toast.error(t('walletCopy.toast.modifyNameError'))
    //   throw err
    // }
    try {
      await tradingClient
        .mutate({
          mutation: updateCopyTradeConfig,
          variables: {
            input: {
              id: row.original.id,
              leaderNickname: name,
            },
          },
        })
        .then(() => {
          toast.success(t('walletCopy.toast.modifyNameSuccess'))
        })
        .catch((err) => {
          toast.error(t('walletCopy.toast.modifyNameError'))
          throw err
        })
    } catch (err) {
      toast.error(t('walletCopy.toast.modifyNameError'))
      throw err
    }
  }

  return (
    <div
      className={cn('flex items-center h-[60px] min-w-[120px]', isDesktop ? 'px-[10px]' : '', getOpacity(status))}
      onClick={handleClick}
    >
      <div className="flex mr-2">
        <ChainCurrencyIcon
          currencyIcon={currencyIcon}
          avatarClassName="rounded-[8px] w-[42px] h-[42px] justify-center items-center ml-0 mt-[0px]"
          fallbackImageEnable
          fallbackNFT={leaderAddress}
        />
      </div>
      <div>
        <div className="flex items-center gap-[calc(1rem*(4/16))] mr-4 mt-0">
          <AliasCard
            address={leaderAddress}
            name={leaderNickname}
            useCopyButton={isDesktop}
            useEditNameButton={isDesktop}
            classNameWrapper="flex items-center mb-[4px] pl-[4px]"
            classNameInput="h-[28px] focus:border-[#3E2761] bg-[#1F1E25]"
            classNameAlias={cn(
              'text-title app-font-medium -ml-1',
              isDesktop ? 'text-[16px]' : 'text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]',
            )}
            onChangeName={(name) => handleChangeCopyTradeName(name, leaderAddress)}
            unLinkDetail={true}
          />
        </div>
        <div className="flex items-center">
          <div
            className={cn(
              'flex gap-[calc(1rem*(4/16))] text-normal text-white/80',
              isDesktop ? 'text-[13px]' : 'text-[10px]',
            )}
          >
            <WalletCopyTradeStatus status={status} useIcon={isDesktop} />
            <span className={cn(isDesktop ? 'hidden' : 'block')}>({formatToTimeAgoI18n(createdAt)})</span>
          </div>
        </div>
      </div>
    </div>
  )
})

CopyTradeInfo.displayName = 'CopyTradeInfo'

export function getOpacity(status: keyof typeof ConfigStatus) {
  return status === ConfigStatus.Canceled ? 'opacity-50' : ''
}

export const WalletCopyTradeStatus = (props: {
  status: ConfigStatus
  useIcon?: boolean
  useDot?: boolean
  className?: string
}) => {
  const { status, useIcon = false, useDot = false, className = '' } = props
  const { t } = useTranslation()

  function getStatusIcon(status: ConfigStatus) {
    switch (status) {
      case ConfigStatus.Active:
        return <IconPlay className="!size-3" />
      case ConfigStatus.Paused:
        return <IconPause className="!size-3" />
      case ConfigStatus.Canceled:
        return <IconCloseCircle className="!size-3" />
    }
  }

  function getStatus(status: ConfigStatus) {
    switch (status) {
      case ConfigStatus.Active:
        return t('walletCopy.running')
      case ConfigStatus.Paused:
        return t('walletCopy.paused')
      case ConfigStatus.Canceled:
        return t('walletCopy.canceled')
      default:
        return null
    }
  }
  return (
    <div className={cn('flex items-center', useIcon && 'gap-1', getStatusColor(status), className)}>
      {useIcon && getStatusIcon(status)}
      {useDot && <div className={cn('w-1 h-1 rounded-full bg-rise mr-1 text-inherit', getStatusColor(status, true))} />}
      <span>{getStatus(status)}</span>
    </div>
  )
}

export const WalletCopyTrade = ({
  isPC,
  onRefetch,
}: {
  isPC?: boolean
  onRefetch?: React.MutableRefObject<(() => void) | null>
}) => {
  const { t } = useTranslation()
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)
  const [sortConfig, setSortConfig] = useState<TSortConfig>(
    loadFirstPageFromStorage<TSortConfig>('TopTradersSortConfig', {
      key: '',
      value: false,
    }),
  )
  const [unit, setUnit] = useState<'SOL' | 'USD'>('USD')
  const priceTokenSOL = store.getState()?.price?.list['SOL'] || 0
  const activeWallet = useSelector(_activeWallet)
  const [items, setItems] = useState<any[]>(loadFirstPageFromStorage(`smartMoneyList.walletCopyTrade`))
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const navigate = useNavigate()
  const [filterConfig, setFilterConfig] = useState<Record<string, string>>(
    loadFirstPageFromStorage<Record<string, string>>('TopTradersFilterConfig', {
      status: 'all',
    }),
  )

  const activeChain = useActiveChain()
  const activeChainId = useActiveChainId() ?? ChainIds.Solana
  const [searchParams] = useSearchParams()
  const isNotSupportNetwork = searchParams?.get('isNotSupportNetwork') === 'true'
  const { isEmptyWalletCopyTrade, isOpenDrawerCopyTrade } = useSmartMoneyContextFields([
    'isEmptyWalletCopyTrade',
    'isOpenDrawerCopyTrade',
  ])
  const isShowMaintenanceNotification = useAppSelector(selectShouldShowMaintenanceNotification)

  useEffect(() => {
    saveFirstPageToStorage('TopTradersSortConfig', sortConfig)
  }, [sortConfig])
  useEffect(() => {
    saveFirstPageToStorage('TopTradersFilterConfig', filterConfig)
  }, [filterConfig])

  const { loading, refetch } = useQuery(listCopyTradeConfig, {
    variables: {
      input: {
        page,
        size: PAGE_SIZE,
        chainId: activeChainId,
      },
    },
    skip: !activeWallet?.isConnected,
    client: tradingClient,
    // TODO: deprecated
    onCompleted: (res) => {
      const _items = get(res, 'listCopyTradeConfig.items', [])
      /**
       * if _items.length == 0, will go to topTalents page
       */
      // if (_items.length === 0) {
      //   navigate(`${APP_PATH.MEME_SMART_MONEY}?tab=topTalents`)
      //   return
      // }
      if (_items.length < PAGE_SIZE) setHasMore(false)
      if (page === 1) {
        setItems(mapOrderItem(_items))
        saveFirstPageToStorage('smartMoneyList.walletCopyTrade', mapOrderItem(_items))
      } else {
        setItems((prev) => {
          // If no new orders, return previous state
          if (_items.length) {
            const newItems = mapOrderItem(_items)
            return [...prev, ...newItems]
          }
          return prev
        })
      }
    },
  })

  const isEmpty = useMemo(() => !loading && items.length === 0, [loading, items])

  const onWalletSetting = useCallback(() => {
    if (activeWallet?.isConnected) {
      navigate(APP_PATH.COPY_TRADING_WALLET_SETTINGS)
    }
  }, [activeWallet?.isConnected, navigate])

  const onCellClick = useCallback(
    (id: string | number) => {
      navigate(`${APP_PATH.WALLET_COPY}/${id}`)
    },
    [navigate],
  )

  const onChangeStatus = useCallback((id: string, status: string) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, status }
        }
        return item
      })
    })
  }, [])

  function mapOrderItem(_rawData: any[]): any[] {
    const _result: any = []
    if (_rawData.length > 0) {
      //calculate statistics
      _rawData.forEach((item: any) => {
        const statistics = get(item, 'statistic.copyTradeTokenHoldingStatistics', [])
        const resultStatistics = totalListKeysInArray(statistics, [
          'totalProfitInUsd',
          'totalBuyInUsd',
          'buyCostInUsd',
          'totalSellInUsd',
          'totalBuy',
          'totalSell',
        ])
        _result.push({
          ...item,
          resultStatistics,
        })
      })
    }
    return _result
  }

  const handleSortChange = useCallback((key: string, value: TSortDirection) => {
    setSortConfig({ key, value })
  }, [])

  const getSortConfig = useCallback(
    (key: string): TSortDirection => {
      return sortConfig.key === key ? sortConfig.value : false
    },
    [sortConfig],
  )

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'leaderAddress',
        header: (props) => (
          <XFilterHead
            {...props}
            headTitle={t('listCoin.copyTrade.followStatus')}
            items={[
              {
                label: t('listCoin.copyTrade.all'),
                value: 'all',
              },
              {
                label: t('listCoin.copyTrade.running'),
                value: 'running',
              },
              {
                label: t('listCoin.copyTrade.paused'),
                value: 'paused',
              },
              {
                label: t('listCoin.copyTrade.cancel'),
                value: 'canceled',
              },
            ]}
            initialFilter={filterConfig.status}
            onChangeFilter={(value) => {
              setFilterConfig((prev) => ({ ...prev, status: value }))
            }}
            // useIconFilter={false}
            isPC={isPC}
          />
        ),
        filterFn: (row, _columnId, value) => {
          const cellValue = row.original.status
          switch (value) {
            case 'running':
              return cellValue == ConfigStatus.Active
            case 'paused':
              return cellValue == ConfigStatus.Paused
            case 'canceled':
              return cellValue == ConfigStatus.Canceled
            default:
              return true
          }
        },
        cell: (props) => <CopyTradeInfo row={props.row} />,
      },
      {
        accessorKey: 'totalBuyInUsd',
        header: (props) => (
          <XSortHead
            {...props}
            tKey={t('listCoin.copyTrade.totalBuy')}
            initialSort={getSortConfig('totalBuyInUsd')}
            onSortChange={(val) => handleSortChange('totalBuyInUsd', val)}
          />
        ),
        sortingFn: (rowA, rowB) =>
          XCustomSortFunction(
            rowA.original.resultStatistics,
            rowB.original.resultStatistics,
            (row) => row.totalBuyInUsd || 0,
            'number',
          ),
        cell: (props) => (
          <div
            className={cn(
              'min-w-[70px] flex items-center h-[60px] pt-[4.5px] pb-[4.5px]',
              getOpacity(props.row.original.status),
            )}
            onClick={() => onCellClick(props?.row?.original?.id || '')}
          >
            <span className={cn('text-[calc(13rem/16)] text-[#FFFFFF] app-font-medium pl-[4px]')}>
              {formatVolume(props.row.original.resultStatistics.totalBuyInUsd || 0, {
                showCurrency: true,
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'totalSellInUsd',
        header: (props) => (
          <XSortHead
            {...props}
            tKey={t('listCoin.copyTrade.totalSell')}
            initialSort={getSortConfig('totalSellInUsd')}
            onSortChange={(val) => handleSortChange('totalSellInUsd', val)}
          />
        ),
        sortingFn: (rowA, rowB) =>
          XCustomSortFunction(
            rowA.original.resultStatistics,
            rowB.original.resultStatistics,
            (row) => row.totalSellInUsd || 0,
            'number',
          ),
        cell: (props) => (
          <div
            className={cn('flex items-center h-[60px] pt-[4.5px] pb-[4.5px]', getOpacity(props.row.original.status))}
            onClick={() => onCellClick(props?.row?.original?.id || '')}
          >
            <span className={cn('text-[calc(13rem/16)] text-[#FFFFFF] app-font-medium pl-[4px] items-center')}>
              {formatVolume(props.row.original.resultStatistics.totalSellInUsd || 0, {
                showCurrency: true,
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'realizedProfit',
        header: () => {
          return (
            <div className="flex px-[4px]">
              <XNormalHead tKey={t('listCoin.copyTrade.realizedProfit')} className="normal-case" />
              <CurrencyToggleClient
                value={unit}
                initUnit="USD"
                toggleCurrency={(val) => setUnit(val)}
                className={cn('ml-[4px] min-w-[45px]', isPC ? 'gap-[0px]' : '')}
              />
            </div>
          )
        },
        cell: (props) => {
          //Total PnL:  lấy tổng các giá trị totalProfitInUsd
          //%PnL = sum(totalProfitInUsd) / sum[(totalBuyInUsd - buyCostInUsd)] * 100
          const totalProfitInUsd = get(props, 'row.original.resultStatistics.totalProfitInUsd', 0)
          const totalBuyInUsd = get(props, 'row.original.resultStatistics.totalBuyInUsd', 0)
          const buyCostInUsd = get(props, 'row.original.resultStatistics.buyCostInUsd', 0)
          const profitPercent = (totalProfitInUsd / (totalBuyInUsd - buyCostInUsd)) * 100 || 0
          return (
            <div
              className={cn(
                'app-font-medium min-w-[98px] h-[60px] flex flex-col justify-center gap-1.5 pt-[4.5px] pb-[4.5px] pl-[4px]',
                getOpacity(props.row.original.status),
              )}
              onClick={() => onCellClick(props?.row?.original?.id || '')}
            >
              <div className={`app-font-medium text-[13px] leading-[1] ${getStyleRiseFall(totalProfitInUsd)}`}>
                {unit === 'USD'
                  ? formatVolume(totalProfitInUsd, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })
                  : formatAmount(totalProfitInUsd / priceTokenSOL, {
                      unit: 'SOL',
                      roundMode: 'floor',
                    })}
              </div>
              {profitPercent != 0 && (
                <div className={`app-font-regular text-[11px] leading-[1] ${getStyleRiseFall(profitPercent)}`}>
                  {formatPercent(profitPercent, {
                    showSign: true,
                  })}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'buySellCount',
        header: (props) => (
          <XSortHead
            {...props}
            tKey={t('listCoin.copyTrade.buySellCount')}
            initialSort={getSortConfig('buySellCount')}
            onSortChange={(val) => handleSortChange('buySellCount', val)}
          />
        ),
        sortingFn: (rowA, rowB) =>
          XCustomSortFunction(
            rowA.original.resultStatistics,
            rowB.original.resultStatistics,
            (row) => get(row, 'totalBuy', 0) + get(row, 'totalSell', 0),
            'number',
          ),
        cell: (props) => (
          <div
            className={cn(
              'app-font-medium h-[60px] flex items-center pt-[4.5px] pb-[4.5px] pl-[4px]',
              getOpacity(props.row.original.status),
            )}
            onClick={() => onCellClick(props?.row?.original?.id || '')}
          >
            <span
              className={cn('text-[calc(13rem/16)] app-font-medium', getOpacity(props.row.original.status))}
              onClick={() => onCellClick(props?.row?.original?.id || '')}
            >
              <span className="text-rise">{get(props, 'row.original.resultStatistics.totalBuy', 0)}</span>
              <span className="text-[#FFFFFFB2]">/</span>
              <span className="text-fall">{get(props, 'row.original.resultStatistics.totalSell', 0)}</span>
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'statistic.lastTradeTime',
        header: (props) => (
          <XSortHead
            {...props}
            className="pl-[4px]"
            tKey={t('listCoin.copyTrade.lastTradeTime')}
            initialSort={getSortConfig('lastTradeTime')}
            onSortChange={(val) => handleSortChange('lastTradeTime', val)}
          />
        ),
        cell: (props) => (
          <div
            className={cn(
              'app-font-medium h-[60px] flex items-center pt-[4.5px] pb-[4.5px] pl-[4px]',
              getOpacity(props.row.original.status),
            )}
            onClick={() => onCellClick(props?.row?.original?.id || '')}
          >
            <span
              className={cn(
                'text-[calc(13rem/16)] text-[#FFFFFFCC] app-font-medium',
                getOpacity(props.row.original.status),
              )}
              onClick={() => onCellClick(props?.row?.original?.id || '')}
            >
              {formatToTimeAgoI18n(props.row.original.statistic.lastTradeTime as Date)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'myWallet',
        header: () => <XNormalHead className="pl-[4px] normal-case" tKey={t('listCoin.copyTrade.myWallet')} />,
        cell: (props) => (
          <div
            className={cn(
              'app-font-medium h-[60px] flex items-center pt-[4.5px] pb-[4.5px] pl-[4px]',
              getOpacity(props.row.original.status),
            )}
            onClick={() => onCellClick(props?.row?.original?.id || '')}
          >
            <span
              className={cn(
                'text-[calc(13rem/16)] text-[#FFFFFFCC] app-font-medium',
                getOpacity(props.row.original.status),
              )}
            >
              {listCoinHelper.formatWalletNameCustom(props.row.original.userAddress)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'actions',
        header: () => (
          <XNormalHead className="pl-[4px] justify-end w-full normal-case" tKey={t('listCoin.copyTrade.actions')} />
        ),
        cell: (props) => (
          <div className="flex justify-end">
            <MemoizedCopyTradeActions row={props.row} onChangeStatus={onChangeStatus} isPC={isPC} />
          </div>
        ),
      },
    ],
    [
      t,
      filterConfig.status,
      setFilterConfig,
      getSortConfig,
      handleSortChange,
      onCellClick,
      onChangeStatus,
      unit,
      setUnit,
      priceTokenSOL,
      isPC,
    ],
  )

  // Expose refetch function to parent component
  useEffect(() => {
    if (onRefetch) {
      onRefetch.current = async () => {
        try {
          setHasMore(true)
          const { data } = await refetch({
            input: {
              page: 1,
              size: PAGE_SIZE,
              chainId: ChainIds.Solana,
            },
          })
          const _items = get(data, 'listCopyTradeConfig.items', [])
          if (_items.length < PAGE_SIZE) setHasMore(false)
          setItems(mapOrderItem(_items))
          saveFirstPageToStorage('smartMoneyList.walletCopyTrade', mapOrderItem(_items))
          setPage(1)
        } catch (err) {
          console.error('refetch error', err)
        }
      }
    }
  }, [onRefetch, refetch])

  useEffect(() => {
    if (isEmpty) {
      isEmptyWalletCopyTrade.set(true)
    } else {
      isEmptyWalletCopyTrade.set(false)
    }
  }, [isEmpty])

  const handleBottomReached = () => {
    if (!loading && hasMore) {
      setPage((p) => p + 1)
    }
  }

  const emptyComponent = useMemo(
    () => (
      <div className="flex flex-col gap-y-2 items-center justify-center w-full text-[#FFFFFF80] min-h-[400px] text-center transform -translate-y-[70%]">
        <img className="size-18" alt="" src="/images/icons/ic-empty.png" />
        {isPC && (
          <Button className="gap-0 mr-4" onClick={() => isOpenDrawerCopyTrade.set(true)} variant="btnOpacity">
            <span className="text-[15px] font-medium text-inherit flex items-center gap-2">
              <Wallet className="mr-[1.25px] size-[18px] opacity-80" />
              {t('listCoin.copyTrade.createCopyTradePC')}
            </span>
          </Button>
        )}
        <p className="text-[#FFFFFF80] text-[0.75rem]">{t('listCoin.copyTrade.list.empty.description')}</p>
      </div>
    ),
    [t, isOpenDrawerCopyTrade, isPC],
  )

  const handleRenderContent = () => {
    if (!activeWallet?.isConnected) {
      return (
        <div className="h-full flex items-start justify-center w-full pt-[188px]">
          <ButtonConnectWallet CTAComponent={<p>{t('listCoin.copyTrade.warning.noAuth')}</p>} />
        </div>
      )
    }

    if (!SMART_MONEY_ALLOWED_CHAINS.includes(activeChain) || isNotSupportNetwork) {
      return (
        <Container className="mt-[10px] h-40 pt-[100px]">
          <div className="flex items-center gap-2 flex-col justify-center text-[14px] text-[#999999] mt-10">
            <span>{t('orderForm.status.NETWORK_UNSUPPORT')}</span>
            <SwitchChains isNotSupportChainBtn />
          </div>
        </Container>
      )
    }

    return (
      <Fragment>
        {activeWallet?.isConnected && !isPC ? (
          <div className="pt-2 pb-2 pl-[1px] pr-[1px] w-full sticky top-[50px] z-10">
            <Button
              variant="gradient"
              className="purple-btn-gradient gap-0 px-2 rounded-full relative transition-all duration-100 hover:scale-[1] w-full h-[40px]"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (enabled) {
                  setOpenRestrictRegiongDialog(true)
                } else {
                  onWalletSetting()
                }
              }}
            >
              <span className="text-[calc(1rem)] font-[400] text-white">{t('listCoin.copyTrade.createCopyTrade')}</span>
            </Button>
          </div>
        ) : null}
        <div
          className={cn(
            'break-keep pl-2 pr-2 flex flex-col w-full items-start',
            isPC ? 'pr-0 mt-[15px]' : 'pb-[55px] h-[calc(100vh-100px)] no-scrollbar',
          )}
        >
          {activeWallet?.isConnected ? (
            <Fragment>
              <DataTableInfiniteScroll
                isLoading={loading && items.length === 0}
                columns={columns}
                data={items}
                fetchMore={handleBottomReached}
                hasMore={hasMore}
                sortConfig={{
                  [sortConfig.key]: sortConfig.value,
                }}
                tableProps={{
                  containerClassName: cn(
                    'border-none mt-0 mx-[0px] pr-2.5',
                    isShowMaintenanceNotification
                      ? isPC
                        ? 'pb-[80px] max-h-[calc(100vh-212px)]'
                        : '[scrollbar-width:none] max-h-[calc(100vh-180px)]'
                      : isPC
                        ? 'pb-[80px] max-h-[calc(100vh-180px)]'
                        : '[scrollbar-width:none] max-h-[calc(100vh-180px)]',
                  ),
                  tableHeadClassName:
                    'text-[12px] leading-[0.75rem] text-[#FFFFFF80] cursor-pointer h-[18px] px-[10px] py-[11px] pl-0',
                  tableHeaderClassName: 'text-[rgba(255,255,255,0.48)',
                  tableHeaderRowClassName:
                    'border-none text-[11px] text-[rgba(255, 255, 255)] sticky top-0 whitespace-nowrap z-5 top-[-1px] border-b border-[#79778C29] border-t bg-[#0a0a0a]',
                  tableBodyRowClassName: 'group whitespace-nowrap h-[48px] border-none',
                  tableCellClassName: 'p-0 group-hover:!bg-[#27272a] cursor-pointer pl-0 pr-1 border-none',
                  skeletonComponent: <SkeletonList className="w-full" classNameItem="h-[48px]" count={10} />,
                  emptyComponent: emptyComponent,
                  isShowCta: true,
                  oddRowClassName: 'bg-[transparent]',
                  evenRowClassName: isPC ? 'bg-[#18181c]' : '',
                }}
              />
            </Fragment>
          ) : (
            <div className="h-full flex items-start justify-center w-full pt-[188px]">
              <ButtonConnectWallet CTAComponent={<p>{t('listCoin.copyTrade.warning.noAuth')}</p>} />
            </div>
          )}
        </div>
      </Fragment>
    )
  }

  return (
    <Fragment>
      {activeWallet?.isConnected && (!SMART_MONEY_ALLOWED_CHAINS.includes(activeChain) || isNotSupportNetwork) ? (
        <div className="pt-2 pb-2 pl-[1px] pr-[1px] w-full sticky top-[50px] z-10">
          <Button
            variant="gradient"
            className="purple-btn-gradient gap-0 px-2 rounded-full relative transition-all duration-100 hover:scale-[1] w-full h-[40px]"
            onClick={onWalletSetting}
          >
            <span className="text-[calc(1rem)] font-[400] text-white">{t('listCoin.copyTrade.createCopyTrade')}</span>
          </Button>
        </div>
      ) : null}
      <div
        className={cn(
          'no-scrollbar break-keep pl-2 pr-2 flex',
          'flex-col items-start max-w-full',
          isShowMaintenanceNotification
            ? isPC
              ? 'pr-0 h-[calc(100vh-262px)]'
              : 'z-10 h-[calc(100vh-50px)] pb-[55px]'
            : isPC
              ? 'pr-0 h-[calc(100vh-230px)]'
              : 'z-10 h-[calc(100vh-50px)] pb-[55px]',
        )}
      >
        {handleRenderContent()}
      </div>

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </Fragment>
  )
}
