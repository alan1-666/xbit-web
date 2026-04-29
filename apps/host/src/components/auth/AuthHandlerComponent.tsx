// import useRefreshToken from '@/hooks/useRefreshToken'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { ServiceConfig } from '@/lib/gql/service-config'
import ls from '@/lib/local-storage'
import { _changeTokenAccount } from '@/redux/modules/auth.slice'
import { _userInfo, newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useTurnkey } from '@turnkey/sdk-react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { logoutWithTurnkey } from '@/services/auth.service'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { modal } from '@reown/appkit/react'

const AuthHandlerComponent = () => {
  // const { getRefreshTokenFunc } = useRefreshToken()
  const userInfo = useSelector(_userInfo)
  const dispatch = useAppDispatch()
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const { indexedDbClient } = useTurnkey()
  // ServiceConfig.token = userInfo?.access_token
  const solanaWallet = useSolanaWallet()
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyUserId)

  useEffect(() => {
    if (!!userInfo?.access_token) {
      ServiceConfig.token = userInfo?.access_token
      ServiceConfig.refreshToken = userInfo?.refresh_token
    }
  }, [userInfo?.access_token])

  useEffect(() => {
    const syncReduxAuth = (e: StorageEvent) => {
      if (e.key === 'persist:newAuth') {
        const root = JSON.parse(e.newValue || '{}')
        const authState = JSON.parse(root?.token || '{}')
        if (authState) {
          let token = ''
          let refreshToken = ''
          const hasValidAccessToken = Object.values(authState).some((method: any) => {
            if (method?.access_token && method.access_token !== '') {
              console.log('method', method)
              token = method.access_token
              refreshToken = method.refreshToken
              return true
            }
            return false
          })
          if (hasValidAccessToken && token) {
            const validKey = Object.keys(authState).find((key) => authState?.[key].access_token !== '')

            ServiceConfig.token = token
            ServiceConfig.refreshToken = refreshToken

            dispatch(newWalletActions.getAccountInfo({}))
            dispatch(newWalletActions.setActiveAccount(validKey))
            dispatch(newAuthActions.updateListTokens(authState))
          } else {
            dispatch(
              newAuthActions.logout({
                activeAccount: activeAccount,
              }),
            )
            dispatch(newWalletActions.logoutWallet({}))
            logoutWithTurnkey(indexedDbClient, turnkeyUserId).catch(() => {
              // indexedDbClient?.clear()
            })

            ls.remove('run-once-logined')
            if (activeAccount === NEW_TYPE_ACCOUNT.WALLET) {
              solanaWallet.disconnect()
            }
            modal?.disconnect()
          }
        }
      }
    }

    window.addEventListener('storage', syncReduxAuth)
    return () => window.removeEventListener('storage', syncReduxAuth)
  }, [])

  // const isTokenExpired = (token: string) => {
  //   if (!token) {
  //     return true
  //   }

  //   try {
  //     const decoded = jwtDecode(token)
  //     const currentTime = Date.now() / 1000
  //     return (decoded?.exp || 0) < currentTime
  //   } catch (error) {
  //     console.error('Error decoding token:', error)
  //     return true
  //   }
  // }

  // useEffect(() => {
  //   if (ServiceConfig.token) {
  //     const bool = isTokenExpired(ServiceConfig.token)
  //     if (bool) {
  //       getRefreshTokenFunc()
  //     }
  //   }
  // }, [ServiceConfig.token])

  return <></>
}

export default AuthHandlerComponent
