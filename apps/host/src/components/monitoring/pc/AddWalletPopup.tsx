import { Dialog, DialogContent } from '@components/ui/dialog.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { toast } from 'sonner'
import { useMutation } from '@apollo/client'
import { addFollowingWallet } from '@services/wallet.service.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { isValidEvmAddress, isValidSolAddress } from '@/lib/blockchain.ts'
import { cn } from '@/lib/utils.ts'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_WALLETS_FOLLOWING } from '@const/smartMoney.ts'
import { addXWalletFavourite } from '@/hooks/useGetTotalFollowingAddress'
import { useActiveChainType } from '@hooks/useActiveChain.ts'
import { ChainType } from '@/@generated/gql/graphql-future.ts'
import { isArray } from 'lodash-es'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AddWalletPopup = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true)
  const [walletName, setWalletName] = useState<string>('')
  const [focusField, setFocusField] = useState<'address' | 'name' | undefined>(undefined)
  const activeChainType = useActiveChainType()
  const [followWalletMutation] = useMutation(addFollowingWallet, {
    client: futureClient,
  })

  const handleAddWallet = () => {
    if (!walletAddress) {
      setIsValidAddress(false)
      return
    }
    if (
      (activeChainType === ChainType.Solana && !isValidSolAddress(walletAddress)) ||
      (activeChainType === ChainType.Bsc && !isValidEvmAddress(walletAddress))
    ) {
      setIsValidAddress(false)
      return
    }
    setIsValidAddress(true)
    followWalletMutation({
      variables: {
        input: {
          chain: activeChainType,
          follows: [
            {
              address: activeChainType === ChainType.Bsc ? walletAddress.toLowerCase() : walletAddress,
              name: walletName || '',
            },
          ],
        },
      },
    })
      .then(() => {
        setOpen(false)
        setWalletAddress('')
        setWalletName('')
        setFocusField(undefined)
        eventBus.dispatch(REFETCH_WALLETS_FOLLOWING)
        toast.success(t('followingWallet.addWalletSuccess'))
        addXWalletFavourite(walletAddress, activeChainType, walletName)
      })
      .catch((error) => {
        setOpen(false)
        setWalletAddress('')
        setWalletName('')
        setFocusField(undefined)
        if (isArray(error)) {
          // array of GraphQLErrors
          const code = error?.[0]?.code
          if (code === 'Following_LimitExceeded') {
            toast.error(t('followingWallet.LimitExceeded'))
          } else toast.error(error.map((e) => e.message).join('; ') || t('toast.addFavoriteFailed'))
        } else {
          toast.error(t('toast.addFavoriteFailed'))
        }
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-[#1a1a1d]'>
        <div className="overflow-y-auto no-scrollbar max-h-[calc(80vh-150px)]">
          <div className="font-normal text-[14px] leading-[18px]">
            {t('followingWallet.walletAddress')} <span className="text-[#FF353C]"> *</span>
          </div>
          <div
            className={cn(
              'rounded-lg mt-3',
              focusField === 'address' ? 'border border-impartal' : 'border border-[#ECECED1F]',
            )}
          >
            <input
              type="text"
              className="w-full px-3 py-4 rounded-lg bg-[#141414] text-[14px] text-white focus:outline-none"
              placeholder={t('followingWallet.inputWalletAddress', { chain: activeChainType })}
              value={walletAddress}
              onChange={(e) => {
                setWalletAddress(e.target.value)
              }}
              onFocus={() => {
                setFocusField('address')
                setIsValidAddress(true)
              }}
            />
          </div>
          {!isValidAddress && (
            <div className="mt-2 font-normal text-[12px] text-[#FF353C] leading-none">
              {t('followingWallet.inputWalletAddressError2', { chain: activeChainType })}
            </div>
          )}
          <div className="mt-5 font-normal text-[14px] leading-[18px]">{t('followingWallet.walletName')}</div>
          <div
            className={cn(
              'rounded-lg mt-3',
              focusField === 'name' ? 'border border-impartal' : 'border border-[#ECECED1F]',
            )}
          >
            <input
              type="text"
              className="w-full px-3 py-4 rounded-lg bg-[#141414] text-[14px] text-white focus:outline-none"
              placeholder={t('followingWallet.optional')}
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              onFocus={() => {
                setFocusField('name')
              }}
            />
          </div>
        </div>
        <div className="w-full mt-3 pt-3 border-t border-[#ECECED0A] flex gap-4 items-center">
          <Button variant="borderGradient" className="rounded-full flex-1 h-11" onClick={() => setOpen(false)}>
            {t('button.cancel')}
          </Button>
          <Button
            variant="gradient"
            className="rounded-full flex-1 h-11 text-black"
            onClick={() => handleAddWallet()}
            disabled={!walletAddress || !isValidAddress}
          >
            {t('button.add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddWalletPopup
