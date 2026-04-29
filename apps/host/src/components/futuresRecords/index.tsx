import HeaderWithBack from '@/components/header/HeaderWithBack'
import { useNavigate } from 'react-router-dom'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { UITab } from '@/types/uiTabs.ts'
import { memo, useEffect, useMemo, useState, useCallback } from 'react'
import FundingHistoryList from '@/components/futuresRecords/FundingHistoryList/index.tsx'
import EntrustedHistoryList from '@/components/futuresRecords/EntrustedHistoryList/index.tsx'
import { useResponsive } from '@hooks/hyperliquid/useResponsive.ts'
import { GET_CATEGORY_LIST, GET_SYMBOL_LIST } from '@/services/symbol.dex.service'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { useTranslation } from 'react-i18next'


interface FuturesRecordsPageProps {
  onBack: () => void
}
const FuturesRecordsPage = ({ onBack }: FuturesRecordsPageProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  

  const currentListTabs: UITab[] = useMemo(() => {
    return [
      {
        value: 'fundingHistory',
        label: t('futuresDetails.tabs.FundingHistory'),
      },
      {
        value: 'entrustHistory',
        label: t('futuresDetails.tabs.orderHistory'),
      },

    ]
  }, [])
  const { isMobile } = useResponsive()
  
  const initialTab = currentListTabs[0]?.value || 'fundingHistory'

  const [currentTab, setCurrentTab] = useState<string>(initialTab)
  const handleChangeTab = useCallback((tab: string) => {
    setCurrentTab(tab)
  }, [])

  

  const uesGetSymbolList = () => {
    const { data, isFetching, refetch } = useReactQuery({
    queryKey: ['GET_SYMBOL_LIST'],
    queryFn: async () => {
      const res = await symbolDexClient.query({
        query: GET_SYMBOL_LIST,
        variables: { input:  {
          condition: 'volume'
        } },
      })
      return res?.data
    },
    retry: 1,
  })
    return {
      symbolList: data?.getSymbolList?.list || [],
      loading: !data && isFetching,
      refetch,
    }
  }

  const { loading: isLoading, symbolList } = uesGetSymbolList()



  console.log('symbolList', symbolList)

  const handleRenderTab = useCallback(() => {
      return (
        <>
          <div style={{ display: currentTab === currentListTabs[0]?.value ? 'block' : 'none' }}>
            <FundingHistoryList symbolList={symbolList}/>
          </div>
          <div style={{ display: currentTab === currentListTabs[1]?.value ? 'block' : 'none' }}>
            <EntrustedHistoryList symbolList={symbolList}/>
          </div>
        </>
      )
    }, [currentTab, currentListTabs, symbolList])

  const handleNavigateBack = () => {
    
  }


  return (
    <div className="fixed inset-0 z-21 bg-[#0A0A0A]">
      <div className="sticky top-0 z-22 bg-[#0A0A0A]">
        <HeaderWithBack 
          className="bg-[#0A0A0A]"
          title={t('assets.token.transactionHistory')}
          isHidenIconLeft={true}
          right={<img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer absolute right-0 top-3.5 right-3"
                alt="icon-x"
              />}
          onRightClick={onBack}
          />
        <MovingLineTabs
          tabs={currentListTabs}
          onTabChange={handleChangeTab}
          defaultTab={initialTab}
          showContainerBottomLine={false}
          containerClassName="bg-[none] w-full mb-[10px]  white-gradient-border-b"
          tabsClassName="w-full"
        />
      </div>

      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
        {handleRenderTab()}
      </div>
    </div>
  )
}

export default FuturesRecordsPage
