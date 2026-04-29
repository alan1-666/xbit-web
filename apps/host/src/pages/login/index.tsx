import LoadingSpinner from '@/components/ui/loading-spinner'
import { useTurnkey } from '@turnkey/sdk-react'
import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import LoginByEmail from '@/components/login/LoginByEmail'
import { InitOtpAuthResponseDto, LoginV2Dto } from '@/@generated/gql/graphql-user'
import VerifyOTP from '@/components/login/VerifyOTP'
import LoginByWallets from '@/components/login/LoginByWallets'
import { WalletConnectProvider } from '@/components/auth/Appkit/walletconnect'
import WalletLoginVerify from '@/components/login/WalletLoginVerify'
import VerifyBetaCode from '@/components/login/VerifyBetaCode'
import { NEW_TYPE_ACCOUNT } from '@/lib/blockchain'
import DialogLanguages from '../settings/dialog-languages'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import ls from '@/lib/local-storage'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { logoutWithTurnkey } from '@/services/auth.service'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { ParticleWave } from '@/components/login/background/particle-wave'
import { agentDexClient } from '@/lib/gql/apollo-client'
import { CHECK_INVITATION_CODE } from '@/services/agent.dex.service'
import { clsx } from 'clsx'
import { debounce } from 'lodash-es'
const INVITATION_CODE_KEY = 'futures_inviteCode'

type Option = 'none' | 'email' | 'emailInput' | 'verifyOtp' | 'wallet' | 'google' | 'verifyBetaCode'
export const EVENT_RESET_TURNKEY_KEY_PAIR = 'event_reset_turnkey_key_pair'

