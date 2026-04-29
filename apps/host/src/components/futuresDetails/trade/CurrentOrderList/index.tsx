import Container from '@components/common/Container.tsx'
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import CurrentOrderCard, { CurrentOrderCardRef } from './CurrentOrderCard'
import CurrentOrderFilter from './CurrentOrderFilter'
import isEqual from 'lodash/isEqual';
import { xOpenOrders, OrderType, OrderSide, All } from '../types'
import { IconEmpty } from '@/components/icon'
import { toast } from 'sonner'
import { useCancelOrdersMutation } from '@/components/futuresDetails/hooks/useCancelOrdersMutation'
import { selectAllPerpMeta } from '@/redux/modules/futuresMeta.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { handleHyperliquidOrderError } from '@/components/futuresDetails/helper/handleHyperliquidOrderError'
import { isHyperOrderSuccess } from '../tools'
import { useTranslation } from 'react-i18next'
import ls from '@/lib/local-storage.ts'






export type OrdersListFilterOrderType = 'All' | OrderType

export type OrdersListFilter = {
  showOnlyBaseCoin: boolean
  type?: OrderType | All
  side?: OrderSide | All
  isAllExpand: boolean
}


interface CurrentOrdersListProps {
  orders: xOpenOrders[]
  baseCoin: string
}

const STORAGE_KEY = 'futures_current_orders_expand_state'

const CurrentOrdersList = ({orders, baseCoin,}: CurrentOrdersListProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  
  // 从 localStorage 读取初始状态
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
    showOnlyBaseCoin: !!ls.get('futures_current_order_is_show_base_coin'),
    type: 'All',
    side: 'All',
    isAllExpand: getInitialExpandState()
  })


  const allMeta = useAppSelector(selectAllPerpMeta)

  const agentWallet = useAppSelector(agentWalletSelector)

  const { mutate: cancelOrders, isPending } = useCancelOrdersMutation()

  const cardRefs = useRef<Record<string, CurrentOrderCardRef | null>>({})


  const filterOrders = useMemo(() => {
    if (filter.type === 'All' && filter.side === 'All' && !filter.showOnlyBaseCoin) {
      return orders
    }

 
    
    return orders.filter(item => {
      return (item.orderType === filter.type || (filter.type === 'All') )
       && (item.side === filter.side || (filter.side === 'All') )
       && (!filter.showOnlyBaseCoin || (baseCoin === item.coin))
    })
  }, [filter, orders, baseCoin])

  const handleCancelOrders = async () => {
    if (!orders.length || !agentWallet) return;
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
        }
    )
   
  } 

  // 保存展开状态到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filter.isAllExpand))
      // 当用户使用全局展开/收起时，清理个别卡片的状态，让全局状态优先
      localStorage.removeItem('futures_current_order_cards_expand_state')
    } catch (error) {
      console.warn('Failed to save expand state to localStorage:', error)
    }
  }, [filter.isAllExpand])

  useEffect(() => {
    Object.values(cardRefs.current).forEach(ref => {
      if (!ref) return
      filter.isAllExpand ? ref.expand() : ref.collapse()
    })
  }, [filter.isAllExpand])

  
   useEffect(() => {
    ls.set('futures_current_order_is_show_base_coin', filter.showOnlyBaseCoin)
  }, [filter.showOnlyBaseCoin])


  return (
    <Container className="mt-[10px]">
      <CurrentOrderFilter 
        filter={filter} 
        setFilter={setFilter} 
        onClickCancelAll={()=> handleCancelOrders()} 
        filterOrders={filterOrders}
      />
      <div className="flex flex-col gap-2.5 pb-[200px]">
        {
          filterOrders.map(item => (
            <CurrentOrderCard 
              key={item.oid}
              orderInfo={item}
              globalIsAllExpand={filter.isAllExpand}
              ref={(el) => {
                cardRefs.current[item.oid] = el
              }}
            />
          ))
        }
        {filterOrders?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-80">
            <IconEmpty/>
            <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
          </div>
        )}
      </div>
    </Container>
  )
}

export default React.memo(
  CurrentOrdersList,
  (prevProps, nextProps) =>
    prevProps.baseCoin === nextProps.baseCoin &&
    isEqual(prevProps.orders, nextProps.orders)
);
