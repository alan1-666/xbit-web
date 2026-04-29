import { useState, useEffect, useMemo } from 'react'
import { useTransferContext } from '../context/TransferContext'
import { useSwapService } from '../hook/useSwapService'
import { fixBigNumber, MathFun } from '@/lib/utils'
import { useAppSelector } from '@/redux/store'
import { Token } from '../types/ExchangeMeta'
import { TransactionData } from '../types/TransactionData'
import { TRANSFER_CONFIG } from '../constants'
import { formatNumberWithCommas } from '@/utils/helpers'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { parseEther } from 'ethers'
import { useSendTransaction } from './useSendTransaction'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { ACCOUNT_TYPE } from '../lib/enum'
import { BUTTON_TEXT_KEY, useMultiLanguageText } from './useMultiLanguageText'
import { limitDecimalNumber } from '../lib/helper'

export type TransferFormState = {
  fromAccountType: ACCOUNT_TYPE
  fromAmount: string | null
  fromAvailableBalance: string
  fromDisplayedAvailableBalance: string
  selectedFromToken: Token | null
  selectedFromAddress: string

  toAccountType: ACCOUNT_TYPE
  toAmount: string | null
  toAvailableBalance: string
  toDisplayedAvailableBalance: string
  selectedToToken: Token | null
  selectedToAddress: string

  error: string | null
  warning: string
  isTokenDrawerOpen: boolean
  isRouteDrawerOpen: boolean
  isLoading: boolean
  isFrom: boolean
  amountPrice: number // from token price

  transactionData?: TransactionData
  swapRate?: string
  estimatedFee?: string // used for non cross chain
  estimatedTime?: number
  noArbEth: boolean
  enableSwap: boolean
  isQuoteing: boolean
  buttonText: BUTTON_TEXT_KEY
}

