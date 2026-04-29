import { WalletDuration } from '@/@generated/gql/graphql-core.ts'
import SelectHistory from '@/components/assets/history/SelectHistory'
import SelectAccount from '@/components/assets/overview/SelectAccount'
import BottomSheet from '@/components/common/BottomSheet'
import Loader from '@/components/common/Loader'
import { APP_PATH } from '@/lib/constant'
import { formatAmount, formatBalance, formatPercent } from '@/lib/format'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { cn, getPath } from '@/lib/utils.ts'
import { assetsActions } from '@/redux/modules/assets.slice.ts'
import {
  setIsHiddenSmallPoll,
  setIsHiddenSmallerThan1U,
  setIsShowOnlyCurrentCurrency,
} from '@/redux/modules/holding.slice.ts'
import { setCurrentHoldingTab } from '@/redux/modules/tradeTab.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, formatWalletName, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import ExchangeActions from '@components/assets/overview/ExchangeActions.tsx'
import AddNewWallet from '@components/auth/ManagementWallets/AddNewWallet.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconArrowDown2, IconEmpty } from '@components/icon'
import IconClock from '@components/icon/stroke/IconClock.tsx'
import IconFilter from '@components/icon/stroke/IconFilter3.tsx'
import IconFilterSolid from '@components/icon/stroke/IconFilter3Solid'
import { IconWarning } from '@components/icon/stroke/IconWarning.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { Configs } from '@const/configs.ts'
import { useNativeTokenPrices } from '@hooks/useNativeTokenPrices.ts'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { usePriceOHLC } from '@hooks/useTokenPriceChange.ts'
import { useWalletBalances } from '@pages/assets/overview/hooks/useWalletBalances.ts'
import { getPortfolio } from '@services/tokens.service.ts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

