import { useTranslation } from 'react-i18next'
import { BaseTokenCard, SubItem } from '@components/discover/cards/BaseTokenCard.tsx'
import { formatVolume } from '@/lib/format.ts'
import { formatNumberOfTransactions, listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { TimeframeOption } from '../TimeframeSelector'
import { fShortenNumber } from '@/lib/number.ts'
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from 'react'
import { RemoveWatchlistButton } from '@components/discover/RemoveWatchlistButton.tsx'
import { useTokenStatistic } from '@hooks/useTokenPrice.ts'

export interface WatchlistCardProps {
  token: TokenStatisticDto
  timeframe: TimeframeOption
  onItemRemoved?: (token: TokenStatisticDto) => void
  onAiClick?: (token: TokenStatisticDto) => void
}

export const WatchlistCard = (props: WatchlistCardProps) => {
  const { timeframe, onItemRemoved, onAiClick } = props
  const token = useTokenStatistic(props.token)
  const [disabled, setDisabled] = useState<boolean>(false)
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const subItems: SubItem[] = [
    { label: t('listCoin.fields.liquidityPool'), value: `$${formatVolume(+token.liquidity)}` },
    {
      label: t('tokenData.marketCap'),
      value: token.marketcap ? fShortenNumber(token.marketcap) : '--',
    },
    {
      label: t('detail.trading.volume', { time: timeframe }),
      value: listCoinHelper.getVolumes(token, timeframe),
    },
      {
      label: t('detail.trading.transactions', { time: timeframe }),
      value: formatNumberOfTransactions(token, timeframe),
    },
    // {
    //   label: t('listCoin.columns.holders'),
    //   value: token.numberOfHolder ? fShortenNumber(token.numberOfHolder) : '--',
    // },
  ]

  useEffect(() => {
    // default scroll to right
    if (ref.current) {
      ref.current.scrollTo({
        left: ref.current.scrollWidth,
        behavior: 'auto',
      })
    }
  }, [ref.current])

  const onActionClick = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div
      ref={ref}
      className="relative w-full overflow-x-auto no-scrollbar snap-x snap-mandatory flex items-stretch gap-1"
    >
      <div
        className="w-[100px] rounded-[6px] z-20 basis-[50px] shrink-0 flex items-center snap-start justify-center bg-[#FF353C1A]"
        onClick={!disabled ? onActionClick : undefined}
      >
        <RemoveWatchlistButton
          tokenAddress={token.token}
          tokenSymbol={token.symbol as string}
          onRemoving={() => setDisabled(true)}
          onRemoved={() => onItemRemoved?.(token)}
        />
      </div>
      <div className="w-full basis-full shrink-0 snap-start relative">
        <BaseTokenCard
          token={token}
          timeframe={timeframe}
          subItems={subItems}
          disabled={disabled}
          onAiClick={() => onAiClick?.(token)}
        />
        {disabled && <div className="absolute inset-0 bg-[#141414B3]" />}
      </div>
    </div>
  )
}
