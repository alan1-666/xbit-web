import { useState } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { VerifyBetaAccessCode } from '@/services/auth.service'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { ChainType, LoginV2Dto, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useTranslation } from 'react-i18next'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { emailRegex } from '../auth/LoginByEmail'
import { getFuturesTradePath } from '@/components/futuresDetails/trade/tools.ts'

type Props = {
  loggedInWith: string
  loginInfo: LoginV2Dto
  // loginType: NEW_TYPE_ACCOUNT
}

const VerifyBetaCode = ({ loggedInWith, loginInfo }: Props) => {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [betaCode, setBetaCode] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false)
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount as NEW_TYPE_ACCOUNT)

  const handleChange = (val: string) => {
    const allowed = /^[A-Z0-9]{0,6}$/

    if (!allowed.test(val.toUpperCase())) return

    setShowError(false)
    setBetaCode(val.toUpperCase())
  }

  const handleVerifyBetaCode = async () => {
    try {
      const resp = await userGqlClient?.mutate<any>({
        mutation: VerifyBetaAccessCode,
        variables: {
          input: {
            verifyToken: loginInfo.verifyToken,
            code: betaCode,
          },
        },
      })

      const accessData = resp.data.verifyBetaAccessCode

      dispatch(
        newAuthActions.updateAccessToken({
          activeAccount: activeAccount,
          accessToken: accessData.accessToken,
          refreshToken: accessData.refreshToken,
          userId: accessData?.userId,
          subOrgId: accessData?.subOrgId,
        }),
      )
      
      if(emailRegex.test(loggedInWith)) {
        dispatch(newWalletActions.updateEmail(loggedInWith))
      }
      
      const listAccount = accessData.userEmbeddedWallets
      const listAccountFilered = listAccount.filter((item: UserEmbeddedWalletDto) => item?.chain !== ChainType.Tron)
      dispatch(
        newWalletActions.updateListWallets({
          type: activeAccount,
          list: listAccountFilered,
        }),
      )
      dispatch(newWalletActions.updateListWalletsByChain(listAccountFilered))

      ServiceConfig.token = accessData.accessToken
      setLoginSuccess(true)

      // await handleAgentAction({})

      setTimeout(() => {
        navigate(getFuturesTradePath())
      }, 500)
    } catch (error) {
      console.log('error: ', error)
      setShowError(true)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="self-stretch px-4 py-3 bg-gray-500/20 rounded-[10px] inline-flex flex-col justify-start items-start gap-3">
        <div className="justify-start text-xs  leading-3 text-[#908E9A]">{t('login.loggedInAs')}:</div>
        <div className="self-stretch text-base  text-[15px] leading-4 break-all text-white">{loggedInWith}</div>
      </div>

      <div className="self-stretch justify-center text-base  text-[15px] leading-5 text-white">
        {t('login.haveBetaCode')}
      </div>

      <div className="self-stretch justify-start text-xs  text-[12px] leading-4 text-[#A9A9B5]">
        {t('login.enterBetaCode')}
      </div>

      <InputOTP
        maxLength={6}
        value={betaCode}
        onChange={handleChange}
        className="w-full mx-1"
        inputMode="text"
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      >
        <InputOTPGroup className="w-full flex justify-between gap-2 max-w-[350px] mx-auto">
          {[...Array(6)].map((_, index) => (
            <>
              <InputOTPSlot
                key={index}
                index={index}
                className="w-[40px] h-12 border border-white/26 !rounded-[12px] text-center text-white text-lg uppercase"
              />

              {index === 2 && <InputOTPSeparator className="w-[40px]" type="dot" />}
            </>
          ))}
        </InputOTPGroup>
      </InputOTP>

      {showError && (
        <div className="text-left justify-start text-xs font-normal font-['Inter'] text-[13px] text-[#FF0064] leading-3">
          {t('login.invalidCode')}
        </div>
      )}

      {loginSuccess ? (
        <button
          className="self-stretch h-11 px-3.5 py-3 rounded-[200px] inline-flex justify-center items-center gap-3 bg-[#21E09D1A] border border-[#00CE89]"
          onClick={handleVerifyBetaCode}
        >
          <img src="/images/login/login-success.svg" className="w-4 h-4" />
          <div className="text-center justify-start text-sm  leading-4 tracking-tight">
            {t('login.betaCodeVerified')}
          </div>
        </button>
      ) : (
        <button
          className="self-stretch h-11 px-3.5 py-3 rounded-[200px] inline-flex justify-center items-center gap-3 bg-[#9B2CFC] hover:bg-[#8A00FF]"
          onClick={handleVerifyBetaCode}
        >
          <div className="text-center justify-start text-sm  leading-4 tracking-tight">{t('login.verify')}</div>
        </button>
      )}

      <div className="self-stretch pt-6 border-t inline-flex justify-between items-center">
        <div className="text-center justify-start text-sm  text-[14px] leading-5 text-[#CACACA]">
          {t('login.noBetaCode')}{' '}
        </div>
        <a
          className="h-9 px-3.5 py-3 rounded-lg flex justify-center items-center gap-3 bg-[#9B2CFC]  hover:bg-[#8A00FF]"
          href={loginInfo?.contactLink ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!loginInfo?.contactLink) {
              e.preventDefault()
            }
          }}
        >
          <div className="text-center justify-start text-xs  text-[12px] leading-3 tracking-tight">
            {t('login.getBetaCode')}
          </div>
        </a>
      </div>
    </div>
  )
}

export default VerifyBetaCode