const TokenItem = (props: { data: any }) => {
  const { data } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { hideBalance } = useContext(AssetOverviewContext)
  const priceOHLC = usePriceOHLC({ address: data?.token ?? '', defaultValue: '0' })
  const priceMqtt = useTokenPrice(data?.token ?? '', '0')
  const price =
    priceOHLC && Number(priceOHLC) != 0 ? Number(priceOHLC) : priceMqtt != 0 ? priceMqtt : Number(data?.price)
  const price24hChange = data?.price24hChange || 0
  const totalBaseAmount = data?.totalBaseAmount || 0
  const holdingValue = totalBaseAmount * Number(price || 0)
  const lowLiquidity = data?.lowLiquidity || false

  const handleNavigation = () => {
    const chainType =
      data.chainId === ChainIds.Ethereum
        ? 'arb'
        : data.chainId === ChainIds.Arbitrum
          ? 'arb'
          : data.chainId === ChainIds.Bsc
            ? 'bsc'
            : data.chainId === ChainIds.Mon
              ? 'mon'
              : 'sol'
    dispatch(setCurrentHoldingTab('holding'))
    dispatch(setIsHiddenSmallPoll(false))
    dispatch(setIsHiddenSmallerThan1U(false))
    dispatch(setIsShowOnlyCurrentCurrency(true))
    const path = data?.isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL
    navigate(
      getPath(path, {
        address: data.token,
        chain: chainType,
      }) + '?tab=holding',
      {
        state: {
          symbol: data.symbol,
          tokenLogo: data.logoUrl,
          address: data.token,
          chainId: data.chainId,
        },
      },
    )
  }

  return (
    <div
      className={cn('relative rounded-[20px] overflow-hidden', data?.isQuoteToken ? '' : 'cursor-pointer')}
      onClick={() => {
        if (data?.isQuoteToken) return
        handleNavigation()
      }}
    >
      <img
        className="absolute inset-0 w-[68px] h-[68px] object-cover blur-3xl"
        src={
          data?.logoUrl
            ? data?.logoUrl
            : data?.isQuoteToken
              ? getBlockChainLogo(data.chainId, data?.token, data?.symbol)
              : ''
        }
        alt=""
      />
      <div className="flex items-center justify-between rounded-[20px] border border-[#2F2A4680] bg-linear-to-r from-[#FFFFFF05] to-[#FFFFFF0A] p-3">
        <div className="flex items-center gap-2">
          <LogoWithChain
            logo={
              data?.logoUrl
                ? data?.logoUrl
                : data?.isQuoteToken
                  ? getBlockChainLogo(data.chainId, data?.token, data?.symbol)
                  : ''
            }
            logoClassName="size-11"
            name={data?.symbol}
            chainLogo={getBlockchainLogo2(data.chainId)}
            chainContainerClassName="size-[15px]"
          />
          <div>
            <div className="flex items-center gap-2 text-[16px] leading-4 font-semibold text-white">
              {data?.symbol}
              {data?.isXStock && <IconXStock />}
              {lowLiquidity && (
                <TooltipProvider>
                  <SimpleTooltip content={t('assets.overview.lowLiquidityTokenWarning')}>
                    <IconWarning className="size-4" />
                  </SimpleTooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[12px] leading-3">
              <span className={cn('text-[#908E98]', lowLiquidity ? 'line-through' : '')}>
                {hideBalance
                  ? '*****'
                  : formatBalance(price, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })}
              </span>
              {!data?.isQuoteToken && (
                <span
                  className={cn(
                    Number(price24hChange) > 0
                      ? 'text-rise'
                      : Number(price24hChange) < 0
                        ? 'text-fall'
                        : 'text-[#FBFBFB]',
                    data?.lowLiquidity ? 'line-through' : '',
                  )}
                >
                  {formatPercent(price24hChange ?? 0, {
                    showSign: true,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className={cn('text-[16px] leading-4 font-medium', lowLiquidity ? 'line-through' : '')}>
            {hideBalance
              ? '*****'
              : formatAmount(totalBaseAmount, {
                  roundMode: 'floor',
                })}
          </div>
          <div className={cn('text-[12px] leading-3 font-light text-[#908E98]', lowLiquidity ? 'line-through' : '')}>
            {hideBalance ? '*****' : '≈' + formatBalance(holdingValue, { showCurrency: true, roundMode: 'floor' })}
          </div>
        </div>
      </div>
    </div>
  )
}

const Funding = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { chainId, wallet } = location.state || {}
  const navigate = useNavigate()
  const { solPrice, bnbPrice, monPrice } = useNativeTokenPrices()
  const { hideBalance, toggleHideBalance } = useContext(AssetOverviewContext)
  // const { hideBalance, toggleHideBalance, fundingBalance, fundingChange } = useContext(AssetOverviewContext)
  // const changeAmount = fundingChange?.changeAmount || 0
  // const changePercent = fundingChange?.changePercentage || 0

  const toggle = () => {
    toggleHideBalance(!hideBalance)
  }
  const [openSelectMemeAccountToDeposit, setOpenSelectMemeAccountToDeposit] = useState(false)
  const [openSelectMemeAccountToWithdraw, setOpenSelectMemeAccountToWithdraw] = useState(false)
  const [openSelectHistory, setOpenSelectHistory] = useState(false)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const solWallets = useMemo(
    () =>
      listWalletsByChain
        .filter((wallet: any) => wallet.chain === 'SOLANA')
        .map((wallet: any) => ({
          ...wallet,
          usdBalance: wallet?.balance ? wallet.balance * (solPrice || 0) : 0,
        })),
    [listWalletsByChain, solPrice],
  )
  const bscWallets = useMemo(
    () =>
      listWalletsByChain
        .filter((wallet: any) => wallet.chain === 'BSC')
        .map((wallet: any) => ({
          ...wallet,
          usdBalance: wallet?.balance ? wallet.balance * (bnbPrice || 0) : 0,
        })),
    [listWalletsByChain, bnbPrice],
  )
  const monadWallets = useMemo(
    () =>
      listWalletsByChain
        .filter((wallet: any) => wallet.chain === 'MON')
        .map((wallet: any) => ({
          ...wallet,
          usdBalance: wallet?.balance ? wallet.balance * (monPrice || 0) : 0,
        })),
    [listWalletsByChain, monPrice],
  )
  const networks = useMemo(() => {
    return [
      {
        chainId: ChainIds.Solana,
        balance: solWallets.reduce((acc: number, wallet: any) => acc + (wallet.balance || 0), 0),
        usdBalance: solWallets.reduce((acc: number, wallet: any) => acc + (wallet.balance || 0) * (solPrice || 0), 0),
      },
      {
        chainId: ChainIds.Bsc,
        balance: bscWallets.reduce((acc: number, wallet: any) => acc + (wallet.balance || 0), 0),
        usdBalance: bscWallets.reduce((acc: number, wallet: any) => acc + (wallet.balance || 0) * (bnbPrice || 0), 0),
      },
      {
        chainId: ChainIds.Mon,
        balance: monadWallets.reduce((acc: number, wallet: any) => acc + (wallet.balance || 0), 0),
        usdBalance: monadWallets.reduce((acc: number, wallet: any) => acc + (wallet.balance || 0) * (monPrice || 0), 0),
      },
    ]
  }, [solWallets, bscWallets, solPrice, bnbPrice, monadWallets, monPrice])
  // const [networkSelected, setNetworkSelected] = useState<ChainIds>(chainId ?? Configs.getDefaultPortfolioChain())
  const dispatch = useDispatch()
  const networkSelected = useAppSelector((state) => state.assets.memeChainId as ChainIds)
  const [openSelectNetwork, setOpenSelectNetwork] = useState(false)
  const [walletSelected, setWalletSelected] = useState<string>(
    (wallet ?? networkSelected === ChainIds.Solana)
      ? solWallets[0]?.walletAddress || ''
      : networkSelected === ChainIds.Bsc
        ? bscWallets[0]?.walletAddress || ''
        : networkSelected === ChainIds.Mon
          ? monadWallets[0]?.walletAddress || ''
          : solWallets[0]?.walletAddress || '',
  )
  const [openSelectWallet, setOpenSelectWallet] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const [hideSmallBalance, setHideSmallBalance] = useState(false)
  const [hideSmallLiquidity, setHideSmallLiquidity] = useState(false)

  const setNetworkSelected = useCallback((chainId: number) => {
    dispatch(assetsActions.setMemeChainId(chainId))
  }, [])

  const wallets = useWalletBalances({
    duration: WalletDuration.D1,
    chainId: networkSelected,
    walletAddress: walletSelected,
  })

  const fundingBalance = useMemo(() => {
    const fundingWallet = wallets?.funding || []
    return fundingWallet[0]?.usdBalance || 0
  }, [wallets])

  const changeAmount = useMemo(() => {
    const fundingWallet = wallets?.funding || []
    return fundingWallet[0]?.balanceChangeUsd || 0
  }, [wallets])

  const changePercent = useMemo(() => {
    if (changeAmount == 0) return 0
    if (fundingBalance - changeAmount <= 0) return 100
    return (changeAmount / (fundingBalance - changeAmount)) * 100
  }, [fundingBalance, changeAmount])

  const unrealizedPnl = useMemo(() => {
    const fundingWallet = wallets?.funding || []
    if (fundingWallet.length === 0) return 0
    return fundingWallet[0]?.unrealizedPnl || 0
  }, [wallets])

  const loadingBalance = useMemo(() => {
    return wallets.funding === undefined
  }, [wallets.funding])

  const {
    data: portfolio,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['portfolio', networkSelected, walletSelected, hideSmallBalance, hideSmallLiquidity],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await gqlClient.query({
        query: getPortfolio,
        variables: {
          input: {
            chainId: networkSelected,
            userAddress: walletSelected,
            hideSmallBalance: hideSmallBalance,
            hideSmallLiquidity: hideSmallLiquidity,
            limit: 20,
            page: pageParam,
            sortBy: '-holdingValue',
            allToken: true,
          },
        },
      })
      return (res?.data?.getPortfolio?.data || []) as any[]
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined
      return allPages.length + 1
    },
  })

  const portfolioData = useMemo(() => {
    const data = portfolio?.pages.flat() || []

    return [...data].sort((a, b) => {
      const holdingValueA = (a?.totalBaseAmount || 0) * Number(a?.price || 0)
      const holdingValueB = (b?.totalBaseAmount || 0) * Number(b?.price || 0)
      const lowLiquidityA = a?.lowLiquidity || false
      const lowLiquidityB = b?.lowLiquidity || false

      if (lowLiquidityA && !lowLiquidityB) return 1
      if (!lowLiquidityA && lowLiquidityB) return -1

      return holdingValueB - holdingValueA
    })
  }, [portfolio])

  useEffect(() => {
    if (networkSelected === ChainIds.Solana) {
      setWalletSelected(solWallets[0]?.walletAddress)
    } else if (networkSelected === ChainIds.Bsc) {
      setWalletSelected(bscWallets[0]?.walletAddress)
    } else if (networkSelected === ChainIds.Mon) {
      setWalletSelected(monadWallets[0]?.walletAddress)
    } else {
      setWalletSelected(solWallets[0]?.walletAddress)
    }
  }, [networkSelected])

  useEffect(() => {
    if (!chainId && !wallet) return
    const newChainId = chainId ?? Configs.getDefaultPortfolioChain()
    setNetworkSelected(newChainId)
    if (newChainId === ChainIds.Solana) {
      setWalletSelected(solWallets[0]?.walletAddress || '')
    } else if (newChainId === ChainIds.Bsc) {
      setWalletSelected(bscWallets[0]?.walletAddress || '')
    } else if (newChainId === ChainIds.Mon) {
      setWalletSelected(monadWallets[0]?.walletAddress || '')
    } else {
      setWalletSelected(solWallets[0]?.walletAddress || '')
    }
  }, [chainId, wallet])

  useEffect(() => {
    const handleScroll = () => {
      const body = document.body
      const doc = document.documentElement
      const scrollTop = body.scrollTop || doc.scrollTop
      const scrollHeight = body.scrollHeight || doc.scrollHeight
      const clientHeight = window.innerHeight
      if (!scrollHeight) return

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage >= 0.75 && !isLoading) {
        fetchNextPage?.()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, fetchNextPage])

  return (
    <div className="h-full">
      <div className="flex min-h-[240px] flex-col items-center justify-between bg-transparent">
        <div className="flex-1 flex flex-col items-center space-y-2 justify-center">
          <div className="font-semi-bold cursor-pointer text-[32px] leading-8" onClick={toggle}>
            {loadingBalance ? (
              <Loader />
            ) : hideBalance ? (
              '*****'
            ) : (
              formatBalance(fundingBalance, {
                showCurrency: true,
                roundMode: 'floor',
              })
            )}
          </div>
          <div
            className={cn(
              'flex items-center gap-2 text-[16px] leading-4',
              changeAmount > 0 ? 'text-rise' : changeAmount < 0 ? 'text-fall' : 'text-white',
            )}
          >
            <span>
              {loadingBalance ? (
                <Loader />
              ) : hideBalance ? (
                '*****'
              ) : (
                formatBalance(changeAmount, {
                  showSign: true,
                  showCurrency: true,
                  roundMode: 'floor',
                })
              )}
            </span>
            <span
              className={cn(
                'rounded-[4px] px-2 py-[2.5px]',
                changePercent > 0 ? 'bg-rise/15' : changePercent < 0 ? 'bg-fall/15' : 'bg-white/15',
              )}
            >
              {loadingBalance ? (
                <Loader />
              ) : (
                formatPercent(changePercent, {
                  showSign: true,
                })
              )}
            </span>
          </div>
        </div>
        <ExchangeActions
          onDepositClick={() => setOpenSelectMemeAccountToDeposit(true)}
          onWithdrawClick={() => setOpenSelectMemeAccountToWithdraw(true)}
          onTransferClick={() => navigate(`${APP_PATH.CRYPTO_DEPOSIT}?source=funding`)}
        />
      </div>
      <div className="mt-5 pt-3 flex-1 bg-[#0A0A0A] rounded-t-2xl">
        <div className="sticky top-0 z-20 bg-[#0A0A0A] px-4 py-1 flex items-center justify-between">
          <div
            className="flex cursor-pointer items-center gap-2 text-[18px] font-medium text-white"
            onClick={() => {
              setOpenSelectNetwork(true)
              // setOpenSelectWallet(true)
            }}
          >
            <LogoWithChain
              logo={getBlockchainLogo2(networkSelected)}
              logoClassName="w-5 h-5 min-w-5"
              name={BLOCKCHAIN_NAMES[networkSelected]}
            />
            {BLOCKCHAIN_NAMES[networkSelected]}
            {/* {formatWalletName(walletSelected)} */}
            <IconArrowDown2 />
          </div>
          <div className="flex items-center gap-2">
            <span className="cursor-pointer" onClick={() => setOpenFilter(true)}>
              {hideSmallBalance || hideSmallLiquidity ? (
                <IconFilterSolid className="h-4 cursor-pointer text-[#908E98]" />
              ) : (
                <IconFilter className="h-4 cursor-pointer text-[#908E98]" />
              )}
            </span>

            <IconClock
              className="size-4 cursor-pointer text-[#908E98]"
              onClick={() => {
                setOpenSelectHistory(true)
              }}
            />
          </div>
        </div>
        <div className="no-scrollbar mt-1 pb-[80px] overflow-auto px-4 pt-2.5">
          <div className="flex items-center justify-between rounded-[10px] border border-[#2F2A4680] bg-linear-to-r from-[#FFFFFF05] to-[#FFFFFF0A] p-3 text-[14px] leading-[14px]">
            <span>{t('assets.perps.unrealProfit')}</span>
            <span
              className={cn(
                unrealizedPnl > 0 ? 'text-rise' : '',
                unrealizedPnl < 0 ? 'text-fall' : '',
                unrealizedPnl === 0 ? 'text-white' : '',
              )}
            >
              {hideBalance ? '*****' : formatBalance(unrealizedPnl, { showCurrency: true, roundMode: 'floor' })}
            </span>
          </div>

          {networkSelected === ChainIds.Solana && (
            <div className="mt-3.75">
              <div
                className="flex cursor-pointer items-center gap-2 text-[18px] font-medium text-white"
                onClick={() => {
                  setOpenSelectWallet(true)
                }}
              >
                {/* <WalletAvatar address={walletSelected} className="size-8 rounded-[4px]" rounded={false} /> */}
                {formatWalletName(walletSelected)}
                <IconArrowDown2 />
              </div>
            </div>
          )}

          <div className="mt-3.75">
            {isLoading && (
              <div>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-17 rounded-[10px]" />
                  ))}
                </div>
              </div>
            )}
            {portfolioData.length === 0 && !isLoading && (
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-2',
                  networkSelected === ChainIds.Solana ? 'h-[calc(100vh-540px)]' : 'h-[calc(100vh-500px)]',
                )}
              >
                <IconEmpty />
                <span className="max-w-[320px] text-center text-[0.75rem] text-[#FFFFFF80]">{t('history.nodata')}</span>
              </div>
            )}
            {portfolioData.length > 0 && (
              <div className="space-y-2">
                {portfolioData.map((token: any, index: number) => (
                  <div key={index}>
                    <TokenItem data={token} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <SelectHistory
        open={openSelectHistory}
        setOpen={setOpenSelectHistory}
        onSelected={(type) => {
          if (type === 'assetHistory') {
            navigate(APP_PATH.ASSET_HISTORY + '?page=meme', {
              state: { wallet: walletSelected, chainId: networkSelected },
            })
          } else if (type === 'tradeHistory') {
            navigate(APP_PATH.TRADE_HISTORY + '?page=meme', {
              state: { wallet: walletSelected, chainId: networkSelected },
            })
          }
        }}
      />

      <SelectAccount
        open={openSelectMemeAccountToDeposit}
        setOpen={setOpenSelectMemeAccountToDeposit}
        onAccountSelected={(account) => {
          const { chainId, wallet } = account
          const depositType = ChainIds.Solana === chainId ? 'SOL' : ChainIds.Mon === chainId ? 'MON' : 'BNB'
          navigate(`${APP_PATH.DEPOSIT}`, { state: { type: depositType, wallet: wallet, from: 'meme' } })
        }}
      />
      <SelectAccount
        open={openSelectMemeAccountToWithdraw}
        setOpen={setOpenSelectMemeAccountToWithdraw}
        onAccountSelected={(account) => {
          const { chainId, wallet, tokenAddress } = account
          let path = `${APP_PATH.WITHDRAWAL}?token=${
            chainId == ChainIds.Solana ? 'SOL' : chainId == ChainIds.Mon ? 'MON' : 'BNB'
          }&chainId=${chainId}&tokenAddress=${tokenAddress}`
          if (wallet) {
            path += `&walletAddress=${wallet}`
          }
          navigate(path, { state: { from: 'meme' } })
        }}
      />
      {/* <SelectAccount
        open={openSelectWallet}
        setOpen={setOpenSelectWallet}
        title={t('assets.meme.selectWallet')}
        onAccountSelected={(account) => {
          const { chainId, wallet } = account
          setNetworkSelected(chainId)
          setWalletSelected(wallet || '')
          setOpenSelectWallet(false)
        }}
        defaultExpanded
        showAddWallet
      /> */}
      <BottomSheet
        open={openSelectWallet}
        setOpen={setOpenSelectWallet}
        title={t('assets.meme.selectWallet')}
        hiddenBgImg
      >
        <div className="">
          <div className="no-scrollbar max-h-[calc(80vh-150px)] overflow-auto">
            {solWallets.map((wallet: any) => {
              return (
                <div
                  key={wallet.walletAddress}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-[4px] p-2.75',
                    walletSelected === wallet.walletAddress ? 'bg-[#18181D]' : '',
                  )}
                  onClick={() => {
                    setWalletSelected(wallet.walletAddress)
                    setOpenSelectWallet(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <WalletAvatar address={wallet.walletAddress} className="size-9 rounded-[4px]" rounded={false} />
                    <div className="text-[14px]">{formatWalletName(wallet.walletAddress)}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-[16px] leading-4 font-semibold text-white">
                      {hideBalance
                        ? '*****'
                        : formatAmount(wallet.balance, {
                            roundMode: 'floor',
                          })}
                    </div>
                    <div className="text-[11px] leading-[11px] font-light text-[#908E98]">
                      {hideBalance
                        ? '*****'
                        : formatBalance(wallet.usdBalance, {
                            showCurrency: true,
                            roundMode: 'floor',
                          })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5">
            <AddNewWallet />
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={openSelectNetwork}
        setOpen={setOpenSelectNetwork}
        title={t('assets.meme.selectNetwork')}
        hiddenBgImg
      >
        <div>
          {networks.map((network) => (
            <div
              key={network.chainId}
              className="py-3 cursor-pointer"
              onClick={() => {
                setNetworkSelected(network.chainId)
                setOpenSelectNetwork(false)
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex cursor-pointer items-center gap-2">
                  <LogoWithChain
                    logo={getBlockchainLogo2(network.chainId)}
                    logoClassName="size-[38px]"
                    name={BLOCKCHAIN_NAMES[network.chainId]}
                  />
                  <div className="text-[16px] leading-4 font-semibold">{BLOCKCHAIN_NAMES[network.chainId]}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[16px] leading-4 font-semibold text-white">
                    {hideBalance
                      ? '*****'
                      : formatAmount(network.balance, {
                          roundMode: 'floor',
                        })}
                  </div>
                  <div className="text-[11px] leading-[11px] font-light text-[#908E98]">
                    {hideBalance
                      ? '*****'
                      : formatBalance(network.usdBalance, {
                          showCurrency: true,
                          roundMode: 'floor',
                        })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
      <BottomSheet open={openFilter} setOpen={setOpenFilter} title={t('assets.meme.filter')} hiddenBgImg>
        <div>
          <div
            className="flex cursor-pointer items-center justify-between py-5 text-[16px] leading-4 font-semibold"
            onClick={() => setHideSmallBalance(!hideSmallBalance)}
          >
            {t('assets.funding.hideSmallAssets')}
            {hideSmallBalance ? (
              <img src="/images/icons/icon-check-2.svg" alt="check" className="size-6" />
            ) : (
              <img src="/images/icons/icon-uncheck.svg" alt="check" className="size-6" />
            )}
          </div>
          <div
            className="flex cursor-pointer items-center justify-between py-5 text-[16px] leading-4 font-semibold"
            onClick={() => setHideSmallLiquidity(!hideSmallLiquidity)}
          >
            {t('holding.filter.hideSmallLiquidityPool')}
            {hideSmallLiquidity ? (
              <img src="/images/icons/icon-check-2.svg" alt="check" className="size-6" />
            ) : (
              <img src="/images/icons/icon-uncheck.svg" alt="check" className="size-6" />
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Funding
