import { ItemWalletPresentation } from '@components/auth/ManagementWallets/components/ItemWalletPresentation.tsx'
import { useCallback, useContext } from 'react'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { PortfolioDTO } from '@/types/holding.ts'

export interface AssetItemWalletProps {
  wallet: UserEmbeddedWalletDto
  portfolioData?: PortfolioDTO[]
  totalHoldingTokens?: number
  onSelected?: () => void
}

export const AssetItemWallet = (props: AssetItemWalletProps) => {
  const { wallet, portfolioData, totalHoldingTokens, onSelected } = props
  const { selectedWallet, setSelectedWallet } = useContext(AssetOverviewContext)
  const handleOnClick = useCallback(() => {
    setSelectedWallet?.(wallet)
    if (onSelected) onSelected()
  }, [])
  return (
    <ItemWalletPresentation
      wallet={wallet}
      isSelected={selectedWallet?.walletAddress === wallet?.walletAddress}
      portfolioData={portfolioData}
      totalHoldingTokens={totalHoldingTokens}
      onSelected={handleOnClick}
    />
  )
}
