import { agentDexClient } from '@/lib/gql/apollo-client'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { GET_USER_REFERRALSNAPSHOT } from '@/services/agent.dex.service'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

interface ReferralSnapshotData {
  referralSnapshot?: {
    user?: {
      invitationCode?: string
    }
  }
}

export const useUserReferralSnapshot = () => {
  const userId = useSelector(_userInfo)?.userId

  return useQuery<ReferralSnapshotData>({
    queryKey: ['user-referral-snapshot', userId],
    queryFn: async () => {
      const { data } = await agentDexClient.query({
        query: GET_USER_REFERRALSNAPSHOT,
        variables: {
          input: {
            empty: userId,
          },
        },
      })
      return data
    },
    enabled: !!userId,
    retry: 2,
  })
}
