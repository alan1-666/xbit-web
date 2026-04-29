import { OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import Container from '@components/common/Container.tsx'
import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import MyPositionCard, { MyPositionCardRef } from './MyPositionCard'
import MyPositionFilter from './MyPositionFilter'
import { xPositions, xOpenOrders, OrderSide, All } from '../types'
import { IconEmpty } from '@/components/icon'
import { useAppSelector } from '@/redux/store'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { toast } from 'sonner'
import { isHyperOrderSuccess, getAdjustedTriggerPrice } from '../tools'
import { selectSzMap } from '@/redux/modules/futuresMeta.slice'
import { builderSelector, agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { useAppDispatch } from '@/redux/store'
import { futuresUserInfoActions } from '@/redux/modules/futuresUserInfo.slice'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import useCustomToast from '@/hooks/useCustomToast'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { useTranslation } from 'react-i18next'
import { hanleHyperliquidAction } from '@/components/futuresDetails/helper/hanleHyperliquidAction'
import ls from '@/lib/local-storage.ts'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

export type OrdersListFilterOrderType = 'All' | OrderType

export type OrdersListFilter = {
  showOnlyBaseCoin: boolean
  side?: OrderSide | All
  isAllExpand: boolean
}

interface MyPositionListProps {
  positions: xPositions[]
  baseCoin: string
  setCurrentTab?: (tab: string) => void
}
const STORAGE_KEY = 'futures_my_position_expand_state'
const MyPositionList = ({ positions, baseCoin, setCurrentTab }: MyPositionListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { showToast } = useCustomToast()
  const agentWallet = useAppSelector(agentWalletSelector)

  const allMeta = useAppSelector(selectAllPerpMeta)
  const szMap = useAppSelector(selectSzMap)

  const builder = useAppSelector(builderSelector)

  const cardRefs = useRef<Record<string, MyPositionCardRef | null>>({})
  const getInitialExpandState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        return JSON.parse(stored)
      }
      // 第一次使用，清理可能存在的个别卡片状态，确保状态一致
      // localStorage.removeItem('futures_current_order_cards_expand_state')
      return true // 默认展开
    } catch (error) {
      // 如果读取出错，清理所有相关缓存并重置为默认状态
      localStorage.removeItem(STORAGE_KEY)
      // localStorage.removeItem('futures_current_order_cards_expand_state')、
      return true
    }
  }
  const [filter, setFilter] = useState<OrdersListFilter>({
    showOnlyBaseCoin: !!ls.get('futures_position_is_show_base_coin'),
    side: 'All',
    isAllExpand: getInitialExpandState(),
  })

  const filterPostions = useMemo(() => {
    let filtered = positions

    if (!(filter.side === 'All' && !filter.showOnlyBaseCoin)) {
      filtered = positions.filter((item) => {
        return (
          (item.side === filter.side || filter.side === 'All') && (!filter.showOnlyBaseCoin || baseCoin === item.coin)
        )
      })
    }

    return filtered.sort((a, b) => {
      if (a.coin === baseCoin && b.coin !== baseCoin) return -1
      if (a.coin !== baseCoin && b.coin === baseCoin) return 1
      return 0
    })
  }, [filter, positions, baseCoin])

  const handleClickCloseAll = async () => {
    if (!positions.length || !agentWallet) return
    logEvent2(ACTIONS.contract_close_all)

    const orders = positions.map((position) => {
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
  // 保存展开状态到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filter.isAllExpand))
      // // 当用户使用全局展开/收起时，清理个别卡片的状态，让全局状态优先
      // localStorage.removeItem('futures_current_order_cards_expand_state')
    } catch (error) {
      console.warn('Failed to save expand state to localStorage:', error)
    }
  }, [filter.isAllExpand])

  useEffect(() => {
    Object.values(cardRefs.current).forEach((ref) => {
      if (!ref) return
      filter.isAllExpand ? ref.expand() : ref.collapse()
    })
  }, [filter.isAllExpand])

  useEffect(() => {
    ls.set('futures_position_is_show_base_coin', filter.showOnlyBaseCoin)
  }, [filter.showOnlyBaseCoin])

  return (
    <Container className="mt-[10px]">
      <MyPositionFilter
        filter={filter}
        setFilter={setFilter}
        onClickCloseAll={handleClickCloseAll}
        filterPostions={filterPostions}
      />
      <div className="flex flex-col gap-1.5 pb-[200px]">
        {
          filterPostions.map((item, index) => (
            <MyPositionCard
              ref={(el) => {
                cardRefs.current[item.coin] = el
              }}
              globalIsAllExpand={filter.isAllExpand}
              positionInfo={item}
              key={item.coin}
              setCurrentTab={setCurrentTab}
            />
          ))
        }
        {filterPostions?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-80">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
          </div>
        )}
      </div>
    </Container>
  )
}

export default MyPositionList
