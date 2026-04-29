import { DevAction, TokenDetail, TokenPortrait } from '@/@generated/gql/graphql-future'
import { X_STOCK_TAG } from '@/lib/constant.ts'
import eventBus from '@/lib/eventBus'
import { formatAmount, formatPercent, formatVolume } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { formatAddressWallet } from '@/lib/string'
import { cn } from '@/lib/utils.ts'
import { ChainIds } from '@/types/enums'
import { favoriteEvents } from '@/utils/favoriteEvents'
import { getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { formatPercentage } from '@/utils/helpers.ts'
import { ttlStorage } from '@/utils/meme/ttlStorage'
import { useQuery } from '@apollo/client'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import ContractMonitoring from '@components/detailInfo/contractMonitoring/index.tsx'
import IconsDrawer from '@components/detailInfo/IconsDrawer.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { FavoriteTokenIcon } from '@components/v2/ui-shared/components/FavoriteTokenIcon.tsx'
import { IconEyeClose } from '@components/v2/ui-shared/icons/IconEyeClose.tsx'
import { IconIgnoreDev } from '@components/v2/ui-shared/icons/IconIgnoreDev.tsx'
import { useRealtimeTokenInfo } from '@hooks/useRealtimeTokenInfo.ts'
import { AiAnalysisSheet, AiAnalysisSheetHandle } from '@pages/meme/discover/desktop/components/AiAnalysisSheet.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import { getTokenPortrait } from '@services/tokens.service.ts'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PriceToken from './PriceTokenPC'
import TokenAge from './TokenAge'
import TokenHealth from './TokenHealth'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TokenDetailState } from '@/redux/modules/tokenDetail.slice.ts'
import { RootState, useAppSelector } from '@/redux/store'
import ShareBottomSheet from '@components/common/ShareBottomSheet.tsx'
import { formatPriceAsTitle } from '@components/TokenPageTitle/index.tsx'
import {
  useRemoveBlacklistDevsMutation,
  useRemoveBlacklistTokensMutation,
} from '@pages/meme/discover/desktop/hooks/useRemoveBlacklistAddressesMutation.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { toast } from 'sonner'
import { HoverableTokenAvatar } from '@pages/meme/discover/desktop/components/HoverableTokenAvatar.tsx'
import { IconCrown } from '@components/v2/ui-shared/icons/IconCrown.tsx'
import useWatchLiquidity from '@/hooks/useWatchLiquidity'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { activeChainToChainIds } from '@/utils/chain.ts'
import { useSearchParams } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export const EVENT_MESSAGE_FAVORITE = 'EVENT_MESSAGE_FAVORITE'

export interface HeaderDetailInfoProps {
  tokenData: TokenDetail
}

const useTokenPortrait = (address: string | null | undefined, chainId: number | null | undefined) => {
  const { data } = useQuery(getTokenPortrait, {
    variables: {
      input: {
        address: address!,
        chainId: chainId!,
      },
    },
    skip: !address || !chainId,
    client: futureClient,
  })
  return useMemo(() => {
    if (!data || !data.getTokenPortrait) return undefined
    return data.getTokenPortrait
  }, [data])
}

const DevActionTooltip = (props: { devAction: DevAction | undefined }) => {
  const { devAction } = props
  const { t } = useTranslation()

  const text = useMemo(() => {
    switch (devAction) {
      case DevAction.AddLiquidity:
        return t('detail.tags.addLiquidity')
      case DevAction.Burnt:
        return t('detail.tags.burnt')
      case DevAction.Hold:
        return t('detail.tags.hold')
      case DevAction.RemoveLiquidity:
        return t('detail.tags.removeLiquidity')
      case DevAction.SellAll:
        return t('detail.tags.sellAll')
      default:
        return ''
    }
  }, [devAction, t])

  const tooltipText = useMemo(() => {
    switch (devAction) {
      case DevAction.AddLiquidity:
        return t('detail.tooltip.devAddLiq')
      case DevAction.Burnt:
        return t('detail.tooltip.burn')
      case DevAction.Hold:
        return t('detail.tooltip.devHold')
      case DevAction.RemoveLiquidity:
        return t('detail.tooltip.devRemoveLiq')
      case DevAction.SellAll:
        return t('detail.tooltip.sellAll')
      default:
        return ''
    }
  }, [devAction, t])

  if (!devAction) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'text-[calc(1rem*(10/16))] leading-[1]',
              devAction === DevAction.Hold ? 'text-rise' : 'text-fall',
            )}
          >
            {text}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface DetailInfoProps {
  tokenData: TokenDetail
  tokenPortrait?: TokenPortrait
}

