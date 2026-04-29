import { usePolymarketSupportedAssets } from '@/modules/prediction/hooks/usePolymarketSupportedAssets.ts'
import { useEffect, useMemo, useState } from 'react'
import SelectToken, { Token } from '@components/assets/overview/SelectToken.tsx'
import SelectNetwork, { Network } from '@components/assets/overview/SelectNetwork.tsx'
import { AddressQR } from '@pages/assets/overview/components/AddressQR.tsx'
import { Loading } from '@components/common/Loading.tsx'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { usePolymarketUserDepositAddresses } from '@/modules/prediction/hooks/usePolymarketUserDepositAddresses.ts'
import { useTranslation } from 'react-i18next'
import { useProxyWallet } from '../../hooks/useProxyWallet'
import { Button } from '@/components/ui/button'
import { IconInfo2, LeftIcon } from '@/components/icon'
import { CopyButton } from '@/components/common/copy-button'
import { DEPOSIT_TUTORIAL_URL, DEPOSIT_TUTORIAL_URL_ZH, DEPOSIT_BRIDGE_URL } from '@/modules/prediction/constants'

const getNetworkIconUrl = (chainId: number | string) => {
  const id = Number(chainId)
  let iconUrl = getBlockchainLogo2(id as ChainIds)

  if (id === 1151111081099710) {
    iconUrl = '/images/icons/sol-rounded-new.svg'
  } else if (id === 8253038) {
    iconUrl = 'https://assets.relay.link/icons/8253038/light.png'
  }

  if (iconUrl.includes('undefined')) {
    iconUrl = `https://assets.relay.link/icons/${id}/light.png`
  }
  return iconUrl
}

const normalizeChainId = (chainId: number | string) => {
  const id = Number(chainId)
  if (id === 1151111081099710) return ChainIds.Solana
  if (id === 8253038) return ChainIds.BTC
  return id as ChainIds
}

const getTokenLogo = (chainId: number | string, address: string) => {
  const normalizedChainId = normalizeChainId(chainId)
  if (address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    return getBlockchainLogo2(normalizedChainId)
  }

  if (normalizedChainId === ChainIds.Optimism) {
    if (address === '0x01bFF41798a0BcF287b996046Ca68b395DbC1071') {
      return getBlockChainLogo(ChainIds.Monad, address)
    }
  }

  if (normalizedChainId === ChainIds.Ethereum) {
    if (address === '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf') {
      return 'https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp'
    }
  }
  return getBlockChainLogo(normalizedChainId, address)
}

const TRON_CHAIN_ID = '728126428'
const SOL_CHAIN_ID = '1151111081099710'

