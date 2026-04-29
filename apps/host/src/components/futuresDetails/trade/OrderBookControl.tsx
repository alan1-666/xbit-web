import { useMemo, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { selectFuturesTradePreferences, futuresTradePreferencesActions } from '@/redux/modules/futuresTradePreferences.slice'
import type { DepthLayout } from '@/redux/modules/futuresTradePreferences.slice'
import { selectTiersBySymbol } from '@/redux/modules/futuresMeta.slice'
import { symbolInfoSelector } from '@/redux/modules/futuresCurrentSymbol.slice'
import { futuresTradeConfigActions, futuresTradeConfigSelector } from '@/redux/modules/futuresTradeConfigs.slice'
import { ArrowDownIcon1 } from '@/components/icon/ArrowDownIcon'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const layoutImg = [
  {
    url: '/images/futuresDetail/depth-show-all-icon-pc.svg',
    value: 'showAll',
  },
  {
    url: '/images/futuresDetail/depth-show-asks-icon.svg',
    value: 'showAsks',
  },
  {
    url: '/images/futuresDetail/depth-show-bids-icon.svg',
    value: 'showBids',
  },
]

const OrderBookControl = () => {
  const dispatch = useAppDispatch()

  const { depthLayout, depthUnit } = useAppSelector(selectFuturesTradePreferences)
	
  const { baseCoin, quoteCoin } = useAppSelector(symbolInfoSelector)

  const tradeConfigs = useAppSelector(futuresTradeConfigSelector(baseCoin))

  const tick = Number(tradeConfigs.depthTick)

  const tiers = useAppSelector(selectTiersBySymbol(baseCoin)) || []
  const priceChangeColor = useAppSelector((state: any) => state.preference?.priceChangeColor)
  const isInverse = priceChangeColor === 'inverse'
  const depthOptions = useMemo(() => {
    if (!tiers?.length) return []
    return tiers?.map(item => {
      return {
        label: item.tick,
        value: item.tick,
      }
    })
  }, [tiers])

  const handleTickChange = (tick: string) => {
    dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
      symbol: baseCoin,
      config: {
        depthTick: (Number(tick))
      }
    }))
  }

  const handleLayoutChange = (value: DepthLayout) => {
    dispatch(futuresTradePreferencesActions.updateTradePreferences({
      depthLayout: value as DepthLayout
    }))
  }

  const handleDepthUnitChange = (unit: 'base' | 'quote') => {
    dispatch(futuresTradePreferencesActions.updateTradePreferences({
      depthUnit: unit
    }))
  }

  const showDepthUnit = useMemo(() => {
    return depthUnit === 'base' ? baseCoin : quoteCoin
  }, [depthUnit, baseCoin, quoteCoin])

  const depthUnitOptions = useMemo(() => [
    { label: baseCoin, value: 'base' },
    { label: quoteCoin, value: 'quote' }
  ], [baseCoin, quoteCoin])

  useEffect(() => {
    if (!tick && depthOptions.length > 0) {

      dispatch(futuresTradeConfigActions.updateFuturesTradeConfig({
        symbol: baseCoin,
        config: {
          depthTick: Number(depthOptions[0].value)
        }
      }))

    }
  }, [depthOptions, tick]);

  return (
    <div className='flex items-center justify-between pb-2 gap-2 border-b border-[#101114]'>
      <div className='relative z-10 flex items-center'>
        {layoutImg.map(item => (
          <button
            key={item.value}
            type='button'
            aria-label={`set-${item.value}`}
            className={`mr-1.5 w-[18px] h-[18px] p-[2px] flex items-center justify-center rounded 
              hover:bg-white/5 active:bg-white/10 cursor-pointer pointer-events-auto
                ${item.value === depthLayout ? 'opacity-100 bg-[#ECECED]/16' : 'opacity-60 hover:opacity-90'}`}
            onClick={() => { handleLayoutChange(item.value as DepthLayout) }}
          >
            <img
              className='w-4 h-4 pointer-events-none'
              src={
                isInverse
                  ? (item.value === 'showAsks'
                      ? layoutImg.find(i => i.value === 'showBids')?.url
                      : item.value === 'showBids'
                        ? layoutImg.find(i => i.value === 'showAsks')?.url
                        : item.url)
                  : item.url
              }
              alt={item.value}
            />
          </button>
        ))}
      </div>

      <div className='flex items-center gap-2'>
        {tick !== 0 && depthOptions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'relative z-0 flex-1 flex items-center justify-between py-1 px-2 rounded-[4px] bg-[#1F1E25]',
                  'text-xs text-[#FFFFFFB2] cursor-pointer',
                  'transition-colors'
                )}
              >
                <span>{tick}</span>
                <ArrowDownIcon1 fill="#6C6A74" size={16} className='ml-2' />
                {/* <img className='ml-2' src="/images/futuresDetail/s-down-arrow-icon.svg" /> */}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className={cn('min-w-[100px] bg-[#1F1E25]  text-[#FFFFFFB2]')}
            >
              {depthOptions.map((option: any) => (
                <DropdownMenuItem
                  key={option.value}
                  className={cn(
                    'flex items-center py-2 text-[calc(1rem*(12/16))] cursor-pointer',
                    tick === Number(option.value) && 'text-[#FFFFFF] bg-[#ECECED1A]'
                  )}
                  onClick={() => handleTickChange(String(option.value))}
                >
                  <span>{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (<></>)}
        {/* 币种单位选择下拉框 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-between py-1 px-2 rounded-[4px] bg-[#1F1E25]',
                'text-xs text-[#FFFFFFB2] cursor-pointer',
                'transition-colors'
              )}
            >
              <span>{showDepthUnit.length > 5 ? `${showDepthUnit.substring(0, 5)}...` : showDepthUnit}</span>
              <ArrowDownIcon1 fill="#6C6A74" size={16} className='ml-2' />
              {/* <img className='ml-2' src="/images/futuresDetail/s-down-arrow-icon.svg" /> */}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className={cn('min-w-[100px] bg-[#1F1E25] border-[#ECECED0A] text-[#FFFFFFB2]')}
          >
            {depthUnitOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={cn(
                  'flex items-center py-2 text-[calc(1rem*(12/16))] cursor-pointer',
                  depthUnit === option.value && 'text-[#FFFFFF] bg-[#ECECED1A]'
                )}
                onClick={() => handleDepthUnitChange(option.value as 'base' | 'quote')}
              >
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
export default OrderBookControl