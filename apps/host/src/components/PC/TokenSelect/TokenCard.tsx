import { TokenTrendingSearchBarData } from '@/@generated/gql/graphql-meme2'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import Text from '@/components/common/Text'
import { CopyButton } from '@/components/common/copy-button'
import { SearchHistory } from '@/components/common/search/SearchHistory'
import { IconXStock } from '@/components/common/tags/IconXStock'
import IconOfficial from '@/components/detailInfo/IconOfficial'
import EmbeddedTwitterPost from '@/components/discover/EmbeddedTwitterPost'
import { QuickBuyButton } from '@/components/discover/QuickBuyButton'
import useItemTokenOHLC from '@/components/futuresDetails/tokenSearchDrawer/hooks/useItemTokenOHLC'
import { SimpleTooltip } from '@/components/v2/ui-shared/components/SimpleTooltip'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatAddressWallet } from '@/lib/string'
import { getPath } from '@/lib/utils'
import { formatMoney, getBlockChainLogo, getBlockchainLogo2, getLaunchpad } from '@/utils/helpers'
import { getDexLogo } from '@/utils/lauchpad'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import { Dispatch, MouseEvent, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PriceChangePC } from '../Search'
import { useGetSetHistorySearch } from '@/components/futuresDetails/tokenSearchDrawer/hooks/useHandleLogic'
import ConfirmCollectTokenMeme from '@/components/futuresDetails/tokenSearchDrawer/ConfirmCollectTokenMeme'
import { TokenTrending } from '@/types/token'
import { useTokenTrendingSearchBarPC } from '@/components/futuresDetails/tokenSearchDrawer/hooks/useTokenTrendingSearchBarPC'
import { chains } from '@/components/futuresDetails/tokenSearchDrawer/MemeList'
import { useActiveChain } from '@/hooks/useActiveChain'
import { useAppDispatch } from '@/redux/store'
import { walletActions } from '@/redux/modules/wallet.slice.ts'
import { mappedChainIdToTypeChain, mappedIdToTypeChain } from '@/redux/modules/newWallet.slice.ts'

const RenderImgChain = ({
  chainId,
  token,
  image,
  symbol,
}: Pick<TokenTrendingSearchBarData, 'chainId' | 'token' | 'image' | 'symbol'>) => {
  const chainLogo = getBlockchainLogo2(chainId)
  const tokenLogo = image ?? getBlockChainLogo(chainId, token)

  return (
    <div className="mr-2">
      <ChainCurrencyIcon
        chainIcon={chainLogo}
        currencyIcon={tokenLogo}
        name={symbol}
        fallbackClassName="bg-secondary size-[36px]"
        avatarClassName="size-[36px] m-0 border-[12.px] border-[#261236]"
        avatarImageClassName="size-[36px]"
      />
    </div>
  )
}

