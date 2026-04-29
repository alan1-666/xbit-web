import {
  AuthProvider,
  ChainType,
  InitOtpAuthResponseDto,
  LoginEmailOtpDto,
  LoginWithEmailOtpInputDto,
  TurnkeyVersion,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { ServiceConfig } from '@/lib/gql/service-config'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch } from '@/redux/store'
import { useTurnkey } from '@turnkey/sdk-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp'
import { CountdownTimer } from '../auth/LoginByEmail'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { Loader2 } from 'lucide-react'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'
import { trackUserRegistered } from '@/services/google-analytics.service'


type Props = {
  email: string
  emailOtp: InitOtpAuthResponseDto | undefined
  publicKey: string | null
  onSubmit: (email: string, loginInfo: any) => void
}

const VerifyOTP = ({ email, emailOtp, publicKey, onSubmit }: Props) => {
  const { t } = useTranslation()
  const [initEmail, setInitEmail] = useState<InitOtpAuthResponseDto>(emailOtp as InitOtpAuthResponseDto)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDisableResend, setIsDisableResend] = useState(false)

  const dispatch = useAppDispatch()
  const { indexedDbClient } = useTurnkey()
  const navigate = useNavigate()

  const handleVerifyOtp = async (otp: string) => {
    // Get current public key from IndexedDB
    if (!publicKey) {
      toast.error(t('status.loginFail'))
      return
    }
    setLoading(true)
    const params: LoginWithEmailOtpInputDto = {
      email: email,
      otpCode: otp,
      otpId: initEmail?.otpId as string,
      targetPublicKey: publicKey,
    }
    dispatch(newAuthActions.loginWithEmailOtp(params))
      .then(async (res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.EMAIL))
          const response: LoginEmailOtpDto = res?.payload?.loginWithEmailOtpV2

          if (response.verifyBetaAccess) {
            await indexedDbClient?.loginWithSession(response.turnKeyResponse.session)
            onSubmit(email, response)
          } else {
            dispatch(
              newAuthActions.updateAccessToken({
                activeAccount: NEW_TYPE_ACCOUNT.EMAIL,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                userId: response?.userId,
                subOrgId: response?.subOrgId,
              }),
            )
            dispatch(newWalletActions.updateEmail(email))
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

            ServiceConfig.token = response.accessToken

            dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
              if (res.meta?.requestStatus === 'fulfilled') {
                if (res?.payload?.account?.isFirstLogin) {
                  trackUserRegistered(res?.payload?.account?.id || null)
                  dispatch(
                    newWalletActions.updateVerifyWallet({
                      otpId: initEmail?.otpId as string,
                      otpCode: otp,
                    }),
                  )
                }
                // await handleAgentAction({
                //   userId: response?.userId,
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
              navigate(getFuturesTradePath())
            })
            setError(null)
          }
        }
        if (res?.meta?.requestStatus === 'rejected') {
          const errorCode = res?.payload?.[0]?.code
          setError(errorCode)
          if (errorCode === 'LOGIN_RATE_LIMITED') setIsDisableResend(true)
        }
      })
      .finally(() => setLoading(false))
  }

  const handleChange = (val: string) => {
    if (val.length < otp.length) {
      setOtp(val)
      return
    }

    if (otp.length < 6) {
      setOtp(val)
      return
    }
  }

  const handleSendOtp = () => {
    if (email) {
      dispatch(newAuthActions.initEmailOtp({ email: email })).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const responseInitEmailOtp: InitOtpAuthResponseDto = res?.payload?.initEmailOtp
          setInitEmail(responseInitEmailOtp)
          toast.success(t('login.resendSuccess'))
        }
        if (res?.meta?.requestStatus === 'rejected') {
          toast.error(t('status.loginFail'))
        }
      })
    }
  }

  useEffect(() => {
    if (otp && otp.length === 6) {
      handleVerifyOtp(otp)
    } else {
      setError(null)
    }
  }, [otp])

  const handleResendOtp = () => {
    handleSendOtp()
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="self-stretch justify-start">
        <span className="text-[13px] leading-5 text-[#908E9A]">
          {/* {t('login.checkEmail', {email: email})} */}
          {t('login.checkEmail.prefix')}
          <span className="text-white"> {email} </span>
          {t('login.checkEmail.suffix')}
        </span>
      </div>

      <InputOTP maxLength={6} value={otp} onChange={handleChange} className="w-full mx-1">
        <InputOTPGroup className="w-full flex justify-between gap-3 max-w-[350px] mx-auto">
          {[...Array(6)].map((_, index) => (
            <>
              <InputOTPSlot
                key={index}
                index={index}
                className="w-[48px] h-12 border border-white/26 !rounded-[12px] text-center text-white text-lg "
              />

              {index === 2 && <InputOTPSeparator type="dot" />}
            </>
          ))}
        </InputOTPGroup>
      </InputOTP>
      {loading && (
        <div className="flex justify-between items-center relative my-2">
          <div></div>
          <Loader2 className="animate-spin w-5 h-5 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
        </div>
      )}
      {error && <p className="text-sm text-[#FF0064] ">{t(`login.status.${error}`)}</p>}

      <div className="self-stretch pt-3 border-t border-t-[#79778C29] inline-flex justify-center items-center">
        <div className="w-96 text-center justify-start text-sm font-normal leading-5  text-[#CACACA]">
          {t('login.didntGetEmail')} &nbsp;
          <CountdownTimer handleResendOtp={handleResendOtp} />
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
