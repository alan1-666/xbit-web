import { BaseBottomDrawer, BaseBottomDrawerProps } from './BaseBottomDrawer'
import { Button } from '@components/ui/button.tsx'
import { Trans, useTranslation } from 'react-i18next'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp.tsx'
import { useMemo, useState } from 'react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useMutation } from '@apollo/client'
import { disable2FA } from '@services/google.service.ts'
import { userGqlClient } from '@/lib/gql/apollo-client.ts'

const Title = () => {
  return (
    <div className="size-11 p-2.5 bg-[#EC46991A] rounded-full">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V14" stroke="#FF353C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M11.9994 21.4103H5.93944C2.46944 21.4103 1.01944 18.9303 2.69944 15.9003L5.81944 10.2803L8.75944 5.00027C10.5394 1.79027 13.4594 1.79027 15.2394 5.00027L18.1794 10.2903L21.2994 15.9103C22.9794 18.9403 21.5194 21.4203 18.0594 21.4203H11.9994V21.4103Z"
          stroke="#FF353C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11.9941 17H12.0031" stroke="#FF353C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export interface ConfirmUnbindGoogleAuthDrawerProps extends BaseBottomDrawerProps {
  onConfirm: () => void
}

export const ConfirmUnbindGoogleAuthDrawer = (props: ConfirmUnbindGoogleAuthDrawerProps) => {
  const { ref, onConfirm } = props
  const { t } = useTranslation()
  const [otp, setOtp] = useState<string>('')
  const [mutation, { loading, error }] = useMutation(disable2FA, {
    client: userGqlClient,
  })

  const handleClose = () => {
    ref?.current?.close()
  }

  const handleConfirm = () => {
    mutation({ variables: { code: otp } }).then(() => {
      onConfirm()
      ref?.current?.close()
    })
  }

  const isValid = useMemo(() => {
    return otp.length === 6 && new RegExp(REGEXP_ONLY_DIGITS).test(otp)
  }, [otp])

  return (
    <BaseBottomDrawer title={<Title />} {...props}>
      <div className="text-[calc(15rem/16)] leading-[calc(15rem/16)] text-[#FFFFFFB2]">
        <Trans
          i18nKey="appSettings.googleAuth.warningMessage"
          components={{ span: <span className="text-[#FF353C]" /> }}
        />
      </div>
      <div className="mt-4">
        <div className="text-[calc(12rem/16)]">{t('google.auth.pincode.description')}</div>
        <div className="w-full flex items-center justify-center py-2">
          <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={otp} onChange={setOtp}>
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot
                  index={i}
                  className="bg-transparent border border-gray-600 w-12 h-14 !rounded-[8px]  text-center text-xl  focus:ring-0 focus:outline-none"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        {error && (error as any)[0]?.code === 'INVALID_OTP_CODE' && (
          <div className="text-red-500 text-[calc(12rem/16)]">{t('google.auth.warning.verifycode')}</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4 pb-3 border-t mt-4">
        <Button variant="borderGradient" className="rounded-full" onClick={handleClose}>
          {t('appSettings.googleAuth.cancel')}
        </Button>
        <Button
          variant="gradient"
          className="rounded-full text-[#141414]"
          onClick={handleConfirm}
          disabled={!isValid}
          isLoading={loading}
        >
          {t('appSettings.googleAuth.confirmUnlink')}
        </Button>
      </div>
    </BaseBottomDrawer>
  )
}
