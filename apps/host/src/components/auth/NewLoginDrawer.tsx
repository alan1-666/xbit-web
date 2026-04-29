import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive.ts'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import { useTurnkey } from '@turnkey/sdk-react'
import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingSpinner from '../ui/loading-spinner'
import CustomDrawer from './CustomDrawer'
import LoginByEmail from './LoginByEmail'
import LoginByWalletSol from './LoginByWalletSol'
import { ParticleWave } from '../login/background/particle-wave'
import { cn } from '@/lib/utils'
import WalletLoginVerify from '../login/WalletLoginVerify'
interface LoginDrawerProps {
  setOpen: Dispatch<SetStateAction<boolean>>
  open: boolean
  tab?: 'crypto' | 'meme'
}
type Option = 'none' | 'email' | 'emailInput' | 'verifyOtp' | 'wallet' | 'google' | 'verifyBetaCode'

const NewLoginDrawer = (props: LoginDrawerProps) => {
  const { open, setOpen } = props
  const { isDesktop } = useResponsive()
  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent
            className="bg-[#232329] rounded-2xl p-1 pt-3"
            aria-label="wallet connect modal"
            onInteractOutside={(e) => {
              const isWcmOpen = (() => {
                const wcm = document.querySelector('wcm-modal') as HTMLElement & { shadowRoot?: ShadowRoot }
                if (!wcm?.shadowRoot) return false
                const inner = wcm.shadowRoot.querySelector('#wcm-modal')
                return inner?.classList.contains('wcm-active')
              })()

              if (isWcmOpen) e.preventDefault()
            }}
            onEscapeKeyDown={(e) => {
              const isWcmOpen = (() => {
                const wcm = document.querySelector('wcm-modal') as HTMLElement & { shadowRoot?: ShadowRoot }
                if (!wcm?.shadowRoot) return false
                const inner = wcm.shadowRoot.querySelector('#wcm-modal')
                return inner?.classList.contains('wcm-active')
              })()

              if (isWcmOpen) e.preventDefault()
            }}
          >
            <DialogTitle></DialogTitle>
            <DrawerContent open={open} />
          </DialogContent>
        </Dialog>
      ) : (
        <CustomDrawer open={open} onOpenChange={setOpen}>
          <DrawerContent open={open} />
        </CustomDrawer>
      )}
    </>
  )
}

const DrawerContent = ({ open }: { open: boolean }) => {
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string>('')
  const [isAgree, setIsAgree] = useState(true)
  const [selectedOption, setSelectedOption] = useState<Option>('none')
  const { isDesktop } = useResponsive()
  const [address, setAddress] = useState<string>('')
  const [walletName, setWalletName] = useState<string>('')

  useLayoutEffect(() => {
    if (!open || !indexedDbClient) {
      return
    }

    indexedDbClient.config.activityPoller = {
      intervalMs: 0,
      numRetries: 0,
    }

    indexedDbClient?.resetKeyPair().then(() => {
      indexedDbClient?.getPublicKey().then((publicKey: string | null) => {
        setPublicKey(publicKey)
        setNonce(bytesToHex(sha256(publicKey ?? '')))
      })
    })
  }, [open, indexedDbClient])

  const renderOptionContent = () => {
    switch (selectedOption) {
      case 'email':
        return <LoginByEmail publicKey={publicKey} isAgree={isAgree} nonce={nonce} />
      default:
        return null
    }
  }

  const handleLoginWithEmail = () => {
    setSelectedOption('email')
  }

  const handleLoginWithWallet = (address: string, walletName: string) => {
    setAddress(address)
    setWalletName(walletName)
    setSelectedOption('wallet')
  }

  return (
    <div
      className={cn('w-full h-full px-3.75', {
        'pb-10': isDesktop,
        'pt-30': !isDesktop
      })}
      aria-label="wallet connect modal"
    >
      {!isDesktop && <ParticleWave separation={40} amountX={100} amountY={40} disablePointerEvents={true} containerClassName='h-[156px]'/>}
      {selectedOption !== 'none' && (
        <img
          className="w-6 h-6 absolute top-3 left-3 cursor-pointer"
          src="/images/icons/arrow-left.svg"
          alt="button back"
          onClick={() => setSelectedOption('none')}
        />
      )}
      {selectedOption === 'none' && (
        <>
          <div className="flex flex-col items-center">
            <img className="w-36 h-22" src="/images/login/login-logo.svg" alt="Logo" />
            <div className="text-white text-[18px] font-semibold leading-none mt-4">{t('login.welcomeText')}</div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              className={cn(
                'flex h-13 px-4 mt-10 justify-left items-center gap-2.5 self-stretch rounded-[8px] bg-[#18181d]',
                {
                  // 'opacity-50 pointer-events-none': !!error || isValidating,
                },
              )}
              onClick={handleLoginWithEmail}
            >
              <img src="/images/login/email.svg" className="w-5 h-5" />
              <span className="text-base font-normal leading-normal">{t('login.loginByEmail')}</span>
            </button>
            <div className="self-stretch w-full h-px border-t border-t-[#79778C29]"></div>

            <>
              {indexedDbClient && publicKey ? (
                <LoginByWalletSol publicKey={publicKey} isAgree={isAgree} onSubmit={handleLoginWithWallet} />
              ) : (
                <div className="text-center">
                  <LoadingSpinner size={28} />
                </div>
              )}
            </>
          </div>
        </>
      )}
      {selectedOption !== 'none' && <div>{renderOptionContent()}</div>}
    </div>
  )
}
export default NewLoginDrawer
