import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { SOL_ADDRESS } from '@/lib/blockchain.ts'
import { APP_PATH } from '@/lib/constant'
import { ARB_USDC_ADDRESS } from '@/lib/constant.ts'
import { formatAmount, formatBalance } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { formatAddressWallet } from '@/lib/string'
import { cn, getPath } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding'
import { getNameFromChainId } from '@/utils/chain'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
import { isNativeToken } from '@/utils/token.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { Loading } from '@components/common/Loading.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconEmpty, IconInfo } from '@components/icon'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { usePriceOHLC } from '@hooks/useTokenPriceChange.ts'
import { NativeTokenIcon } from '@pages/assets/overview/components/NativeTokenIcon.tsx'
import { getPortfolioOverview } from '@services/tokens.service.ts'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { throttle } from 'lodash-es'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000' // ETH address on Ethereum
const ETH_USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC address on Ethereum

const calculateETHHoldingValue = (item: PortfolioDTO, ethPrice: number) => {
  switch (item.token) {
    case ETH_ADDRESS.toLowerCase():
      return item.totalBaseAmount * ethPrice
    case ETH_USDC_ADDRESS.toLowerCase():
      return item.totalBaseAmount // Assuming USDC is priced in ETH
    default:
      return 0
  }
}

const calculateARBHoldingValue = (item: PortfolioDTO, ethPrice: number) => {
  switch (item.token.toLowerCase()) {
    case ETH_ADDRESS.toLowerCase():
      return item.totalBaseAmount * ethPrice
    case ARB_USDC_ADDRESS.toLowerCase():
      return item.totalBaseAmount * (item.price || 1)
    default:
      return 0
  }
}

