import { TokenDirection } from '@/@generated/gql/graphql-core.ts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils.ts'

export const trendingTabs: TokenDirection[] = [
  TokenDirection.Popular,
  TokenDirection.Gainer,
  TokenDirection.Loser,
  TokenDirection.AiAnalysis,
]

const tabLabelKeys: Record<TokenDirection, string> = {
  [TokenDirection.Popular]: 'listCoin.filters.popular',
  [TokenDirection.Gainer]: 'listCoin.filters.gainers',
  [TokenDirection.Loser]: 'listCoin.filters.losers',
  [TokenDirection.AiAnalysis]: 'listCoin.filters.aiMining',
}

export interface TrendingTabsProps {
  currentTab: TokenDirection
  setCurrentTab: (tab: TokenDirection) => void
}

export const TrendingTabs = (props: TrendingTabsProps) => {
  const { currentTab, setCurrentTab } = props
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 relative">
      {trendingTabs.map((tab) => (
        <div
          key={tab}
          className={cn(
            'cursor-pointer rounded-[4px] text-center min-w-18 h-6 px-3 transition-colors duration-200 flex items-center justify-center  relative',
            currentTab === tab
              ? 'text-[calc(13rem/16)] leading-[calc(13rem/16)] text-black bg-white'
              : 'text-[calc(13rem/16)] leading-[calc(12rem/16)] text-[#908E98] bg-[#18171E]',
          )}
          onClick={() => setCurrentTab(tab)}
        >
          <span className="z-10">{t(tabLabelKeys[tab])}</span>
        </div>
      ))}
    </div>
  )
}
