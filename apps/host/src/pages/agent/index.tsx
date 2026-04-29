import { useState, useRef, useEffect, useMemo } from 'react'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { Button } from '@/components/ui/button'
import './style.css'
import { useTranslation } from 'react-i18next'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import TimeRangeSelect from '@components/nodeAgent/TimeRangeSelect.tsx'
import TradingOverview from '@components/nodeAgent/TradingOverview.tsx'
import CommissionTable from './components/CommissionTable'
import CommissionExplanation from '@/components/nodeAgent/CommissionExplanation'
import { UITab } from '@/types/uiTabs.ts'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useNodeAgentData, useDateRange } from './hooks/useNodeAgent'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { agentDexClient } from '@/lib/gql/apollo-client'
import InviteCodeModal from '@/pages/invite-friends/components/InviteCodeModal'
import { priceChain } from '@/redux/modules/price.slice'
import { useAppSelector } from '@/redux/store'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import DialogInviteFriends from '../invite-friends/dialog-invite-friends'
import DialogAgentRewards from './dialog-agent-rewards'
import DialogDataOverview from './dialog-data-overview'
import DialogInviteUser from '../invite-friends/dialog-invite-user'
import DialogBindInviteCode from './components/dialog-bind-invite-code'
import PcIndex from './pcIndex'
import { Splash } from '@/components/assets/Splash'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

