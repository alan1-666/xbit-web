import Text from '@/components/common/Text'
import React, { memo } from 'react'

export type MarketKind = 'futures' | 'spot'

const FUTURES_COINS_ICON = import.meta.env.VITE_FUTURES_COINS_ICON
const LOCAL_FALLBACK_ICON = '/images/logoweb.png'

export const getCoinIconUrl = (coin: string) => {
  if (!coin) {
    return ''
  }

  if (!FUTURES_COINS_ICON) {
    return ''
  }

  return `${FUTURES_COINS_ICON}/${coin}.svg`
}

export const onCoinIconError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  const target = e.currentTarget
  if (!target) {
    return
  }

  if (target.dataset.fallbackApplied === 'true') {
    return
  }

  target.dataset.fallbackApplied = 'true'
  // 这样写会一直闪烁，先注释掉
  // target.src = LOCAL_FALLBACK_ICON
}

// 币种头像组件，使用背景图片避免数据更新时闪烁
export const CoinIcon = memo(({ symbol }: { symbol: string }) => {
  const iconUrl = getCoinIconUrl(symbol)
  return (
    <div
      className="w-6 h-6 rounded-full bg-[#EDF0F4] bg-contain bg-center bg-no-repeat flex-shrink-0"
      style={{ backgroundImage: `url(${iconUrl})` }}
      role="img"
      aria-label={symbol}
    />
  )
}, (prevProps, nextProps) => prevProps.symbol === nextProps.symbol)

CoinIcon.displayName = 'CoinIcon'

export const PairName = ({ symbol, marketKind }: { symbol: string; marketKind: MarketKind }) => {
  const quote = 'USDC'

  const renderers: Record<MarketKind, React.ReactNode> = {
    futures: (
      <Text
        text={`${symbol}${quote}`}
        fontSize={14}
        fontWeight="medium"
        className="leading-[calc(1rem*(15/16))]"
      />
    ),
    spot: (
      <div className="flex items-end">
        <Text text={symbol} fontSize={14} fontWeight="medium" className="leading-[calc(1rem*(15/16))]" />
        <Text text="/" fontSize={9} fontWeight="light" color="#FFFFFF80" className="leading-[calc(1rem*(12/16))]" />
        <Text
          text={quote}
          fontSize={11}
          fontWeight="light"
          color="#FFFFFF80"
          className="leading-[calc(1rem*(11/16))] pr-1"
        />
      </div>
    ),
  }

  return renderers[marketKind]
}


