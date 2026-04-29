import { ChainType, FollowingWalletInfo, SmartMoneyAction } from '@/@generated/gql/graphql-future.ts'
import { TransactionType } from '@/@generated/gql/graphql-trading.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { setRealtimeTxFilterTimeframe } from '@/redux/modules/monitoringPcSlice'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { SmartMoneyFilterType, TimeframeOption } from '@/types/monitoring.ts'
import { loadFirstPageFromStorage, saveFirstPageToStorage } from '@/utils/storage'
import { ButtonConnectWallet } from '@components/common/ButtonConnectWallet.tsx'
import { Loading } from '@components/common/Loading.tsx'
import TradeSettingsBottomSheet from '@components/common/TradeSettingsBottomSheet.tsx'
import SwitchChains from '@components/header/switch-chains.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { useAllFollowingWallets } from '@hooks/useAllFollowingWallets.ts'
import { useSmartMoneyActions } from '@hooks/useSmartMoneyActions.ts'
import { useTradeConfig } from '@hooks/useTradeConfig.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import Container from '../common/Container'
import QuickBuy from '../discover/QuickBuy'
import { TimeframeSelector } from '../discover/TimeframeSelector'
import { IconEmpty } from '../icon'
import { Skeleton } from '../ui/skeleton'
import SmartMoneyFilter from './SmartMoneyFilter'
import SmartMoneyItem from './SmartMoneyItem'
import { Configs } from '@/const/configs'
import { mappingTypeChain } from '@/utils/mappingType'

const chainIdMap: Record<string, ChainIds> = {
  [TYPE_CHAIN.ETH]: ChainIds.Ethereum,
  [TYPE_CHAIN.SOLANA]: ChainIds.Solana,
  [TYPE_CHAIN.BSC]: ChainIds.Bsc,
  [TYPE_CHAIN.MON]: ChainIds.Mon,
}

export const CACHED_SMART_MONEY_ACTIONS = 'cachedSmartMoneyAction'

type TokenDetailSmartMoneyProps = {
  listFollowing: FollowingWalletInfo[]
}

