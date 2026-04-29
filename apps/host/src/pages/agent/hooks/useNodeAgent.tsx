import { useState, useEffect, useMemo } from 'react'
import { 
  GET_AGENT_INVITATION_REWARD_DATA, 
  GET_AGENT_TRADE_DATA, 
  // GER_DATA_OVERVIEW, 
  GET_AGENT_INVITATION_REWARD,
  CLAIM_AGENT_REFERRAL,
  GET_CLAIM_AGENT_REFERRAL,
  GER_REBATE_AMOUNT_CHART,
  GER_TRANSACTION_VOLUME_CHART,
  GER_INVITATION_COUNT_CHART
} from '@/services/agent.dex.service'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { toast } from 'sonner'
import { setCurrentLevel } from '@/redux/modules/agent.slice'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { setClaimRewardData } from '@/redux/modules/agent.slice'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
interface UseNodeAgentDataOptions {
  autoFetchInvitation?: boolean
  autoFetchTrade?: {
    dataType: string
    timeRange: string
  },
  autoFetchDataOverView?: {
    timeRange: string
  },
  InvitationRewards?: {
    page: number
    pageSize: number
  }
  WithdrawalRecords?: {
    page: number
    pageSize: number
  },

}
// interface ChartDataItem {
//   time: string
//   all: number
//   meme: number
//   contract: number
// }

