import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import SelectTokenPopup, { SelectTokenType } from '@components/assets/overview/SelectTokenPopup.tsx'
import SelectNetworkPopup from '@components/assets/overview/SelectNetworkPopup.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { QRCodeCanvas } from 'qrcode.react'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { usePolymarketSupportedAssets } from '@/modules/prediction/hooks/usePolymarketSupportedAssets.ts'
import { usePolymarketUserDepositAddresses } from '@/modules/prediction/hooks/usePolymarketUserDepositAddresses.ts'
import { useTranslation } from 'react-i18next'
import { useMemo, useState, useEffect } from 'react'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { EnableTradingDialog } from '@/modules/prediction/components/shared/EnableTradingButton'
import { Button } from '@/components/ui/button'
import { DEPOSIT_TUTORIAL_URL, DEPOSIT_TUTORIAL_URL_ZH, DEPOSIT_BRIDGE_URL } from '@/modules/prediction/constants'
import { Loading } from '@/components/common/Loading'
import { IconInfo2, LeftIcon } from '@/components/icon'

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

export const PredictionDepositPage = () => {
  const proxyWallet = useProxyWallet()
  const { data } = usePolymarketSupportedAssets()
  const { data: depositAddresses, isLoading, refetch: refetchDepositAddresses } = usePolymarketUserDepositAddresses()
  const { t, i18n } = useTranslation()
  const tutorialUrl = i18n.language === 'zh' || i18n.language === 'hk' ? DEPOSIT_TUTORIAL_URL_ZH : DEPOSIT_TUTORIAL_URL
  const [isOpen, setIsOpen] = useState(false)

  const [openSelectToken, setOpenSelectToken] = useState(false)
  const [openSelectNetwork, setOpenSelectNetwork] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [selectedChainId, setSelectedChainId] = useState<number>(ChainIds.Polygon)

  useEffect(() => {
    if (proxyWallet) {
      refetchDepositAddresses()
    }
  }, [proxyWallet])

  // Get supported tokens
  const supportedTokens = useMemo(() => {
    if (!data) return []
    const allTokens: Record<string, SelectTokenType> = {}
    data.forEach((asset) => {
      if (!allTokens[asset.token.symbol]) {
        allTokens[asset.token.symbol] = {
          symbol: asset.token.symbol,
          image: getTokenLogo(asset.chainId, asset.token.address),
          name: asset.token.name,
        }
      }
    })
    return Object.values(allTokens)
  }, [data])

  // Get supported networks for selected token
  const supportedNetworks = useMemo(() => {
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
    const deduplicatedNetworks: Record<string, any> = {}
    matchedNetworks.forEach((network) => {
      const chainIdStr = network.chainId.toString()
      if (!deduplicatedNetworks[chainIdStr]) {
        deduplicatedNetworks[chainIdStr] = network
      }
    })
    return Object.values(deduplicatedNetworks)
  }, [data, selectedToken])

  // Initialize selectedToken when supportedTokens changes
  useEffect(() => {
    if (supportedTokens.length > 0 && !selectedToken) {
      const lang = i18n.language
      // Try to select USDC for English, USDT for Chinese
      if (lang === 'zh' || lang === 'hk') {
        const usdtToken = supportedTokens.find((token: any) => token.symbol === 'USDT')
        setSelectedToken(usdtToken ? usdtToken.symbol : supportedTokens[0].symbol)
      } else {
        const usdcToken = supportedTokens.find((token: any) => token.symbol === 'USDC')
        setSelectedToken(usdcToken ? usdcToken.symbol : supportedTokens[0].symbol)
      }
    }
  }, [supportedTokens, selectedToken, i18n.language])

  // Initialize selectedChainId when supportedNetworks changes
  useEffect(() => {
    if (supportedNetworks.length > 0 && selectedChainId === 0) {
      setSelectedChainId(supportedNetworks[0].chainId)
    }
  }, [supportedNetworks, selectedChainId])

  // Get deposit address
  const depositAddress = useMemo(() => {
    if (!depositAddresses) return ''
    const addressEntry = depositAddresses.find((entry) => +entry.chainId === selectedChainId)
    if (addressEntry) return addressEntry.depositAddress
    if (selectedChainId.toString() === SOL_CHAIN_ID.toString()) {
      const solAddress = depositAddresses.find((entry) => entry.chainId === SOL_CHAIN_ID)
      return solAddress?.depositAddress
    }
    // Fallback to ETH address
    const ethEntry = depositAddresses.find((entry) => +entry.chainId === ChainIds.Ethereum)
    return ethEntry ? ethEntry.depositAddress : ''
  }, [selectedChainId, depositAddresses])

  // Get selected chain image
  const selectedChainImage = useMemo(() => {
    const selectedNetwork = supportedNetworks.find((net) => +net.chainId === +selectedChainId)
    return selectedNetwork ? selectedNetwork.chainImage : undefined
  }, [supportedNetworks, selectedChainId])

  // Get minimum deposit amount
  const minDepositUsd = useMemo(() => {
    if (!data) return 0
    const asset = data.find((asset) => asset.token.symbol === selectedToken && +asset.chainId === selectedChainId)
    return asset ? asset.minCheckoutUsd + 1 : 0
  }, [data, selectedToken, selectedChainId])

  const shownAddress = useMemo(() => {
    if (!depositAddress) return ''
    if (selectedChainId.toString() === SOL_CHAIN_ID.toString()) return depositAddress
    return depositAddress.toLowerCase()
  }, [selectedChainId, depositAddress])

  const handleOnSelectToken = (token: string) => {
    setSelectedToken(token)
    const matchedAsset = data?.find((asset) => asset.token.symbol === token)
    // If the currently selected network is not available for the new token, switch to the first available network for that token
    const isCurrentNetworkAvailable = data?.some(
      (asset) => asset.token.symbol === token && +asset.chainId === selectedChainId,
    )
    if (!isCurrentNetworkAvailable && matchedAsset) {
      setSelectedChainId(+matchedAsset.chainId)
    }
  }

  return (
    <div>
      <HeaderWithBack title="Prediction Deposit" className="relative z-20 bg-[#0a0a0a]" />
      <div className="relative p-4">
        <>
          {depositAddress ? (
            <>
              <div className="text-xs font-medium text-[#908E98]">{t('exchange.selectTokenNetwork')}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <SelectTokenPopup
                  open={openSelectToken}
                  setOpen={setOpenSelectToken}
                  tokens={supportedTokens}
                  tokenSelected={selectedToken}
                  onTokenSelected={(token) => handleOnSelectToken(token)}
                />
                <SelectNetworkPopup
                  networks={supportedNetworks}
                  open={openSelectNetwork}
                  setOpen={setOpenSelectNetwork}
                  networkSelected={selectedChainId}
                  onNetworkSelected={(network) => setSelectedChainId(network)}
                />
              </div>
              <div className="mt-6 text-xs font-medium text-[#908E98]">{t('exchange.yourDepositAddress')}</div>
              <div className="mt-3 flex items-center justify-between rounded-[10px] bg-[#18181D] px-4 py-3.5">
                <div className="text-base leading-6 break-all text-white">{shownAddress}</div>
                <CopyButton text={shownAddress} />
              </div>
              <div className="mt-3 text-[12px] leading-4 font-light text-[#71717A]">
                {t('prediction.exchange.minDeposit', { amount: minDepositUsd })}
              </div>
              <div className="mt-6 flex justify-center">
                <div className="relative inline-block rounded-[23px] bg-white p-4">
                  <QRCodeCanvas value={depositAddress || ''} size={142} level="H" marginSize={0} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={selectedChainImage || ''}
                      alt="logo"
                      className="border-[3px] size-9 rounded-xl border-white bg-[#202024] object-contain p-1"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 text-[12px] leading-5 font-light text-[#52526E]">
                {t('prediction.exchange.depositNote')}
              </div>
            </>
          ) : isLoading ? (
            <div className="min-h-32.5 w-full flex justify-center items-center">
              <Loading />
            </div>
          ) : (
            <>
              <div className="text-[#D97706] bg-[#D977061A] border border-[#D97706] rounded-lg px-4 py-3 mt-4">
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
                <div className="text-[#605E68] text-[14px]">KairoX {t('exchange.predictionAddress')}</div>
                <div className="mt-1 flex items-center gap-2 justify-between text-[#FBFBFB] text-[12px]">
                  <div>{proxyWallet}</div>
                  <CopyButton text={proxyWallet} className="cursor-pointer size-4" />
                </div>
              </div>
            </>
          )}
        </>

        {!proxyWallet && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-[2px]">
            <div className="w-[150px]">
              <Button className="w-full rounded-md" variant="gradient" onClick={() => setIsOpen(true)}>
                {t('prediction.enableTrading.btnEnable')}
              </Button>
            </div>
          </div>
        )}
        <EnableTradingDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>
    </div>
  )
}
