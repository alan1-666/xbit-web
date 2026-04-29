import { FollowingWalletInfo } from '@/@generated/gql/graphql-future.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { UITab } from '@/types/uiTabs.ts'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import TabSmartMoney from '@components/listCoin/TabSmartMoney.tsx'
import TokenDetailSmartMoney, { CACHED_SMART_MONEY_ACTIONS } from '@components/tokenDetailSmartMoney'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { getFollowingWallets } from '@services/smartMoney.service.ts'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  getFromLocalStorageWithTTL,
  removeFromLocalStorage,
  saveFirstPageToStorage,
  saveToLocalStorageWithTTL,
} from '@/utils/storage.ts'
import { isArray } from 'lodash-es'
import { TTL_STORAGE } from '@const/configs.ts'
import { CACHE_KEY } from '@/lib/constant'
import { useActiveChainType } from '@hooks/useActiveChain.ts'

export const FOLLOWED_SMART_MONEY = 'FOLLOWED_SMART_MONEY'

const useTotalFollowings = () => {
  const activeWallet = useActiveWallet()
  const activeChainType = useActiveChainType()
  const { data } = useQuery({
    queryKey: ['totalFollowings', activeWallet?.walletAddress, activeChainType],
    enabled: activeWallet?.isConnected,
    initialData: getFromLocalStorageWithTTL<FollowingWalletInfo[]>(FOLLOWED_SMART_MONEY) ?? [],
    queryFn: async () => {
      const { data } = await futureClient.query({
        query: getFollowingWallets,
        variables: {
          filter: {
            chain: activeChainType,
          },
        },
      })
      const returnData = (data?.getFollowingWallets ?? []) as FollowingWalletInfo[]
      if (isArray(returnData) && returnData?.length > 0) {
        saveToLocalStorageWithTTL<FollowingWalletInfo[]>(FOLLOWED_SMART_MONEY, returnData, TTL_STORAGE)
        saveFirstPageToStorage<FollowingWalletInfo[]>(
          CACHE_KEY.WALLET_FAVORITE,
          returnData.map((i) => ({
            address: i.address,
            alias: i.alias,
          })),
        )
      }
      return returnData
    },
  })
  return data ?? []
}

const MonitoringPage = () => {
  const { t } = useTranslation()
  const activeWallet = useActiveWallet()
  const [searchParams, setSearchParams] = useSearchParams()
  const listFollowings = useTotalFollowings()
  const totalFollowings = listFollowings?.length ?? 0

  const navTabs: UITab[] = [
    {
      value: 'realTimeTransactions',
      label: t('monitoring.realTimeTransactions'),
    },
    {
      value: 'following',
      // label: t('monitoring.following'),
      label: (
        <div className="relative">
          {t('monitoring.following')}
          {activeWallet?.isConnected && +totalFollowings > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#6A2AE0] text-[10px] leading-2.5 py-0.5 px-1 rounded-full translate-x-2/3">
              {totalFollowings < 1000 ? totalFollowings : '999+'}
            </span>
          )}
        </div>
      ),
    },
  ]

  const [currentNavTab, setCurrentNavTab] = useState<string>(searchParams.get('page') || navTabs[0].value)

  const handleChangeTab = (tab: string) => {
    setCurrentNavTab(tab)
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('page', tab)
      return newParams
    })
  }

  const handleRenderTab = (tab: string) => {
    switch (tab) {
      case navTabs[0].value:
        return <TokenDetailSmartMoney listFollowing={listFollowings} />
      case navTabs[1].value:
        return <TabSmartMoney listFollowing={listFollowings} />
      default:
        return <TokenDetailSmartMoney listFollowing={listFollowings} />
    }
  }

  useEffect(() => {
    if (!activeWallet?.isConnected) removeFromLocalStorage(CACHED_SMART_MONEY_ACTIONS)
  }, [activeWallet?.isConnected])

  return (
    <div className="@container relative mx-auto -mb-20 ">
      <div className="sticky top-0 bg-[#0A0A0A] z-10">
        <MovingLineTabs
          tabs={navTabs}
          defaultTab={currentNavTab}
          onTabChange={handleChangeTab}
          containerClassName="after:h-[0px] justify-start bg-transparent"
          tabsListClassName="items-center justify-start gap-1 p-2.5"
          itemClassName="!bg-[#18171E] rounded-[5px] min-w-[64px] h-[auto] px-2.5 py-[3px] text-[#908E98] text-[11px] leading-[1.5] font-[330] transform-colors duration-200"
          itemClassNameActive="!bg-[#3E2761] !text-[#C8A7FD]"
          showTabLine={false}
        />
      </div>

      {handleRenderTab(currentNavTab)}
    </div>
  )
}

export default MonitoringPage
