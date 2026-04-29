import { useTranslation } from 'react-i18next'
import { formatPercentage } from '@/utils/helpers.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { useBundlerHoldings } from '@pages/meme/discover/desktop/hooks/useBundlerHoldings.ts'
import {useNativeTokenSymbol} from "@hooks/useActiveChain.ts";

export interface BundlerTooltipProps {
  bundlerPercent: number
  totalSupply?: number
  token: string
  chainId: number
}

export const BundlerTooltip = (props: BundlerTooltipProps) => {
  const { bundlerPercent, token, chainId } = props
  const { t } = useTranslation()
  const { data } = useBundlerHoldings({ token: token, chainId: chainId })
  const nativeTokenSymbol = useNativeTokenSymbol()

  return (
    <div className="w-[220px] py-1 space-y-1.5 text-[calc(12rem/16)] font-[330]">
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.bundlersHolding')}</div>
        <div>{formatPercentage(bundlerPercent)}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.highestHolding')}</div>
        <div>{data?.athHold ? formatPercentage(data.athHold) : '0%'}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.bundlersCount')}</div>
        <div>{data?.totalBundler ? fShortenNumber(data.totalBundler) : '0'}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.bundlersBalance')}</div>
        <div>{data?.bundledTotal ? fShortenNumber(data.bundledTotal) : '0'} {nativeTokenSymbol}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.bundledToken')}</div>
        <div>{data?.bundledToken ? fShortenNumber(data.bundledToken) : '0'}%</div>
      </div>
    </div>
  )
}
