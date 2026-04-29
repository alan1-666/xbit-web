import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { useMemo } from 'react'

export interface ResolutionSourceProps {
  market: MarketModel | undefined
}

import { useTranslation } from 'react-i18next'

export const ResolutionSource = (props: ResolutionSourceProps) => {
  const { market } = props
  const { t } = useTranslation()
  const resolutionSource = useMemo(() => {
    const source = market?.resolutionSource
    if (!source) return null
    if (source.includes('chain.link')) {
      return {
        source: 'chainlink',
        url: source,
        image: '/images/icons/brands/chainlink-link-logo.svg',
      }
    }
    if (source.includes('binance')) {
      return {
        source: 'binance',
        url: source,
        image: '/images/icons/brands/binance-logo.svg',
      }
    }
  }, [market])
  if (!resolutionSource) return null
  return (
    <div className="border border-white/10 rounded-[8px] mb-3 p-3 mt-3 text-sm">
      <div className="flex items-center">
        <img src={resolutionSource.image} alt={`${resolutionSource.source} logo`} className="size-8 mr-2" />
        <div>
          <div className="font-semibold">{t('prediction.eventDetails.resolutionSource')}</div>
          <a
            href={resolutionSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline break-all"
          >
            {resolutionSource.url}
          </a>
        </div>
      </div>
    </div>
  )
}
