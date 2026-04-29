import { MemeTokenWithFormatted } from '@/types/token.ts'
import { HoverableTokenAvatar } from '@pages/meme/discover/desktop/components/HoverableTokenAvatar.tsx'
import { useMemo, MouseEvent, ReactNode, useCallback } from 'react'
import { getBlockChainLogo, getLaunchpad } from '@/utils/helpers.ts'
import { TokenInfoFromUri, useTokenInfoFromUri } from '@pages/meme/discover/desktop/hooks/useTokenInfoFromUri.ts'
import { getDexLogo } from '@/utils/lauchpad.ts'
import { TimeframeOption } from '@components/discover/TimeframeSelector.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { IconsGroup } from '@components/discover/IconsGroup.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { useTranslation } from 'react-i18next'
import { getPath } from '@/lib/utils.ts'
import { MemeTokenStatisticRow } from '@pages/meme/discover/desktop/components/MemeTokenStatisticRow.tsx'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { FavoriteTokenIcon } from '@components/v2/ui-shared/components/FavoriteTokenIcon.tsx'
import { MemeTokenQuickBuyButton } from '@pages/meme/discover/desktop/components/MemeTokenQuickBuyButton.tsx'
import { MemeTokenMarketCap } from '@pages/meme/discover/desktop/components/atomic/MemeTokenMarketCap.tsx'
import { MemeTokenVolume } from '@pages/meme/discover/desktop/components/atomic/MemeTokenVolume.tsx'
import { TxRow } from '@pages/meme/discover/desktop/components/atomic/TxRow.tsx'
import { useAppSelector } from '@/redux/store'
import { selectFromMemeToken } from '@/redux/modules/memeTokenInfo.slice.ts'

export interface MemeTokenCardProps {
  token: MemeTokenWithFormatted
  useFallbackLogo?: boolean
  showProgress?: boolean
  timeframe?: TimeframeOption
  onAiClick?: (tokenAddress: string) => void
  ageType?: 'created' | 'migrated'
  onHideDev?: (devAddress: string) => void
  onHideToken?: (tokenAddress: string) => void
  getTooltipContent?: (token: MemeTokenWithFormatted) => string | ReactNode
  updatedAt?: number
  type: 'new' | 'completing' | 'completed'
}

interface AvatarProps {
  token: MemeTokenWithFormatted
  useFallbackLogo: boolean | undefined
  tokenInfoFromUri: TokenInfoFromUri | null | undefined
  onHideDev?: (devAddress: string) => void
  onHideToken?: (tokenAddress: string) => void
  showProgress: boolean | undefined
}

const Avatar = (props: AvatarProps) => {
  const { token, useFallbackLogo, tokenInfoFromUri, onHideToken, onHideDev, showProgress } = props
  const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
  const launchpadLogo = launchpad ? getDexLogo(launchpad) : undefined
  const tokenLogo = useMemo(() => {
    if (token?.avatarUrl && token?.avatarUrl !== '') return token?.avatarUrl
    if (token.image) return token.image
    if (useFallbackLogo) {
      return getBlockChainLogo(token.chainId, token.token)
    }
    if (tokenInfoFromUri && tokenInfoFromUri.image) {
      return tokenInfoFromUri.image
    }
  }, [token.image, useFallbackLogo, tokenInfoFromUri, token.chainId, token.token, token?.avatarUrl])

  const progress = useAppSelector(selectFromMemeToken(token.chainId, token.token, 'impp'))

  return (
    <HoverableTokenAvatar
      tokenAvatar={tokenLogo}
      thumbnailUrl={token?.avatarUrl ?? ''}
      chainLogo={launchpadLogo}
      name={token.symbol as string}
      progress={Number(progress || token.internalMarketProgress) || 0}
      showProgress={showProgress}
      onHideToken={() => onHideToken?.(token.token)}
      onHideDEV={() => onHideDev?.(token.creator ?? '')}
      address={token.token}
      chainId={token.chainId}
      subscriptionTopic={`public/meme/token_image/${token.chainId}/${token.token}`}
    />
  )
}

interface ProgressTooltipContentProps {
  token: MemeTokenWithFormatted
  customizeContent: (token: MemeTokenWithFormatted) => string | ReactNode
}

