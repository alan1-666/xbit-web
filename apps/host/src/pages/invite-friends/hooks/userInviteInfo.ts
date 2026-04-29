

import { useState, useEffect } from 'react'
import { GET_USER_INVITATION_LIST, GET_INVITATION_SUMMARY } from '@/services/agent.dex.service'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { toast } from 'sonner'
interface UseNodeAgentDataResult {
  isLoading: boolean
  // invitationListData: any
  fetchInvitationListData: (transactionType: string, page: number, pageSize: number) => Promise<any>
  invitationSummaryData: any
  // invitationListPagination: {
  //   total: number
  //   page: number
  //   pageSize: number
  //   hasNextPage: boolean
  // }
}

export const useUserInviteInfo = (): UseNodeAgentDataResult => {
  // const [invitationListData, setInvitationListData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  const [invitationSummaryData, setInvitationSummaryData] = useState<any>({})
  // const [invitationListPagination, setInvitationListPagination] = useState({
  //   total: 0,
  //   page: 1,
  //   pageSize: 20,
  //   hasNextPage: false,
  // })

  // 获取邀请奖励数据
  const fetchInvitationListData = async (transactionType: string, page: number, pageSize: number) => {
    setIsLoading(true)
    try {
      const { data } = await agentDexClient.query({
        query: GET_USER_INVITATION_LIST,
        variables: {
          transactionType,
          page,
          pageSize,
        },
      })

      if (data?.invitationList?.success) {
        return data.invitationList
      } else {
        toast.error(data?.invitationList?.message || '获取数据失败')
        return { success: false, data: [], total: 0 }
      }
    } catch (err) {
      console.error('获取邀请列表数据失败:', err)
      toast.error('获取失败')
      return { success: false, data: [], total: 0 }
    } finally {
      setIsLoading(false)
    }
  }
  const fetchInvitationSummaryData = async () => {
    try {
      const { data } = await agentDexClient.query({
        query: GET_INVITATION_SUMMARY,
      })
      if (data?.invitationSummary?.success) {
        setInvitationSummaryData(data.invitationSummary?.data)
      } else {
        toast.error(data?.invitationSummary?.message || '获取数据失败')
      }
    } catch (err) {
      toast.error('获取数据失败')
    } finally {

    }
  }

  // 自动请求
  useEffect(() => {
    fetchInvitationSummaryData()
    // 初始数据由组件内部获取，这里只获取汇总数据
  }, [])



  return {
    isLoading,
    // invitationListData,
    fetchInvitationListData,
    invitationSummaryData,
    // invitationListPagination,
  }
}
