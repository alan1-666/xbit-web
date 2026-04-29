import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import SelectNetworkPopup from '@/components/assets/overview/SelectNetworkPopup'
import SelectTokenPopup from '@/components/assets/overview/SelectTokenPopup'
import SecurityCheckModal from '@/components/auth/WalletBackup/SecurityCheckModal.tsx'
import Loader from '@/components/common/Loader'
import { rsvToSignature } from '@/components/swap/lib/helper.ts'
import { useSwapService } from '@/components/transfer/hook/useSwapService.ts'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { isValidAddress } from '@/lib/blockchain'
import { APP_PATH } from '@/lib/constant.ts'
import { formatAmount, formatPercent } from '@/lib/format'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { buildSignableData } from '@/utils/hyperliquidSign/signableData'
import PriceImpactNote from '@components/assets/overview/PriceImpactNote.tsx'
import { Button } from '@components/ui/button.tsx'
import { useTurnkey } from '@turnkey/sdk-react'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { getAddress } from 'ethers'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import { Configs } from '@const/configs.ts'
import { usePrice, useQuote } from '@/hooks/relay'

const PerpsWithdraw = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const swapService = useSwapService()
  const RELAY = Configs.getRelayHost()

  const tokensChains = useAppSelector((state) => state.tokensChains)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const minBridgeUsd = tokensChains?.minBridgeUsd || '3'

  const supportedTokens = useMemo(() => {
    if (tokensChains?.tokens && tokensChains.tokens.length > 0) {
      return tokensChains.tokens.filter((token: any) => token.symbol !== 'BNB') // Exclude BNB token for now
    }
    return []
  }, [tokensChains?.tokens])

  const [openSelectToken, setOpenSelectToken] = useState(false)
  const [openSelectNetwork, setOpenSelectNetwork] = useState(false)
  const [tokenSelected, setTokenSelected] = useState<string>('')
  const [networkSelected, setNetworkSelected] = useState<number>(0)
  const [recipientAddress, setRecipientAddress] = useState<string>('')
  const [inputAmount, setInputAmount] = useState<string>()
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId
  const { withdrawable, positions } = useWebData2()

  const availableToWithdraw = useMemo(() => {
    const maxWithdraw = withdrawable - 1 // 1USDC for hyperliquid withdrawal fee
    if (maxWithdraw > 0) {
      if (positions && positions.length > 0) {
        return maxWithdraw - maxWithdraw * 0.01 // 1% buffer to ensure withdrawable
      }
      return +maxWithdraw
    }
    return 0
  }, [withdrawable, positions])

  // QuoteRelay states
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false)

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

  const originTokenData = useMemo(() => {
    const usdcToken = supportedTokens.find((token: any) => token.symbol === 'USDC')
    return {
      ...usdcToken?.chainList?.find((network: any) => network.chainId == ChainIds.Hyperliquid),
      symbol: usdcToken?.symbol,
      name: usdcToken?.name,
      image: usdcToken?.image,
    }
  }, [supportedTokens])

  const amountToWithdraw = useMemo(() => {
    if (inputAmount === undefined) return 0
    return parseFloat(inputAmount)
  }, [inputAmount])

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

  const errorMessage = useMemo(() => {
    if (!amountToWithdraw || !availableToWithdraw) {
      return undefined
    }
    if (amountToWithdraw < minBridgeUsd) {
      return t('assets.withdrawal.minimalWithdrawableError', {
        amount: minBridgeUsd,
        unit: 'USDC',
      })
    }
    if (amountToWithdraw > availableToWithdraw) {
      return t('assets.withdrawal.insufficientBalance')
    }
    return undefined
  }, [amountToWithdraw, availableToWithdraw, minBridgeUsd])

  useEffect(() => {
    setRecipientAddress('')
  }, [networkSelectedObj])

  const { quoteRelay, isQuoteing } = useQuote({
    user: getAddress(EVMAddress),
    originChainId: originTokenData?.chainId,
    originCurrency: originTokenData?.address,
    destinationChainId: networkSelectedObj?.chainId,
    destinationCurrency: networkSelectedObj?.address,
    amount: new BigNumber(amountToWithdraw || 0)
      .multipliedBy(new BigNumber(10).pow(originTokenData?.decimals || 6))
      .toFixed(0, BigNumber.ROUND_DOWN),
    tradeType: 'EXACT_INPUT',
    recipient: recipientAddress,
  })

  const handleAmountInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9.,]/g, '')
    newValue = newValue.replace(/,/g, '.')
    if (newValue.includes('.')) {
      const parts = newValue.split('.')
      newValue = parts[0] + '.' + parts[1].slice(0, 6) // Limit to 6 decimal places (USDC)
    }
    setInputAmount(newValue)
  }

  const originTokenPrice = usePrice({
    address: originTokenData?.address,
    chainId: originTokenData?.chainId,
  })

  const resetForm = () => {
    setInputAmount('')
    setRecipientAddress('')
  }

  const handleWithdraw = useCallback(async () => {
    if (!indexedDbClient || !subOrgId) {
      console.error('IndexedDbClient or subOrgId is not available')
      return
    }

    logEvent2(ACTIONS.withdraw_click, {
      chain_type: 'Hyperliquid',
    })

    try {
      setIsWithdrawing(true)
      const timeEstimate = quoteRelay?.details?.timeEstimate ? Number(quoteRelay?.details?.timeEstimate) + 3 : 5 // add 3s buffer
      const body = quoteRelay?.steps[0].items[0]?.data?.post.body
      const payload = quoteRelay?.steps[1].items[0]?.data?.action?.parameters
      const signData = { ...quoteRelay?.steps[0].items[0]?.data?.sign }
      signData.message = signData.value
      delete signData.value

      // Sign the payload
      let activity = await indexedDbClient.signRawPayload({
        organizationId: subOrgId,
        signWith: getAddress(EVMAddress),
        payload: JSON.stringify(signData),
        encoding: 'PAYLOAD_ENCODING_EIP712',
        hashFunction: 'HASH_FUNCTION_NO_OP',
      })

      if (!activity) {
        toast.error('Failed to sign withdrawal transaction')
        resetForm()
        return
      }

      const signature = rsvToSignature({ r: activity.r, s: activity.s, v: Number(activity.v) })

      let { data } = await axios.post(`${RELAY}/authorize?signature=${signature}`, body)

      if (data.message === 'Success') {
        const operation = 'sendAsset'
        const { signableData } = await buildSignableData({ operation, payload })
        const activity = await indexedDbClient.signRawPayload({
          organizationId: subOrgId,
          signWith: getAddress(EVMAddress),
          payload: signableData,
          encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
          hashFunction: 'HASH_FUNCTION_KECCAK256',
        })
        if (!activity) {
          toast.error('Failed to sign withdrawal transaction')
          return
        }
        const r = activity.r
        const s = activity.s
        const v = activity.v
        const { data } = await swapService.hyperliquidSendAsset(r, s, Number(v), payload, payload.nonce)
        if (data.status === 'ok') {
          // toast.success(t('assets.overview.fundingHistory.titleWithdrawalSuccess'))
          setIsWithdrawing(false)
          resetForm()
          setTimeout(() => {
            swapService.handleGetSwapStatus(quoteRelay?.steps[1].requestId, '', 1)
          }, timeEstimate * 1000)
        } else {
          // toast.error(t('assets.overview.fundingHistory.titleWithdrawalFailed'))
          setIsWithdrawing(false)
          resetForm()
          setTimeout(() => {
            swapService.handleGetSwapStatus(quoteRelay?.steps[1].requestId, '', 1)
          }, timeEstimate * 1000)
        }
      }
    } catch (error) {
      setIsWithdrawing(false)
      resetForm()
      toast.error(`Error during Hyperliquid withdraw!`)
    }
  }, [indexedDbClient, subOrgId, EVMAddress, swapService, quoteRelay])

  const inValidRecipientAddress = useMemo(() => {
    if (recipientAddress && networkSelectedObj) {
      return !isValidAddress(recipientAddress, networkSelectedObj?.vmType)
    }
    return false
  }, [recipientAddress, networkSelectedObj])

  const onClickBack = () => {
    let previousPath = APP_PATH.ASSETS
    if (location.state?.from) {
      const from = (location.state as any).from
      previousPath += `/${from}`
    }
    navigate(previousPath)
  }

  return (
    <div className="flex h-screen max-h-screen flex-col overflow-hidden bg-[#0A0A0A] pt-16 text-white">
      <div className="fixed top-0 left-0 z-10 flex w-full items-center justify-between bg-[#0A0A0A]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between p-4">
          <div className="w-24">
            <img
              src="/images/icons/arrow-left.svg"
              className="h-6 w-6 cursor-pointer"
              alt="arrow-left"
              onClick={onClickBack}
            />
          </div>
          <div className="flex cursor-pointer items-center gap-1">
            <div className="text-[calc(18rem/16)] leading-6 font-medium">{t('exchange.perpsWithdraw')}</div>
          </div>
          <div className="flex w-24 items-center justify-end">
            {/* <img
              src="/images/icons/fundsRecords.svg"
              className="w-4 h-4 cursor-pointer"
              alt="fundsRecords"
              onClick={() => {
                navigate(APP_PATH.ASSETS + `?page=overview?tab=funds`)
              }}
            /> */}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-[#908E98]">{t('exchange.selectTokenNetwork')}</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SelectTokenPopup
            open={openSelectToken}
            setOpen={setOpenSelectToken}
            tokens={supportedTokens}
            tokenSelected={tokenSelected}
            onTokenSelected={(token) => setTokenSelected(token)}
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
            <input
              className="w-full border-r border-r-[#25242B] pr-2 text-[14px] leading-[150%] text-white placeholder:text-[#5C5C66]"
              placeholder="0.0"
              inputMode="decimal"
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
              {formatAmount(amountToWithdraw ? amountToWithdraw * Number(originTokenPrice) : 0, {
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
                  {quoteRelay?.details?.currencyOut?.amountFormatted ? '≈ ' : ''}
                  {formatAmount(quoteRelay?.details?.currencyOut?.amountFormatted, {
                    roundMode: 'floor',
                    unit: tokenSelected,
                  })}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[#908E98]">
              {t('exchange.priceImpact')} <PriceImpactNote />
            </div>
            <div className="text-white">
              {isQuoteing ? <Loader /> : `${quoteRelay?.details?.totalImpact?.percent ?? 0}%`}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Button
            variant="gradient"
            className="w-full rounded-full"
            disabled={
              !amountToWithdraw ||
              amountToWithdraw > availableToWithdraw ||
              !recipientAddress ||
              !!errorMessage ||
              isQuoteing ||
              isWithdrawing ||
              !quoteRelay?.steps ||
              inValidRecipientAddress
            }
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
        onVerifyWallet={() => {
          setShowSecurityModal(false)
          handleWithdraw()
        }}
      />
    </div>
  )
}

export default PerpsWithdraw
