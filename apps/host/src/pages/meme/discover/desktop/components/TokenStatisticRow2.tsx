import { ReactNode, useMemo } from 'react'
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
import { useAppSelector } from '@/redux/store'
import { selectFromMemeToken } from '@/redux/modules/memeTokenInfo.slice.ts'

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
  totalSupply: number
}

const getIcon = (key: PropertyKey, _?: boolean) => {
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
          src={`https://app.insightx.network/bubblemaps/${chain}/${address}?link=0&tooltip=true&theme=xbit&preview=true`}
          allow="clipboard-write"
          className="z-10"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  )
}

interface BaseItemProps {
  tooltipContent: ReactNode
  contentClassName: string
  itemClassName: string | undefined
  isWarning: boolean
  icon: ReactNode
  value: string
}

const BaseItem = (props: BaseItemProps) => {
  const { tooltipContent, contentClassName, itemClassName, isWarning, icon, value } = props
  return (
    <SimpleTooltip content={tooltipContent} contentClassName={contentClassName}>
      <div
        className={cn(
          'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border-[#ECECED1F] cursor-pointer data-[state=warning]:text-[#E14650] data-[state=normal]:text-[#41B489]',
          itemClassName,
          // classNames[item.key] || '',
        )}
        data-state={isWarning ? 'warning' : 'normal'}
      >
        {icon}
        <span className={cn('text-[calc(12rem/16)] leading-[12px]')}>{value}</span>
      </div>
    </SimpleTooltip>
  )
}

interface AbstractProps {
  chainId: number
  address: string
  creator: string | undefined
  value: number
  className: string | undefined
  totalSupply: number
}

const DevHold = (props: AbstractProps) => {
  const { chainId, address, creator, value, className } = props
  const realtimeDevHold = useAppSelector(selectFromMemeToken(chainId, address, 'dp'))
  const devHold = useMemo(() => {
    if (realtimeDevHold === undefined || realtimeDevHold === null) return value
    return +realtimeDevHold
  }, [value, realtimeDevHold])
  return (
    <BaseItem
      tooltipContent={
        <DevHoldTooltip devHoldPercent={devHold} creatorAddress={creator} address={address} chainId={chainId} />
      }
      contentClassName=""
      itemClassName={className}
      isWarning={!!devHold && devHold >= 20}
      icon={getIcon('devHold', !!devHold && devHold >= 20)}
      value={devHold !== undefined && devHold !== null ? formatPercentage(devHold) : '0%'}
    />
  )
}

const Top10Holder = (props: AbstractProps) => {
  const { address, value, className } = props
  const realtimeTop10 = useAppSelector(selectFromMemeToken(props.chainId, address, 't10hp'))
  const top10 = useMemo(() => {
    if (realtimeTop10 === undefined || realtimeTop10 === null) return value
    return +realtimeTop10
  }, [value, realtimeTop10])
  return (
    <BaseItem
      tooltipContent={<BubbleMapTooltipContent address={address} />}
      contentClassName="max-w-[300px] p-0"
      itemClassName={className}
      isWarning={top10 >= 20}
      icon={getIcon('top10', top10 >= 20)}
      value={formatPercentage(top10)}
    />
  )
}

const SniperHold = (props: AbstractProps) => {
  const { value, className, totalSupply } = props
  const { t } = useTranslation()
  const sniperHoldingAmount = useAppSelector(selectFromMemeToken(props.chainId, props.address, 'shb'))
  const sniper = useMemo(() => {
    if (sniperHoldingAmount === undefined || sniperHoldingAmount === null) return value
    return (+sniperHoldingAmount / totalSupply) * 100
  }, [value, sniperHoldingAmount, totalSupply])
  return (
    <BaseItem
      tooltipContent={t('listCoin.tooltip.snipersPC', { percent: fShortenNumber(sniper || 0) })}
      contentClassName=""
      itemClassName={className}
      isWarning={!!sniper && +sniper >= 20}
      icon={getIcon('sniper', !!sniper && +sniper >= 20)}
      value={formatPercentage(sniper || 0)}
    />
  )
}

const InsiderHold = (props: AbstractProps) => {
  const { value, className } = props
  const { t } = useTranslation()
  const realtimeInsider = useAppSelector(selectFromMemeToken(props.chainId, props.address, 'itp'))
  const insider = useMemo(() => {
    if (realtimeInsider === undefined || realtimeInsider === null) return value
    return +realtimeInsider
  }, [value, realtimeInsider])
  return (
    <BaseItem
      tooltipContent={t('listCoin.tooltip.insiders') + ` ${fShortenNumber(insider || 0)}%`}
      contentClassName=""
      itemClassName={className}
      isWarning={!!insider && insider >= 20}
      icon={getIcon('insider', !!insider && insider >= 20)}
      value={formatPercentage(insider || 0)}
    />
  )
}

const SameOriginHold = (props: AbstractProps) => {
  const { chainId, address, value, className } = props
  const realtimeBundler = useAppSelector(selectFromMemeToken(chainId, address, 'dbp'))
  const bundler = useMemo(() => {
    if (realtimeBundler === undefined || realtimeBundler === null) return value
    return +realtimeBundler
  }, [value, realtimeBundler])

  return (
    <BaseItem
      tooltipContent={<BundlerTooltip bundlerPercent={bundler} token={address} chainId={chainId} />}
      contentClassName=""
      itemClassName={className}
      isWarning={!!bundler && +bundler >= 20}
      icon={getIcon('sameOrigin', !!bundler && +bundler >= 20)}
      value={formatPercentage(bundler ? +bundler : 0)}
    />
  )
}

export const TokenStatisticRow = (props: TokenStatisticRowProps) => {
  const {
    devHold,
    sniper,
    top10,
    bundler,
    insider,
    address,
    creator,
    chainId,
    itemClassName,
    classNames = {},
    totalSupply,
  } = props

  return (
    <div className="flex items-center gap-2">
      <DevHold
        chainId={chainId}
        address={address}
        creator={creator}
        value={devHold}
        className={cn(itemClassName, classNames.devHold)}
        totalSupply={totalSupply}
      />
      <Top10Holder
        chainId={chainId}
        address={address}
        creator={creator}
        value={top10}
        className={cn(itemClassName, classNames.top10)}
        totalSupply={totalSupply}
      />
      <SniperHold
        chainId={chainId}
        address={address}
        creator={creator}
        value={sniper}
        className={cn(itemClassName, classNames.sniper)}
        totalSupply={totalSupply}
      />
      <InsiderHold
        chainId={chainId}
        address={address}
        creator={creator}
        value={insider}
        className={cn(itemClassName, classNames.insider)}
        totalSupply={totalSupply}
      />
      <SameOriginHold
        chainId={chainId}
        address={address}
        creator={creator}
        value={bundler}
        className={cn(itemClassName, classNames.sameOrigin)}
        totalSupply={totalSupply}
      />
    </div>
  )
}
