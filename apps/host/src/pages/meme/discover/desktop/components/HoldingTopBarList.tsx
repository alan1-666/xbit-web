import { useHoldingTopBarTokens } from '@pages/meme/discover/desktop/hooks/useTopBarTokens.ts'
import { TopBarTokensList } from '@components/v2/desktop/TopBarTokensList.tsx'

export const HoldingTopBarList = () => {
  const { data: tokens } = useHoldingTopBarTokens()
  return <TopBarTokensList key="top-bar-holding" tokens={tokens ?? []} showRemove={false} />
}