const LoginPage = () => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const location = useLocation()
  const { indexedDbClient } = useTurnkey()

  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string>('')

  const [email, setEmail] = useState<string>('')
  const [emailOtp, setEmailOtp] = useState<InitOtpAuthResponseDto>()
  const [address, setAddress] = useState<string>('')
  const [loggedInWith, setLoggedInWith] = useState<string>('')
  const [loginInfo, setLoginInfo] = useState<any>()
  const [loginType, setLoginType] = useState<NEW_TYPE_ACCOUNT>(NEW_TYPE_ACCOUNT.EMAIL)
  const [walletName, setWalletName] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<Option>('none')
  const [inviteCode, setInviteCode] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const turnkeyUserId = useAppSelector((state) => state.newWallet.turnkeyRootUserId)
  const activeAccount = useAppSelector((state) => state.newWallet.activeAccount)
  const dispatch = useAppDispatch()

  const channelRef = useRef<BroadcastChannel | null>(null)

  useLayoutEffect(() => {
    const cleanSession = async () => {
      if (turnkeyUserId) {
        await logoutWithTurnkey(indexedDbClient, turnkeyUserId)
      }

      indexedDbClient?.resetKeyPair().then(() => {
        indexedDbClient?.getPublicKey().then((publicKey: string | null) => {
          // sync multiple tabs
          if (channelRef.current) {
            channelRef.current.postMessage({ publicKey })
          }
          setPublicKey(publicKey)
          setNonce(bytesToHex(sha256(publicKey ?? '')))
        })
      })

      dispatch(
        newAuthActions.logout({
          activeAccount: activeAccount,
        }),
      )
      dispatch(newWalletActions.logoutWallet({}))
    }

    if (!indexedDbClient) {
      return
    }

    cleanSession()
    indexedDbClient.config.activityPoller = {
      intervalMs: 0,
      numRetries: 0,
    }
  }, [indexedDbClient])

  useEffect(() => {
    const invitationCode = location.search.substring(1)?.slice(0, 15).toUpperCase()
    if (invitationCode) {
      setInviteCode(invitationCode)
      checkInvitationCode(invitationCode)
      ls.set(INVITATION_CODE_KEY, invitationCode)
    } else {
      setInviteCode('')
      ls.set(INVITATION_CODE_KEY, '')
    }

    const channel = new BroadcastChannel(EVENT_RESET_TURNKEY_KEY_PAIR)
    channelRef.current = channel

    const handler = (msg: MessageEvent) => {
      setPublicKey(msg.data?.publicKey as string)
    }

    channel.onmessage = handler

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [])

  const renderOptionContent = () => {
    switch (selectedOption) {
      case 'email':
        return <LoginByEmail publicKey={publicKey} nonce={nonce} onSubmit={handleEmailLogin} />
      case 'verifyOtp':
        return <VerifyOTP email={email} emailOtp={emailOtp} publicKey={publicKey} onSubmit={handleVerifyOTP} />
      case 'wallet':
        return (
          <WalletLoginVerify
            address={address}
            publicKey={publicKey}
            onSubmit={handleWalletVerify}
            walletName={walletName}
          />
        )
      case 'verifyBetaCode':
        return <VerifyBetaCode loggedInWith={loggedInWith} loginInfo={loginInfo} />
      default:
        return null
    }
  }

  const handleLoginWithEmail = () => {
    setSelectedOption('email')
  }

  const handleEmailLogin = (email: string, loginType: 'email' | 'google', responseDto: any) => {
    if (loginType === 'email') {
      setEmailOtp(responseDto)
      setSelectedOption('verifyOtp')
      setEmail(email)
    } else {
      setLoggedInWith(email)
      setLoginType(NEW_TYPE_ACCOUNT.GOOGLE)
      setLoginInfo(responseDto)
      setSelectedOption('verifyBetaCode')
    }
  }

  const handleVerifyOTP = (email: string, loginInfo: any) => {
    setLoginInfo(loginInfo)
    setLoggedInWith(email)
    setLoginType(NEW_TYPE_ACCOUNT.EMAIL)
    setSelectedOption('verifyBetaCode')
  }

  const handleLoginWithWallet = (address: string, walletName: string) => {
    setAddress(address)
    setWalletName(walletName)
    setSelectedOption('wallet')
  }

  const handleWalletVerify = (address: string, loginInfo: LoginV2Dto) => {
    setLoginInfo(loginInfo)
    setLoggedInWith(address)
    setLoginType(NEW_TYPE_ACCOUNT.WALLET)
    setSelectedOption('verifyBetaCode')
  }

  const checkInvitationCode = async (code: string) => {
    if (!code) {
      setError('')
      setIsValidating(false)
      return
    }
    try {
      setIsValidating(true)
      const result = await agentDexClient.query({
        query: CHECK_INVITATION_CODE,
        variables: {
          invitationCode: code,
        },
      })
      const exists = result.data.checkInvitationCode.exists
      if (!exists) {
        setError(t('referral.error.INVITATION_CODE_NOT_FOUND'))
        return
      } else {
        setError('')
      }
    } catch (err) {
      setError(t('referral.error.ERR_NETWORK'))
      return
    } finally {
      setIsValidating(false)
    }
  }
  const debouncedCheckInvitationCode = useCallback(debounce(checkInvitationCode, 500), [])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!/^[0-9a-zA-Z_]*$/.test(e.target.value)) {
      return
    }
    setIsValidating(true)
    const value = e.target.value?.trim().toUpperCase().slice(0, 15)
    setInviteCode(value)
    ls.set(INVITATION_CODE_KEY, value)
    debouncedCheckInvitationCode(value)
  }

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <ParticleWave separation={40} amountX={120} amountY={40} disablePointerEvents={true} />
        <div className="relative flex flex-col items-center gap-6 w-[440px] max-w-[calc(100%-30px)] mx-[15px] p-[20px_24px_30px_24px] rounded-[16px] bg-[#1D1D1D]">
          {selectedOption !== 'none' && (
            <button
              className="absolute top-4 left-4 text-sm text-gray-400 hover:underline flex items-center gap-1"
              onClick={() => setSelectedOption('none')}
            >
              <img className="w-[22px] h-[22px]" src="/images/login/arrow-left.svg" alt="Logo" />
            </button>
          )}
          {!isDesktop && (
            <div className="absolute top-2 right-4 text-white">
              <DialogLanguages showLable={false} />
            </div>
          )}

          <div className="flex flex-col items-center">
            <img className="w-[144px] h-[88px]" src="/images/login/login-logo.svg" alt="Logo" />
            <div className="text-white text-[24px] font-extrabold  mt-2">{t('login.welcomeText')}</div>
          </div>

          <div className="w-full">
            {selectedOption === 'none' && (
              <>
                <div className="flex flex-col gap-4">
                  <button
                    className={clsx(
                      'flex h-[56px] px-4 justify-left items-center gap-[10px] self-stretch rounded-[10px] bg-[#333338]',
                      {
                        'opacity-50 pointer-events-none': !!error || isValidating,
                      },
                    )}
                    onClick={handleLoginWithEmail}
                  >
                    <img src="/images/login/email.svg" className="w-5 h-5" />
                    <span className=" font-light">{t('login.loginByEmail')}</span>
                  </button>

                  <div className="self-stretch h-14 px-4 rounded-[10px] bg-[#333338] inline-flex  items-center gap-2.5 relative">
                    <img src="/images/login/invite.svg" className="w-5 h-5" />
                    <input
                      className="text-sm "
                      value={inviteCode}
                      maxLength={15}
                      placeholder={t('login.inviteCode')}
                      onChange={handleChange}
                      onBlur={() => setIsValidating(false)}
                      onKeyDown={(event) => event.key == 'Enter' && setIsValidating(false)}
                    />
                    {inviteCode.length > 0 && !isValidating && !error && (
                      <svg
                        className="absolute top-4 bottom-4 right-4"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                          fill="#00C087"
                        />
                      </svg>
                    )}
                  </div>
                  {error && (
                    <div className="text-sm font-normal leading-5 text-center">
                      <p className="text-[#FF1568]">{error} </p>
                    </div>
                  )}
                  <div className="self-stretch w-full mt-[15px] border-t border-t-[#79778C29]"></div>

                  <div className="flex items-center flex-col justify-center w-full">
                    {indexedDbClient && publicKey ? (
                      <>
                        <LoginByWallets
                          publicKey={publicKey}
                          onSubmit={handleLoginWithWallet}
                          isDisabled={!!error || isValidating}
                        />
                      </>
                    ) : (
                      <LoadingSpinner size={32} />
                    )}
                  </div>
                </div>
              </>
            )}
            {selectedOption !== 'none' && <div>{renderOptionContent()}</div>}
          </div>
        </div>

        <WalletConnectProvider />
        {isDesktop && (
          <div className="absolute top-4 right-4 text-white">
            <DialogLanguages showLable={false} />
          </div>
        )}
      </div>
    </>
  )
}

export default LoginPage