const TokenDetailSmartMoney = ({ listFollowing: listFollowingFromAPI }: TokenDetailSmartMoneyProps) => {
  const { t } = useTranslation()
  const filter = useAppSelector((state: RootState) => state?.monitoringPc?.realtimeTx?.filter as SmartMoneyFilterType)
  const lastSmartMoneyRef = useRef<HTMLDivElement | null>(null)
  const activeChain = useActiveChain()
  const activeWallet = useActiveWallet()
  const amount = useSelector((state: RootState) => state.quickBuy.amount)
  const dispatch = useAppDispatch()
  const { selectedPresetKey } = useTradeConfig({
    transactionType: TransactionType.Buy,
  })
  const [openTradeSettings, setOpenTradeSettings] = useState(false)

  const listFollowing = useMemo(() => {
    return listFollowingFromAPI ? (listFollowingFromAPI as FollowingWalletInfo[])?.map((item) => item?.address) : []
  }, [listFollowingFromAPI])

  const handleMapTimeFrame = (time: TimeframeOption) => {
    const mapping: Record<TimeframeOption, { value: number; lable: string }> = {
      '1m': {
        value: 1,
        lable: t('monitoring.transactions.minute'),
      },
      '5m': {
        value: 5,
        lable: t('monitoring.transactions.minute'),
      },
      '1h': {
        value: 1,
        lable: t('monitoring.transactions.hour'),
      },
      '6h': {
        value: 6,
        lable: t('monitoring.transactions.hour'),
      },
      '24h': {
        value: 24,
        lable: t('monitoring.transactions.hour'),
      },
    }

    return `${mapping[time].value} ${mapping[time].lable}`
  }
  const [searchParams] = useSearchParams()
  const isNotSupportNetwork = searchParams?.get('isNotSupportNetwork') === 'true'

  const { allFollowingWallets, normalizedSelectedItems } = useAllFollowingWallets()

  const handleSetTimeframe = (value: TimeframeOption) => {
    dispatch(setRealtimeTxFilterTimeframe(value))
  }

  useEffect(() => {
    handleSetTimeframe('6h')
  }, [])

  const normalizedFilter = useMemo(() => {
    if (filter.address && filter.address.length > 0) {
      return {
        ...filter,
        address: normalizedSelectedItems,
      }
    }
    return { ...filter, address: allFollowingWallets }
  }, [filter, allFollowingWallets, normalizedSelectedItems])

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useSmartMoneyActions(
    normalizedFilter,
    mappingTypeChain(activeChain),
    activeWallet,
  )

  // Flatten all items from pages and manage storage
  const allSmartMoneys = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) ?? []

    // Save first page to storage when available
    if (allItems.length && data?.pages[0]) {
      saveFirstPageToStorage('tokenDetailSmartMoney-firstPage', data.pages[0].items)
    }

    return allItems
  }, [data])

  // Load first page from storage on mount
  useEffect(() => {
    const firstPage = loadFirstPageFromStorage<SmartMoneyAction[]>('tokenDetailSmartMoney-firstPage')
    if (!data && firstPage) {
      // Initial data is handled by react-query if needed
    }
  }, [data])

  // Ref to track data updates
  const dataRef = useRef<SmartMoneyAction[]>([])

  // Update ref when data changes and is not undefined
  useEffect(() => {
    if (allSmartMoneys && allSmartMoneys.length > 0) {
      dataRef.current = allSmartMoneys
    }
  }, [allSmartMoneys])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoading && !isFetchingNextPage) {
          fetchNextPage().catch(console.error)
        }
      },
      { threshold: 0.5 },
    )
    if (lastSmartMoneyRef.current) {
      observer.observe(lastSmartMoneyRef.current)
    }
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [lastSmartMoneyRef.current, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage])

  // Optional: move constants outside the component scope
  const SKELETON_ROWS = 10

  const renderSmartMoneys = () => {
    const isNotSupportChain =
      (Configs.supportedRouteChains().includes(activeChain)) && !isNotSupportNetwork
    const chainId = chainIdMap[activeChain]

    if (!activeWallet?.isConnected) {
      return (
        <div className="pt-[146px]">
          <ButtonConnectWallet />
        </div>
      )
    }

    if (!isNotSupportChain) {
      return (
        <Container className="mt-[10px] h-40 pt-[64px]">
          <div className="mt-10 flex flex-col items-center justify-center gap-2 text-[14px] text-[#999999]">
            <span>{t('orderForm.status.NETWORK_UNSUPPORT')}</span>
            <SwitchChains isNotSupportChainBtn />
          </div>
        </Container>
      )
    }

    if (isLoading && !data) {
      return (
        <div className="space-y-2">
          {Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <Skeleton key={i} className="h-[89px]" />
          ))}
        </div>
      )
    }

    if (listFollowing.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center pt-[100px]">
          <IconEmpty />
          <span className="text-[0.75rem] text-[#FFFFFF80] text-center">{t('following.empty')}</span>
          <Link
            to="/meme/smart-money?walletType=SmartMoney&tab=topTalents"
            className="purple-btn-gradient mt-4 !max-h-[42px] rounded-[50px] p-[13px_12.5px] !text-white text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))]"
          >
            {t('emptyFollowing.cta')}
          </Link>
        </div>
      )
    }

    if (allSmartMoneys.length === 0) {
      return (
        <div className="flex h-80 flex-col items-center justify-center">
          <IconEmpty />
          <span className="text-[0.75rem] text-[#FFFFFF80] text-center">
            {t('monitoring.transactions.noDataWithValue', { time: handleMapTimeFrame(filter.timeframe ?? '6h') })}
          </span>
        </div>
      )
    }

    const lastIndex = allSmartMoneys.length - 1

    return (
      <>
        <div className="flex flex-col gap-2">
          {allSmartMoneys.map((sm, idx) => (
            <div
              key={`${sm?.address}-${idx}`} // stable when address exists
              ref={idx === lastIndex ? lastSmartMoneyRef : undefined}
            >
              <SmartMoneyItem item={sm} chainId={chainId} />
            </div>
          ))}
        </div>

        {/* Loading indicator for fetching next page */}
        {isFetchingNextPage && (
          <div className="flex h-[89px] w-full items-center justify-center">
            <Loading />
          </div>
        )}
      </>
    )
  }

  const RenderIconRight = () => {
    return (
      <>
        <div
          className=" flex items-center justify-center pr-1 gap-2 cursor-pointer"
          onClick={() => setOpenTradeSettings(true)}
        >
          <span className="text-white/80 font-normal leading-3.5 text-[11px]">P{selectedPresetKey ?? 1}</span>
          <div className="flex items-center align-middle leading-[1]">
            <img src="/images/icons/arrow-down-quick-buy.svg" className="w-[8.67px] h-[6.3px] mt-[1px]" alt="" />
          </div>
        </div>
      </>
    )
  }

  return (
    <Container className="">
      {activeWallet.isConnected && (
        <div className="sticky top-10 bg-[#0A0A0A] z-10 py-2.5">
          <div className="flex items-center justify-between mb-2.5">
            <TimeframeSelector currentTimeframe={filter.timeframe ?? '6h'} onTimeframeChange={handleSetTimeframe} />
            <QuickBuy renderRight={<RenderIconRight />} />
          </div>
          <div className="flex items-center justify-between w-full">
            <SmartMoneyFilter setFilter={() => {}} listFollowing={listFollowing} />
          </div>
        </div>
      )}
      <div className="no-scrollbar">{renderSmartMoneys()}</div>
      <div className="hidden">
        <TradeSettingsBottomSheet
          open={openTradeSettings}
          setOpen={setOpenTradeSettings}
          transactionType={TransactionType.Buy}
        />
      </div>
    </Container>
  )
}

export default TokenDetailSmartMoney
