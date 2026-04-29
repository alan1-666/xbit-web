import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign } from '@/lib/blockchain'
import { VefiryWalletInput } from './SecurityCheckModal'
import { OKXWalletName } from '@/lib/wallets/OKXWalletAdapter'
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useRequest, useSession } from '@walletconnect/modal-sign-react'
import { escapeOkxString } from '@/utils/helpers'
import { toHex } from 'viem'

const VerifyByWalletConnect = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const session = useSession()
  const isEnscape = useAppSelector((state) => state.newWallet.isEnscape)
  const { request } = useRequest({
    topic: session?.topic,
    chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    request: {
      method: 'solana_signMessage',
      params: {},
    },
  })

  const handleSignMessageWallet = async () => {
    if (!session) return
    toast.info(
      t('walletConnect.toastVerify', {
        name: session?.peer?.metadata?.name,
      }),
    )
    const solanaNamespace = session?.namespaces?.solana
    const account = solanaNamespace?.accounts[0]

    if (!solanaNamespace || !account) {
      signMessageChainEvm(session)
    } else {
      signMessageChainSolana(session)
    }
  }

  const signMessageChainEvm = async (session: any) => {
    const evmNamespace = session?.namespaces?.eip155
    const account = evmNamespace.accounts[0]
    const address = account.split(':')[2]
    const walletName = session?.peer?.metadata?.name
    const isLedger = walletName?.toLowerCase().includes('ledger')

    const res = await dispatch(
      newAuthActions.getNonce({
        address: address.toString(),
      }),
    )

    const nonce = res?.payload?.getNonce
    const message = message_to_sign(address.toString(), nonce)
    try {
      const messageBytes = isLedger ? toHex(message) : isEnscape ? escapeOkxString(message) : message
      const result = await request({
        topic: session?.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [messageBytes, address],
        },
      }).catch((error: any) => {
        // console.error('Error signing message:', error, error?.message)
        console.log('Error signing message:', error, error?.code)
        return
      })

      if (result) {
        onVerifyUser({
          message: isLedger ? message : messageBytes,
          signature: result as string,
          isOkxWallet: session?.peer?.metadata?.name === OKXWalletName,
        })
      } else {
        toast.error(t('walletConnect.reLogin'))
      }
    } catch (err) {
      // console.error('Error signing message:', (err as any)?.message)
      toast.error(t('walletConnect.reLogin'))
    }
  }

  const signMessageChainSolana = async (session: any) => {
    const solanaNamespace = session?.namespaces?.solana
    const account = solanaNamespace.accounts[0]
    const address = account.split(':')[2]

    const res = await dispatch(
      newAuthActions.getNonce({
        address: address.toString(),
      }),
    )

    const nonce = res?.payload?.getNonce
    const message = message_to_sign(address.toString(), nonce)
    try {
      const messageBytes = bs58.encode(new TextEncoder().encode(isEnscape ? escapeOkxString(message) : message))
      const result: any = await request({
        topic: session?.topic,
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        request: {
          method: 'solana_signMessage',
          params: {
            pubkey: address,
            message: messageBytes,
          },
        },
      }).catch((error: any) => {
        // console.error('Error signing message:', error, error?.message)
        console.log('Error signing message:', error, error?.code)
        return
      })

      if (result) {
        const signatureBytes = bs58.decode(result?.signature)
        const signatureBase64 = btoa(String.fromCharCode(...signatureBytes))
        onVerifyUser({
          message: message,
          signature: signatureBase64,
          isOkxWallet: session?.peer?.metadata?.name === OKXWalletName,
        })
      } else {
        toast.error(t('walletConnect.reLogin'))
      }
    } catch (err) {
      // console.error('Error signing message:', (err as any)?.message)
      toast.error(t('walletConnect.reLogin'))
    }
  }

  const getLogoWallet = () => {
    const nativeRedirect = session.peer.metadata.redirect?.native || ''
    if (nativeRedirect.startsWith('okxwallet://')) {
      return '/images/wallets/img-okx-wallet.webp'
    }
    const logo = session?.peer?.metadata?.icons?.[0]
    return logo
  }

  return (
    <div className="w-full mt-5">
      {session && (
        <div
          className="flex items-center justify-center rounded-[200px] gap-3 bg-[#ececed1f] py-2.5 cursor-pointer"
          onClick={handleSignMessageWallet}
        >
          <img src={getLogoWallet()} className="w-5 h-5 rounded-full" alt="" />
          <p className="text-sm font-medium leading-none text-white">
            {t('walletBackup.mnemonicPrompt.continueWithWallet', {
              wallet: session?.peer?.metadata?.name ? session?.peer?.metadata?.name : 'wallet',
            })}
          </p>
        </div>
      )}
    </div>
  )
}

export default VerifyByWalletConnect
