import { useState, MouseEvent } from 'react'
import { ChainIds } from '@/types/enums.ts'
import { IconWalletTop100 } from './IconWalletTop100'
import { WalletStatisticTooltip } from '@components/detaiTokenTable/WalletStatisticTooltip.tsx'

type WalletAttributes = {
  isDev?: boolean
  isWhale?: boolean
  isInsider?: boolean
  isNativeWallet?: boolean
  isTop10?: boolean
  isSmartMoney?: boolean
  isKOL?: boolean
  isNewWallet?: boolean
  topHolder?: string
}

type WalletAddressProps = {
  address: string
  walletAttributes: WalletAttributes
  tx24h?: number
  onFilterClick?: () => void
  selectedWallet?: string
  holdingPercentage?: number
  chainId?: number
  token: string
  currentPrice?: string
}

const renderIcon = (attributes: WalletAttributes) => {
  if (attributes.isDev) {
    return <img src="/images/icons/wallets/ic-top-holder.svg" alt="dev" />
  }
  if (attributes.isWhale) {
    return <img src="/images/icons/wallets/ic-whale.svg" alt="whale" />
  }
  if (attributes.isInsider) {
    return <img src="/images/icons/wallets/ic-rat.svg" alt="insider" />
  }
  if (attributes.isNativeWallet) {
    return <img src="/images/icons/wallets/ic-bundle.svg" alt="native wallet" />
  }
  if (attributes.isTop10) {
    // return <img src="/images/icons/wallets/ic-top-10.svg" alt="top 10" />
    if (attributes.topHolder) {
      return <IconWalletTop100 top={attributes.topHolder} className="size-5" />
    } else {
      return <img src="/images/icons/wallets/ic-top-10.svg" alt="top 10" />
    }
  }
  if (attributes.isSmartMoney) {
    return <img src="/images/icons/wallets/ic-smart-money.svg" alt="smart money" />
  }
  if (attributes.isKOL) {
    return <img src="/images/icons/wallets/ic-dev.svg" alt="KOL" />
  }
  if (attributes.isNewWallet) {
    return <img src="/images/icons/wallets/ic-new-wallet.svg" alt="new wallet" />
  }
}

const WalletAddress = ({
  address,
  walletAttributes,
  tx24h,
  onFilterClick,
  selectedWallet,
  holdingPercentage = 0,
  chainId = ChainIds.Solana,
  token,
  currentPrice,
}: WalletAddressProps) => {
  const [open, setOpen] = useState<boolean>(false)

  const handleAddressClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('.wallet-statistic-tooltip')) {
      return
    }
    setOpen((prev) => !prev)
  }

  const handleFilterClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (onFilterClick) {
      onFilterClick()
    }
  }

  return (
    <div className="relative min-w-[140px]">
      <div className="flex items-center gap-1" onClick={handleAddressClick}>
        <div className="w-5">{renderIcon(walletAttributes)}</div>
        <WalletStatisticTooltip
          tx24h={tx24h}
          address={address}
          holdingPercentage={holdingPercentage}
          chainId={chainId}
          token={token}
          currentPrice={currentPrice}
        />
        {address === selectedWallet ? (
          <div
            className="cursor-pointer w-4 h-4 flex items-center justify-center text-[#CACACA] text-sm font-bold"
            onClick={handleFilterClick}
          >
            ×
          </div>
        ) : (
          <img
            src="/images/icons/icon-filter.svg"
            alt="filter"
            className="cursor-pointer w-4 h-4"
            onClick={handleFilterClick}
          />
        )}
      </div>

      {open && <div className="absolute bottom-0 z-10 right-0 bg-[#363642] rounded-[8px]"></div>}
    </div>
  )
}

export default WalletAddress
