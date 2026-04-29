import { useState, useEffect, useMemo } from 'react'
import { 
  GET_ACTIVITY_CASHBACK_DASHBOARD, 
  GET_TASK_CATEGORIES,
   GET_TASKS_BY_TYPE,
  COMPLETE_TASK,CLAIM_CASHBACK_REWARD, 
  CLAIM_REWARD,
  GET_CLAIM_RECORD,
  GET_TIER_BENEFITS
 } from '@/services/agent.dex.service'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setTaskCategories } from '@/redux/modules/agent.slice'
import { tConst } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'

interface UseTradeRewardsResult {
    userLevelInfo: any
    // taskCategories: any
    fetchUserTierInfo: () => Promise<void>
    fetchTaskCategories: () => Promise<void>
    fetchTasksByType: (taskType: string) => Promise<void>
    tasksList: any
    completeTask: (taskId: string) => Promise<void>
    fetchClaimRewardData?: () => Promise<void | any >
    claimReward: (claimAddress: string,type: string) => Promise<void>
    fetchClaimRecord: (page: number, pageSize: number,result: string,isCashback: boolean) => Promise<any>
    getTierBenefits: () => Promise<void>
  }

  // DAILY 每日任务
  // ONE_TIME 一次性任务
  // UNLIMITED 无限任务
  // PROGRESSIVE 渐进式任务
  // MANUAL_UPDATE 手动更新任务
  const taskTypeMap: Record<PointsTaskProps['taskType'], string> = {
    'DAILY':'Activityrewards.pointsTask.daily',
    "COMMUNITY": 'Activityrewards.pointsTask.community' ,
    "TRADING": 'Activityrewards.pointsTask.trade' ,
  } 
interface PointsTaskProps {
    taskType: 'DAILY' | 'COMMUNITY' | 'TRADING' 
  }
interface UseTradeRewardsOptions {
    autoFetchTasksByType?: string
}
export const useTradeRewards = (
    options: UseTradeRewardsOptions = {}
  ): UseTradeRewardsResult => {
  const dispatch = useDispatch()
  const activeWallet = useSelector(_activeWallet)
  const [userLevelInfo, setUserLevelInfo] = useState<any>({})
  const [tasksList, setTasksList] = useState<any>([])
  const { t } = useTranslation()

  const fetchUserTierInfo = async () => {
    if (!activeWallet.isConnected) return
    try {
      const { data } = await agentDexClient.query({
        query: GET_ACTIVITY_CASHBACK_DASHBOARD,
      })
      if (data?.activityCashbackDashboard?.success) {
        setUserLevelInfo(data.activityCashbackDashboard.data)
      }
    }
    catch (error) {
        toast.error('failed to get user level info')
    }
    finally {

    }
  }

//  任务类型
const fetchTaskCategories = async () => {
  if (!activeWallet.isConnected) return
    try {
        const { data } = await agentDexClient.query({
            query: GET_TASK_CATEGORIES,
        })
        if (data?.taskCategories?.length) {
        const tabs = data.taskCategories.map((item: any) => ({
            ...item,
            label: tConst(taskTypeMap[item.name as PointsTaskProps['taskType']]),
            value: item.name,
        }))
        dispatch(setTaskCategories(tabs) as any)
        // fetchTasksByType(tabs[0].name)
      }
    }
    catch (error) {
        toast.error('get failed')
    }
}
// 根据任务类型获取对应任务列表
const fetchTasksByType = async (categoryName: string) => {
   if (!activeWallet.isConnected) return
    try {
        const { data } = await agentDexClient.query({
            query: GET_TASKS_BY_TYPE,
            variables: {
                categoryName
            }
        })
        if (data?.userTaskListByCategory?.success) {
          setTasksList(data.userTaskListByCategory.data)
        }
    }
    catch (error) {
        toast.error('get failed')
    }
    finally {

    }
}

// 完成任务
const completeTask = async (taskId: string) => {
    try {
        const { data } = await agentDexClient.mutate({
            mutation: COMPLETE_TASK,
            variables: {
                taskId,
            }
        })
        if (data?.completeTask?.success) {
          toast.success(t('Activityrewards.pointsTask.completedSuccess'))
        }
    }
    catch (error: any) {
        toast.error(error.message)
    }
    finally {

    }
}
  // 获取奖励金额
  const fetchClaimRewardData = async () => {
    if (!activeWallet.isConnected) return
    try {
      const { data } = await agentDexClient.query({
        query: CLAIM_CASHBACK_REWARD,
      })   
      if (data?.getClaimReward) {
        return data.getClaimReward
      }
    } catch (err:any) {
      toast.error(err.message)
      return null
    }
  }

  // 领取奖励
  const claimReward = async (claimAddress: string,type: string) => {
    try {
      const { data } = await agentDexClient.mutate({
        mutation: CLAIM_REWARD,
        variables: {
          claimAddress,
          type
        }
      })
      if (data?.claimActivityCashback?.success) {
       return data.claimActivityCashback

      }
    } catch (err:any) {
      toast.error(err.message)
      return null
    }
  }

  // 领取记录
  const fetchClaimRecord = async (page: number, pageSize: number,result: string,isCashback: boolean) => {
    try {
      const { data } = await agentDexClient.query({
        query: GET_CLAIM_RECORD,
        variables: {
          page,
          pageSize,
          result,
          isCashback
        }
      })
      if (data?.rewardClaimHistory?.success) {
        return data.rewardClaimHistory
      }
    } catch (err:any) {
      toast.error(err.message)
      return null
    }
  }
 const getTierBenefits = async()=>{
    try {
      const { data } = await agentDexClient.query({
        query: GET_TIER_BENEFITS,
       
      })
      if (data?.tierBenefits?.success) {
        return data.tierBenefits
      }
    } catch (err:any) {
      toast.error(err.message)
      return null
    }
 }

  useEffect(() => {
    // fetchTaskCategories()
  }, [])
  return {
    fetchUserTierInfo,
    userLevelInfo,
    fetchTaskCategories,
    fetchTasksByType,
    tasksList,
    completeTask,
    fetchClaimRewardData,
    claimReward,
    fetchClaimRecord,
    getTierBenefits
  }
}