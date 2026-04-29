import { MemeTokenWithFormatted } from '@/types/token.ts'
import { getDexByLaunchpad, getLaunchpad } from '@/utils/helpers.ts'
import { getDex } from '@/utils/lauchpad.ts'
import { IconMigrating } from '@components/icon/stroke/IconMigrating.tsx'

export interface MigratingStatusProps {
  token: MemeTokenWithFormatted
}

export const MigratingStatus = (props: MigratingStatusProps) => {
  const { token } = props
  const launchpad = getLaunchpad(token.dexes || [])
  const dex = launchpad ? getDexByLaunchpad(launchpad) : undefined
  const launchpadInfo = launchpad ? getDex(launchpad) : undefined
  const dexInfo = dex ? getDex(dex) : undefined

  if (!dexInfo || !launchpadInfo) {
    return <div></div>
  }

  return (
    <div className="flex items-center gap-2">
      <div className="size-7 rounded-full bg-[#212127] p-1.5">
        <img src={launchpadInfo.icon} alt={launchpadInfo.alias} className="size-4" />
      </div>
      <IconMigrating className="text-[#6C6A74] size-4" />
      <div className="size-7 rounded-full bg-[#212127] p-1.5">
        <img src={dexInfo.icon} alt={dexInfo.alias} className="size-4" />
      </div>
    </div>
  )
}
