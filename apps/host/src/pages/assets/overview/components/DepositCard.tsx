import SelectNetwork from '@/components/assets/overview/SelectNetwork'
import SelectToken from '@/components/assets/overview/SelectToken'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES } from '@/utils/helpers.ts'
import { Loading } from '@components/common/Loading.tsx'
import { IconHelp } from '@components/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { AccountTypeSelect } from '@pages/assets/overview/components/AccountTypeSelect.tsx'
import { AddressQR } from '@pages/assets/overview/components/AddressQR.tsx'
import { TokenSelect } from '@pages/assets/overview/components/TokenSelect.tsx'
import { WalletSelect } from '@pages/assets/overview/components/WalletSelect.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ACCOUNT_TYPE } from './AccountTypeSelect'
import { DepositForm } from '@/modules/prediction/components/home/DepositForm.tsx'
import { PERPS_TUTORIAL_URL_ZH, PERPS_TUTORIAL_URL, PERPS_BRIDGE_URL } from '@pages/assets/overview/constants'
import { EnableTradingDialog } from '@/modules/prediction/components/shared/EnableTradingButton.tsx'
import { Button } from '@components/ui/button.tsx'
import { IconInfo2, LeftIcon } from '@components/icon'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { CopyButton } from '@components/common/copy-button.tsx'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'

const getDefaultTokenByChain = (chainId: ChainIds) => {
  switch (chainId) {
    // case ChainIds.Ethereum:
    //   return 'ETH'
    case ChainIds.Bsc:
      return 'BNB'
    // case ChainIds.Arbitrum:
    //   return 'ARB_USDC'
    // case ChainIds.Solana:
    case ChainIds.Mon:
      return 'MON'
    default:
      return 'SOL'
  }
}

const tokenNameMap: Record<string, string> = {
  SOL: 'SOL',
  // USDC: 'USDC',
  // ETH: 'ETH',
  // ARB_ETH: 'ETH',
  // ARB_USDC: 'USDC',
  BNB: 'BNB',
  MON: 'MON',
}

export const MemeDeposit = ({ defaultChainId }: { defaultChainId?: ChainIds }) => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const [token, setToken] = useState(getDefaultTokenByChain(defaultChainId || activeWallet?.chainId || ChainIds.Solana))
  const [wallet, setWallet] = useState('')

  const chain = useMemo(() => {
    if (token === 'SOL') return 'solana'
    if (token === 'BNB') return 'bsc'
    if (token === 'MON') return 'monad'
    // if (token === 'ARB_USDC' || token === 'ARB_ETH') return 'arbitrum'
    return 'solana'
  }, [token])

  useEffect(() => {
    setToken(getDefaultTokenByChain(defaultChainId || activeWallet?.chainId || ChainIds.Solana))
  }, [activeWallet?.chainId, defaultChainId])

  const chainId = useMemo(() => {
    // if (chain === 'ethereum') return ChainIds.Ethereum
    // if (chain === 'arbitrum') return ChainIds.Arbitrum
    if (chain === 'bsc') return ChainIds.Bsc
    if (chain === 'monad') return ChainIds.Mon
    return ChainIds.Solana
  }, [chain])

  const warningMessage = useMemo(() => {
    return t('assets.deposit.warningDeposit', {
      token: tokenNameMap[token],
      network: BLOCKCHAIN_NAMES[chainId],
    })
  }, [chainId, token])

  const logo = useMemo(() => {
    if (token === 'BNB') return '/images/bnb.svg'
    if (token === 'MON') return '/images/icons/chains/ic-monad.svg'
    // if (token === 'ARB_USDC') return '/images/icons/chains/ic-usdc.svg'
    // if (token === 'ARB_ETH') return '/images/icons/chains/ic-ethereum.svg'
    // if (token === 'ETH') return '/images/icons/chains/ic-ethereum.svg'
    return '/images/icons/chains/ic-solana.svg'
  }, [token])

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <TokenSelect value={token} onValueChange={setToken} />
        <WalletSelect chainId={chainId} selectedWallet={wallet} onWalletChange={setWallet} />
      </div>
      {wallet ? <AddressQR title={t('exchange.yourDepositAddress')} address={wallet} logo={logo} /> : null}
      <div className="text-[12px] text-[#52526E] leading-normal">
        {t('exchange.memeDepositNote', {
          network: chainId === ChainIds.Bsc ? 'BNB Chain' : chainId === ChainIds.Mon ? 'Monad' : 'Solana',
        })}
      </div>
      {/* <div className="flex items-center gap-2">
        <img src="/images/icons/danger.svg" alt="danger" className="w-4 h-4" />
        <div className="text-[11px] text-white leading-normal">{warningMessage}</div>
      </div> */}
    </div>
  )
}

