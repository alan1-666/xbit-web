import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign } from '@/lib/blockchain'
import { VefiryWalletInput } from './SecurityCheckModal'
import { useWallet } from '@solana/wallet-adapter-react'
import { OKXWalletName } from '@/lib/wallets/OKXWalletAdapter'
import { useTranslation } from 'react-i18next'
import { getMetaMaskProvider, MetaMaskWalletName } from '@/lib/wallets/MetaMaskWalletAdaper'

const VerifyByWalletSol = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { wallet, publicKey, signMessage } = useWallet()
  const { walletAddressLogin } = useAppSelector((state) => state.newWallet) as any
  const { connectedWalletIcon, connectedWalletName } = useAppSelector((state) => state.newWallet) as any

  const handleSignMessageWallet = async () => {
    const res = await dispatch(
      newAuthActions.getNonce({
        address: walletAddressLogin,
      }),
    )
    const nonce = res?.payload?.getNonce

    if (wallet?.adapter?.name === MetaMaskWalletName || connectedWalletName === MetaMaskWalletName) {
      try {
        const message = message_to_sign(walletAddressLogin, nonce)
        const ethProvider: any = await getMetaMaskProvider()
        let signatureHex: string | null = null

        if (ethProvider && typeof ethProvider.request === 'function') {
          try {
            signatureHex = await ethProvider.request({
              method: 'personal_sign',
              params: [message, walletAddressLogin],
            })
          } catch (err) {
            return
          }
        }
        onVerifyUser({
          message: message,
          signature: signatureHex || '',
          isOkxWallet: false,
        })
      } catch (error) { }

      return
    }

    if (!publicKey || !signMessage) return
    const message = message_to_sign(publicKey.toString(), nonce)
    try {
      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signatureBase64 = Buffer.from(signatureBytes).toString('base64')
      onVerifyUser({
        message: message,
        signature: signatureBase64,
        isOkxWallet: wallet?.adapter?.name === OKXWalletName,
      })
    } catch (err) {
      console.error('Error signing message:', err)
    }
  }

  return (
    <div className="w-full mt-5">
      <div
        className="flex items-center justify-center rounded-[200px] gap-3 bg-[#ececed1f] py-2.5 cursor-pointer"
        onClick={handleSignMessageWallet}
      >
        <img src={(wallet?.adapter?.name === MetaMaskWalletName || connectedWalletName === MetaMaskWalletName) ? connectedWalletIcon : wallet?.adapter?.icon} className="w-5 h-5 rounded-full" alt="" />
        <p className="text-sm font-medium leading-none text-white">
          {t('walletBackup.mnemonicPrompt.continueWithWallet', {
            wallet: wallet?.adapter?.name ? wallet?.adapter?.name : 'wallet',
          })}
        </p>
      </div>
    </div>
  )
}

export default VerifyByWalletSol
