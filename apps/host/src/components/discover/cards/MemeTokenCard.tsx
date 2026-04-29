import { CopyButton } from '@components/common/copy-button.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import { MarketDisplay } from '@components/common/FormattingDisplay.tsx'
import { fShortenNumber, parseNumber } from '@/lib/number.ts'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { useTranslation } from 'react-i18next'
import { getBlockChainLogo, getLaunchpad, isNumber } from '@/utils/helpers.ts'
import { Link } from 'react-router-dom'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { MemeDto } from '@/@generated/gql/graphql-core.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { memo, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { TokenAvatarWithProgress } from '@components/discover/cards/TokenAvatarWithProgress.tsx'
import { NumberOfTransactionPill } from '@components/discover/NumberOfTransactionPill.tsx'
import { IconsGroup } from '@components/discover/IconsGroup.tsx'
import { cn, getPath } from '@/lib/utils.ts'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { getDexLogo } from '@/utils/lauchpad.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { CustomTooltipWrapper } from '@components/CustomTooltipWrapper.tsx'
import { IconCrown } from '@components/v2/ui-shared/icons/IconCrown.tsx'

import { MemeTokenWithFormatted } from '@/types/token.ts'
import Top10HoldersToastMessage from '../toasts/Top10HoldersToastMessage'
import SniperToastMessage from '../toasts/SniperToastMessage'
import InsiderToastMessage from '../toasts/InsiderToastMessage'
import SameSourceWalletToastMessage from '@components/discover/toasts/SameSourceWalletToastMessage.tsx'
import HolderToastMessage from '../toasts/HolderToastMessage'
import SmartMoneyToastMessage from '@components/discover/toasts/SmartMoneyToastMessage.tsx'
import LaunchedToastMessage from '@components/discover/toasts/LaunchedToastMessage.tsx'
import VolumeToastMessage from '@components/discover/toasts/VolumeToastMessage.tsx'
import TransactionToastMessage from '@components/discover/toasts/TransactionToastMessage.tsx'
import { useSubscription } from '@/lib/mqtt'
import { DevHoldToastMessage } from '@components/discover/toasts/DevHoldToastMessage.tsx'
import { memeTokenCache } from '@/utils/memeTokenCache'
import dayjs from 'dayjs'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import MCToastMessageMessage from '../toasts/MCToastMessage'
import { useTokenInfoFromUri } from '@pages/meme/discover/desktop/hooks/useTokenInfoFromUri.ts'
import { useRealtimeMemeTokenInfo } from '@hooks/meme/useRealtimeMemeTokenInfo.ts'
import { MemeTokenQuickBuyButton } from '@pages/meme/discover/desktop/components/MemeTokenQuickBuyButton.tsx'

export interface MemeTokenCardProps {
  token: MemeTokenWithFormatted
  timeframe: TimeframeOption
  showProgress?: boolean
  onAiClick?: (token: string) => void
  useFallbackLogo?: boolean
  ageType?: 'created' | 'migrated'
  type: 'new' | 'completing' | 'completed'
}

const getLaunchpadLogo = (token: MemeDto | MemeTokenWithFormatted) => {
  const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
  return launchpad ? getDexLogo(launchpad) : undefined
}

const getNumberOfTx = (token: MemeDto | MemeTokenWithFormatted, timeframe: TimeframeOption) => {
  switch (timeframe) {
    case '1m':
      return {
        buy: token.buyTxs1m,
        sell: token.sellTxs1m,
      }
    case '5m':
      return {
        buy: token.buyTxs5m,
        sell: token.sellTxs5m,
      }
    case '1h':
      return {
        buy: token.buyTxs1h,
        sell: token.sellTxs1h,
      }
    case '6h':
      return {
        buy: token.buyTxs6h,
        sell: token.sellTxs6h,
      }
    case '24h':
      return {
        buy: token.buyTxs24h,
        sell: token.sellTxs24h,
      }
    default:
      return {
        buy: 0,
        sell: 0,
      }
  }
}

type PropertyKey = 'top10' | 'sniper' | 'insider' | 'sameOrigin' | 'holder' | 'smartMoney' | 'devMigrated' | 'devHold'

