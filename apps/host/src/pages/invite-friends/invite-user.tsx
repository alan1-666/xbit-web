import NavigationHeader from '@/components/nodeAgent/NavigationHeader'
import { useNavigate } from 'react-router-dom'
import InvitedUsersTable from './components/InvitedUsersTable'
import { useTranslation } from 'react-i18next'
import { useUserInviteInfo } from './hooks/userInviteInfo'
import { useState, useEffect } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'


const InviteUser = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {isDesktop} = useResponsive()
  
  // 邀请用户列表分页状态
  const [invitationListData, setInvitationListData] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const [type, setType] = useState('ALL')

  const { invitationSummaryData, fetchInvitationListData} = useUserInviteInfo()

  useEffect(() => {
    getInvitationList(type,1, true)
  }, [])

  // 获取邀请用户列表数据
  const getInvitationList = async (type: string, page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true)
        setInvitationListData([])
        setCurrentPage(1)
      } else {
        setIsLoadingMore(true)
      }
      
      const ListData = await fetchInvitationListData(type, page, pageSize);
      if (ListData && ListData.success) {
        const newData = ListData.data || []
        const total = ListData.total || 0
        
        if (isRefresh) {
          setInvitationListData(newData)
          const hasMore = total > newData.length
          setHasNextPage(hasMore)
        } else {
          setInvitationListData((prevData: any[]) => {
            const updatedData = [...prevData, ...newData]
            // 更新分页状态 - 使用最新的数据长度
            const hasMore = total > updatedData.length
            setHasNextPage(hasMore)
            
            return updatedData
          })
        }
        
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch invitation list:', error)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 处理加载更多
  const handleLoadMore = (_transactionType: string, page: number, _pageSize: number) => {
    if(_transactionType !== type){
      setInvitationListData([])
      setType(_transactionType)
      getInvitationList(_transactionType, 1, true)
    }else if(_transactionType === type){
      return;
    }else{
      getInvitationList(type, page, false)
    }
  }
  return (
    <div className={cn("@container relative mx-auto px-3 bg-[#121212] flex flex-col", 
      isDesktop ? 'w-full h-full overflow-hidden' : 'h-screen overflow-hidden flex flex-col'
    )}>
     {!isDesktop && <div className="flex-shrink-0">
        <NavigationHeader 
          title={t('nodeAgent.inviteUser')}
          onBack={() => { navigate(-1)}}
          onClose={() => {navigate('/')}}
          showBack={true}
          showClose={true}
        />
      </div>}
      
      {/* 统计卡片 */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#ECECED1F] rounded-[10px] p-3 flex flex-col items-center">
          <span className="text-[14px] text-[#FFFFFFB2]">{t('nodeAgent.invitedUserCount')}</span>
          <span className="text-[20px] font-bold text-white mt-1">{invitationSummaryData?.invitedUserCount}</span>
        </div>
        <div className="bg-[#ECECED1F] rounded-[10px] p-3 flex flex-col items-center">
          <span className="text-[14px] text-[#FFFFFFB2]">{t('nodeAgent.tradingUserCount')}</span>
          <span className="text-[20px] font-bold text-white mt-1">{invitationSummaryData?.tradingUserCount}</span>
        </div>
      </div>

      {/* 我的邀请 标题 */}
      <div className="flex-shrink-0 mt-6">
        <h2 className="text-white text-[17px] mb-4">{t('nodeAgent.myInvite')}</h2>
      </div>
      
      {/* 受邀用户表格 */}
      <div className={cn("pb-2 flex-1 flex flex-col min-h-0 overflow-hidden", isDesktop && "")}>
        <div className={cn("bg-[#121212] rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden")}>
          <InvitedUsersTable 
            loading={loading} 
            data={invitationListData} 
            hasNextPage={hasNextPage}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            pageSize={pageSize}
            initialPage={1}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}

export default InviteUser