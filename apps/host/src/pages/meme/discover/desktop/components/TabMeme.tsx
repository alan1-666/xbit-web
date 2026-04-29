import { NewTokensList } from '@pages/meme/discover/desktop/components/NewTokensList.tsx'
import { CompletingTokensList } from '@pages/meme/discover/desktop/components/CompletingTokensList.tsx'
import { CompletedTokensList } from '@pages/meme/discover/desktop/components/CompletedTokensList.tsx'
import { TokenMigratedHandler } from '@pages/meme/discover/desktop/components/TokenMigratedHandler.tsx'

export const TabMeme = () => {
  return (
    <div className="h-full">
      <TokenMigratedHandler />
      <div className="h-3" />
      <div className="h-full grid grid-cols-3 mx-3 divide-x rounded-[8px] border border-[#212127]">
        <NewTokensList />
        <CompletingTokensList />
        <CompletedTokensList />
      </div>
    </div>
  )
}