const InternalMarketProgress = (props: DetailInfoProps) => {
  const { tokenData } = props
  const { t } = useTranslation()
  const isMigrated = tokenData?.isMigrated
  const realtimeTokenInfo = useRealtimeTokenInfo(tokenData?.address)

  const internalMarketProgress = useMemo(() => {
    if (!realtimeTokenInfo) return Number(tokenData?.internalMarketProgress ?? 0)
    const progress = Number(realtimeTokenInfo.internalMarketProgress ?? tokenData?.internalMarketProgress ?? 0)
    return Math.max(0, Math.min(progress, 100))
  }, [realtimeTokenInfo, tokenData])

  return (
    <>
      {Number(internalMarketProgress) === 100 ? (
        !isMigrated && <span className="text-[11px] leading-[1] text-[#FFFFFF99]">{t('listCoin.toBeOpened')}</span>
      ) : (
        <div className="flex items-center gap-1">
          {/*progress*/}
          <div className="relative w-5 h-1 rounded-full bg-[#00FFB433]">
            <div
              style={{ width: `${internalMarketProgress}%` }}
              className="abosolute top-0 left-0 z-1 h-1 rounded-full bg-[#00CE89]"
            ></div>
          </div>
          <span className="text-[11px] leading-[1]">
            {`${t('detail.tokenDetail.internalDisk')} ${formatPercent(internalMarketProgress)}`}
          </span>
        </div>
      )}
    </>
  )
}

const DevMigratedInfo = (props: { migratedCount: number }) => {
  const { migratedCount } = props
  const [_, setSearchParams] = useSearchParams()
  const [migratedTokens, setMigratedTokens] = useState<number>(migratedCount)

  useEffect(() => {
    setMigratedTokens(migratedCount)
  }, [migratedCount])

  const handleOpenMigratedInfo = () => {
    setSearchParams({ tab: 'devTokens' })
  }

  useEffect(() => {
    eventBus.on('devTotalMigratedUpdate', (data: { data: { totalMigrated: number } }) => {
      setMigratedTokens(data?.data?.totalMigrated || 0)
    })
  }, [])
  const { t } = useTranslation()
  return (
    <TooltipProvider>
      <SimpleTooltip content={t('detail.tokenDetail.totalMigratedTokensTooltip')}>
        <div className="flex items-center gap-0.5 cursor-pointer whitespace-nowrap" onClick={handleOpenMigratedInfo}>
          <IconCrown
            className={cn('size-4', migratedTokens && +migratedTokens > 1 ? 'text-[#FACC14]' : 'text-[#79778C]')}
          />
          {t('detail.devProjects.migrated')} {migratedTokens ?? 0}
        </div>
      </SimpleTooltip>
    </TooltipProvider>
  )
}

