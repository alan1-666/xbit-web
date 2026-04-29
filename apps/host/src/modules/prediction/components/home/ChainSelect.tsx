import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect } from 'react'

export interface Chain {
  chainId: string
  chainName: string
}

interface ChainSelectProps {
  value: string
  onValueChange: (value: string) => void
  chains: Chain[]
}

export const ChainSelect = ({ value, onValueChange, chains }: ChainSelectProps) => {
  // Set default to first chain when chains are loaded
  useEffect(() => {
    if (chains.length > 0 && !value) {
      onValueChange(chains[0].chainId)
    }
  }, [chains, value, onValueChange])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">Chain</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          {chains.map((chain) => (
            <SelectItem key={chain.chainId} value={chain.chainId}>
              {chain.chainName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
