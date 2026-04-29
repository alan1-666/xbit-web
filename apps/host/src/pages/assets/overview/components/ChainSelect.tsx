import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'

export interface ChainSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  onlyMeme?: boolean
}

export const ChainSelect = (props: ChainSelectProps) => {
  const { value, onValueChange, onlyMeme } = props
  
  const getSelectedLabel = (val: string) => {
    const labels: Record<string, string> = {
      solana: 'SOL',
      bsc: 'BNB',
      arbitrum: 'Arbitrum',
      ethereum: 'Ethereum',
      monad: 'Monad',
    }
    return labels[val] || val
  }

  return (
    <Select defaultValue="solana" value={value} onValueChange={onValueChange}>
      <SelectTrigger className="border border-[#79778C29] rounded-[8px] px-3 py-2.5 h-10">
        <SelectValue placeholder="Select network">
          {value && (
            <div className="flex items-center gap-2 pr-2">
              {value === 'solana' && (
                <div className="size-6 flex items-center justify-center bg-black rounded-full">
                  <img src="/images/icons/chains/ic-solana.svg" className="size-3.5" alt="" />
                </div>
              )}
              {value === 'bsc' && (
                <img src="/images/bsc.svg" className="size-6 rounded-full" alt="" />
              )}
              {value === 'arbitrum' && (
                <img src="/images/icons/chains/ic-arbitrum.svg" className="size-6 rounded-full" alt="" />
              )}
              {value === 'ethereum' && (
                <img src="/images/icons/chains/ic-ethereum.svg" className="size-6 rounded-full" alt="" />
              )}
              {
                value === 'monad' && (
                  <img src="/images/icons/chains/ic-monad.svg" className="size-6 rounded-full" alt="" />
                )
              }
              <span>{getSelectedLabel(value)}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="solana">
            <div className="flex items-center gap-2">
              <div className="size-6 flex items-center justify-center bg-black rounded-full">
                <img src="/images/icons/chains/ic-solana.svg" className="size-3.5" alt="" />
              </div>
              Solana
            </div>
          </SelectItem>
          <SelectItem value="bsc">
            <div className="flex items-center gap-2">
              <img src="/images/bsc.svg" className="size-6 rounded-full" alt="" />
              BNB Chain
            </div>
          </SelectItem>
          <SelectItem value="monad">
            <div className="flex items-center gap-2">
              <img src="/images/icons/chains/ic-monad.svg" className="size-6 rounded-full" alt="" />
              Monad
            </div>
          </SelectItem>
          {!onlyMeme && (
            <>
              <SelectItem value="arbitrum">
                <div className="flex items-center gap-2">
                  <img src="/images/icons/chains/ic-arbitrum.svg" className="size-6 rounded-full" alt="" />
                  Arbitrum
                </div>
              </SelectItem>
              <SelectItem value="ethereum">
                <div className="flex items-center gap-2">
                  <img src="/images/icons/chains/ic-ethereum.svg" className="size-6 rounded-full" alt="" />
                  Ethereum
                </div>
              </SelectItem>
            </>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}