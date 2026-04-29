import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
import { useState } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { formatAddressWallet } from '@/lib/string'
import { CopyButton } from '@components/common/copy-button.tsx'

export const SwitchWallets = () => {
  const activeWallet = useSelector(_activeWallet)
  const [openSwitchWalletBottomSheet, setOpenSwitchWalletBottomSheet] = useState(false)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)

  const walletData = listWalletsByChain.find((item: any) => item.walletAddress === activeWallet?.walletAddress)
  return (
    <>
      <div
        className="mr-[calc(1rem*(6/16))] flex items-center text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] text-title cursor-pointer"
        onClick={() => setOpenSwitchWalletBottomSheet(true)}
      >
        <div className="flex items-center gap-1.5">
          <div className="text-white text-[14px] leading-none whitespace-nowrap">{walletData?.name}</div>
          <div className="text-white/50 text-[14px] leading-none">{formatAddressWallet(activeWallet?.walletAddress)}</div>
          <CopyButton text={activeWallet?.walletAddress} />
        </div>
        <div className={clsx(openSwitchWalletBottomSheet && '-rotate-180', 'transition')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.8185 6.00098H7.85197H5.18067C4.72355 6.00098 4.49499 6.7093 4.81878 7.12452L7.28533 10.2875C7.68055 10.7943 8.32338 10.7943 8.7186 10.2875L9.65665 9.08461L11.1852 7.12452C11.5042 6.7093 11.2756 6.00098 10.8185 6.00098Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
      <NewSwitchWalletBottomSheet
        open={openSwitchWalletBottomSheet}
        setOpen={setOpenSwitchWalletBottomSheet}
        onChange={() => setOpenSwitchWalletBottomSheet(false)}
      />
    </>
  )
}