export const PerpsDeposit = () => {
  const { i18n, t } = useTranslation()
  const tokensChains = useAppSelector((state) => state.tokensChains)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const perpsDepositAddresses = useAppSelector((state) => state.exchange.perpsDepositAddresses)
  const perpsDepositLoading = useAppSelector((state) => state.exchange.perpsDepositLoading)

  const tutorialUrl = i18n.language === 'zh' || i18n.language === 'hk' ? PERPS_TUTORIAL_URL_ZH : PERPS_TUTORIAL_URL

  const MIN_DEPOSIT_AMOUNT = 3 // 3 USDC

  const supportedTokens = useMemo(() => {
    if (tokensChains?.tokens && tokensChains.tokens.length > 0) {
      return tokensChains.tokens.filter((token: any) => token.symbol !== 'BNB') // Exclude BNB token for now
    }
    return []
  }, [tokensChains?.tokens])
  const [tokenSelected, setTokenSelected] = useState<string>('')
  const [networkSelected, setNetworkSelected] = useState<number | string>(0)

  // Get selected token object
  const selectedToken = useMemo(() => {
    if (tokenSelected && supportedTokens.length > 0) {
      return supportedTokens.find((token: any) => token.symbol === tokenSelected)
    }
    return null
  }, [tokenSelected, supportedTokens])

  // supportedNetworks is chainList of the selected token
  const supportedNetworks = useMemo(() => {
    if (selectedToken?.chainList && selectedToken.chainList.length > 0) {
      return selectedToken.chainList.map((network: any) => ({
        ...network,
        chainName: +network.chainId === ChainIds.Bsc ? 'BNB Chain' : network.chainName,
      }))
    }
    return []
  }, [selectedToken])

  // Update tokenSelected when supportedTokens changes
  useEffect(() => {
    if (supportedTokens.length > 0) {
      const isTokenValid = supportedTokens.some((token: any) => token.symbol === tokenSelected)
      if (!tokenSelected || !isTokenValid) {
        const lang = i18n.language
        if (lang === 'zh' || lang === 'hk') {
          const usdtToken = supportedTokens.find((token: any) => token.symbol === 'USDT')
          setTokenSelected(usdtToken ? usdtToken.symbol : supportedTokens[0].symbol)
        } else {
          const usdcToken = supportedTokens.find((token: any) => token.symbol === 'USDC')
          setTokenSelected(usdcToken ? usdcToken.symbol : supportedTokens[0].symbol)
        }
      }
    }
  }, [supportedTokens, tokenSelected])

  // Update networkSelected when supportedNetworks changes (when tokenSelected changes)
  useEffect(() => {
    if (supportedNetworks.length > 0) {
      const isNetworkValid = supportedNetworks.some((network: any) => network.chainId === networkSelected)
      // Reset network selection if current selection is invalid or when networks change
      if (networkSelected === 0 || !isNetworkValid) {
        // If token is USDC, try to select chain 42161 (Arbitrum) first
        if (tokenSelected === 'USDC') {
          const arbitrumChain = supportedNetworks.find((network: any) => network.chainId == 42161)
          if (arbitrumChain) {
            setNetworkSelected(42161)
          } else {
            setNetworkSelected(supportedNetworks[0].chainId)
          }
        } else if (tokenSelected === 'USDT') {
          // If token is USDT, try to select chain 728126428 (Tron) first
          const tronChain = supportedNetworks.find((network: any) => network.chainId == 728126428)
          const ethereumChain = supportedNetworks.find((network: any) => network.chainId == 1)
          const lang = i18n.language
          if (tronChain && (lang === 'zh' || lang === 'hk')) {
            setNetworkSelected(728126428)
          } else if (ethereumChain) {
            setNetworkSelected(1)
          } else {
            setNetworkSelected(supportedNetworks[0].chainId)
          }
        } else {
          setNetworkSelected(supportedNetworks[0].chainId)
        }
      }
    } else {
      // Reset networkSelected if no networks available
      setNetworkSelected(0)
    }
  }, [supportedNetworks, networkSelected, tokenSelected])

  const tokenSelectedObj = useMemo(() => {
    return supportedTokens.find((token: any) => token.symbol === tokenSelected)
  }, [tokenSelected, supportedTokens])

  const networkSelectedObj = useMemo(() => {
    return tokenSelectedObj?.chainList?.find((network: any) => network.chainId == networkSelected)
  }, [networkSelected, tokenSelectedObj])

  const depositAddress = useMemo(() => {
    const vmType = networkSelectedObj?.vmType
    switch (vmType) {
      case 'svm':
        return perpsDepositAddresses?.depositSolAddress
      case 'bvm':
        return perpsDepositAddresses?.depositBtcAddress
      case 'hypevm':
        return perpsDepositAddresses?.depositAddress
      case 'tvm':
        return perpsDepositAddresses?.depositTvmAddress
      case 'evm':
        return perpsDepositAddresses?.depositAddress
      default:
        return perpsDepositAddresses?.depositAddress
    }
  }, [networkSelectedObj, perpsDepositAddresses])

  return (
    <div className="space-y-3">
      {depositAddress ? (
        <>
          <SelectToken
            tokens={supportedTokens}
            tokenSelected={tokenSelected}
            onTokenSelected={(token) => setTokenSelected(token)}
          />
          <SelectNetwork
            networks={supportedNetworks}
            networkSelected={networkSelected}
            onNetworkSelected={(network) => setNetworkSelected(network)}
          />
          {depositAddress ? (
            <AddressQR
              title={t('exchange.yourDepositAddress')}
              address={depositAddress}
              logo={networkSelectedObj?.chainImage}
              description={
                <span className="text-[12px] text-[#71717A leading-normal">
                  {t('exchange.minPerpsDeposit', {
                    value: MIN_DEPOSIT_AMOUNT,
                  })}
                </span>
              }
            />
          ) : (
            <div className="min-h-[130px] w-full flex justify-center items-center">
              <Loading />
            </div>
          )}
          <div className="text-[12px] text-[#52526E] leading-normal">{t('exchange.perpsDepositNote')}</div>
          <div className="flex items-center justify-between">
            <div className="text-[12px] leading-3 text-[#A1A1AA] flex items-center gap-1">
              {t('exchange.priceImpact')}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconHelp className="size-3 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-4 text-[#908E98]">
                    {t('exchange.priceImpactTooltip')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-[12px] leading-3 text-white">~0.25%</div>
          </div>
        </>
      ) : (
        !perpsDepositLoading ? <>
          <div className="text-[#D97706] bg-[#D977061A] border border-[#D97706] rounded-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <IconInfo2 className="w-4 h-4 min-h-4 min-w-4" />
              <div>
                <div className="text-[16px] font-medium leading-none">{t('exchange.perpsDepositBeingUpgrade')}</div>
                <div className="mt-2 text-[14px] leading-[1.3]">{t('exchange.perpsDepositBeingUpgradeDesc')}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
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
              onClick={() => window.open(PERPS_BRIDGE_URL)}
            >
              {t('exchange.perpsDepositNow')} <LeftIcon className="size-4 inline-block" />
            </Button>
          </div>
          <div className="bg-[#2B2B33] rounded-[8px] py-2.5 px-3">
            <div className="text-[#605E68] text-[14px]">KairoX {t('exchange.perpsAddress')}</div>
            <div className="mt-1 flex items-center gap-2 justify-between text-[#FBFBFB] text-[12px]">
              <div>{EVMAddress}</div>
              <CopyButton text={EVMAddress} className="cursor-pointer size-4" />
            </div>
          </div>
        </> : <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0A0A0A] z-10">
            <Loading />
          </div>
      )}
    </div>
  )
}
export const PredictionDeposit = () => {
  const proxyWallet = useProxyWallet()
  const [isEnableTradingOpen, setIsEnableTradingOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="relative">
      <DepositForm />
      {!proxyWallet && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-[2px] rounded-lg px-8">
          <div className="w-[150px]">
            <Button className="w-full rounded-md" variant="gradient" onClick={() => setIsEnableTradingOpen(true)}>
              {t('prediction.enableTrading.btnEnable')}
            </Button>
          </div>
        </div>
      )}
      <EnableTradingDialog open={isEnableTradingOpen} onOpenChange={setIsEnableTradingOpen} />
    </div>
  )
}

export const DepositCard = ({
  defaultAccountType,
  defaultChainId,
}: {
  defaultAccountType?: ACCOUNT_TYPE
  defaultChainId?: ChainIds
}) => {
  const [currentAccountType, setCurrentAccountType] = useState<ACCOUNT_TYPE>(defaultAccountType || 'CONTRACT')

  return (
    <div className="space-y-3">
      <AccountTypeSelect value={currentAccountType} onValueChange={setCurrentAccountType} />
      {currentAccountType === 'MEME' ? (
        <MemeDeposit defaultChainId={defaultChainId} />
      ) : currentAccountType === 'PREDICTION' ? (
        <TooltipProvider>
          <PredictionDeposit />
        </TooltipProvider>
      ) : (
        <PerpsDeposit />
      )}
    </div>
  )
}
