import { ChainOption } from './types'
import { cn } from '@/lib/utils.ts'

/**
 * Props for the ChainSelector component
 */
interface ChainSelectorProps {
  options: ChainOption[]
  selectedChainId: number
  onSelect: (chainId: number) => void
}

/**
 * Component for selecting blockchain networks
 */
const ChainSelector = ({ options, selectedChainId, onSelect }: ChainSelectorProps) => {
  return (
    <div className="flex flex-row gap-2 mt-2 text-sm font-[350]">
      {options.map((chain) => (
        <button
          key={chain.id}
          className={cn(
            'rounded-full bg-[#35333C] py-1.5 pl-2 pr-[14px] inline-flex items-center gap-1',
            selectedChainId === chain.chainId
              ? 'border-gradient bg-[#FFFFFF14]'
              : 'border-1 border-transparent bg-[#FFFFFF14]',
          )}
          onClick={() => onSelect(chain.chainId)}
        >
          <img src={chain.image} alt={chain.name} className="w-[18px] h-[18px] rounded-full" />
          {chain.name}
        </button>
      ))}
    </div>
  )
}

export default ChainSelector
