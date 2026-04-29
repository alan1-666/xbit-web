import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { cn } from '@/lib/utils.ts'
import MovingBgTabs from '@components/common/MovingBgTabs.tsx'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setCurrentFilterTradeTab, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { useMemo, useState } from 'react'
import {
  ClassificationStatisticDto,
  ClassificationStatisticType,
  TransactionClassification,
} from '@/@generated/gql/graphql-meme2.ts'
import { useGetClassificationStatistic } from '@hooks/useGetClassificationStatistic.ts'
import { useLocation } from 'react-router-dom'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

const classifications = [
  TransactionClassification.All,
  TransactionClassification.Followed,
  TransactionClassification.Insider,
  TransactionClassification.Kol,
  TransactionClassification.ProjectParty,
  TransactionClassification.SmartMoney,
  TransactionClassification.Whale,
  TransactionClassification.Fresh,
  TransactionClassification.Sniper,
  TransactionClassification.Top10,
  TransactionClassification.Bundlers,
]

const getLabel = (classification: TransactionClassification, data: ClassificationStatisticDto, t: TFunction) => {
  switch (classification) {
    case TransactionClassification.All:
      return t('detail.filters.all')
    case TransactionClassification.Followed:
      return t('detail.filters.followedWithCount', {
        tagCount: data.followed && data.followed > 0 ? `(${+data.followed >= 100 ? '99+' : data.followed})` : '',
      })
    case TransactionClassification.Insider:
      return t('detail.filters.ratWarehouseWithCount', {
        tagCount: data.insider && data.insider > 0 ? `(${+data.insider >= 100 ? '99+' : data.insider})` : '',
      })
    case TransactionClassification.Kol:
      return t('detail.filters.kolWithCount', {
        tagCount: data.kol && data.kol > 0 ? `(${+data.kol >= 100 ? '99+' : data.kol})` : '',
      })
    case TransactionClassification.ProjectParty:
      return t('detail.filters.projectPartyWithCount', {
        tagCount: data.dev && data.dev > 0 ? `(${data.dev})` : '',
      })
    case TransactionClassification.SmartMoney:
      return t('detail.filters.smartMoneyWithCount', {
        tagCount:
          data.smartMoney && data.smartMoney > 0 ? `(${+data.smartMoney >= 100 ? '99+' : data.smartMoney})` : '',
      })
    case TransactionClassification.Whale:
      return t('detail.filters.whaleWithCount', {
        tagCount: data.whale && data.whale > 0 ? `(${+data.whale >= 100 ? '99+' : data.whale})` : '',
      })
    case TransactionClassification.Fresh:
      return t('detail.filters.newWalletWithCount', {
        tagCount: data.fresh && data.fresh > 0 ? `(${+data.fresh >= 100 ? '99+' : data.fresh})` : '',
      })
    case TransactionClassification.Sniper:
      return t('detail.filters.sniperWithCount', {
        tagCount: data.sniper && data.sniper > 0 ? `(${+data.sniper >= 100 ? '99+' : data.sniper})` : '',
      })
    case TransactionClassification.Top10:
      return t('detail.filters.top10WithCount', {
        tagCount: data.top10 && data.top10 > 0 ? `(${+data.top10 >= 100 ? '99+' : data.top10})` : '',
      })
    case TransactionClassification.Bundlers:
      return t('detail.filters.sameOriginWithCount', {
        tagCount: data.bundler && data.bundler > 0 ? `(${+data.bundler >= 100 ? '99+' : data.bundler})` : '',
      })
    default:
      return ''
  }
}

export interface ClassificationsProps {
  onClassificationChange?: (classification: TransactionClassification) => void
}

/**
 * Classifications component. Returns null if the current path is an XStock path.
 * @constructor
 */
export const Classifications = () => {
  const isXStockPath = useIsXStockPath()
  const currentFilterTradeTab = useAppSelector(
    (state: RootState) => (state.tradeTab as TradeTabState).currentFilterTradeTab,
  )
  const location = useLocation()
  const [currentTab, setCurrentTab] = useState<string>(currentFilterTradeTab || classifications[0])
  const tokenAddress = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    return segments.at(-1) || ''
  }, [location.pathname])
  const { t } = useTranslation()
  const activeChainId = useActiveChainId()
  const dispatch = useAppDispatch()

  const { data } = useGetClassificationStatistic({
    token: tokenAddress,
    type: ClassificationStatisticType.Trade,
    chainId: activeChainId,
  })

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    dispatch(setCurrentFilterTradeTab(tab))
  }

  const tabs = useMemo(() => {
    return classifications.map((classification) => {
      return {
        value: classification,
        label: getLabel(classification, data?.getClassificationStatistic || {}, t),
      }
    })
  }, [data, t])

  if (isXStockPath) return null
  return (
    <div className={cn('relative pt-2.5')}>
      <MovingBgTabs
        tabs={tabs}
        defaultTab={currentTab}
        onTabChange={handleTabChange}
        containerId="token-detail-pairs"
        containerClassName="mt-2.5 w-full overflow-x-auto no-scrollbar"
        tabsTriggerClassName="text-[13px] px-3 rounded-[4px] leading-[1] !font-normal !text-[#6C6A74] !bg-[#18171E]"
        tabBgClassName="rounded-[4px]"
        tabsTriggerActiveClassName="!bg-[#3E2761] !text-[#C8A7FD]"
        tabsListClassName="rounded-[4px] border-none bg-transparent gap-1.5"
      />
    </div>
  )
}
