import { useMemo } from 'react'
import { Configs } from '@/const/configs'

export function TokenIcon({ coin, className = 'size-8' }: { coin?: string; className?: string }) {
  const src = useMemo(() => {
    const symbol = (coin ?? '').trim().toUpperCase()
    if (!symbol) return '/images/kairox-logo-rounded.svg'
    return `${Configs.getHyperliquidConfig().imgUrl}/${symbol}.svg`
  }, [coin])

  return (
    <img
      src={src}
      className={`${className} bg-white rounded-full`}
      alt={`${coin ?? 'token'}-logo`}
      onError={(e) => {
        if (e.currentTarget.src.includes('/images/kairox-logo-rounded.svg')) {
          return e.currentTarget.src = '/images/kairox-logo-rounded.svg'
        }
      }}
    />
  )
}
