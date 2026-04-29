import SelectNetwork from '@/components/assets/overview/SelectNetwork'
import SelectToken from '@/components/assets/overview/SelectToken'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { WithdrawFormData } from '../WithdrawForm'
import { useSupportedRelayChains } from '@/modules/prediction/hooks/useSupportedRelayChains.ts'
import { useSupportedRelayAssets } from '@/modules/prediction/hooks/useSupportedRelayAssets.ts'

export const TokenChainSelector = () => {
  const { setValue } = useFormContext<WithdrawFormData>()
  const selectedToken = useWatch<WithdrawFormData, 'token'>({ name: 'token' })
  const selectedChainId = useWatch<WithdrawFormData, 'chainId'>({ name: 'chainId' })

  const { data: allChains } = useSupportedRelayChains()
  const { data: allAssets } = useSupportedRelayAssets()

  const supportedTokens = useMemo(() => {
    if (!allChains || !allAssets) return []
    const tokens = allAssets.map((asset) => ({
      symbol: asset.symbol,
      image: asset.iconUrl || '',
    }))
    // Unique by symbol
    return Array.from(new Map(tokens.map((token) => [token.symbol, token])).values())
  }, [allAssets])

  const supportedNetworks = useMemo(() => {
    if (!allAssets || !allChains) return []
    const chainIds = allAssets.filter((asset) => asset.symbol === selectedToken)
    return allChains
      .filter((chain) => chainIds.some((asset) => asset.chainId === chain.chainId))
      .map((chain) => ({
        chainId: chain.chainId,
        chainName: chain.displayName || chain.name,
        chainImage: chain.iconUrl || '',
      }))
  }, [allAssets, allChains, selectedToken])

  const handleOnTokenSelected = (token: string) => {
    setValue('token', token)
    // Reset chainId when token changes to avoid invalid combination
    const validChainIds = allAssets?.filter((asset) => asset.symbol === token).map((asset) => asset.chainId) || []
    if (!validChainIds.includes(+selectedChainId)) {
      setValue('chainId', validChainIds[0])
    }
  }

  return (
    <div className="relative mt-3 space-y-3">
      <img
        src="/images/icons/icon-withdraw.svg"
        alt="Withdraw"
        className="absolute -top-1.5 left-1/2 size-7 -translate-x-1/2 -translate-y-1/2"
      />
      <SelectToken tokens={supportedTokens} tokenSelected={selectedToken} onTokenSelected={handleOnTokenSelected} />
      <SelectNetwork
        networks={supportedNetworks}
        networkSelected={selectedChainId}
        onNetworkSelected={(chainId) => setValue('chainId', chainId)}
      />
    </div>
  )
}
