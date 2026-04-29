import { TokenDetail } from '@/@generated/gql/graphql-future'
import { TransactionType } from '@/@generated/gql/graphql-trading.ts'
import CurrentPosition from '@/components/myPositions/CurrentPosition'
import PositionItem from '@/components/myPositions/PositionItem'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import ls from '@/lib/local-storage.ts'
import { SwitchWalletFormTrade } from '@/pages/detail/orderForm/desktop/component/wallet/SwitchWalletFormTrade'
import {
  HoldingState,
  setSortBy,
  setHideModestBalance,
  setHideZeroBalance,
  setIsHiddenSmallPoll,
  setIsShowOnlyCurrentCurrency,
  setLoadingMore,
  setPage,
} from '@/redux/modules/holding.slice.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import CheckboxWithLabel from '@components/common/CheckboxWithLabel.tsx'
import { Loading } from '@components/common/Loading.tsx'
import TradeSettingsBottomSheet from '@components/common/TradeSettingsBottomSheet.tsx'
import { IconEmpty, IconSortDown, IconSortUp } from '@components/icon'
import { IconFilter } from '@components/icon/stroke/IconFilter.tsx'
import IconFund from '@components/icon/stroke/IconFund.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { useMaxHeightInGridLayout } from '@hooks/useMaxHeightInGridLayout.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { onKeyDownValidateInput } from '@/pages/detail/orderForm/useOrderForm'
import { useHoldingData } from './useHoldingData'
import { setDataUnit, UserSettingsState } from '@/redux/modules/userSettings.slice'
import { useNativeTokenNameByChain } from '@/hooks/useNativeTokenNameByChain'
import { getDataUnitByChain } from '@/lib/currency'
import { useActiveChain } from '@/hooks/useActiveChain'
import { useNewHoldingData } from './hook/useNewHoldingData'
import { PortfolioWithOrders } from '@/types/holding'

// Placeholder loading cards
const ListCardSkeleton = () => (
  <div className="mt-2.5 space-y-1.5">
    {[...Array(2)].map((_, i) => (
      <Skeleton key={i} className="h-40" />
    ))}
  </div>
)

// Empty state UI
const EmptyList = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">
        {t('detail.myPositions.noData')}
      </span>
    </div>
  )
}

