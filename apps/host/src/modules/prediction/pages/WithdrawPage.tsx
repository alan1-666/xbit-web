import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import SelectTokenPopup, { SelectTokenType } from '@components/assets/overview/SelectTokenPopup.tsx'
import SelectNetworkPopup from '@components/assets/overview/SelectNetworkPopup.tsx'
import { formatAmount, formatPercent } from '@/lib/format.ts'
import Loader from '@components/common/Loader.tsx'
import PriceImpactNote from '@components/assets/overview/PriceImpactNote.tsx'
import { Button } from '@components/ui/button.tsx'
import SecurityCheckModal from '@components/auth/WalletBackup/SecurityCheckModal.tsx'
import { useTranslation } from 'react-i18next'
import { useMemo, useEffect, useState } from 'react'
import { useSupportedRelayAssets } from '@/modules/prediction/hooks/useSupportedRelayAssets'
import { useSupportedRelayChains } from '@/modules/prediction/hooks/useSupportedRelayChains'
import { useWithdrawQuote } from '@/modules/prediction/hooks/useWithdrawQuote'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance'
import { useWithdrawCrossChain } from '@/modules/prediction/hooks/useWithdrawCrossChain'
import { toast } from 'sonner'
import { NumericFormat } from 'react-number-format'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet'
import { EnableTradingDialog } from '@/modules/prediction/components/shared/EnableTradingButton'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const minBridgeUsd = '0'