interface agentNav {
  icon: string
  type: 'overview' | 'rewards' | 'friends'
  text: string
  path: string
}
const NodeAgent = ({}: {}) => {
  const { isDesktop } = useResponsive()
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const [timeRange, setTimeRange] = useState('TODAY')
  const navigate = useNavigate()
  const commissionTableRef = useRef<HTMLDivElement>(null)
  const [dataType, setDataType] = useState('ALL')
  const dataRange = useDateRange(timeRange as any)
  const [hasInviteCode, setHasInviteCode] = useState(true)
  const [isOpenDialogInviteFriends, setIsOpenDialogInviteFriends] = useState(false)
  const [isOpenDialogAgentRewards, setIsOpenDialogAgentRewards] = useState(false)
  const [isOpenDialogDataOverview, setIsOpenDialogDataOverview] = useState(false)
  const [isOpenDialogInviteUser, setIsOpenDialogInviteUser] = useState(false)
  const [isOpenDialogBindInviteCode, setIsOpenDialogBindInviteCode] = useState(false)
  const [nodeAgentReferral, setNodeAgentReferral] = useState<any>({
    claimMemeReferral: 0,
    claimAgentReferral: 0,
    totalClaimedReferralUsds: 0, // 累计领取返佣金额
  })
  const priceSol = useAppSelector(priceChain('SOL'))
  // const { fetchClaimRewardData } = useTradeRewards()
  const { invitationData, tradeData, fetchTradeData, fetchReferralReward, fetchInvitationData } = useNodeAgentData({
    autoFetchInvitation: true,
    autoFetchTrade: {
      dataType: dataType,
      timeRange: timeRange,
    },
  })

  useEffect(() => {
    fetchTradeData(dataType, timeRange)
  }, [dataType, timeRange])

  useEffect(() => {
    getUserInviteInfo()
    getNodeAgentReferral()
  }, [])

  const getNodeAgentReferral = async () => {
    const res: any = await fetchReferralReward()
    setNodeAgentReferral({
      claimMemeReferral: res.claimMemeReferral,
      claimAgentReferral: res.claimAgentReferral,
      totalAccumulatedUSD: res.totalAccumulatedUSD,
    })
  }
  // 计算总未领取返佣金额
  const calculateTotalUnclaimedReferralUsd = useMemo(() => {
    const solPrice = Number(priceSol) || 0
    if (nodeAgentReferral.claimMemeReferral === '0') {
      return nodeAgentReferral.claimAgentReferral
    }
    const memeUsd = (nodeAgentReferral.claimMemeReferral * solPrice).toFixed(9)
    const totalValue = Number(memeUsd) + Number(nodeAgentReferral.claimAgentReferral)
    const formattedValue = formatNumberWithCommas(totalValue, 6)
    return formattedValue
  }, [nodeAgentReferral, priceSol])

  // 查询用户邀请码
  const getUserInviteInfo = async () => {
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user
      setHasInviteCode(user.invitationCode ? true : false)
    } catch (error) {}
  }

  const tabs: UITab[] = [
    {
      value: 'ALL',
      label: t('nodeAgent.tabs.all'),
    },
    {
      value: 'MEME',
      label: t('nodeAgent.tabs.meme'),
    },
    {
      value: 'CONTRACT',
      label: t('nodeAgent.tabs.contract'),
    },
  ]

  const handleCommissionExplanation = () => {
    // 点击说明，屏幕滚动到commissionTableRef的位置
    commissionTableRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const agentNav: agentNav[] = [
    {
      icon: '/images/nodeAgent/data.svg',
      type: 'overview',
      text: t('nodeAgent.agentData'),
      path: APP_PATH.NODE_AGENT_DATA_OVERVIEW,
    },
    {
      icon: '/images/nodeAgent/reward.svg',
      type: 'rewards',
      text: t('nodeAgent.agentRewards'),
      path: APP_PATH.NODE_AGENT_REWARDS,
    },
    {
      icon: '/images/nodeAgent/friends.svg',
      type: 'friends',
      text: t('nodeAgent.invitedFriendsTab'),
      path: APP_PATH.INVITE_FRIENDS_USER,
    },
  ]

  // claimRewards function moved to rewards page since button now navigates there

  const renderTop = () => {
    return (
      <>
        {/* Hero Section */}
        <div className="relative mb-8 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 z-10">
              <h1 className="text-title text-2xl font-medium mb-1">{t('nodeAgent.inviteFriendsEarnUp')}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-rise text-6xl font-bold">50</span>
                <span className="text-3xl font-medium text-rise">%</span>
                <span className="text-3xl font-de text-title">{t('nodeAgent.commission')}</span>
              </div>
            </div>
            <div className="absolute right-0 w-[144px] h-[144px] ">
              <img src="/images/nodeAgent/gift.png" alt="Coins" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        {/* Invite Button */}
        <div className="mb-6">
          <Button
            variant="gradient"
            className="h-[44px] text-lg w-full rounded-6xl"
            onClick={() => {
              logEvent2(ACTIONS.referral_invite_click)
              if (isDesktop) {
                setIsOpenDialogInviteFriends(true)
              } else {
                navigate(APP_PATH.INVITE_FRIENDS)
              }
            }}
          >
            {t('nodeAgent.inviteFriends')}
          </Button>
        </div>
        {/* Agent Level Section */}
        <div className="px-[2px] pb-2 bg-[url('/images/nodeAgent/bg.png')] bg-cover rounded-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-white font-xs">
              {t('nodeAgent.currentAgentLevel')}
              <span className="text-lg font-semibold ml-1">{invitationData?.currentLevel?.name}</span>
            </span>
            <div className="flex items-center gap-1 text-title cursor-pointer" onClick={handleCommissionExplanation}>
              <span className="text-sm text-right">{t('nodeAgent.commissionExplanation')}</span>
              <img src="/images/nodeAgent/more.svg" alt="more" className="w-[calc(14rem/16)] h-[calc(14rem/16)]" />
            </div>
          </div>
          {/* Earnings Card */}
          <div className="px-2">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-tertiary opacity-80 text-base mb-1">{t('nodeAgent.pendingCommissionAmount')}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-tertiary opacity-80 text-2xl font-bold">
                      {calculateTotalUnclaimedReferralUsd}
                    </span>
                    <span className="text-tertiary opacity-80 text-base font-medium">USD</span>
                  </div>
                </div>
                <Button
                  variant="gradient"
                  size="sm"
                  className={`flex-0 h-[40px] text-base !w-auto !px-6 rounded-6xl transition-all duration-200`}
                  onClick={() => {
                    if (isDesktop) {
                      setIsOpenDialogAgentRewards(true)
                    } else {
                      navigate(APP_PATH.NODE_AGENT_REWARDS)
                    }
                  }}
                >
                  {t('nodeAgent.claimNow')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="mt-6">
          <div className="flex gap-3">
            {agentNav.map((item, index) => (
              <button
                key={index}
                className="flex-1 bg-white rounded-xl px-2 py-3 flex items-center justify-center gap-2 text-foreground text-tertiary"
                onClick={() => {
                  if (isDesktop) {
                    switch (item.type) {
                      case `overview`:
                        setIsOpenDialogDataOverview(true)
                        break
                      case `rewards`:
                        logEvent2(ACTIONS.referral_agent_reward_click)
                        setIsOpenDialogAgentRewards(true)
                        break
                      case `friends`:
                        logEvent2(ACTIONS.referral_invited_friends_click)
                        setIsOpenDialogInviteUser(true)
                        break
                    }
                  } else {
                    switch (item.type) {
                      case `rewards`:
                        logEvent2(ACTIONS.referral_agent_reward_click)
                        break
                      case `friends`:
                        logEvent2(ACTIONS.referral_invited_friends_click)
                        break
                    }
                    navigate(item.path)
                  }
                }}
              >
                <img src={item.icon} alt={item.type} className="w-[calc(20rem/16)] h-[calc(20rem/16)]" />
                <span className="text-sm font-medium">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }
  const renderDesktopLayout = () => {
    return (
      <div className="w-[1200px] mx-auto h-full pt-[60px]">
        <PcIndex />
      </div>
    )
  }

  if (!activeWallet.isConnected) return <Splash />
  
  return (
    <div className="flex flex-col h-full">
      {isDesktop ? (

        renderDesktopLayout()
      ) : (
      <div className={cn('bg-[#121212]', isDesktop ? 'h-[70vh] overflow-y-scroll w-[660px]' : "@container min-h-[100vh]" )}>
        {!isDesktop && <div className="sticky top-0 z-10">
          <HeaderWithBack 
            title={t('nodeAgent.title')}
            className="bg-[#121212]"
          />
        </div>}
      <div className="relative mx-auto px-3 flex flex-col">
        {/* Main Content */}
        <div className="flex-1 pb-10">
          {renderTop()}
          <div className="mt-6 ">
            <div className="flex items-center justify-between mb-4">
              <MovingLineTabs
                tabs={tabs}
                containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 flex-1"
                tabsListClassName="justify-start font-medium pl-0"
                itemClassName="px-2"
                defaultTab={tabs[0]?.value || 'ALL'}
                onTabChange={(v) => { setDataType(v) }}
              />
              <TimeRangeSelect
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>
            {/* 时间范围 */}
            {timeRange != 'ALL_TIME' && (
            <div className="text-title h-[12px] font-medium text-[12px] w-full flex items-center mb-[16px]">
              {timeRange === 'TODAY' ? (
                <span>{dataRange?.startDate} (UTC+8)</span>
              ) : (
              <>
                <span>{dataRange?.startDate}</span>
                <span className="opacity-50 mx-[6px]">{t('nodeAgent.to')}</span>
                <span>{dataRange?.endDate}</span>
                <span className="opacity-50 ml-[6px]"> (UTC+8) </span>
                </>
              )}
              </div>
            )}
            {/* Trading Overview */}
            <TradingOverview data={tradeData} dataType={dataType} timeRange={timeRange} />

            {/* Data Overview Button */}
            <div className="mt-4">
              <button 
                className="flex items-center border border-[#ECECED1F] rounded-4xl px-4 py-3 text-title hover:bg-opacity-12 transition-colors w-full justify-center"
                onClick={() => { navigate(APP_PATH.NODE_AGENT_DATA_OVERVIEW) }}
              >
                <span className="text-sm font-medium opacity-70">{t('nodeAgent.commissionTable.viewDataOverview')}</span>
                <img src="/images/nodeAgent/down.svg" alt="more" className="w-[calc(20rem/16)] h-[calc(20rem/16)]" />
              </button>
            </div>

            {/* Commission Structure Table */}
            <div ref={commissionTableRef} className="mt-6">
              <CommissionTable
                currentLevel={invitationData?.currentLevel.name.replace('Lv', '')}
              />
            </div>
            
            {/* 返佣代理说明 */}
            <CommissionExplanation currentLevel={Number(invitationData?.currentLevel.name.replace('Lv', ''))} />  
          </div>
        </div>
      </div >

        {!hasInviteCode && (
          <div className="mt-6">
            <InviteCodeModal
              onClose={() => {setHasInviteCode(true)}}
              onCreateCode={() => {setHasInviteCode(true)}}
              defaultCode={''}
            />
          </div>
        )}

        <DialogInviteFriends open={isOpenDialogInviteFriends} setOpen={setIsOpenDialogInviteFriends} />
        <DialogAgentRewards open={isOpenDialogAgentRewards} setOpen={setIsOpenDialogAgentRewards} />
        <DialogDataOverview open={isOpenDialogDataOverview} setOpen={setIsOpenDialogDataOverview} />
        <DialogInviteUser open={isOpenDialogInviteUser} setOpen={setIsOpenDialogInviteUser} />
        <DialogBindInviteCode
          open={isOpenDialogBindInviteCode}
          setOpen={setIsOpenDialogBindInviteCode}
          onSuccess={() => {
            // 绑定成功后刷新数据
            getUserInviteInfo()
            fetchInvitationData()
          }}
        />
        
        {/* 移动端悬浮按钮 - 绑定邀请码 */}
        {!invitationData?.hasReferrer && (
          <button
            onClick={() => setIsOpenDialogBindInviteCode(true)}
            className="fixed bottom-12 right-6 z-50 w-14 h-14 bg-[#00CE89] rounded-2xl shadow-lg flex items-center justify-center hover:bg-[#2dd089] active:scale-95 transition-all"
            // style={{
            //   boxShadow: '0 4px 12px rgba(54, 211, 153, 0.4)',
            // }}
            aria-label="bind invite code"
          >
            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M640 512c94.293333 0 170.666667-76.586667 170.666667-170.666667 0-94.293333-76.373333-170.666667-170.666667-170.666666s-170.666667 76.373333-170.666667 170.666666c0 94.08 76.373333 170.666667 170.666667 170.666667z m-384-85.333333v-128H170.666667v128H42.666667v85.333333h128v128h85.333333v-128h128v-85.333333h-128z m384 170.666666c-113.706667 0-341.333333 56.96-341.333333 170.666667v85.333333h682.666666v-85.333333c0-113.706667-227.626667-170.666667-341.333333-170.666667z" fill="#000000"></path></svg>
          </button>
        )}
      </div>
      )}
    </div>
  )
}

export default NodeAgent
