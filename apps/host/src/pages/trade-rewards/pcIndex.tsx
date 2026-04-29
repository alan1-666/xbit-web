import { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useTradeRewards } from './hooks/useTradeRewards'
import { formatNumberWithCommas } from '@/utils/helpers'
import ClaimDrawer from './components/ClaimDrawer'
import _ from 'lodash'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { formatAddressWallet } from '@/lib/string'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { Button } from '@/components/ui/button'
import InviteCodeModal from '../invite-friends/components/InviteCodeModal'
import DialogInviteFriends from '../invite-friends/dialog-invite-friends'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { WalletAvatar } from '@/components/assets/funding/WalletAvatar'
import { Splash } from '@/components/assets/Splash'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
// 初始化数据
const initialTradeData = {
  currentLevel: 1,
  currentLevelProgress: 0,
  nextLevel: 2,
  pointsNeeded: 0,
  totalVolume: 0,
  activeDays: 0,
  totalCommission: '0',
}

export interface DialogControl {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

const PcIndex = ({ setOpen }: DialogControl) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userLevelInfo, fetchUserTierInfo, fetchTaskCategories, fetchClaimRewardData, fetchTasksByType, tasksList, completeTask } = useTradeRewards()
  const [tradeData, setTradeData] = useState(initialTradeData)
  const [banlancelist, setBanlancelist] = useState<any>({})
  const priceSol = useAppSelector(priceChain('SOL'))
  const [progress, setProgress] = useState(0)
  const [currentTaskTab, setCurrentTaskTab] = useState('DAILY')
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const [refresh, setRefresh] = useState(false)
  const [currentType, setCurrentType] = useState('0') // 0: 领取奖励, 1: 领取记录, 2: 等级权益
  // Tab configuration for tasks
  const taskTabs = [
    { value: 'DAILY', label: t('Activityrewards.pointsTask.daily') },
    { value: 'COMMUNITY', label: t('Activityrewards.pointsTask.community') },
    { value: 'TRADING', label: t('Activityrewards.pointsTask.trade') },
  ]
  useEffect(() => {
    if (!activeWallet.isConnected) return
    fetchUserTierInfo()
    fetchTaskCategories()
    getClaimReward()
    getUserInviteInfo()
  }, [])

  // 获取用户邀请码
  const getUserInviteInfo = async () => {
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user
      setInvitationCode(user?.invitationCode || '')
    } catch (error) {
      console.error('get user invite info failed', error)
    }
  }

  useEffect(() => {
    if (!activeWallet.isConnected) return
    fetchTasksByType(currentTaskTab)
  }, [currentTaskTab])

  useEffect(() => {
    if (!_.isEmpty(userLevelInfo)) {
      const isMaxLevel = !userLevelInfo?.nextTier || userLevelInfo?.nextTier?.tierLevel === null || userLevelInfo?.nextTier?.tierLevel === undefined
      setTradeData({
        currentLevel: userLevelInfo?.tierBenefit?.tierLevel,
        currentLevelProgress: userLevelInfo?.tierBenefit?.cashbackPercentage,
        nextLevel: userLevelInfo?.nextTier?.tierLevel,
        pointsNeeded: userLevelInfo.pointsToNextTier,
        totalVolume: userLevelInfo?.userTierInfo?.tradingVolumeUsd,
        activeDays: userLevelInfo?.userTierInfo?.activeDaysThisMonth,
        totalCommission: userLevelInfo?.userTierInfo?.cumulativeCashbackUsd,
      })
      if (isMaxLevel) {
        // 如果是最高级别，进度设置为 100%
        setProgress(100)
      } else {
        calculateProgress(
          userLevelInfo?.userTierInfo?.totalPoints,
          userLevelInfo?.tierBenefit?.minPoints,
          userLevelInfo?.nextTier?.minPoints,
        )
      }
    } else {
      setTradeData(initialTradeData)
    }
  }, [userLevelInfo])

  // 计算进度
  const calculateProgress = (totalPoints: number, currentLevelPoints: number, nextLevelPoints: number | null | undefined) => {
    if (!nextLevelPoints || nextLevelPoints === currentLevelPoints) {
      // 如果没有下一级别或下一级别与当前级别相同，进度为 100%
      setProgress(100)
      return
    }
    const progress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100 || 0
    setProgress(Number(progress.toFixed(2)))
  }

  const getClaimReward = async () => {
    const banlancelist: any = fetchClaimRewardData && (await fetchClaimRewardData())
    setBanlancelist(banlancelist)
  }

  // 根据当前sol 价格 计算美元价值
  const availableUsdValue = useMemo(() => {
    const claimAmount = Number(banlancelist?.claimActivityCashback) || 0
    if (claimAmount === 0) {
      return '0'
    }
    const solPrice = Number(priceSol) || 0
    const banlance = (claimAmount * solPrice).toFixed(9)

    if (isNaN(Number(banlance)) || !isFinite(Number(banlance))) {
      return '0'
    }

    const formattedValue = formatNumberWithCommas(banlance, 9)
    return formattedValue || '0'
  }, [banlancelist?.claimActivityCashback, priceSol])

  const userName = userAddress ? formatAddressWallet(userAddress, 6, 6) : 'User Name'
  const userPoints = userLevelInfo?.userTierInfo?.totalPoints || 0

  // 刷新任务列表
  const handleRefresh = () => {
    fetchTasksByType(currentTaskTab)
    
  }

  // 获取当前语言
  const getCurrentLanguage = () => {
    return localStorage.getItem('i18nextLng') || 'en'
  }

  // 任务跳转处理
  const handleTaskJump = (actionTarget: string) => {
    if (actionTarget === 'homePage') {
      navigate(APP_PATH.FUTURES_DISCOVER)
    } else if (actionTarget === 'memeHome') {
      navigate(APP_PATH.MEME_DISCOVER)
    } else if (actionTarget === 'memeTrade') {
      navigate(APP_PATH.MEME_DISCOVER)
    } else if (actionTarget === 'FuturesTrade') {
      navigate(APP_PATH.FUTURES)
    } else if (actionTarget === 'market') {
      navigate(APP_PATH.MARKET)
    } else if (actionTarget === 'InvitationPage') {
      // 如果是邀请任务，根据是否有邀请码决定弹出哪个对话框
      if (!invitationCode) {
        // 没有邀请码，弹出创建邀请码对话框
        setIsOpenDialogInviteCode(true)
      } else {
        // 有邀请码，弹出分享邀请码对话框
        setIsOpenDialogInviteFriends(true)
      }
    }
  }

  // 处理任务操作
  const handleTaskAction = async (task: any) => {
    logEvent2(ACTIONS.reward_task_click, {
      task_id: task?.task?.id,
      task_name: task?.task?.name?.en,
    })
    const verificationMethod = task.task.verificationMethod
    if (verificationMethod === 'CLICK_VERIFY') {
      window.open(task.task.externalLink, '_blank')
      await completeTask(task.task.id)
      logEvent2(ACTIONS.reward_task_complete, {
        task_id: task?.task?.id,
        task_name: task?.task?.name?.en,
        reward_amount: task?.task?.points
      })
      handleRefresh()
    } else if (verificationMethod === 'AUTO') {
      if (task.task.buttonText !== 'trade' && task.task.actionTarget !== 'InvitationPage') {
        await completeTask(task.task.id)
        logEvent2(ACTIONS.reward_task_complete, {
          task_id: task?.task?.id,
          task_name: task?.task?.name?.en,
          reward_amount: task?.task?.points
        })
        handleRefresh()
      }
      setOpen?.(false)
      handleTaskJump(task.task.actionTarget)
    } else if (verificationMethod === 'MANUAL') {
      // 手动验证逻辑
    }
  }

  const [claimDrawerOpen, setClaimDrawerOpen] = useState(false)
  const [claimDrawerHeight, setClaimDrawerHeight] = useState(0)
  const claimDrawerRef = useRef<HTMLDivElement>(null)
  const [invitationCode, setInvitationCode] = useState('')
  const [isOpenDialogInviteCode, setIsOpenDialogInviteCode] = useState(false)
  const [isOpenDialogInviteFriends, setIsOpenDialogInviteFriends] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState('')

  // 显示领取返现抽屉
  const showClaimDrawer = () => {
    setClaimDrawerOpen(true)
    setCurrentType('0')
  }

  // 监听 ClaimDrawer 的高度变化
  useEffect(() => {
    if (claimDrawerOpen && claimDrawerRef.current) {
      const updateHeight = () => {
        if (claimDrawerRef.current) {
          const height = claimDrawerRef.current.offsetHeight
          setClaimDrawerHeight(height)
        }
      }
      
      // 初始测量
      updateHeight()
      
      // 监听窗口大小变化
      window.addEventListener('resize', updateHeight)
      
      // 使用 ResizeObserver 监听元素大小变化
      const resizeObserver = new ResizeObserver(updateHeight)
      resizeObserver.observe(claimDrawerRef.current)
      
      return () => {
        window.removeEventListener('resize', updateHeight)
        resizeObserver.disconnect()
      }
    } else {
      setClaimDrawerHeight(0)
    }
  }, [claimDrawerOpen])

  // 获取按钮文本
  const getButtonText = (task: any) => {
    const status = task.task?.buttonText
    if (status === 'view') {
      return t('Activityrewards.pointsTask.goView')
    } else if (status === 'trade') {
      return t('Activityrewards.pointsTask.goTrade')
    } else if (status === 'follow') {
      return t('Activityrewards.pointsTask.goFollow')
    } else if (status === 'share') {
      return t('Activityrewards.pointsTask.goShare')
    } else if (status === 'forward') {
      return t('Activityrewards.pointsTask.goForward')
    } else if (status === 'join') {
      return t('Activityrewards.pointsTask.goJoin')
    }
    else{
      return t('Activityrewards.pointsTask.goComplete')
    }
  }

  if (!activeWallet.isConnected) return <Splash />

  return (
    <div 
      className="flex flex-col gap-[40px] items-start py-[32px] w-[1200px] mx-auto min-h-screen bg-[#0a0a0a]"
      style={{ 
        // 底部固定区域：bottom-[32px] + h-[88px] = 120px，加上额外空间 = 140px
        // ClaimDrawer 打开时：底部固定区域(120px) + ClaimDrawer高度 + 额外间距(20px)
        paddingBottom: claimDrawerOpen && claimDrawerHeight > 0 
          ? `${120 + claimDrawerHeight + 20}px` 
          : '140px' 
      }}
    >
      {/* 标题 */}
      <div className="flex flex-col gap-[20px] items-start w-full">
        <h1 className="text-[30px] font-semibold text-white leading-[30px] tracking-[0.4px]">
          {t('Activityrewards.title')}
        </h1>

        {/* 用户信息卡片 */}
        <div className="bg-[#121214] flex flex-col gap-[16px] items-start p-[16px] rounded-[12px] w-full">
          {/* 用户信息行 */}
          <div className="flex gap-[8px] items-center w-full">
            {/* 用户头像 */}
            <div className="border border-[#adf532] rounded-full shadow-[0px_0px_15px_0px_rgba(170,245,53,0.23)] shrink-0 w-[60px] h-[60px] overflow-hidden">
             <WalletAvatar address={userAddress} className="w-full h-full object-cover" rounded={false} />
            </div>

            {/* 用户信息 */}
            <div className="flex-1 flex items-center justify-between">
              <div className="flex gap-[8px] items-center">
                <div className='flex items-center gap-[8px]'>
                  <p className="text-[20px] font-semibold text-[#CACACA] capitalize">{userName}</p>
                  <span className="px-2 min-w-[40px] text-center bg-white text-[14px] font-medium text-[#121214] rounded-full"> {tradeData.currentLevelProgress.toFixed(0)}%</span>
                </div>
              </div>
              {/* <div className="flex gap-[16px] items-center">
                <p className="text-[20px] font-semibold text-[#CACACA]">{userPoints}</p>
                <p className="text-[20px] font-semibold text-[#CACACA] capitalize">{t('Activityrewards.point')}</p>
              </div> */}
            </div>
          </div>

          {/* 进度条 */}
          <div className="relative w-full">
            {/* 进度条背景和进度 */}
            <div className="relative h-[10px] w-full">
              <div className="absolute inset-0 bg-[#302e38] rounded-[20px] h-[10px]" />
              <div
                className="absolute left-0 top-0 bg-[#843bea] h-[10px] rounded-[20px] transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
              {/* 进度指示器 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-[#843bea] rounded-full shadow-lg flex items-center justify-center"
                style={{ left: `calc(${Math.min(progress, 100)}% - 9px)` }}
              >
                <div className="w-[10px] h-[10px] bg-black rounded-full" />
              </div>
            </div>

            {/* 等级标签和距离文本 */}
            <div className="flex flex-col gap-[12px] mt-[12px]">
              <div className="flex justify-between items-center">
                <div className="bg-[#121214] text-white text-[13px] font-medium px-2 h-[21px] rounded-full">
                  Lv{tradeData.currentLevel}
                </div>
                <div className="bg-[#121214] text-white text-[13px] font-medium px-2 h-[21px] rounded-full">
                  {tradeData.nextLevel === null || tradeData.nextLevel === undefined ? 'Max' : `Lv${tradeData.nextLevel}`}
                </div>
              </div>
              {tradeData.nextLevel !== null && tradeData.nextLevel !== undefined && (
                <div className="text-right text-[#CACACA] text-[13px]">
                  {t('Activityrewards.distanceToNextLevel')}{' '}
                  <span className="text-[#C8A7FD] font-semibold">{tradeData.pointsNeeded}</span>{' '}
                  {t('Activityrewards.exp')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="flex items-center justify-between w-full">
          <div className="bg-[#27272a] flex h-[40px] items-center p-1 rounded-[6px]">
            {taskTabs.map((tab) => (
              <div
                key={tab.value}
                onClick={() => setCurrentTaskTab(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-[4px] cursor-pointer transition-all',
                  currentTaskTab === tab.value
                    ? 'bg-[#121214] text-[#CACACA] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]'
                    : 'text-[#9d9ca2] hover:text-[#CACACA]'
                )}
              >
                <div className="text-[16px] font-medium leading-[20px] whitespace-nowrap">
                  {tab.label}
                </div>
              </div>
            ))}
          </div>

          {/* 刷新按钮 */}
          <div
            onClick={()=>{
              handleRefresh()
               // 刷新 需要重新请求数据
               setRefresh(true)
               // 点击的时候 图标旋转
               const img = document.querySelector('.refresh-icon') as HTMLImageElement
               img.classList.add('animate-spin')
               setTimeout(() => {
                   img.classList.remove('animate-spin')
                   setRefresh(false)
               }, 800)
            }}
            className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/nodeAgent/rotate-left.svg"
              className="w-4 h-4  refresh-icon"
              alt="refresh"
            />
          </div>
        </div>

        {/* 任务列表 */}
        <div className="bg-[#121214] flex flex-col gap-[20px] items-start p-[16px] rounded-[12px] w-full overflow-hidden">
          {tasksList && tasksList.length > 0 ? (
            <div className="w-full space-y-0">
              {tasksList.map((task: any) => {
                const { name, taskIcon, points, frequency } = task?.task
                const taskTypeImages = {
                  DAILY: '/images/nodeAgent/daily.svg',
                  COMMUNITY: '/images/nodeAgent/community.svg',
                  TRADING: '/images/nodeAgent/trade.svg',
                }
                const imageSrc = taskTypeImages[currentTaskTab as keyof typeof taskTypeImages]
                const isCompleted = task.progress?.status === 'CLAIMED' || task.progress?.status === 'COMPLETED'
                const showCompleted = isCompleted && task.task.frequency !== 'UNLIMITED'

                return (
                  <div
                    key={task.task.id}
                    className="bg-[#212127] border border-[#79778C16] flex h-[56px] items-center px-3 py-3 rounded-[12px] mb-[16px] last:mb-0"
                  >
                    <div className="flex-1 flex items-center justify-between min-h-0 min-w-0">
                      <div className="flex gap-3 items-center">
                        {/* 任务图标 */}
                        <div className="shrink-0 w-[40px] h-[40px]">
                          <img
                            src={taskIcon || imageSrc}
                            className="w-[40px] h-[40px] rounded-full"
                            alt="task-icon"
                          />
                        </div>

                        {/* 任务名称 */}
                        <p className="text-[16px] font-normal text-white leading-normal">
                          {name[getCurrentLanguage()]}
                          {task.progress && frequency === 'PROGRESSIVE' && (
                            <span className="text-[#9d9ca2]">
                              {' '}({task.progress.progressValue}/{task.progress.targetValue})
                            </span>
                          )}
                        </p>

                        {/* 积分奖励 */}
                        {points !== 0 && (
                          <div className="flex gap-1 items-end leading-none">
                            <p className="text-[16px] font-medium text-[#C8A7FD]">+{points}</p>
                            <p className="text-[13px] font-normal text-[#908E98]">
                              {t('Activityrewards.exp')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 操作按钮 */}
                      <div className="shrink-0">
                        {showCompleted ? (
                          <div className="bg-[#79778C16] h-[32px] flex items-center justify-center px-4 rounded-[6px] min-w-[80px]">
                            <div className="text-[14px] font-medium text-white text-center whitespace-nowrap">
                              {t('Activityrewards.pointsTask.completed')}
                            </div>
                          </div>
                        ) : (
                          <Button
                            // variant="gradient"
                            onClick={() => handleTaskAction(task)}
                            className="bg-[#843BEA] h-[32px] flex items-center justify-center px-4 rounded-[6px] min-w-[80px] text-white text-[14px] font-medium hover:opacity-90"
                          >
                            {getButtonText(task)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center w-full py-8">
              <div className="text-[#9d9ca2] text-[14px]">{t('Activityrewards.noTasks')}</div>
            </div>
          )}
        </div>
      </div>

      {/* 底部可领取返现区域 */}
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-[60px] w-[1200px] h-[88px] rounded-[18px] backdrop-blur-[34px] z-10"
        style={{
          background: 'linear-gradient(98.02deg, rgba(99, 39, 184, 1) 0.51%, rgba(78, 20, 159, 1) 62.03%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[18px] opacity-40 pointer-events-none">
          <img
            src="/images/nodeAgent/bg.png"
            alt="bg"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-5 py-2.5">
          {/* 左侧：币种图标和数据 */}
          <div className="flex gap-4 items-center">
            {/* 币种图标 */}
            <div className="relative w-[68px] h-[68px] shrink-0 overflow-hidden">
              <img
                src="/images/nodeAgent/gif.png"
                alt="gif"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 数据展示 */}
            <div className="flex gap-[40px] items-center">
              {/* 可领取返现 */}
              <div className="flex flex-col gap-1 p-4 rounded-[10px] text-white">
                <div className="text-[13px] font-medium leading-none whitespace-nowrap">
                  {t('Activityrewards.PendingCliam')}
                </div>
                <div className="text-[20px] font-semibold leading-none">
                  ${availableUsdValue}
                </div>
              </div>

              {/* 累计已领取 */}
              <div className="flex flex-col gap-1 p-4 rounded-[10px] text-white">
                <div className="text-[13px] font-medium leading-none whitespace-nowrap">
                  {t('Activityrewards.Totalreceived')}
                </div>
                <div className="text-[20px] font-semibold leading-none">
                  ${formatNumberWithCommas(banlancelist?.totalClaimedUsd || 0, 6)}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：Claim All 按钮 */}
          <div className="flex gap-3 items-center">
            <button
              onClick={showClaimDrawer}
              className="bg-white h-[40px] flex items-center justify-center px-4 py-2 rounded-[6px] text-black text-[14px] font-medium hover:opacity-90"
            >
              {t('nodeAgent.claimNow')}
            </button>
            <div className="w-6 h-6 shrink-0 cursor-pointer" onClick={()=> {setClaimDrawerOpen(claimDrawerOpen ? false : true); setCurrentType('0')}}>
              <img src="/images/icons/arrow-down-icon.svg" alt="arrow" className={cn(!claimDrawerOpen ? 'rotate-180' : '', 'w-full h-full')} />
            </div>
            <ClaimDrawer
              banlancelist={banlancelist}
              onClaimSuccess={getClaimReward}
              userLevel={tradeData.currentLevel}
              open={claimDrawerOpen}
              onOpenChange={setClaimDrawerOpen}
              solPrice={priceSol}
              drawerRef={claimDrawerRef}
              currentType={currentType}
            />
          </div>
        </div>
      </div>

      {/* 创建邀请码对话框 */}
      {isOpenDialogInviteCode && (
        <InviteCodeModal
          onClose={() => {
            setIsOpenDialogInviteCode(false)
          }}
          onCreateCode={(code: string) => {
            setInvitationCode(code)
            setIsOpenDialogInviteCode(false)
          }}
          defaultCode={invitationCode}
        />
      )}

      {/* 分享邀请码对话框 */}
      <DialogInviteFriends 
        open={isOpenDialogInviteFriends} 
        setOpen={setIsOpenDialogInviteFriends} 
      />
    </div>
  )
}

export default PcIndex
