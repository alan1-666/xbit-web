import { TAB_CLASSIFICATION, TAB_MEME, TAB_WATCHLIST, TAB_X_STOCKS } from '@components/discover/DiscoverTabs.tsx'
import { TabMeme } from '@components/discover/tabs/TabMeme.tsx'
import { TabTrending } from '@components/discover/tabs/TabTrending.tsx'
import { TabCategories } from '@components/discover/tabs/TabCategories.tsx'
import { TabXStocks } from '@components/discover/tabs/TabXStocks.tsx'
import TabWatchList from '../watchlistTab'

export interface DiscoverTabContentProps {
  currentTab: string
}

export const DiscoverTabContent = (props: DiscoverTabContentProps) => {
  const { currentTab } = props
  if (currentTab === TAB_WATCHLIST) return <TabWatchList />
  if (currentTab === TAB_MEME) return <TabMeme />
  if (currentTab === TAB_CLASSIFICATION) return <TabCategories />
  if (currentTab === TAB_X_STOCKS) return <TabXStocks />
  return <TabTrending />
}
