import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/redux/store'
import { useMemo } from 'react'
import { selectFromMemeToken } from '@/redux/modules/memeTokenInfo.slice.ts'

export interface MemeTokenMarketCapProps {
  chainId: number
  tokenAddress: string
  marketCap: number
}

export const MemeTokenMarketCap = (props: MemeTokenMarketCapProps) => {
  const { t } = useTranslation()
  const { chainId, tokenAddress, marketCap } = props
  const realtimeMC = useAppSelector(selectFromMemeToken(chainId, tokenAddress, 'mc'))

  const displayMc = useMemo(() => {
    if (!realtimeMC) return marketCap
    return +realtimeMC
  }, [marketCap, realtimeMC])

  return (
    <SimpleTooltip content={t('listCoin.columns.marketCap')}>
      <div className="flex items-baseline mb-1">
        <div className="text-right leading-3">
          <span className="text-[calc(13rem/16)] text-[#FFFFFF80]">MC</span>{' '}
        </div>
        <div className="pl-1.5">
          <MarketDisplay
            value={displayMc}
            className={'text-title text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))] font-[380] mb-1'}
            showColor={true}
          />
        </div>
      </div>
    </SimpleTooltip>
  )
}
