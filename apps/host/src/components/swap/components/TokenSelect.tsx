import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { Token } from '../lib/types'
import { useMemo } from 'react'
import { Configs } from '@const/configs.ts'

export interface TokenSelectProps {
  isShowDropDown: boolean
  tokenList: Token[]
  value?: string
  onValueChange?: (value: string) => void
}

export const TokenSelect = (props: TokenSelectProps) => {
  const { isShowDropDown, value, tokenList, onValueChange } = props
  const usdc = useMemo(() => {
    return tokenList.filter((token) => token.symbol.toUpperCase() === 'USDC')?.[0]
  }, [tokenList])

  const coinList = useMemo(() => {
    return tokenList.filter((token) => token.symbol.toUpperCase() !== 'USDC')
  }, [tokenList])

  return isShowDropDown ? (
    <Select defaultValue={Configs.getDefaultTransferToken()} value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-[#79778C29] p-1.5 rounded-full border-none min-w-[90px] max-w-[100px] font-[330] text-[12px] text-[#FBFBFB]">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent className="bg-[#212127]">
        <SelectGroup>
          {coinList.map((token) => (
            <SelectItem key={token.symbol} value={token.symbol}>
              <div className="flex items-center gap-2">
                <img src={token.image} className="w-6 h-6 rounded-full" />
                {token.symbol}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ) : (
    usdc && (
      <div className="pl-1.5 pr-2 py-1.5 rounded-[200px] inline-flex justify-start items-center gap-1.5 bg-[#2F2F37]">
        <div className="flex justify-start items-center gap-1">
          <img className="w-6 h-6 rounded-[133.33px] border-[0.33px]" src={usdc.image} />
          <div className="justify-start text-xs font-normal font-['Geist'] leading-4">{usdc.symbol}</div>
        </div>
      </div>
    )
  )
}

export default TokenSelect
