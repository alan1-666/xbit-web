import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTurnkey } from '@turnkey/sdk-react'
import { toast } from 'sonner'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { useAppDispatch } from '@/redux/store'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import {
  ChainType,
  InitOtpAuthResponseDto,
  LoginEmailOtpDto,
  LoginWithEmailOtpInputDto,
  TurnkeyVersion,
  UserEmbeddedWalletDto,
} from '@/@generated/gql/graphql-user'
import { ServiceConfig } from '@/lib/gql/service-config'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import LoginByGoogle from './LoginByGoogle'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import { trackUserRegistered } from '@/services/google-analytics.service'

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LoginByEmail = ({
  isAgree,
  type,
  publicKey,
  nonce,
}: {
  isAgree: boolean
  type?: 'mobile' | 'pc'
  publicKey: string | null
  nonce: string
}) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [initEmail, setInitEmail] = useState<InitOtpAuthResponseDto>()
  const [isValid, setIsValid] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useAppDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value) {
      setIsValid(emailRegex.test(value))
    } else {
      setIsValid(true)
    }
  }

  const handleSendOtp = () => {
    if (!isAgree) {
      toast.error(t('toast.termsAgreement'))
      return
    }
    if (email && isValid) {
      setLoading(true)
      dispatch(newAuthActions.initEmailOtp({ email: email })).then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const responseInitEmailOtp: InitOtpAuthResponseDto = res?.payload?.initEmailOtp
          setInitEmail(responseInitEmailOtp)
          setShowOtpForm(true)
        }
        if (res?.meta?.requestStatus === 'rejected') {
          const errorCode = res?.payload?.[0]?.code || 'OTP_RATE_LIMITED'
          toast.error(t(`login.status.${errorCode}`))
        }
        setLoading(false)
      })
    }
  }
  const handleEnterSendOtp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isValid || !email || loading) return
      handleSendOtp()
    }
  }

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setIsValid(emailRegex.test(value))
    }
  }

  return (
    <div className="pt-6">
      {!showOtpForm && (
        <>
          <p className="text-[24px] font-semibold leading-none">{t('login.emailLogin')}</p>
          <p className="mt-8 text-[#908e98] text-[13px]">{t('login.toGenerate')}</p>
          <div
            className="self-stretch h-13 px-3 py-4 mt-3 bg-[#18181d] rounded-[10px] flex items-center gap-2.5"
            onClick={() => {
              if (inputRef?.current) {
                inputRef?.current?.focus()
              }
            }}
          >
            <div className="w-5 h-6 relative overflow-hidden">
              <img src="/images/login/email.svg" className="w-5 h-6" />
            </div>
            <input
              ref={inputRef}
              placeholder={t('login.enterYourEmail')}
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full placeholder:text-white/50"
              onKeyDown={(e) => handleEnterSendOtp(e)}
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
          {!isValid && <p className="text-[#F23F58] text-xs mt-3">{t('login.validEmail')}</p>}
          <Button
            className="bg-[#843bea] shadow-inner-purple rounded-[200px] w-full h-11 mt-4 text-[#FFFFFF] text-base"
            onClick={handleSendOtp}
            disabled={!isValid || !email || loading}
            isLoading={loading}
          >
            {t('login.confirm')}
          </Button>
          <div className="mt-5 w-full self-stretch inline-flex justify-start items-center gap-2">
            <div className="flex-1 border-t border-dashed border-t-[#79778C29]"></div>
            <div className="justify-center text-sm leading-4 ">{t('login.or')}</div>
            <div className="flex-1 border-t border-dashed border-t-[#79778C29]"></div>
          </div>
          {publicKey ? (
            <LoginByGoogle publicKey={publicKey} nonce={nonce} isAgree={isAgree} />
          ) : (
            <Loader2 className="animate-spin w-5 h-5 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
          )}
        </>
      )}
      {showOtpForm && (
        <VerifyOtp
          email={email}
          open={showOtpForm}
          emailOtp={initEmail}
          setOpen={setShowOtpForm}
          publicKey={publicKey}
        />
      )}
    </div>
  )
}

export default LoginByEmail

