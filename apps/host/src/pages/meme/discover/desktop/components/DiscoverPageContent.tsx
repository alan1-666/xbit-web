import { TabMeme } from '@pages/meme/discover/desktop/components/TabMeme.tsx'
import { TabTrending } from '@pages/meme/discover/desktop/components/TabTrending.tsx'
import { TabCategories } from '@pages/meme/discover/desktop/components/TabCategories.tsx'
import { TAB_CLASSIFICATION, TAB_MEME, TAB_TRENDING } from '@components/discover/DiscoverTabs.tsx'

export interface DiscoverPageContentProps {
  currentTab: string
}

export const DiscoverPageContent = (props: DiscoverPageContentProps) => {
  const { currentTab } = props

  if (currentTab === TAB_MEME) return <TabMeme />
  if (currentTab === TAB_TRENDING) return <TabTrending />
  if (currentTab === TAB_CLASSIFICATION) return <TabCategories />
  return <TabMeme />
}