const getIcon = (key: PropertyKey, warning?: boolean) => {
  switch (key) {
    case 'devHold':
      return (
        <img
          src={warning ? '/images/icons/ic-dev-hold-warning.svg' : '/images/icons/ic-dev-hold.svg'}
          className="size-3"
          alt=""
        />
      )
    case 'top10':
      return (
        <img
          src={warning ? '/images/discover/ic-top10-warning.svg' : '/images/discover/ic-top10-grad.svg'}
          className="size-3"
          alt=""
        />
      )
    case 'sniper':
      return (
        <img
          src={warning ? '/images/discover/ic-sniper-warning.svg' : '/images/discover/ic-sniper-grad.svg'}
          className="size-3"
          alt=""
        />
      )
    case 'insider':
      return (
        <img
          src={warning ? '/images/discover/ic-insider-warning.svg' : '/images/discover/ic-insider-grad.svg'}
          className="size-3"
          alt=""
        />
      )
    case 'sameOrigin':
      return (
        <img
          src={warning ? '/images/discover/ic-same-source-warning.svg' : '/images/discover/ic-same-source-grad.svg'}
          className="size-3"
          alt=""
        />
      )
    case 'holder':
      return <img src="/images/discover/ic-holder.svg" className="size-3" alt="" />
    case 'smartMoney':
      return <img src="/images/discover/ic-smart-money.svg" className="size-3" alt="" />
    default:
      return null
  }
}

const getTooltipContent = (itemKey: PropertyKey, token: MemeTokenWithFormatted) => {
  return () => {
    switch (itemKey) {
      case 'devHold': {
        const totalSupplyRaw = token.totalSupply ? +token.totalSupply : 0
        const decimals = token.decimals ? +token.decimals : 0
        const totalSupply = totalSupplyRaw / Math.pow(10, decimals)
        const devHoldBalance = token.devHoldBalance ? +token.devHoldBalance / Math.pow(10, decimals) : undefined
        return (
          <DevHoldToastMessage
            id="tooltip"
            totalSupply={totalSupply}
            devBalance={devHoldBalance}
            devPercent={token.devHold ? +token.devHold : undefined}
          />
        )
      }
      case 'top10': {
        const totalSupplyRaw = token.totalSupply ? +token.totalSupply : 0
        const decimals = token.decimals ? +token.decimals : 0
        const totalSupply = totalSupplyRaw / Math.pow(10, decimals)
        const top10Balance = token.top10Balance ? +token.top10Balance : undefined
        return (
          <Top10HoldersToastMessage
            id="tooltip"
            top10Percent={token.top10Holder}
            top10Amount={top10Balance}
            totalSupply={totalSupply}
          />
        )
      }
      case 'sniper':
        return (
          <SniperToastMessage
            id="tooltip"
            totalSupply={+token.totalSupply / Math.pow(10, token.decimals ? +token.decimals : 0)}
            numberOfHolders={token.numberOfHolder ? +token.numberOfHolder : undefined}
            sniperAmount={token.sniperHoldAmount ? +token.sniperHoldAmount : undefined}
            sniperCount={token.sniperCount ?? 0}
            sniperPercent={token.sniperHoldPct || 0}
          />
        )
      case 'insider': {
        const insiderHoldAmount = token.memeTooltip?.insiderHoldAmount
          ? +token.memeTooltip.insiderHoldAmount
          : undefined
        const decimals = token.decimals ? +token.decimals : 0
        const normalizedAmount = insiderHoldAmount ? insiderHoldAmount / Math.pow(10, decimals) : undefined
        return (
          <InsiderToastMessage
            id="tooltip"
            totalSupply={+token.totalSupply / Math.pow(10, token.decimals ? +token.decimals : 0)}
            insiderPercent={token.insider ? +token.insider : 0}
            insiderAmount={normalizedAmount}
            holderCount={token.numberOfHolder ? +token.numberOfHolder : undefined}
          />
        )
      }
      case 'sameOrigin': {
        const totalSupplyRaw = token.totalSupply ? +token.totalSupply : undefined
        const decimals = token.decimals ? +token.decimals : 0
        const totalSupply = totalSupplyRaw ? totalSupplyRaw / Math.pow(10, decimals) : undefined
        const bundlersHoldAmount = token.memeTooltip?.bundlerHoldAmount
          ? +token.memeTooltip.bundlerHoldAmount
          : undefined
        const normalizedAmount = bundlersHoldAmount ? bundlersHoldAmount / Math.pow(10, decimals) : undefined
        const bundlersCount = token.memeTooltip?.bundlerCount ? +token.memeTooltip.bundlerCount : undefined
        return (
          <SameSourceWalletToastMessage
            id="tooltip"
            totalSupply={totalSupply}
            bundlersPercent={token.bundlerHoldingPercent ? +token.bundlerHoldingPercent : undefined}
            bundlersAmount={normalizedAmount}
            bundlers={bundlersCount}
            totalHolders={token.numberOfHolder ? +token.numberOfHolder : undefined}
          />
        )
      }
      case 'holder':
        return <HolderToastMessage id="tooltip" />
      case 'smartMoney':
        return <SmartMoneyToastMessage id="tooltip" />
      case 'devMigrated':
        return <LaunchedToastMessage id="tooltip" />
      default:
        return null
    }
  }
}

