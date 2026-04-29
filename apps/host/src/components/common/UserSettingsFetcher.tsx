import { useAppDispatch } from '@/redux/store'
import { memo, useEffect } from 'react'
import { fetchUserSettings } from '@/redux/modules/userSettings.slice.ts'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { useTurnkey } from '@turnkey/sdk-react'
import eventBus from '@/lib/eventBus'
import { EVENT_MESSAGE_FORCE_LOGOUT } from '../error-wapper'
import { TurnkeyRequestError } from '@turnkey/http'

// Loop to check if the access token is set in ServiceConfig
const waitForAccessToken = () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (ServiceConfig.token) {
        clearInterval(interval)
        resolve(true)
      }
    }, 1000)
  })
}

export const CheckTurnKeySession = memo(() => {
  const { indexedDbClient } = useTurnkey()

  useEffect(() => {
    if (!indexedDbClient) return
    waitForAccessToken().then(() => {
      indexedDbClient.getWhoami().catch((error: TurnkeyRequestError) => {
        if (error.code === 16) {
          eventBus.dispatch(EVENT_MESSAGE_FORCE_LOGOUT, {
            data: {
              isForceLogout: true,
            },
          })
        }
      })
    })
  }, [indexedDbClient])

  return <></>
})

export const UserSettingsFetcher = memo(() => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    waitForAccessToken().then(() => {
      dispatch(fetchUserSettings())
    })
  }, [dispatch])
  return <></>
})
