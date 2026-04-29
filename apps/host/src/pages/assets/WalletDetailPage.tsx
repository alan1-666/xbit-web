import { FollowingWalletInfo } from '@/@generated/gql/graphql-future'
import ActivityTable from '@/components/assets/wallet/ActivityTable'
import Analysis from '@/components/assets/wallet/Analysis'
import Distribution from '@/components/assets/wallet/Distribution'
import HoldingTable from '@/components/assets/wallet/HoldingTable'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { CopyButton } from '@/components/common/copy-button'
import CurrencyToggle from '@/components/detailTokenTabs/CurrencyToggle'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { IconStar, IconStarActive, IconWalletBalance } from '@/components/icon'
import AliasCard from '@/components/listCoin/card/AliasCard'
import DrawerCopyTrade from '@/components/listCoin/drawer/DrawerCopyTrade'
import { CACHED_FOLLOWING_LIST, FOLLOWED_SMART_MONEY } from '@/components/tokenDetailSmartMoney/FollowedSmartMoney'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TTL_STORAGE } from '@/const/configs'
import { SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS } from '@/const/smartMoney'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import useGetCopyTradeAddress from '@/hooks/useGetCopyTradeAddress'
import useGetTotalFollowingAddress, {
  addXWalletFavourite,
  removeXWalletFavourite,
} from '@/hooks/useGetTotalFollowingAddress'
import { APP_PATH } from '@/lib/constant'
import { getDataUnitByChain } from '@/lib/currency'
import { formatAmount, formatPercent, getStyleRiseFall } from '@/lib/format'
import { futureClient } from '@/lib/gql/apollo-client'
import { cn } from '@/lib/utils'
import { priceChain } from '@/redux/modules/price.slice'
import { setDataUnit } from '@/redux/modules/userSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { getSmartMoneyInfo, getSmartMoneyStatistic } from '@/services/copytrade.service'
import { followWallet, unFollowWallet } from '@/services/wallet.service'
import { CurrencyUnit } from '@/types/currency'
import { UITab } from '@/types/uiTabs.ts'
import { listCoinHelper } from '@/utils/list-coin-helper'
import { getTotalKeysInObject } from '@/utils/object'
import {
  getFromLocalStorageWithTTL,
  loadFirstPageFromStorage,
  saveFirstPageToStorage,
  saveToLocalStorageWithTTL,
} from '@/utils/storage'
import { covertSeconds, formatToTimeAgoI18n } from '@/utils/time'
import { useQuery } from '@apollo/client'
import FilterTime, { FilterTimeOption } from '@components/common/FilterTime'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useActiveChain, useActiveChainType } from '@hooks/useActiveChain.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useQueryClient } from '@tanstack/react-query'
import { get } from 'lodash-es'
import { FC, Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { WalletContextProvider } from './WalletContext'
import ls from '@/lib/local-storage'

const filterTimeOptions: FilterTimeOption[] = [
  {
    value: '1',
    unit: 'D',
  },
  {
    value: '7',
    unit: 'D',
  },
  {
    value: '30',
    unit: 'D',
  },
]

const mockupDistribution = [
  {
    lv: 5,
    tradedAmount: '2',
    profitRate: '0.4',
  },
  {
    lv: 4,
    tradedAmount: '544',
    profitRate: '0.8',
  },
  {
    lv: 3,
    tradedAmount: '34',
    profitRate: '0.3',
  },
  {
    lv: 2,
    tradedAmount: '9',
    profitRate: '0.5',
  },
  {
    lv: 1,
    tradedAmount: '2',
    profitRate: '0.15',
  },
]

const WalletInfo: FC<{ address: string }> = ({ address }) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isCopyTrade, setIsCopyTrade] = useState(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const walletCopyTradeRef = useRef<(() => void) | null>(null)
  const navigate = useNavigate()
  const client = useQueryClient()
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()
  const activeChainType = useActiveChainType()
  const isAllowCreateCopyTrade = useMemo(() => {
    return SMART_MONEY_COPY_TRADE_ALLOWED_CHAINS.includes(activeChain)
  }, [activeChain])

  const {
    data,
    loading: loadingSmartMoneyInfo,
    refetch: refetchSmartMoneyInfo,
  } = useQuery(getSmartMoneyInfo, {
    variables: { req: { address, chain: activeChainType } },
    client: futureClient,
  })

  const { data: followingWallets, cached } = useGetTotalFollowingAddress()
  const { data: listCopyTrade } = useGetCopyTradeAddress()
  useEffect(() => {
    setIsFollowing(followingWallets.includes(address))
  }, [followingWallets])
  useEffect(() => {
    setIsCopyTrade(listCopyTrade.includes(address))
  }, [listCopyTrade])
  const currentWallet = useMemo(() => {
    // displayName={listCoinHelper.formatWalletNameWithEllipsis(name || twitterName || twitterUsername) || listCoinHelper.formatWalletName(address, 10)}
    //             avatar={twitterAvatarUrl}
    return get(data, 'getSmartMoneyInfo', {
      address: '',
      name: 'Unknown Wallet',
      avatar: '/images/icons/default-avatar.png',
      tags: [],
    })
  }, [data])
  
  const handleFlow = (follow: boolean) => {
    setLoading(true)
    futureClient
      .mutate({
        mutation: follow ? followWallet : unFollowWallet,
        variables: {
          input: {
            walletAddress: address,
            chain: activeChainType,
          },
        },
      })
      .then((data) => {
        const followWallet = get(data, 'data.followWallet', false)
        const unFollowWallet = get(data, 'data.unFollowWallet', false)
        if (followWallet) {
          toast.success(t('walletDetail.msg.flow'))
          setIsFollowing(true)
          const newItemFollowed = { address, alias: '' }
          addXWalletFavourite(address, activeChainType)
          const _listFollowed = getFromLocalStorageWithTTL<string[]>(FOLLOWED_SMART_MONEY)
          if (_listFollowed && _listFollowed?.length > 0) {
            _listFollowed.unshift(address)
            saveToLocalStorageWithTTL<string[]>(FOLLOWED_SMART_MONEY, _listFollowed, TTL_STORAGE)
          }
          // Update React Query cache safely
          const walletAddr = activeWallet?.walletAddress
          if (walletAddr) {
            client.setQueryData(
              ['totalFollowings', walletAddr],
              (data?: FollowingWalletInfo[]) => {
                const safeData = Array.isArray(data) ? data : []
                const exists = safeData.some((item) => item?.address === newItemFollowed.address)

                if (!exists) {
                  const selectedItems = getFromLocalStorageWithTTL<string[]>(CACHED_FOLLOWING_LIST) ?? []
                  saveToLocalStorageWithTTL<string[]>(
                    CACHED_FOLLOWING_LIST,
                    [...selectedItems, newItemFollowed?.address],
                    TTL_STORAGE,
                  )
                  return [newItemFollowed, ...safeData]
                }

                return safeData
              },
              // Mark fresh until 90s later
              { updatedAt: Date.now() + 90000 },
            )
          }
        } else if (unFollowWallet) {
          toast.success(t('walletDetail.msg.unflow'))
          removeXWalletFavourite(address, activeChainType)
          setIsFollowing(false)
          // Update React Query cache safely (mirror addToFavorites)
          const walletAddr = activeWallet?.walletAddress
          if (walletAddr) {
            client.setQueryData(
              ['totalFollowings', walletAddr],
              (data?: FollowingWalletInfo[]) => {
                const safeData = Array.isArray(data) ? data : []
                if (!address) return safeData
                const selectedItems = getFromLocalStorageWithTTL<string[]>(CACHED_FOLLOWING_LIST) ?? []
                saveToLocalStorageWithTTL<string[]>(
                  CACHED_FOLLOWING_LIST,
                  selectedItems.filter((item) => item !== address),
                  TTL_STORAGE,
                )
                return safeData.filter((item) => item?.address !== address)
              },
              { updatedAt: Date.now() + 90000 },
            )
          }
        } else {
          toast.warning(t('toast.addFavoriteUnknowFailed'))
        }
      })
      .catch(() => {
        //if user not login, show toast
        toast.warning(activeWallet.isConnected ? t('toast.addFavoriteFailed') : t('walletCopy.warning.login'))
      })
      .finally(() => {
        setLoading(false)
      })
  }
  const lastActivityAt = get(currentWallet, 'lastActivityAt', '')

  return (
    <div className="flex items-center justify-between gap-2 py-[5px]">
      <div className="flex items-center">
        <ChainCurrencyIcon
          currencyIcon={get(currentWallet, 'avatar', '') || get(currentWallet, 'info.twitterAvatarUrl')}
          avatarClassName={cn(
            'aspect-square flex justify-center items-center rounded-[12px]',
            isDesktop ? 'w-[64px] h-[64px]' : 'w-[44px] h-[44px]',
          )}
          avatarImageClassName="w-full h-full absolute w-full"
          className="mr-2 flex items-center justify-center"
          fallbackImageEnable
          fallbackNFT={address}
          skeleton={loadingSmartMoneyInfo}
        />
        {loadingSmartMoneyInfo ? (
          <Skeleton className="w-[400px] h-[44px] relative mr-[10px]" />
        ) : (
          <div>
            <div className="flex items-center pl-[6px]">
              <AliasCard
                address={currentWallet.address}
                name={currentWallet.name}
                twitterName={currentWallet.info?.twitterName}
                walletName={currentWallet.info?.walletName}
                useCopyButton={false}
                classNameWrapper="flex items-center h-[28px]"
                classNameInput="h-[28px] w-[252px] focus:border-[#3E2761] bg-[#1F1E25] px-[12px]"
                classNameAlias={'text-[18px] h-[25px] leading-[25px] ml-0'}
              />
              {/* <div className="mt-1 font-normal text-[18px] leading-none text-white/70 tracking-tight"> */}
              {/* {currentWallet.address?.length > 5
                ? `${listCoinHelper.formatWalletNameCustom(currentWallet.address)}`
                : currentWallet.address} */}
              {/* {listCoinHelper.formatWalletNameWithEllipsis(get(currentWallet, 'name', '') || get(currentWallet, 'info.twitterName', '') || get(currentWallet, 'info.twitterUsername', '')) || listCoinHelper.formatWalletName(address, 10) || listCoinHelper.formatWalletName(get(currentWallet, 'address'), 10)} */}
              {/* </div> */}
              {/* <CopyButton
                  className="w-4 h-4 cursor-pointer hover:scale-[1.1] mt-[2px]"
                  text={currentWallet.address}
                  icon={'/images/icons/icon-copy2.svg'}
                /> */}
              {/* <img
            src="/images/icons/edit.svg"
            className="w-4 h-4 cursor-pointer hover:scale-[1.1]"
            alt="edit"
            onClick={() => { }}
          /> */}
            </div>
            <div className="flex items-center px-1 my-0">
              <span className="text-[14px] text-white/50 leading-[20px]">
                {isDesktop ? currentWallet.address : listCoinHelper.formatWalletNameCustom(currentWallet.address)}
              </span>
              <CopyButton
                className="w-4 h-4 cursor-pointer hover:scale-[1.1] ml-[4px]"
                text={currentWallet.address}
                icon={'/images/icons/icon-copy.svg'}
              />
            </div>
            <div className={cn('flex items-center px-1', isDesktop ? 'text-[12px]' : 'hidden')}>
              <span className="text-[#00FFB4] mr-[4px]">
                {lastActivityAt ? formatToTimeAgoI18n(lastActivityAt) : '--'}
              </span>
              <span className={cn('lowercase', isDesktop ? 'text-[#908E98]' : '')}>
                {t('assets.funding.lastActive')}
              </span>
            </div>
            {/* <WalletTypeBadge type={uniq(currentWallet.tags)} /> */}
          </div>
        )}
      </div>
      <div className="flex gap-[16px]">
        {isDesktop ? (
          <>
            {isAllowCreateCopyTrade && (
              <Button
                className={cn('text-[#C8A7FD]')}
                variant={'normal'}
                onClick={() => {
                  setOpen(true)
                }}
                disabled={isCopyTrade}
              >
                <IconWalletBalance className="!size-[18px]" />
                {t('listCoin.copyTrade.list.empty.button')}
              </Button>
            )}
            <Button
              className={cn('text-[#C8A7FD]')}
              variant={'normal'}
              // isLoading={loading || loadingSmartMoneyInfo}
              onClick={() => handleFlow(!isFollowing)}
            >
              {isFollowing ? (
                <IconStarActive className="!size-[18px]" currentColor="#ffffff" />
              ) : (
                <IconStar className="!size-[18px]" />
              )}
              {isFollowing ? t('walletDetail.btn.unfollow') : t('walletDetail.btn.follow')}
            </Button>
          </>
        ) : (
          <Button
            className={cn(
              'gap-0 px-2 rounded-full relative transition-all duration-100 hover:scale-[1] min-w-[56px] h-[24px] text-xs font-regular',
              isFollowing
                ? 'text-white/80 bg-white/8  border border-white/36 before:bg-none after:bg-none hover:before:none hover:after:none'
                : 'purple-btn-gradient-reverse text-white',
            )}
            variant={'default'}
            isLoading={loading || loadingSmartMoneyInfo}
            onClick={() => handleFlow(!isFollowing)}
          >
            {isFollowing ? t('walletDetail.btn.unfollow') : t('walletDetail.btn.follow')}
          </Button>
        )}
      </div>
      {isDesktop ? (
        <DrawerCopyTrade
          open={open}
          setOpen={setOpen}
          leaderAddress={address}
          onSuccess={() => {
            // Trigger reload of WalletCopyTrade when copy trade is created
            if (walletCopyTradeRef.current) {
              walletCopyTradeRef.current()
            }
            navigate(`${APP_PATH.MEME_SMART_MONEY}?tab=walletCopy`)
          }}
        />
      ) : null}
    </div>
  )
}

