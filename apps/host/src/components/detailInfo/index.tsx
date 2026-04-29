import { useMemo, useState } from 'react'
import Container from '@components/common/Container.tsx'
import IconsDrawer from '@components/detailInfo/IconsDrawer.tsx'
import BuyersStatusDrawer from '@components/detailInfo/BuyersStatusDrawer.tsx'
import { DevAction, TokenPortrait } from '@/@generated/gql/graphql-core'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import { formatPercentage, getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { CopyButton } from '../common/copy-button'
// import { formatAddressWallet } from '@/lib/string'
import { ChainIds } from '@/types/enums'
import { useTranslation } from 'react-i18next'
import TokenAge from './TokenAge'
import TokenHealthTooltip from '@components/detailInfo/TokenHealthTooltip.tsx'
// import PriceToken from './PriceToken'
import { cn } from '@/lib/utils.ts'
// import { PriceChange } from '@components/detailInfo/PriceChange.tsx'
import { TokenLogo } from '@components/detailInfo/TokenLogo.tsx'
import IconOfficial from '@components/detailInfo/IconOfficial.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { X_STOCK_TAG } from '@/lib/constant.ts'
import { TokenSearchDrawer, TokenSearchDrawerType } from '../futuresDetails/tokenSearchDrawer'
import { useRealtimeTokenInfo } from '@hooks/useRealtimeTokenInfo.ts'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { HotTokenTooltip } from '@components/detailInfo/HotTokenTooltip.tsx'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { useSmartMoneyHolderCount } from '@hooks/useSmartMoneyHolderCount.ts'
import { useLocation } from 'react-router-dom'

interface DetailInfoProps {
  tokenData: TokenDetail
  tokenPortrait?: TokenPortrait
  classNameLeftSide?: string
  classNameRightSide?: string
  avatarUrl?: string
  crossOrigin?: boolean
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
            {`${t('detail.tokenDetail.internalDisk')} ${formatPercentage(Number(internalMarketProgress))}`}
          </span>
        </div>
      )}
    </>
  )
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

const NumberOfProTrader = (props: { numberProTrader: number; token: string; chainId: number; createdAt: string }) => {
  const { numberProTrader, token, chainId, createdAt } = props
  const { data } = useSmartMoneyHolderCount({ token, chainId, createdAt })
  return (
    <div className="flex items-center flex-col gap-1.5">
      <img src="/images/icons/icon-new-top-trade.svg" className="w-[17px] h-[18px]" alt="" />
      <span className="app-font-regular text-[11px] leading-[1] text-[#cccadb]">{data ?? numberProTrader}</span>
    </div>
  )
}

