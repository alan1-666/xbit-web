import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { useAppSelector } from '@/redux/store'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useEffect, useMemo } from 'react'
import { ChainIds } from '@/types/enums.ts'

export interface WalletSelectProps {
  chainId: number
  selectedWallet?: string
  onWalletChange?: (walletAddress: string) => void
}

export const WalletSelect = (props: WalletSelectProps) => {
  const { chainId, selectedWallet, onWalletChange } = props
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
    const firstWallet = filteredWallets?.[0]?.walletAddress
    if (!firstWallet) return
    onWalletChange?.(firstWallet)
  }, [filteredWallets])

  return (
    <Select value={value} onValueChange={onWalletChange}>
      <SelectTrigger className="border border-[#79778C29] rounded-[8px] px-3 py-2.5 h-10">
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
