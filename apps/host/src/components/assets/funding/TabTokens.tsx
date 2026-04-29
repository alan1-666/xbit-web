import { APP_PATH } from '@/lib/constant'
import { formatAmount, formatBalance, formatPercent, formatPrice } from '@/lib/format'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { getPath } from '@/lib/utils.ts'
import {
  setIsHiddenSmallPoll,
  setIsHiddenSmallerThan1U,
  setIsShowOnlyCurrentCurrency,
} from '@/redux/modules/holding.slice.ts'
import { selectAllTokens, tokenActions } from '@/redux/modules/tokens.slice.ts'
import { setCurrentHoldingTab } from '@/redux/modules/tradeTab.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { getTokenData } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding'
import { getBlockchainLogo2 } from '@/utils/helpers'
import { isNativeToken } from '@/utils/token.ts'
import { NativeTokenAssetItem } from '@components/assets/funding/NativeTokenAssetItem.tsx'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty } from '@components/icon'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { usePriceOHLC } from '@hooks/useTokenPriceChange.ts'
import { getPortfolio } from '@services/tokens.service.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { throttle } from 'lodash-es'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ShareHolding from './ShareHolding.tsx'
import SortHolding, { SORT_OPTIONS } from './SortHolding.tsx'
import ButtonShare from '@/components/myPositions/ButtonShare.tsx'

type PortfolioDTORefactored = PortfolioDTO & {
  showValueInNativeToken?: boolean
}

interface AssetsItemProps {
  item: PortfolioDTORefactored
  nativeChainPrice: any
  onShareClick: (data: {
    costPrice: string | number
    returnRate: string | number
    avgMC: string | number
    holdingValue: string | number
    holdingQuantity: string | number
    chainId: number
    pnl: string | number
    tokenAddress: string
    tokenName: string
    symbol: string
    tokenAvatar: string
    tokenLatestPrice: string | number
    realized: string | number
    unrealized: string | number
    totalBuyValue?: string | number
    totalBuyQty?: string | number
    isXStock?: boolean
  }) => void
  onChangeUnit: (token: string) => void
}

