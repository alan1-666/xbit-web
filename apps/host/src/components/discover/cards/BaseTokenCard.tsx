import { useTranslation } from 'react-i18next'
import { getBlockChainLogo, getLaunchpad } from '@/utils/helpers.ts'
import { useTrendChartData } from '@hooks/useTrendChartData.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import TrendChart from '@components/listCoin/card/TrendChart.tsx'
import { listCoinHelper } from '@/utils/list-coin-helper.ts'
import { TokenTrending } from '@/types/token.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { TokenAvatar } from '@components/discover/cards/TokenAvatar.tsx'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { QuickBuyButton } from '@components/discover/QuickBuyButton.tsx'
import { Link } from 'react-router-dom'
import { ReactNode, MouseEvent, useMemo } from 'react'
import { cn, getPath } from '@/lib/utils.ts'
import { IconsGroup } from '@components/discover/IconsGroup.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { getDexLogo } from '@/utils/lauchpad.ts'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { useAppSelector } from '@/redux/store'
import { TrendingScoreExplanation } from '@components/discover/cards/TrendingScoreExplanation.tsx'
import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { formatPercent } from '@/lib/format.ts'

export type SubItem = {
  label: string
  value: string | ReactNode
}

export interface BaseTokenCardProps {
  token: MemeDto
  timeframe: TimeframeOption
  subItems: SubItem[]
  disabled?: boolean
  showTrendingScore?: boolean
  showTrendingScoreDebug?: boolean
  onAiClick?: () => void
}

const getLaunchpadLogo = (token: MemeDto) => {
  const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
  return launchpad ? getDexLogo(launchpad) : undefined
}

const classNames4Cols = ['sm:col-span-3', 'sm:col-span-3', 'sm:col-span-2', 'sm:col-span-2 sm:text-end']

