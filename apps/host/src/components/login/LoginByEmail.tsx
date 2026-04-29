import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { useAppDispatch } from '@/redux/store'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  GetGoogleSubOrgInputDto,
  InitOtpAuthResponseDto,
  LoginGoogleDto,
  TurnkeyVersion,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { toast } from 'sonner'
import { useTurnkey } from '@turnkey/sdk-react'
import { Loader2 } from 'lucide-react'
import GoogleButton from '../common/GoogleButton'
import { CredentialResponse } from '@react-oauth/google'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { ServiceConfig } from '@/lib/gql/service-config'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { jwtDecode } from 'jwt-decode'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { trackUserRegistered } from '@/services/google-analytics.service'

type Props = {
  nonce: string
  publicKey: string | null
  onSubmit: (
    email: string,
    loginType: 'email' | 'google',
    emailOtp: InitOtpAuthResponseDto | LoginGoogleDto | undefined,
  ) => void
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LoginByEmail = ({ nonce, publicKey, onSubmit }: Props) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isValid, setIsValid] = useState(true)
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const { indexedDbClient } = useTurnkey()
  const navigate = useNavigate()

  const handleSendOtp = () => {
    if (email && isValid) {
      setLoading(true)
      dispatch(newAuthActions.initEmailOtp({ email: email })).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const responseInitEmailOtp: InitOtpAuthResponseDto = res?.payload?.initEmailOtp
          onSubmit(email, 'email', responseInitEmailOtp)
        }
        if (res?.meta?.requestStatus === 'rejected') {
          const errorCode = res?.payload?.[0]?.code || 'OTP_RATE_LIMITED'
          toast.error(t(`login.status.${errorCode}`))
        }
        setLoading(false)
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setEmail(value)
      setIsValid(emailRegex.test(value))
    } else {
      setIsValid(true)
    }
  }

  const handleGoogleLogin = useCallback(
    async (response: CredentialResponse) => {
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
        if (res?.meta?.requestStatus === 'fulfilled') {
          dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.GOOGLE))
          const response: LoginGoogleDto = res.payload.loginWithGoogleV2

          if (response.verifyBetaAccess) {
            const decoded = jwtDecode(credential)
            const email = decoded.email

            onSubmit(email, 'google', response)
          } else {
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
            const listAccountFilered = listAccount.filter(
              (item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron,
            )
            dispatch(
              newWalletActions.updateListWallets({
                type: NEW_TYPE_ACCOUNT.GOOGLE,
                list: listAccountFilered,
              }),
            )
            dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

            // toast.success(t('status.loginSuccess'))
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

                  navigate(getFuturesTradePath())
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
        }
      })
    },
    [publicKey, dispatch, indexedDbClient],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[#908E9A] text-[14px] font-[330] leading-[150%] ">{t('login.generateMPCWallet')}</div>

      <div
        className="self-stretch h-14 px-4 py-1 bg-gray-500/25 rounded-[10px] outline outline-[0.50px] outline-offset-[-0.50px] inline-flex justify-center items-center gap-2.5"
        onClick={() => {
          if (inputRef?.current) {
            inputRef?.current?.focus()
          }
        }}
      >
        <div className="w-5 h-6 relative overflow-hidden">
          <img src="/images/login/email.svg" className="w-5 h-6" />
        </div>
        <div className="flex-1 flex justify-start items-center">
          <input
            className="text-sm "
            placeholder="your@email.com "
            ref={inputRef}
            inputMode="email"
            onChange={handleChange}
          />
        </div>
        <Button
          className="bg-transparent shadow-none p-0 text-[#FFFFFF] text-base "
          onClick={handleSendOtp}
          disabled={!isValid || !email || loading}
          isLoading={loading}
        >
          {t('login.submit')}
        </Button>
      </div>

      {!isValid && <p className="text-[#FF0064] text-xs mt-3 ">{t('login.validEmail')}</p>}

      <div className="self-stretch inline-flex justify-start items-center gap-2">
        <div className="flex-1 border-t border-dashed border-t-[#79778C29]"></div>
        <div className="justify-center text-sm leading-4 ">{t('login.or')}</div>
        <div className="flex-1 border-t border-dashed border-t-[#79778C29]"></div>
      </div>

      {publicKey ? (
        <GoogleButton
          handleLoginSuccess={handleGoogleLogin}
          nonce={nonce}
          isAgree={true}
          className={`w-full flex h-14 px-3.5 py-3 bg-gray-500/25 rounded-[10px] inline-flex justify-center items-center gap-3`}
        />
      ) : (
        <Loader2 className="animate-spin w-5 h-5 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
      )}
    </div>
  )
}

export default LoginByEmail
