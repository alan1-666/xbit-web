import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { setCurrentFilterHolderTab, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { UITab } from '@/types/uiTabs.ts'
import { ClassificationStatisticType, TransactionClassification } from '@/@generated/gql/graphql-meme2.ts'
import MovingBgTabs from '@components/common/MovingBgTabs.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { activeChainToChainIds } from '@/utils/chain.ts'
import { useGetClassificationStatistic } from '@hooks/useGetClassificationStatistic.ts'

type FilterTagsPcProps = {
  token: string
}

const FilterTagsPc = ({ token }: FilterTagsPcProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const activeChain = useActiveChain()
  const chainId = activeChainToChainIds(activeChain)

  const { data } = useGetClassificationStatistic({
    token,
    type: ClassificationStatisticType.Holder,
    chainId,
  })

  //create filter with wallets count
  const tagFilters: UITab[] = useMemo(() => {
    const insiderCount = Number(data?.getClassificationStatistic?.insider)
    const whaleCount = Number(data?.getClassificationStatistic?.whale)
    const kolCount = Number(data?.getClassificationStatistic?.kol)
    const devCount = Number(data?.getClassificationStatistic?.dev)
    const smartMoneyCount = Number(data?.getClassificationStatistic?.smartMoney)
    const newWalletCount = Number(data?.getClassificationStatistic?.fresh)
    const followedCount = Number(data?.getClassificationStatistic?.followed)
    const phishingCount = Number(data?.getClassificationStatistic?.phishing)
    const botCount = Number(data?.getClassificationStatistic?.bot)
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
        label: t('detail.filters.whaleWithCount', {
          tagCount: whaleCount > 0 ? `(${whaleCount === 100 ? '99+' : whaleCount})` : '',
        }),
        value: TransactionClassification.Whale,
      },
      {
        label: t('detail.filters.kolWithCount', {
          tagCount: kolCount > 0 ? `(${kolCount === 100 ? '99+' : kolCount})` : '',
        }),
        value: TransactionClassification.Kol,
      },
      {
        label: t('detail.filters.projectPartyWithCount', {
          tagCount: devCount > 0 ? `(${devCount === 100 ? '99+' : devCount})` : '',
        }),
        value: TransactionClassification.ProjectParty,
      },
      {
        label: t('detail.filters.smartMoneyWithCount', {
          tagCount: smartMoneyCount > 0 ? `(${smartMoneyCount === 100 ? '99+' : smartMoneyCount})` : '',
        }),
        value: TransactionClassification.SmartMoney,
      },
      {
        label: t('detail.filters.newWalletWithCount', {
          tagCount: newWalletCount > 0 ? `(${newWalletCount === 100 ? '99+' : newWalletCount})` : '',
        }),
        value: TransactionClassification.Fresh,
      },
      {
        label: t('detail.filters.ratWarehouseWithCount', {
          tagCount: insiderCount > 0 ? `(${insiderCount === 100 ? '99+' : insiderCount})` : '',
        }),
        value: TransactionClassification.Insider,
      },
      {
        label: t('detail.filters.phishingWithCount', {
          tagCount: phishingCount > 0 ? `(${phishingCount === 100 ? '99+' : phishingCount})` : '',
        }),
        value: TransactionClassification?.Phishing,
      },
      {
        label: t('detail.filters.botWithCount', {
          tagCount: botCount > 0 ? `(${botCount === 100 ? '99+' : botCount})` : '',
        }),
        value: TransactionClassification.Bot,
      },
      {
        label: t('detail.filters.sameOriginWithCount', {
          tagCount: bundlerCount > 0 ? `(${bundlerCount === 100 ? '99+' : bundlerCount})` : '',
        }),
        value: TransactionClassification.Bundlers,
      },
      // {
      //   label: t('detail.filter.inactive'),
      //   value: TransactionClassification?.InActive
      // },
    ]
  }, [t, data?.getClassificationStatistic])

  const { currentFilterHolderTab } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)

  const [currentTab, setCurrentTab] = useState<TransactionClassification>(
    (currentFilterHolderTab as TransactionClassification) || tagFilters[0]?.value,
  )

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab as TransactionClassification)
    dispatch(setCurrentFilterHolderTab(tab))
  }

  return (
    <MovingBgTabs
      tabs={tagFilters}
      defaultTab={currentTab}
      onTabChange={handleTabChange}
      containerId="token-detail-pairs"
      containerClassName="mt-2.5 px-2 w-full overflow-x-auto no-scrollbar"
      tabsTriggerClassName="text-[13px] px-3 rounded-[4px] leading-[1] !font-normal !text-[#6C6A74] !bg-[#18171E]"
      tabBgClassName="rounded-[4px]"
      tabsTriggerActiveClassName="!bg-[#3E2761] !text-[#C8A7FD]"
      tabsListClassName="rounded-[4px] border-none bg-transparent gap-1.5"
    />
  )
}

export default FilterTagsPc