export const HeaderDetailInfo = (props: HeaderDetailInfoProps) => {
  const { state } = useLocation()
  const {
    tokenLogo: tokenLogoFormState,
    symbol: tokenSymbolFormState,
    tokenName,
    isFavorite: isFavoriteFormState,
    createdTime,
    address,
    devMigrated,
    chainId,
  } = state || {}
  const { t } = useTranslation()
  const { tokenData } = props
  const activeWallet = useActiveWallet()
  const { addTokens, addDevs, removeTokens, removeDevs, blacklistTokens, blacklistDevs } = useAllBacklistAddresses()
  const tokenPortrait = useTokenPortrait(tokenData?.address, tokenData?.chainId)
  const tokenSymbol = tokenSymbolFormState ? tokenSymbolFormState : (tokenData?.symbol ?? '--')
  const tokenAddress = address ? address : (tokenData?.address ?? '--')
  const isXStock = tokenData?.tags?.includes(X_STOCK_TAG)
  const chain = chainId ? chainId : tokenData?.chainId ? Number(tokenData?.chainId) : undefined

  const tokenLogo = tokenLogoFormState
    ? tokenLogoFormState
    : tokenData?.info?.avatarUrl ||
      tokenData?.info?.logoUrl ||
      getBlockChainLogo(chain as ChainIds, tokenData?.address ?? '')

  const chainLogo = getBlockchainLogo2(chain)
  const metadataCustom = Boolean(tokenData?.metadataCustom?.isOfficial)
  const devActions = tokenPortrait?.devAction || []
  // const numberProTrader = tokenData?.numberProTrader ?? 0
  const aiRef = useRef<AiAnalysisSheetHandle>(null)
  const [openContractMonitoring, setOpenContractMonitoring] = useState<boolean>(false)
  const [openShareToken, setOpenShareToken] = useState(false)

  const [isLowLiquidity, setIsLowLiquidity] = useState(false)
  const { dataLp, isLowLp } = useWatchLiquidity({
    token: tokenData?.address ?? '',
    chainId: chainId ?? ChainIds.Solana,
  })
  const [liquidity, setLiquidity] = useState<number | undefined>(0)

  const removeTokensFromBlacklist = useRemoveBlacklistTokensMutation()
  const removeDevsFromBlacklist = useRemoveBlacklistDevsMutation()
  const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)
  useEffect(() => {
    if (!tokenPortrait) return
    setIsLowLiquidity(tokenPortrait.lowLiquidity ?? false)
  }, [tokenPortrait])
  useEffect(() => {
    const hasDataLp = liquidity !== null && liquidity !== undefined

    if (!hasDataLp) return

    // Normalize liquidity
    const numericLp = typeof liquidity === 'number' ? liquidity : hasDataLp ? Number(liquidity) : undefined

    const lowLpFromData = typeof numericLp === 'number' && !Number.isNaN(numericLp) ? numericLp < 4000 : undefined

    // Priority: message flag > numeric lp > default false
    setIsLowLiquidity(isLowLp ?? lowLpFromData ?? false)
  }, [isLowLp, liquidity])

  const handleRenderTagDevAction = (tag: DevAction | undefined): string => {
    if (!tag) return ''
    switch (tag) {
      case DevAction.AddLiquidity:
        return t('detail.tags.addLiquidity')
      case DevAction.Burnt:
        return t('detail.tags.burnt')
      case DevAction.Hold:
        return t('detail.tags.hold')
      case DevAction.RemoveLiquidity:
        return t('detail.tags.removeLiquidity')
      case DevAction.SellAll:
        return t('detail.tags.sellAll')
      default:
        return ''
    }
  }
  const latestDevAction = devActions.length > 0 ? devActions[devActions.length - 1] : undefined
  const tagDevAction = handleRenderTagDevAction(devActions.length > 0 ? devActions[devActions.length - 1] : undefined)
  const [isFavorite, setIsFavorite] = useState<boolean>(isFavoriteFormState)
  const FAVORITE_CACHE_KEY = `favorite_token_${tokenData?.address}`
  useEffect(() => {
    if (!activeWallet?.isConnected) {
      setIsFavorite(false)
      return
    }
    ttlStorage.get<boolean>(FAVORITE_CACHE_KEY).then((cachedFavorite) => {
      if (cachedFavorite !== null) {
        setIsFavorite(cachedFavorite)
      } else {
        setIsFavorite(tokenData?.isFavorite || false)
      }
    })

    // Listen for favorite change events
    const handleFavoriteChange = (tokenAddress: string, isFavorite: boolean) => {
      if (tokenAddress === tokenData?.address) {
        setIsFavorite(isFavorite)
      }
    }

    favoriteEvents.addListener(handleFavoriteChange)

    return () => {
      favoriteEvents.removeListener(handleFavoriteChange)
    }
  }, [tokenData, FAVORITE_CACHE_KEY, activeWallet])

  // const { price: ohlcPrice } = useAppSelector((state: RootState) => state.tokenDetail as TokenDetailState)

  useEffect(() => {
    if (tokenData) {
      eventBus.on(EVENT_MESSAGE_FAVORITE, (data: any) => {
        if (data?.data?.token === tokenData?.address) {
          setIsFavorite(data?.data?.isFavorite)
        }
      })
      return () => {
        eventBus.remove(EVENT_MESSAGE_FAVORITE)
      }
    }
  }, [tokenData])

  const handleAiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    aiRef.current?.open(tokenAddress)
  }

  const handleAddBlacklistToken = useCallback(() => {
    if (!activeWallet?.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      return
    }
    if (!tokenData?.address) return
    addTokens([tokenData.address])
  }, [activeWallet, addTokens, t, tokenData?.address])

  const handleAddBlacklistDev = useCallback(() => {
    if (!activeWallet?.isConnected) {
      toast.error(t('appSettings.loginRequired'))
      return
    }
    if (!tokenData?.creator) {
      toast.error(t('listCoin.blacklist.devAddressMissing'))
      return
    }
    addDevs([tokenData.creator])
  }, [activeWallet, addDevs, t, tokenData?.creator])

  const removeBlacklistTokens = useCallback(
    (tokens: string[]) => {
      if (!activeWallet?.isConnected) {
        toast.error(t('appSettings.loginRequired'))
        return
      }
      removeTokensFromBlacklist.mutate(tokens)
      removeTokens(tokens)
      if (tokens.length === 1) {
        toast.success(t('listCoin.blacklist.removedFromBlacklist', { address: formatAddressWallet(tokens[0]) }))
        return
      }
      toast.success(t('listCoin.blacklist.deleteSuccess'))
    },
    [activeWallet, removeTokens, t],
  )

  const removeBlacklistDevs = useCallback(
    (devs: string[]) => {
      if (!activeWallet?.isConnected) {
        toast.error(t('appSettings.loginRequired'))
        return
      }
      removeDevsFromBlacklist.mutate(devs)
      removeDevs(devs)
      if (devs.length === 1) {
        toast.success(t('listCoin.blacklist.removedFromBlacklist', { address: formatAddressWallet(devs[0]) }))
        return
      }
      toast.success(t('listCoin.blacklist.deleteSuccess'))
    },
    [activeWallet, removeDevs, t],
  )

  const launchpad = getLaunchpad(tokenData?.dexes ?? [])

  const isBlacklistToken = useMemo(() => {
    if (!tokenData?.address) return false
    return blacklistTokens.some((blacklist) => blacklist.address.toLowerCase() === tokenData.address?.toLowerCase())
  }, [blacklistTokens, tokenData])

  const isBlacklistDev = useMemo(() => {
    if (!tokenData?.creator) return false
    return blacklistDevs.some((blacklist) => blacklist.address.toLowerCase() === tokenData.creator?.toLowerCase())
  }, [blacklistDevs, tokenData])

  const shareTitle = useMemo(() => {
    const price = ohlcPrice ? ohlcPrice?.toString() : tokenData?.price ? tokenData?.price.toString() : undefined
    return `${tokenData?.symbol} ${formatPercentage(tokenData?.price24hChange)} in 24h, price ${formatPriceAsTitle(price)} \nPower by Xbit! \n#${tokenData?.symbol} #XBIT`
  }, [tokenData, ohlcPrice])

  useEffect(() => {
    if (tokenData?.liquidity) {
      setLiquidity(tokenData?.liquidity)
    }
  }, [tokenData?.liquidity])

  useEffect(() => {
    if (dataLp) {
      setLiquidity(Number(dataLp))
    }
  }, [dataLp])

  // const [liquidity, setLiquidity] = useState<number | undefined>(0)
  //
  // useEffect(() => {
  //   if (tokenData?.liquidity) {
  //     setLiquidity(tokenData?.liquidity)
  //   }
  // }, [tokenData?.liquidity])

  // const { dataLp } = useWatchLiquidity({ token: tokenData?.address ?? '', chainId: chainId ?? ChainIds.Solana })

  // const dataLpRef = useRef(liquidity)

  // useEffect(() => {
  //   console.log('Updating dataLpRef:', liquidity)
  //   dataLpRef.current = liquidity
  // }, [liquidity])
  //
  // useEffect(() => {
  //   eventBus.on('REQUEST_LIQUIDITY', (data: { token: string }) => {
  //     if (data?.token === tokenData?.address) {
  //       console.log('Responding to REQUEST_LIQUIDITY for token:', data, 'Liquidity:', dataLpRef.current)
  //       eventBus.dispatch('RETURN_LIQUIDITY', { data: { liquidity: dataLpRef.current } } )
  //     }
  //   })
  // }, [tokenData?.address])

  // useEffect(() => {
  //   if (dataLp) {
  //     setLiquidity(dataLp)
  //   }
  // }, [dataLp])

  const handleClickShare = () => {
    const currentLink = window.location.origin + window.location.pathname
    navigator.clipboard
      .writeText(`${currentLink}`)
      .then(() => {
        toast.success(t('detail.myPositions.copyUrlSuccess'))
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  // const isMigrated = tokenData?.isMigrated
  const isShowLiquid = (isLowLiquidity && launchpad) || (isLowLiquidity && !launchpad) // show low liquidity when in launchpad or not in launchpad
  return (
    <div className="w-full h-full overflow-x-auto no-scrollbar border-[0.5px] border-[#ECECED14]">
      {/* <TokenAlert tokenData={tokenData} tokenPortrait={tokenPortrait} /> */}
      <div className="flex items-center justify-between px-4 py-3 gap-4 h-full min-w-fit">
        <div className="flex items-center gap-2 min-w-fit">
          <FavoriteTokenIcon
            key={`favorite-${tokenData?.address}-${isFavorite}`}
            defaultValue={isFavorite}
            token={tokenData?.address ?? ''}
            symbol={tokenData?.symbol ?? ''}
            onAdded={() => setIsFavorite(true)}
            onRemoved={() => setIsFavorite(false)}
          />
          {/*<TokenLogo tokenLogo={tokenLogo} tokenSymbol={tokenSymbol} chainLogo={chainLogo} />*/}
          <TooltipProvider>
            <HoverableTokenAvatar
              address={address ?? tokenData?.address}
              chainId={tokenData?.chainId}
              progress={0}
              showProgress={false}
              allowBlacklist={false}
              showSimilarTokens={false}
              tokenAvatar={tokenLogo}
              chainLogo={chainLogo}
              className="size-11.5"
              avatarClassName="size-11.5"
              name={tokenData?.symbol}
              subscriptionTopic={
                tokenData ? `public/meme/token_image/${chain}/${address ?? tokenData.address}` : undefined
              }
            />
          </TooltipProvider>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[16px] font-[450] leading-none">{tokenSymbol}</span>
              <span className="text-white/50 text-[12px] font-[330] leading-none">{tokenName ?? tokenData?.name}</span>
              {tokenData?.isOG ? (
                <TooltipProvider>
                  <SimpleTooltip content={t('detail.tags.og')}>
                    <div className="bg-[#00FFB41A] px-1 py-0.5 rounded-[4px] font-[330] text-[calc(10rem/16)] text-[#21E09D]">
                      OG
                    </div>
                  </SimpleTooltip>
                </TooltipProvider>
              ) : null}
              {isXStock && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img
                        src="/images/icons/brands/xstock.svg"
                        className="size-2.5 cursor-pointer"
                        alt="icon xstock"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
                        {t('xstocks.tooltip.powerByXStocks')}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {(metadataCustom || isXStock) && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img src="/images/icons/icon-official.svg" className="size-4" alt="icon official" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
                        {t('detail.tags.official')}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <button aria-label="AI analysis" className="cursor-pointer size-4" onClick={handleAiClick}>
                <AiIcon />
              </button>
              {tokenData?.isHotToken && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img
                        src="/images/tokenDetail/icon-hot.svg"
                        className="w-[7.59px] min-w-[7.59px] cursor-pointer"
                        alt=""
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="bg-[#111] px-1 py-0.5 rounded text-[11px] leading-[1] app-font-regular text-white/80">
                        {t('detail.tooltip.hotToken')}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <DevActionTooltip devAction={latestDevAction} />
              {!!launchpad ? <InternalMarketProgress tokenData={tokenData} /> : null}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {createdTime || tokenData?.createdTime ? (
                <TokenAge
                  createdTime={createdTime ?? tokenData?.createdTime}
                  className="text-[12px] font-[330] text-[#00CE89] leading-none"
                />
              ) : (
                <span className="text-[12px] font-[330] text-[#00CE89] leading-none">--</span>
              )}
              <div className="flex items-center gap-[3px]">
                <div className="text-[12px] text-white/50 font-[330] leading-none">
                  {formatAddressWallet(tokenAddress, 5, 5)}
                </div>
                <CopyButton
                  icon="/images/tokenDetail/icon-copy.webp"
                  className="w-[14px] min-w-[14px] h-[14px]"
                  text={tokenAddress}
                  type="tokenAddress"
                />
              </div>
              {/*{twitterPostId && <EmbeddedTwitterPost tweetId={twitterPostId} />}*/}
              <IconsDrawer
                tokenData={tokenData}
                tagDevAction={tagDevAction}
                tokenPortrait={tokenPortrait}
                hideSearchToken={true}
              />
              <div className="border-l pl-2 ml-1 text-[calc(12rem/16)] leading-3 font-[330] text-[#908E98] flex items-center gap-2">
                <TooltipProvider>
                  <SimpleTooltip content={t('detail.tokenDetail.searchByNameTooltip')}>
                    <div className="min-w-fit">
                      <a
                        href={`https://x.com/search?q=${tokenData?.symbol}`}
                        className="flex items-center gap-0.5 min-w-fit"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src="/images/tokenDetail/icon-search.svg" alt="" className="size-4" />
                        <span>{t('detail.tokenDetail.searchByName')}</span>
                      </a>
                    </div>
                  </SimpleTooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <SimpleTooltip content={t('detail.tokenDetail.searchByTokenTooltip')}>
                    <div className="min-w-fit">
                      <a
                        href={`https://x.com/search?q=${tokenData?.address}`}
                        className="flex items-center gap-0.5"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src="/images/tokenDetail/icon-search.svg" alt="" className="size-4" />
                        <span>{t('detail.tokenDetail.searchByToken')}</span>
                      </a>
                    </div>
                  </SimpleTooltip>
                </TooltipProvider>
                {/*<TooltipProvider>*/}
                {/*  <SimpleTooltip content={t('detail.tokenDetail.totalMigratedTokensTooltip')}>*/}
                {/*    <div className="flex items-center gap-0.5 cursor-pointer" onClick={handleOpenMigratedInfo}>*/}
                {/*      <IconCrown*/}
                {/*        className={cn(*/}
                {/*          'size-4',*/}
                {/*          tokenData?.numberMigratedTokenByDev && +tokenData?.numberMigratedTokenByDev > 1*/}
                {/*            ? 'text-[#FACC14]'*/}
                {/*            : 'text-[#79778C]',*/}
                {/*        )}*/}
                {/*      />*/}
                {/*      {t('detail.devProjects.migrated')} {tokenData?.numberMigratedTokenByDev ?? 0}*/}
                {/*    </div>*/}
                {/*  </SimpleTooltip>*/}
                {/*</TooltipProvider>*/}
                <DevMigratedInfo migratedCount={tokenData?.numberMigratedTokenByDev ?? 0} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PriceToken
            token={address ?? tokenData?.address}
            initialPrice={tokenData?.openPrice24h}
            price={tokenData?.price}
            totalSupply={tokenData?.totalSupply}
          />
          <div className="ml-2 flex flex-col items-start justify-start gap-2">
            <div className="font-[330] text-[12px] text-white/36 leading-none flex items-center gap-0.5">
              <span>{t('detail.header.liquidity')}</span>
              {isShowLiquid && (
                <TooltipProvider>
                  <SimpleTooltip content={t('iconsDrawer.lowLiquidity')}>
                    <div>
                      <img src="/images/icons/danger.svg" alt="icon alert" className="size-4 pl-0.5" />
                    </div>
                  </SimpleTooltip>
                </TooltipProvider>
              )}
            </div>
            <span className="text-[13px] font-[380] leading-none text-white">
              {formatVolume(liquidity ?? 0, {
                showCurrency: true,
              })}
            </span>
          </div>
          <div className="pl-4 border-l-[0.5px] border-l-[#ECECED1F] flex flex-col items-start justify-start gap-2">
            <div className="font-[330] text-[12px] text-white/36 leading-none">{t('detail.header.totalSupply')}</div>
            <span className="text-[13px] font-[380] leading-none text-white">
              {formatVolume(tokenData?.totalSupply)}
            </span>
          </div>
          <div className="pl-4 border-l-[0.5px] border-l-[#ECECED1F] flex flex-col items-start justify-start gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger className="mr-auto ml-[-5px] flex items-center gap-1">
                  <div className="flex items-center gap-1">
                    <div className="font-[330] text-[12px] text-white/36 leading-none">
                      {t('detail.header.totalFees')}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px] bg-[#191919]">
                  <span className="text-[11px] tracking-wide">{t('detail.header.totalFeesTooltip')}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-[13px] font-[380] leading-none text-white">
              {tokenData ? (
                <div className="flex items-center gap-1">
                  <img src={getBlockchainLogo2(+tokenData?.chainId as ChainIds)} alt="" className="w-3 h-3" />
                  {formatAmount(tokenData?.totalFee, {
                    roundMode: 'ceil',
                  })}
                </div>
              ) : (
                '--'
              )}
            </span>
          </div>
          <div className="pl-4 border-l-[0.5px] border-l-[#ECECED1F] flex flex-col items-start justify-start gap-2">
            <div
              className="font-[330] text-[12px] text-white/36 leading-none flex items-center gap-0 cursor-pointer"
              onClick={() => setOpenContractMonitoring(true)}
            >
              <span>{t('detail.header.detection')}</span>
              <img src="/images/icons/arrow-right.svg" className="size-3" alt="arrow-right" />
            </div>
            <TokenHealth tokenData={tokenData} />
          </div>
          {tokenData?.security?.buyTax !== null && tokenData?.security?.sellTax !== null && (
            <div className="pl-4 border-l-[0.5px] border-l-[#ECECED1F] flex flex-col items-start justify-start gap-2">
              <div className="font-[330] text-[12px] text-white/36 leading-none">{t('detail.header.taxes')}</div>
              <div className="text-[13px] font-[380] leading-none text-white/36">
                <span className="text-rise">
                  {tokenData?.security?.buyTax ? Number(tokenData?.security?.buyTax) : '0'}%
                </span>
                {' / '}
                <span className="text-fall">
                  {tokenData?.security?.sellTax ? Number(tokenData?.security?.sellTax) : '0'}%
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  aria-label="Hide token"
                  onClick={() => {
                    if (isBlacklistToken) {
                      removeBlacklistTokens([tokenData?.address ?? ''])
                    } else {
                      handleAddBlacklistToken()
                    }
                  }}
                >
                  <IconEyeClose
                    className={cn(
                      'size-3  hover:text-white cursor-pointer',
                      isBlacklistToken ? 'text-white' : 'text-[#878787]',
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px] bg-[#191919]">
                  <p className="text-[12px] tracking-wide">{t('listCoin.blacklist.hideToken')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  aria-label="Ignore DEV"
                  onClick={() => {
                    if (isBlacklistDev) {
                      removeBlacklistDevs(tokenData?.creator ? [tokenData?.creator] : [])
                    } else {
                      handleAddBlacklistDev()
                    }
                  }}
                >
                  <IconIgnoreDev
                    className={cn(
                      'size-3  hover:text-white cursor-pointer',
                      isBlacklistDev ? 'text-white' : 'text-[#878787]',
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px] bg-[#191919]">
                  <p className="text-[12px] tracking-wide">{t('listCoin.blacklist.ignoreDEV')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger type="button" aria-label="Share token" onClick={handleClickShare}>
                  <img
                    src="/images/icons/share-one.svg"
                    className="size-4 min-w-4 cursor-pointer transform-all duration-100 hover:scale-[1.1]"
                    alt="share-one"
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-[360px] bg-[#191919]">
                  <p className="text-[12px] tracking-wide">{t('detail.header.shareToken')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <ShareBottomSheet
          open={openShareToken}
          setOpen={setOpenShareToken}
          title={t('shareBottomSheet.title')}
          text={shareTitle}
          url={window.location.href}
          hideSaveButton={true}
          tokenData={tokenData}
        >
          <div className="p-3 font-[330] text-[13px] text-white leading-none">
            <div>{shareTitle}</div>
            <div className="mt-2 break-all text-[12px]">{window.location.href}</div>
          </div>
        </ShareBottomSheet>
      </div>
      <AiAnalysisSheet ref={aiRef} />
      <ContractMonitoring
        open={openContractMonitoring}
        setOpen={setOpenContractMonitoring}
        showTrigger={false}
        tokenData={tokenData}
      />
    </div>
  )
}

export default HeaderDetailInfo