const ProgressTooltipContent = (props: ProgressTooltipContentProps) => {
  const { token, customizeContent } = props
  const { t } = useTranslation()

  const progress = useAppSelector(selectFromMemeToken(token.chainId, token.token, 'impp'))

  const realtimeProgress = Number(progress || token.internalMarketProgress) || 0

  return (
    <>
      {customizeContent ? (
        customizeContent(token)
      ) : (
        <span>
          {t('filter.internalProgress')}:{' '}
          {fShortenNumber(realtimeProgress, 2, {
            round: 'down',
          })}
          %
        </span>
      )}
    </>
  )
}

export const MemeTokenCard = (props: MemeTokenCardProps) => {
  const {
    token: original,
    useFallbackLogo,
    showProgress,
    onAiClick,
    timeframe = '1h',
    onHideDev,
    onHideToken,
    getTooltipContent,
    type,
  } = props
  // const token = useRealtimeMemeTokenInfo(original)
  const token = original
  const tokenInfoFromUri = useTokenInfoFromUri(token)
  const { t } = useTranslation()

  const tokenLogo = useMemo(() => {
    if (token?.avatarUrl && token?.avatarUrl !== '') return token?.avatarUrl
    if (token.image) return token.image
    if (useFallbackLogo) {
      return getBlockChainLogo(token.chainId, token.token)
    }
    if (tokenInfoFromUri && tokenInfoFromUri.image) {
      return tokenInfoFromUri.image
    }
  }, [token.image, useFallbackLogo, tokenInfoFromUri, token.chainId, token.token, token?.avatarUrl])

  const socials = useMemo(() => {
    return {
      twitterUrl: tokenInfoFromUri?.twitterUrl || token?.twitterUrl,
      website: tokenInfoFromUri?.website || token?.website,
      tweetId: tokenInfoFromUri?.tweetId || token?.tweetId,
    }
  }, [tokenInfoFromUri, token])

  const { buy, sell } = useMemo(() => {
    switch (timeframe) {
      case '1m':
        return {
          buy: token.buyTxs1m,
          sell: token.sellTxs1m,
          totalTx: (token.buyTxs1m || 0) + (token.sellTxs1m || 0),
        }
      case '5m':
        return {
          buy: token.buyTxs5m,
          sell: token.sellTxs5m,
          totalTx: (token.buyTxs5m || 0) + (token.sellTxs5m || 0),
        }
      case '1h':
        return {
          buy: token.buyTxs1h,
          sell: token.sellTxs1h,
          totalTx: (token.buyTxs1h || 0) + (token.sellTxs1h || 0),
        }
      case '6h':
        return {
          buy: token.buyTxs6h,
          sell: token.sellTxs6h,
          totalTx: (token.buyTxs6h || 0) + (token.sellTxs6h || 0),
        }
      case '24h':
        return {
          buy: token.buyTxs24h,
          sell: token.sellTxs24h,
          totalTx: (token.buyTxs24h || 0) + (token.sellTxs24h || 0),
        }
      default:
        return {
          buy: 0,
          sell: 0,
          totalTx: 0,
        }
    }
  }, [timeframe, token])

  const handleAiClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      onAiClick?.(token.token)
    },
    [onAiClick, token.token],
  )

  const volume = useMemo(() => {
    const key = `volume${timeframe}` as keyof MemeTokenWithFormatted
    return token[key] ? +token[key]! : 0
  }, [timeframe, token])

  const createdTime = useMemo(() => {
    if (type === 'completed') return original.migratedAt
    return original.createdTime
  }, [type, original])

  return (
    <TooltipProvider delayDuration={100}>
      <SimpleTooltip
        content={<ProgressTooltipContent token={token} customizeContent={getTooltipContent!} />}
        side="top"
      >
        <Link
          to={getPath(APP_PATH.MEME_TOKEN_DETAIL, {
            address: token.token,
            chain: CHAIN_SYMBOLS[token.chainId],
          })}
          state={{
            symbol: token.symbol,
            tokenLogo,
            tokenName: token.name,
            isFavorite: token.isFavorite,
            createdTime: original.createdTime,
            address: token.token,
            devMigrated: token.devMigrated,
            chainId: token.chainId
          }}
        >
          <div className="bg-gradient-to-b from-[#17171B] to-[#0A0A0A00] rounded-[6px] hover:bg-[#ECECED1F] cursor-pointer h-full">
            <div className="px-2.5 pt-2.5 pb-2 flex gap-2">
              <Avatar
                token={token}
                tokenInfoFromUri={tokenInfoFromUri}
                useFallbackLogo={useFallbackLogo}
                onHideToken={onHideToken}
                onHideDev={onHideDev}
                showProgress={showProgress}
              />
              <div className="flex-1">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-1 leading-4">
                    <div className="flex items-baseline gap-1">
                      <SimpleTooltip content={token.name}>
                        <span className="text-[calc(16rem/16)] leading-4 font-[380]">{token.symbol ?? '--'}</span>
                      </SimpleTooltip>
                      <SimpleTooltip content={t('listCoin.tooltip.tokenAddress', { token: token.token })}>
                        <div className="text-[calc(12rem/16)] leading-3 font-[330] text-[#FFFFFF80] truncate max-w-16 2xl:max-w-full">
                          {token.name}
                        </div>
                      </SimpleTooltip>
                    </div>
                    <SimpleTooltip content={t('listCoin.tooltip.copyAddress')}>
                      <div>
                        <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center" text={token.token} type="tokenAddress" />
                      </div>
                    </SimpleTooltip>
                  </div>
                  <FavoriteTokenIcon
                    key={`favorite-${original.token}-${original.isFavorite}`}
                    defaultValue={original.isFavorite}
                    token={token.token}
                    symbol={token.symbol}
                    triggerClassName="pt-0"
                  />
                </div>
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 flex flex-col justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <SimpleTooltip content={dayjs(createdTime).format('MM/DD HH:mm')}>
                        <div>
                          <TokenAge createdTime={createdTime} />
                        </div>
                      </SimpleTooltip>
                      <SimpleTooltip content={t('ai.onchainTextTitle')}>
                        <button className="cursor-pointer size-4" onClick={handleAiClick} aria-label="Button AI">
                          <AiIcon />
                        </button>
                      </SimpleTooltip>
                      <IconsGroup
                        tokenAddress={token.token}
                        twitterUrl={socials.twitterUrl as string}
                        websiteUrl={socials.website as string}
                        twitterChangeCount={token.twitterNameChangeCount ? +token.twitterNameChangeCount : 0}
                        twitterPostId={socials.tweetId as string}
                        advertisesOnDex={token.advertisesOnDex ?? false}
                      />
                    </div>
                    {/*<div className="flex items-center gap-2">*/}
                    {/*  <SimpleTooltip*/}
                    {/*    content={*/}
                    {/*      <DevMigratedTooltip*/}
                    {/*        devMigratedCount={token.devMigrated ? token.devMigrated : 0}*/}
                    {/*        devLaunched={token.devLaunched ? +token.devLaunched : 1}*/}
                    {/*      />*/}
                    {/*    }*/}
                    {/*  >*/}
                    {/*    <div className="flex items-center gap-1 border-r border-[#ECECED2E] pr-2">*/}
                    {/*      <IconCrown*/}
                    {/*        className={cn(*/}
                    {/*          token.devMigrated && token.devMigrated >= 2 ? 'text-[#FACC14]' : 'text-[#79778C]',*/}
                    {/*        )}*/}
                    {/*      />*/}
                    {/*      <span*/}
                    {/*        className={cn(*/}
                    {/*          'text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB]',*/}
                    {/*          // token.devMigrated && token.devMigrated >= 1 ? 'text-[#FBFBFB]' : 'text-[#79778C]',*/}
                    {/*        )}*/}
                    {/*      >*/}
                    {/*        {fShortenNumber(token.devMigrated ?? 0)}*/}
                    {/*      </span>*/}
                    {/*    </div>*/}
                    {/*  </SimpleTooltip>*/}
                    {/*  <SimpleTooltip content={t('listCoin.tooltip.holders')}>*/}
                    {/*    <div className="flex items-center gap-1">*/}
                    {/*      <img src="/images/discover/ic-holder.svg" className="size-3.5" alt="" />*/}
                    {/*      <span className="text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB] align-middle">*/}
                    {/*        {fShortenNumber(token.numberOfHolder || 0)}*/}
                    {/*      </span>*/}
                    {/*    </div>*/}
                    {/*  </SimpleTooltip>*/}
                    {/*  <SimpleTooltip content={t('listCoin.tooltip.smartMoneyPC')}>*/}
                    {/*    <div className="flex items-center gap-1">*/}
                    {/*      <img src="/images/discover/ic-sm2.svg" className="size-3.5" alt="" />*/}
                    {/*      <span className="text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB]">*/}
                    {/*        {fShortenNumber(token.smartMoneyHolder || 0)}*/}
                    {/*      </span>*/}
                    {/*    </div>*/}
                    {/*  </SimpleTooltip>*/}
                    {/*  <SimpleTooltip content={t('listCoin.tooltip.botTx')}>*/}
                    {/*    <IconWithValue*/}
                    {/*      icon={<IconBot className="text-[#878787] size-3.5" />}*/}
                    {/*      value={fShortenNumber(token.botHolder || 0)}*/}
                    {/*      className="text-[calc(12rem/16)] leading-3 font-medium text-[#FBFBFB]"*/}
                    {/*    />*/}
                    {/*  </SimpleTooltip>*/}
                    {/*  <SimpleTooltip*/}
                    {/*    content={*/}
                    {/*      <div className="text-[calc(12rem/16)] leading-[calc(12rem/16)] text-[#FFFFFF99] w-40 py-1 space-y-2.5">*/}
                    {/*        <div className="flex items-center gap-2 justify-between">*/}
                    {/*          <span>*/}
                    {/*            {timeframe} {t('listCoin.toasts.totalTransactions')}*/}
                    {/*          </span>*/}
                    {/*          <span className="text-[#FFFFFF]">{buy + sell}</span>*/}
                    {/*        </div>*/}
                    {/*        <div className="flex items-center gap-2 justify-between">*/}
                    {/*          <span>*/}
                    {/*            {timeframe}*/}
                    {/*            {t('listCoin.toasts.buyCount')}*/}
                    {/*          </span>*/}
                    {/*          <span className="text-[#00FFB4]">{buy}</span>*/}
                    {/*        </div>*/}
                    {/*        <div className="flex items-center gap-2 justify-between">*/}
                    {/*          <span>*/}
                    {/*            {timeframe}*/}
                    {/*            {t('listCoin.toasts.sellCount')}*/}
                    {/*          </span>*/}
                    {/*          <span className="text-[#F25461]">{sell}</span>*/}
                    {/*        </div>*/}
                    {/*      </div>*/}
                    {/*    }*/}
                    {/*  >*/}
                    {/*    <div className="flex items-center gap-1 cursor-pointer">*/}
                    {/*      <span className="text-[calc(12rem/16)] text-[#FFFFFF80]">TX</span>{' '}*/}
                    {/*      <div className="text-[calc(14rem/16)] leading-3.5">{totalTx}</div>*/}
                    {/*      <NumberOfTransactionPill buy={buy} sell={sell} progressClassName="rounded-0" />*/}
                    {/*    </div>*/}
                    {/*  </SimpleTooltip>*/}
                    {/*</div>*/}
                    <TxRow
                      devMigrated={token.devMigrated || 0}
                      devLaunched={token.devLaunched || 0}
                      numberOfHolder={token.numberOfHolder || 0}
                      smartMoneyHolder={token.smartMoneyHolder || 0}
                      botHolder={token.botHolder || 0}
                      buy={buy}
                      sell={sell}
                      timeframe={timeframe}
                      chainId={token.chainId}
                      tokenAddress={token.token}
                    />
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <MemeTokenMarketCap
                          chainId={token.chainId}
                          tokenAddress={token.token}
                          marketCap={token.marketcap ? +token.marketcap : 0}
                        />
                        <MemeTokenVolume
                          chainId={token.chainId}
                          tokenAddress={token.token}
                          volume={volume}
                          timeframe={timeframe}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-2.5 mb-2 flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-[#6C6A74] text-[calc(12rem/16)] mr-2 hidden 2xl:inline">
                  {formatAddressWallet(token.token, 4, 4)}
                </div>
                <MemeTokenStatisticRow
                  devHold={token.devHold ?? 0}
                  top10Holder={token.top10Holder}
                  sniperHoldPct={token.sniperHoldPct ?? 0}
                  insider={token.insider ?? 0}
                  bundlerHoldingPercent={token.bundlerHoldingPercent ? +token.bundlerHoldingPercent : 0}
                  token={token.token}
                  creator={token.creator}
                  chainId={token.chainId}
                  totalSupply={token.totalSupply ?? 0}
                />
              </div>
              <MemeTokenQuickBuyButton token={token} allowMigratingState={type === 'completing'} />
            </div>
          </div>
        </Link>
      </SimpleTooltip>
    </TooltipProvider>
  )
}
