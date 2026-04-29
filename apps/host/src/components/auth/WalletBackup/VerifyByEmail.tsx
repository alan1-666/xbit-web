import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { useAppDispatch } from '@/redux/store'
import { InitOtpAuthResponseDto } from '@/@generated/gql/graphql-user'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import clsx from 'clsx'
import { VefiryWalletInput } from './SecurityCheckModal'
import { LoaderCircle } from 'lucide-react'

const VerifyByEmail = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const { t } = useTranslation()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [emailInfo, setEmailInfo] = useState<InitOtpAuthResponseDto>()
  const [isInitOtp, setIsInitOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDisableResend, setIsDisableResend] = useState(false)
  const dispatch = useAppDispatch()

  const handleResendOtp = () => {
    handleSendOtp()
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

  useEffect(() => {
    console.log('otp', otp)
    if (otp && otp.length === 6 && emailInfo && !loading) {
      onVerifyUser({
        otpId: emailInfo?.otpId,
        otpCode: otp,
      })
    }
  }, [otp, emailInfo])

  const handleSendOtp = () => {
    setLoading(true)
    dispatch(newAuthActions.requestReverifyOtp({}))
      .then((res) => {
        if (res?.meta?.requestStatus === 'fulfilled') {
          const response = res?.payload?.requestReverifyOtp
          setEmailInfo(response)
        } else {
          const errorCode = res?.payload?.[0]?.code || 'OTP_RATE_LIMITED'
          setError(errorCode)
        }
        if (res?.meta?.requestStatus === 'rejected') {
          const errorCode = res?.payload?.[0]?.code
          setError(errorCode)
          if (errorCode === 'LOGIN_RATE_LIMITED') setIsDisableResend(true)
        }
      })
      .finally(() => {
        setIsInitOtp(true)
        setLoading(false)
      })
  }

  const onClickSendOtp = () => {
    handleSendOtp()
  }

  useEffect(() => {
    if (isInitOtp) {
      const firstInput = document.querySelector('[data-input-otp="true"]') as HTMLElement
      firstInput?.focus()
    }
  }, [isInitOtp])

  return (
    <div>
      {!isInitOtp ? (
        <div
          className="flex items-center justify-center rounded-[200px] gap-3 bg-[#ececed1f] py-2.5 cursor-pointer"
          onClick={onClickSendOtp}
        >
          {loading && <LoaderCircle className="w-4 h-4" />}
          <img src="/images/icons/icon_email.svg" className="w-4 h-4" alt="" />
          <p className="text-sm font-[380] leading-none text-white tracking-[0.38px]">
            {t('walletBackup.mnemonicPrompt.continueWithWallet', { wallet: 'Email' })}
          </p>
        </div>
      ) : (
        <>
          {!!emailInfo?.email && (
            <p className="text-sm leading-none text-white/70 mb-4">
              {t('login.codeSentTo')} {emailInfo?.email}
            </p>
          )}
          <InputOTP maxLength={6} value={otp} onChange={handleChange} className="w-full">
            <InputOTPGroup className="w-full flex justify-between gap-2 max-w-[300px]">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="w-10 h-12 border border-white/26 !rounded-[8px] text-center text-white text-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="flex justify-between items-center mt-1">
            {error && <p className="text-[14px] text-[#f23f58]">{t(`login.status.${error}`)}</p>}
            {isDisableResend ? (
              <p className="text-xs text-center py-3 ml-auto text-white/50 cursor-not-allowed">{t('login.resend')}</p>
            ) : (
              <CountdownTimer handleResendOtp={handleResendOtp} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default VerifyByEmail

const CountdownTimer = ({ handleResendOtp }: { handleResendOtp: any }) => {
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
      <button
        className={clsx(
          'py-3 text-xs text-center ml-auto',
          isResend && 'cursor-pointer text-impartal',
          !isResend && 'cursor-not-allowed text-white/50',
        )}
        // className="py-3 text-xs text-white/50 text-center ml-auto"
        disabled={!isResend}
        onClick={() => {
          if (!isResend) return
          handleResendOtp()
          setRemainingTime(60)
          setIsResend(false)
        }}
      >
        {t('login.resend')}
        {remainingTime > 0 && <span className="text-impartal ml-1.5">({remainingTime}s)</span>}
      </button>
    </>
  )
}
