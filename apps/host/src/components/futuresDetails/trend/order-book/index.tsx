import DrawerCheckSelect from '@/components/common/DrawerCheckSelect'
import { IconEmpty } from '@/components/icon'
import { useOrderBookData } from '@/hooks/hyperliquid/useOrderBookData'
import { cn } from '@/lib/utils'
import { coinOptionsSelector, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import {
  futuresTradePreferencesActions,
  selectFuturesTradePreferences,
} from '@/redux/modules/futuresTradePreferences.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { formatMoney } from '@/utils/helpers'
import { memo, useMemo, useState } from 'react'
import { DepthItem, OrderRecordProps, ProcessedDepthItem } from './type'
import PriceDisplay from './PriceDisplay'
import PriceInfoPanel from './PriceInfoPanel'
import { useTranslation } from 'react-i18next'

const sumDepth = (
  array: DepthItem[],
  // isReversed: boolean,
  depthUnit: 'base' | 'quote',
  szDecimals: number,
): ProcessedDepthItem[] => {
  const ordered = array

  let cumulative = 0
  const maxQuantity = ordered.reduce((max, item) => {
    cumulative += item.quantity
    return Math.max(max, cumulative)
  }, 0)

  cumulative = 0
  const processed = ordered.map((item) => {
    cumulative += item.quantity
    const fix = depthUnit === 'base' ? szDecimals : 0

    const quoteQuantity = Number((item.price * cumulative).toFixed(fix))
    const percent = maxQuantity > 0 ? Number(((cumulative / maxQuantity) * 100).toFixed(2)) : 0

    return {
      ...item,
      quantity: Number(cumulative.toFixed(fix)),
      quoteQuantity,
      percent,
    }
  })

  return processed
}

const OrderRecord = memo(
  ({ price, quantity, type, className, style, depthUnit ,tokenAccuracyDecimals}: OrderRecordProps) => (
    <div
      className={cn(
        'flex items-center justify-between gap-[10px] app-font-regular text-[calc(1rem*(11/16))] leading-[1] mb-[11.55px] last:mb-0 rounded-sm',
        className,
        type === 'bid' ? 'flex-row-reverse' : '',
      )}
      style={style}
    >
      <div className={cn('text-rise', type === 'ask' && 'text-fall')}>{price.toFixed(tokenAccuracyDecimals)}</div>
      <div className="">{depthUnit === 'base' ? quantity : formatMoney(quantity).replace('$', '')}</div>
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.price === nextProps.price &&
      prevProps.quantity === nextProps.quantity &&
      prevProps.quoteQuantity === nextProps.quoteQuantity &&
      prevProps.type === nextProps.type &&
      prevProps.className === nextProps.className &&
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    )
  },
)

OrderRecord.displayName = 'OrderRecord'

const OrderList = memo(
  ({ orders, type, depthUnit,tokenAccuracyDecimals }: { orders: ProcessedDepthItem[]; type: 'bid' | 'ask'; depthUnit: 'base' | 'quote',tokenAccuracyDecimals:number }) => {
    const priceChangeColor = useAppSelector((state: RootState) => state.preference.priceChangeColor)
    const isInverse = priceChangeColor === 'inverse'
    return (
      <div className="">
        {orders.map((item, index) => (
          <OrderRecord
            key={`${type}-${index}-${item.price}-${item.quantity}`}
            price={item.price}
            quantity={depthUnit === 'base' ? item.quantity : item.quoteQuantity}
            quoteQuantity={item.quoteQuantity}
            type={type}
            style={{ '--after-width': `${item.percent}%`, '--after-radius': '2px' } as React.CSSProperties}
            className={cn(
              'relative mb-0.5 py-1',
              isInverse
                ? (type === 'ask' ? 'orderbook-buy' : 'orderbook-sell')
                : (type === 'ask' ? 'orderbook-sell' : 'orderbook-buy'),
              type === 'bid' ? 'pr-2' : 'pl-2',
            )}
            depthUnit={depthUnit}
            tokenAccuracyDecimals={tokenAccuracyDecimals}
          />
        ))}
      </div>
    )
  },
)

OrderList.displayName = 'OrderList'