const VerifyOtp = ({
  email,
  open,
  setOpen,
  emailOtp,
  publicKey,
}: {
  email: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  emailOtp: InitOtpAuthResponseDto | undefined
  publicKey: string | null
}) => {
  const { t } = useTranslation()
  const [initEmail, setInitEmail] = useState<InitOtpAuthResponseDto>(emailOtp as InitOtpAuthResponseDto)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDisableResend, setIsDisableResend] = useState(false)
  const dispatch = useAppDispatch()
  const { indexedDbClient } = useTurnkey()

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

  useEffect(() => {
    if (otp && otp.length === 6) {
      handleVerifyOtp(otp)
    } else {
      setError(null)
    }
  }, [otp])

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
          const listAccountFilered = listAccount.filter((item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron)
          dispatch(
            newWalletActions.updateListWallets({
              type: NEW_TYPE_ACCOUNT.GOOGLE,
              list: listAccountFilered,
            }),
          )
          dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

          toast.success(t('status.loginSuccess'))
          ServiceConfig.token = response.accessToken || ''

          dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
            if (res.meta?.requestStatus === 'fulfilled') {
              // toast.success(t('status.loginSuccess'))
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
            setOpen(false)
          })
          setError(null)
        }
        if (res?.meta?.requestStatus === 'rejected') {
          const errorCode = res?.payload?.[0]?.code
          setError(errorCode)
          if (errorCode === 'LOGIN_RATE_LIMITED') setIsDisableResend(true)
        }
      })
      .finally(() => setLoading(false))
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

  return (
    <div>
      <p className="text-[24px] font-semibold leading-none">{t('login.verifyCode')}</p>
      <p className="mt-8 text-[#908e98] text-[13px]">
        {' '}
        {t('login.codeSentTo')} {email}
      </p>
      <InputOTP maxLength={6} value={otp} onChange={handleChange} className="w-full">
        <InputOTPGroup className="mt-3 w-full flex justify-between gap-3 max-w-87.5 mx-auto">
          {[...Array(6)].map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                'w-12 h-13 border border-white/26 rounded-xl! text-center text-white text-lg',
                error && 'border-red-500 ring-red-500/20 z-10',
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <div>
        {loading && (
          <div className="w-full flex flex-col items-center mt-3">
            <Loader2 className="animate-spin w-5 h-5" />
          </div>
        )}
        {error && <p className="text-sm text-[#f23f58] mt-3">{t(`login.status.${error}`)}</p>}
        <CountdownTimer handleResendOtp={handleSendOtp} isDisableResend={isDisableResend} />
      </div>
      <div className="flex flex-col items-center gap-3 text-center text-xs leading-none text-white/50 my-4 mt-10">
        <p className="flex items-center justify-center">
          <span className="mr-1.25">{t('login.protecedBy')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path
              d="M2.434 4.38281C2.52416 4.19577 2.79097 4.19592 2.88127 4.38281L5.17228 9.14453C5.25137 9.30918 5.13135 9.49999 4.94865 9.5H0.367595C0.184836 9.5 0.0647261 9.30922 0.143962 9.14453L2.434 4.38281ZM2.65763 0.197266C3.68514 0.197266 4.51896 1.03109 4.51896 2.05859C4.51872 3.08589 3.68499 3.91895 2.65763 3.91895C1.63048 3.91871 0.797528 3.08575 0.797283 2.05859C0.797283 1.03123 1.63033 0.197501 2.65763 0.197266Z"
              fill="#9B9B9B"
            />
          </svg>
          <span className="ml-0.5">Turnkey</span>
        </p>
        <p>{t('login.mpcDescrption')}</p>
      </div>
    </div>
  )
}

export const CountdownTimer = ({
  handleResendOtp,
  isDisableResend,
}: {
  handleResendOtp: () => void
  isDisableResend: boolean
}) => {
  const { t } = useTranslation()
  const [remainingTime, setRemainingTime] = useState(60) // Convert ms to seconds
  const [isResend, setIsResend] = useState(false)

  useEffect(() => {
    if (remainingTime <= 0) {
      setIsResend(true)
      return
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [remainingTime])

  return (
    <>
      <Button
        className="bg-[#843bea] shadow-inner-purple rounded-[200px] w-full h-11 mt-10 text-[#FFFFFF] text-base"
        onClick={() => {
          if (!isResend) return
          handleResendOtp()
          setRemainingTime(60)
          setIsResend(false)
        }}
        disabled={!isResend || isDisableResend}
      >
        {t('login.resend')}
        {remainingTime > 0 && <span>{remainingTime}s</span>}
      </Button>
    </>
  )
}

// const DrawerOtp = ({
//   email,
//   open,
//   setOpen,
//   emailOtp,
//   publicKey,
// }: {
//   email: string
//   open: boolean
//   setOpen: Dispatch<SetStateAction<boolean>>
//   emailOtp: InitOtpAuthResponseDto | undefined
//   publicKey: string | null
// }) => {
//   const { t } = useTranslation()

//   return (
//     <>
//       <AppDrawer
//         open={open}
//         setOpen={setOpen}
//         title={t('login.verifyCode')}
//         drawerContent={<DrawerOtpContent email={email} emailOtp={emailOtp} setOpen={setOpen} publicKey={publicKey} />}
//         drawerClassName="bg-[#232329]"
//         drawerHeaderClassName="py-[14px] pb-0"
//         repositionInputs={false}
//         isShowBgImg={false}
//       />
//     </>
//   )
// }
// // Dialog for pc UI
// const DialogOtp = ({
//   email,
//   open,
//   setOpen,
//   emailOtp,
//   publicKey,
// }: {
//   email: string
//   open: boolean
//   setOpen: Dispatch<SetStateAction<boolean>>
//   emailOtp: InitOtpAuthResponseDto | undefined
//   publicKey: string | null
// }) => {
//   const { t } = useTranslation()
//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogTrigger asChild></DialogTrigger>
//         <DialogContent className="w-[768px] bg-[#232329] rounded-2xl p-3" showDialogPrimitiveClose={false}>
//           <DrawerOtpContent email={email} emailOtp={emailOtp} setOpen={setOpen} publicKey={publicKey} />
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// const DrawerOtpContent = ({
//   email,
//   emailOtp,
//   setOpen,
//   publicKey,
// }: {
//   email: string
//   emailOtp: InitOtpAuthResponseDto | undefined
//   setOpen: Dispatch<SetStateAction<boolean>>
//   publicKey: string | null
// }) => {
//   const { t } = useTranslation()
//   const [initEmail, setInitEmail] = useState<InitOtpAuthResponseDto>(emailOtp as InitOtpAuthResponseDto)
//   const [otp, setOtp] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [isDisableResend, setIsDisableResend] = useState(false)
//   // const [error, setError] = useState<string | null>('OTP_VERIFICATION_FAILED')

//   const dispatch = useAppDispatch()
//   const { indexedDbClient } = useTurnkey()

//   const handleResendOtp = () => {
//     handleSendOtp()
//   }

//   const handleVerifyOtp = async (otp: string) => {
//     // console.log('OTP entered:', otp)
//     // Get current public key from IndexedDB
//     if (!publicKey) {
//       toast.error(t('status.loginFail'))
//       return
//     }
//     setLoading(true)
//     const params: LoginWithEmailOtpInputDto = {
//       email: email,
//       otpCode: otp,
//       otpId: initEmail?.otpId as string,
//       targetPublicKey: publicKey,
//     }
//     dispatch(newAuthActions.loginWithEmailOtp(params))
//       .then(async (res) => {
//         if (res?.meta?.requestStatus === 'fulfilled') {
//           dispatch(newWalletActions.setActiveAccount(NEW_TYPE_ACCOUNT.EMAIL))
//           const response: LoginEmailOtpDto = res?.payload?.loginWithEmailOtpV2
//           // console.log('[loginWithEmailOtp]', response)
//           // ServiceConfig.token = response.accessToken
//           dispatch(
//             newAuthActions.updateAccessToken({
//               activeAccount: NEW_TYPE_ACCOUNT.EMAIL,
//               accessToken: response.accessToken,
//               refreshToken: response.refreshToken,
//               userId: response?.userId,
//               subOrgId: response?.subOrgId,
//             }),
//           )
//           dispatch(newWalletActions.updateEmail(email))
//           await indexedDbClient?.loginWithSession(response.turnKeyResponse.session)

//           const listAccount = response?.userEmbeddedWallets
//           const listAccountFilered = listAccount.filter((item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron)
//           dispatch(
//             newWalletActions.updateListWallets({
//               type: NEW_TYPE_ACCOUNT.GOOGLE,
//               list: listAccountFilered,
//             }),
//           )
//           dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

//           toast.success(t('status.loginSuccess'))
//           ServiceConfig.token = response.accessToken

//           dispatch(newWalletActions.getAccountInfo({})).then(async (res) => {
//             if (res.meta?.requestStatus === 'fulfilled') {
//               // toast.success(t('status.loginSuccess'))
//               if (res?.payload?.account?.isFirstLogin) {
//                 dispatch(
//                   newWalletActions.updateVerifyWallet({
//                     otpId: initEmail?.otpId as string,
//                     otpCode: otp,
//                   }),
//                 )
//               }
//               // await handleAgentAction({
//               //   userId: response?.userId,
//               // })

//               // todo: remove after migration phrase
//               if (res?.payload?.account?.turnkeyVersion === TurnkeyVersion.V1) {
//                 const users = await indexedDbClient?.getUsers()

//                 await indexedDbClient?.updateRootQuorum({
//                   threshold: 1,
//                   userIds: users?.users.map((u) => u.userId) ?? [],
//                 })

//                 dispatch(newAuthActions.migrateTurnkeyAccount({}))
//               }
//             }
//             setOpen(false)
//           })
//           setError(null)
//         }
//         if (res?.meta?.requestStatus === 'rejected') {
//           const errorCode = res?.payload?.[0]?.code
//           setError(errorCode)
//           if (errorCode === 'LOGIN_RATE_LIMITED') setIsDisableResend(true)
//         }
//       })
//       .finally(() => setLoading(false))
//   }

//   const handleChange = (val: string) => {
//     if (val.length < otp.length) {
//       setOtp(val)
//       return
//     }

//     if (otp.length < 6) {
//       setOtp(val)
//       return
//     }
//   }

//   useEffect(() => {
//     if (otp && otp.length === 6) {
//       handleVerifyOtp(otp)
//     } else {
//       setError(null)
//     }
//   }, [otp])

//   const handleSendOtp = () => {
//     if (email) {
//       dispatch(newAuthActions.initEmailOtp({ email: email })).then((res) => {
//         if (res?.meta?.requestStatus === 'fulfilled') {
//           const responseInitEmailOtp: InitOtpAuthResponseDto = res?.payload?.initEmailOtp
//           setInitEmail(responseInitEmailOtp)
//           toast.success(t('login.resendSuccess'))
//         }
//         if (res?.meta?.requestStatus === 'rejected') {
//           toast.error(t('status.loginFail'))
//         }
//       })
//     }
//   }

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const firstInput = document.querySelector('[data-input-otp="true"]') as HTMLElement
//       firstInput?.focus()
//     }, 100)

//     return () => clearTimeout(timeout)
//   }, [])

//   return (
//     <div className="mt-4">
//       <p className="text-sm leading-none text-white/70 mb-6">
//         {t('login.codeSentTo')} {email}
//       </p>
//       <InputOTP maxLength={6} value={otp} onChange={handleChange} className="w-full">
//         <InputOTPGroup className="w-full flex justify-between gap-3 max-w-[350px] mx-auto">
//           {[...Array(6)].map((_, index) => (
//             <InputOTPSlot
//               key={index}
//               index={index}
//               className="w-[48px] h-12 border border-white/26 !rounded-[12px] text-center text-white text-lg"
//             />
//           ))}
//         </InputOTPGroup>
//       </InputOTP>
//       <div className="flex justify-between items-center relative">
//         {loading && (
//           <>
//             <div></div>
//             <Loader2 className="animate-spin w-5 h-5 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
//           </>
//         )}
//         {error && <p className="text-sm text-[#f23f58]">{t(`login.status.${error}`)}</p>}
//         {isDisableResend ? (
//           <p className="text-xs text-center py-3 ml-auto text-white/50 cursor-not-allowed">{t('login.resend')}</p>
//         ) : (
//           <CountdownTimer handleResendOtp={handleResendOtp} />
//         )}
//       </div>
//       <div className="flex flex-col items-center gap-3 text-center text-xs leading-none text-white/50 my-4">
//         <p className="flex items-center justify-center">
//           <span className="mr-[5px]">{t('login.protecedBy')}</span>
//           <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" viewBox="0 0 6 10" fill="none">
//             <path
//               d="M2.434 4.38281C2.52416 4.19577 2.79097 4.19592 2.88127 4.38281L5.17228 9.14453C5.25137 9.30918 5.13135 9.49999 4.94865 9.5H0.367595C0.184836 9.5 0.0647261 9.30922 0.143962 9.14453L2.434 4.38281ZM2.65763 0.197266C3.68514 0.197266 4.51896 1.03109 4.51896 2.05859C4.51872 3.08589 3.68499 3.91895 2.65763 3.91895C1.63048 3.91871 0.797528 3.08575 0.797283 2.05859C0.797283 1.03123 1.63033 0.197501 2.65763 0.197266Z"
//               fill="#9B9B9B"
//             />
//           </svg>
//           <span className="ml-[2px]">Turnkey</span>
//         </p>
//         <p>{t('login.mpcDescrption')}</p>
//       </div>
//     </div>
//   )
// }
