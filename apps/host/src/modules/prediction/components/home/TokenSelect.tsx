import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SupportedAsset } from '@/@generated/gql/graphql-xpUser'
import { useEffect } from 'react'

interface TokenSelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  assets: SupportedAsset[]
}

export const TokenSelect = ({ value, onValueChange, disabled, assets }: TokenSelectProps) => {
  // Set default to first token when assets are loaded
  useEffect(() => {
    if (assets.length > 0 && !value) {
      onValueChange(assets[0].token.symbol)
    }
  }, [assets, value, onValueChange])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">Token</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select token" />
        </SelectTrigger>
        <SelectContent>
          {assets.map((asset) => (
            <SelectItem key={asset.token.symbol} value={asset.token.symbol}>
              {asset.token.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
