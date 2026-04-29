import { BaseTokenCard, SubItem } from '@components/discover/cards/BaseTokenCard.tsx'
import { formatLiquidity, formatMarketCap, formatVolume } from '@/lib/format.ts'
import { TimeframeOption } from '../TimeframeSelector'
import { useTranslation } from 'react-i18next'
import { useTokenStatistic } from '@hooks/useTokenPrice.ts'
import { useCallback, useMemo, useState } from 'react'
import { MemeDto } from '@/@generated/gql/graphql-meme2.ts'
import { formatNumberOfTransactions } from '@/utils/list-coin-helper'

export interface TrendingCardProps {
  token: MemeDto
  timeframe: TimeframeOption
  onAiAnalysisClick?: (token: MemeDto) => void
}

export const TrendingCard = (props: TrendingCardProps) => {
  const { token: original, timeframe, onAiAnalysisClick } = props
  const { t } = useTranslation()
  const [searchParams] = useState(new URLSearchParams(window.location.search))

  const token = useTokenStatistic<MemeDto>(original)

  const debugEnabled = searchParams.get('debug') === '1'

  const volume = useMemo(() => {
    switch (timeframe) {
      case '1m':
        return token.volume1m ? +token.volume1m : undefined
      case '5m':
        return token.volume5m ? +token.volume5m : undefined
      case '1h':
        return token.volume1h ? +token.volume1h : undefined
      case '6h':
        return token.volume6h ? +token.volume6h : undefined
      case '24h':
        return token.volume24h ? +token.volume24h : undefined
      default:
        return undefined
    }
  }, [token, timeframe])

  const subItems: SubItem[] = useMemo(() => {
    return [
      { label: t('listCoin.fields.liquidityPool'), value: `$${formatLiquidity(+token.liquidity)}` },
      {
        label: t('tokenData.marketCap'),
        value: token.marketcap ? `$${formatMarketCap(token.marketcap)}` : '--',
      },
      {
        label: t('detail.trading.volume', { time: timeframe }),
        value: volume !== undefined ? `$${formatVolume(volume)}` : '--',
      },
      {
        label: t('detail.trading.transactions', { time: timeframe }),
        value: formatNumberOfTransactions(token, timeframe),
      },
    ]
  }, [t, token, timeframe])
  const handleAiAnalysisClick = useCallback(() => {
    if (onAiAnalysisClick) {
      onAiAnalysisClick(token)
    }
  }, [])
  return (
    <BaseTokenCard
      token={token}
      timeframe={timeframe}
      subItems={subItems}
      showTrendingScore={true}
      showTrendingScoreDebug={debugEnabled}
      onAiClick={handleAiAnalysisClick}
    />
  )
}