const DetailInfo = ({
  tokenData,
  tokenPortrait,
  classNameLeftSide,
  classNameRightSide,
  avatarUrl,
  crossOrigin,
}: DetailInfoProps) => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const {
    tokenLogo: tokenLogoFormState,
    symbol: tokenSymbolFormState,
    tokenName: tokenNameFormState,
    createdTime,
    address,
    chainId,
    isXStock: isXStockFormState,
  } = state || {}

  const tokenSymbol = tokenSymbolFormState ? tokenSymbolFormState : (tokenData?.symbol ?? '--')
  const tokenAddress = address ? address : (tokenData?.address ?? '--')
  const tokenName = tokenNameFormState ? tokenNameFormState : (tokenData?.name ?? '--')
  const chain = chainId ? chainId : tokenData?.chainId ? Number(tokenData?.chainId) : undefined
  const tokenLogo = tokenLogoFormState
    ? tokenLogoFormState
    : tokenData?.info?.avatarUrl ||
      tokenData?.info?.logoUrl ||
      getBlockChainLogo(chain as ChainIds, tokenData?.address ?? '')
  const chainLogo = getBlockchainLogo2(chainId ? chainId : chain)
  const metadataCustom = Boolean(tokenData?.metadataCustom?.isOfficial)

  // const tokenStatistic = useTokenPriceInfo(address || '')

  const [isTokenDrawerOpen, setIsTokenDrawerOpen] = useState(false)
  // const price24hChange = tokenStatistic?.price24hChange ?? tokenData?.price24hChange
  const numberProTrader = tokenData?.numberProTrader ?? 0

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

  const devActions = tokenPortrait?.devAction || []
  const latestDevAction = devActions.length > 0 ? devActions[devActions.length - 1] : undefined
  const tagDevAction = handleRenderTagDevAction(devActions.length > 0 ? devActions[devActions.length - 1] : undefined)

  const isXStock = isXStockFormState ? isXStockFormState : tokenData?.tags?.includes(X_STOCK_TAG)
  const isXStockPath = useIsXStockPath()

  const launchpad = getLaunchpad(tokenData?.dexes ?? [])

  return (
    <>
      <Container className="py-2.5 ">
        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            {/* <div className="flex items-center">
              <img
                src="/images/tokenDetail/ic-list-arrow.svg"
                alt="icon list arrow"
                onClick={() => setIsTokenDrawerOpen(true)}
                className="cursor-pointer"
              />
              <div
                className="app-font-medium text-[1rem] text-white leading-[1] cursor-pointer pb-0.5 select-none nophone"
                onClick={() => setIsTokenDrawerOpen(true)}
              >
                {tokenSymbol}
              </div>
              {isXStock && <IconXStock className="ml-1.5" />}
              {(metadataCustom || isXStock) && <IconOfficial />}
              {tokenData?.isHotToken && <HotTokenTooltip />}
            </div> */}

            {/* <div className="text-right">
              <PriceToken token={tokenData?.address} initialPrice={tokenData?.openPrice24h} price={tokenData?.price} />
            </div> */}
          </div>

          <div className="flex items-center justify-between">
            <div className={cn('flex items-center gap-1.5', classNameLeftSide)}>
              <TokenLogo
                tokenLogo={avatarUrl ? avatarUrl : tokenLogo}
                tokenSymbol={tokenSymbol}
                chainLogo={chainLogo}
                crossOrigin={crossOrigin}
              />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-[5px] min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p
                        className="text-[15px] text-white leading-[1] font-bold cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] tokenSymbol-DetailInfo"
                        onClick={() => setIsTokenDrawerOpen(true)}
                        title={tokenSymbol} // Show full text on hover
                      >
                        {tokenSymbol}
                      </p>
                      <p className="text-[calc(1rem*(11/16))] text-[#908e98] leading-[1] whitespace-nowrap max-w-[44px] sm:max-w-fit text-ellipsis overflow-hidden">
                        {/* {formatAddressWallet(tokenAddress, 5, 0)} */}
                        {tokenName}
                      </p>
                    </div>
                    <CopyButton
                      icon="/images/tokenDetail/icon-copy.webp"
                      className="w-[10px] min-w-[10px] h-[10px]"
                      text={tokenAddress}
                      type="tokenAddress"
                    />
                  </div>

                  {createdTime || tokenData?.createdTime ? (
                    <TokenAge
                      createdTime={createdTime ? createdTime : tokenData?.createdTime}
                      className="text-[12px] text-[#00CE89] leading-1 whitespace-nowrap"
                    />
                  ) : (
                    <span className="text-[calc(1rem*(10/16))] text-[#00CE89] leading-[1] whitespace-nowrap">--</span>
                  )}

                  <DevActionTooltip devAction={latestDevAction} />
                  {launchpad ? <InternalMarketProgress tokenData={tokenData} /> : null}
                </div>

                <div className="flex items-center mt-[7px]">
                  <IconsDrawer tokenData={tokenData} tagDevAction={tagDevAction} tokenPortrait={tokenPortrait} />
                  {isXStock && <IconXStock className="ml-1.5" />}
                  {(metadataCustom || isXStock) && <IconOfficial />}
                  {tokenData?.isHotToken && <HotTokenTooltip />}
                  {/* {!isXStockPath && (
                    <>
                      {tokenData ? (
                        <NumberOfProTrader
                          numberProTrader={numberProTrader}
                          token={tokenData.address || ''}
                          chainId={tokenData.chainId || ChainIds.Solana}
                          createdAt={tokenData.createdTime}
                        />
                      ) : null}
                      <BuyersStatusDrawer tokenData={tokenData} />
                    </>
                  )} */}
                </div>
              </div>
            </div>
            <div className={cn('flex items-center justify-center gap-4', classNameRightSide)}>
              {!isXStockPath && tokenData && <TokenHealthTooltip tokenData={tokenData} />}
              <BuyersStatusDrawer tokenData={tokenData} />
              {!isXStockPath && tokenData && (
                <NumberOfProTrader
                  numberProTrader={numberProTrader}
                  token={tokenData?.address || ''}
                  chainId={tokenData?.chainId || ChainIds.Solana}
                  createdAt={tokenData?.createdTime}
                />
              )}
            </div>
            {/* <PriceChange
              tokenAddress={tokenAddress}
              initialPrice={tokenData?.openPrice24h}
              currentPrice={tokenData?.price}
              openTime24h={tokenData?.openPrice24h}
            /> */}
          </div>
        </div>
      </Container>
      {/* <TokenSelectionDrawer open={isTokenDrawerOpen} setOpen={setIsTokenDrawerOpen} currentToken={tokenData} /> */}
      <TokenSearchDrawer
        allowShowList
        open={isTokenDrawerOpen}
        setOpen={setIsTokenDrawerOpen}
        type={isXStock ? TokenSearchDrawerType.XSTOCKS : TokenSearchDrawerType.MEME}
      />
    </>
  )
}

export default DetailInfo
