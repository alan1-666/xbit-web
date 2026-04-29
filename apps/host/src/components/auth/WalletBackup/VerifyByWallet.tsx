import { useTranslation } from 'react-i18next'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { visibleWallets } from '../LoginByWallet'
import { useAccount, useSignMessage } from 'wagmi'
import { useAppDispatch } from '@/redux/store'
import { newAuthActions } from '@/redux/modules/newAuth.slice'
import { message_to_sign } from '@/lib/blockchain'
import { VefiryWalletInput } from './SecurityCheckModal'

const VerifyByWallet = ({ onVerifyUser }: { onVerifyUser: (input: VefiryWalletInput) => Promise<void> }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const dispatch = useAppDispatch()
  const { signMessageAsync } = useSignMessage({})

  const handleSignMessageWallet = async () => {
    dispatch(
      newAuthActions.getNonce({
        address,
      }),
    ).then(async (res) => {
      const nonce = res?.payload?.getNonce
      const message = message_to_sign(address!, nonce)
      try {
        const messageSigned = await signMessageAsync({ message: message })
        onVerifyUser({
          message: message,
          signature: messageSigned,
          isOkxWallet: true,
        })
      } catch (error) {
        console.log('[error]: ', error)
      }
    })
  }

  return (
    <div className="w-full mt-5">
      {visibleWallets.map((item) => (
        <div
          className="flex items-center justify-center rounded-[200px] gap-3 bg-[#ececed1f] py-2.5 cursor-pointer"
          onClick={handleSignMessageWallet}
        >
          <img src={item?.icon} className="w-5 h-5 rounded-full" alt="" />
          <p className="text-sm font-medium leading-none text-white">Continue with {item?.name}</p>
        </div>
      ))}
    </div>
  )
}

export default VerifyByWallet
