import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { BLOCKCHAIN_NAMES, getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { ChainIds } from '@/types/enums.ts'

export interface TokenSelectProps {
  value?: string
  onValueChange?: (value: string) => void
}

export const TokenSelect = (props: TokenSelectProps) => {
  const { value, onValueChange } = props
  return (
    <Select defaultValue="SOL" value={value} onValueChange={onValueChange}>
      <SelectTrigger className="border border-[#79778C29] rounded-[8px] px-3 py-2.5 h-10">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectItem value="ARB_USDC">
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo="/images/icons/chains/ic-usdc.svg"
                chainLogo={getBlockchainLogo2(ChainIds.Arbitrum)}
                logoClassName="size-6 min-w-6 rounded-full"
                name={BLOCKCHAIN_NAMES[ChainIds.Arbitrum]}
              />
              USDC
            </div>
          </SelectItem> */}
          <SelectItem value="SOL">
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo={getBlockchainLogo2(ChainIds.Solana)}
                chainLogo={getBlockchainLogo2(ChainIds.Solana)}
                logoClassName="size-6 min-w-6 rounded-full"
                name={BLOCKCHAIN_NAMES[ChainIds.Solana]}
              />
              SOL
            </div>
          </SelectItem>
          {/* <SelectItem value="ARB_ETH">
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo="/images/icons/chains/ic-ethereum.svg"
                chainLogo={getBlockchainLogo2(ChainIds.Arbitrum)}
                logoClassName="size-6 min-w-6 rounded-full"
                name={BLOCKCHAIN_NAMES[ChainIds.Arbitrum]}
              />
              ETH
            </div>
          </SelectItem>
          <SelectItem value="ETH">
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo="/images/icons/chains/ic-ethereum.svg"
                chainLogo={getBlockchainLogo2(ChainIds.Ethereum)}
                logoClassName="size-6 min-w-6 rounded-full"
                name={BLOCKCHAIN_NAMES[ChainIds.Ethereum]}
              />
              ETH
            </div>
          </SelectItem> */}
          <SelectItem value="BNB">
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo="/images/bnb.svg"
                chainLogo={getBlockchainLogo2(ChainIds.Bsc)}
                logoClassName="size-6 min-w-6 rounded-full"
                name={BLOCKCHAIN_NAMES[ChainIds.Bsc]}
              />
              BNB
            </div>
          </SelectItem>
           <SelectItem value="MON">
            <div className="flex items-center gap-2">
              <LogoWithChain
                logo="/images/icons/chains/ic-monad.svg"
                chainLogo={getBlockchainLogo2(ChainIds.Mon)}
                logoClassName="size-6 min-w-6 rounded-full"
                name={BLOCKCHAIN_NAMES[ChainIds.Mon]}
              />
              MON
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
