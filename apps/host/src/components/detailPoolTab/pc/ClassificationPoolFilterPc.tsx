import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { ClassificationStatisticType, TransactionClassification } from '@/@generated/gql/graphql-meme2.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setPoolFilter, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import MovingBgTabs from '@components/common/MovingBgTabs.tsx'
import { UITab } from '@/types/uiTabs.ts'
import { useGetClassificationStatistic } from '@hooks/useGetClassificationStatistic.ts'
import { ChainIds } from '@/types/enums.ts'

type ClassificationPoolFilterPcProps = {
  token: string
  chainId: ChainIds
  handleClassificationChange?: (value: TransactionClassification) => void
}

const ClassificationPoolFilterPc = ({
  token,
  chainId,
  handleClassificationChange,
}: ClassificationPoolFilterPcProps) => {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const { poolFilter } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  const { data } = useGetClassificationStatistic({
    token,
    type: ClassificationStatisticType.Pool,
    chainId,
  })

  //create filter with wallets count
  const tagFilters: UITab[] = useMemo(() => {
    console.log({ data: data?.getClassificationStatistic })
    const insiderCount = Number(data?.getClassificationStatistic?.insider)
    const whaleCount = Number(data?.getClassificationStatistic?.whale)
    const kolCount = Number(data?.getClassificationStatistic?.kol)
    const devCount = Number(data?.getClassificationStatistic?.dev)
    const smartMoneyCount = Number(data?.getClassificationStatistic?.smartMoney)
    const sniperCount = Number(data?.getClassificationStatistic?.sniper)
    const newWalletCount = Number(data?.getClassificationStatistic?.fresh)
    const followedCount = Number(data?.getClassificationStatistic?.followed)
    const top10Count = Number(data?.getClassificationStatistic?.top10)
    const bundlerCount = Number(data?.getClassificationStatistic?.bundler)

    return [
      {
        label: t('detail.filters.all'),
        value: TransactionClassification.All,
      },
      {
        label: t('detail.filters.followedWithCount', {
          tagCount: followedCount > 0 ? `(${followedCount === 100 ? '99+' : followedCount})` : '',
        }),
        value: TransactionClassification.Followed,
      },
      {
        label: t('detail.filters.ratWarehouseWithCount', {
          tagCount: insiderCount > 0 ? `(${insiderCount === 100 ? '99+' : insiderCount})` : '',
        }),
        value: TransactionClassification.Insider,
      },
      {
        label: t('detail.filters.kolWithCount', {
          tagCount: kolCount > 0 ? `(${kolCount === 100 ? '99+' : kolCount})` : '',
        }),
        value: TransactionClassification.Kol,
      },
      {
        label: t('detail.filters.projectPartyWithCount', { tagCount: devCount > 0 ? `(${devCount})` : '' }),
        value: TransactionClassification.ProjectParty,
      },
      {
        label: t('detail.filters.smartMoneyWithCount', {
          tagCount: smartMoneyCount > 0 ? `(${smartMoneyCount === 100 ? '99+' : smartMoneyCount})` : '',
        }),
        value: TransactionClassification.SmartMoney,
      },
      {
        label: t('detail.filters.whaleWithCount', {
          tagCount: whaleCount > 0 ? `(${whaleCount === 100 ? '99+' : whaleCount})` : '',
        }),
        value: TransactionClassification.Whale,
      },
      {
        label: t('detail.filters.newWalletWithCount', {
          tagCount: newWalletCount > 0 ? `(${newWalletCount === 100 ? '99+' : newWalletCount})` : '',
        }),
        value: TransactionClassification.Fresh,
      },
      {
        label: t('detail.filters.sniperWithCount', {
          tagCount: sniperCount > 0 ? `(${sniperCount === 100 ? '99+' : sniperCount})` : '',
        }),
        value: TransactionClassification.Sniper,
      },
      {
        label: t('detail.filters.top10WithCount', {
          tagCount: top10Count > 0 ? `(${top10Count === 100 ? '99+' : top10Count})` : '',
        }),
        value: TransactionClassification.Top10,
      },
      {
        label: t('detail.filters.sameOriginWithCount', {
          tagCount: bundlerCount > 0 ? `(${bundlerCount === 100 ? '99+' : bundlerCount})` : '',
        }),
        value: TransactionClassification.Bundlers,
      },
    ]
  }, [t, data?.getClassificationStatistic])

  const [currentTab, setCurrentTab] = useState<string>(poolFilter?.classification ?? tagFilters[0]?.value)

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    const newFilter = {
      ...poolFilter,
      classification: tab,
    }
    handleClassificationChange?.(tab as TransactionClassification)
    dispatch(setPoolFilter(newFilter))
  }

  return (
    <MovingBgTabs
      tabs={tagFilters}
      defaultTab={currentTab}
      onTabChange={handleTabChange}
      containerId="token-detail-pairs"
      containerClassName="mt-2.5 px-4 w-full overflow-x-auto no-scrollbar"
      tabsTriggerClassName="text-[13px] px-3 rounded-[4px] leading-[1] !font-normal !text-[#6C6A74] !bg-[#18171E]"
      tabBgClassName="rounded-[4px]"
      tabsTriggerActiveClassName="!bg-[#3E2761] !text-[#C8A7FD]"
      tabsListClassName="rounded-[4px] border-none bg-transparent gap-1.5"
    />
  )
}

export default ClassificationPoolFilterPc
