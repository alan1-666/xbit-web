import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { useAppSelector } from '@/redux/store'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useEffect, useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'

export interface WalletSelectProps {
  chainId: number
  selectedWallet?: string
  onWalletChange?: (walletAddress: string) => void
  excludeWallet?: string // Wallet address to exclude from the list
}

export const WalletSelect = (props: WalletSelectProps) => {
  const { chainId, selectedWallet, onWalletChange, excludeWallet } = props
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const filteredWallets = useMemo(() => {
    if (chainId === ChainIds.Arbitrum) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')
    }
    if (chainId === ChainIds.Ethereum) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
    }
    if (chainId === ChainIds.Bsc) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'BSC')
    }
    if (chainId === ChainIds.Mon) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'MON')
    }
    return listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
  }, [chainId])

  const value = useMemo(() => {
    const exists = filteredWallets.find((wallet) => wallet.walletAddress === selectedWallet)
    return exists ? selectedWallet : filteredWallets[0]?.walletAddress
  }, [selectedWallet, filteredWallets])

  useEffect(() => {
    const firstWallet = filteredWallets.find((wallet) => wallet.walletAddress !== excludeWallet)?.walletAddress
    const isSelectedWalletValid = filteredWallets.find((wallet) => wallet.walletAddress === selectedWallet)
    if (!firstWallet || isSelectedWalletValid) return
    // if(!firstWallet) return 
    onWalletChange?.(firstWallet)
  }, [filteredWallets, excludeWallet, selectedWallet, onWalletChange])

  return (
    <Select value={value} onValueChange={onWalletChange}>
      <SelectTrigger className="bg-transparent p-0 border-none shadow-none h-[18px] gap-1 justify-start max-w-[125px] font-[330] text-[12px] text-[#79778C]">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {filteredWallets.map((wallet) => (
            <SelectItem key={wallet.walletAddress} value={wallet.walletAddress}>
              {wallet.name.slice(0, 15) + (wallet.name.length > 15 ? '...' : '')}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default WalletSelect
