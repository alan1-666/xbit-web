import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign } from '@/lib/blockchain'
import { VefiryWalletInput } from './SecurityCheckModal'
import { OKXWalletName } from '@/lib/wallets/OKXWalletAdapter'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAppKitAccount, useWalletInfo, modal } from '@reown/appkit/react'
import { useEffect } from 'react'

const VerifyByNewWalletConnect = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { walletInfo } = useWalletInfo('solana')
  const { isConnected, address } = useAppKitAccount()
  useEffect(() => {
    if (!isConnected || !address) {
      toast.error(t('walletConnect.reLogin'))
    }
  }, [isConnected, address])

  const handleSignMessageWallet = async () => {
    if (!isConnected || !address) {
      toast.error(t('walletConnect.reLogin'))
      return
    }
    const res = await dispatch(
      newAuthActions.getNonce({
        address: address as string,
      }),
    )
    const nonce = res?.payload?.getNonce
    const message = message_to_sign(address as string, nonce)
    try {
      const provider: any = modal?.getWalletProvider()
      toast.info(
        t('walletConnect.toastVerify', {
          name: walletInfo?.name,
        }),
      )
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await provider?.signMessage(messageBytes)
      if (!signatureBytes) {
        return
      }
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64')
      onVerifyUser({
        message: message,
        signature: signatureBase64,
        isOkxWallet: walletInfo?.name === OKXWalletName,
        // isOkxWallet: true,
      })
    } catch (error) {
      toast.error(t('walletConnect.reLogin'))
    }
  }

  return (
    <div className="w-full mt-5">
      {walletInfo && (
        <div
          className="flex items-center justify-center rounded-[200px] gap-3 bg-[#ececed1f] py-2.5 cursor-pointer"
          onClick={handleSignMessageWallet}
        >
          <img src={walletInfo?.icon} className="w-5 h-5 rounded-full" alt="" />
          <p className="text-sm font-medium leading-none text-white">Continue with {walletInfo?.name}</p>
        </div>
      )}
    </div>
  )
}

export default VerifyByNewWalletConnect