const OrderBook = ({ isActive }: { isActive: boolean }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { baseCoin, quoteCoin, szDecimals } = useAppSelector(symbolInfoSelector)
  const { depthUnit } = useAppSelector(selectFuturesTradePreferences)
  const coinOptions = useAppSelector(coinOptionsSelector)

  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const depthTick = Number(tradeConfigs.depthTick) ||  tiers?.[0]?.tick || 0
  const tier = useMemo(() => tiers.find((item: any) => item.tick === depthTick), [tiers, depthTick]);
  const TokenAccuracy = tier?.tick
  // 获取TokenAccuracy的小数位数
  const getDecimalPlaces = (num: number): number => {
    if (!num || num === 0) return 0;
    const str = num.toString();
    if (str.indexOf('.') === -1) return 0;
    return str.split('.')[1].length;
  };

  const tokenAccuracyDecimals = useMemo(() => {
    return TokenAccuracy ? getDecimalPlaces(TokenAccuracy) : 2;
  }, [TokenAccuracy]);

  const tierParams = useMemo(() => {
    const tier = tiers.find((item: any) => item.tick === depthTick)
    return {
      nSigFigs: tier?.nSigFigs,
      mantissa: tier?.mantissa,
    }
  }, [tiers, depthTick])

  const { bids, asks } = useOrderBookData(baseCoin, tierParams.nSigFigs, tierParams.mantissa, tier)

  const handleDepthUnitChange = (value: string) => {
    if (value === showDepthUnit) return
    dispatch(
      futuresTradePreferencesActions.updateTradePreferences({
        depthUnit: baseCoin === value ? 'base' : 'quote',
      }),
    )
  }

  const topAsks = useMemo(() => sumDepth(asks.reverse(), depthUnit, szDecimals), [asks, depthUnit, szDecimals])
  const topBids = useMemo(() => sumDepth(bids, depthUnit, szDecimals), [bids, depthUnit, szDecimals])

  const showDepthUnit = useMemo(() => {
    return depthUnit === 'base' ? baseCoin : quoteCoin
  }, [depthUnit, baseCoin, quoteCoin])

  const tableHeader = useMemo(
    () => (
      <>
        {isActive && (
          <div className="flex px-3 py-2 justify-between">
            <div className="flex-1 text-[#FFFFFF80] app-font-medium text-[calc(1rem*(11/16))]">{t('futuresDetails.common.quantity')} ({showDepthUnit})</div>
            <div className="flex-1 text-[#FFFFFF80] app-font-medium text-[calc(1rem*(11/16))] text-center">
              {t('futuresDetails.common.price')} ({quoteCoin})
            </div>
            <DrawerCheckSelect
              childrenTrigger={
                <div className="flex-1 text-[#FFFFFF80] app-font-medium text-[calc(1rem*(11/16))] text-right cursor-pointer flex justify-end">
                  {t('futuresDetails.common.quantity')} ({showDepthUnit}) <img src="/images/futuresDetail/select-down-icon.svg" className="" alt="icon select down" />
                </div>
              }
              options={coinOptions}
              value={showDepthUnit}
              onChange={(value: string) => handleDepthUnitChange(value)}
            />
          </div>
        )}
      </>
    ),
    [baseCoin, quoteCoin, showDepthUnit,isActive]
  )

  return (
    <div>
      {/* <PriceOverviewPanel /> */}
      {isActive && (
        <>
          <div className="rounded-md">
            <PriceDisplay />
            {tableHeader}

            <div className="flex flex-col overflow-y-auto">
              <div className="grid grid-cols-2 gap-1 px-3">
                <OrderList orders={topBids} type="bid" depthUnit={depthUnit} tokenAccuracyDecimals={tokenAccuracyDecimals} />
                <OrderList orders={topAsks} type="ask" depthUnit={depthUnit} tokenAccuracyDecimals={tokenAccuracyDecimals} />
              </div>
              {/* {bids.length === 0 && asks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-80">
                  <IconEmpty />
                  <span className="text-[#FFFFFF80] text-[0.75rem]">没有数据</span>
                </div>
              )} */}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(OrderBook)