interface UseNodeAgentDataResult {
  invitationData: any
  tradeData: any
  // dataOverview: any
  invitationChartData: any
  transactionChartData: any
  rebateChartData: any
  fetchInvitationData: () => Promise<void>
  fetchTradeData: (dataType: string, timeRange: string) => Promise<void>
  fetchDataOverView: (timeRange: string) => Promise<void>
  fetchInvitationRewardData: (page: number, pageSize: number) => Promise<any>
  fetchClaimReward: (rewardType: string, claimAddress: string) => Promise<any>
  fetchReferralReward: () => Promise<any>
}
export const useNodeAgentData = (
  options: UseNodeAgentDataOptions = {}
): UseNodeAgentDataResult => {
  const activeWallet = useSelector(_activeWallet)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [tradeData, setTradeData] = useState<any>(null)
  // const [dataOverview,setDataOverview] = useState<any>(null)
  const [invitationChartData,setInvitationChartData] = useState<any>(null)
  const [transactionChartData,setTransactionChartData] = useState<any>(null)
  const [rebateChartData,setRebateChartData] = useState<any>({})

  const dispatch = useDispatch()
  // 获取邀请奖励数据
  const fetchInvitationData = async () => {
    if (!activeWallet.isConnected) return
    try {
      const { data } = await agentDexClient.query({
        query: GET_AGENT_INVITATION_REWARD_DATA,
      })

      if (data?.userLevelInfo?.success) {
        setInvitationData(data.userLevelInfo.data)
        dispatch(setCurrentLevel(data.userLevelInfo.data))
      } else {
        toast.error(data?.userLevelInfo?.message || '获取邀请奖励数据失败')
      }
    } catch (err) {
      toast.error('获取邀请奖励数据失败')
    } finally {

    }
  }

  // 获取代理交易数据
  const fetchTradeData = async (dataType: string, timeRange: string) => {
    if (!activeWallet.isConnected) return
    try {
      const { data } = await agentDexClient.query({
        query: GET_AGENT_TRADE_DATA,
        variables: {
          input: {
            dataType,
            timeRange,
          },
        },
      })

      if (data?.transactionData?.success) {
        setTradeData(data.transactionData.transactionData)
      } else {
        toast.error(data?.transactionData?.message || '获取交易数据失败')
      }
    } catch (err) {
      toast.error('获取交易数据失败')
    } finally {
    }
  }

  // 自动请求
  useEffect(() => {
    if (options.autoFetchInvitation) {
      fetchInvitationData()
    }
    if (options.autoFetchTrade) {
      fetchTradeData(options.autoFetchTrade.dataType, options.autoFetchTrade.timeRange)
    }
    if (options.autoFetchDataOverView) {
        fetchDataOverView(options.autoFetchDataOverView.timeRange)
    }
  }, [activeWallet.isConnected])

//   获取数据总览
const fetchDataOverView = async ( timeRange: string) => {
    try {
      const [rebateResult, transactionResult, invitationResult] = await Promise.all([
        agentDexClient.query({
          query: GER_REBATE_AMOUNT_CHART,
          variables: { timeRange },
        }),
        agentDexClient.query({
          query: GER_TRANSACTION_VOLUME_CHART,
          variables: { timeRange },
        }),
        agentDexClient.query({
          query: GER_INVITATION_COUNT_CHART,
          variables: { timeRange },
        })
      ])
      // console.log(rebateResult,transactionResult,invitationResult,'rebateResult,transactionResult,invitationResult')

      // 处理返佣金额图表数据
      if (rebateResult.data?.rebateAmountChart?.success) {
        const rebateAmountData: any = rebateResult.data.rebateAmountChart;
        setRebateChartData(rebateAmountData)
      }

      // 处理交易量图表数据
      if (transactionResult.data?.transactionVolumeChart?.success) {
        const transactionVolumeData: any = transactionResult.data.transactionVolumeChart;
        setTransactionChartData(transactionVolumeData)
      }

      // 处理邀请数量图表数据
      if (invitationResult.data?.invitationCountChart?.success) {
        const invitationCountData: any = invitationResult.data.invitationCountChart;
        const list = invitationCountData.all.map((item: any) => ({
          ...item,
          all: item.value,
        }))
        const allData = {
          currentValues: invitationCountData.currentValues,
          data: list,
        }
        setInvitationChartData(allData)
      }
    } catch (err) {
      toast.error('获取失败')
    }
  }

  const fetchInvitationRewardData = async (page: number, pageSize: number) => {
    try {
      const { data } = await agentDexClient.query({
        query: GET_AGENT_INVITATION_REWARD,
        variables: {
          page,
          pageSize,
        },
      })
      if (data?.invitationRecords?.success) {
        return data.invitationRecords
      } else {
        toast.error(data?.invitationRecords?.message || '获取数据失败')
        return { success: false, data: [], total: 0 }
      }
    } catch (err) {
      console.error('获取邀请奖励数据失败:', err)
      toast.error('获取数据失败')
      return { success: false, data: [], total: 0 }
    }
  }
// 获取奖励数据
const fetchReferralReward = async () => {
  if (!activeWallet.isConnected) return
  try {
    const { data } = await agentDexClient.query({
      query: GET_CLAIM_AGENT_REFERRAL,
    })
    if(data?.getReferralReward) {
      dispatch(setClaimRewardData(data.getReferralReward))
      return data.getReferralReward
    }else{
      toast.error('get ReferralReward failed')
    }
  }
  catch (err) {
    toast.error('get ReferralReward failed')
  } finally {

  }
}
// 领取奖励
const fetchClaimReward = async (rewardType: string, claimAddress: string) => {
  try {
    const { data } = await agentDexClient.mutate({
      mutation: CLAIM_AGENT_REFERRAL,
      variables: {
        rewardType,
        claimAddress,
      },
    })
    if(data?.claimAgentReferral?.success) {
      return data.claimAgentReferral
    }else{
      toast.error(data?.claimAgentReferral?.message || "claimAgentReferral failed")
    
    }
  } 
  catch (err:any) {
    toast.error(err.message || '失败')
    return null
  } finally {

  }
}

  return {
    invitationData,
    tradeData,
    fetchInvitationData,
    fetchTradeData,
    fetchDataOverView,
    // dataOverview,
    invitationChartData,
    transactionChartData,
    rebateChartData,
    fetchInvitationRewardData,
    fetchClaimReward,
    fetchReferralReward
  }
}
type RangeType = 'TODAY' | 'LAST_30_DAYS' | 'LAST_60_DAYS' | 'ALL_TIME'
dayjs.extend(utc)
dayjs.extend(timezone)
interface DateRange {
  startDate: string
  endDate: string
}

export const useDateRange = ( type: RangeType, ): DateRange | null => {
  const  timezone = 'Asia/Shanghai'
  const  format = 'YYYY/MM/DD' 
  return useMemo(() => {
    const now = dayjs().tz(timezone)
    switch (type) {
      case 'TODAY':
        return {
          startDate: now.format(format),
          endDate: now.format(format),
        }
        
      case 'LAST_30_DAYS':
        return {
          startDate: now.subtract(30, 'day').format(format),
          endDate: now.format(format),
        }
        
      case 'LAST_60_DAYS':
        return {
          startDate: now.subtract(60, 'day').format(format),
          endDate: now.format(format),
        }
        
      case 'ALL_TIME':
        return null
      default:
        return null
    }
  }, [type])}