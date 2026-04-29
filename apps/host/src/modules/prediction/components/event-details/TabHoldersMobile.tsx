import { TopHoldersMarketSelector } from '@/modules/prediction/components/event-details/TopHoldersMarketSelector.tsx'
import { HoldersTableMobile } from '@/modules/prediction/components/event-details/HoldersTableMobile.tsx'
import { HoldersTableSkeletonMobile } from '@/modules/prediction/components/event-details/HoldersTableSkeletonMobile.tsx'
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

interface TabHoldersMobileProps {
  markets: MarketModel[]
  currentMarketId: string
  onMarketChange: (id: string) => void
  yesHolders: Holder[]
  noHolders: Holder[]
  outcomes: [string, string]
  isLoading: boolean
}

export const TabHoldersMobile = ({
  markets,
  currentMarketId,
  onMarketChange,
  yesHolders,
  noHolders,
  outcomes,
  isLoading,
}: TabHoldersMobileProps) => {
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
        <div className="overflow-hidden rounded-xl border border-white/10">
          <HoldersTableSkeletonMobile />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <HoldersTableMobile outcomes={outcomes} yesHolders={yesHolders} noHolders={noHolders} />
        </div>
      )}
    </div>
  )
}