const TabTokens = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const walletAddresses = useMemo(() => {
    return listWalletsByChain.map((item: UserEmbeddedWalletDto) => item.walletAddress)
  }, [listWalletsByChain])

  const {
    data: tokensData,
    isLoading,
    hasNextPage: hasMore,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['tokensOverview', walletAddresses],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await gqlClient.query({
        query: getPortfolioOverview,
        variables: {
          input: {
            userAddresses: walletAddresses,
            limit: 20,
            page: pageParam,
            sortBy: '-holdingValue',
            allToken: true,
          },
        },
      })
      return (res?.data?.getPortfolioOverview?.data || []) as PortfolioDTO[]
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
        queryKey: ['tokensOverview', walletAddresses],
      })

      // Clear the query cache for meme tokens, except first page
      queryClient.setQueryData(['tokensOverview', walletAddresses], (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.slice(0, 1), // Keep only the first page
          pageParams: oldData.pageParams.slice(0, 1), // Keep only the first page param
        }
      })
    }
  }, [])

  const { solPrice, ethPrice } = useNativeTokenPrices()

  const assets = useMemo(() => {
    if (!tokensData) return []
    return tokensData.pages.flatMap((page) => page || [])
  }, [tokensData?.pages])

  const calculateHoldingValue = (item: PortfolioDTO): number => {
    if (item.chainId === ChainIds.Solana && item.token === SOL_ADDRESS) {
      return item.totalBaseAmount * solPrice
    }
    if (item.chainId === ChainIds.Ethereum) {
      return calculateETHHoldingValue(item, ethPrice)
    }
    if (item.chainId === ChainIds.Arbitrum) {
      return calculateARBHoldingValue(item, ethPrice)
    }
    return item.totalBaseAmount * (item.price || 0)
  }

  const [assetsRefactored, setAssetsRefactored] = useState<PortfolioDTO[]>(assets)

  useEffect(() => {
    const sorted = [...assets].sort((a, b) => {
      if (a.lowLiquidity && !b.lowLiquidity) return 1
      if (!a.lowLiquidity && b.lowLiquidity) return -1

      const holdingValueA = calculateHoldingValue(a)
      const holdingValueB = calculateHoldingValue(b)
      return holdingValueB - holdingValueA
    })
    setAssetsRefactored(sorted)
  }, [assets, solPrice, ethPrice])

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
        loadMoreFn().then(() => {})
      }
    }, 200)
    const container = document.getElementById('desktop-layout-content')
    if (container) {
      container.addEventListener('scroll', throttled)
      return () => container.removeEventListener('scroll', throttled)
    }
    window.addEventListener('scroll', throttled)
    return () => window.removeEventListener('scroll', throttled)
  }, [loadingMore, hasMore, loadMoreFn])

  const TokenItem = useMemo(() => {
    return function AssetsItem({ item }: { item: PortfolioDTO }) {
      const { solPrice, ethPrice } = useNativeTokenPrices()
      const priceOHLC = usePriceOHLC({ address: item?.token ?? '', defaultValue: '0' })
      const priceMqtt = useTokenPrice(item?.token ?? '', '0')
      const fallBackPrice = item?.price || 0
      const price =
        priceOHLC && Number(priceOHLC) != 0 ? Number(priceOHLC) : priceMqtt != 0 ? priceMqtt : Number(fallBackPrice)
      let logo = item?.logoUrl || getBlockChainLogo(item.chainId, item.token)
      if (!logo) {
        const { logo: logoUrl } = useTokenInfo(item.token, item.chainId)
        logo = logoUrl || logo
      }
      const holdingValue = useMemo(() => {
        if (item.chainId === ChainIds.Solana && item.token === SOL_ADDRESS) return item.totalBaseAmount * solPrice
        if (item.chainId === ChainIds.Ethereum) return calculateETHHoldingValue(item, ethPrice)
        if (item.chainId === ChainIds.Arbitrum) return calculateARBHoldingValue(item, ethPrice)
        return item.totalBaseAmount * (Number(price) || item.price || 0)
      }, [item, solPrice, ethPrice, price])
      const handleNavigation = () => {
        if (isNativeToken(item?.chainId, item?.token) || item.isQuoteToken) {
          return
        } else {
          const chainType =
            item.chainId === ChainIds.Ethereum
              ? 'arb'
              : item.chainId === ChainIds.Arbitrum
                ? 'arb'
                : item.chainId === ChainIds.Bsc
                  ? 'bsc'
                  : 'sol'
          const path = item?.isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
          navigate(
            getPath(path, {
              address: item.token,
              chain: chainType,
            }) + '?tab=holding',
            {
              state: { symbol: item?.symbol },
            },
          )
        }
      }

      return (
        <div
          className={`flex justify-between items-center px-3 py-4 hover:bg-[#ECECED14] transition-colors duration-200 ${
            isNativeToken(item?.chainId, item?.token) || item?.isQuoteToken ? '' : 'cursor-pointer'
          }`}
          onClick={handleNavigation}
        >
          <div className="flex items-center gap-2">
            {isNativeToken(item?.chainId, item?.token) ? (
              <NativeTokenIcon
                address={item.token}
                chainId={item.chainId}
                fallbackUrl={logo}
                avatarClassName="w-[28px] h-[28px] m-0"
                avatarImageClassName="size-7"
                className="size-7"
              />
            ) : (
              <LogoWithChain
                logo={logo}
                logoClassName="w-[28px] h-[28px]"
                name={item?.symbol}
                chainLogo={getBlockchainLogo2(item.chainId)}
              />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <div className="font-[380] text-white text-[16px] leading-none">{item?.symbol}</div>
                {item?.isXStock && <IconXStock />}
                {item?.lowLiquidity && (
                  <TooltipProvider>
                    <SimpleTooltip
                      contentClassName="max-w-[75vw]"
                      content={t('assets.overview.lowLiquidityTokenWarning')}
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
              <div className="mt-1.5 flex items-center gap-1">
                <div className="text-white/50 text-[14px] font-[330] leading-none">
                  {isNativeToken(item?.chainId, item?.token)
                    ? getNameFromChainId(item.chainId)
                    : formatAddressWallet(item?.token)}
                </div>
                {!isNativeToken(item?.chainId, item?.token) && !item?.isQuoteToken && <CopyButton text={item?.token} />}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span
              className={cn(
                'font-[450] text-[18px] leading-none text-white',
                item.lowLiquidity ? 'line-through decoration-2' : '',
              )}
            >
              {formatAmount(item?.totalBaseAmount, {
                roundMode: 'floor',
              })}
            </span>
            <div
              className={cn(
                'mt-1 font-[330] text-[14px] leading-none text-white/50',
                item.lowLiquidity ? 'line-through' : '',
              )}
            >
              {formatBalance(holdingValue, {
                roundMode: 'floor',
                showCurrency: true,
              })}
            </div>
          </div>
        </div>
      )
    }
  }, [navigate, t])

  return (
    <div>
      <div className="text-white text-[12px] flex items-center gap-1 px-3 py-2">
        <IconInfo /> {t('assets.overview.tokenListNotice')}
      </div>
      {assetsRefactored.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
        </div>
      ) : (
        assetsRefactored.map((item, index) => {
          return <TokenItem key={`${item.token}-${index}`} item={item} />
        })
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
