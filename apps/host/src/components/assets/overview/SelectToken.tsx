import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'

export interface Token {
  symbol: string
  image: string
}

type Props = {
  tokens: Token[]
  tokenSelected: string
  onTokenSelected: (token: string) => void
}

const SelectToken = ({ tokens, tokenSelected, onTokenSelected }: Props) => {
  return (
    <Select defaultValue="USDC" value={tokenSelected} onValueChange={onTokenSelected}>
      <SelectTrigger className="border border-[#79778C29] rounded-[8px] px-3 py-2 h-10">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent className="max-h-[30vh] min-h-[230px] bg-[#212127] border border-[#58576029]">
        <SelectGroup>
          {tokens.map((token) => (
            <SelectItem key={token.symbol} value={token.symbol}>
              <div className="flex items-center gap-2">
                <LogoWithChain logo={token.image} logoClassName="size-6 min-w-6 rounded-full" name={token.symbol} />
                {token.symbol}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default SelectToken
