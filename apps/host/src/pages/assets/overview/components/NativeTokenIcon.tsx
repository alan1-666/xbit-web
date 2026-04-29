import { getBlockchainLogo2 } from '@/utils/helpers'
import ChainCurrencyIcon, { ChainCurrencyIconProps } from '@components/common/ChainCurrencyIcon.tsx'
import { useNativeTokenIcon } from '../hooks/useNativeTokenIcon'

export interface NativeTokenIconProps extends Omit<ChainCurrencyIconProps, 'currencyIcon'> {
  address: string
  chainId: number
  fallbackUrl: string
  avatarClassName?: string
  avatarImageClassName?: string
  fallbackClassName?: string
}

export const NativeTokenIcon = (props: NativeTokenIconProps) => {
  const { address, fallbackUrl, chainId, avatarClassName, avatarImageClassName, fallbackClassName, ...rest } = props
  const logoUrl = useNativeTokenIcon({
    address,
    chainId,
    fallbackUrl,
  })
  return (
    <ChainCurrencyIcon
      currencyIcon={logoUrl}
      {...rest}
      chainIcon={getBlockchainLogo2(chainId)}
      avatarClassName={avatarClassName}
      avatarImageClassName={avatarImageClassName}
      fallbackClassName={fallbackClassName}
    />
  )
}
