import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { ServiceConfig } from '@/lib/gql/service-config'
import { _getRefreshTokenActiveAccount } from '@/redux/modules/auth.slice'
import { _userInfo, newAuthActions } from '@/redux/modules/newAuth.slice'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { logoutWithTurnkey } from '@/services/auth.service'
import { useTurnkey } from '@turnkey/sdk-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDisconnect } from 'wagmi'
import { modal } from '@reown/appkit/react'

export default function useRefreshToken() {
  const dispatch = useAppDispatch()
  const activeWallet = useSelector(_activeWallet)
  const [flagCheckToken, setFlagCheckToken] = useState(false)
  const userInfo = useSelector(_userInfo)
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const { indexedDbClient } = useTurnkey()
  const { disconnect: disconnectEvm } = useDisconnect()
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyRootUserId)

  useEffect(() => {
    if (activeWallet?.walletAddress) {
      setFlagCheckToken(false)
    }
  }, [activeWallet])

  const onClickDisConnected = async () => {
    // reset turnkey client
    await indexedDbClient?.clear()
    await logoutWithTurnkey(indexedDbClient, turnkeyUserId)
    dispatch(
      newAuthActions.logout({
        activeAccount: activeAccount,
      }),
    )
    dispatch(newWalletActions.logoutWallet({}))
    modal?.disconnect()

    // await indexedDbClient?.resetKeyPair()
    if (activeAccount === NEW_TYPE_ACCOUNT.WALLET) {
      disconnectEvm()
    }
  }

  const getRefreshTokenFunc = () => {
    if (activeWallet?.isConnected) {
      if (!flagCheckToken) {
        dispatch(
          newAuthActions.getRefreshToken({
            refreshToken: userInfo?.refresh_token,
          }),
        )
          .then((res) => {
            // console.log('res', res, activeAccount)
            if (res?.meta?.requestStatus === 'fulfilled') {
              const accessToken = res?.payload?.getAccessToken?.accessToken
              // const refreshToken = res?.payload?.getAccessToken?.refreshToken
              ServiceConfig.token = accessToken
              dispatch(
                newAuthActions.updateAccessToken({
                  activeAccount: activeAccount,
                  accessToken: accessToken,
                  refreshToken: userInfo?.refresh_token,
                  userId: userInfo?.userId,
                  subOrgId: userInfo?.subOrgId,
                }),
              )
            }
            if (res?.meta?.requestStatus === 'rejected') {
              onClickDisConnected()
            }
          })
          .catch((res) => {
            if (res) onClickDisConnected()
          })
          .finally(() => {
            setFlagCheckToken(true)
          })
      }
    }
  }

  return { getRefreshTokenFunc }
}
