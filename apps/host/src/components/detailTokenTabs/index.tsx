import { UITab } from '@/types/uiTabs.ts'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FilterFollowedTabs from '@components/detailTokenTabs/FilterFollowedTabs.tsx'
import CurrencyToggle from '@components/detailTokenTabs/CurrencyToggle.tsx'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { TokenDetail } from '@/@generated/gql/graphql-future'
import { setCurrentFollowedTab, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import FollowedHolderWrapper from '@components/detailTokenTabs/pc/FollowedHolderWrapper.tsx'
import FollowedPoolWrapper from '@components/detailTokenTabs/pc/FollowedPoolWrapper.tsx'
import LatestWrapper from '@components/detailLatestTab/LatestWrapper.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { useParams } from 'react-router-dom'
import { ChainIds } from '@/types/enums.ts'
import {
  MemeDetailBottomTabsContextProps,
  MemeDetailBottomTabsProvider,
} from '@/contexts/meme/detail/MemeDetailBottomTabsContext.ts'

type DetailTokenTabsProps = {
  tokenData?: TokenDetail
}

const DetailTokenTabs = ({ tokenData }: DetailTokenTabsProps) => {
  const { t } = useTranslation()

  const { isDesktop } = useResponsive()

  const dispatch = useAppDispatch()
  const currentFollowedTab = useAppSelector((state: RootState) => (state.tradeTab as TradeTabState)?.currentFollowedTab)
  const isXStockPath = useIsXStockPath()
  const currentListTabs: UITab[] = [
    {
      value: 'latest',
      label: t('detail.tabs.latest'),
    },
    {
      value: 'holders',
      label: t('detail.tabs.holdersWithCount'),
    },
    {
      value: 'pool',
      label: t('detail.tabs.pool'),
    },
  ]

  const filterFollowedTabs = useMemo(() => {
    return isXStockPath ? currentListTabs.filter((tab) => tab.value !== 'holders') : currentListTabs
  }, [isXStockPath])

  const { address: currentToken } = useParams()

  const [currentTab, setCurrentTab] = useState<string>(currentFollowedTab ?? currentListTabs[0].value)

  const handleChangeTab = (tab: string) => {
    dispatch(setCurrentFollowedTab(tab))
    setCurrentTab(tab)
  }

  const handleRenderTabs = (tab: string) => {
    switch (tab) {
      case currentListTabs[0].value:
        return <LatestWrapper />
      case currentListTabs[1].value:
        return <FollowedHolderWrapper tokenData={tokenData} />
      case currentListTabs[2].value:
        return (
          <FollowedPoolWrapper
            token={currentToken ?? ''}
            chainId={tokenData?.chainId ?? ChainIds.Solana}
            icon={tokenData?.info?.logoUrl ?? undefined}
            symbol={tokenData?.symbol ?? undefined}
          />
        )
      default:
        return <LatestWrapper />
    }
  }

  const contextValue: MemeDetailBottomTabsContextProps = useMemo(() => {
    return {
      tokenDetail: tokenData,
    }
  }, [tokenData])

  return (
    <MemeDetailBottomTabsProvider value={contextValue}>
      <div className="relative mt-2 z-50 px-3">
        <div className="flex items-center justify-between">
          <FilterFollowedTabs
            containerId={'tabs-followed'}
            tabs={filterFollowedTabs}
            onTabChange={handleChangeTab}
            defaultTab={currentTab}
          />
          {!isDesktop && <CurrencyToggle />}
        </div>
        <div className="sticky top-[30px] translate-y-[-30px] mt-10 z-50">{handleRenderTabs(currentTab)}</div>
      </div>
    </MemeDetailBottomTabsProvider>
  )
}

export default DetailTokenTabs
