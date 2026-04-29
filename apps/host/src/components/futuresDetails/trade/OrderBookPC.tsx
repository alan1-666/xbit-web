import { useOrderBookData } from '@/hooks/hyperliquid/useOrderBookData'
import { useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { cn } from '@/lib/utils'
import { setSymbolInfo, symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import {
  selectFuturesTradePreferences,
} from '@/redux/modules/futuresTradePreferences.slice'
import { setOrderInfo } from '@/redux/modules/orderContract.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { formatNumberWithCommas, formatPriceBySymbol } from '@/utils/helpers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { OrderContractState } from './type.order'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@components/discover/Tooltip.tsx'
interface DepthItem {
  price: number
  quantity: number
}

interface ProcessedDepthItem extends DepthItem {
  percent: number
  quoteQuantity: number
  cumulativeQuantity: number
}
interface OrderBookProps {
  containerHeight: number
  className?: string
}

const OrderBook = ({ containerHeight, className }: OrderBookProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const containerRef = useRef<HTMLDivElement>(null)
  const [recordCount, setRecordCount] = useState(5)
  const { baseCoin, quoteCoin, price, markPrice, szDecimals, lastTradePrice } = useAppSelector(symbolInfoSelector)
  const { depthUnit, depthLayout } = useAppSelector(selectFuturesTradePreferences)
  const priceChangeColor = useAppSelector((state: RootState) => state.preference.priceChangeColor)
  const isInverse = priceChangeColor === 'inverse'
  const { orderInfo } = useAppSelector<RootState, OrderContractState>((state) => state.orderContract)
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const depthTick = Number(tradeConfigs.depthTick)


  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []

  const tier = useMemo(() => tiers.find((item: any) => item.tick === depthTick), [tiers, depthTick]);

  const TokenAccuracy = tier?.tick

  const nSigFigs = tier?.nSigFigs;
  const mantissa = tier?.mantissa;

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

  // 缓存上一次价格
  const lastPriceRef = useRef<string | null>(null);
  const prevTradePriceRef = useRef<number | null>(null)

  // 使用 useOrderTradeData 获取最新交易数据
  const trades = useOrderTradeData(baseCoin);


  const priceChangeClass = useMemo(() => {
    const current = Number(lastTradePrice)
    const previous = prevTradePriceRef.current

    if (previous == null || current === previous) return 'text-desktop-rise'
    return current > previous ? 'text-desktop-rise' : 'text-desktop-fa ll'
  }, [lastTradePrice])

  // 当交易数据更新时，更新最新成交价
  useEffect(() => {
    if (trades.length > 0) {
      const latestTrade = trades[0];
      const newPrice = String(latestTrade.price);

      if (newPrice !== lastPriceRef.current) {
        lastPriceRef.current = newPrice

        dispatch(setSymbolInfo({ lastTradePrice: newPrice }))

        prevTradePriceRef.current = Number(lastTradePrice)
      }
    }
  }, [trades, dispatch]);

  const { bids, asks } = useOrderBookData(baseCoin, nSigFigs, mantissa, tier)


  const showDepthUnit = useMemo(() => {
    return depthUnit === 'base' ? baseCoin : quoteCoin
  }, [depthUnit, baseCoin, quoteCoin])

  const sumDepth = (array: DepthItem[], isReversed: boolean): ProcessedDepthItem[] => {
    const ordered = isReversed ? [...array].reverse() : array

    let cumulative = 0
    const maxQuantity = ordered.reduce((max, item) => {
      cumulative += item.quantity
      return Math.max(max, cumulative)
    }, 0)

    cumulative = 0
    const processed = ordered.map((item) => {
      cumulative += item.quantity

      /* const quantity = Number(cumulative.toFixed(fix))
      const quoteQuantity = Number((item.price * cumulative).toFixed(fix)) */


      const percent = maxQuantity > 0
        ? Number(((cumulative / maxQuantity) * 100).toFixed(2))
        : 0

      return {
        ...item,
        quantity: Number(item.quantity),
        quoteQuantity: Number((item.price * item.quantity)),
        cumulativeQuantity: cumulative,
        percent,
      }
    })

    return isReversed ? processed.reverse() : processed
  }

  useEffect(() => {
    if (!containerRef.current) return

    const calculateRecordCount = () => {
      // 基础高度计算
      const topHeight = 15
      const middleHeight = 44
      const rowHeight = 20

      const bottomHeight = 28


      // 获取可用高度（优先使用容器实际高度）
      const containerH = containerRef.current?.clientHeight ?? containerHeight
      let availableHeight = containerH - topHeight - middleHeight - bottomHeight
      /* if (depthLayout !== 'showAll') {
        availableHeight = availableHeight - 20
      } */

      // 根据布局模式计算记录数
      const minRows = 1

      if (availableHeight <= 0) {
        return minRows
      }

      const rows =
        depthLayout === 'showAll'
          ? Math.floor(availableHeight / 2 / rowHeight)
          : Math.floor(availableHeight / rowHeight)

      return Math.max(minRows, rows)
    }

    const updateRecordCount = () => {
      if (!containerRef.current) return
      const count = calculateRecordCount()
      setRecordCount(count)
    }

    updateRecordCount()

    const resizeObserver = new window.ResizeObserver(() => {
      updateRecordCount()
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [depthLayout, containerHeight])

  const handlePriceClick = (price: number) => {
    dispatch(setOrderInfo({ ...orderInfo, price: price }))
  }

  const topAsks = useMemo(
    () => sumDepth(asks.reverse().slice(-(depthLayout !== 'showAll' ? recordCount : recordCount)), true),
    [asks, recordCount, depthLayout, tokenAccuracyDecimals],
  )

  const topBids = useMemo(
    () => sumDepth(bids.slice(0, depthLayout !== 'showAll' ? recordCount : recordCount), false),
    [bids, recordCount, depthLayout, tokenAccuracyDecimals],
  )
  const renderOrderRecords = (items: ProcessedDepthItem[], isDown = false, fix: number) => (
    <div className={cn('flex-1 flex flex-col justify-between')}>
      {items.map((item, index) => (
        <OrderRecord
          key={index}
          className={cn(
            "relative py-1",
            isInverse ? (isDown ? "orderbook-buy" : "orderbook-sell") : (isDown ? "orderbook-sell" : "orderbook-buy"),
          )}
          style={{ '--after-width': `${item.percent}%` } as React.CSSProperties}
          price={item.price}
          quantity={depthUnit === 'base' ? item.quantity.toFixed(fix) : item.quoteQuantity.toFixed(fix)}
          cumulativeQuantity={depthUnit === 'base' ? item.cumulativeQuantity.toFixed(fix) : (item.price * item.cumulativeQuantity).toFixed(fix)}
          isDown={isDown}
          onClick={() => handlePriceClick(item.price)}
          tokenAccuracyDecimals={tokenAccuracyDecimals}
        />
      ))}
    </div>
  )

  const fix = depthUnit === 'base' ? szDecimals : 0

  // const handleDepthUnitChange = (value: string) => {
  //   if (value === showDepthUnit) return
  //   dispatch(
  //     futuresTradePreferencesActions.updateTradePreferences({
  //       depthUnit: baseCoin === value ? 'base' : 'quote',
  //     }),
  //   )
  // }

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 flex flex-col overflow-hidden", className)}
    >
      <div className="flex items-center justify-between text-[#FFFFFFB2] mb-[4px] h-[calc(1rem*(12/16))]">
        <div className="flex-1 text-[calc(1rem*(10/16))] leading-1">
          {t('futuresDetails.common.price')}
          <span className="text-[calc(1rem*(9/16))] leading-1"></span>
        </div>

        <div className="flex-1 text-[calc(1rem*(10/16))] leading-1 flex justify-end">
          {t('futuresDetails.common.quantity')}
          <span className="text-[calc(1rem*(9/16))] leading-1 max-w-[50px]">
            ({showDepthUnit.length > 5 ? `${showDepthUnit.substring(0, 5)}...` : showDepthUnit})
          </span>
        </div>

        <div className="flex-1 text-[calc(1rem*(10/16))] leading-1 flex justify-end">
          {t('futuresDetails.common.total')}
          <span className="text-[calc(1rem*(9/16))] leading-1 max-w-[50px]">
            ({showDepthUnit.length > 5 ? `${showDepthUnit.substring(0, 5)}...` : showDepthUnit})
          </span>
        </div>
      </div>

      {(depthLayout === 'showAsks' || depthLayout === 'showAll') && renderOrderRecords(topAsks, true, fix)}

      <div className="flex items-center justify-center gap-2  my-1">
        <div
          className={cn('flex-1 flex items-center justify-end text-sm font-bold', priceChangeClass)}
          onClick={() => handlePriceClick(Number(lastTradePrice))}
        >
          {lastTradePrice && lastTradePrice !== '0'
            ? formatNumberWithCommas(lastTradePrice)
            : formatNumberWithCommas(price)}
        </div>

        <div className="flex-1">
          <Tooltip
            content={
              t('orderBook.desc.theMarkPrice')
            }
          >
            <div className="flex items-center text-xs cursor-help border-dashed border-b border-white">
              <img className="mr-1" src="/images/futuresDetail/maker-icon.svg" alt="icon maker" />
              {Number(markPrice) !== 0
                ? formatPriceBySymbol(markPrice, baseCoin)
                : formatPriceBySymbol(price, baseCoin)}
            </div>
          </Tooltip>
        </div>
      </div>

      {(depthLayout === 'showBids' || depthLayout === 'showAll') && renderOrderRecords(topBids, false, fix)}
    </div>
  )
}

type OrderRecordProps = {
  price: number
  quantity: number | string
  cumulativeQuantity: number | string
  isDown?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  tokenAccuracyDecimals?: number
}

const OrderRecord = ({ price, quantity, cumulativeQuantity, isDown, className, style, onClick, tokenAccuracyDecimals = 2 }: OrderRecordProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between app-font-medium text-xs leading-[0.9] mb-[1px] cursor-pointer hover:bg-[#79778C16]',
        className,
      )}
      style={style}
      onClick={onClick}
    >
      <div className={cn('text-desktop-rise flex-1', isDown && 'text-desktop-fall')}>{formatNumberWithCommas(price.toFixed(tokenAccuracyDecimals))} </div>
      <div className="text-[#FFFFFF] flex-1 text-right">{formatNumberWithCommas(`${quantity}`)}</div>
      <div className="text-[#FFFFFF] flex-1 text-right">{formatNumberWithCommas(`${cumulativeQuantity}`)}</div>
    </div>
  )
}

export default OrderBook
