import { TopHoldersMarketSelector } from '@/modules/prediction/components/event-details/TopHoldersMarketSelector.tsx'
import { HoldersColumn } from '@/modules/prediction/components/event-details/HoldersColumn.tsx'
import { HoldersColumnSkeleton } from '@/modules/prediction/components/event-details/HoldersColumnSkeleton.tsx'
import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'

interface Holder {
  rank: number
  username: string
  address: string
  shares: number
  avatarColor: string
  avatarGradient: string
  profileImage?: string
}

interface TabHoldersPCProps {
  markets: MarketModel[]
  currentMarketId: string
  onMarketChange: (id: string) => void
  yesHolders: Holder[]
  noHolders: Holder[]
  outcomes: [string, string]
  isLoading: boolean
}

export const TabHoldersPC = ({
  markets,
  currentMarketId,
  onMarketChange,
  yesHolders,
  noHolders,
  outcomes,
  isLoading,
}: TabHoldersPCProps) => {
  return (
    <div className="w-full space-y-3">
      {markets.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TopHoldersMarketSelector markets={markets} currentMarket={currentMarketId} onChange={onMarketChange} />
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="grid w-full grid-cols-2 gap-4 pb-1 lg:gap-0">
          <HoldersColumnSkeleton side="left" />
          <HoldersColumnSkeleton side="right" />
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-4 pb-1 lg:gap-0">
          <HoldersColumn outcome={outcomes[0]} holders={yesHolders} isYes side="left" />
          <HoldersColumn outcome={outcomes[1]} holders={noHolders} isYes={false} side="right" />
        </div>
      )}
    </div>
  )
}
