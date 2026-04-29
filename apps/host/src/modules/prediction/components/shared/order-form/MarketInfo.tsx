import { MarketModel } from '@/modules/prediction/models/MarketModel.ts'
import { MarketBase } from '@/@generated/gql/graphql-prediction.ts'
import { Avatar, AvatarImage } from '@components/ui/avatar.tsx'
import { cn } from '@/lib/utils.ts'
import { useEventDetailsPageContext } from '@/modules/prediction/contexts/EventDetailsPageContext.ts'
import { AvailableBalance } from './AvailableBalance'

export interface MarketInfoProps {
  market?: MarketModel | MarketBase
  className?: string
  showBalance?: boolean
}

export const MarketInfo = (props: MarketInfoProps) => {
  const { event } = useEventDetailsPageContext()
  const { market, className, showBalance = true } = props

  return (
    <>
      <div className={cn('flex items-center gap-2 min-h-10 mt-3', className)}>
        <Avatar className="rounded-[6px] size-9 shrink-0">
          <AvatarImage src={market?.image || undefined} className="object-cover" />
        </Avatar>

        <div className="min-w-0 flex-1 flex flex-col gap-1 truncate leading-5 text-base font-semibold tracking-[0.04px]">
          <div className="truncate text-xs font-medium leading-[1.3]">{event?.title}</div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 truncate text-xs font-semibold leading-[1.3]">{market?.groupItemTitle}</div>
            {showBalance && <AvailableBalance />}
          </div>
        </div>
      </div>
    </>
  )
}
