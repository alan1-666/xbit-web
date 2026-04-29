import { HolderRowMobile } from '@/modules/prediction/components/event-details/HolderRowMobile.tsx'
import { BlankState } from '@components/v2/ui-shared/components/BlankState.tsx'
import { useTranslation } from 'react-i18next'

interface Holder {
  rank: number
  username: string
  address: string
  shares: number
  avatarColor: string
  avatarGradient: string
  profileImage?: string
}

interface HoldersTableMobileProps {
  outcomes: [string, string]
  yesHolders: Holder[]
  noHolders: Holder[]
}

export const HoldersTableMobile = ({ outcomes, yesHolders, noHolders }: HoldersTableMobileProps) => {
  const { t } = useTranslation()
  const sortedYes = [...yesHolders].sort((a, b) => b.shares - a.shares)
  const sortedNo = [...noHolders].sort((a, b) => b.shares - a.shares)

  return (
    <>
      {/* Header row: Yes Holders | divider | No Holders */}
      <div className="flex h-[42px] w-full items-cente bg-[#18181B]">
        <div className="flex flex-1 items-center pr-2.5 pl-3">
          <p className="text-sm font-medium capitalize">
            {outcomes[0]} {(t('prediction.eventDetails.tabs.holders') as string)?.toLowerCase()}
          </p>
        </div>
        <div className="h-5 w-px shrink-0 bg-white/10 my-auto" />
        <div className="flex flex-1 items-center pl-2.5 pr-3">
          <p className="text-sm font-medium capitalize">
            {outcomes[1]} {(t('prediction.eventDetails.tabs.holders') as string)?.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Body: 2 columns */}
      <div className="grid w-full grid-cols-2">
        <div className="flex flex-col">
          {sortedYes.length > 0 ? (
            sortedYes.map((holder, index) => (
              <HolderRowMobile
                key={holder.address}
                holder={{ ...holder, rank: index + 1 }}
                isYes
              />
            ))
          ) : (
            <div className="py-4">
              <BlankState />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          {sortedNo.length > 0 ? (
            sortedNo.map((holder, index) => (
              <HolderRowMobile
                key={holder.address}
                holder={{ ...holder, rank: index + 1 }}
                isYes={false}
              />
            ))
          ) : (
            <div className="py-4">
              <BlankState />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
