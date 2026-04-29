import ConfirmPopup from '@/components/common/ConfirmPopup'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { updateWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { approveCreateWalletMutation } from '@/services/auth.service'
import { defaultBitcoinMainnetP2TRAccountAtIndex } from '@turnkey/sdk-browser'
import { useTurnkey } from '@turnkey/sdk-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const ConfirmCreateBTCWallet = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()
  const { indexedDbClient } = useTurnkey()
  const dispatch = useDispatch()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const subOrgId = useSelector(_userInfo)?.subOrgId

  const handleConfirm = async () => {
    if (indexedDbClient) {
      const firstItem = listWalletsByChain[0]
      const walletId = firstItem?.walletId

      const activity = await indexedDbClient?.createWalletAccounts({
        organizationId: subOrgId,
        walletId,
        accounts: [defaultBitcoinMainnetP2TRAccountAtIndex(0)],
      })

      const response = await userGqlClient.mutate({
        mutation: approveCreateWalletMutation,
        variables: {
          input: {
            activityId: activity?.activity?.id,
            name: 'BTC Wallet',
          },
        },
      })

      const newWallet = response.data.approveCreateWallet?.wallet

      const walletWithBalance = {
        ...newWallet,
        balance: 0,
      }

      dispatch(
        updateWallet({
          listWalletsByChain: [...listWalletsByChain, walletWithBalance],
        }),
      )

      toast.success(t('wallet.createWalletSuccessfully'))
      setOpen(false)
    }
  }

  return (
    <ConfirmPopup
      open={open}
      setOpen={setOpen}
      title=""
      description="wallet.createBTCWalletNote"
      cancelText=""
      onConfirm={handleConfirm}
    />
  )
}

export default ConfirmCreateBTCWallet
