import { useEffect, useState } from 'react'
import { useTurnkey } from '@turnkey/sdk-react'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex } from '@noble/hashes/utils'
import { CredentialResponse } from '@react-oauth/google'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { VefiryWalletInput } from './SecurityCheckModal'
import GoogleButton from '@/components/common/GoogleButton'

const VerifyByGoogle = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const { indexedDbClient } = useTurnkey()
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string>('')

  const handleGoogleLogin = (response: CredentialResponse) => {
    onVerifyUser({
      oidcToken: response?.credential,
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
        <GoogleButton handleLoginSuccess={handleGoogleLogin} nonce={nonce} />
      ) : (
        <LoadingSpinner size={20} />
      )}
    </div>
  )
}

export default VerifyByGoogle
