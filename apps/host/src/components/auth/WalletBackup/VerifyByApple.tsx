import { useEffect, useState } from 'react'
import { useTurnkey } from '@turnkey/sdk-react'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { VefiryWalletInput } from './SecurityCheckModal'
import { Button } from '@/components/ui/button'
import AppleSignin from 'react-apple-signin-auth'

const VerifyByApple = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const { indexedDbClient } = useTurnkey()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string>('')

  const handleAppleLogin = (response: any) => {
    onVerifyUser({
      oidcToken: response?.authorization?.id_token,
    })
  }

  useEffect(() => {
    if (!indexedDbClient) {
      return
    }
    indexedDbClient?.getPublicKey().then((publicKey: string | null) => {
      setPublicKey(publicKey)
      setNonce(bytesToHex(sha256(publicKey ?? '')))
      // todo: test sync public key when failed authentication with api
    })
  }, [indexedDbClient])

  return (
    <div>
      {indexedDbClient && publicKey ? (
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
      ) : (
        <LoadingSpinner size={20} />
      )}
    </div>
  )
}

export default VerifyByApple
