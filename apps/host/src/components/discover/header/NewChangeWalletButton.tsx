import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
import { IconTriangleDown } from '@/components/icon'
import { getIconChain, TYPE_CHAIN } from '@/lib/blockchain'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import { useState } from 'react'

export const NewChangeWalletButton = () => {
  const [openSwitchWalletBottomSheet, setOpenSwitchWalletBottomSheet] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  return (
    <>
      <button
        className="h-full flex items-center gap-1 bg-[#18181D] p-1 rounded-[200px]"
        onClick={() => {
          setOpenSwitchWalletBottomSheet(true)
        }}
      >
        {/* <img src={nativeTokenLogo} alt="" className="size-4" /> */}
        <img
          src={activeChain === TYPE_CHAIN.SOLANA ? '/images/icons/ic-solana.svg' : getIconChain(activeChain)}
          alt=""
          className="w-4 h-4 rounded-full border-[0.5px] border-[#25242b]"
        />

        <div className="w-px h-2.5 bg-[#25242B]"></div>
        <IconWallet />
        <IconTriangleDown
          style={{ width: 14, height: 14, color: '#cacaca' }}
          className={cn('', {
            'rotate-180': openSwitchWalletBottomSheet,
          })}
        />
      </button>
      <NewSwitchWalletBottomSheet open={openSwitchWalletBottomSheet} setOpen={setOpenSwitchWalletBottomSheet} />
    </>
  )
}
