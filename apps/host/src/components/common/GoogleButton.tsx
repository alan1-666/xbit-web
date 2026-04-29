import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const GoogleButton = ({
  handleLoginSuccess,
  nonce,
  isAgree = true,
  loading = false,
  className
}: {
  handleLoginSuccess: any
  nonce: string
  isAgree?: boolean
  loading?: boolean
  className?: string
}) => {
  const { t } = useTranslation()
  const buttonRef = useRef<HTMLDivElement>(null)

  const initializeGoogleSignIn = useCallback(() => {
    if (window.google && buttonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOLE_OAUTH_CLIENT_ID!,
          callback: handleLoginSuccess,
          nonce: nonce,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 200,
        })

        setTimeout(() => {
          const googleBtn = buttonRef?.current?.querySelector('div')
          if (googleBtn) {
            googleBtn.style.display = 'none'
          }
        }, 100)
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error)
      }
    }
  }, [nonce])

  const triggerGoogleLogin = () => {
    if (!isAgree) {
      toast.error(t('toast.termsAgreement'))
      return
    }

    const googleBtn: any = buttonRef.current?.querySelector('div[role="button"]')

    if (googleBtn) {
      googleBtn.click()
    } else {
      window.google?.accounts?.id?.prompt?.()
    }
  }

  useEffect(() => {
    if (window.google) {
      initializeGoogleSignIn()
    } else {
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded)
          initializeGoogleSignIn()
        }
      }, 100)

      return () => clearInterval(checkGoogleLoaded)
    }
  }, [initializeGoogleSignIn])

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOLE_OAUTH_CLIENT_ID!}>
      <div className="w-full">
        <div ref={buttonRef} style={{ display: 'none' }}></div>
        <Button
          onClick={triggerGoogleLogin}
          // disabled={!isGoogleReady}
          isLoading={loading}
          className={cn('w-full flex items-center gap-3 h-12 rounded-full bg-[#ECECED1F] border-[0.5px] border-[#ECECED1F] disabled:opacity-50', className)}
        >
          <img src="/images/google-logo.svg" alt="Google" className="w-5 h-5" />
          <span className="app-font-medium text-white">{t('login.continueWithGoogle')}</span>
        </Button>
      </div>
    </GoogleOAuthProvider>
  )
}

export default GoogleButton
