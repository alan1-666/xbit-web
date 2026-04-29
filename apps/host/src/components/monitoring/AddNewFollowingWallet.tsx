import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import BottomSheet from '@/components/common/BottomSheet'
import { Button } from '@components/ui/button.tsx'
import { toast } from 'sonner'
import { isValidEvmAddress, isValidSolAddress } from '@/lib/blockchain'
import { cn } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import { addFollowingWallet } from '@/services/wallet.service'
import { futureClient } from '@/lib/gql/apollo-client'
import eventBus from '@/lib/eventBus.ts'
import { REFETCH_WALLETS_FOLLOWING } from '@const/smartMoney.ts'
import { addXWalletFavourite } from '@/hooks/useGetTotalFollowingAddress'
import { useActiveChain, useActiveChainType } from '@hooks/useActiveChain.ts'
import { mappingTypeChain } from '@/utils/mappingType.ts'
import { isArray } from 'lodash-es'
import { ChainType } from '@/@generated/gql/graphql-future.ts'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const AddNewFollowingWallet = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()

  const activeChain = useActiveChain()
  const activeChainType = useActiveChainType()
  const chainValue = useMemo(() => mappingTypeChain(activeChain), [activeChain])

  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isValidAddress, setIsValidAddress] = useState<boolean>(true)
  const [walletName, setWalletName] = useState<string>('')
  const [focusField, setFocusField] = useState<'address' | 'name' | undefined>(undefined)
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
          chain: chainValue,
          follows: [
            {
              address: walletAddress,
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
        addXWalletFavourite(walletAddress, activeChainType, walletName)
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
    <BottomSheet open={open} setOpen={setOpen} title={t('followingWallet.addWallet')}>
      {/* <div className="absolute inset-0 z-50 bg-[#17181B]/20 backdrop-blur-sm flex items-center justify-center">
        <div className="border border-[#2A2D33] rounded-lg px-8 py-6 shadow-xl">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#00FFB4]/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#00FFB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-medium mb-2">{t('liquidityChart.comingSoon')}</h3>
          </div>
        </div>
      </div> */}
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
        <Button variant="close" className="rounded-full flex-1 h-11" onClick={() => setOpen(false)}>
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
    </BottomSheet>
  )
}

export default AddNewFollowingWallet