const MyPositions = ({ tokenData }: { tokenData: TokenDetail }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const chain = useAppSelector((state) => state.newWallet.activeChain)

  const nativeUnit = useMemo(() => {
    switch (chain) {
      case 'sol':
        return 'SOL'
      case 'bsc':
        return 'BNB'
      default:
        return 'USD'
    }
  }, [chain])

  const dispatch = useAppDispatch()

  const {
    loading,
    // data,
    loadingCurrent,
    hasMore,
    page,
    loadingMore,
    sortBy,
    hideModestBalance,
    hideZeroBalance,
    isHiddenSmallPoll,
    isShowOnlyCurrentCurrency,
  } = useAppSelector((state: RootState) => state.holding as HoldingState)

  const [isFetching, setIsFetching] = useState(false)
  // const { filteredData, listFallbackPrices } = useHoldingData()
  const { filteredData, currentData, listFallbackPrices } = useNewHoldingData()
  const [quickSellPercent, setQuickSellPercent] = useState<number | string>(ls.get('holding_quick_sell_percent') || 100)
  const [openTradeSettings, setOpenTradeSettings] = useState(false)
  const { dataUnit } = useAppSelector((state: RootState) => state.userSettings as unknown as UserSettingsState)
  const nativeToken = useNativeTokenNameByChain()
  const activeChain = useActiveChain()

  useEffect(() => {
    ls.set('holding_quick_sell_percent', String(quickSellPercent))
  }, [quickSellPercent])

  const tokenAddress = useMemo(() => location.pathname.split('/').filter(Boolean).at(-1) || '', [location.pathname])

  const handleOnChangeHiddenSmallPoll = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setIsHiddenSmallPoll(!!status))
  }
  const handleOnChangeHideModestBalance = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setHideModestBalance(!!status))
  }
  const handleOnChangeHideZeroBalance = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setHideZeroBalance(!!status))
  }
  const handleOnChangeShowOnlyCurrentCurrency = (status?: boolean) => {
    dispatch(setPage(1))
    dispatch(setIsShowOnlyCurrentCurrency(!!status))
  }

  const loadMoreFn = async () => {
    if (loading || loadingMore || !hasMore) return false
    dispatch(setLoadingMore(true))
    dispatch(setPage(page + 1))
    return hasMore
  }
  const [displayPortfolio, setDisplayPortfolio] = useState<PortfolioWithOrders | undefined>(undefined)

  const realTimePorfolio = useMemo(
    () => currentData.find((item) => item.token === tokenAddress),
    [currentData, tokenAddress],
  )

  useEffect(() => {
    if (realTimePorfolio) {
      setDisplayPortfolio(realTimePorfolio)
    }
  }, [realTimePorfolio])

  const renderCurrentPosition = useMemo(() => {
    if (!displayPortfolio) return null
    return (
      <CurrentPosition
        porfolio={displayPortfolio}
        loadingCurrent={loadingCurrent}
        isProcessing={displayPortfolio?.isProcessing}
        fallBackPrice={displayPortfolio?.price}
        tokenData={tokenData}
      />
    )
  }, [loading, displayPortfolio, listFallbackPrices, tokenAddress, tokenData])

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxHeight = useMaxHeightInGridLayout({ containerRef, padding: 0 })

  useEffect(() => {
    containerRef.current = document.getElementById('meme-bottom-tabs') as HTMLDivElement
  }, [])

  const renderPositions = useMemo(() => {
    if (loading && filteredData.length === 0) return <ListCardSkeleton />
    if (filteredData.length === 0) return <EmptyList />

    return (
      <div>
        {filteredData.map((item, index) => {
          const fallBackPrice = listFallbackPrices.find((price) => price?.token === item.token)?.price || item?.price
          const isCurrentToken = item.token === tokenAddress
          return (
            <PositionItem
              item={item}
              key={`${item.token}-${index}`}
              isProcessing={item?.isProcessing}
              fallBackPrice={isCurrentToken ? item?.price : fallBackPrice}
              quickSellPercent={quickSellPercent}
              unit={dataUnit}
            />
          )
        })}
      </div>
    )
  }, [filteredData, loading, listFallbackPrices, quickSellPercent, dataUnit, maxHeight])

  useEffect(() => {
    // const mainScrollContainer = document.getElementById('holdings-scroll-container') || window
    // const throttled = throttle(() => {
    //   const scrollTop = window.scrollY
    //   const windowHeight = window.innerHeight
    //   const docHeight = document.getElementById('holdings-scroll-container')?.scrollHeight || window.innerHeight
    //   const LOAD_MORE_SCROLL_THRESHOLD = 0.75
    //
    //   if ((scrollTop + windowHeight) / docHeight >= LOAD_MORE_SCROLL_THRESHOLD && !isFetching && hasMore) {
    //     setIsFetching(true)
    //     loadMoreFn().finally(() => setIsFetching(false))
    //   }
    // }, 200)
    // mainScrollContainer.addEventListener('scroll', throttled)
    // return () => mainScrollContainer.removeEventListener('scroll', throttled)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          setIsFetching(true)
          loadMoreFn().finally(() => setIsFetching(false))
        }
      },
      { threshold: 1.0 },
    )
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [isFetching, hasMore, loadMoreFn])

  const countTrueValues = useMemo(() => {
    return [isHiddenSmallPoll, hideModestBalance, hideZeroBalance].filter(Boolean).length
  }, [isHiddenSmallPoll, hideModestBalance, hideZeroBalance])

  // useEffect(() => {
  //   dispatch(setIsShowOnlyCurrentCurrency(false))
  // }, [tokenData?.address])

  return (
    <div id="holdings-scroll-container">
      {renderCurrentPosition}

      <div className="my-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>{t('detail.holdings.myHoldings')}</span>
          <CheckboxWithLabel
            label={t('detail.myPositions.showOnlyCurrentCurrency')}
            defaultChecked={isShowOnlyCurrentCurrency}
            checked={isShowOnlyCurrentCurrency}
            onChange={handleOnChangeShowOnlyCurrentCurrency}
            labelWrapperClassName="font-[330] text-[12px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <IconFilter className="size-4 cursor-pointer mr-2" />
                {countTrueValues > 0 && (
                  <span className="absolute text-center -top-1.5 -right-0.5 w-3 h-3 flex items-center justify-center bg-[#797790] rounded-full font-[330] text-[10px] text-[#141414] leading-none">
                    {countTrueValues}
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              alignOffset={0}
              sideOffset={10}
              className="bg-[#212129] p-1.5"
            >
              <CheckboxWithLabel
                label={t('detail.myPositions.hideModestBalance')}
                defaultChecked={hideModestBalance}
                onChange={handleOnChangeHideModestBalance}
                containerClassName="p-1.5"
                labelWrapperClassName="font-[330] text-[14px]"
              />
              <CheckboxWithLabel
                label={t('detail.myPositions.hiddenSmallPoll')}
                defaultChecked={isHiddenSmallPoll}
                onChange={handleOnChangeHiddenSmallPoll}
                containerClassName="p-1.5"
                labelWrapperClassName="font-[330] text-[14px]"
              />
              <CheckboxWithLabel
                label={t('detail.myPositions.hideZeroBalance')}
                defaultChecked={hideZeroBalance}
                onChange={handleOnChangeHideZeroBalance}
                containerClassName="p-1.5"
                labelWrapperClassName="font-[330] text-[14px]"
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <SwitchWalletFormTrade tokenDetail={{} as TokenDetail} />
          <div className="flex items-center h-[26px] gap-1 bg-[#ececed14] rounded-[200px] border-[0.5px] border-[#ECECED14] pl-1.5 pr-3">
            <img src="/images/icons/quick-sell.svg" className="size-[14px]" alt="" />
            <input
              type="text"
              onKeyDown={(e) => onKeyDownValidateInput(e, 2)}
              min={1}
              max={100}
              value={quickSellPercent}
              onChange={(e) => {
                setQuickSellPercent(e.target.value)
              }}
              className="w-8 bg-transparent outline-none font-[450] text-[12px] leading-[12px]"
            />
            <span className="font-[330] text-[12px] text-white/50">%</span>
          </div>
          <div className="flex items-center justify-center h-[26px] bg-[#ececed14] rounded-[200px] border-[0.5px] border-[#ECECED14] p-2">
            <TradeSettingsBottomSheet
              open={openTradeSettings}
              setOpen={setOpenTradeSettings}
              selectType={'list'}
              transactionType={TransactionType.Sell}
            />
          </div>
        </div>
      </div>
      <div className="w-full overflow-auto no-scrollbar">
        <div className="min-w-full px-4 grid grid-cols-[3fr_2fr_2fr_2fr_2fr_2fr_2fr_150px] gap-2 font-[330] text-[12px] text-[#645F7B]">
          <div
            className="min-w-[180px] flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (sortBy === '-balanceUpdatedTime') {
                dispatch(setSortBy('+balanceUpdatedTime'))
              } else {
                dispatch(setSortBy('-balanceUpdatedTime'))
              }
            }}
          >
            <span>
              {t('detail.holdings.token')}/{t('detail.holdings.lastActive')}
            </span>
            <div className="flex flex-col cursor-pointer">
              <IconSortUp currentColor={sortBy === '+balanceUpdatedTime' ? '#9B2CFC' : '#645F7B'} />
              <IconSortDown currentColor={sortBy === '-balanceUpdatedTime' ? '#9B2CFC' : '#645F7B'} />
            </div>
          </div>
          <div
            className="min-w-[120px] flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (sortBy === `-totalBuyUsd`) {
                dispatch(setSortBy('+totalBuyUsd'))
              } else {
                dispatch(setSortBy('-totalBuyUsd'))
              }
            }}
          >
            <span>{t('detail.holdings.totalBuy')}</span>
            <div className="flex flex-col cursor-pointer">
              <IconSortUp currentColor={sortBy === `+totalBuyUsd` ? '#9B2CFC' : '#645F7B'} />
              <IconSortDown currentColor={sortBy === `-totalBuyUsd` ? '#9B2CFC' : '#645F7B'} />
            </div>
          </div>
          <div
            className="min-w-[120px] flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (sortBy === `-totalSellUsd`) {
                dispatch(setSortBy('+totalSellUsd'))
              } else {
                dispatch(setSortBy('-totalSellUsd'))
              }
            }}
          >
            <span>{t('detail.holdings.totalSell')}</span>
            <div className="flex flex-col cursor-pointer">
              <IconSortUp currentColor={sortBy === `+totalSellUsd` ? '#9B2CFC' : '#645F7B'} />
              <IconSortDown currentColor={sortBy === `-totalSellUsd` ? '#9B2CFC' : '#645F7B'} />
            </div>
          </div>
          <div className="min-w-[120px] flex items-center gap-1">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => {
                if (sortBy === `-holdingValue`) {
                  dispatch(setSortBy('+holdingValue'))
                } else {
                  dispatch(setSortBy('-holdingValue'))
                }
              }}
            >
              <span>{t('detail.holdings.balance')}</span>
              <div className="flex flex-col cursor-pointer">
                <IconSortUp currentColor={sortBy === `+holdingValue` ? '#9B2CFC' : '#645F7B'} />
                <IconSortDown currentColor={sortBy === `-holdingValue` ? '#9B2CFC' : '#645F7B'} />
              </div>
            </div>
            <div
              className="flex items-center gap-1 cursor-pointer transition-all duration-100 hover:text-[#B9B9B9]"
              onClick={(e) => {
                e.stopPropagation()
                // setUnit(unit === 'USD' ? nativeUnit : 'USD')
                if (dataUnit === 'USD') {
                  dispatch(setDataUnit(getDataUnitByChain(activeChain)))
                } else {
                  dispatch(setDataUnit('USD'))
                }
              }}
            >
              {/* <span>{unit}</span> */}
              <span>{dataUnit === 'USD' ? 'USD' : nativeToken}</span>
              <IconFund className="size-[14px]" />
            </div>
          </div>

          <div className="min-w-[120px] flex items-center gap-1">
            <span>{t('detail.holdings.unrealizedPnl')}</span>
          </div>
          <div className="min-w-[140px] flex items-center gap-1">
            <span>{t('detail.myPositions.profitAndLoss')}</span>
          </div>
          <div
            className="min-w-[120px] flex items-center gap-1 cursor-pointer"
            onClick={() => {
              if (sortBy === `-totalFee`) {
                dispatch(setSortBy('+totalFee'))
              } else {
                dispatch(setSortBy('-totalFee'))
              }
            }}
          >
            <span>{t('detail.holdings.totalFees')}</span>
            <div className="flex flex-col">
              <IconSortUp currentColor={sortBy === `+totalFee` ? '#9B2CFC' : '#645F7B'} />
              <IconSortDown currentColor={sortBy === `-totalFee` ? '#9B2CFC' : '#645F7B'} />
            </div>
          </div>
          <div className="w-[120px]"></div>
        </div>
        <div
          style={{ maxHeight: maxHeight - (realTimePorfolio ? 520 : 400) }}
          className="min-w-full w-fit overflow-y-auto no-scrollbar"
        >
          {renderPositions}
          <div ref={loadMoreRef} className="w-full h-[1px]" />
          {hasMore && (
            <div className="w-full h-20 flex items-center justify-center">
              <Loading />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyPositions
