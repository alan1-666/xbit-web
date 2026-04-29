import { memo, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useSelector } from 'react-redux'
import { LIST_CHAIN_SUPPORTED, TYPE_CHAIN } from '@/lib/blockchain.ts'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
import { useLocation } from 'react-router-dom'
import { ItemWalletPresentation } from '@components/auth/ManagementWallets/components/ItemWalletPresentation.tsx'

interface ItemWalletProps {
  account: any
  onChange?: () => void
}

const ItemWallet = memo(({ account, onChange }: ItemWalletProps) => {
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const activeWallet = useSelector(_activeWallet)
  const { pathname } = useLocation()
  const isFuturesPage = pathname.includes('/futures')

  const nativeTokenLogo = useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return '/images/icons/icon-sol.svg'
    if (activeChain === TYPE_CHAIN.ETH) return '/images/ether.svg'
    if (activeChain === TYPE_CHAIN.ARB) {
      if (isFuturesPage) return '/images/icons/chains/ic-usdc.svg'
      return '/images/ether.svg'
    }
    return LIST_CHAIN_SUPPORTED.find((item) => item.value === activeChain)?.img
  }, [activeChain])

  const handleOnClick = () => {
    dispatch(newWalletActions.setActiveAccountWallet(account?.walletAddress))
    if (onChange) onChange()
  }

  return (
    <ItemWalletPresentation
      wallet={account}
      isSelected={activeWallet?.walletAddress === account?.walletAddress}
      portfolioData={account?.portfolioData}
      totalHoldingTokens={account?.totalHoldingTokens}
      onSelected={handleOnClick}
      nativeTokenLogo={nativeTokenLogo}
    />
  )
})

ItemWallet.displayName = 'ItemWallet'

export default ItemWallet
