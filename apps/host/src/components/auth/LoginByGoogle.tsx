import { CredentialResponse } from '@react-oauth/google'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAppDispatch } from '@/redux/store'
import { toast } from 'sonner'
import {
  ChainType,
  GetGoogleSubOrgInputDto,
  LoginGoogleDto,
  TurnkeyVersion,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import GoogleButton from '../common/GoogleButton'
import { ServiceConfig } from '@/lib/gql/service-config'
import { trackUserRegistered } from '@/services/google-analytics.service'

declare global {
  interface Window {
    google: any
  }
}

const LoginByGoogle = ({ nonce, publicKey, isAgree }: { nonce: string; publicKey: string; isAgree: boolean }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { indexedDbClient } = useTurnkey()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = useCallback(
    async (response: CredentialResponse) => {
      // console.log('response', response)
      const credential = response?.credential
      if (!credential) {
        return
      }

      if (!publicKey) {
        toast.error(t('status.loginFail'))
        return
      }

      const params: GetGoogleSubOrgInputDto = {
        idToken: credential!,
        targetPublicKey: publicKey,
      }
      setLoading(true)
      dispatch(newAuthActions.loginWithGoogle(params)).then(async (res) => {
        // console.log('[Res loginWithGoogle]: ', res)
        if (res?.meta?.requestStatus === 'fulfilled') {
          dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.GOOGLE))
          const response: LoginGoogleDto = res.payload.loginWithGoogleV2
          dispatch(
            newAuthActions.updateAccessToken({
              activeAccount: NEW_TYPE_ACCOUNT.GOOGLE,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              userId: response.userId,
              subOrgId: response?.subOrgId,
            }),
          )
          await indexedDbClient?.loginWithSession(response.turnKeyResponse.session)

          const listAccount = response?.userEmbeddedWallets
          const listAccountFilered = listAccount.filter((item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron)
          dispatch(
            newWalletActions.updateListWallets({
              type: NEW_TYPE_ACCOUNT.GOOGLE,
              list: listAccountFilered,
            }),
          )
          dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

          toast.success(t('status.loginSuccess'))
          ServiceConfig.token = response.accessToken

          dispatch(newWalletActions.getAccountInfo({}))
            .then(async (res) => {
              if (res.meta?.requestStatus === 'fulfilled') {
                // toast.success(t('status.loginSuccess'))
                dispatch(newWalletActions.updateEmail(res?.payload?.account?.email))
                if (res?.payload?.account?.isFirstLogin) {
                  trackUserRegistered(res?.payload?.account?.id || null)
                  dispatch(
                    newWalletActions.updateVerifyWallet({
                      oidcToken: credential,
                    }),
                  )
                }
                // await handleAgentAction({
                //   userId: res?.payload?.account?.id,
                // })

                // todo: remove after migration phrase
                if (res?.payload?.account?.turnkeyVersion === TurnkeyVersion.V1) {
                  const users = await indexedDbClient?.getUsers()
                  await indexedDbClient?.updateRootQuorum({
                    threshold: 1,
                    userIds: users?.users.map((u) => u.userId) ?? [],
                  })

                  dispatch(newAuthActions.migrateTurnkeyAccount({}))
                }
              }
            })
            .finally(() => {
              setLoading(false)
            })
        }

        if (res?.meta?.requestStatus === 'rejected') {
          toast.error(t('status.loginFail'))
          setLoading(false)
          indexedDbClient?.resetKeyPair()
        }
      })
    },
    [publicKey, dispatch, indexedDbClient],
  )

  return (
    <>
      {publicKey && (
        <GoogleButton className="rounded-[6px] bg-[#18181d] w-full mt-5 border-none" handleLoginSuccess={handleGoogleLogin} nonce={nonce} isAgree={isAgree} loading={loading} />
      )}
    </>
  )
}

export default LoginByGoogle
