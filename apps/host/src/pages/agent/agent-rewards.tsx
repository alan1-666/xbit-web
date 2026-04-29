import NavigationHeader from '@/components/nodeAgent/NavigationHeader'
import { useNavigate } from 'react-router-dom'
import { useState,useMemo,useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { UITab } from '@/types/uiTabs.ts'
import RewardsRecord from './components/rewardsRecord'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useNodeAgentData } from './hooks/useNodeAgent'
import { _activeWallet,_walletDex } from '@/redux/modules/newWallet.slice'
import { useTradeRewards } from '../trade-rewards/hooks/useTradeRewards'
import { useAppSelector } from '@/redux/store'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

// 代币奖励数据类型
interface TokenReward {
  id: string
  symbol: string
  amount: string
  icon: string
  claimed: boolean
  rewardType: string
}


const AgentRewards = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {isDesktop} = useResponsive()
  // 当前代理等级
  const currentLevelInfo = useSelector((state: RootState) => (state.agent as any)?.currentLevel)
  const rewardData = useSelector((state: RootState) => (state.agent as any)?.ClaimRewardData) || {}
  const [data, setData] = useState(rewardData)
  const agentLevel = currentLevelInfo?.currentLevel?.name
  const { fetchClaimReward,fetchReferralReward,fetchInvitationRewardData } = useNodeAgentData()
  const { fetchClaimRecord } = useTradeRewards()
  const dexWallet = useSelector(_walletDex)
  const activeAccount = useAppSelector((state: any) => state.newWallet)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const SolWallet = listWalletsByChain.find((item: any) => item.chain === 'SOLANA')?.walletAddress
  const activeAccountSolWallet = activeAccount?.activeAccountWallet  != "" ? activeAccount?.activeAccountWallet : SolWallet
  const [Loading,setLoading] = useState(false)
  // 当前选中的tab
  const [currentTab, setCurrentTab] = useState('0')
  
  // 邀请奖励数据分页状态
  const [inviteRewardsData, setInviteRewardsData] = useState<any>([])
  const [inviteLoadingMore, setInviteLoadingMore] = useState(false)
  const [inviteHasNextPage, setInviteHasNextPage] = useState(false)
  
  const pageSize = 10

  // 提现记录数据分页状态
  const [withdrawalRecordsData, setWithdrawalRecordsData] = useState<any>([])
  const [withdrawalLoadingMore, setWithdrawalLoadingMore] = useState(false)
  const [withdrawalHasNextPage, setWithdrawalHasNextPage] = useState(false)

  const tabs: UITab[] = [
    {
        value: '0',
        label:t('nodeAgent.inviteReward'),
    },
    {
        value: '1',
        label: t('nodeAgent.withdrawalRecord'),
    },
    ]
  
  // 加载状态
  const [isClaimingAll, setIsClaimingAll] = useState(false)
  const [claimingTokenId, setClaimingTokenId] = useState<string | null>(null)

  useEffect(() => {
    getInviteRewards(1, true)    
  }, [])

  // 获取邀请奖励数据
  const getInviteRewards = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true)
        setInviteRewardsData([])

      } else {
        setInviteLoadingMore(true)
      }
      
      const data:any = await fetchInvitationRewardData(page, pageSize)
      if (data?.success) {
        const newData = data.data || []
        const total = data.total || 0
        
        if (isRefresh) {
          setInviteRewardsData(newData)
        } else {
          // 追加数据，避免重复
          setInviteRewardsData((prevData: any[]) => {
            // const existingIds = new Set(prevData.map((item: any) => item.id))
            // const filteredNewData = newData.filter((item: any) => !existingIds.has(item.id))
            return [...prevData, ...newData]
          })
        }
        // 判断是否还有下一页

        const currentTotal = isRefresh ? newData.length : inviteRewardsData.length + newData.length
        const hasMore = total > currentTotal
        setInviteHasNextPage(hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch invitation rewards:', error)
    } finally {
      setInviteLoadingMore(false)
      setLoading(false)
    }
  }

  // 获取提现记录数据
  const getWithdrawalRecords = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setLoading(true)
        setWithdrawalRecordsData([])
        // setWithdrawalCurrentPage(1)
      } else {
        setWithdrawalLoadingMore(true)
      }
      
      const ListData = await fetchClaimRecord(page, pageSize,"success",false);
      if (ListData && ListData.success) {
        const newData = ListData.data || []
        
        if (isRefresh) {
          setWithdrawalRecordsData(newData)
        } else {
          // 追加数据，避免重复
          setWithdrawalRecordsData((prevData: any[]) => {
            const existingIds = new Set(prevData.map((item: any) => item.id))
            const filteredNewData = newData.filter((item: any) => !existingIds.has(item.id))
            return [...prevData, ...filteredNewData]
          })
        }
        
        // 判断是否还有下一页
        const currentTotal = isRefresh ? newData.length : withdrawalRecordsData.length + newData.length
        const hasMore = ListData.total > currentTotal
        setWithdrawalHasNextPage(hasMore)
        // setWithdrawalCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal records:', error)
    } finally {
      setWithdrawalLoadingMore(false)
      setLoading(false)
    }
  }
  
  // 代币奖励数据
  const [tokenRewards, setTokenRewards] = useState<TokenReward[]>([
    {
      id: '1',
      symbol: 'SOL',
      amount: formatNumberWithCommas(data.claimMemeReferral, 9) || '0'  ,
      icon: '/images/cryptoDeposit/solana.svg',
      claimed: false,
      rewardType:'MEME',
    },
    {
      id: '2', 
      symbol: 'USDC',
      amount:formatNumberWithCommas(data?.claimAgentReferral, 6) || "0",
      icon: '/images/cryptoDeposit/usdc.svg',
      claimed: false,
      rewardType:'CONTRACT'
    }
  ])

  // 单个代币领取
  const handleClaimToken = async (tokenId: string,rewardType: string,amount: string) => {
    if(rewardType === 'MEME' && Number(amount) < 0.02){
      toast.error(t('nodeAgent.mustBeGreaterThanOrEqualTo2'))
      return;
    }
    if(rewardType === 'CONTRACT' && Number(amount) < 5){
      toast.error(t('nodeAgent.mustBeGreaterThanOrEqualTo3'))
      return;
    }
    const token = tokenRewards.find(t => t.id === tokenId)
    if (!token || token.claimed) return

    try {
      setClaimingTokenId(tokenId)
      // TODO: 调用领取API
      const  userAddress = rewardType === 'MEME' ? activeAccountSolWallet : dexWallet?.walletAddress
      const res:any =  await fetchClaimReward(rewardType, userAddress)
      if(res?.success){ 
        // 更新状态
      setTokenRewards(prev => 
        prev.map(t => 
          t.id === tokenId 
            ? { ...t, claimed: true }
            : t
        )
      )
      getReferral()
      toast.success(t('Activityrewards.claimSuccess') + ` ${token.amount.toLocaleString()} ${token.symbol}`)
      }
    } catch (error) {
   
    } finally {
      setClaimingTokenId(null)
    }
  }

  // 一键领取全部
  const handleClaimAll = async () => {
    try {
      // 获取未领取的代币
      const unclaimedTokens = tokenRewards.filter(token => !token.claimed)
      if (unclaimedTokens.length === 0) {
        return
      }
      // sol 大于0.02，usdc 大于5，则可以领取
      if(Number(tokenRewards[0].amount) < 0.02){
        toast.error(t('nodeAgent.mustBeGreaterThanOrEqualTo2'))
        return;
      }
      if(Number(tokenRewards[1].amount) < 5){
        toast.error(t('nodeAgent.mustBeGreaterThanOrEqualTo3'))
        return;
      }
      setIsClaimingAll(true)
      const res:any =  await fetchClaimReward("ALL", activeAccountSolWallet)
      if(res?.success){
        setTokenRewards(prev => 
          prev.map(token => ({ ...token, claimed: true }))
        )
        getReferral()
        toast.success(t('Activityrewards.claimSuccess'))
      }
    } catch (error) {
      toast.error(t('Activityrewards.claimFailed'))
    } finally {
      setIsClaimingAll(false)
    }
  }
  const getReferral = async() =>{
    const res:any =  await fetchReferralReward()
    setData(res)
  }

  // 处理邀请奖励加载更多
  const handleInviteLoadMore = (page: number) => {
    getInviteRewards(page, false)
  }

  // 处理提现记录加载更多
  const handleWithdrawalLoadMore = (page: number) => {
    getWithdrawalRecords(page, false)
  }

  // 切换tab时的处理
  const handleTabChange = (tabValue: string) => {
    setCurrentTab(tabValue)
    if (tabValue === '1' && withdrawalRecordsData.length === 0) {
      getWithdrawalRecords(1, true)
    }
  }
  // 一键提取按钮禁用状态逻辑
  const claimAllButtonState = useMemo(() => {
    // 检查是否所有代币都不可领取（已领取或余额为0）
    const allTokensUnavailable = tokenRewards.every(token => token.claimed || Number(token.amount) <= 0)
    const isBusy = isClaimingAll || claimingTokenId !== null
    const disabledText = isBusy ? t('Activityrewards.claimLoading') : t('Activityrewards.claimAll')
    return {
      disabled: allTokensUnavailable || isBusy,
      disabledText,
    }
  }, [tokenRewards, isClaimingAll, claimingTokenId])


 
  // 计算单个代币按钮是否禁用
  const isTokenButtonDisabled = (token: TokenReward): boolean => {
    return token.claimed ||  claimingTokenId === token.id ||  isClaimingAll ||  Number(token.amount) <= 0
  }
  // 获取单个代币按钮文本
  const getTokenButtonText = (token: TokenReward): string => {
    if (token.claimed) return t('nodeAgent.claimed')
    if (claimingTokenId === token.id) return t('Activityrewards.claimLoading')
    return t('Activityrewards.claim')
  }
  return (
    <div className={cn("@container relative w-full mx-auto bg-[#121212] flex flex-col h-full overflow-hidden", 
    )}>
      {!isDesktop && <div className="flex-shrink-0 px-3">
        <NavigationHeader 
          title={t('nodeAgent.agentRewards')}
          onBack={() => { navigate(-1)}}
          onClose={() => { navigate("/")}}
          showBack={true}
          showClose={true}
        />
      </div>}
      {isDesktop ? <div className="w-full px-4">
        <div className="flex items-center py-3 justify-between">
           <div>
            <div className="text-lg font-normal text-left text-[14px]">{t('nodeAgent.cumulativeCommissionReward')}</div>
            <div className='text-[24px] font-bold text-rise mt-2'>${formatNumberWithCommas((data?.totalAccumulatedUSD), 6)}</div>
           </div>
           <Button 
                className={`flex-0 py-2 px-4 text-base bg-[#6A2AE0] text-white rounded-[100px] text-[16px] ${isClaimingAll ? 'bg-white/50 cursor-not-allowed' : ''}`}
                onClick={handleClaimAll}
                disabled={claimAllButtonState.disabled}
            >
                {isClaimingAll && (
                    <img src="/images/loading-sprite.png" className="w-4 h-4 animate-spin" alt="Loading" />
                )}
                 {claimAllButtonState.disabledText}
            </Button>
        </div>
        <div className='flex items-center justify-between gap-4'>
          {tokenRewards.map((token) => (
            <div key={token.id} className='bg-[#ECECED12] w-full p-3 rounded-[10px]'>
              <img src={token.icon} alt={token.symbol} className='w-6 h-6' />
              <div className='text-[16px] mt-[8px] mb-[10px]'>{token.amount} {token.symbol}</div>
              <Button 
                className="flex-0  h-[28px] w-[88px]  bg-[#FBFBFB] text-[#141414] rounded-[100px] text-[14px]"
                onClick={() => handleClaimToken(token.id,token.rewardType,token.amount)}
                disabled={isTokenButtonDisabled(token)}
              >
                  {getTokenButtonText(token)}
              </Button>
            </div>
          ))}
          </div>
      </div> : 
        <div className='w-full'>
          <div className={cn('w-full text-center mt-3', isDesktop && 'mt-0')}>
            <div className='text-white text-[36px] font-bold'>${formatNumberWithCommas((data?.totalAccumulatedUSD), 6)}</div>
            <div className='text-[#ffffff80] text-[16px] mt-1'>{t('nodeAgent.cumulativeCommissionReward')}</div>
          </div>
          {/* 代理等级和代币奖励卡片 */}
          <div className="mt-6  px-3">
            <div className="bg-[url('/images/nodeAgent/bg.png')] rounded-[8px]" style={{backgroundSize: '100%',backgroundRepeat:'no-repeat'}}>
              {/* 当前代理等级 */}
              <div className="text-white text-[14px] h-[35px] leading-[35px] px-3">
                {t('nodeAgent.currentAgentLevel')} <span className='text-[18px] font-bold'>{agentLevel}</span>
              </div>
              
              {/* 代币奖励列表 */}
              <div className="bg-[#ffffff] rounded-[8px] px-3 pb-3 ">
                {tokenRewards.map((token, index) => (
                  <div 
                    key={token.id} 
                    className={`flex mb-0 items-center justify-between py-[12px] ${
                      index !== tokenRewards.length - 1 ? 'border-b border-[#ECECED]' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {/* 代币图标 */}
                      <img 
                          src={token.icon} 
                          alt={token.symbol}
                          width={24}
                          height={24}
                          className="mr-2"
                        />
                      {/* 代币信息 */}
                      <div className="flex items-end gap-1 ">
                        <div className="text-[#141414] text-[18px] font-bold">
                          {token.amount}
                        </div>
                        <div className="text-[#141414] text-[14px]">
                          {token.symbol}
                        </div>
                      </div>
                    </div>
                    
                    {/* 领取按钮 */}
                    <Button 
                      variant="gradient" 
                      className="flex-0 h-[24px] text-base !w-auto  rounded-6xl text-[14px]"
                      onClick={() => handleClaimToken(token.id,token.rewardType,token.amount)}
                      disabled={isTokenButtonDisabled(token)}
                    >
                      {getTokenButtonText(token)}
                    </Button>
                  </div>
                ))}
                {/* 一键领取按钮 */}
                <Button 
                    variant="gradient" 
                    className={`flex-0 h-[40px] mt-[12px] text-base w-full  text-white rounded-6xl text-[18px] ${isClaimingAll ? 'bg-white/50 cursor-not-allowed' : ''}`}
                    onClick={handleClaimAll}
                    disabled={claimAllButtonState.disabled}
                >
                    {isClaimingAll && (
                        <img src="/images/loading-sprite.png" className="w-4 h-4 animate-spin" alt="Loading" />
                        
                    )}
                    {claimAllButtonState.disabledText}
                </Button>
              </div> 
            </div>
          </div>
        </div>
      } 
      {/* 记录 */}
       <div className='mt-4 flex-1 flex flex-col min-h-0 overflow-hidden'>
         <MovingLineTabs
           tabs={tabs}
           containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 flex-1 border-b flex-shrink-0"
           tabsListClassName="justify-start font-medium text-[15px]"
           defaultTab={tabs[0]?.value || '0'}
           onTabChange={handleTabChange}
         />
         <div className='mt-4 flex-1 min-h-0 overflow-hidden'> 
            <RewardsRecord 
               type={currentTab === '0' ? 'invite' : 'history'} 
               loading={Loading}
               data={currentTab === '0' ? inviteRewardsData : withdrawalRecordsData} 
               hasNextPage={currentTab === '0' ? inviteHasNextPage : withdrawalHasNextPage}
               isLoadingMore={currentTab === '0' ? inviteLoadingMore : withdrawalLoadingMore}
               onLoadMore={currentTab === '0' ? handleInviteLoadMore : handleWithdrawalLoadMore}
               pageSize={pageSize}
               initialPage={1}
             />
         </div>
       </div>
      
    </div>
  )
}

export default AgentRewards