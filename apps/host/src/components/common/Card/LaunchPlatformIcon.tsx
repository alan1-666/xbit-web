import { BscDexOptions, LaunchPlatformOptions, MonDexOptions } from '@/lib/constant'
import { cn } from '@/lib/utils.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { ChainIds } from '@/types/enums.ts'
import { useMemo } from 'react'

type LaunchPlatformIconProps = {
  value: string
  className?: string
  chainId?: number
}

const ICON_OVERRIDES: Record<string, string> = {
  'Meteora DAMM v2': '/images/icons/meteora.svg',
  Meteora_DAMM_V2: '/images/icons/meteora.svg',
  'Meteora DAMM v3': '/images/icons/meteora.svg',
  Meteora_DAMM_v2: '/images/icons/meteora.svg',
  PancakeSwapV2: '/images/icons/dex/pancakeswap.svg',
  PancakeSwapV3: '/images/icons/dex/pancakeswap.svg',
}

export default function LaunchPlatformIcon({ value, className, chainId = ChainIds.Solana }: LaunchPlatformIconProps) {
  const icon = useMemo(() => {
    if (ICON_OVERRIDES[value]) return ICON_OVERRIDES[value]

    const mergedOptions = Array.from(
      new Map([...LaunchPlatformOptions, ...BscDexOptions, ...MonDexOptions].map((item) => [item.value, item])).values(),
    )

    return mergedOptions.find((item) => item?.value === value || item?.alternativeValue === value)?.icon
  }, [value, chainId])

  return icon ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <img src={icon} alt="dex icon" className={cn('size-3', className)} />
        </TooltipTrigger>
        {value && (
          <TooltipContent>
            <span className="text-[13px] text-white leading-[1] font-light">{value}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  ) : (
    <></>
  )
}
