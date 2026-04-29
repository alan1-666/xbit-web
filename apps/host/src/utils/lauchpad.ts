import { BscDexOptions, DexInfo, LaunchPlatformOptions } from '@/lib/constant.ts'

export const getDexLogo = (value: string) => {
  const platform = getDex(value)
  return platform?.icon
}

export const getDex = (value: string): DexInfo | undefined => {
  if (value === 'Meteora DAMM V2' || value === 'Meteora_DAMM_V2') {
    return {
      value: 'Meteora DAMM V2',
      label: 'Meteora DAMM V2',
      icon: '/images/icons/meteora.svg',
    }
  }

 if (value === 'Nadfun') {
    return {
      value: 'Nadfun',
      label: 'Nadfun',
      icon: '/images/icons/dex/nadfun.webp',
    }
  }

  if (value === 'PancakeSwapV3' || value === 'PancakeSwapV2') {
    return {
      value: 'PancakeSwap',
      label: 'PancakeSwap',
      icon: '/images/icons/dex/pancakeswap.svg',
      isLaunchpad: false,
    }
  }

  // Check for BSC chain
  const bscDex = BscDexOptions.find((item) => item.value.toLowerCase() === value.toLowerCase())
  if (bscDex) {
    return bscDex
  }

  // Check for other chains
  return LaunchPlatformOptions.find((item) => item.value.toLowerCase().split(',').includes(value.toLowerCase()))
}
