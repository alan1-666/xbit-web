import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet'
import { LIST_CHAIN_SUPPORTED } from '@/lib/blockchain'
import { formatAmount } from '@/lib/format'
import { newWalletActions } from '@/redux/modules/newWallet.slice'
import { useAppDispatch } from '@/redux/store'
import { IconTriangleDown } from '@components/icon/IconTriangleDown.tsx'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import { useEffect, useState } from 'react'

export const ChangeWalletButton = () => {
  const [openSwitchWalletBottomSheet, setOpenSwitchWalletBottomSheet] = useState(false)
  const { wallets, activeChain, activeWallet } = useMultiChainWallet({})
  const dispatch = useAppDispatch()
  const chainLogo = LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)
  const activeWalletByTele = wallets?.[activeChain]?.telegram
  const activeWalletByChain = wallets?.[activeChain]?.chain
  const listWallets = [
    ...(activeWalletByTele?.isConnected
      ? [
          {
            wallet: activeWalletByTele,
          },
        ]
      : []),
    ...(activeWalletByChain?.isConnected
      ? [
          {
            wallet: activeWalletByChain,
          },
        ]
      : []),
  ]

  useEffect(() => {
    if (openSwitchWalletBottomSheet && activeWalletByTele?.isConnected) {
      dispatch(newWalletActions.getAccountInfo({}))
    }
  }, [openSwitchWalletBottomSheet])

  return (
    <>
      <button
        className="h-full flex items-center gap-2.5"
        onClick={() => {
          setOpenSwitchWalletBottomSheet(true)
        }}
      >
        <div className="flex gap-1 items-center">
          <IconWallet />
          <span className="">{listWallets?.length}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <img src={chainLogo!.img} alt="" className="size-[12px] mt-[1px]" />
          <span className="">
            {formatAmount(activeWallet?.balance?.formatted, {
              roundMode: 'floor',
            })}
          </span>
        </div>
        <IconTriangleDown />
      </button>
      <NewSwitchWalletBottomSheet open={openSwitchWalletBottomSheet} setOpen={setOpenSwitchWalletBottomSheet} />
    </>
  )
}
