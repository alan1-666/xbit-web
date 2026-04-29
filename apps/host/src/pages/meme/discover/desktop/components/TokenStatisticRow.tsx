import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { isNumber } from '@/utils/helpers.ts'
import { cn } from '@/lib/utils.ts'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import LoadingSpinner from '@components/ui/loading-spinner.tsx'
import { DevHoldTooltip } from '@pages/meme/discover/desktop/components/DevHoldTooltip.tsx'
import { BundlerTooltip } from '@pages/meme/discover/desktop/components/BundlerTooltip.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { IconTop10 } from '@components/icon/stroke/IconTop10.tsx'
import { IconDevHold } from '@components/icon/stroke/IconDevHold.tsx'
import { IconSniper } from '@components/icon/stroke/IconSniper.tsx'
import { IconInsider } from '@components/icon/stroke/IconInsider.tsx'
import { IconBundler } from '@components/icon/stroke/IconBundler.tsx'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'

export interface TokenStatisticRowProps {
  address: string
  devHold: number
  top10: number
  sniper: number
  insider: number
  bundler: number
  creator?: string
  chainId: number
  itemClassName?: string
  classNames?: Record<string, string>
}

const getIcon = (key: PropertyKey, warning?: boolean) => {
  switch (key) {
    case 'devHold':
      return <IconDevHold />
    case 'top10':
      return <IconTop10 />
    case 'sniper':
      return <IconSniper />
    case 'insider':
      return <IconInsider />
    case 'sameOrigin':
      return <IconBundler />
    case 'holder':
      return <img src="/images/discover/ic-holder.svg" className="size-3" alt="" />
    case 'smartMoney':
      return <img src="/images/discover/ic-smart-money.svg" className="size-3" alt="" />
    default:
      return null
  }
}

const percentageNumberFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const formatPercentage = (value: number) => {
  if (!isNumber(value)) return '0%'
  const normalizedValue = Math.round(Math.max(0, Math.min(+value, 100)))
  return percentageNumberFormat.format(normalizedValue) + '%'
}

const BubbleMapTooltipContent = (props: { address: string }) => {
  const { address } = props
  const activeChainId = useActiveChainId()
  const chain = useMemo(() => {
    if (activeChainId === ChainIds.Bsc) return '56'
    if (activeChainId === ChainIds.Ethereum) return 'eth'
    return 'solana'
  }, [activeChainId])
  return (
    <div className="w-[300px] h-[360px] relative">
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <LoadingSpinner size={16} />
      </div>
      <div className="z-10 absolute inset-0">
        <iframe
          src={`https://app.insightx.network/bubblemaps/${chain}/${address}?link=0&tooltip=true&theme=xbit&preview=true&embed_id=${import.meta.env.VITE_APPLE_OAUTH_CLIENT_ID}`}
          allow="clipboard-write"
          className="z-10"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  )
}

export const TokenStatisticRow = (props: TokenStatisticRowProps) => {
  const { devHold, sniper, top10, bundler, insider, address, creator, chainId, itemClassName, classNames = {} } = props
  const { t } = useTranslation()
  const items = useMemo(() => {
    return [
      {
        key: 'devHold',
        icon: getIcon('devHold', !!devHold && devHold >= 20),
        tooltipContent: (
          <DevHoldTooltip devHoldPercent={devHold} creatorAddress={creator} address={address} chainId={chainId} />
        ),
        value: devHold !== undefined && devHold !== null ? formatPercentage(devHold) : '0%',
        isWarning: !!devHold && devHold >= 20,
      },
      {
        key: 'top10',
        icon: getIcon('top10', top10 >= 20),
        tooltipContent: <BubbleMapTooltipContent address={address} />,
        contentClassName: 'max-w-[300px] p-0',
        value: formatPercentage(top10),
        isWarning: top10 >= 20,
      },
      {
        key: 'sniper',
        icon: getIcon('sniper', !!sniper && +sniper >= 20),
        tooltipContent: t('listCoin.tooltip.snipersPC', { percent: fShortenNumber(sniper || 0) }),
        value: formatPercentage(sniper || 0),
        isWarning: sniper && +sniper >= 20,
      },
      {
        key: 'insider',
        icon: getIcon('insider', !!insider && insider >= 20),
        tooltipContent: t('listCoin.tooltip.insiders') + ` ${fShortenNumber(insider || 0)}%`,
        value: formatPercentage(insider || 0),
        isWarning: !!insider && insider >= 20,
      },
      {
        key: 'sameOrigin',
        icon: getIcon('sameOrigin', !!bundler && +bundler >= 20),
        tooltipContent: <BundlerTooltip bundlerPercent={bundler} token={address} chainId={chainId} />,
        value: formatPercentage(bundler ? +bundler : 0),
        isWarning: !!bundler && +bundler >= 20,
      },
    ]
  }, [devHold, top10, sniper, insider, bundler, t])

  return (
    <div className="flex items-center gap-2">
      {items.map((item) => (
        <SimpleTooltip key={item.key} content={item.tooltipContent} contentClassName={item.contentClassName}>
          <div
            className={cn(
              'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border-[#ECECED1F] cursor-pointer data-[state=warning]:text-[#E14650] data-[state=normal]:text-[#41B489]',
              itemClassName,
              classNames[item.key] || '',
            )}
            data-state={item.isWarning ? 'warning' : 'normal'}
          >
            {item.icon}
            <span className={cn('text-[calc(12rem/16)] leading-[12px]')}>{item.value}</span>
          </div>
        </SimpleTooltip>
      ))}
    </div>
  )
}
