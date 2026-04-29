import { FilterSelectOption } from '@/components/common/FilterSelect'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import { useCancelOrdersMutation } from '@/components/futuresDetails/hooks/useCancelOrdersMutation'
import { getAdjustedTriggerPrice, isHyperOrderSuccess } from '@/components/futuresDetails/trade/tools'
import { xOpenOrders, xPositions } from '@/components/futuresDetails/trade/types'
import { useUserFillsData } from '@/hooks/hyperliquid/useUserFillsData'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { ServiceConfig } from '@/lib/gql/service-config'
import { selectAllPerpMeta, selectSzMap, setSymbolListCtxs } from '@/redux/modules/futuresMeta.slice'
import { agentWalletSelector, builderSelector } from '@/redux/modules/futuresUserInfo.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { IBalance } from './TableColumns/DesktopBalanceColumns'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

export enum KEY_ENUM {
  BALANCE = 'Balance',
  POSITION = 'position',
  ORDER = 'order',
  HISTORY = 'history',
  FUNDING = 'funding',
  ENTRUSTED= 'entrusted'
}

const useTradingDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const { mutate: cancelOrders, isPending } = useCancelOrdersMutation()
  const [balanceData, setBalanceData] = useState<IBalance[]>([])

  const {
    openOrders,
    positions,
    symbolListCtxs,
    availableFund,
    accountValue,
    webData2: { clearinghouseState },
  } = useWebData2()
  const [loadingSocket, setLoadingSocket] = useState(true)

  useEffect(() => {
    if (ServiceConfig.token) {
      setLoadingSocket(!clearinghouseState)
    } else {
      setLoadingSocket(false)
    }
  }, [clearinghouseState, ServiceConfig.token])

  const { fills } = useUserFillsData()
  const query = useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location.search])

  const rawTab = query.get('tab')

  const currentOpenOrders = useMemo(() => {
    return openOrders.map((item: xOpenOrders) => {
      const origSz = parseFloat(item.origSz || '0')
      const sz = parseFloat(item.sz || '0')

      if (origSz === 0) {
        const filterFills = fills.filter((citem: any) => citem.oid === item.oid)
        const totalFilled = filterFills.reduce((acc, citem) => {
          return acc + parseFloat(citem.sz || '0')
        }, 0)

        const positionItem = positions.find((citem: xPositions) => citem.coin === item.coin)
        const newOrigSz = positionItem?.szi ?? item.origSz

        return {
          ...item,
          origSz_1: newOrigSz,
          completedSz: totalFilled,
        }
      } else {
        return {
          ...item,
          origSz_1: origSz,
          completedSz: origSz - sz,
        }
      }
    })
  }, [fills, openOrders, positions])

  const currentListTabs: UITab[] = useMemo(() => {
    return [
      {
        value: KEY_ENUM.BALANCE,
        label: t('walletCopy.settings.balance'),
      },
      {
        value: KEY_ENUM.POSITION,
        label: t('futuresDetails.tabs.myPosition') + `(${positions.length})`,
      },
      {
        value: KEY_ENUM.ORDER,
        label: t('futuresDetails.tabs.currentOrder') + `(${currentOpenOrders.length})`,
      },
      {
        value: KEY_ENUM.HISTORY,
        label: t('futuresDetails.tabs.tradeHistory'),
      },
      {
        value: KEY_ENUM.FUNDING,
        label: t('futuresDetails.tabs.FundingHistory'),
      },
      {
        value: KEY_ENUM.ENTRUSTED,
        label: t('futuresDetails.tabs.orderHistory'),
      },
    ]
  }, [currentOpenOrders.length, positions.length,t])

  const directionsOptions: FilterSelectOption[] = useMemo(
    () => [
      {
        label: t('futuresDetails.tabs.allDirection'),
        value: 'All',
      },
      {
        label: t('futuresDetails.common.long'),
        value: 'Open Long',
      },
      {
        label: t('futuresDetails.common.short'),
        value: 'Open Short',
      },
      {
        label: t('futuresDetails.common.closeLong'),
        value: 'Close Long',
      },
      {
        label: t('futuresDetails.common.closeShort'),
        value: 'Close Short',
      },
    ],
    [],
  )

  const validTabValues = useMemo(() => {
    return currentListTabs.map((tab) => tab.value)
  }, [currentListTabs])

  const initialTab = validTabValues.includes(rawTab || '') ? rawTab! : currentListTabs[1]?.value || 'position'

  const [currentTab, setCurrentTab] = useState<string>(initialTab)

  const handleChangeTab = useCallback(
    (tab: string) => {
      setCurrentTab(tab)
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('tab', tab)
      navigate({ search: searchParams.toString() }, { replace: true })
    },
    [location.search, navigate],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const dispatch = useAppDispatch()
  const agentWallet = useAppSelector(agentWalletSelector)

  const allMeta = useAppSelector(selectAllPerpMeta)
  const szMap = useAppSelector(selectSzMap)

  const builder = useAppSelector(builderSelector)

  //cancel all position
  const handleClickCloseAll = async () => {
    if (!positions.length || !agentWallet) return
    logEvent2(ACTIONS.contract_close_all)

    const orders = positions.map((position: xPositions) => {
      const newSize = Math.abs(parseFloat(position.szi))

      const newPrice = getAdjustedTriggerPrice(position.side, position.midPrice, true, szMap[position.coin])

      return {
        a: allMeta.findIndex((item) => position.coin === item.name),
        b: position.side === 'B' ? false : true,
        p: newPrice,
        s: newSize.toString(),
        r: true,
        t: { limit: { tif: 'FrontendMarket' } },
      }
    })

    const orderAction = {
      type: 'order',
      orders: orders,
      grouping: 'na',
      builder,
    }

    const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)
    const response = await hanleHyperliquidAction({
      agentPrivateKey: realAgentWallet.privateKey,
      action: orderAction,
      dispatch: null,
      showError: false,
      walletAddress: agentWallet.id,
      allMeta,
    })
    if (response === 'fail') return

    const result = isHyperOrderSuccess(response)
    if (!result.ok) {
      handleHyperliquidOrderError(result.error as string, dispatch)
      return
    }
    toast.success(t('futuresDetails.tips.closeAllSuccess'))
  }

  // close all current order
  const handleCancelOrders = async (orders: xOpenOrders[]) => {
    if (!orders.length || !agentWallet) return
    cancelOrders(
      { orders: orders, allMeta, agentWallet },
      {
        onSuccess: async (response: any) => {
          if (response === 'fail') return
          const result = isHyperOrderSuccess(response)
          if (!result.ok) {
            handleHyperliquidOrderError(result.error as string, dispatch)
            return
          }
          toast.success(t('futuresDetails.tips.cancelAllOrdersSuccess'))
        },
        onError: (err) => {
          toast.error(t('futuresDetails.tips.cancelAllOrdersFailed'))
        },
      },
    )
  }

  // cancel current order
  const cancelOrder = async (orderInfo: xOpenOrders) => {
    if (!agentWallet) {
      console.warn('Agent wallet not available')
      return
    }

    const orderAction = {
      type: 'cancel',
      cancels: [
        {
          a: allMeta.findIndex((item: any) => orderInfo.coin === item.name),
          o: orderInfo.oid,
        },
      ],
    }

    const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

    const response = await hanleHyperliquidAction({
      agentPrivateKey: realAgentWallet.privateKey,
      action: orderAction,
      dispatch: null,
      showError: false,
      walletAddress: agentWallet.id,
      allMeta,
    })

    if (response === 'fail') return
    const result = isHyperOrderSuccess(response)

    if (!result.ok) {
      handleHyperliquidOrderError(result.error as string, dispatch)
      return
    }
    toast.success(t('futuresDetails.tips.cancelOrderSuccess'))
  }

  useEffect(() => {
    if (clearinghouseState?.time) {
      setBalanceData([
        {
          accountValue: Number(accountValue),
          availableFund: Number(availableFund),
          coin: 'USDC',
          USDprice: Number(accountValue),
          id: `${new Date().getTime()}`,
        },
      ])
    }
  }, [accountValue, availableFund, clearinghouseState?.time])

  useEffect(() => {
    dispatch(setSymbolListCtxs(symbolListCtxs))
  }, [symbolListCtxs, dispatch])

  return {
    isPendingCancelAllOrder: isPending,
    positions,
    currentTab,
    initialTab,
    balanceData,
    loadingSocket,
    currentListTabs,
    currentOpenOrders,
    directionsOptions,
    cancelOrder,
    handleMouseDown,
    handleChangeTab,
    handleCancelOrders,
    handleClickCloseAll,
  }
}

export default useTradingDashboard