const TokenCard = (
  props: TokenTrendingSearchBarData & {
    debounceValue: string
    setOpen: (value: SetStateAction<boolean>) => void
    favoriteTokens?: TokenTrending[]
    setFavoriteTokens?: Dispatch<SetStateAction<TokenTrending[]>>
  },
) => {
  const {
    chainId,
    image,
    symbol,
    token,
    dexes,
    createdTime,
    marketcap,
    metadataCustom,
    price24hChange,
    volume24h,
    debounceValue,
    isHot,
    isXStock,
    name,
    liquidity,
    telegramUrl,
    twitterId,
    twitterUrl,
    setOpen,
    favoriteTokens = [],
    setFavoriteTokens,
    isFavorite: initialIsFavorite,
  } = props
  const activeChain = useActiveChain()
  // Local state to track favorite status
  const [localTokenList, setLocalTokenList] = useState<TokenTrending[]>([])

  // Check if this token is in favorites
  const isFavorite = useMemo(() => {
    if (initialIsFavorite !== undefined) return initialIsFavorite
    return favoriteTokens.some((t) => t.token === token)
  }, [favoriteTokens, token, initialIsFavorite])

  const { t } = useTranslation()
  const getLaunchpadLogo = (dexes: string[]) => {
    const launchpad = dexes ? getLaunchpad(dexes) : ''
    return launchpad ? getDexLogo(launchpad) : undefined
  }
  const { handleGetHistorySearch, handleSetHistorySearch } = useGetSetHistorySearch()
  const trendingVariables = useMemo(
    () => ({
      input: {
        chain: chains[activeChain],
        dex: 'All',
        direction: 'Popular',
        timeRange: 'h24',
      },
    }),
    [activeChain],
  )
  const dispatch = useAppDispatch()

  const { updateCacheWithFavorite } = useTokenTrendingSearchBarPC(trendingVariables)
  const navigate = useNavigate()

  const handleNavigate = ({
    chainId,
    token,
    type,
  }: {
    token: string
    chainId: number
    symbol: string
    image: string | null
    type?: 'meme' | 'xstock'
  }) => {
    const searchHistoryList = handleGetHistorySearch()

    const newHistory = searchHistoryList.filter((item) => item.address !== token)
    newHistory.unshift({
      address: token,
      name: symbol,
      logo: image as string,
      chainId: chainId,
      type: isXStock ? 'xstock' : 'meme',
    })
    if (newHistory.length > 20) {
      newHistory.pop()
    }
    handleSetHistorySearch(newHistory)

    dispatch(walletActions.setActiveChain(mappedIdToTypeChain(chainId)))
    const path = getPath(type === 'meme' ? APP_PATH.MEME_TOKEN_DETAIL : APP_PATH.X_STOCK_DETAIL, {
      address: token,
      chain: CHAIN_SYMBOLS[chainId],
    })
    navigate(path, {
      state: {
        symbol: symbol,
        tokenLogo: image,
        tokenName: name,
        createdTime: createdTime * 1000,
        address: token,
        chainId: chainId,
      },
    })
    setOpen(false)
  }

  const openLink = (event: MouseEvent, url: string) => {
    event.stopPropagation()
    event.preventDefault()
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const isOfficial = Boolean(metadataCustom?.isOfficial)

  const { price: priceMqtt } = useItemTokenOHLC({
    address: token,
    initChangePercent: price24hChange,
    initMarketcap: Number(marketcap),
    initVolume24h: Number(volume24h),
    initLiquidity: Number(liquidity),
  })

  const changePercent = priceMqtt?.price24hChange || price24hChange

  return (
    <div
      className="grid grid-cols-5 flex-1 cursor-pointer"
      onClick={() =>
        handleNavigate({
          chainId,
          token,
          image: image as string,
          symbol,
          type: isXStock ? 'xstock' : 'meme',
        })
      }
    >
      <div className="flex gap-1 items-center col-span-2">
        {setFavoriteTokens && (
          <ConfirmCollectTokenMeme
            token={token}
            defaultCollect={isFavorite}
            tokenSymbol={symbol}
            triggerClassName="p-0"
            onRemoveSuccess={() => {
              if (setFavoriteTokens) {
                setFavoriteTokens((prev) => prev.filter((e) => e.token !== token))
              }
              updateCacheWithFavorite(token, false)
            }}
            onAdded={() => {
              if (setFavoriteTokens) {
                setFavoriteTokens((prev) => {
                  const existingToken = prev.find((t) => t.token === token)
                  if (existingToken) {
                    return prev.map((t) => (t.token === token ? { ...t, isFavorite: true } : t))
                  }
                  const newToken = {
                    token: token,
                    symbol: symbol,
                    image: image || '',
                    chainId: chainId,
                    isFavorite: true,
                    name: name || '',
                    price: priceMqtt?.price || '0',
                    volume24h: volume24h ? +volume24h : 0,
                    price24hChange: price24hChange || '0',
                  } as TokenTrending
                  return [...prev, newToken]
                })
              }
              updateCacheWithFavorite(token, true)
            }}
          />
        )}
        <RenderImgChain chainId={chainId} image={image} symbol={symbol} token={token} />
        <div className="flex flex-col h-[32px] justify-center">
          <div className="flex items-center">
            <Text
              text={symbol}
              className="!text-[14px] !font-[380] overflow-ellipsis truncate max-w-28"
              highLightText={debounceValue}
              highLightColor="#AB57FF"
            />
            <div className="text-[calc(12rem/16)] leading-3 font-[380] text-[#FFFFFF80] truncate max-w-20 @min-7xl:max-w-full px-0.5">
              {name}
            </div>
            <>
              <SimpleTooltip content={t('listCoin.tooltip.searchContract')} className="ml-0.5">
                <img
                  src="/images/icons/search-icon.svg"
                  alt="icon search"
                  className="size-[14px] cursor-pointer"
                  onClick={(event) => openLink(event, `https://x.com/search?q=${token}`)}
                />
              </SimpleTooltip>
              {isHot && (
                <SimpleTooltip className="px-0.5" content={t('detail.tooltip.hotToken')}>
                  <img src="/images/icons/icon_hot.svg" className="size-[18px] cursor-pointer" alt="icon hot" />
                </SimpleTooltip>
              )}
              {!!getLaunchpadLogo(dexes) && (
                <SimpleTooltip className="px-0.5" content={getLaunchpad(dexes)}>
                  <img src={getLaunchpadLogo(dexes)} alt="" className="size-[18px] cursor-pointer" />
                </SimpleTooltip>
              )}
              {priceMqtt.liquidity < 4000 && (
                <SimpleTooltip className="px-0.5" content={t('detail.alert.lowLiquidity')}>
                  <img src="/images/icons/danger_1.svg" className="size-[18px] cursor-pointer" alt="icon danger" />
                </SimpleTooltip>
              )}
              {isOfficial && (
                <SimpleTooltip className="px-0.5" content={t('detail.tags.official')}>
                  <IconOfficial className="size-[18px] ml-0" />
                </SimpleTooltip>
              )}
              {isXStock && (
                <SimpleTooltip className="mx-0.5" content={t('xstocks.tooltip.powerByXStocks')}>
                  <IconXStock className="" />
                </SimpleTooltip>
              )}
            </>
          </div>
          <div className="flex items-center ">
            <TokenAge createdTime={`${new Date(createdTime * 1000)}`} className="mr-0" />
            <Text
              text={formatAddressWallet(token)}
              className="!text-[calc(12rem/16)] leading-3 !font-[330] px-0.5"
              highLightText={debounceValue}
              highLightColor="#AB57FF"
              color="#FFFFFF80"
            />
            <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center pl-0.5" text={token} type="tokenAddress" />
            {/* <SimpleTooltip className="px-0.5" content={t('assets.deposit.copyWalletAddress')}>
            </SimpleTooltip> */}
            {twitterId && <EmbeddedTwitterPost tweetId={twitterId} classNameIcon="cursor-pointer" />}

            {telegramUrl && (
              <SimpleTooltip className="px-0.5" content="Telegram">
                <img
                  src="/images/icons/icon_tele.svg"
                  alt=""
                  className="size-[18px] cursor-pointer"
                  onClick={(event) => openLink(event, telegramUrl)}
                />
              </SimpleTooltip>
            )}
            {twitterUrl && (
              <SimpleTooltip className="px-0.5" content="Twitter (X)">
                <img
                  src="/images/icons/socials/ic-twitter.svg"
                  alt=""
                  className="size-[18px] cursor-pointer"
                  onClick={(event) => openLink(event, twitterUrl)}
                />
              </SimpleTooltip>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-3">
        <table className="w-full">
          <tr>
            <td className="w-[35%]">
              <div className="flex items-end flex-col justify-center h-[28px]">
                <div className="gap-1 flex justify-end items-center">
                  <span className="font-[305] text-[11px] text-[#FFFFFF80]">Vol</span>
                  <span className="font-[380] text-[12px] text-[#FFFFFFCC]">
                    {formatMoney(Number(priceMqtt?.volume24h || volume24h))}
                  </span>
                </div>
                <div className="gap-1 flex justify-end items-center">
                  <span className="font-[305] text-[11px] text-[#FFFFFF80]">Liq</span>
                  <span className="font-[380] text-[12px] text-[#FFFFFFCC]">
                    {formatMoney(Number(priceMqtt?.liquidity || liquidity))}
                  </span>
                </div>
              </div>
            </td>
            <td className="w-[42%] pr-2">
              <div className="flex items-end flex-col justify-center col-span-2 h-[28px]">
                <div className="gap-1 flex justify-end items-center">
                  <span className="font-[380] text-[12px] text-[#FFFFFFCC]">
                    {formatMoney(Number(priceMqtt?.marketcap || marketcap))}
                  </span>
                  <PriceChangePC isPositive={Number(changePercent) > 0} value={`${changePercent}`} />
                </div>
                <div className="gap-1 flex justify-end items-center">
                  <span className="font-[305] text-[11px] text-[#FFFFFF80]">24h</span>
                  <span className="font-[305] text-[11px] text-[#FFFFFF80]">MC</span>
                </div>
              </div>
            </td>
            <td className="w-[23%] pl-1">
              <div className="flex justify-center items-center">
                <QuickBuyButton
                  token={token}
                  className="h-[26px] hover:scale-[102%]"
                  customAction={() =>
                    handleNavigate({
                      chainId,
                      token,
                      image: image as string,
                      symbol,
                      type: isXStock ? 'xstock' : 'meme',
                    })
                  }
                />
              </div>
            </td>
          </tr>
        </table>
      </div>
      {/* <div className="grid grid-cols-4  col-span-3 "></div> */}
    </div>
  )
}

export default TokenCard
