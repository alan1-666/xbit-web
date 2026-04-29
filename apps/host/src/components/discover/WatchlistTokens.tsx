import { TokenStatisticDto } from '@/@generated/gql/graphql-core.ts'
import { ListTokenSkeleton } from '@components/discover/ListTokenSkeleton.tsx'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { WatchlistCard } from '@components/discover/cards/WatchlistCard.tsx'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { useTranslation } from 'react-i18next'

export interface WatchlistTokensProps {
  tokens: TokenStatisticDto[]
  isLoading: boolean
  timeframe: TimeframeOption
  onItemRemoved?: (token: TokenStatisticDto) => void
  onAiClick?: (token: TokenStatisticDto) => void
}

export const WatchlistTokens = (props: WatchlistTokensProps) => {
  const { tokens, isLoading, timeframe, onItemRemoved, onAiClick } = props
  const { t } = useTranslation()
  if (isLoading) return <ListTokenSkeleton />
  if (tokens.length === 0) return <div className="m-auto"><EmptyList emptyText={t('listCoin.noDataWatchlist')}/></div>
  return (
    <AnimatePresence>
      {tokens.map((token) => (
        <motion.div
          key={token.token}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-[10px]"
        >
          <WatchlistCard
            key={`${token.token}-${timeframe}`}
            token={token}
            timeframe={timeframe}
            onItemRemoved={onItemRemoved}
            onAiClick={onAiClick}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