export const useTransferForm = (initialFromAccountType?: ACCOUNT_TYPE, initialToAccountType?: ACCOUNT_TYPE) => {
  const { t } = useTranslation()
  const { tokens, hyperliquidWithdrawable } = useTransferContext()
  const swapService = useSwapService()
  const { checkIfNewSolAccountAndGetRent, buildSolTransaction, solTransferEstimatedFee } = useSendTransaction()

  const { BUTTON_TEXT } = useMultiLanguageText()

  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const solanaWallets = useAppSelector((state) => state.newWallet.listWalletsByChain).filter(
    (wallet) => wallet.chain.toUpperCase() === 'SOLANA',
  )
  const [address, setAddress] = useState<`0x${string}`>(EVMAddress)
  const { withdrawable: available } = useWebData2() // hyperliquid withdrawable udsc balance

  const usdcToken = tokens?.filter((t) => t.symbol.toUpperCase() === 'USDC')[0]
  const arbEthCoin = tokens?.filter(
    (t) => t.chainName?.toUpperCase() === 'ARBITRUM' && t.symbol.toUpperCase() === 'ETH',
  )[0]

  const [formState, setFormState] = useState<TransferFormState>({
    fromAccountType: initialFromAccountType || ACCOUNT_TYPE.MEME,
    fromAmount: '',
    fromAvailableBalance: '',
    fromDisplayedAvailableBalance: '',
    selectedFromToken: null,
    selectedFromAddress: address,

    toAccountType: initialToAccountType || ACCOUNT_TYPE.MEME,
    toAmount: null,
    toAvailableBalance: '0',
    toDisplayedAvailableBalance: '0',
    selectedToToken: null,
    selectedToAddress: address,

    error: null,
    warning: '',
    isTokenDrawerOpen: false,
    isRouteDrawerOpen: false,
    isLoading: false,
    isFrom: true,
    amountPrice: 0,
    transactionData: undefined,
    swapRate: undefined,
    noArbEth: false,
    enableSwap: false,
    estimatedTime: undefined,
    estimatedFee: undefined,
    isQuoteing: false,
    buttonText: BUTTON_TEXT.Default,
  })

  const [isAvailableNumber, setIsAvailableNumber] = useState(false)

  const updateFormState = (updates: Partial<TransferFormState>) => {
    setFormState((current) => ({ ...current, ...updates }))
  }

  const resetFormState = async () => {
    const defaultFromToken = tokens
      ? tokens.filter((t) => t.chainName?.toUpperCase() === 'ARBITRUM' && t.symbol.toUpperCase() === 'ETH')[0]
      : null
    const defaultToToken = tokens ? usdcToken : null
    const availableFromBalance = defaultFromToken ? `${defaultFromToken.balance}` : '0'
    const fromDisplayedAvailableBalance = `${fixBigNumber(availableFromBalance || '0', defaultFromToken ? (defaultFromToken.szDecimals ? defaultFromToken.szDecimals : defaultFromToken.decimals) : 4)}`
    const availableToBalance = defaultToToken ? `${defaultToToken.balance}` : '0'
    const toDisplayedAvailableBalance = `${fixBigNumber(availableToBalance || '0', defaultToToken ? (defaultToToken.szDecimals ? defaultToToken.szDecimals : defaultToToken.decimals) : 4)}`

    updateFormState({
      fromAccountType: ACCOUNT_TYPE.MEME,
      fromAmount: '',
      fromAvailableBalance: availableFromBalance,
      fromDisplayedAvailableBalance: fromDisplayedAvailableBalance,
      selectedFromToken: defaultFromToken,
      selectedFromAddress: EVMAddress,

      toAccountType: ACCOUNT_TYPE.MEME,
      toAmount: null,
      toAvailableBalance: availableToBalance,
      toDisplayedAvailableBalance: toDisplayedAvailableBalance,
      selectedToToken: defaultToToken,
      selectedToAddress: EVMAddress,

      error: null,
      isTokenDrawerOpen: false,
      isRouteDrawerOpen: false,
      isLoading: false,
      isFrom: true,
      amountPrice: 0,

      transactionData: undefined,
      swapRate: undefined,
      noArbEth: false,
    })
  }
  const toSmallestUnit = (amount: number | string, decimals: number) => {
    if (typeof amount === 'string') {
      amount = parseFloat(amount)
    }

    if (isNaN(amount)) {
      throw new Error('Invalid amount provided')
    }

    return BigInt(Math.floor(amount * 10 ** decimals))
  }

  const getQuote = async ({
    isRango = false,
    isAvailableNumber = true,
  }: {
    isRango?: boolean
    isAvailableNumber?: boolean
  }) => {
    if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT) return

    updateFormState({
      isQuoteing: true,
    })

    if (formState.selectedFromToken && formState.selectedToToken && formState.fromAmount) {
      const fromAddress = formState.selectedFromAddress
      const originId = isRango ? formState.selectedFromToken?.rangoExtra.id : formState.selectedFromToken?.relayExtra.id
      const amount = toSmallestUnit(`${formState.fromAmount}`, formState.selectedFromToken.decimals)
      const toAddress = formState.selectedToAddress

      let destinationId: string
      if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
        // getQuote toToken = arb_usdc
        const usdcToken = tokens?.filter((t) => t.symbol === 'USDC')[0]
        destinationId = usdcToken ? (isRango ? usdcToken.rangoExtra.id : usdcToken.relayExtra.id) : ''
      } else {
        destinationId = isRango ? formState.selectedToToken?.rangoExtra.id : formState.selectedToToken?.relayExtra.id
      }

      const fromNativeCoinBalance =
        formState.selectedFromToken.symbol.toUpperCase() === 'SOL'
          ? BigInt(Math.floor(parseFloat(formState.fromAvailableBalance) * 1e9))
          : formState.selectedFromToken.symbol.toUpperCase() === 'USDC'
            ? parseEther(`${arbEthCoin?.balance || 0}`)
            : parseEther(formState.fromAvailableBalance)

      const toNativeCoinBalance =
        formState.selectedToToken.symbol.toUpperCase() === 'SOL'
          ? BigInt(Math.floor(parseFloat(formState.toAvailableBalance) * 1e9))
          : formState.selectedToToken.symbol.toUpperCase() === 'USDC'
            ? parseEther(`${arbEthCoin?.balance || 0}`)
            : parseEther(formState.toAvailableBalance)

      const type = isRango ? 'rango' : 'relay'

      try {
        const { data } = await swapService.handleGetQuote(
          fromAddress,
          fromNativeCoinBalance.toString(),
          originId,
          destinationId,
          toAddress,
          toNativeCoinBalance.toString(),
          amount.toString(),
          type,
        )

        const getQuoteV2Response: TransactionData = data.getQuoteV2
        if (getQuoteV2Response.errorCode === 'AMOUNT_TOO_LOW') {
          updateFormState({
            warning: t('assets.transfers.minSwapLimitWarning'),
            enableSwap: false,
            isQuoteing: false,
          })
        } else {
          if (!!getQuoteV2Response.fromAmountMaxValueFormatted) {
            if (getQuoteV2Response.errorCode === 'INPUT_LIMIT_ISSUE') {
              // exceed rango capacity

              updateFormState({
                warning: t('assets.transfers.noBridgePath'),
                enableSwap: false,
                isQuoteing: false,
              })

              return
            } else {
              // exceed relay capacity
              // check native coin is enough to pay for gas, if not, show message and disable button
              const estimatedGas = getQuoteV2Response.gasAmountFormatted
              let nativeCoinBalance, nativeCoinPrice
              if (formState.selectedFromToken.symbol.toUpperCase() === 'USDC') {
                nativeCoinBalance = arbEthCoin?.balance
                nativeCoinPrice = arbEthCoin?.usdPrice
              } else {
                nativeCoinBalance = formState.selectedFromToken.balance
                nativeCoinPrice = formState.selectedFromToken.usdPrice
              }

              const canCoverGas = Number(nativeCoinBalance || 0) > Number(estimatedGas || 0)

              if (!canCoverGas) {
                const maxPrice = formatNumberWithCommas(
                  MathFun.mul(
                    Number(getQuoteV2Response.fromAmountMaxValueFormatted || 0),
                    Number(nativeCoinPrice || 0),
                  ),
                  2,
                )

                updateFormState({
                  warning: t('assets.transfers.amountTooHigh', { maxPrice: maxPrice }),
                  enableSwap: false,
                  isQuoteing: false,
                })

                return
              }
            }
          }

          let estimatedTimeInSeconds = 0

          for (const item of getQuoteV2Response.items) {
            estimatedTimeInSeconds += Number(item.estimatedTimeInSeconds) || 0
          }
          const transactionData = Object.assign({}, getQuoteV2Response, {
            estimatedTimeInSeconds,
          })

          const fromUSDPrice = formState.selectedFromToken.usdPrice
          const toUSDPrice = formState.selectedToToken.usdPrice

          const fromToken = formState.selectedFromToken.symbol
          const toToken = formState.selectedToToken.symbol

          const swapRate = `1 ${fromToken} ≈ ${formatNumberWithCommas(MathFun.div(fromUSDPrice, toUSDPrice).toString(), 5)} ${toToken}`
          let enableSwap =
            isAvailableNumber &&
            transactionData.errorCode === '' &&
            Number(formState.fromAmount || 0) <= Number(formState.fromAvailableBalance || 0)

          let btnText = BUTTON_TEXT.Default
          if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
            const isEnoughtDeposit =
              MathFun.mul(Number(getQuoteV2Response.outPutAmountFormatted), formState.selectedToToken.usdPrice) >=
              TRANSFER_CONFIG.MIN_PRICE
            enableSwap = enableSwap && isEnoughtDeposit
            btnText = isEnoughtDeposit ? btnText : BUTTON_TEXT.MinDeposit
          }
          if (Number(formState.fromAmount) > Number(formState.fromAvailableBalance)) {
            btnText = BUTTON_TEXT.BalanceNotEnough
            enableSwap = false
          }
          if (formState.fromAmount !== '' || Number(formState.fromAmount || 0) > 0) {
            updateFormState({
              warning: '',
              transactionData: transactionData,
              isQuoteing: false,
              swapRate: swapRate,
              toAmount: limitDecimalNumber(getQuoteV2Response.outPutAmountFormatted, 8),
              noArbEth: !!getQuoteV2Response.gasTopupAmount,
              enableSwap: enableSwap,
              buttonText: btnText,
            })
          }
          if (!isAvailableNumber) {
            updateFormState({
              warning: t('assets.transfers.notEnoughForGas'),
            })
          }
        }
      } catch (err) {
        console.log('err: ', err)
        updateFormState({
          isQuoteing: false,
          warning: t('assets.transfers.noBridgePath'),
        })
      }
    }
  }

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const handleSwapRecord = async (
    fee: number = 0,
    txHash: string,
    status: 'Failed' | 'Success' | 'Processing',
    errorCode: string = '',
    errorMessage: string = '',
    memo?: string,
  ) => {
    swapService.handleSwapRecord(
      formState.selectedFromAddress,
      Number(formState.selectedFromToken?.chainId || 0),
      formState.selectedFromToken?.address || '',
      Number(formState.fromAmount || 0),
      fee,
      Number(formState.transactionData?.platformFeeAmountFormat || 0),
      formState.transactionData?.platformFeeSymbol || '',
      formState.selectedToAddress,
      Number(formState.selectedToToken?.chainId || 0),
      formState.selectedToToken?.address || '',
      Number(formState.toAmount || 0),
      formState.transactionData ? (capitalizeFirstLetter(formState.transactionData.type) as 'Relay' | 'Rango') : '',
      txHash,
      status,
      errorCode,
      errorMessage,
      memo,
    )
  }

  const handleHyperliquidTransfer = async (
    type: 'FuturesDeposit' | 'FuturesWithdraw',
    chainId: number,
    fee: number = 0,
    toChainId: number,
    txHash: string,
    status: 'Failed' | 'Success',
    errorCode: string = '',
    errorMessage: string = '',
    nonce: number,
    memo?: string,
  ) => {
    swapService.handleHyperliquidTransfer(
      type,
      formState.selectedFromAddress,
      chainId,
      formState.selectedFromToken?.address || '',
      Number(formState.fromAmount || 0),
      fee,
      formState.selectedToAddress,
      toChainId,
      txHash,
      status,
      errorCode,
      errorMessage,
      nonce,
      memo,
    )
  }

  const handleAmountChange = async (value: string, wallet: string) => {
    updateFormState({
      warning: '',
    })
    if (Number(value) === 0) {
      if (`${value}`.includes('.')) {
        const [integerPart, decimalPart] = `${value}`.split('.')
        if (decimalPart.length > 6) {
          value = integerPart + '.' + decimalPart.slice(0, 6)
        }
      }

      updateFormState({
        fromAmount: value,
        toAmount: '',
        transactionData: undefined,
      })
    } else {
      const balance = formState.fromAvailableBalance
      const isMaxValue = value === balance

      const displayedValue = limitDecimalNumber(`${value}`, 8)

      // if(formState.selectedFromToken?.symbol.toUpperCase() === 'USDC' && formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
      //   if(Number(arbEthCoin?.balance || 0) > 0) {

      //     updateFormState({
      //       fromAmount: displayedValue,
      //       toAmount: displayedValue
      //     })
      //   } else{
      //     toast.error(`ETH ${t('assets.transfers.notEnoughForGas')}`)
      //     return
      //   }

      // }
      if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT) {
        if (Number(value) <= 1) {
          updateFormState({
            fromAmount: displayedValue,
          })
          toast.error(`${t('assets.transfers.gasFeeNotEnough')}`)
          return
        } else {
          updateFormState({
            fromAmount: displayedValue,
            toAmount: limitDecimalNumber(MathFun.sub(displayedValue, 1), 8),
            estimatedTime: 300,
            estimatedFee: '1',
          })
        }
      } else {
        let minAmount = 0
        if (formState.selectedFromToken?.symbol.toUpperCase() === 'SOL') {
          const rent = await checkIfNewSolAccountAndGetRent(formState.selectedFromAddress)
          minAmount = rent + 0.012 // 0.012 hardcode for save transfer
        } else if (formState.selectedFromToken?.symbol.toUpperCase() === 'ETH') {
          minAmount = 0.00015 // TODO: native cannot be transfer all and the value shouldn't be hardcode.
        } else if (formState.selectedFromToken?.symbol.toUpperCase() === 'BNB') {
          minAmount = 0.0005 // Estimated to cover BNB gas fee
        }

        // Calculate the maximum transferable amount
        const maxTransferableAmount = MathFun.sub(Number(balance || 0), minAmount)

        let finalAmount: string
        if (isMaxValue) {
          // For max click, use the maximum transferable amount
          if (maxTransferableAmount <= 0) {
            toast.error(`${formState.selectedFromToken?.symbol.toUpperCase()} ${t('assets.transfers.notEnoughForGas')}`)
            updateFormState({
              fromAmount: '',
              toAmount: '',
              enableSwap: false,
              transactionData: undefined,
            })
            return
          }
          finalAmount = limitDecimalNumber(`${maxTransferableAmount}`, 8)
        } else {
          // For manual input, use the displayed value
          finalAmount = displayedValue
        }
        if (finalAmount === formState.fromAmount) return

        updateFormState({ fromAmount: finalAmount })

        // Check if the final amount leaves enough for gas
        const remainingBalance = MathFun.sub(Number(balance || 0), Number(finalAmount))
        const isAvailable = remainingBalance >= minAmount
        setIsAvailableNumber(isAvailable)
        if (!isAvailable) {
          updateFormState({
            enableSwap: false,
          })
          return
        }

        if (formState.fromAccountType === ACCOUNT_TYPE.MEME) {
          updateFormState({ enableSwap: isAvailable })

          if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
            if (formState.selectedFromToken?.symbol.toUpperCase() === 'USDC') {
              // arb usdc deposit hyperliquid
              updateFormState({
                fromAmount: finalAmount,
                toAmount: finalAmount,
                estimatedFee: '',
                estimatedTime: undefined,
              })
            } else {
              // cross chain deposit hyperliquid
              updateFormState({
                fromAmount: finalAmount,
              })
            }
          } else {
            if (
              formState.selectedFromToken?.symbol.toUpperCase() === 'SOL' &&
              formState.selectedToToken?.symbol.toUpperCase() === 'SOL'
            ) {
              // sol <-> sol
              const toAmount = Number(finalAmount)
              const tx = await buildSolTransaction(
                formState.selectedFromAddress,
                formState.selectedToAddress,
                Number(formState.fromAmount || 0),
              )
              const feeLamports = await solTransferEstimatedFee(tx)
              let feeInSol
              if (feeLamports && feeLamports.value) {
                feeInSol = feeLamports.value / LAMPORTS_PER_SOL
              } else {
                feeInSol = 0.000015
              }

              updateFormState({
                fromAmount: finalAmount,
                toAmount: `${toAmount}`,
                estimatedFee: `${feeInSol}`,
              })
            } else {
              // cross chain
              updateFormState({
                fromAmount: `${finalAmount}`,
              })
            }
          }
        }
      }
    }
  }

  const handleMaxClick = async () => {
    handleAmountChange(formState.fromAvailableBalance, formState.selectedFromAddress)
  }

  const handleTokenDrawerToggle = (isOpen: boolean) => {
    updateFormState({
      isTokenDrawerOpen: isOpen,
    })
  }

  const handleTokenSelect = async (token: Token, isFrom: boolean, walletAddress?: string) => {
    const solAddress = 'So11111111111111111111111111111111111111111'
    let sameOtherSideToken = false

    if (formState.fromAccountType === ACCOUNT_TYPE.MEME && formState.toAccountType === ACCOUNT_TYPE.MEME) {
      if (isFrom) {
        const toToken = formState.selectedToToken
        if (token.address !== solAddress) {
          sameOtherSideToken = token.address === toToken?.address && Number(token.chainId) === Number(toToken?.chainId)
        }
      } else {
        const fromToken = formState.selectedFromToken
        if (token.address !== solAddress) {
          sameOtherSideToken =
            token.address == fromToken?.address && Number(token.chainId) === Number(fromToken?.chainId)
        }
      }
    }
    if (sameOtherSideToken) {
      updateFormState({
        isTokenDrawerOpen: false,
      })
      handleFromToSwap()
    } else {
      let availableBalance, selectedFromAddress, selectedToAddress

      if (token.chainName === 'SOLANA') {
        availableBalance = `${token.balance}`
        if (isFrom) {
          // Find a wallet that's not the same as the to address
          if (walletAddress && walletAddress !== formState.selectedToAddress) {
            selectedFromAddress = walletAddress
          } else {
            const availableWallets = solanaWallets.filter((w) => w.walletAddress !== formState.selectedToAddress)
            selectedFromAddress = availableWallets[0]?.walletAddress || solanaWallets[0]?.walletAddress
          }
        } else {
          // Find a wallet that's not the same as the from address
          if (walletAddress && walletAddress !== formState.selectedFromAddress) {
            selectedToAddress = walletAddress
          } else {
            const availableWallets = solanaWallets.filter((w) => w.walletAddress !== formState.selectedFromAddress)
            selectedToAddress = availableWallets[0]?.walletAddress || solanaWallets[0]?.walletAddress
          }
        }
      } else {
        availableBalance = `${token.balance}`
        if (isFrom) {
          selectedFromAddress = EVMAddress
        } else {
          selectedToAddress = EVMAddress
        }
      }

      const displayedAvailableBalance = `${fixBigNumber(availableBalance || '0', token ? (token.szDecimals ? token.szDecimals : 2) : 4)}`

      updateFormState({
        isTokenDrawerOpen: false,
        transactionData: undefined,
        ...(isFrom
          ? {
              fromAmount: null,
              selectedFromToken: token,
              fromAvailableBalance: availableBalance,
              fromDisplayedAvailableBalance: displayedAvailableBalance,
              selectedFromAddress: selectedFromAddress,
              toAmount: '',
            }
          : {
              toAmount: '',
              selectedToToken: token,
              toAvailableBalance: availableBalance,
              toDisplayedAvailableBalance: displayedAvailableBalance,
              selectedToAddress: selectedToAddress,
            }),
      })
    }
  }

  const handleFromToSwap = () => {
    const formValue = formState

    updateFormState({
      fromAccountType: formValue.toAccountType,
      fromAmount: '',
      fromAvailableBalance: formValue.toAvailableBalance,
      fromDisplayedAvailableBalance: formValue.toDisplayedAvailableBalance,
      selectedFromToken: formValue.selectedToToken,
      selectedFromAddress: formValue.selectedToAddress,

      toAccountType: formValue.fromAccountType,
      toAmount: '',
      toAvailableBalance: formValue.fromAvailableBalance,
      toDisplayedAvailableBalance: formValue.fromDisplayedAvailableBalance,
      selectedToToken: formValue.selectedFromToken,
      selectedToAddress: formValue.selectedFromAddress,

      transactionData: undefined,
      swapRate: undefined,
      estimatedFee: undefined,
      estimatedTime: undefined,
      noArbEth: false,
      enableSwap: false,
      error: null,
      warning: '',
    })
  }

  useEffect(() => {
    // set default token, address and balance
    if (tokens) {
      if (!formState.selectedFromToken) {
        const defaultFromToken = tokens[0]
        const availableFromBalance =
          formState.fromAccountType === ACCOUNT_TYPE.CONTRACT ? `${available || 0}` : `${defaultFromToken.balance || 0}`
        const fromDisplayedAvailableBalance = `${fixBigNumber(availableFromBalance || '0', defaultFromToken ? (defaultFromToken.szDecimals ? defaultFromToken.szDecimals : defaultFromToken.decimals) : 4)}`
        const fromAddress =
          defaultFromToken?.symbol.toUpperCase() === 'SOL' ? solanaWallets[0].walletAddress : EVMAddress

        updateFormState({
          selectedFromToken: defaultFromToken,
          selectedFromAddress: fromAddress,
          fromAvailableBalance: availableFromBalance,
          fromDisplayedAvailableBalance: fromDisplayedAvailableBalance,
        })
      }

      if (!formState.selectedToToken) {
        const defaultToToken = tokens ? usdcToken : null

        const availableToBalance =
          formState.toAccountType === ACCOUNT_TYPE.CONTRACT ? `${available || 0}` : `${defaultToToken?.balance || 0}`
        const toDisplayedAvailableBalance = `${fixBigNumber(availableToBalance || '0', defaultToToken ? (defaultToToken.szDecimals ? defaultToToken.szDecimals : defaultToToken.decimals) : 4)}`

        updateFormState({
          selectedToToken: defaultToToken,
          selectedToAddress: EVMAddress,
          toAvailableBalance: availableToBalance,
          toDisplayedAvailableBalance: toDisplayedAvailableBalance,
        })
      }
    }
  }, [tokens])

  useEffect(() => {
    if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT) {
      // withdraw from hyperliquid
      const toBalance = usdcToken?.balance || 0
      const toDisplayedBalance = fixBigNumber(`${toBalance}`, 4)

      updateFormState({
        selectedFromAddress: EVMAddress,
        selectedToAddress: EVMAddress,
        toAccountType: ACCOUNT_TYPE.MEME,
        selectedToToken: usdcToken,
        toAvailableBalance: `${toBalance}`,
        toDisplayedAvailableBalance: toDisplayedBalance,
      })
    }
  }, [
    formState.selectedFromToken,
    formState.selectedToToken,
    formState.selectedFromAddress,
    formState.selectedToAddress,
    formState.fromAccountType,
    formState.toAccountType,
  ])

  useEffect(() => {
    updateFormState({
      swapRate: undefined,
      enableSwap: false,
    })
    if (formState.warning.length > 0) {
      updateFormState({
        swapRate: undefined,
        enableSwap: false,
      })
    }

    let btnText = BUTTON_TEXT.Default
    let enableSwap = false
    if (formState.fromAmount && Number(formState.fromAmount || 0) > 0) {
      const balance = formState.fromAvailableBalance

      const isUSDCDepositHyperliquid =
        formState.fromAccountType === ACCOUNT_TYPE.MEME &&
        formState.toAccountType === ACCOUNT_TYPE.CONTRACT &&
        formState.selectedFromToken?.symbol.toUpperCase() === 'USDC' &&
        formState.selectedFromToken.symbol.toUpperCase() === 'USDC'

      if (Number(balance || 0) < Number(formState.fromAmount || 0) && !isUSDCDepositHyperliquid) {
        btnText = BUTTON_TEXT.BalanceNotEnough
        enableSwap = false
        getQuote({ isAvailableNumber: isAvailableNumber })
      } else if (formState.fromAccountType === ACCOUNT_TYPE.MEME) {
        if (formState.toAccountType === ACCOUNT_TYPE.MEME) {
          if (formState.selectedFromToken !== formState.selectedToToken) {
            // cross chain
            getQuote({ isAvailableNumber: isAvailableNumber })
          } else {
            // sol <-> sol
            btnText = BUTTON_TEXT.Default
            enableSwap = true
          }
        } else if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
          if (formState.selectedFromToken?.symbol.toUpperCase() !== 'USDC') {
            // cross chain and deposit to hyperliquid
            getQuote({ isAvailableNumber: isAvailableNumber })
          } else {
            // deposit arb usdc to hyperliquid
            const arbEthToken = tokens?.filter(
              (t) => t.symbol.toUpperCase() === 'ETH' && t.chainName?.toUpperCase() === 'ARBITRUM',
            )[0]

            const fromAmount = Number(formState.fromAmount || 0)
            const usdcPrice = Number(usdcToken?.usdPrice || 0)
            const amountUSD = MathFun.mul(fromAmount, usdcPrice)

            if (amountUSD < TRANSFER_CONFIG.MIN_PRICE) {
              btnText = BUTTON_TEXT.MinDeposit
              enableSwap = false
            }
            //  else if (Number(arbEthToken?.balance || 0) === 0) {
            //   btnText = BUTTON_TEXT.GasNotEnough
            //   enableSwap = false
            // }
            else if (Number(fromAmount || 0) > Number(formState.selectedFromToken.balance || 0)) {
              btnText = BUTTON_TEXT.BalanceNotEnough
              enableSwap = false
            } else {
              btnText = BUTTON_TEXT.Default
              enableSwap = true
            }

            updateFormState({
              swapRate: '1 USDC = 1 USDC',
              toAmount: `${fromAmount}`,
            })
          }
        }
      } else {
        // hyperliquid withdraw
        btnText = BUTTON_TEXT.Default
        enableSwap = Number(formState.fromAmount) > 1 ? true : false

        updateFormState({
          swapRate: '1 USDC = 1 USDC',
        })
      }
    }
    updateFormState({
      buttonText: btnText,
      enableSwap: enableSwap,
    })
  }, [formState.fromAmount, formState.selectedToToken, formState.selectedFromAddress, formState.selectedToAddress])

  useEffect(() => {
    return () => {
      let timeoutId: NodeJS.Timeout | undefined
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  useEffect(() => {
    if (available) {
      if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT) {
        updateFormState({
          fromAvailableBalance: available,
          fromDisplayedAvailableBalance: fixBigNumber(available, 4),
        })
      } else if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
        updateFormState({
          toAvailableBalance: available,
          toDisplayedAvailableBalance: fixBigNumber(available, 4),
        })
      }
    } else {
      if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT) {
        updateFormState({
          fromAvailableBalance: hyperliquidWithdrawable,
          fromDisplayedAvailableBalance: fixBigNumber(hyperliquidWithdrawable, 4),
        })
      } else if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
        updateFormState({
          toAvailableBalance: hyperliquidWithdrawable,
          toDisplayedAvailableBalance: fixBigNumber(hyperliquidWithdrawable, 4),
        })
      }
    }
  }, [available, hyperliquidWithdrawable])

  return {
    formState,
    resetFormState,
    updateFormState,
    handleAmountChange,
    handleMaxClick,
    handleTokenDrawerToggle,
    handleTokenSelect,
    handleSwapRecord,
    handleHyperliquidTransfer,
    handleFromToSwap,
    address,
  }
}
