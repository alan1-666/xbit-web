// components/TokenPageTitle.tsx
import { usePageTitle } from '@hooks/usePageTitle'
import { formatTokenPrice } from '@/utils/helpers'
import { f } from 'fintech-number'
import { useEffect, useMemo, useState } from 'react'
import eventBus from '@/lib/eventBus.ts'
import { EVENT_MESSAGE_OHLC_UPDATED } from '@/datafeeds/dataUpdater.ts'

const subscriptMap: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
}

function toSubscript(input: number | string): string {
  return String(input)
    .split('')
    .map((char) => subscriptMap[char] ?? char)
    .join('')
}

export function formatPriceAsTitle(tokenPrice: string | null | undefined) {
  if (!tokenPrice) return ''
  const formattedPrice = formatTokenPrice(+tokenPrice, { roundType: 'round' })
  const { integerPart, decimalPart, zeroCount } = formattedPrice

  const integerStr = f(+integerPart)
  const decimalStr = decimalPart
    ? `.${zeroCount > 0 ? '0' + toSubscript(zeroCount) : ''}${decimalPart.replace(/0+$/, '')}`
    : ''

  return `$${integerStr}${decimalStr}`
}

type TokenPageTitleProps = {
  address?: string
  symbol?: string
  defaultPrice?: string
}

const TokenPageTitle = ({ symbol, defaultPrice }: TokenPageTitleProps) => {
  const [tokenPrice, setTokenPrice] = useState(defaultPrice ?? '')

  useEffect(() => {
    eventBus.on(EVENT_MESSAGE_OHLC_UPDATED, (data: any) => {
      if (data?.data) {
        setTokenPrice(data?.data?.close)
      }
    })
    return () => {
      eventBus.remove(EVENT_MESSAGE_OHLC_UPDATED)
    }
  }, [])

  const price = useMemo(() => {
    return tokenPrice || defaultPrice
  }, [defaultPrice, tokenPrice])

  const title = symbol && price ? `${symbol} ${formatPriceAsTitle(price)} | XBIT Platform` : 'XBIT Platform'

  usePageTitle(title) // runs on render

  return null
}

export default TokenPageTitle