const BottomSection = (props: { token: MemeTokenWithFormatted; type: 'new' | 'completing' | 'completed' }) => {
  const { token, type } = props

  // const handleClick = useCallback((event: MouseEvent) => {
  //   event.stopPropagation()
  //   event.preventDefault()
  // }, [])

  const leftItems = useMemo(() => {
    return [
      {
        key: 'devHold',
        icon: getIcon('devHold', !!token.devHold && token.devHold >= 20),
        tooltipContent: getTooltipContent('devHold', token),
        value: token.devHold !== undefined && token.devHold !== null ? formatPercentage(token.devHold) : '0%',
        isWarning: !!token.devHold && token.devHold >= 20,
      },
      {
        key: 'top10',
        icon: getIcon('top10', token.top10Holder >= 20),
        tooltipContent: getTooltipContent('top10', token),
        value: formatPercentage(token.top10Holder),
        isWarning: token.top10Holder >= 20,
      },
      {
        key: 'sniper',
        icon: getIcon('sniper', !!token.sniperHoldPct && +token.sniperHoldPct >= 20),
        tooltipContent: getTooltipContent('sniper', token),
        value: formatPercentage(token.sniperHoldPct || 0),
        isWarning: token.sniperHoldPct && +token.sniperHoldPct >= 20,
      },
      {
        key: 'insider',
        icon: getIcon('insider', !!token.insider && token.insider >= 20),
        tooltipContent: getTooltipContent('insider', token),
        value: formatPercentage(token.insider || 0),
        isWarning: !!token.insider && token.insider >= 20,
      },
      {
        key: 'sameOrigin',
        icon: getIcon('sameOrigin', !!token.sameSourceWallet && +token.sameSourceWallet >= 20),
        tooltipContent: getTooltipContent('sameOrigin', token),
        value: formatPercentage(token.sameSourceWallet ? +token.sameSourceWallet : 0),
        isWarning: !!token.sameSourceWallet && +token.sameSourceWallet >= 20,
      },
    ]
  }, [token])

  return (
    <div className="pb-1 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-1 border-t-[0.5px] border-[#1B1B1E] pt-1.5 mt-1.5">
        {leftItems.map((item) => (
          <CustomTooltipWrapper key={item.key} content={item.tooltipContent}>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full cursor-pointer bg-[#1A1A1E] h-[17px]">
              {item.icon}
              <span
                className={cn(
                  'text-[calc(11rem/16)] leading-2.5',
                  item.isWarning ? 'text-[#BE4561]' : 'text-[#41B489]',
                  !item.isWarning && item.key === 'devHold' && 'text-[#3895A3]',
                )}
              >
                {item.value}
              </span>
            </div>
          </CustomTooltipWrapper>
        ))}
      </div>

      {/*<QuickBuyButtonMemo token={token} className="h-[28px]" />*/}
      <MemeTokenQuickBuyButton token={token} allowMigratingState={type === 'completing'} />
    </div>
  )
}

const BottomSectionMemo = memo(BottomSection, (prevProps, nextProps) => {
  return (
    prevProps.token.token === nextProps.token.token &&
    prevProps.token.top10Holder === nextProps.token.top10Holder &&
    prevProps.token.sniperHoldPct === nextProps.token.sniperHoldPct &&
    prevProps.token.insider === nextProps.token.insider &&
    prevProps.token.sameSourceWallet === nextProps.token.sameSourceWallet &&
    prevProps.token.numberOfHolder === nextProps.token.numberOfHolder &&
    prevProps.token.smartMoneyHolder === nextProps.token.smartMoneyHolder &&
    prevProps.token.devMigrated === nextProps.token.devMigrated &&
    prevProps.token.devHold === nextProps.token.devHold &&
    prevProps.token.sameSourceWallet === nextProps.token.sameSourceWallet &&
    prevProps.type === nextProps.type
  )
})

type TokenInfoMqtt = {
  top10HolderPercentage?: string
  sniperPercentage?: string | undefined
  insiderTradingPercentage?: string | undefined
  sameSourceWallet?: string | undefined
  thb?: string // Top 10 Holder Balance
  dhp?: string // Dev Hold Percentage
  dhb?: string // Dev Hold Balance
  hc?: string // Holders Count
  dt?: string // Dev token launched
  dbp?: string // Same Source Wallet Percentage
  sniperHoldAmount?: string
  vl?: string // Volume
  mc?: string // Market Cap
  txb?: string // Buy Transactions
  txs?: string // Sell Transactions
  internalMarketProgress: string // Internal Market Progress
}

type NormalizedTokenInfo = {
  top10HolderPercentage?: number
  sniperPercentage?: number
  insiderTradingPercentage?: number
  sameSourceWallet?: number
  devHold?: number
  holders?: number
  devProjects?: number
}

type TokenInfoMqttPayload = TokenInfoMqtt | TokenInfoMqtt[]

type TokenStatisticMqttPayload = {
  chainId: number
  createdTime: string
  marketcap: string
  volume1h: string
  volume1m: string
  volume24h: string
  volume5m: string
  volume6h: string
  totalTransactions: {
    numberOfPurchases1h: number
    numberOfPurchases5m: number
    numberOfPurchases6h: number
    numberOfPurchases24h: number
    numberOfSales1h: number
    numberOfSales5m: number
    numberOfSales6h: number
    numberOfSales24h: number
  }
  numberOfHolder: number
}

type SmartMoneyMqttPayload = {
  tb: string
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

const calculateTop10HolderPercentage = (data: TokenInfoMqtt, totalSupply?: number): number | undefined => {
  if (data.top10HolderPercentage !== undefined) {
    return parseFloat(data.top10HolderPercentage) * 100
  }
  if (data.thb && totalSupply) {
    return (+data.thb / totalSupply) * 100
  }
  return undefined
}

const calculateDevHoldPercentage = (data: TokenInfoMqtt, totalSupply?: number): number | undefined => {
  if (data.dhp !== undefined) {
    return parseFloat(data.dhp) * 100
  }
  if (data.dhb && totalSupply) {
    return (+data.dhb / totalSupply) * 100
  }
  return undefined
}

const calculateSniperPercentage = (data: TokenInfoMqtt, totalSupply?: number, decimals?: number) => {
  if (data.sniperHoldAmount === undefined || data.sniperHoldAmount === null) return undefined
  if (!totalSupply || !decimals) return undefined
  return ((+data.sniperHoldAmount * 100) / totalSupply) * Math.pow(10, decimals)
}

const normalizeTokenInfo = (data: TokenInfoMqtt, token: MemeTokenWithFormatted): NormalizedTokenInfo => {
  const totalSupply = token.totalSupply ? +token.totalSupply : undefined
  // if (data.sniperHoldAmount) {
  //   console.table({
  //     symbol: token.symbol,
  //     address: token.token,
  //     ...data,
  //     totalSupply,
  //     sniperPct: calculateSniperPercentage(data, totalSupply, token.decimals ? +token.decimals : undefined),
  //     decimals: token.decimals,
  //   })
  // }
  return {
    top10HolderPercentage: calculateTop10HolderPercentage(data, totalSupply),
    sniperPercentage: data.sniperHoldAmount
      ? calculateSniperPercentage(data, totalSupply, token.decimals ? +token.decimals : undefined)
      : undefined,
    insiderTradingPercentage: data.insiderTradingPercentage
      ? parseFloat(data.insiderTradingPercentage) * 100
      : undefined,
    sameSourceWallet: data.dbp ? parseFloat(data.dbp) : undefined,
    devHold: calculateDevHoldPercentage(data, totalSupply),
    holders: data.hc ? parseFloat(data.hc) : undefined,
    devProjects: data.dt ? +data.dt : undefined,
  }
}

const env = import.meta.env.VITE_STAGE

const getTotalTx = (token: MemeTokenWithFormatted, timeframe: TimeframeOption) => {
  const numberOfTx = getNumberOfTx(token, timeframe)
  return {
    buy: numberOfTx.buy,
    sell: numberOfTx.sell,
    total: (numberOfTx.buy || 0) + (numberOfTx.sell || 0),
  }
}

const getTokenInfoTopicAgeLimit = (timeframe: TimeframeOption) => {
  switch (timeframe) {
    case '1m':
      return 60 // 1 minute
    case '5m':
      return 300 // 5 minutes
    case '1h':
      return 3600 // 1 hour
    default:
      return 3600 // Default to 1 hour for other timeframes
  }
}

const useStatistics = (original: MemeTokenWithFormatted, timeframe: TimeframeOption) => {
  const [token, setToken] = useState(original)
  const activeChainId = useActiveChainId()

  const topics = useMemo(() => {
    const now = dayjs()
    const createdAt = dayjs(original.createdTime)
    const duration = now.diff(createdAt, 'seconds')
    const limit = getTokenInfoTopicAgeLimit(timeframe)

    // If the token is created less than `limit` seconds ago, use the `public/meme/token_info` topic
    if (duration < limit) {
      return [
        `public/meme/token_info/${original.chainId}/${original?.token}`,
        `public/meme/token_sm_holding/${original.chainId}/${original.token}`,
      ]
    } else {
      return [
        `public/token_statistic/${activeChainId}/${original?.token}`,
        `public/meme/token_sm_holding/${original.chainId}/${original.token}`,
      ]
    }
  }, [token.createdTime])

  const { message } = useSubscription(topics)

  // Get cache when mount
  useEffect(() => {
    if (env !== 'prod' && !window.location.search.includes('cache=1')) return // Skip cache in non-production environments

    let isMounted = true
    memeTokenCache.get(original.token, 10000).then((cached) => {
      if (cached && isMounted) {
        setToken(cached)
      }
    })
    return () => {
      isMounted = false
    }
  }, [original.token])

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg || !message?.topic) return
    const topic = message.topic

    if (topic === `public/token_statistic/${activeChainId}/${original?.token}`) {
      const data: TokenStatisticMqttPayload = JSON.parse(msg)
      setToken((prevState) => ({
        ...prevState,
        ...data,
        buyTxs1h: data.totalTransactions?.numberOfPurchases1h
          ? Math.max(data.totalTransactions?.numberOfPurchases1h, prevState.buyTxs1h)
          : prevState.buyTxs1h,
        buyTxs5m: data.totalTransactions?.numberOfPurchases5m
          ? Math.max(data.totalTransactions?.numberOfPurchases5m)
          : prevState.buyTxs5m,
        buyTxs6h: data.totalTransactions?.numberOfPurchases6h
          ? Math.max(data.totalTransactions?.numberOfPurchases6h, prevState.buyTxs6h)
          : prevState.buyTxs6h,
        buyTxs24h: data.totalTransactions?.numberOfPurchases24h
          ? Math.max(data.totalTransactions?.numberOfPurchases24h, prevState.buyTxs24h)
          : prevState.buyTxs24h,
        sellTxs1h: data.totalTransactions?.numberOfSales1h
          ? Math.max(data.totalTransactions?.numberOfSales1h, prevState.sellTxs1h)
          : prevState.sellTxs1h,
        sellTxs5m: data.totalTransactions?.numberOfSales5m
          ? Math.max(data.totalTransactions?.numberOfSales5m)
          : prevState.sellTxs5m,
        sellTxs6h: data.totalTransactions?.numberOfSales6h
          ? Math.max(data.totalTransactions?.numberOfSales6h, prevState.sellTxs6h)
          : prevState.sellTxs6h,
        sellTxs24h: data.totalTransactions?.numberOfSales24h
          ? Math.max(data.totalTransactions?.numberOfSales24h, prevState.sellTxs24h)
          : prevState.sellTxs24h,
      }))
    } else if (topic === `public/meme/token_info/${original.chainId}/${original?.token}`) {
      const data: TokenInfoMqttPayload = JSON.parse(msg)
      let tokenInfo: TokenInfoMqtt
      const isArray = Array.isArray(data)
      if (isArray) {
        tokenInfo = data.reduce((acc, cur) => {
          return {
            ...acc,
            top10HolderPercentage: cur.top10HolderPercentage ?? acc.top10HolderPercentage,
            sniperPercentage: cur.sniperPercentage ?? acc.sniperPercentage,
            insiderTradingPercentage: cur.insiderTradingPercentage ?? acc.insiderTradingPercentage,
            sameSourceWallet: cur.sameSourceWallet ?? acc.sameSourceWallet,
            thb: cur.thb ?? acc.thb,
            dhp: cur.dhp ?? acc.dhp,
            dhb: cur.dhb ?? acc.dhb,
            hc: cur.hc ?? acc.hc,
            dt: cur.dt ?? acc.dt,
            dbp: cur.dbp ?? acc.dbp,
            sniperHoldAmount: cur.sniperHoldAmount ?? acc.sniperHoldAmount,
            txb: cur.txb ?? acc.txb,
            txs: cur.txs ?? acc.txs,
            mc: cur.mc ?? acc.mc,
            vl: cur.vl ?? acc.vl,
            internalMarketProgress: cur.internalMarketProgress ?? acc.internalMarketProgress,
          }
        }, {} as TokenInfoMqtt)
      } else {
        tokenInfo = data as TokenInfoMqtt
      }

      const normalizedTokenInfo = normalizeTokenInfo(tokenInfo, token)

      setToken((prevState) => ({
        ...prevState,
        top10Holder: normalizedTokenInfo.top10HolderPercentage ?? prevState.top10Holder,
        sniperHoldPct: normalizedTokenInfo.sniperPercentage ?? prevState.sniperHoldPct,
        insider: normalizedTokenInfo.insiderTradingPercentage ?? prevState.insider,
        sameSourceWallet: normalizedTokenInfo.sameSourceWallet
          ? normalizedTokenInfo.sameSourceWallet.toString()
          : prevState.sameSourceWallet,
        numberOfHolder: normalizedTokenInfo.holders ?? prevState.numberOfHolder,
        devHold: normalizedTokenInfo.devHold ?? prevState.devHold,
        devMigrated: normalizedTokenInfo.devProjects ?? prevState.devMigrated,
        buyTxs1m: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs1m) : prevState.buyTxs1m,
        buyTxs1h: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs1h) : prevState.buyTxs1h,
        buyTxs5m: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs5m) : prevState.buyTxs5m,
        buyTxs6h: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs6h) : prevState.buyTxs6h,
        buyTxs24h: tokenInfo.txb ? Math.max(+tokenInfo.txb, prevState.buyTxs24h) : prevState.buyTxs24h,
        sellTxs1m: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs1m) : prevState.sellTxs1m,
        sellTxs1h: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs1h) : prevState.sellTxs1h,
        sellTxs5m: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs5m) : prevState.sellTxs5m,
        sellTxs6h: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs6h) : prevState.sellTxs6h,
        sellTxs24h: tokenInfo.txs ? Math.max(+tokenInfo.txs, prevState.sellTxs24h) : prevState.sellTxs24h,
        marketcap: tokenInfo.mc ? parseNumber(tokenInfo.mc) : prevState.marketcap,
        volume5m: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume5m,
        volume1h: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume1h,
        volume1m: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume1m,
        volume6h: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume6h,
        volume24h: tokenInfo.vl ? parseNumber(tokenInfo.vl) : prevState.volume24h,
        internalMarketProgress: tokenInfo.internalMarketProgress ?? prevState.internalMarketProgress,
        sniperHoldAmount: tokenInfo.sniperHoldAmount ?? prevState.sniperHoldAmount,
        top10Balance: tokenInfo.thb ?? prevState.top10Balance,
        devHoldBalance: tokenInfo.dhb ?? prevState.devHoldBalance,
      }))
    } else if (topic === `public/meme/token_sm_holding/${original.chainId}/${original.token}`) {
      const data: SmartMoneyMqttPayload = JSON.parse(msg)
      setToken((prevState) => ({
        ...prevState,
        smartMoneyHolder: data.tb ? parseFloat(data.tb) : prevState.smartMoneyHolder,
      }))
    }
  }, [message])

  // Cache token when token is changed and not equal to original
  useEffect(() => {
    if (env !== 'prod' && !window.location.search.includes('cache=1')) return // Skip cache in non-production environments
    if (token && token !== original) {
      const shouldSkipCache =
        token.devHold === original.devHold &&
        token.top10Holder === original.top10Holder &&
        token.sniperHoldPct === original.sniperHoldPct &&
        token.insider === original.insider &&
        token.sameSourceWallet === original.sameSourceWallet &&
        token.numberOfHolder === original.numberOfHolder &&
        token.smartMoneyHolder === original.smartMoneyHolder &&
        token.devMigrated === original.devMigrated &&
        token.volume1h === original.volume1h &&
        token.volume1m === original.volume1m &&
        token.volume5m === original.volume5m &&
        token.volume6h === original.volume6h &&
        token.volume24h === original.volume24h
      if (!shouldSkipCache) {
        memeTokenCache.set(original.token, token, 10000) // Cache for 10 seconds
      }
    }
  }, [token, original])

  return token
}

