import { agentDexClient } from '@/lib/gql/apollo-client'
import { USER_BIND_INVITE } from '@/services/agent.dex.service'
import ls from '@/lib/local-storage'

export async function handleAgentAction(): Promise<string | null> {
  const code = ls.get('futures_inviteCode')
  if (!code) return null

  try {
   await agentDexClient.mutate({
      mutation: USER_BIND_INVITE,
      variables: {
        input: {
          invitationCode: code,
        },
      },
    })
    return 'success'
  } catch (err) {
    return 'fail'
  }
}
