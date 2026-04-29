import { useState, useMemo, useEffect } from "react";
import { useWebSocketChannel } from "@/hooks/hyperliquid/useWebSocketChannel";
import { WebData2 } from '@/types/hyperliquid'
import isEqual from 'lodash/isEqual';
import { TpslOrderType } from '@/components/futuresDetails/trade/types'
import { fixNumber, MathFun } from "@/lib/utils"
import { _changeTokenAccount } from '@/redux/modules/auth.slice'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'
import { useSelector } from 'react-redux'
import { _walletDex } from '@/redux/modules/newWallet.slice'

const tpslOrderType: TpslOrderType[] = ['Take Profit Limit', 'Stop Limit', 'Take Profit Market', 'Stop Market']

function findTpslOrder (coin: string, openOrders: any[]) {
  const positionTpslOrder = openOrders.filter(item => {
    return item.coin === coin && (item.isPositionTpsl && item.isTrigger)
  })
  const hasTriggerOrder = openOrders.some(item => {
    return item.coin === coin && (item.isTrigger && !positionTpslOrder.length)
  })
  return {
    positionTpslOrder,
    hasTriggerOrder
  }
}

function removeChildOidsFromArray(a: any) {
  const oidsToRemove = new Set();

  for (const order of a) {
    if (Array.isArray(order.children) && order.children.length > 0) {
      for (const child of order.children) {
        if (child.oid !== undefined) {
          oidsToRemove.add(child.oid);
        }
      }
    }
  }

  return a.filter((order: any) => !oidsToRemove.has(order.oid));
}

export function useWebData2() {
  const [webData2, setWebData2] = useState<WebData2>({});
  const walletDex = useSelector(_walletDex)

  const isLogin = useCheckLoginOnArb()

  const channel = 'webData2';

  const params = useMemo(() => {
    return {
      type: 'webData2',
      user: isLogin ? walletDex?.walletAddress : "0x0000000000000000000000000000000000000000",
    }
  }, [walletDex, isLogin]);

  useWebSocketChannel(
    channel,
    params,
    (data) => {
      setWebData2((prev) => {
        return isEqual(prev, data) ? prev : data;
      });
    }
  );


  const openOrders = removeChildOidsFromArray(webData2?.openOrders ?? [])

  const assetPositions = webData2?.clearinghouseState?.assetPositions ?? []

  const symbolListCtxs = webData2?.assetCtxs ?? []
  const meta = webData2?.meta
  const universe = webData2?.meta?.universe

  const totalBalance = webData2?.clearinghouseState?.marginSummary?.accountValue || 0

  const withdrawable = webData2?.clearinghouseState?.withdrawable

  const crossMarginSummary = webData2?.clearinghouseState?.crossMarginSummary

  const available = MathFun.sub(crossMarginSummary?.accountValue || 0, crossMarginSummary?.totalMarginUsed || 0)

  const availableFundRaw = available ? fixNumber(available, 2) : 0
  const availableFund = Number(availableFundRaw) > 0 ? availableFundRaw : 0
  const accountValue = crossMarginSummary?.accountValue > 0 ? fixNumber(crossMarginSummary?.accountValue, 2) : 0
  
  const positions = assetPositions.map((item: any) => {
    const szi = parseFloat(item?.position?.szi as string)
    const side = szi >= 0 ? 'B' : 'A'
    const coin = item?.position.coin
    const coinIndex = universe.findIndex((u: any) => u.name === coin)
    const ctx = symbolListCtxs[coinIndex]
    const { positionTpslOrder: TpslOrder, hasTriggerOrder } = findTpslOrder(coin, openOrders)

    const tpOrder = TpslOrder.find(c => c.orderType.includes('Take Profit'))
    const slOrder = TpslOrder.find(c => c.orderType.includes('Stop'))

    return {
      ...item.position,
      szi: Math.abs(szi),
      side,
      tpPrice: tpOrder?.triggerPx,
      tpOrderId: tpOrder?.oid,
      slPrice: slOrder?.triggerPx,
      slOrderId: slOrder?.oid,
      markPrice: ctx?.markPx,
      midPrice: ctx?.midPx,
      hasTriggerOrder: !!hasTriggerOrder
    }
  })

  const crossMaintenanceMarginUsed = webData2?.clearinghouseState?.crossMaintenanceMarginUsed || 0

  return { 
    webData2,
    openOrders,
    positions,
    availableFund,
    accountValue,
    symbolListCtxs,
    withdrawable,
    crossMaintenanceMarginUsed,
    meta,
    totalBalance,
  }
}