export const DepositForm = () => {
  const { data } = usePolymarketSupportedAssets()
  const proxyWallet = useProxyWallet()
  const { data: depositAddresses, isPending: isLoading, refetch: refetchDepositAddresses } = usePolymarketUserDepositAddresses()
  const { t, i18n } = useTranslation()
  const tutorialUrl = i18n.language === 'zh' || i18n.language === 'hk' ? DEPOSIT_TUTORIAL_URL_ZH : DEPOSIT_TUTORIAL_URL

  useEffect(() => {
    if (proxyWallet) {
      refetchDepositAddresses()
    }
  }, [proxyWallet])

  const [selectedToken, setSelectedToken] = useState<string>('USDC')
  const [selectedChainId, setSelectedChainId] = useState<string>('137')

  const tokens = useMemo<Token[]>(() => {
    if (!data) return []
    const allTokens: Record<string, Token> = {}
    data.forEach((asset) => {
      if (!allTokens[asset.token.symbol]) {
        allTokens[asset.token.symbol] = {
          symbol: asset.token.symbol,
          image: getTokenLogo(asset.chainId, asset.token.address),
        }
      }
    })
    return Object.values(allTokens)
  }, [data])

  const networks = useMemo<Network[]>(() => {
    if (!data) return []
    const matchedAssets = data.filter((asset) => asset.token.symbol === selectedToken)
    const matchedNetworks = matchedAssets
      .map((asset) => ({
        chainId: asset.chainId,
        chainName: asset.chainName,
        chainImage: getNetworkIconUrl(asset.chainId),
      }))
      .filter((network) => network.chainId.toString() !== TRON_CHAIN_ID.toString())
    // Deduplicate networks by chainId
    const deduplicatedNetworks: Record<string, Network> = {}
    matchedNetworks.forEach((network) => {
      const chainIdStr = network.chainId.toString()
      if (!deduplicatedNetworks[chainIdStr]) {
        deduplicatedNetworks[chainIdStr] = network
      }
    })
    return Object.values(deduplicatedNetworks)
  }, [data, selectedToken])

  const depositAddress = useMemo(() => {
    if (!depositAddresses) return ''
    const addressEntry = depositAddresses.find((entry) => entry.chainId.toString() === selectedChainId)
    const address = addressEntry ? addressEntry.depositAddress : ''
    if (address) return address
    const evmAddress = depositAddresses.find((entry) => entry.chainId.toString() === '1')
    if (selectedChainId !== '728126428') return evmAddress ? evmAddress.depositAddress : ''
    return ''
  }, [selectedChainId, depositAddresses])

  const selectedChainImage = useMemo(() => {
    const selectedNetwork = networks.find((net) => net.chainId.toString() === selectedChainId)
    return selectedNetwork ? selectedNetwork.chainImage : ''
  }, [networks, selectedChainId])

  const minDepositUsd = useMemo(() => {
    if (!data) return 0
    const asset = data.find(
      (asset) => asset.token.symbol === selectedToken && asset.chainId.toString() === selectedChainId,
    )
    return asset ? asset.minCheckoutUsd + 1 : 0
  }, [data, selectedChainId, selectedToken])

  const shownAddress = useMemo(() => {
    if (!depositAddresses) return ''
    if (selectedChainId.toString() === SOL_CHAIN_ID.toString()) return depositAddress
    return depositAddress.toLowerCase()
  }, [selectedChainId, depositAddresses])

  const handleOnSelectToken = (token: string) => {
    setSelectedToken(token)
    const matchedAsset = data?.find((asset) => asset.token.symbol === token)
    if (matchedAsset) {
      setSelectedChainId(matchedAsset.chainId.toString())
    }
  }

  return (
    <div className="space-y-3">
      {depositAddress ? (
        <>
          <SelectToken
            tokens={tokens}
            tokenSelected={selectedToken}
            onTokenSelected={(token) => handleOnSelectToken(token)}
          />
          <SelectNetwork
            networks={networks}
            networkSelected={selectedChainId}
            onNetworkSelected={(network) => setSelectedChainId(network)}
          />
          <AddressQR
            title={t('prediction.exchange.yourDepositAddress')}
            address={shownAddress}
            logo={selectedChainImage}
            description={
              <span className="text-[12px] text-yellow-500 leading-normal">
                {t('prediction.exchange.minDeposit', { amount: minDepositUsd })}
              </span>
            }
          />
          <div className="text-[12px] text-[#52526E] leading-normal">{t('prediction.exchange.depositNote')}</div>
        </>
      ) : isLoading ? (
        <div className="min-h-32.5 w-full flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div>
          <div className="text-[#D97706] bg-[#D977061A] border border-[#D97706] rounded-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <IconInfo2 className="w-4 h-4 min-h-4 min-w-4" />
              <div>
                <div className="text-[16px] font-medium leading-none">{t('exchange.perpsDepositBeingUpgrade')}</div>
                <div className="mt-2 text-[14px] leading-[1.3]">{t('exchange.perpsDepositBeingUpgradeDesc')}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 mt-3">
            <Button
              variant="outline"
              className="rounded-lg text-white w-[calc(50%-6px)] justify-center border-[#843BEA]"
              onClick={() => window.open(tutorialUrl)}
            >
              {t('exchange.perpsDepositViewTutorial')} <LeftIcon className="size-4 inline-block" />
            </Button>
            <Button
              variant="gradient"
              className="rounded-lg text-white w-[calc(50%-6px)] justify-center"
              onClick={() => window.open(DEPOSIT_BRIDGE_URL)}
            >
              {t('exchange.perpsDepositNow')} <LeftIcon className="size-4 inline-block" />
            </Button>
          </div>
          <div className="bg-[#2B2B33] rounded-[8px] py-2.5 px-3 mt-3">
            <div className="text-[#605E68] text-[14px]">XBIT {t('exchange.predictionAddress')}</div>
            <div className="mt-1 flex items-center gap-2 justify-between text-[#FBFBFB] text-[12px]">
              <div>{proxyWallet}</div>
              <CopyButton text={proxyWallet} className="cursor-pointer size-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