const AssetsItem = (props: AssetsItemProps) => {
  const { item, nativeChainPrice, onShareClick, onChangeUnit } = props
  const priceOHLC = usePriceOHLC({ address: item?.token ?? '', defaultValue: '0' })
  const priceMqtt = useTokenPrice(item?.token ?? '', '0')
  const dispatch = useAppDispatch()
  const tokensState = useAppSelector(selectAllTokens)
  const fallBackPrice = item?.price || 0

  const fetchTokenData = async (token: string) => {
    try {
      const response = await gqlClient.query({
        query: getTokenData,
        variables: {
          input: { address: token, chainId: item?.chainId },
        },
      })
      const tokenData = response?.data?.getTokenDetail
      dispatch(
        tokenActions.setTokenData({
          address: tokenData?.address,
          chainId: tokenData?.chainId,
          name: tokenData?.name,
          symbol: tokenData?.symbol,
          logo: tokenData?.info?.logoUrl,
          isBlacklisted: tokenData?.isBlacklisted || false,
          totalSupply: tokenData?.totalSupply || '0',
        }),
      )
      return {
        logo: tokenData?.logo,
        symbol: tokenData?.symbol,
        name: tokenData?.name,
      }
    } catch (error) {
      console.error('Error fetching token detail:', error)
      return null
    }
  }

  const price =
    priceOHLC && Number(priceOHLC) != 0 ? Number(priceOHLC) : priceMqtt != 0 ? priceMqtt : Number(fallBackPrice)
  const holdingValue = price ? item?.totalBaseAmount * +price : '--'
  const realized = item?.realizedPnL ? Number(item?.realizedPnL) : 0
  const unrealized =
    item?.totalBaseAmount && item.totalBaseAmount > 0 && price != 0 && item?.avgPriceUsd != 0
      ? (Number(price) - Number(item?.avgPriceUsd)) * item?.totalBaseAmount
      : 0
  const pnl = item?.avgPriceUsd == 0 || item?.totalBuyUsd == 0 ? '--' : Number(realized) + Number(unrealized)
  const returnRateValue =
    item?.totalBuyUsd != 0 ? ((Number(realized) + Number(unrealized)) * 100) / item?.totalBuyUsd : '--'
  const returnRate = item?.avgPriceUsd == 0 || item?.totalBuyUsd == 0 || price == 0 ? '--' : returnRateValue
  const tokenData = tokensState[item.token] ?? fetchTokenData(item.token)
  const isXStock = item?.isXStock || false
  const lowLiquidity = item?.lowLiquidity || false
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleNavigation = () => {
    const chainType =
      item.chainId === ChainIds.Ethereum
        ? 'arb'
        : item.chainId === ChainIds.Arbitrum
          ? 'arb'
          : item.chainId === ChainIds.Bsc
            ? 'bsc'
            : 'sol'
    // dispatch(newWalletActions.setActiveChain(chainType))
    dispatch(setCurrentHoldingTab('holding'))
    dispatch(setIsHiddenSmallPoll(false))
    dispatch(setIsHiddenSmallerThan1U(false))
    dispatch(setIsShowOnlyCurrentCurrency(true))
    const path = item?.isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
    navigate(
      getPath(path, {
        address: item.token,
        chain: chainType,
      }) + '?tab=holding',
      {
        // state: { symbol: item?.symbol },
        state: {
          symbol: item.symbol,
          tokenLogo: item.logoUrl,
          // tokenName: item.n,
          // isFavorite: item.is,
          // createdTime:  item.cra,
          address: item.token,
          chainId: item.chainId,
        },
      },
    )
  }
  const costPrice = !item?.avgPriceUsd || !item?.totalBuyUsd ? '--' : item?.avgPriceUsd

  const isSoldOut = item?.totalBaseAmount == 0 || item?.totalBaseAmount === null

  return (
    <>
      <div
        className="mt-2 p-2.5 rounded-[10px] border-[0.5px] border-[#FFFFFF14] bg-[#0F0F0F] first:mt-0 cursor-pointer bg-gradient-to-r mb-2 gradient-border-green hover:bg-[#ECECED14] transition-colors duration-200"
        onClick={() => {
          handleNavigation()
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex justify-center items-center gap-2">
            <LogoWithChain
              logo={item?.logoUrl}
              logoClassName="w-[28px] h-[28px]"
              name={item?.symbol}
              chainLogo={getBlockchainLogo2(item.chainId)}
            />
            <div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="font-[380] text-[14px] leading-none text-white">{item.symbol}</div>
                  {isXStock && <IconXStock />}
                </div>
                {isSoldOut && (
                  <span className="bg-[#00FFB41A] rounded-[4px] px-1 py-0.5 text-[12px] text-[#00FFB4] font-[330]">
                    {t('assets.funding.soldOut')}
                  </span>
                )}
                <div
                  className="flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onShareClick({
                      costPrice,
                      returnRate,
                      avgMC: item?.avgMarketCap ?? '--',
                      holdingValue,
                      holdingQuantity: item?.totalBaseAmount ?? '--',
                      chainId: item.chainId,
                      pnl: pnl,
                      tokenAddress: item.token,
                      tokenName: tokenData?.name ?? item.symbol,
                      symbol: tokenData?.symbol ?? item.symbol,
                      tokenAvatar: item?.avatarUrl ? item.avatarUrl : (tokenData?.logo ?? item.logoUrl),
                      tokenLatestPrice: price || '0',
                      realized: realized || '0',
                      unrealized: unrealized || '0',
                      totalBuyValue: item?.totalBuyUsd ?? '--',
                      totalBuyQty: item?.totalBuyQty ?? '--',
                      isXStock: isXStock,
                    })
                  }}
                >
                  <img
                    src="/images/futuresDetail/share-icon.svg"
                    alt="icon share"
                    className="h-4 w-4 transition-all duration-100 hover:scale-[1.1]"
                  />
                </div>
                {lowLiquidity && (
                  <TooltipProvider>
                    <SimpleTooltip
                      content={t('assets.overview.lowLiquidityTokenWarning')}
                      contentClassName="max-w-[75vw]"
                    >
                      <IconWarning
                        className="size-4"
                        onClick={(event) => {
                          event.stopPropagation()
                          event.preventDefault()
                        }}
                      />
                    </SimpleTooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="mt-1 font-[330] text-[11px] leading-none text-white/50">
                {t('assets.funding.lastActive')}:{' '}
                {item.lastTxTime ? dayjs(item.lastTxTime).locale('en').fromNow(true) : '--'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-0.5">
              <span className="font-[330] text-[11px] leading-none text-white/50">{t('assets.funding.totalPnl')}</span>
              <img
                className="w-[14px] h-[14px] cursor-pointer transition-all duration-100 hover:scale-[1.1]"
                src={
                  item?.showValueInNativeToken ? '/images/icons/icon-sol-gray.svg' : '/images/orderBook/icon-refund.svg'
                }
                alt="change currency"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChangeUnit(item.token)
                }}
              />
            </div>
            <div
              className={`mt-1.5 ${
                typeof pnl === 'number' ? (pnl > 0 ? 'text-rise' : pnl < 0 ? 'text-fall' : 'text-white') : 'text-white'
              }`}
            >
              <div className={`flex items-center justify-end gap-1 ${lowLiquidity ? 'line-through' : ''}`}>
                {item?.showValueInNativeToken ? (
                  <>
                    <img src={getBlockchainLogo2(item?.chainId)} alt="" className="w-3 h-3" />
                    <span className="font-[380] text-[13px]">
                      {formatBalance(pnl === '--' ? undefined : pnl / nativeChainPrice, {
                        roundMode: 'floor',
                      })}
                    </span>
                  </>
                ) : (
                  <span className="font-[380] text-[13px]">
                    {formatBalance(pnl, {
                      roundMode: 'floor',
                    })}
                  </span>
                )}
                <span className="font-[330] text-[11px] leading-none">
                  {returnRate === '--'
                    ? '--'
                    : `(${formatPercent(returnRate, {
                        showSign: true,
                      })})`}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div>
            <div className="font-[330] text-[12px] leading-none text-white/50">{t('detail.holderTable.totalBuy')}</div>
            <div
              className={`mt-1.5 font-[380] text-[13px] flex items-center gap-1 ${item?.totalBuyUsd ? 'text-rise' : 'text-white'}`}
            >
              {item?.showValueInNativeToken ? (
                <>
                  <img src={getBlockchainLogo2(item?.chainId)} alt="" className="w-3 h-3" />
                  {formatBalance(item?.totalBuyUsd === null ? undefined : item?.totalBuyUsd / nativeChainPrice, {
                    roundMode: 'floor',
                  })}
                </>
              ) : (
                formatBalance(item?.totalBuyUsd, {
                  showCurrency: true,
                  roundMode: 'floor',
                })
              )}
            </div>
            <div className="mt-1 flex items-end gap-1">
              <LogoWithChain
                logo={item?.logoUrl}
                logoClassName="w-2.5 h-2.5 min-w-none border-[0.42px] border-[#2E044D] text-[6px]"
                name={item?.symbol}
              />
              <div className="font-[330] text-[11px] leading-none text-white/50">
                {formatAmount(item?.totalBuyQty, {
                  roundMode: 'floor',
                })}
              </div>
            </div>
          </div>
          <div className="text-left">
            <div className="font-[330] text-[12px] leading-none text-white/50">{t('detail.holderTable.totalSell')}</div>
            <div
              className={`mt-1.5 font-[380] text-[13px] flex items-center gap-1 ${item?.totalSellUsd ? 'text-fall' : 'text-white'}`}
            >
              {item?.showValueInNativeToken ? (
                <>
                  <img src={getBlockchainLogo2(item?.chainId)} alt="" className="w-3 h-3" />
                  {formatBalance(item?.totalSellUsd === null ? undefined : item?.totalSellUsd / nativeChainPrice, {
                    roundMode: 'floor',
                  })}
                </>
              ) : (
                formatBalance(item?.totalSellUsd, {
                  showCurrency: true,
                  roundMode: 'floor',
                })
              )}
            </div>
            <div className="mt-1 flex items-end gap-1">
              <LogoWithChain
                logo={item?.logoUrl}
                logoClassName="w-2.5 h-2.5 min-w-none border-[0.42px] border-[#2E044D text-[6px]"
                name={item?.symbol}
              />
              <div className="font-[330] text-[11px] leading-none text-white/50">
                {formatAmount(item?.totalSellQty, {
                  roundMode: 'floor',
                })}
              </div>
            </div>
          </div>
          <div className="text-left">
            <div className="font-[330] text-[11px] leading-none text-white/50">{t('assets.funding.averageCost')}</div>
            <div className="mt-1.5 text-white font-[380] text-[13px] flex items-center gap-1">
              {item?.showValueInNativeToken ? (
                <>
                  <img src={getBlockchainLogo2(item?.chainId)} alt="" className="w-3 h-3" />
                  {formatPrice(item?.avgPriceUsd === null ? '--' : item?.avgPriceUsd / nativeChainPrice, {
                    roundMode: 'ceil',
                  })}
                </>
              ) : (
                formatPrice(item?.avgPriceUsd, {
                  showCurrency: true,
                  roundMode: 'ceil',
                })
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-[330] text-[12px] leading-none text-white/50">{t('assets.funding.holding')}</div>
            <div
              className={`mt-1.5 text-white font-[380] text-[13px] flex items-center justify-end gap-1 ${lowLiquidity ? 'line-through decoration-1' : ''}`}
            >
              {item?.showValueInNativeToken ? (
                <>
                  <img src={getBlockchainLogo2(item?.chainId)} alt="" className="w-3 h-3" />
                  {formatAmount(item?.totalBaseAmount === null ? '--' : item?.totalBaseAmount / nativeChainPrice, {
                    roundMode: 'floor',
                  })}
                </>
              ) : (
                formatAmount(holdingValue, {
                  roundMode: 'floor',
                })
              )}
            </div>
            <div className="mt-1 flex items-end justify-end gap-1">
              <LogoWithChain
                logo={item?.logoUrl}
                logoClassName="w-2.5 h-2.5 min-w-none border-[0.42px] border-[#2E044D text-[6px]"
                name={item?.symbol}
              />
              <div
                className={`font-[330] text-[11px] leading-none text-white/50 ${lowLiquidity ? 'line-through' : ''}`}
              >
                {formatAmount(item?.totalBaseAmount, {
                  roundMode: 'floor',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const TabTokens = ({ tag }: { tag?: 'meme' | 'XStock' | undefined }) => {
  const { t } = useTranslation()
  const [openSortPopup, setOpenSortPopup] = useState(false)
  const [sortBy, setSortBy] = useState<string>('-holdingValue')
  const [hideSmallBalance, setHideSmallBalance] = useState(false)
  const [hideModestBalance, setHideModestBalance] = useState(false)
  const [hideSmallLiquidity, setHideSmallLiquidity] = useState(false)
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const { selectedWallet, selectedChainId } = useContext(AssetOverviewContext)

  const {
    data: tokensData,
    isLoading,
    hasNextPage: hasMore,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      'tokens',
      selectedWallet?.walletAddress,
      hideSmallBalance,
      hideModestBalance,
      hideSmallLiquidity,
      hideZeroBalance,
      selectedChainId,
      sortBy,
      tag,
    ],
    initialPageParam: 1,
    enabled: !!selectedWallet?.walletAddress,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await gqlClient.query({
        query: getPortfolio,
        variables: {
          input: {
            chainId: selectedChainId,
            userAddress: selectedWallet?.walletAddress || '',
            hideSmallBalance: hideSmallBalance,
            hideModestBalance: hideModestBalance,
            hideSmallLiquidity: hideSmallLiquidity,
            hideZeroBalance: hideZeroBalance,
            limit: 20,
            page: pageParam,
            sortBy: sortBy,
            allToken: !tag ? true : undefined,
            tag: tag || undefined,
          },
        },
      })
      return (res?.data?.getPortfolio?.data || []) as unknown as PortfolioDTO[] // Fix type assertion issue
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
  })

  const queryClient = useQueryClient()
  useEffect(() => {
    return () => {
      // Cancel any ongoing queries related to meme tokens when the component unmounts
      queryClient.cancelQueries({
        queryKey: [
          'tokens',
          selectedWallet?.walletAddress,
          hideSmallBalance,
          hideModestBalance,
          hideSmallLiquidity,
          hideZeroBalance,
          selectedChainId,
          sortBy,
          tag,
        ],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(
        [
          'tokens',
          selectedWallet?.walletAddress,
          hideSmallBalance,
          hideModestBalance,
          hideSmallLiquidity,
          hideZeroBalance,
          selectedChainId,
          sortBy,
          tag,
        ],
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.slice(0, 1), // Keep only the first page
            pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
          }
        },
      )
    }
  }, [])

  const { solPrice, ethPrice } = useNativeTokenPrices()
  const nativeChainPrice = selectedChainId === ChainIds.Solana ? solPrice : ethPrice

  const assets = useMemo(() => {
    if (!tokensData) return []
    return tokensData.pages.flatMap((page) => page || [])
  }, [tokensData?.pages])

  const [assetsRefactored, setAssetsRefactored] = useState<PortfolioDTORefactored[]>(assets)

  useEffect(() => {
    let temp = [...assets]
    if (!tag) {
      temp = temp.filter((item) => isNativeToken(item.chainId, item.token))
    }
    setAssetsRefactored(temp)
  }, [assets])

  const sortByToLabel = useMemo(() => {
    const option = SORT_OPTIONS.find(
      (opt) => opt.value === sortBy.replace('-', '') || opt.value === sortBy.replace('+', ''),
    )
    let label = t('assets.funding.holding')
    if (option) {
      label = t(option.label)
    }
    const sortDirection = sortBy.startsWith('-') ? t('holding.sort.descending') : t('holding.sort.ascending')
    return `${label} ${sortDirection}`
  }, [sortBy])

  const loadMoreFn = async () => {
    if (isLoading || loadingMore || !hasMore) return
    fetchNextPage().then(() => {})
    return true
  }

  useEffect(() => {
    const throttled = throttle(() => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const LOAD_MORE_SCROLL_THRESHOLD = 0.75

      if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !loadingMore && hasMore) {
        // setLoadingMore(true)
        loadMoreFn().then(() => {})
      }
    }, 200)

    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [loadingMore, hasMore, loadMoreFn])

  const [openSharePopup, setOpenSharePopup] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const [shareData, setShareData] = useState<{
    costPrice: string | number
    returnRate: string | number
    avgMC: string | number
    holdingValue: string | number
    holdingQuantity: string | number
    chainId: number
    pnl: string | number
    tokenAddress: string
    tokenName: string
    symbol: string
    tokenAvatar: string
    tokenLatestPrice: string | number
    realized: string | number
    unrealized: string | number
    totalBuyValue?: string | number
    totalBuyQty?: string | number
    isXStock?: boolean
  }>({
    costPrice: '',
    returnRate: '',
    avgMC: '',
    holdingValue: '',
    holdingQuantity: '',
    chainId: ChainIds.Solana,
    pnl: '',
    tokenAddress: '',
    tokenName: '',
    symbol: '',
    tokenAvatar: '',
    tokenLatestPrice: '',
    realized: '',
    unrealized: '',
    totalBuyValue: '',
    totalBuyQty: '',
    isXStock: false,
  })

  const getUserInviteInfo = async () => {
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user

      setInviteCode(user.invitationCode)
    } catch (error) {}
  }

  useEffect(() => {
    getUserInviteInfo()
  }, [])

  return (
    <div className="mt-3">
      {tag ? (
        <div className="flex items-center justify-between mb-0.5 px-3">
          <div className="flex items-center gap-1">
            <span className="text-[14px] text-white/70 font-[330]">{t('holding.filter.filterAndSort')}:</span>
            <div
              className="flex items-center gap-0.5 cursor-pointer"
              onClick={() => {
                setOpenSortPopup(true)
              }}
            >
              <span className="text-[14px] text-white font-[330]">{sortByToLabel}</span>
              <img
                src="/images/icons/arrow-down2.svg"
                alt="arrown"
                className={`w-4 h-4 cursor-pointer transition-all duration-100 ${openSortPopup ? 'rotate-180' : ''}`}
              />
            </div>
            <SortHolding
              open={openSortPopup}
              setOpen={setOpenSortPopup}
              hideModestBalance={hideModestBalance}
              setHideModestBalance={setHideModestBalance}
              hideSmallLiquidity={hideSmallLiquidity}
              setHideSmallLiquidity={setHideSmallLiquidity}
              hideZeroBalance={hideZeroBalance}
              setHideZeroBalance={setHideZeroBalance}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        </div>
      ) : (
        <CheckboxWithLabel
          containerClassName="py-1 px-3"
          labelWrapperClassName="text-[13px] text-white/70 font-[330]"
          label={t('assets.funding.hideSmallAssets')}
          defaultChecked={hideSmallBalance}
          onChange={(checked) => setHideSmallBalance(!!checked)}
        />
      )}
      {assetsRefactored.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
        </div>
      ) : (
        <div className={`mt-2.5 ${tag ? 'px-3' : ''}`}>
          {tag
            ? assetsRefactored.map((item, index) => {
                return (
                  <AssetsItem
                    key={index}
                    item={item}
                    nativeChainPrice={nativeChainPrice}
                    onChangeUnit={(token: string) => {
                      setAssetsRefactored((prev) =>
                        prev.map((asset) => ({
                          ...asset,
                          showValueInNativeToken:
                            asset.token === token ? !asset.showValueInNativeToken : asset.showValueInNativeToken,
                        })),
                      )
                    }}
                    onShareClick={(data) => {
                      setShareData({
                        ...data,
                      })
                      setOpenSharePopup(true)
                    }}
                  />
                )
              })
            : assetsRefactored.map((item, index) => {
                return <NativeTokenAssetItem key={index} item={item} />
              })}
          <ButtonShare
            openShare={openSharePopup}
            setOpenShare={setOpenSharePopup}
            costPrice={shareData.costPrice}
            returnRate={shareData.returnRate}
            avgMC={shareData.avgMC}
            holdingValue={shareData.holdingValue}
            // ButtonShare expects totalBuy, shareData has totalBuyValue
            totalBuy={shareData.totalBuyValue ?? '--'}
            holdingQuantity={shareData.holdingQuantity}
            chainId={shareData.chainId}
            // ButtonShare expects PnL, shareData has pnl
            PnL={shareData.pnl}
            tokenAddress={shareData.tokenAddress}
            tokenName={shareData.tokenName}
            tokenAvatar={shareData.tokenAvatar}
            tokenLatestPrice={shareData.tokenLatestPrice}
            realized={shareData.realized}
            unrealized={shareData.unrealized}
            isXStock={shareData.isXStock || tag === 'XStock'}
            showTitle={false}
            showIcon={false}
          />
        </div>
      )}
      {(loadingMore || isLoading) && (
        <div className="flex justify-center items-center py-4">
          <Loading />
        </div>
      )}
    </div>
  )
}

export default TabTokens
