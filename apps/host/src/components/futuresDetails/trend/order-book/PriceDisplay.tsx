import { symbolInfoSelector, setSymbolInfo } from '@/redux/modules/futuresCurrentSymbol.slice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { Dispatch, memo, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import DrawerCheckSelect from '@components/common/DrawerCheckSelect.tsx'
import { futuresTradeConfigActions, futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { useOrderBookData } from '@/hooks/hyperliquid/useOrderBookData'
import { useActiveAssetCtx } from '@/hooks/hyperliquid/useActiveAssetCtx'
import { useOrderTradeData } from '@/hooks/hyperliquid/useOrderTradeData'
import { formatNumberWithCommas,formatPriceBySymbol } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import PriceInfoPanel from './PriceInfoPanel'
const PriceDisplay = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { baseCoin, markPrice, lastTradePrice } = useAppSelector(symbolInfoSelector)
  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))
  const [open, setOpen] = useState(false)
  const [typeDrawer, setTypeDrawer] = useState<'LatestPrice' | 'IndexPrice' | 'MarkPrice'>('LatestPrice')
  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const tick = Number(tradeConfigs.depthTick) || tiers?.[0]?.tick || 0

  const { price } = useActiveAssetCtx(baseCoin)
  // 缓存上一次价格
  const lastPriceRef = useRef<string | null>(null)
  // 防抖timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 使用 useOrderTradeData 获取最新交易数据
  const trades = useOrderTradeData(baseCoin)

  // 使用本地状态存储最新交易价格，避免频繁更新Redux
  const [localLastTradePrice, setLocalLastTradePrice] = useState<string>(lastTradePrice || '--')

  // 同步Redux中的价格到本地状态（仅在baseCoin变化时）
  useEffect(() => {
    if (lastTradePrice) {
      setLocalLastTradePrice(lastTradePrice)
      lastPriceRef.current = lastTradePrice
    }
  }, [baseCoin]) // 只在symbol变化时同步

  // 当交易数据更新时，更新本地价格状态
  useEffect(() => {
    if (trades.length > 0) {
      const latestTrade = trades[0]
      const newPrice = String(latestTrade.price)

      // 只有价格发生变化时才更新
      if (newPrice !== lastPriceRef.current) {
        lastPriceRef.current = newPrice
        setLocalLastTradePrice(newPrice)
        
        // 清除之前的防抖timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        
        // 使用防抖来减少Redux更新频率
        debounceTimerRef.current = setTimeout(() => {
          dispatch(setSymbolInfo({ lastTradePrice: newPrice }))
        }, 500)
      }
    }
  }, [trades, dispatch])

  // 组件卸载时清理防抖timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const orderbook_tier = useMemo(() => tiers.find((item: any) => item.tick === tick), [tiers, tick]);


  // 获取订单数据
  const tierParams = useMemo(() => {
    const tier = tiers.find((t) => Number(t.tick) === tick)
    return tier ? { nSigFigs: tier.nSigFigs, mantissa: tier.mantissa } : { nSigFigs: null, mantissa: null }
  }, [tiers, tick])

  const { bids, asks } = useOrderBookData(baseCoin, tierParams.nSigFigs, tierParams.mantissa, orderbook_tier)
  // 计算买入卖出占比
  const { buyPercentage, sellPercentage } = useMemo(() => {
    if (!bids.length && !asks.length) {
      return { buyPercentage: 50, sellPercentage: 50 }
    }
    // 计算总量（取前20档数据）
    const topBids = bids.slice(0, 20)
    const topAsks = asks.slice(0, 20)
    const totalBidVolume = topBids.reduce((sum, bid) => sum + bid.quantity, 0)
    const totalAskVolume = topAsks.reduce((sum, ask) => sum + ask.quantity, 0)
    const totalVolume = totalBidVolume + totalAskVolume

    if (totalVolume === 0) {
      return { buyPercentage: 50, sellPercentage: 50 }
    }

    const buyPct = Math.round((totalBidVolume / totalVolume) * 100)
    const sellPct = 100 - buyPct

    return { buyPercentage: buyPct, sellPercentage: sellPct }
  }, [bids, asks])

  const depthOptions = useMemo(() => {
    if (!tiers?.length) return []
    return tiers?.map((item) => {
      return {
        label: item.tick,
        value: item.tick,
      }
    })
  }, [tiers])
  const StatisticItem =({label,value,onClick}:{label:string,value:string,onClick:()=>void})=>{
    return (
      <div className="text-center"  onClick={onClick}>
      <div className="text-[#FFFFFF50] text-[calc(11rem/16)] cursor-pointer underline">
        {label}
      </div>
      <div className="text-white text-[calc(11rem/16)]">{formatNumberWithCommas(value)}</div>
    </div>
    )
  } 
    
  const handleTickChange = (tick: string) => {
    dispatch(
      futuresTradeConfigActions.updateFuturesTradeConfig({
        symbol: baseCoin,
        config: {
          depthTick: Number(tick),
        },
      }),
    )
  }
  const handleItemClick = (type: 'LatestPrice' | 'IndexPrice' | 'MarkPrice') => {
    setOpen(true)
    setTypeDrawer(type)
  }

  return (
    <div className=" text-white pl-3 pr-3 rounded-lg">
      <div className="flex justify-between mb-[10px]">
        <div className="text-center"  onClick={() => handleItemClick('LatestPrice')}>
          <div className="text-[#FFFFFF50] text-[calc(11rem/16)] cursor-pointer underline">
            {t('futuresDetails.common.newPrice')}
          </div>
          <div className="text-white text-[calc(11rem/16)]">{formatNumberWithCommas(localLastTradePrice)}</div>
        </div>
        <div className="text-center"  onClick={() => handleItemClick('IndexPrice')}>
          <div className="text-[#FFFFFF50] text-[calc(11rem/16)] cursor-pointer underline">
            {t('futuresDetails.common.indexPrice')}
          </div>
          <div className="text-white text-[calc(11rem/16)]">{formatPriceBySymbol(String(price), baseCoin) ?? '--'}</div>
        </div>
        <div className="text-center"  onClick={() => handleItemClick('MarkPrice')}>
          <div className="text-[#FFFFFF50] text-[calc(11rem/16)] cursor-pointer underline">
            {t('futuresDetails.common.markPrice')}
          </div>
          <div className="text-white text-[calc(11rem/16)]">{formatPriceBySymbol(markPrice, baseCoin) ?? '--'}</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          {/* 左侧买入文案 */}
          <span className="text-rise text-[calc(11rem/16)] min-w-[40px]">B {buyPercentage}%</span>

          {/* 中间进度条 */}
          <div className="relative h-[12px] rounded-2xl overflow-hidden flex-1 bg-[#1A1A1A]">
          <div
            className="absolute left-0 top-0 h-full bg-rise/20"
            style={{ width: `${buyPercentage}%` }}
          >
            <div
              className="absolute right-[-1px] top-0 h-full w-[2px] bg-[#1A1A1A]"
              style={{ transform: "skewX(-16deg)", transformOrigin: "left" }}
            />
          </div>
          <div
            className="absolute right-0 top-0 h-full bg-fall/20"
            style={{ width: `${sellPercentage}%` }}
          >
            <div
              className="absolute left-[-1px] top-0 h-full w-[2px] bg-[#1A1A1A]"
              style={{ transform: "skewX(-16deg)", transformOrigin: "right" }}
            />
          </div>
        </div>
          {/* 右侧卖出文案 */}
          <span className="text-fall text-[calc(11rem/16)] min-w-[40px] text-right">{sellPercentage}% S</span>
        </div>

        <div className="flex justify-between items-center text-[#FFFFFF] text-[calc(12rem/16)]">
          <div className="flex-1 text-left">{t('futuresDetails.common.buy')}</div>
          <div className="flex-1 text-center pl-[50px]">{t('futuresDetails.common.sell')}</div>
          <div className="flex flex-1 items-center justify-end">
            <DrawerCheckSelect
              childrenTrigger={
                <div>
                  <div
                    className="flex-1 flex items-center justify-end w-fit py-1 px-2 rounded-[4px] bg-[#ECECED14] 
                  text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] text-[#FFFFFFB2] cursor-pointer"
                  >
                    {tick}
                    <img className="ml-2" src="/images/futuresDetail/s-down-arrow-icon.svg" alt="s-down-arrow-icon" />
                  </div>
                </div>
              }
              optionClassName="border-b-[0.5px] border-solid border-[#ECECED14]"
              options={depthOptions as any}
              value={tick as any}
              onChange={handleTickChange}
            />
          </div>
        </div>
      </div>
     {open && <PriceInfoPanel open={open} setOpen={setOpen} type={typeDrawer} />}
    </div>
  )
}

export default PriceDisplay
