import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import DialogInviteFriends from '../invite-friends/dialog-invite-friends'
import DialogAgentRewards from './dialog-agent-rewards'
import DialogDataOverview from './dialog-data-overview'
import DialogInviteUser from '../invite-friends/dialog-invite-user'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { GET_USER_REFERRALSNAPSHOT, GET_AGENT_TRADE_DATA } from '@/services/agent.dex.service'
import { useNodeAgentData } from './hooks/useNodeAgent'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useAppSelector } from '@/redux/store'
import { priceChain } from '@/redux/modules/price.slice'
import { CopyButton } from '@/components/common/copy-button'
import TimeRangeSelect from '@components/nodeAgent/TimeRangeSelect.tsx'
import MovingLineTabs from '@/components/common/MovingLineTabs'
import { UITab } from '@/types/uiTabs'
import DialogCommissionExplanation from './components/dialog-commission'
import InviteCodeModal from '../invite-friends/components/InviteCodeModal'
import DialogGrade from './components/dialog-grade'
import DialogBindInviteCode from './components/dialog-bind-invite-code'
import { toast } from 'sonner'
import { useUserInviteInfo } from '../invite-friends/hooks/userInviteInfo'
import { Splash } from '@/components/assets/Splash'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

const PcIndex = () => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const [isOpenDialogInviteFriends, setIsOpenDialogInviteFriends] = useState(false)
  const [isOpenDialogAgentRewards, setIsOpenDialogAgentRewards] = useState(false)
  const [isOpenDialogDataOverview, setIsOpenDialogDataOverview] = useState(false)
  const [isOpenDialogInviteUser, setIsOpenDialogInviteUser] = useState(false)
  const [isOpenDialogCommissionExplanation, setIsOpenDialogCommissionExplanation] = useState(false)
  const [isOpenDialogInviteCode, setIsOpenDialogInviteCode] = useState(false)
  const [isOpenDialogBindInviteCode, setIsOpenDialogBindInviteCode] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  const [timeRange, setTimeRange] = useState('TODAY')
  const [isOpenDialogGrade, setIsOpenDialogGrade] = useState(false)
  const [dataType, setDataType] = useState('ALL')
  const priceSol = useAppSelector(priceChain('SOL'))
  const [nodeAgentReferral, setNodeAgentReferral] = useState<any>({
    claimMemeReferral: 0,
    claimAgentReferral: 0,
    totalAccumulatedUSD: 0,
  })
  // 存储全部数据（用于等级对话框）、
  const { invitationSummaryData } = useUserInviteInfo()
  const [allTradeData, setAllTradeData] = useState<any>(null)

  const {
    invitationData,
    tradeData,
    fetchTradeData,
    fetchReferralReward
  } = useNodeAgentData({
    autoFetchInvitation: true,
    autoFetchTrade: {
      dataType: dataType,
      timeRange: timeRange,
    },
  })

  useEffect(() => {
    fetchTradeData(dataType, timeRange)
  }, [dataType, timeRange, activeWallet.isConnected])


  // 查询一次全部数据（用于等级对话框）
  const fetchAllTradeData = async () => {
    try {
      const { data } = await agentDexClient.query({
        query: GET_AGENT_TRADE_DATA,
        variables: {
          input: {
            "dataType": "ALL",
            "timeRange": "ALL_TIME",
          },
        },
      })
      if (data?.transactionData?.success) {
        console.log(data.transactionData.transactionData[0], 'data.transactionData.transactionData[0]')
        setAllTradeData(data.transactionData.transactionData[0])
      } else {
        toast.error(data?.transactionData?.message || 'get all trade data failed')
      }
    } catch (err) {
      toast.error('get all trade data failed')
    }
  }

  useEffect(() => {
    getUserInviteInfo()
    getNodeAgentReferral()
    fetchAllTradeData()
  }, [activeWallet.isConnected])

  const getNodeAgentReferral = async () => {
    const res: any = await fetchReferralReward()
    setNodeAgentReferral({
      claimMemeReferral: res.claimMemeReferral,
      claimAgentReferral: res.claimAgentReferral,
      totalAccumulatedUSD: res.totalAccumulatedUSD,
    })
  }

  const calculateTotalUnclaimedReferralUsd = () => {
    const solPrice = Number(priceSol) || 0
    if (nodeAgentReferral.claimMemeReferral === '0') {
      return nodeAgentReferral.claimAgentReferral
    }
    const memeUsd = (nodeAgentReferral.claimMemeReferral * solPrice).toFixed(9)
    const totalValue = Number(memeUsd) + Number(nodeAgentReferral.claimAgentReferral)
    return formatNumberWithCommas(totalValue, 6)
  }

  const getUserInviteInfo = async () => {
    try {
      const res = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {},
      })
      const user = res?.data?.referralSnapshot?.user
      setInvitationCode(user?.invitationCode || '')
    } catch (error) {

    }
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
  const actualTradeData = tradeData?.[0] || {}

  if (!activeWallet.isConnected) return <Splash />

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-6 items-start w-full">
      <div className="flex-1 flex flex-col items-start justify-center min-w-0">
        <div className="flex flex-col items-start max-w-[680px] mb-6">
          <div className="flex flex-col font-bold justify-center leading-[60px] text-white">
            <p className="text-[48px] leading-[60px] mb-0 font-['Noto_Sans_SC:Bold',sans-serif]">
              {t('nodeAgent.inviteFriends')}
            </p>
            <p className="text-[48px] leading-[60px] font-['Noto_Sans_SC:Bold',sans-serif]">
              <span>{String(t('nodeAgent.inviteFriendsEarnUp')).replace(String(t('nodeAgent.inviteFriends')), '').trim()}</span>
              <span className="font-['Noto_Sans:Bold',sans-serif] text-[#00CE89] ml-2">
                50%
              </span>
              <span className="ml-2">{t('nodeAgent.commission')}</span>
            </p>
          </div>
        </div>
        <div className="pt-6">
          <Button 
            className="h-[44px] text-lg px-5 rounded-[200px] min-w-[183px] bg-[#6A2AE0] text-white" 
            onClick={() => {
              logEvent2(ACTIONS.referral_invite_click)
              if(!invitationCode) {
                setIsOpenDialogInviteCode(true)
              } else {
                setIsOpenDialogInviteFriends(true)
              }
            }}
          >
            {t('nodeAgent.inviteFriends')}
          </Button>
          {!invitationData?.hasReferrer && (
            <Button 
              className="h-[44px] text-lg px-5 ml-[30px] rounded-[200px] min-w-[183px] bg-[#6A2AE0] text-white" 
              onClick={() => {
                setIsOpenDialogBindInviteCode(true)
              }}
            >
              {t('referral.bind.code')}
            </Button>
          )}
        </div>
      </div>
      <div className="relative shrink-0 w-[232px] h-[232px]">
        <img src='/images/nodeAgent/pcGift.svg' alt="avatar-group" className="w-full h-full object-cover object-center" />
      </div>

      </div>

      {/* 底部两个卡片区域 */}
      <div className="flex gap-6 items-start w-full">
        {/* 左侧卡片：邀请好友详情 */}
        <div className="flex-1 border border-[#3e2761] rounded-2xl overflow-hidden" style={{
          backgroundImage: "linear-gradient(180deg, rgba(91, 37, 166, 0) 0%, rgba(91, 37, 166, 0.25) 100%), linear-gradient(90deg, rgba(13, 13, 14, 1) 0%, rgba(13, 13, 14, 1) 100%)"
        }}>
          {/* 卡片头部 */}
          <div className="border-b border-[#3e2761] h-[60px] flex items-center justify-between px-6">
            <h3 className="text-[20px] font-medium text-white">{t('nodeAgent.inviteFriends')}</h3>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpenDialogCommissionExplanation(true)}>
              <span className="text-[16px] text-[#cacaca]">{t('nodeAgent.commissionExplanation')}</span>
              <img src="/images/nodeAgent/more.svg" alt="more" className="w-[14px] h-[14px]" />
            </div>
          </div>

          {/* 卡片内容 */}
          <div className="flex flex-col gap-5 p-6">
            {/* 当前代理等级 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#cacaca]">{t('nodeAgent.currentAgentLevel')}</span>
              <span className="text-[16px] font-medium text-white text-right underline cursor-pointer"
                onClick={() => setIsOpenDialogGrade(true)}
              >
                {invitationData?.currentLevel?.name || 'Lv1'}
              </span>
            </div>

            {/* 邀请码 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#cacaca]">{t('inviteFriends.inviteCode')}</span>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-white text-right">{invitationCode || '--'}</span>
               {invitationCode  && <CopyButton icon="/images/icons/ic-copy-green.svg" text={`${window.location.origin}/@${invitationCode}`} className="w-5 h-5"
                  externalOnClick={() => {
                    logEvent2(ACTIONS.referral_copy_link)
                  }}
               />}
              </div>
            </div>

            {/* 代理奖励 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#cacaca]">{t('nodeAgent.agentRewards')}</span>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-white text-right">
                  {formatNumberWithCommas(nodeAgentReferral.totalAccumulatedUSD || 0, 6)}
                </span>
                <button
                  className="bg-[#3e2761] h-[28px] px-3 py-1 rounded-[200px] text-[13px] text-white"
                  onClick={() => {
                    logEvent2(ACTIONS.referral_agent_reward_click)
                    setIsOpenDialogAgentRewards(true)
                  }}
                >
                  {t('nodeAgent.view')}
                </button>
              </div>
            </div>

            {/* 受邀用户 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#cacaca]">{t('nodeAgent.invitedFriendsTab')}</span>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-white text-right">
                  {invitationSummaryData?.invitedUserCount || '0'}
                </span>
                <button
                  className="bg-[#3e2761] h-[28px] px-3 py-1 rounded-[200px] text-[13px] text-white"
                  onClick={() => {
                    logEvent2(ACTIONS.referral_invited_friends_click)
                    setIsOpenDialogInviteUser(true)
                  }}
                >
                  {t('nodeAgent.view')}
                </button>
              </div>
            </div>

            {/* 分割线 */}
            <div className="h-px bg-[#3e2761] w-full"></div>

            {/* 待领取返佣金额 */}
            <div className="flex items-center justify-between gap-12">
              <div className="flex-1 flex flex-col gap-2 text-left">
                <span className="text-[16px] text-[#cacaca] font-light">{t('nodeAgent.pendingCommissionAmount')}</span>
                <span className="text-[24px] font-semibold text-white">
                  {calculateTotalUnclaimedReferralUsd()}
                </span>
              </div>
              <Button
                className="h-[40px] px-6 rounded-[200px] text-[16px] font-bold min-w-[200px] bg-[#6A2AE0] text-white"
                onClick={() => setIsOpenDialogAgentRewards(true)}
              >
                {t('nodeAgent.claimNow')}
              </Button>
            </div>
          </div>
        </div>

        {/* 右侧卡片：交易总览 */}
        <div className="flex-1 rounded-2xl overflow-hidden" style={{
          backgroundImage: "linear-gradient(90deg, rgba(24, 24, 27, 1) 0%, rgba(24, 24, 27, 1) 100%), linear-gradient(0deg, rgba(25, 25, 25, 1) 0%, rgba(25, 25, 25, 0) 100%)"
        }}>
          {/* 卡片头部 */}
          <div className="border-b border-[#3a3a3a] h-[60px] flex items-center justify-between px-6">
            <div className="flex gap-6 items-end h-full">
              <MovingLineTabs
                tabs={tabs}
                onTabChange={(v) => setDataType(v)}
                defaultTab={tabs[0].value || ''}
                showContainerBottomLine={false}
                containerClassName="bg-[none] w-full h-full"
                tabsClassName="w-full  h-full"
                tabsListClassName="p-0 h-full"
                itemClassName="text-[20px] first:pl-0 font-normal" 
                wrapperClassName='h-full'
              />
            </div>
            <div className="h-[26px] rounded-[200px] px-0 py-1 flex items-center gap-1">
              <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
            </div>
          </div>

          {/* 卡片内容 */}
          <div className="flex flex-col gap-5 p-6">
            {/* 已领取返佣金额 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#999]">{t('nodeAgent.tradingOverview.totalCommissionReceived')}</span>
              <span className="text-[16px] text-[#999] text-right">
                {formatNumberWithCommas(actualTradeData?.claimedUsd || '0', 6)}
              </span>
            </div>

            {/* 衍生品交易量 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#999]"> {dataType === 'ALL' ? t('nodeAgent.tradingOverview.derivativesVolume') : t('nodeAgent.tradingOverview.Available')}</span>
              <span className="text-[16px] text-[#999] text-right">
                {dataType === 'ALL' ? formatNumberWithCommas(actualTradeData?.contractVolumeUsd || '0', 6) : formatNumberWithCommas(actualTradeData?.pendingClaimUsd || '0', 6)}
              </span>
            </div>

            {/* Meme交易量 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#999]">  {dataType === 'CONTRACT' ?  t('nodeAgent.tradingOverview.derivativesVolume') : t('nodeAgent.tradingOverview.memeVolume')}</span>
              <span className="text-[16px] text-[#999] text-right">
              {dataType === 'CONTRACT' ? formatNumberWithCommas(actualTradeData?.contractVolumeUsd || '0',6) : formatNumberWithCommas(actualTradeData?.memeVolumeUsd || '0',6)}
              </span>
            </div>

            {/* 邀请人数 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#999]">{t('nodeAgent.tradingOverview.invitedCount')}</span>
              <span className="text-[16px] text-[#999] text-right">
                {formatNumberWithCommas(actualTradeData?.invitationCount || '0', 0)}
              </span>
            </div>

            {/* 交易人数 */}
            <div className="flex items-center justify-between h-[28px]">
              <span className="text-[16px] text-[#999]">{t('nodeAgent.tradingOverview.tradersCount')}</span>
              <span className="text-[16px] text-[#999] text-right">
                {formatNumberWithCommas(actualTradeData?.transactingUserCount || '0', 0)}
              </span>
            </div>

            {/* 查看数据总览按钮 */}
            <button
              className="border border-[#302e38] h-[40px] px-5 py-3 rounded-[200px] text-[16px] font-medium text-[#908e98] flex items-center justify-center"
              onClick={() => setIsOpenDialogDataOverview(true)}
            >
              {t('nodeAgent.commissionTable.viewDataOverview')}
            </button>
          </div>
        </div>
      </div>

      {/* 对话框 */}

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
      <DialogInviteFriends 
        open={isOpenDialogInviteFriends} 
        setOpen={setIsOpenDialogInviteFriends} 
      />
      <DialogAgentRewards 
        open={isOpenDialogAgentRewards} 
        setOpen={setIsOpenDialogAgentRewards} 
      />
      <DialogDataOverview 
        open={isOpenDialogDataOverview} 
        setOpen={setIsOpenDialogDataOverview} 
      />
      <DialogInviteUser 
        open={isOpenDialogInviteUser} 
        setOpen={setIsOpenDialogInviteUser} 
      />
      <DialogCommissionExplanation 
        open={isOpenDialogCommissionExplanation} 
        setOpen={setIsOpenDialogCommissionExplanation} 
        currentLevel={Number(invitationData?.currentLevel.name.replace('Lv', ''))}
      />
      <DialogGrade
        open={isOpenDialogGrade}
        setOpen={setIsOpenDialogGrade}
        currentLevel={Number(invitationData?.currentLevel.name.replace('Lv', ''))}
        invitationData={
          {
            memeVolume: allTradeData?.memeVolumeUsd || 0,
            contractVolume: allTradeData?.contractVolumeUsd || 0,
          }
        }
      />
      <DialogBindInviteCode
        open={isOpenDialogBindInviteCode}
        setOpen={setIsOpenDialogBindInviteCode}
        onSuccess={() => {
          // 绑定成功后可以刷新数据
          getUserInviteInfo()
        }}
      />
    </div>
  )
}

export default PcIndex