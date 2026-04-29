import { ServiceConfig } from '@/lib/gql/service-config'
import { getAccessTokenMutation } from '@/services/auth.service'
import { userGqlClient } from '@/lib/gql/apollo-client'

let isRefreshing = false
let pendingRequests: (() => void)[] = []

export async function refreshToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingRequests.push(() => resolve(ServiceConfig.token))
    })
  }

  isRefreshing = true

  try {
    const resp = await userGqlClient?.mutate<any>({
      mutation: getAccessTokenMutation,
      variables: {
        refreshToken: ServiceConfig.refreshToken,
      },
    })

    const newToken = resp?.data?.getAccessToken?.accessToken
    if (!newToken) throw new Error('No new token')
    ServiceConfig.token = newToken
    pendingRequests.forEach((cb) => cb())
    pendingRequests = []

    return newToken
  } catch (err) {
    console.error('RefreshToken GQL error:', err)
    return null
  } finally {
    isRefreshing = false
  }
}
