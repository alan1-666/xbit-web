import { useRecentTopBarTokens } from '@pages/meme/discover/desktop/hooks/useTopBarTokens.ts'
import { TopBarTokensList } from '@components/v2/desktop/TopBarTokensList.tsx'

export const RecentTopBarTokensList = () => {
  const { data: tokens, removeToken } = useRecentTopBarTokens()
  return <TopBarTokensList key="top-bar-holding" tokens={tokens ?? []} onRemove={removeToken} showRemove={true} />
}