/**
 *
 * Giá trị Total pnl = RealizedPnL + UnrealizedPnL
 * %totalpnl = Total PnL / TotalBuy * 100
 */

const WalletStatistics: FC<{ address: string; duration: number; dataUnit: CurrencyUnit; isPC: boolean }> = ({
  address,
  duration = 7,
  dataUnit = 'USD',
  isPC = false,
}) => {
  const [distribution, setDistribution] = useState(mockupDistribution)
  const activeChain = useActiveChain()
  const nativeTokenPrice = useAppSelector(priceChain(activeChain))
  const activeChainType = useActiveChainType()
  const { data, loading } = useQuery(getSmartMoneyStatistic, {
    variables: { input: { address, chain: activeChainType, dayDuration: duration } },
    client: futureClient,
  })

  const currentWallet = useMemo(() => {
    return get(data, 'getSmartMoneyStatistic', {})
  }, [data])
  useEffect(() => {
    if (currentWallet) {
      const _total = getTotalKeysInObject(currentWallet, [
        'pnlGt5xNum',
        'pnl2xTo5xNum',
        'pnlLt2xNum',
        'pnlLtMinusDot5Num',
        'pnlMinusDot5To0xNum',
      ])
      const _distribution = [
        {
          lv: 5,
          tradedAmount: String(get(currentWallet, 'pnlGt5xNum', '0')),
          profitRate: String(_total ? currentWallet.pnlGt5xNum / _total : 0),
        },
        {
          lv: 4,
          tradedAmount: String(get(currentWallet, 'pnl2xTo5xNum', '0')),
          profitRate: String(_total ? currentWallet.pnl2xTo5xNum / _total : 0),
        },
        {
          lv: 3,
          tradedAmount: String(get(currentWallet, 'pnlLt2xNum', '0')),
          profitRate: String(_total ? currentWallet.pnlLt2xNum / _total : 0),
        },
        {
          lv: 2,
          tradedAmount: String(get(currentWallet, 'pnlMinusDot5To0xNum', '0')),
          profitRate: String(_total ? currentWallet.pnlMinusDot5To0xNum / _total : 0),
        },
        {
          lv: 1,
          tradedAmount: String(get(currentWallet, 'pnlLtMinusDot5Num', '0')),
          profitRate: String(_total ? currentWallet.pnlLtMinusDot5Num / _total : 0),
        },
      ]
      setDistribution(_distribution)
    }
  }, [data])
  const _endPercent = currentWallet.realizedPnlUsd / currentWallet.buyAmountUsd
  const isUSD = useMemo(() => dataUnit === 'USD', [dataUnit])
  return (
    <Fragment>
      <div className="mt-1 flex items-end gap-[6px] h-[36px]">
        <div
          className={cn(
            'font-semibold text-[32px] text white leading-none flex items-center',
            // getStyleRiseFall(currentWallet.realizedPnlUsd),
          )}
        >
          <span className={cn('text-[32px]')}>
            {isUSD
              ? formatAmount(currentWallet.realizedPnlUsd, {
                  showSign: true,
                  showCurrency: true,
                  roundMode: 'floor',
                })
              : formatAmount(currentWallet.realizedPnlUsd / nativeTokenPrice, {
                  showSign: true,
                  unit: dataUnit,
                  roundMode: 'floor',
                })}
          </span>
        </div>
        <div
          className={cn(
            'text-[15px] leading-none ml-[2px] flex text-white',
            getStyleRiseFall(currentWallet.realizedPnlUsd),
          )}
        >
          <span className="inline-block mr-[2px] min-w-[5px] whitespace-nowrap">
            {formatPercent(_endPercent * 100, {
              showSign: true,
            })}
          </span>
        </div>
      </div>
      <div className={cn(isPC ? 'flex justify-stretch gap-5 mt-5' : 'block mt-4 gap-4')}>
        <Analysis
          isLoading={loading}
          period={`${duration}D`}
          data={{
            wallets: get(currentWallet, 'tokenHoldings', []),
            totalRealizedPnlUsd: get(currentWallet, 'totalRealizedPnlUsd', '0'),
            avgPriceUsd: get(currentWallet, 'avgPriceUsd', '0'),
            realizedPnlUsd: get(currentWallet, 'realizedPnlUsd', '0'),
            buyAmountUsd: get(currentWallet, 'buyAmountUsd', '0'),
            avgBuyAmountUsd: get(currentWallet, 'avgBuyAmountUsd', '0'),
            avgDuration: covertSeconds(get(currentWallet, 'avgHoldDuration', 0), 'd'),
            tokenAvgRealizedProfits: get(currentWallet, 'avgRealizedPnlUsd', '0'),
            txsBuy: get(currentWallet, 'buys', '0'),
            txsSell: get(currentWallet, 'sells', '0'),
          }}
          dataUnit={dataUnit}
          address={address}
          isPC={isPC}
          className="flex-1"
        />
        <Distribution
          period={`${duration}D`}
          data={distribution}
          className={
            isPC ? 'max-w-[560px] 2xl:max-w-[900px] flex-1 bg-[#101114] rounded-[6px] px-[22px] py-[16px] mt-0' : ''
          }
          isPC={isPC}
        />
      </div>
    </Fragment>
  )
}

