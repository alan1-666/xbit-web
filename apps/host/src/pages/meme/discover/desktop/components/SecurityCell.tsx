import { formatPercentage } from '@/utils/helpers.ts'
import { Trans } from 'react-i18next'
import { cn } from '@/lib/utils.ts'

export interface SecurityCellProps {
  mint: boolean // mint disable
  blacklist: boolean
  burnt: boolean
  top10Holder: number | null | undefined
}

export const SecurityCell = (props: SecurityCellProps) => {
  const { mint: mintDisabled, top10Holder, burnt, blacklist } = props
  const top10Holding = top10Holder ? +top10Holder : 0

  return (
    <div className="flex gap-3 text-[calc(14rem/16)] font-medium w-full justify-between pr-6">
      <div>
        <div className={cn(mintDisabled ? 'text-rise' : 'text-fall')}>
          <Trans i18nKey={!mintDisabled ? 'detail.tokenInfo.yes' : 'detail.tokenInfo.no'} />
        </div>
        <div className="text-[calc(13rem/16)] text-[#FFFFFF80]">
          <Trans i18nKey="contractMonitoring.canMint" />
        </div>
      </div>
      <div>
        <div className={cn(blacklist ? 'text-fall' : 'text-rise')}>
          <Trans i18nKey={blacklist ? 'detail.tokenInfo.yes' : 'detail.tokenInfo.no'} />
        </div>
        <div className="text-[calc(13rem/16)] text-[#FFFFFF80]">
          <Trans i18nKey="contractMonitoring.blacklist" />
        </div>
      </div>
      <div>
        <div className={cn(burnt ? 'text-rise' : 'text-fall')}>
          <Trans i18nKey={burnt ? 'detail.tokenInfo.yes' : 'detail.tokenInfo.no'} />
        </div>
        <div className="text-[calc(13rem/16)] text-[#FFFFFF80]">
          <Trans i18nKey="contractMonitoring.burnPool" />
        </div>
      </div>
      <div>
        <div className={cn(top10Holding >= 20 ? 'text-fall' : 'text-rise')}>{formatPercentage(top10Holding)}</div>
        <div className="text-[calc(13rem/16)] text-[#FFFFFF80]">
          <Trans i18nKey="tokenData.top10Holdings" />
        </div>
      </div>
    </div>
  )
}