export const PredictionWithdrawPage = () => {
  const { t } = useTranslation()
  const proxyWallet = useProxyWallet()
  const { data: assets = [] } = useSupportedRelayAssets()
  const { data: chains = [] } = useSupportedRelayChains()

  // State management
  const [openSelectToken, setOpenSelectToken] = useState(false)
  const [openSelectNetwork, setOpenSelectNetwork] = useState(false)
  const [tokenSelected, setTokenSelected] = useState<string>('USDC')
  const [networkSelected, setNetworkSelected] = useState<number>(137)
  const [inputAmount, setInputAmount] = useState<string>('')
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Get available USDC balance
  const { data: availableToWithdraw = 0 } = useMyUSDCBalance()

  // Debounce values
  const debouncedAmount = useDebounce(inputAmount, 300)
  const debouncedRecipientAddress = useDebounce(recipientAddress, 300)
  const debouncedChainId = useDebounce(networkSelected, 300)

  // Build token map from supported relay assets
  const supportedTokens = useMemo<SelectTokenType[]>(() => {
    if (!assets) return []
    const tokens = assets.map((asset) => ({
      symbol: asset.symbol,
      image: asset.iconUrl || '',
      name: asset.name || '',
    }))
    // Unique by symbol
    return Array.from(new Map(tokens.map((token) => [token.symbol, token])).values())
  }, [assets])

  const supportedNetworks = useMemo(() => {
    if (!assets || !chains) return []
    const chainIds = assets.filter((asset) => asset.symbol === tokenSelected).map((asset) => asset.chainId)
    return chains
      .filter((chain) => chainIds.includes(chain.chainId))
      .map((chain) => ({
        chainId: chain.chainId,
        chainName: chain.displayName || chain.name,
        chainImage: chain.iconUrl || '',
      }))
  }, [chains, assets, tokenSelected])

  const networkSelectedObj = useMemo(() => {
    return supportedNetworks.find((network) => network.chainId.toString() === networkSelected.toString())
  }, [networkSelected, supportedNetworks])

  const selectedTokenInfo = useMemo(() => {
    if (!assets) return undefined
    return assets.find((asset) => asset.symbol === tokenSelected && asset.chainId === networkSelected)
  }, [assets, networkSelected, tokenSelected])

  const amountToWithdraw = useMemo(() => {
    if (!debouncedAmount) return 0
    return parseFloat(debouncedAmount)
  }, [debouncedAmount])

  // Fetch withdraw quote
  const { data: quoteRelay, isLoading: isQuoteing } = useWithdrawQuote({
    amount: debouncedAmount || '0',
    fromChainId: 137, // Polygon chain ID for Polymarket
    toChainId: Number(debouncedChainId) || 0,
    toAddress: debouncedRecipientAddress || '',
    toTokenAddress: selectedTokenInfo?.address,
    enabled: !!debouncedAmount && !!debouncedRecipientAddress && !!debouncedChainId,
  })

  // Validation
  const errorMessage = useMemo(() => {
    if (!amountToWithdraw || !availableToWithdraw) {
      return undefined
    }
    if (amountToWithdraw < parseFloat(minBridgeUsd)) {
      return t('assets.withdrawal.minimalWithdrawableError', {
        amount: minBridgeUsd,
        unit: 'USDC',
      })
    }
    if (amountToWithdraw > availableToWithdraw) {
      return t('assets.withdrawal.insufficientBalance')
    }
    return undefined
  }, [amountToWithdraw, availableToWithdraw, t])

  const inValidRecipientAddress = useMemo(() => {
    if (recipientAddress && networkSelectedObj) {
      const chainId = networkSelectedObj.chainId

      // Solana chain ID
      if (chainId === 792703809) {
        // Validate Solana address format (Base58 string, typically 32-44 characters)
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
        const isValid = solanaAddressRegex.test(recipientAddress)
        if (!isValid) {
          return true
        }
      } else {
        // EVM chains - Validate EVM address format (0x followed by 40 hex characters)
        const isValid = /^0x[a-fA-F0-9]{40}$/.test(recipientAddress)
        if (!isValid) {
          return true
        }
      }
    }
    return false
  }, [recipientAddress, networkSelectedObj])

  const priceImpact = useMemo(() => {
    if (!quoteRelay) return undefined
    const estTotalUsd = +quoteRelay.estTotalUsd
    const estTotalFromAmount = +quoteRelay.estTotalFromAmount
    return 1 - estTotalUsd / estTotalFromAmount
  }, [quoteRelay])

  // Withdraw mutation
  const { mutate: withdrawCrossChain, isPending: isWithdrawing } = useWithdrawCrossChain()

  const handleWithdraw = () => {
    if (!quoteRelay?.quoteId) {
      console.error('No quote available')
      return
    }

    withdrawCrossChain(
      {
        quoteId: quoteRelay.quoteId,
        destinationAddress: recipientAddress || '',
      },
      {
        onSuccess: (data) => {
          console.log('Withdraw success:', data)
          toast.success(t('withdrawal.modal.success', { token: tokenSelected }))
          setInputAmount('')
          setRecipientAddress('')
          setShowSecurityModal(false)
        },
        onError: (error) => {
          console.error('Withdraw failed:', error)
          toast.error(error.message || t('assets.withdrawal.unknownError'))
        },
      },
    )
  }

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(e.target.value)
  }

  const handleSelectToken = (token: string) => {
    setTokenSelected(token)

    // Reset network selection when token changes
    const matchedAssets = assets.filter((asset) => asset.symbol === token)
    const matchedNetworkIds = matchedAssets.map((asset) => asset.chainId.toString())
    if (!matchedNetworkIds.includes(networkSelected.toString())) {
      setNetworkSelected(Number(matchedNetworkIds[0]) || 0)
    }
  }

  const isSubmitDisabled =
    !amountToWithdraw ||
    !recipientAddress ||
    !!errorMessage ||
    isQuoteing ||
    !quoteRelay?.quoteId ||
    isWithdrawing ||
    inValidRecipientAddress

  return (
    <div>
      <HeaderWithBack title="Prediction Withdraw" className="relative z-20 bg-[#0a0a0a]" />
      <div className="relative p-4">
        <div className="text-xs font-medium text-[#908E98]">{t('exchange.selectTokenNetwork')}</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SelectTokenPopup
            open={openSelectToken}
            setOpen={setOpenSelectToken}
            tokens={supportedTokens}
            tokenSelected={tokenSelected}
            onTokenSelected={(token) => handleSelectToken(token)}
          />
          <SelectNetworkPopup
            networks={supportedNetworks}
            open={openSelectNetwork}
            setOpen={setOpenSelectNetwork}
            networkSelected={networkSelected}
            onNetworkSelected={(network) => setNetworkSelected(network)}
          />
        </div>

        <div className="mt-6.5">
          <div className="text-xs font-medium text-[#908E98]">{t('exchange.recipientAddress')}</div>
          <input
            type="text"
            className="mt-3 w-full rounded-[10px] bg-[#18181D] p-3.5 text-[14px] leading-[150%] text-white placeholder:text-[#5C5C66]"
            placeholder={t('assets.withdrawal.inputAddress')}
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          {inValidRecipientAddress && (
            <div className="mt-2 text-[12px] leading-none font-normal text-[#FF353C]">
              {t('assets.withdrawal.invalidAddress')}
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-[#908E98]">{t('exchange.amount')}</div>
            <div className="text-xs font-medium text-[#908E98]">
              {t('exchange.availableBalance')}:
              <span className="text-white">
                {' '}
                {formatAmount(availableToWithdraw ? availableToWithdraw : 0, {
                  roundMode: 'floor',
                  unit: 'USDC',
                })}
              </span>
            </div>
          </div>
          <div className="mt-3 flex w-full items-center justify-between gap-2 rounded-[10px] bg-[#18181D] p-3.5">
            <NumericFormat
              inputMode="decimal"
              className="w-full border-r border-r-[#25242B] pr-2 text-[14px] leading-[150%] text-white placeholder:text-[#5C5C66]"
              placeholder="0.0"
              onChange={handleAmountInputChange}
              value={inputAmount}
            />
            <span
              className="cursor-pointer text-[13px] font-medium whitespace-nowrap text-[#C8A7FD] uppercase"
              onClick={() => {
                const maxAmount = availableToWithdraw ? availableToWithdraw : '0'
                setInputAmount(maxAmount.toString())
              }}
            >
              {t('assets.transfers.max')}
            </span>
          </div>

          {errorMessage ? (
            <div className="mt-3 text-[12px] leading-[20%] text-[#FF353C]">{errorMessage}</div>
          ) : (
            <div className="mt-3 text-[12px] leading-[20%] text-[#52526E]">
              ≈{' '}
              {formatAmount(amountToWithdraw ? amountToWithdraw : 0, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3 text-[12px] leading-3 font-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#908E98]">{t('exchange.estAmount')}</div>
            <div className="text-white">
              {isQuoteing ? (
                <Loader />
              ) : (
                <>
                  {quoteRelay?.finalToAmountBaseUnit ? '≈ ' : ''}
                  {formatAmount(
                    quoteRelay?.finalToAmountBaseUnit
                      ? Number(quoteRelay.finalToAmountBaseUnit) / Math.pow(10, selectedTokenInfo?.decimals || 6)
                      : 0,
                    {
                      roundMode: 'floor',
                      unit: tokenSelected,
                    },
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#908E98]">
              {t('exchange.priceImpact')} <PriceImpactNote />
            </div>
            <div className="text-white">{isQuoteing ? <Loader /> : formatPercent(priceImpact)}</div>
          </div>
        </div>

        <div className="mt-10">
          <Button
            variant="gradient"
            className="w-full rounded-full"
            disabled={isSubmitDisabled}
            onClick={() => setShowSecurityModal(true)}
            isLoading={isWithdrawing}
          >
            {t('button.confirm')}
          </Button>
        </div>
      </div>
      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        type="verifyAuth"
        onVerifyWallet={() => {
          handleWithdraw()
        }}
      />
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
  )
}