const WalletDetailPage = () => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const { address } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentFilterTimeIndex, setCurrentFilterTimeIndex] = useState<number>(1)
  const [period, setPeriod] = useState<string>('1D')
  const [currentTab, setCurrentTab] = useState(
    loadFirstPageFromStorage<string>(`walletTab.${address}`, searchParams.get('tab') || 'Summary'),
  )
  const dispatch = useAppDispatch()
  const dataUnit = useAppSelector((state) => state.userSettings.dataUnit)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const location = useLocation()
  const tabs: UITab[] = [
    {
      value: 'Summary',
      label: t('walletDetail.summary'),
    },
    {
      value: 'Holdings',
      label: t('walletDetail.holdings.title'),
    },
    {
      value: 'Activity',
      label: t('walletDetail.activity.title'),
    },
  ]
  // Saves the router's state to help return to the correct sear page
  useEffect(() => {
    if (location?.state?.fromSearch) {
      ls.set('historyRouterInLocal', location?.state?.fromSearch)
    }
  }, [location?.state])

  useEffect(() => {
    const selectedOption = filterTimeOptions[currentFilterTimeIndex]
    if (selectedOption) {
      setPeriod(`${selectedOption.value}${selectedOption.unit}`)
    }
  }, [currentFilterTimeIndex])

  useEffect(() => {
    saveFirstPageToStorage(`walletTab.${address}`, currentTab)
    if (searchParams.get('tab') !== currentTab) {
      searchParams.set('tab', currentTab)
      setSearchParams(searchParams, { replace: true })
    }
  }, [currentTab])

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case 'Summary':
        return <HoldingTable key={`${address}-false`} address={address!} dataUnit={dataUnit} isOnlyHolding={false} />
      case 'Holdings':
        return <HoldingTable key={`${address}-true`} address={address!} dataUnit={dataUnit} isOnlyHolding={true} />
      case 'Activity':
        return <ActivityTable key={`${address}-activity`} address={address!} dataUnit={dataUnit} />
      default:
        return null
    }
  }

  function handleChangeDataUnit() {
    if (dataUnit === 'USD') {
      dispatch(setDataUnit(getDataUnitByChain(activeChain)))
    } else {
      dispatch(setDataUnit('USD'))
    }
  }

  const handleBack = () => {
    const referrer = searchParams.get('referrer')
    if (referrer === 'monitoring') {
      navigate(`${APP_PATH.MEME_SMART_MONEY}?tab=monitoring&page=following`, { replace: true })
    } else if (referrer === 'monitoring_tx') {
      navigate(`${APP_PATH.MEME_SMART_MONEY}?tab=monitoringpage=realTimeTransactions`, { replace: true })
    } else {
      if (history.length > 1) {
        const historyRouterInLocal = ls.get('historyRouterInLocal')
        if (historyRouterInLocal) {
          navigate(historyRouterInLocal)
          ls.remove('historyRouterInLocal')
        } else {
          history.back()
        }
      } else {
        navigate(APP_PATH.MEME_SMART_MONEY)
      }
    }
  }

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <HeaderWithBack
        title={''}
        className={cn(
          'justify-center bg-transparent top-0 left-0 right-0 max-w-[768px] mx-auto',
          isDesktop ? 'hidden' : '',
        )}
        titleClassName="ml-0"
        // right={<a href='#' className="">
        //   <img src="/images/detailHeader/icon-share.svg" alt="" />
        // </a>}
        onBack={handleBack}
      />
      <WalletContextProvider>
        <div
          className={cn(
            'px-2.5 max-h-[calc(_100vh_-_48px)] overflow-x-hidden overflow-y-auto no-scrollbar bg-[#0a0a0a]',
            isDesktop ? 'p-4' : 'p-2.5',
          )}
        >
          {address ? <WalletInfo address={address} /> : null}
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-start gap-0.5 flex-1 pr-2 leading-[15px]">
              <div className="text-[15px] text-white inline-flex items-center">
                {t('walletDetail.analysis.pnl', { period: period })}
              </div>
              <button
                type="button"
                className="flex items-center gap-[2px] cursor-pointer transition-all duration-300 hover:opacity-80"
                onClick={handleChangeDataUnit}
              >
                <img src="/images/icons/fund-icon.svg" alt="" className="w-[16px] h-[16px]" />
                <span className="text-[12px] text-white/70">{dataUnit}</span>
              </button>
            </div>
            <FilterTime
              options={filterTimeOptions}
              defaultSelectedIndex={currentFilterTimeIndex}
              onChange={setCurrentFilterTimeIndex}
              className={cn(
                'p-0.5 m-0',
                isDesktop ? 'bg-[#212127] rounded-md border-[0.5px] border-[#101114]' : 'bg-[#D3D3D30A] rounded',
              )}
              classNameItem={cn(
                'h-[24px] text-[12px] bg-none transition-colors duration-200',
                isDesktop ? 'text-[#79778C]' : 'text-white/70',
              )}
              classNameItemActive={cn(
                '',
                isDesktop
                  ? 'text-[#C8A7FD] bg-[#3E2761]'
                  : 'text-white bg-[rgba(236, 236, 237, 0.08)] purple-border-gradient',
              )}
            />
          </div>
          {address ? (
            <WalletStatistics
              address={address}
              duration={parseInt(filterTimeOptions[currentFilterTimeIndex].value)}
              dataUnit={dataUnit}
              isPC={isDesktop}
            />
          ) : null}
          <div className="mt-[8px] pt-0 flex justify-between items-center ml-[-10px]">
            <MovingLineTabs
              tabs={tabs}
              defaultTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab)}
              containerClassName="justify-start bg-transparent h-[40px] items-end"
              itemClassName={cn('text-base')}
            />
            <CurrencyToggle />
          </div>
          <div className="mt-3 pb-2">{renderTabContent(currentTab)}</div>
        </div>
      </WalletContextProvider>
    </div>
  )
}

export default WalletDetailPage
