import { ChainType } from '@/@generated/gql/graphql-user.ts'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import AssetSwitchWalletBottomSheet from '@components/assets/wallet/AssetSwitchWalletBottomSheet.tsx'
import clsx from 'clsx'
import { useContext, useMemo, useState } from 'react'

const mapChainTypeToChainName = (chain: ChainType): string => {
  switch (chain) {
    case ChainType.Solana:
      return 'Solana'
    case ChainType.Evm:
      return 'Ethereum'
    case ChainType.Arb:
      return 'Arbitrum'
    case ChainType.Bsc:
      return 'BNB Chain'
    case ChainType.Mon:
      return 'Monad'  
    default:
      return 'Unknown'
  }
}

export const AssetSwitchWallets = () => {
  const { selectedWallet } = useContext(AssetOverviewContext)
  const [openSwitchWalletBottomSheet, setOpenSwitchWalletBottomSheet] = useState(false)

  const chainIcon = useMemo(() => {
    switch (selectedWallet?.chain) {
      case ChainType.Bsc:
        return '/images/bsc.svg'
      case ChainType.Evm:
        return '/images/ether.svg'
      case ChainType.Arb:
        return '/images/icons/chains/ic-arbitrum.svg'
      case ChainType.Mon:
        return '/images/icons/chains/ic-monad.svg'  
      default:
        return '/images/icons/icon-sol.svg'
    }
  }, [selectedWallet?.chain])

  return (
    <>
      <div className="text-title mr-[calc(1rem*(6/16))] flex items-center text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))]">
        <div className="flex items-center gap-1 text-[15px] leading-none font-[380] whitespace-nowrap text-white/70">
          <img src={chainIcon} alt="chain-icon" className="inline-block h-[16px] w-[16px]" />
          <span>{mapChainTypeToChainName(selectedWallet?.chain!)}:</span>
          <span className="cursor-pointer" onClick={() => setOpenSwitchWalletBottomSheet(true)}>
            {selectedWallet?.name}
          </span>
        </div>
        <div
          className={clsx(openSwitchWalletBottomSheet && '-rotate-180', 'cursor-pointer transition')}
          onClick={() => setOpenSwitchWalletBottomSheet(true)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.8185 6.00098H7.85197H5.18067C4.72355 6.00098 4.49499 6.7093 4.81878 7.12452L7.28533 10.2875C7.68055 10.7943 8.32338 10.7943 8.7186 10.2875L9.65665 9.08461L11.1852 7.12452C11.5042 6.7093 11.2756 6.00098 10.8185 6.00098Z"
              fill="#ffffffb3"
            />
          </svg>
        </div>
      </div>
      <AssetSwitchWalletBottomSheet
        open={openSwitchWalletBottomSheet}
        setOpen={setOpenSwitchWalletBottomSheet}
        onChange={() => setOpenSwitchWalletBottomSheet(false)}
      />
    </>
  )
}