const TokenSymbol = (props: { symbol: string; tooltip: boolean; tooltipText?: string }) => {
  const { symbol, tooltip, tooltipText } = props

  if (!tooltip) {
    return (
      <span className="text-title app-font-regular text-[calc(1rem*(13/16))] leading-3.25 truncate">
        {symbol ?? '--'}
      </span>
    )
  }

  const preventTooltip = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="truncate text-left">
          <span className="text-title app-font-regular text-[calc(1rem*(13/16))] leading-3.25 truncate">
            {symbol ?? '--'}
          </span>
        </TooltipTrigger>
        <TooltipContent
          onClick={preventTooltip}
          className="bg-[linear-gradient(90deg,#A53EFF66_20%,#00F7A566_100%)] p-[1px] rounded-[4px]"
        >
          <p className="bg-[#141414] px-2 py-1 rounded-[4px]">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const BaseTokenCard = (props: BaseTokenCardProps) => {
  const {
    token,
    timeframe,
    subItems,
    disabled,
    showTrendingScore = false,
    showTrendingScoreDebug = false,
    onAiClick,
  } = props
  const { t } = useTranslation()
  const tokenLogo = token.avatarUrl || token.image || getBlockChainLogo(token.chainId, token.token)
  const tokenTrending = token as unknown as TokenTrending
  const { pricesData, volumesData, chartLength } = useTrendChartData({
    token: tokenTrending,
    timeframe: timeframe as string,
  })
  const launchpadLogo = getLaunchpadLogo(token)
  const trend = listCoinHelper.getTokenTrend(tokenTrending, timeframe)

  const handleAiClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    onAiClick?.()
  }

  const isXStock = token.name?.includes('xStock')

  const link = useMemo(() => {
    // TODO: Temporarily detect xStock token by name
    if (token.name?.includes('xStock')) {
      return getPath(APP_PATH.X_STOCK_DETAIL, { address: token.token, chain: CHAIN_SYMBOLS[token.chainId] })
    }
    return getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token.token, chain: CHAIN_SYMBOLS[token.chainId] })
  }, [token.token, token.chainId, token.name])

  const priceChangeColor = useAppSelector((state) => state.preference.priceChangeColor)
  const { downColor, upColor } = useMemo(() => {
    const isInverse = priceChangeColor === 'inverse'
    const upColor = isInverse ? '#EA3B4F' : '#00CE89'
    const downColor = isInverse ? '#00CE89' : '#EA3B4F'
    return {
      upColor,
      downColor,
    }
  }, [priceChangeColor])

  const priceChange = useMemo(() => {
    switch (timeframe) {
      case '1m':
        return token.price1mChange ? +token.price1mChange : undefined
      case '5m':
        return token.price5mChange ? +token.price5mChange : undefined
      case '1h':
        return token.price1hChange ? +token.price1hChange : undefined
      case '6h':
        return token.price6hChange ? +token.price6hChange : undefined
      case '24h':
        return token.price24hChange ? +token.price24hChange : undefined
      default:
        return undefined
    }
  }, [token, timeframe])

  return (
    <Link
      to={link}
      state={{
        symbol: token.symbol,
        tokenLogo,
        tokenName: token.name,
        isFavorite: token.isFavorite,
        createdTime: token.createdTime,
        address: token.token,
        chainId: token.chainId,
        tweetId: token.tweetId,
        twitterNameChangeCount: token.twitterNameChangeCount,
        advertisesOnDex: token.advertisesOnDex,
      }}
    >
      <div
        className={cn(
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          'box-border rounded-[8px] rounded-br-0 rounded-bl-0 px-[12px] py-[10px]',
        )}
        style={{
          background: 'linear-gradient(180deg, #17171B 0%, #0A0A0A 100%)',
        }}
      >
        <div className="flex items-center py-2">
          <div className="flex items-center flex-1">
            <TokenAvatar tokenAvatar={tokenLogo} chainLogo={launchpadLogo} name={token.symbol as string} />
            <div className="ml-2 flex-1 h-full max-w-[25vw] min-[375px]:max-w-[28vw] min-[380px]:max-w-fit">
              <div className="flex items-center gap-1.5 mb-1.5 leading-4 max-w-full">
                <TokenSymbol
                  symbol={token.symbol ?? '--'}
                  tooltip={showTrendingScore}
                  tooltipText={`${t('listCoin.trendingScore')}: ${token[`trendingScore${timeframe}`] ? fShortenNumber(token[`trendingScore${timeframe}`] as number) : '--'}`}
                />
                {isXStock && <IconXStock />}
                {showTrendingScoreDebug && <TrendingScoreExplanation token={token} />}
                <CopyButton text={token.token} icon="/images/icons/ic-copy2.svg" type="tokenAddress" />
                <div className="size-4">
                  <button className="cursor-pointer block size-4" onClick={handleAiClick}>
                    <AiIcon className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <TokenAge createdTime={token.createdTime} allowOverrideStyle={false} className="text-[#00CE89]" />
                <IconsGroup
                  tokenAddress={token.token}
                  twitterUrl={token.twitterUrl as string}
                  websiteUrl={token.website as string}
                  twitterPostId={token.tweetId as string}
                  twitterChangeCount={token.twitterNameChangeCount as number}
                  advertisesOnDex={token.advertisesOnDex ?? false}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* <div className="mr-1 text-right">
              <MarketDisplay
                value={parseNumber(token.marketcap)}
                className={'text-title text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] font-bold mb-1'}
                showColor
              />
              <p className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-(--text-tertiary)">
                {t('listCoin.columns.marketCap')}
              </p>
            </div> */}
            <TrendChart
              lineData={pricesData}
              barData={volumesData}
              barLength={chartLength}
              glowingEffect
              trend={trend}
            />
            <p
              className={cn('text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] font-[380]')}
              style={{
                color: trend === 'up' ? upColor : downColor,
              }}
            >
              {formatPercent(priceChange, { showSign: true })}
            </p>
            <QuickBuyButton token={token} className="md:ml-1 h-[28px]" />
          </div>
        </div>
        <div className="flex justify-between sm:grid sm:grid-cols-10 border-[#1C1B1F] border-t-[0.5px] pt-[8.5px]">
          {subItems.map((subItem, index) => (
            <div key={index} className={cn('pb-1', classNames4Cols[index])}>
              <div className="text-[#565563] text-[calc(1rem*(10/16))] leading-[calc(1rem*(11/16))] h-4 break-keep">
                <span className="font-[330]">{subItem.label}: </span>
                <span className="text-[calc(1rem*(10/16))] font-[380] text-[#CCCADB]">{subItem.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}
