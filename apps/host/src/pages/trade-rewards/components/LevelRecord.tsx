import { useTranslation } from 'react-i18next'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useEffect, useState } from 'react'
import Records from './records'
import { useTradeRewards } from '../hooks/useTradeRewards'
import TierBenefitsTable from './TierBenefitsTable'

const LevelRecord = ({ userLevel }: { userLevel: number }) => {
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState<string>('0')
  const [recordsData, setRecordsData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [, setCurrentPage] = useState(1)
  const pageSize = 10
  const {fetchClaimRecord} = useTradeRewards()

  useEffect(() => {
    if (currentTab === '1') {
      getClaimReward(1, true)
    }
  }, [currentTab])
  

  const getClaimReward = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true)
        setRecordsData([])
        setCurrentPage(1)
      } else {
        setIsLoadingMore(true)
      }
      
      const ListData = await fetchClaimRecord(page, pageSize,"success",true);
      if (ListData && ListData.success) {
        const newData = ListData.data || []
        
        if (isRefresh) {
          setRecordsData(newData)
        } else {
          // 追加数据，避免重复
          setRecordsData((prevData: any[]) => {
            const existingIds = new Set(prevData.map((item: any) => item.id))
            const filteredNewData = newData.filter((item: any) => !existingIds.has(item.id))
            return [...prevData, ...filteredNewData]
          })
        }
        
        // 判断是否还有下一页 - 根据总数和当前已加载数据量判断
        const currentTotal = isRefresh ? newData.length : recordsData.length + newData.length
        const hasMore = ListData.total > currentTotal
        setHasNextPage(hasMore)
        setCurrentPage(page)
      }
    } catch (error) {
  
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 处理加载更多
  const handleLoadMore = (page: number) => {
    getClaimReward(page, false)
  }

  // 切换tab时的处理
  const handleTabChange = (tabValue: string) => {
    setCurrentTab(tabValue)
    if (tabValue === '1' && recordsData.length === 0) {
      getClaimReward(1, true)
    }
  }

  const tabs = [
    { label: t('Activityrewards.levelBenefits'), value: '0' },
    { label: t('Activityrewards.ClaimRecord'), value: '1' },
  ]
  
  return (
    <div className="mt-3">
        <MovingLineTabs
            tabs={tabs}
            containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 flex-1"
            tabsListClassName="justify-start font-medium"
            itemClassName="text-[14px]"
            defaultTab={currentTab}
            onTabChange={handleTabChange}
        />
        <div className="mt-3 pb-5">
            {currentTab === '0' ? (
                <TierBenefitsTable currentLevel={userLevel} />
            ) :(
            <div className="w-full border border-[#ECECED1F] rounded-[8px] pt-2">
                <Records 
                  data={recordsData}
                  loading={loading}
                  hasNextPage={hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  pageSize={pageSize}
                  initialPage={1}
                /> 
            </div>
            )}
        </div>

    </div>
  )
}

export default LevelRecord