import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTurnkey } from '@turnkey/sdk-react'
import { useAppDispatch } from '@/redux/store'
import { toast } from 'sonner'
import { GetGoogleSubOrgInputDto, LoginGoogleDto, TurnkeyVersion } from '@/@generated/gql/graphql-user'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import AppleSignin from 'react-apple-signin-auth'
import { Button } from '../ui/button'
import { trackUserRegistered } from '@/services/google-analytics.service'

declare global {
  interface Window {
    google: any
  }
}

const LoginByApple = ({ nonce, publicKey, isAgree }: { nonce: string; publicKey: string; isAgree: boolean }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { indexedDbClient } = useTurnkey()

  const handleAppleLogin = useCallback(
    async (response: any) => {
      if (!isAgree) {
        toast.error(t('toast.termsAgreement'))
        return
      }

      const credential = response?.authorization?.id_token
      if (!credential) {
        return
      }

      if (!publicKey) {
        toast.error(t('status.loginFail'))
        return
      }

      const params: GetGoogleSubOrgInputDto = {
        idToken: credential,
        targetPublicKey: publicKey,
      }
      dispatch(newAuthActions.loginWithApple(params)).then(async (res) => {
        // console.log('[Res loginWithGoogle]: ', res)
        if (res?.meta?.requestStatus === 'fulfilled') {
          dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.APPLE))
          const response: LoginGoogleDto = res.payload.loginWithApple
          dispatch(
            newAuthActions.updateAccessToken({
              activeAccount: NEW_TYPE_ACCOUNT.APPLE,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              userId: response.userId,
              subOrgId: response?.subOrgId,
            }),
          )
          await indexedDbClient?.loginWithSession(response.turnKeyResponse.session)
          dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
            if (res.meta?.requestStatus === 'fulfilled') {
              toast.success(t('status.loginSuccess'))
              if (res?.payload?.account?.isFirstLogin) {
                trackUserRegistered(res?.payload?.account?.id)
                dispatch(
                  newWalletActions.updateVerifyWallet({
                    oidcToken: credential,
                  }),
                )
              }
              // await handleAgentAction({
              //   userId: res?.payload?.account?.id
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
        }

        if (res?.meta?.requestStatus === 'rejected') {
          toast.error(t('status.loginFail'))
          indexedDbClient?.resetKeyPair()
        }
      })
    },
    [publicKey, dispatch, indexedDbClient],
  )

  return (
    <>
      {publicKey && (
        <AppleSignin
          authOptions={{
            clientId: import.meta.env.VITE_APPLE_OAUTH_CLIENT_ID,
            redirectURI: window.location.origin + `/auth/apple/callback`,
            scope: 'email name',
            nonce: nonce,
            usePopup: true,
          }}
          onSuccess={(response: any) => handleAppleLogin(response)}
          onError={(error: any) => console.error('Error:', error)}
          render={(props: any) => (
            <Button
              onClick={props.onClick}
              className="w-full flex items-center gap-3 h-10 mb-3 rounded-full bg-[#ECECED1F] border-[0.5px] border-[#ECECED1F] disabled:opacity-50"
            >
              <img src="/images/apple-logo.svg" alt="Google" className="w-5 h-5" />
              <span className="app-font-medium text-white">Sign in with Apple</span>
            </Button>
          )}
          uiType={'dark'}
        />
      )}
    </>
  )
}

export default LoginByApple