export const MemeTokenCard = (props: MemeTokenCardProps) => {
  const {
    token: original,
    timeframe,
    showProgress,
    onAiClick,
    useFallbackLogo = true,
    ageType = 'created',
    type,
  } = props
  const token = useRealtimeMemeTokenInfo(original)
  const { t } = useTranslation()
  const launchpadLogo = getLaunchpadLogo(token)

  const { buy, sell } = getNumberOfTx(token, timeframe)

  const handleOnAiClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      onAiClick?.(token.token)
    },
    [onAiClick, token.token],
  )

  const tokenInfoFromUri = useTokenInfoFromUri(token)
  const tokenLogo = useMemo(() => {
    if (token.image) return token.image
    if (useFallbackLogo) {
      return getBlockChainLogo(token.chainId, token.token)
    }
    if (tokenInfoFromUri && tokenInfoFromUri.image) {
      return tokenInfoFromUri.image
    }
  }, [token.image, useFallbackLogo, tokenInfoFromUri, token.chainId, token.token])

  const socials = useMemo(() => {
    return {
      twitterUrl: tokenInfoFromUri?.twitterUrl || token?.twitterUrl,
      website: tokenInfoFromUri?.website || token?.website,
      tweetId: tokenInfoFromUri?.tweetId || token?.tweetId,
    }
  }, [tokenInfoFromUri, token])

  const date = useMemo(() => {
    return ageType === 'created' ? token.createdTime : token.migratedAt
  }, [ageType, token.createdTime, token.migratedAt])

  const rightItems = useMemo(() => {
    return [
      {
        key: 'holder',
        icon: getIcon('holder'),
        tooltipContent: getTooltipContent('holder', token),
        value:
          token.numberOfHolder !== undefined && token.numberOfHolder !== null
            ? fShortenNumber(token.numberOfHolder)
            : '0',
      },
      {
        key: 'smartMoney',
        icon: getIcon('smartMoney'),
        tooltipContent: getTooltipContent('smartMoney', token),
        value: token.smartMoneyHolder ? fShortenNumber(token.smartMoneyHolder) : '0',
      },
    ]
  }, [token])

  return (
    <TooltipProvider delayDuration={50}>
      <Link
        to={getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token.token, chain: CHAIN_SYMBOLS[token.chainId] })}
        state={{
          symbol: token?.symbol,
          tokenLogo,
          tokenName: token.name,
          isFavorite: token.isFavorite,
          createdTime: token.createdTime,
          address: token.token,
          devMigrated: token.devMigrated,
          chainId: token.chainId,
        }}
      >
        <div
          className="box-border rounded-[8px] rounded-br-0 rounded-bl-0 px-[12px] py-[10px]"
          style={{
            background: 'linear-gradient(180deg, #17171B 0%, #0A0A0A 100%)',
          }}
        >
          <div className="flex items-center">
            <div className="flex items-center flex-1">
              <TokenAvatarWithProgress
                tokenAvatar={tokenLogo}
                chainLogo={launchpadLogo}
                name={token.symbol as string}
                progress={+token.internalMarketProgress}
                showProgress={showProgress}
                subscriptionTopic={`public/meme/token_image/${token.chainId}/${token.token}`}
              />
              <div className="ml-2 flex-1 h-full">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-title max-w-12 truncate app-font-regular text-[calc(1rem*(13/16))] leading-3.25">
                    {token.symbol ?? '--'}
                  </span>
                  <CopyButton text={token.token} icon="/images/icons/ic-copy2.svg" className="!w-3 !h-3" type="tokenAddress" />
                  <div className="flex items-center space-x-1.5">
                    <button className="cursor-pointer size-4" onClick={handleOnAiClick}>
                      <AiIcon />
                    </button>
                    <IconsGroup
                      tokenAddress={token.token}
                      twitterUrl={socials.twitterUrl as string}
                      websiteUrl={socials.website as string}
                      twitterChangeCount={token.twitterNameChangeCount ? +token.twitterNameChangeCount : 0}
                      twitterPostId={socials.tweetId as string}
                      advertisesOnDex={token.advertisesOnDex ?? false}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 mb-1.5">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-pointer">
                        <TokenAge createdTime={date} allowOverrideStyle={false} className="text-[#00CE89]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {t(ageType === 'migrated' ? 'listCoin.tooltip.migratedAt' : 'listCoin.tooltip.createdAt')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <CustomTooltipWrapper content={getTooltipContent('devMigrated', token)}>
                    <div className="flex items-center gap-1">
                      <IconCrown
                        className={cn(
                          'size-3.5',
                          token.devMigrated && token.devMigrated >= 2 ? 'text-[#FACC14]' : 'text-[#878787]',
                        )}
                      />
                      <span className="text-[calc(10rem/16)] font-medium text-[#FFF] app-font-light">
                        {fShortenNumber(token.devMigrated ?? 0)}
                      </span>
                    </div>
                  </CustomTooltipWrapper>
                  {rightItems.map((item) => (
                    <CustomTooltipWrapper key={item.key} content={item.tooltipContent}>
                      <div className="flex items-center gap-1 cursor-pointer">
                        {item.icon}
                        <span className="text-[calc(11rem/16)] text-[#FFF] app-font-light">{item.value}</span>
                      </div>
                    </CustomTooltipWrapper>
                  ))}
                  <CustomTooltipWrapper
                    content={() => (
                      <TransactionToastMessage id="tooltip_tx" buy={buy} sell={sell} timeframe={timeframe} />
                    )}
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="text-[calc(11rem/16)] leading-3 text-[#CCCADB]">
                        <span className="text-[#908E98]">TX:</span> {getTotalTx(token, timeframe).total}
                      </div>
                      <NumberOfTransactionPill buy={buy} sell={sell} />
                    </div>
                  </CustomTooltipWrapper>
                </div>
              </div>
            </div>
            <div className="flex items-end flex-col gap-[6px]">
              <CustomTooltipWrapper content={() => <MCToastMessageMessage id="tooltip" timeframe={timeframe} />}>
                <div className="text-right flex gap-1 items-center">
                  <p className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-[#908E98]">MC: </p>
                  <MarketDisplay
                    value={parseNumber(token.marketcap || '0')}
                    className={'text-title text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] font-[380]'}
                    showColor={true}
                  />
                </div>
              </CustomTooltipWrapper>
              <CustomTooltipWrapper content={() => <VolumeToastMessage id="tooltip" timeframe={timeframe} />}>
                <div className="text-[calc(12rem/16)] leading-3 gap-1 flex items-center">
                  <span className="text-[calc(10rem/16)] text-[#908E98] font-[330]">VL: </span>
                  <span className="text-title text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] font-[380]">
                    {token[`volume${timeframe}`] ? `$${listCoinHelper.getVolumes(token, timeframe)}` : '$0'}
                  </span>
                </div>
              </CustomTooltipWrapper>
            </div>
          </div>
          <BottomSectionMemo token={token} type={type} />
        </div>
      </Link>
    </TooltipProvider>
  )
}
