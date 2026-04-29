import AppDrawer from '../common/AppDrawer'
import TokenSelectorDrawer from './drawer/TokenSelectorDrawer'
import { TokenInput } from './components/TokenInput'
import { useTransferForm } from './hook/useTransferForm'
import { useSwapService } from './hook/useSwapService'
import { parseUnits } from 'viem'
import ButtonShadowGradient from '../common/buttons/ButtonShadowGradient'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import { useTransferContext } from './context/TransferContext'
import { useTurnkey } from '@turnkey/sdk-react'
import { useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { Token } from './types/ExchangeMeta'
import { getAddress, parseEther } from 'ethers'
import { Item, TransactionData } from './types/TransactionData'
import { buildSignableData } from '@/utils/hyperliquidSign/signableData'
import { toast } from 'sonner'
import { MessageDrawer } from './drawer/MessageDrawer'
import { useNavigate } from 'react-router-dom'
import { cn, fixBigNumber, MathFun } from '@/lib/utils'
import { useLocation } from 'react-router-dom'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { _activeWallet, _walletDex } from '@/redux/modules/newWallet.slice'
import { useTranslation } from 'react-i18next'
import { useSendTransaction } from './hook/useSendTransaction'
import { ACCOUNT_TYPE } from './lib/enum'
import { useMultiLanguageText } from './hook/useMultiLanguageText'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { ChainIds } from '@/types/enums.ts'
import { IconSwap2 } from '@/components/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { mappedChainIdToChainType } from '@/redux/modules/newWallet.slice'
import { formatAmount } from '@/lib/format'

export interface TransferFormProps {
  source?: 'futures' | 'funding' | null
  onSuccess?: () => void
}

const TransferForm = ({ source: propSource, onSuccess }: TransferFormProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const activeWallet = useSelector(_activeWallet)
  const searchParams = new URLSearchParams(location.search)
  const source = propSource || searchParams.get('source')
  const initialToToken = searchParams.get('toToken')
  const action = searchParams.get('action')
  // 根据 source 参数设置初始账户类型
  const initialFromAccountType =
    source === 'futures' ? (action === 'withdraw' ? ACCOUNT_TYPE.CONTRACT : ACCOUNT_TYPE.MEME) : ACCOUNT_TYPE.MEME
  const initialToAccountType =
    source === 'futures' ? (action === 'withdraw' ? ACCOUNT_TYPE.MEME : ACCOUNT_TYPE.CONTRACT) : ACCOUNT_TYPE.MEME

  const {
    formState,
    updateFormState,
    handleAmountChange,
    handleMaxClick,
    handleTokenDrawerToggle,
    handleTokenSelect,
    handleSwapRecord,
    handleHyperliquidTransfer,
    handleFromToSwap,
  } = useTransferForm(initialFromAccountType, initialToAccountType)

  const {
    sendSolanaTransfer,
    solCrossChainTransfer,
    evmCrossChainTranser,
    bscCrossChainTransfer,
    hyperliquidDeposit,
    getDepositHLGasFee,
    depositWithNoGasFee,
  } = useSendTransaction()

  const { BUTTON_TEXT } = useMultiLanguageText()

  const defaultTokenImage = useMemo(() => {
    switch (activeWallet?.chainId) {
      case ChainIds.Solana:
        return getBlockchainLogo2(ChainIds.Solana)
      case ChainIds.Ethereum:
      case ChainIds.Arbitrum:
        return getBlockchainLogo2(ChainIds.Ethereum)
      case ChainIds.Bsc:
        return '/images/bnb.svg'
      default:
        return getBlockchainLogo2(ChainIds.Ethereum)
    }
  }, [activeWallet?.chainId])

  const defaultTokenSymbol = useMemo(() => {
    switch (activeWallet?.chainId) {
      case ChainIds.Solana:
        return 'SOL'
      case ChainIds.Ethereum:
      case ChainIds.Arbitrum:
        return 'ETH'
      case ChainIds.Bsc:
        return 'BNB'
      default:
        return 'SOL'
    }
  }, [activeWallet?.chainId])

  const navigate = useNavigate()
  const swapService = useSwapService()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const evmWallet = useSelector(_walletDex)?.walletAddress

  const { withdrawable: available } = useWebData2() // hyperliquid withdrawable udsc balance
  // const balances = useMultiChainBalances().balances
  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId
  const [isFrom, setIsFrom] = useState(false)
  const { tokens } = useTransferContext()

  const dispatch = useAppDispatch()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerType, setDrawerType] = useState<'error' | 'info' | 'warning'>('info')
  const [drawerBtxText, setDrawerBtxText] = useState('')
  const [drawerDescription, setDrawerDescription] = useState('')
  // const [timer, setTimer] = useState('')
  const [swapRateReversed, setSwapRateReversed] = useState(true) // 兑换率是否反转

  const usdcToken = useMemo(() => {
    return tokens?.filter((t) => t.symbol.toUpperCase() === 'USDC')[0]
  }, [tokens])

  // Track previous values to prevent unnecessary updates
  const prevUsdcTokenBalanceRef = useRef<number | undefined>(undefined)
  const prevAvailableRef = useRef<string | undefined>(undefined)
  const prevListWalletsByChainRef = useRef<typeof listWalletsByChain | undefined>(undefined)
  const prevSourceRef = useRef<string | null>(null)
  const isInitialMountRef = useRef(true)
  const hasInitializedToTokenRef = useRef(false)

  // Helper function to create custom loading toast with close icon
  const showLoadingToast = (message: string) => {
    return toast.custom(
      (t) => (
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-4 rounded-[8px] border border-[#3E2761] bg-[#232329] p-4 text-white shadow-lg">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative h-5 w-5">
              <div className="sonner-loading-wrapper" data-visible="true">
                <div className="sonner-spinner">
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                  <div className="sonner-loading-bar"></div>
                </div>
              </div>
            </div>
            <span className="text-sm text-white">{message}</span>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex h-5 w-5 cursor-pointer items-center justify-center transition-opacity hover:opacity-70"
            aria-label="Close"
          >
            <img src="/images/icons/icon-x.svg" className="h-5 w-5" alt="close" />
          </button>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
        style: {
          backgroundColor: 'transparent',
        },
      },
    )
  }

  useEffect(() => {
    if (!listWalletsByChain || !tokens) return

    // Check if values actually changed to prevent unnecessary updates
    const usdcBalance = usdcToken?.balance || 0
    const hasUsdcBalanceChanged = prevUsdcTokenBalanceRef.current !== usdcBalance
    const hasAvailableChanged = prevAvailableRef.current !== available
    const hasWalletsChanged = prevListWalletsByChainRef.current !== listWalletsByChain

    // Only update if values actually changed
    if (!hasUsdcBalanceChanged && !hasAvailableChanged && !hasWalletsChanged) {
      // Update refs even if no changes to track current state
      prevUsdcTokenBalanceRef.current = usdcBalance
      prevAvailableRef.current = available
      prevListWalletsByChainRef.current = listWalletsByChain
      return
    }

    const updates: Partial<typeof formState> = {}

    // Update from balance based on account type
    if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT) {
      // Contract account uses hyperliquid withdrawable balance
      if (hasAvailableChanged && `${available}` !== formState.fromAvailableBalance) {
        updates.fromAvailableBalance = `${available}`
        updates.fromDisplayedAvailableBalance = `${available}`
      }
    } else if (formState.selectedFromToken) {
      // MEME account
      if (formState.selectedFromToken.symbol.toUpperCase() === 'SOL') {
        // SOL token: get balance from wallet
        const wallet = listWalletsByChain.find(
          (w: UserEmbeddedWalletDto) => w.walletAddress === formState.selectedFromAddress,
        )
        if (wallet && hasWalletsChanged) {
          const newBalance = wallet.balance.toString()
          if (newBalance !== formState.fromAvailableBalance) {
            updates.fromAvailableBalance = newBalance
            updates.fromDisplayedAvailableBalance = newBalance
          }
        }
      } else if (formState.selectedFromToken.symbol.toUpperCase() === 'USDC') {
        if (hasUsdcBalanceChanged) {
          const newBalance = usdcBalance.toString()
          if (newBalance !== formState.fromAvailableBalance) {
            updates.fromAvailableBalance = newBalance
            updates.fromDisplayedAvailableBalance = newBalance
          }
        }
      } else {
        // Other tokens: use token balance
        if (formState.selectedFromToken?.chainId && hasWalletsChanged) {
          const chainId = formState.selectedFromToken.chainId
          const wallet = listWalletsByChain.find(
            (w: UserEmbeddedWalletDto) =>
              w.walletAddress === formState.selectedFromAddress && w.chain === mappedChainIdToChainType(+chainId),
          )
          if (wallet) {
            const newBalance = wallet.balance.toString()
            if (newBalance !== formState.fromAvailableBalance) {
              updates.fromAvailableBalance = newBalance
              updates.fromDisplayedAvailableBalance = newBalance
            }
          }
        }
      }
    }

    // Update to balance based on account type
    if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
      // Contract account uses hyperliquid withdrawable balance
      if (hasAvailableChanged && `${available || 0}` !== formState.toAvailableBalance) {
        updates.toAvailableBalance = `${available || 0}`
        updates.toDisplayedAvailableBalance = `${available || 0}`
      }
    } else if (formState.selectedToToken) {
      // MEME account
      if (formState.selectedToToken.symbol.toUpperCase() === 'SOL') {
        // SOL token: get balance from wallet
        const wallet = listWalletsByChain.find(
          (w: UserEmbeddedWalletDto) => w.walletAddress === formState.selectedToAddress,
        )
        if (wallet && hasWalletsChanged) {
          const newBalance = wallet.balance.toString()
          if (newBalance !== formState.toAvailableBalance) {
            updates.toAvailableBalance = newBalance
            updates.toDisplayedAvailableBalance = newBalance
          }
        } else if (listWalletsByChain.length > 0 && hasWalletsChanged) {
          // If selected address not found, use first available SOL wallet
          const solWallet = listWalletsByChain.find((w: UserEmbeddedWalletDto) => w.chain.toUpperCase() === 'SOLANA')
          if (solWallet && solWallet.walletAddress !== formState.selectedToAddress) {
            updates.selectedToAddress = solWallet.walletAddress.toString()
            updates.toAvailableBalance = solWallet.balance.toString()
            updates.toDisplayedAvailableBalance = solWallet.balance.toString()
          }
        }
      } else if (formState.selectedToToken.symbol.toUpperCase() === 'USDC') {
        if (hasUsdcBalanceChanged) {
          const newBalance = usdcBalance?.toString()
          if (newBalance !== formState.toAvailableBalance) {
            updates.toAvailableBalance = newBalance
            updates.toDisplayedAvailableBalance = newBalance
          }
        }
      } else {
        // Other tokens: use token balance
        if (formState.selectedToToken?.chainId && hasWalletsChanged) {
          const chainId = formState.selectedToToken.chainId
          const wallet = listWalletsByChain.find(
            (w: UserEmbeddedWalletDto) =>
              w.walletAddress === formState.selectedToAddress && w.chain === mappedChainIdToChainType(+chainId),
          )
          if (wallet) {
            const newBalance = wallet.balance.toString()
            if (newBalance !== formState.toAvailableBalance) {
              updates.toAvailableBalance = newBalance
              updates.toDisplayedAvailableBalance = newBalance
            }
          }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      updateFormState(updates)
    }

    // Update refs
    prevUsdcTokenBalanceRef.current = usdcBalance
    prevAvailableRef.current = available
    prevListWalletsByChainRef.current = listWalletsByChain
  }, [listWalletsByChain, available, usdcToken?.balance])

  const resetForm = () => {
    updateFormState({
      fromAmount: '',
      toAmount: '',
      warning: '',
      error: null,
      transactionData: undefined,
      swapRate: undefined,
      estimatedFee: undefined,
      estimatedTime: undefined,
      noArbEth: false,
      isLoading: false,
      enableSwap: true,
      buttonText: BUTTON_TEXT.Default,
      isQuoteing: false,
    })
    // setTimer('')
  }

  const hyperliquidWithdraw = async () => {
    const currentTimestamp = Date.now()

    if (
      formState.selectedFromToken?.symbol.toUpperCase() === 'USDC' &&
      formState.selectedToToken?.symbol.toUpperCase() === 'USDC'
    ) {
      const operation = 'withdraw'
      const payload = {
        amount: `${formState.fromAmount}`,
        destination: evmWallet,
        time: currentTimestamp,
      }

      try {
        const { signableData } = await buildSignableData({ operation, payload })

        const activity = await indexedDbClient?.signRawPayload({
          organizationId: subOrgId,
          signWith: getAddress(evmWallet),
          payload: signableData,
          encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
          hashFunction: 'HASH_FUNCTION_KECCAK256',
        })

        if (activity) {
          const r = activity.r
          const s = activity.s
          const v = activity.v

          const { data } = await swapService.hyperliquidWithdraw(
            formState.fromAmount || '0',
            evmWallet,
            currentTimestamp,
            r,
            s,
            Number(v),
          )

          if (data.status === 'ok') {
            await handleHyperliquidTransfer(
              'FuturesWithdraw',
              999,
              1,
              Number(formState.selectedToToken.chainId),
              '',
              'Success',
              undefined,
              undefined,
              currentTimestamp || 0, // use hyperliquid nonce to BE confirm transaction further, using currentTimestamp as nonce
            )
            onSuccess?.()
            dispatch(exchangeActions.closeExchangeDialog())
            if (isDesktop) {
              resetForm()
            } else {
              navigate('/assets/overview?tab=funds')
            }
          } else {
            await handleHyperliquidTransfer(
              'FuturesWithdraw',
              999,
              0,
              42161,
              '',
              'Failed',
              undefined,
              undefined,
              formState.transactionData?.items[formState.transactionData?.items.length - 1].nonce || 0,
            )
            dispatch(exchangeActions.closeExchangeDialog())
            if (isDesktop) {
              resetForm()
            }
          }
        } else {
          updateFormState({
            warning: t('assets.transfers.signFailed'),
          })
          await handleHyperliquidTransfer(
            'FuturesWithdraw',
            999,
            0,
            42161,
            '',
            'Failed',
            undefined,
            undefined,
            formState.transactionData?.items[formState.transactionData?.items.length - 1].nonce || 0,
          )
          if (isDesktop) {
            dispatch(exchangeActions.closeExchangeDialog())
            resetForm()
          }
        }
      } catch (err) {
        toast.dismiss()
        updateFormState({
          warning: t('assets.transfers.signFailed'),
        })
        await handleHyperliquidTransfer(
          'FuturesWithdraw',
          999,
          0,
          42161,
          '',
          'Failed',
          undefined,
          undefined,
          formState.transactionData?.items[formState.transactionData?.items.length - 1].nonce || 0,
        )
        if (isDesktop) {
          resetForm()
        }
        updateFormState({
          buttonText: BUTTON_TEXT.Default,
          enableSwap: true,
        })
      } finally {
        // setTimer('60')
      }
    }
  }

  const depositHyperliquid = async (requestId?: string) => {
    let amount = ''
    if (formState.selectedFromToken?.symbol.toUpperCase() === 'USDC') {
      amount = formState.fromAmount!
    } else {
      amount = formState.toAmount!
    }
    try {
      const { gasLimit, feeData } = await getDepositHLGasFee(formState.selectedToAddress, amount, undefined, requestId)
      const gasPrice = BigInt(feeData.gasPrice || 0)
      const balanceInWei = parseEther(`${formState.selectedFromToken?.balance}`)
      const gasCost = gasLimit * gasPrice

      const canCoverGas = balanceInWei >= gasCost

      if (!canCoverGas) {
        toast.error(`ETH ${t('assets.transfers.notEnoughForGas')}`, { duration: Infinity, closeButton: true })
        updateFormState({
          buttonText: BUTTON_TEXT.Default,
          enableSwap: true,
        })
      } else {
        const { txHash, nonce } = await hyperliquidDeposit(evmWallet, amount, requestId)

        if (txHash) {
          onSuccess?.()
          dispatch(exchangeActions.closeExchangeDialog())
          if (isDesktop) {
            resetForm()
          }
          navigate(`/assets/overview?tab=funds&tx=${txHash}`)
        } else {
          toast.error(t('assets.transfers.swapFailed'))
          await handleHyperliquidTransfer(
            'FuturesDeposit',
            Number(formState.selectedFromToken?.chainId || 0),
            0,
            999,
            txHash,
            'Failed',
            undefined,
            undefined,
            nonce,
            requestId,
          )
          dispatch(exchangeActions.closeExchangeDialog())
          updateFormState({
            isLoading: false,
          })
          if (isDesktop) {
            resetForm()
          }
        }
      }
    } catch (error) {
      toast.dismiss()
      toast.error(t('assets.transfers.swapFailed'))
      await handleHyperliquidTransfer(
        'FuturesDeposit',
        Number(formState.selectedFromToken?.chainId || 0),
        0,
        999,
        '',
        'Failed',
        undefined,
        undefined,
        0,
        requestId,
      )
      dispatch(exchangeActions.closeExchangeDialog())
      if (isDesktop) {
        resetForm()
      }
    }
  }

  const depositHyperliquidNoGas = async () => {
    try {
      const result = await depositWithNoGasFee(formState.selectedToAddress, formState.fromAmount!)

      if (result.success) {
        onSuccess?.()
        dispatch(exchangeActions.closeExchangeDialog())
        if (isDesktop) {
          resetForm()
        } else {
          navigate('/assets/overview?tab=funds')
        }
      } else {
        resetForm()
      }
    } catch (error: any) {
      toast.dismiss()
      toast.error(t('assets.transfers.swapFailed'))
      dispatch(exchangeActions.closeExchangeDialog())
      resetForm()
    }
  }

  const solanaTransfer = async () => {
    const fee = Number(formState.estimatedFee || 0)
    try {
      const txHash = await sendSolanaTransfer(
        formState.selectedFromAddress,
        formState.selectedToAddress,
        Number(formState.fromAmount || 0),
        Number(formState.fromAvailableBalance || 0),
      )

      if (txHash) {
        handleSwapRecord(fee, txHash, 'Success')
        dispatch(exchangeActions.closeExchangeDialog())
        onSuccess?.()
        if (isDesktop) {
          resetForm()
        } else {
          navigate('/assets/overview?tab=funds')
        }
      } else {
        await handleSwapRecord(fee, txHash, 'Failed')
        dispatch(exchangeActions.closeExchangeDialog())
        resetForm()
      }
    } catch (err) {
      toast.error(t('assets.transfers.swapFailed'))
      dispatch(exchangeActions.closeExchangeDialog())
      updateFormState({
        buttonText: BUTTON_TEXT.Default,
        enableSwap: true,
        isLoading: false,
      })
      await handleSwapRecord(fee, '', 'Failed')
      resetForm()
    }
  }

  const crossChainTransfer = () => {
    if (!formState.transactionData) return

    const requestId = formState.transactionData.requestId
    const transactionData = formState.transactionData.items
    const swapType = formState.transactionData.type

    // check gas amount formatted with native coin. if enough gas, execute swap or show toast
    let fromNativeCoin, navtiveCoinSymbol
    if (formState.selectedFromToken?.symbol.toUpperCase() === 'USDC') {
      fromNativeCoin = tokens?.filter(
        (t) => t.chainName?.toUpperCase() === 'ARBITRUM' && t.symbol.toUpperCase() === 'ETH',
      )[0]
      navtiveCoinSymbol = 'ETH'
    } else {
      fromNativeCoin = formState.selectedFromToken
      navtiveCoinSymbol = 'SOL'
    }

    const nativeCoinBalance = fromNativeCoin?.balance

    const estimatedGas = formState.transactionData.gasAmountFormatted

    let canCoverGas = false
    if (formState.selectedFromToken?.symbol.toUpperCase() === 'SOL') {
      canCoverGas = Number(nativeCoinBalance || 0) > Number(estimatedGas || 0)
    } else {
      const nativeCoinBalanceInWei = parseEther(`${nativeCoinBalance}`)
      const gasInWei = parseEther(estimatedGas)
      canCoverGas = nativeCoinBalanceInWei > gasInWei
    }

    if (canCoverGas) {
      executeSwap(transactionData, swapType as 'rango' | 'relay', requestId)
    } else {
      toast.dismiss()
      toast.error(`${navtiveCoinSymbol} ${t('assets.transfers.notEnoughForGas')}`)
      if (isDesktop) {
        resetForm()
      } else {
        updateFormState({
          buttonText: BUTTON_TEXT.Default,
          enableSwap: true,
          isLoading: false,
        })
      }
    }
  }

  const handleSwap = async () => {
    updateFormState({
      buttonText: BUTTON_TEXT.Transfering,
    })
    // setTimer('60')

    updateFormState({
      enableSwap: false,
      isLoading: true,
    })

    // 1. contract(arb usdc) -> meme(arb usdc) : hyperliquid withdraw
    // 2. meme <-> meme:
    // 2.1. sol <-> sol: solana transfer
    // 2.2. evm <-> evm, evm <-> sol: cross chain
    // 3. meme -> contract(hyperliquid):
    // 3.1 check if usdc -> hyperliquid deposit
    // 3.2 chech if non-usdc: cross chain to usdc -> hyperliquid deposit

    if (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT && formState.toAccountType === ACCOUNT_TYPE.MEME) {
      // 1. contract(arb usdc) -> meme(arb usdc) : hyperliquid withdraw
      resetForm()
      toast.dismiss()
      showLoadingToast(t('assets.transfers.withdrawing'))
      hyperliquidWithdraw()
    } else if (formState.fromAccountType === ACCOUNT_TYPE.MEME) {
      if (formState.toAccountType === ACCOUNT_TYPE.MEME) {
        // 2. meme <-> meme
        if (formState.selectedFromToken?.name === 'Solana' && formState.selectedToToken?.name === 'Solana') {
          // 2.1. sol <-> sol: solana transfer
          solanaTransfer()
        } else {
          // 2.2. evm <-> evm, evm <-> sol: cross chain , bnb <-> sol, bnb <-> evm
          crossChainTransfer()
        }
      } else if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
        // deposit to hyperliquid
        toast.dismiss()
        showLoadingToast(t('assets.transfers.depositingToContract'))
        if (formState.selectedFromToken?.symbol.toUpperCase() === 'USDC') {
          // 使用免 gas 费用的 Permit 模式充值
          depositHyperliquidNoGas()
        } else {
          handleSwapRecord(
            Number(formState.transactionData?.gasAmountFormatted),
            '',
            'Processing',
            '',
            '',
            formState.transactionData?.requestId,
          )
          crossChainTransfer()
        }
      }
    }
  }

  const executeSwap = async (transactionData: Item[], swapType: 'rango' | 'relay', requestId: string) => {
    for (let step = 0; step < transactionData.length; step++) {
      const currentSwap = transactionData[step]

      const chainType: 'ARBITRUM' | 'ETH' | 'SOLANA' | 'BSC' = currentSwap.transactionType.toUpperCase() as
        | 'ARBITRUM'
        | 'ETH'
        | 'SOLANA'
        | 'BSC'

      const needApproveTx = currentSwap.isApprovalTx

      try {
        const txHash = await sendTransaction({
          item: currentSwap,
          chainType,
          swapType,
        })

        if (txHash) {
          if (needApproveTx) {
            const fromNativeCoinBalance =
              formState.selectedFromToken!.symbol.toUpperCase() === 'SOL'
                ? BigInt(Math.floor(parseFloat(formState.fromAvailableBalance) * 1e9))
                : formState.selectedFromToken!.symbol.toUpperCase() === 'USDC'
                  ? parseEther(
                      `${tokens?.filter((t) => t.chainName?.toUpperCase() === 'ARBITRUM' && t.symbol.toUpperCase() === 'ETH')[0].balance || 0}`,
                    )
                  : parseEther(formState.fromAvailableBalance)

            const toNativeCoinBalance =
              formState.selectedToToken!.symbol.toUpperCase() === 'SOL'
                ? BigInt(Math.floor(parseFloat(formState.toAvailableBalance) * 1e9))
                : formState.selectedToToken!.symbol.toUpperCase() === 'USDC'
                  ? parseEther(
                      `${tokens?.filter((t) => t.chainName?.toUpperCase() === 'ARBITRUM' && t.symbol.toUpperCase() === 'ETH')[0].balance || 0}`,
                    )
                  : parseEther(formState.toAvailableBalance)

            // Get approval quote and send approval transactions
            const originId =
              formState.transactionData!.type === 'relay'
                ? formState.selectedFromToken?.relayExtra.id || ''
                : formState.selectedFromToken?.rangoExtra.id || ''
            let destinationId: string
            const isRango = formState.transactionData!.type.toUpperCase() === 'RANGO'
            if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
              const usdcToken = tokens?.filter((t) => t.symbol === 'USDC')[0]
              destinationId = usdcToken ? (isRango ? usdcToken.rangoExtra.id : usdcToken.relayExtra.id) : ''
            } else {
              destinationId = isRango
                ? formState.selectedToToken!.rangoExtra.id
                : formState.selectedToToken!.relayExtra.id
            }
            const { data } = await swapService.handleGetQuote(
              formState.selectedFromAddress,
              fromNativeCoinBalance.toString(),
              originId,
              destinationId,
              formState.selectedToAddress,
              toNativeCoinBalance.toString(),
              parseUnits(`${formState.fromAmount}`, formState.selectedFromToken?.decimals || 0).toString(),
              formState.transactionData!.type,
              requestId,
            )
            const getQuoteV2Response: TransactionData = data.getQuoteV2

            for (let i = 0; i < getQuoteV2Response.items.length; i++) {
              const approvalItem = getQuoteV2Response.items[i]
              const approvalTxHash = await sendTransaction({
                item: approvalItem,
                chainType,
                swapType,
              })
              if (approvalTxHash && i + 1 === getQuoteV2Response.items.length) {
                // Only check status after the last approval tx
                await checkSwapStatus(
                  getQuoteV2Response.requestId,
                  approvalTxHash,
                  step + 1,
                  step + 1 === transactionData.length,
                )
              }
            }
          } else {
            if (step + 1 === transactionData.length) {
              await checkSwapStatus(requestId, txHash, step + 1, step + 1 === transactionData.length)
            }
          }
        }
      } catch (err) {
        toast.dismiss()
        toast.error(t('assets.transfers.swapFailed'))
        resetForm()
        dispatch(exchangeActions.closeExchangeDialog())
      }
    }
  }

  const sendTransaction = async ({
    item,
    chainType,
    swapType,
  }: {
    item: Item
    chainType: 'ARBITRUM' | 'ETH' | 'SOLANA' | 'BSC'
    swapType: 'rango' | 'relay'
  }) => {
    try {
      let txHash

      if (chainType === 'ARBITRUM' || chainType === 'ETH') {
        txHash = evmCrossChainTranser(chainType, item)
      } else if (chainType === 'BSC') {
        txHash = bscCrossChainTransfer(item)
      } else {
        txHash = solCrossChainTransfer(swapType, item)
      }

      return txHash
    } catch (error: any) {
      if (chainType !== 'SOLANA') {
        toast.error(t('assets.transfers.swapFailed'))
        await handleSwapRecord(
          Number(formState.transactionData?.gasAmountFormatted),
          '',
          'Failed',
          '',
          error,
          formState.transactionData?.requestId,
        )
        if (isDesktop) {
          resetForm()
        }
        throw new Error(`Ethereum RPC Error: ${error.message || error}`)
      } else {
        toast.error(t('assets.transfers.swapFailed'))
        await handleSwapRecord(
          Number(formState.transactionData?.gasAmountFormatted),
          '',
          'Failed',
          '',
          error,
          formState.transactionData?.requestId,
        )
        if (isDesktop) {
          resetForm()
        }
        throw new Error(`Solana RPC Error: ${error.message || error}`)
      }
    }
  }

  const checkSwapStatus = async (
    requestId: string,
    txHash: string,
    step: number,
    isLastStep: boolean = false, // Add flag to indicate if this is the final step
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const poll = async () => {
        try {
          const data = await swapService.handleSwapCheckStatus(requestId, txHash, step)
          const status = data.data.checkStatusV2.status
          if (status === 'success') {
            if (timeoutId) {
              clearTimeout(timeoutId)
            }

            if (isLastStep) {
              if (formState.toAccountType === ACCOUNT_TYPE.CONTRACT) {
                // hyperliquid deposit
                depositHyperliquid(requestId)
              } else {
                await handleSwapRecord(
                  Number(formState.transactionData?.gasAmountFormatted),
                  txHash,
                  'Success',
                  undefined,
                  undefined,
                  requestId,
                )
                onSuccess?.()
                updateFormState({ isLoading: false })
                dispatch(exchangeActions.closeExchangeDialog())
                if (isDesktop) {
                  resetForm()
                } else {
                  navigate('/assets/overview?tab=funds')
                }
              }
            }
            resolve()
          } else if (status === 'running') {
            timeoutId = setTimeout(() => poll(), 5000)
          } else {
            await handleSwapRecord(
              Number(formState.transactionData?.gasAmountFormatted),
              txHash,
              'Failed',
              undefined,
              undefined,
              requestId,
            )
            onSuccess?.()
            updateFormState({ isLoading: false })
            dispatch(exchangeActions.closeExchangeDialog())
            if (isDesktop) {
              resetForm()
            } else {
              navigate('/assets/overview?tab=funds')
            }
            resolve()
          }
        } catch (error: any) {
          await handleSwapRecord(
            Number(formState.transactionData?.gasAmountFormatted),
            txHash,
            'Failed',
            error?.code,
            error?.message,
            requestId,
          )
          onSuccess?.()
          updateFormState({ isLoading: false })
          dispatch(exchangeActions.closeExchangeDialog())
          if (isDesktop) {
            resetForm()
          } else {
            navigate('/assets/overview?tab=funds')
          }
          reject(error)
        }
      }

      poll()
    })
  }

  const handleTokenSelected = (token: Token, isFrom: boolean, walletAddress?: string) => {
    if (token.symbol.toUpperCase() === 'SOL') {
      token.balance = listWalletsByChain.filter(
        (w: UserEmbeddedWalletDto) => w.walletAddress === walletAddress,
      )[0].balance
    }

    if (isFrom) {
      let sameAddress = false
      const fromToken = formState.selectedFromToken
      if (token.symbol.toUpperCase() === 'SOL') {
        sameAddress = formState.selectedFromAddress === walletAddress
        if (fromToken === token && sameAddress) {
          updateFormState({ isTokenDrawerOpen: false })
          return
        }
      } else {
        if (fromToken === token) {
          updateFormState({ isTokenDrawerOpen: false })
          return
        }
      }
    } else {
      let sameAddress = false
      const toToken = formState.selectedToToken
      if (token.symbol.toUpperCase() === 'SOL') {
        sameAddress = formState.selectedToAddress === walletAddress
        if (toToken === token && sameAddress) {
          updateFormState({ isTokenDrawerOpen: false })
          return
        }
      } else {
        if (toToken === token) {
          updateFormState({ isTokenDrawerOpen: false })
          return
        }
      }
    }

    // setTimer('')
    if (walletAddress) {
      const wallets = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.walletAddress === walletAddress)[0]
      if (isFrom) {
        // If selected wallet is the same as to address, find alternative for to address
        if (walletAddress === formState.selectedToAddress) {
          const solWallets = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain === 'SOLANA')
          const alternativeWallet = solWallets.find((w: UserEmbeddedWalletDto) => w.walletAddress !== walletAddress)
          if (alternativeWallet) {
            updateFormState({
              ...formState,
              fromAmount: '',
              toAmount: '',
              selectedFromToken: token,
              selectedFromAddress: walletAddress,
              fromAvailableBalance: wallets.balance,
              fromDisplayedAvailableBalance: wallets.balance,
              selectedToAddress: alternativeWallet.walletAddress,
              toAvailableBalance: alternativeWallet.balance,
              toDisplayedAvailableBalance: alternativeWallet.balance,
              isTokenDrawerOpen: false,
              transactionData: undefined,
            })
          } else {
            // No alternative wallet found, just update from
            updateFormState({
              ...formState,
              fromAmount: '',
              toAmount: '',
              selectedFromToken: token,
              selectedFromAddress: walletAddress,
              fromAvailableBalance: wallets.balance,
              fromDisplayedAvailableBalance: wallets.balance,
              isTokenDrawerOpen: false,
              transactionData: undefined,
            })
          }
        } else {
          updateFormState({
            ...formState,
            fromAmount: '',
            toAmount: '',
            selectedFromToken: token,
            selectedFromAddress: walletAddress,
            fromAvailableBalance: wallets.balance,
            fromDisplayedAvailableBalance: wallets.balance,
            isTokenDrawerOpen: false,
            transactionData: undefined,
          })
        }
      } else {
        // If selected wallet is the same as from address, find alternative for from address
        if (walletAddress === formState.selectedFromAddress) {
          const solWallets = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain === 'SOLANA')
          const alternativeWallet = solWallets.find((w: UserEmbeddedWalletDto) => w.walletAddress !== walletAddress)
          if (alternativeWallet) {
            updateFormState({
              ...formState,
              selectedToAddress: walletAddress,
              fromAmount: '',
              toAmount: '',
              selectedToToken: token,
              toAvailableBalance: wallets.balance,
              toDisplayedAvailableBalance: wallets.balance,
              selectedFromAddress: alternativeWallet.walletAddress,
              fromAvailableBalance: alternativeWallet.balance,
              fromDisplayedAvailableBalance: alternativeWallet.balance,
              isTokenDrawerOpen: false,
              transactionData: undefined,
            })
          } else {
            // No alternative wallet found, just update to
            updateFormState({
              ...formState,
              selectedToAddress: walletAddress,
              fromAmount: '',
              toAmount: '',
              selectedToToken: token,
              toAvailableBalance: wallets.balance,
              toDisplayedAvailableBalance: wallets.balance,
              isTokenDrawerOpen: false,
              transactionData: undefined,
            })
          }
        } else {
          updateFormState({
            ...formState,
            selectedToAddress: walletAddress,
            fromAmount: '',
            toAmount: '',
            selectedToToken: token,
            toAvailableBalance: wallets.balance,
            toDisplayedAvailableBalance: wallets.balance,
            isTokenDrawerOpen: false,
            transactionData: undefined,
          })
        }
      }
    } else {
      handleTokenSelect(token, isFrom, walletAddress)
    }
    // 重置兑换率显示方向
    setSwapRateReversed(true)
  }

  const handleTokenDrawerToggled = (isOpen: boolean, isFrom: boolean) => {
    setIsFrom(isFrom)
    handleTokenDrawerToggle(isOpen)
  }

  const handleAccountTypeChange = (isContractAccount: boolean, isFrom: boolean) => {
    // 重置兑换率显示方向
    setSwapRateReversed(true)
    // setTimer('')

    if (isContractAccount) {
      if (isFrom) {
        updateFormState({
          fromAccountType: ACCOUNT_TYPE.CONTRACT,
          fromAvailableBalance: `${available || 0}`,
          fromDisplayedAvailableBalance: `${available || 0}`,
          selectedFromToken: tokens?.filter(
            (token) => token.chainName?.toUpperCase() === 'ARBITRUM' && token.symbol === 'USDC',
          )[0],
          selectedFromAddress: evmWallet,
          fromAmount: '',
          toAmount: '',
          transactionData: undefined,
          estimatedFee: undefined,
          estimatedTime: undefined,
        })
      } else {
        updateFormState({
          toAccountType: ACCOUNT_TYPE.CONTRACT,
          toAvailableBalance: `${available || 0}`,
          toDisplayedAvailableBalance: `${available || 0}`,
          selectedToToken: tokens?.filter(
            (token) => token.chainName?.toUpperCase() === 'ARBITRUM' && token.symbol === 'USDC',
          )[0],
          selectedToAddress: evmWallet,
          fromAmount: '',
          toAmount: '',
          transactionData: undefined,
          estimatedFee: undefined,
          estimatedTime: undefined,
        })
      }
    } else {
      if (isFrom) {
        const fromToken = tokens?.filter((t) => t.symbol.toUpperCase() !== 'USDC')[0]
        let address = ''
        if (fromToken?.symbol.toUpperCase() === 'SOL') {
          address = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain.toUpperCase() === 'SOLANA')[0]
            .walletAddress
        } else {
          address = evmWallet
        }
        updateFormState({
          fromAmount: '',
          fromAccountType: ACCOUNT_TYPE.MEME,
          selectedFromToken: fromToken,
          fromAvailableBalance: `${fromToken?.balance || 0}`,
          fromDisplayedAvailableBalance: `${fromToken?.balance || 0}`,
          selectedFromAddress: address,
          toAmount: '',
          transactionData: undefined,
          estimatedFee: undefined,
          estimatedTime: undefined,
        })
      } else {
        if (formState.selectedFromToken?.symbol.toUpperCase() === 'USDC') {
          const solToken = tokens?.filter((t) => t.symbol.toUpperCase() === 'SOL')[0]
          const solAddress = listWalletsByChain.filter(
            (w: UserEmbeddedWalletDto) => w.chain.toUpperCase() === 'SOLANA',
          )[0].walletAddress
          updateFormState({
            fromAmount: '',
            toAccountType: ACCOUNT_TYPE.MEME,
            selectedToToken: solToken,
            toAvailableBalance: `${solToken?.balance || 0}`,
            toDisplayedAvailableBalance: `${solToken?.balance || 0}`,
            selectedToAddress: solAddress,
            toAmount: '',
            transactionData: undefined,
            estimatedFee: undefined,
            estimatedTime: undefined,
          })
        } else {
          const toToken = formState.selectedToToken

          let address = ''
          if (toToken?.symbol.toUpperCase() === 'SOL') {
            address = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain.toUpperCase() === 'SOLANA')[0]
              .walletAddress
          } else {
            address = evmWallet
          }

          const toDisplayedToken = fixBigNumber(`${toToken?.balance || 0}`, toToken?.decimals || 4)
          updateFormState({
            fromAmount: '',
            toAmount: '',
            transactionData: undefined,
            toAccountType: ACCOUNT_TYPE.MEME,
            toAvailableBalance: `${toToken?.balance}`,
            toDisplayedAvailableBalance: toDisplayedToken,
            selectedToAddress: address,
          })
        }
      }
    }
  }

  const handleWalletSelect = (walletAddress: string, isFrom: boolean) => {
    const wallets = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.walletAddress === walletAddress)[0]

    if (isFrom) {
      if (formState.selectedFromToken?.symbol.toUpperCase() === 'SOL') {
        // If selected wallet is the same as to address, find alternative for to address
        if (walletAddress === formState.selectedToAddress) {
          const solWallets = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain === 'SOLANA')
          const alternativeWallet = solWallets.find((w: UserEmbeddedWalletDto) => w.walletAddress !== walletAddress)
          if (alternativeWallet) {
            updateFormState({
              selectedFromAddress: walletAddress,
              fromAvailableBalance: wallets.balance,
              fromDisplayedAvailableBalance: wallets.balance,
              selectedToAddress: alternativeWallet.walletAddress,
              toAvailableBalance: alternativeWallet.balance,
              toDisplayedAvailableBalance: alternativeWallet.balance,
            })
          } else {
            // No alternative wallet found, just update from address
            updateFormState({
              selectedFromAddress: walletAddress,
              fromAvailableBalance: wallets.balance,
              fromDisplayedAvailableBalance: wallets.balance,
            })
          }
        } else {
          updateFormState({
            selectedFromAddress: walletAddress,
            fromAvailableBalance: wallets.balance,
            fromDisplayedAvailableBalance: wallets.balance,
          })
        }
      }
    } else {
      if (formState.selectedToToken?.symbol.toUpperCase() === 'SOL') {
        // If selected wallet is the same as from address, find alternative for from address
        if (walletAddress === formState.selectedFromAddress) {
          const solWallets = listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain === 'SOLANA')
          const alternativeWallet = solWallets.find((w: UserEmbeddedWalletDto) => w.walletAddress !== walletAddress)
          if (alternativeWallet) {
            updateFormState({
              selectedToAddress: walletAddress,
              toAvailableBalance: wallets.balance,
              toDisplayedAvailableBalance: wallets.balance,
              selectedFromAddress: alternativeWallet.walletAddress,
              fromAvailableBalance: alternativeWallet.balance,
              fromDisplayedAvailableBalance: alternativeWallet.balance,
            })
          } else {
            // No alternative wallet found, just update to address
            updateFormState({
              selectedToAddress: walletAddress,
              toAvailableBalance: wallets.balance,
              toDisplayedAvailableBalance: wallets.balance,
            })
          }
        } else {
          updateFormState({
            selectedToAddress: walletAddress,
            toAvailableBalance: wallets.balance,
            toDisplayedAvailableBalance: wallets.balance,
          })
        }
      }
    }
  }

  const handleMessageDrawerClose = async (isBtnClick: boolean) => {
    const swapType = formState.transactionData?.type
    setOpenDrawer(false)
    if (isBtnClick && swapType === 'rango') {
      if (formState.transactionData) {
        executeSwap(formState.transactionData.items, swapType, formState.transactionData.requestId)
      }
    }
  }

  // 当 source === 'futures' 时，自动触发账户类型变更
  useEffect(() => {
    // Only run on initial mount or when source actually changes
    if (isInitialMountRef.current || prevSourceRef.current !== source) {
      if (source === 'futures' && tokens) {
        // entry page is future
        if (action === 'withdraw') {
          handleAccountTypeChange(true, true)
        } else {
          handleAccountTypeChange(true, false)
        }
      } else if (isInitialMountRef.current && tokens) {
        // Only initialize on mount, not on every tokens change
        // entry page is meme
        const fromToken = tokens?.filter((t) => t.symbol.toUpperCase() !== 'USDC')[0]
        let address = ''
        if (fromToken?.symbol.toUpperCase() === 'SOL') {
          address =
            listWalletsByChain.filter((w: UserEmbeddedWalletDto) => w.chain.toUpperCase() === 'SOLANA')[0]
              ?.walletAddress || ''
        } else {
          address = evmWallet || ''
        }

        if (fromToken && usdcToken) {
          const fromDisplayedBalance = fixBigNumber(`${fromToken?.balance || 0}`, Number(fromToken?.decimals || 5))
          const toDisplayedBalance = fixBigNumber(`${usdcToken?.balance || 0}`, Number(usdcToken?.decimals || 4))
          updateFormState({
            fromAccountType: ACCOUNT_TYPE.MEME,
            selectedFromToken: fromToken,
            fromAvailableBalance: `${fromToken?.balance || 0}`,
            fromDisplayedAvailableBalance: fromDisplayedBalance,
            selectedFromAddress: address,
            toAccountType: ACCOUNT_TYPE.MEME,
            selectedToToken: usdcToken,
            toAvailableBalance: `${usdcToken?.balance || 0}`,
            toDisplayedAvailableBalance: toDisplayedBalance,
          })
        }
      }
      isInitialMountRef.current = false
      prevSourceRef.current = source
    }
  }, [source, tokens, action])

  // Set selectedToToken when initialToToken exists (only once)
  useEffect(() => {
    if (initialToToken && tokens && !hasInitializedToTokenRef.current) {
      const toToken = tokens.find((t) => t.symbol === initialToToken)
      if (toToken) {
        handleTokenSelect(toToken, false, activeWallet.walletAddress)
        if (toToken.symbol === tokens[0].symbol && toToken.chainId === tokens[0].chainId) {
          const fromToken = tokens.find((t) => t.symbol === 'USDC')
          if (fromToken) {
            handleTokenSelect(fromToken, true, evmWallet)
          }
        }
        hasInitializedToTokenRef.current = true
      }
    }
  }, [initialToToken, tokens])

  // 计算兑换率显示
  const getDisplaySwapRate = () => {
    if (!formState.selectedFromToken || !formState.selectedToToken) {
      return formState.swapRate
    }

    // 对于合约账户之间的 USDC 转换，直接返回原始 swapRate
    if (
      (formState.fromAccountType === ACCOUNT_TYPE.CONTRACT || formState.toAccountType === ACCOUNT_TYPE.CONTRACT) &&
      formState.selectedFromToken?.symbol.toUpperCase() === 'USDC' &&
      formState.selectedToToken?.symbol.toUpperCase() === 'USDC'
    ) {
      return formState.swapRate
    }
    // 对于跨链或其他情况，计算实际的兑换率
    const fromUSDPrice = formState.selectedFromToken.usdPrice
    const toUSDPrice = formState.selectedToToken.usdPrice
    const fromToken = formState.selectedFromToken.symbol
    const toToken = formState.selectedToToken.symbol

    if (!fromUSDPrice || !toUSDPrice) {
      return formState.swapRate
    }

    if (swapRateReversed) {
      // 反向：1 fromToken ≈ x toToken
      const rate = formatAmount(MathFun.div(fromUSDPrice, toUSDPrice).toString(), {
        roundMode: 'floor',
        unit: toToken,
      })
      return `1 ${fromToken} ≈ ${rate}`
    } else {
      // 正向：1 toToken ≈ x fromToken
      const rate = formatAmount(MathFun.div(toUSDPrice, fromUSDPrice).toString(), {
        roundMode: 'floor',
        unit: fromToken,
      })
      return `1 ${toToken} ≈ ${rate}`
    }
  }

  // 兑换率切换
  const handleChangeSwapRate = () => {
    setSwapRateReversed(!swapRateReversed)
  }

  // useEffect(() => {
  //   if (Number(timer) <= 0) {
  //     return
  //   }
  //   const interval = setInterval(() => {
  //     setTimer((prev) => {
  //       if (Number(prev) <= 1) {
  //         clearInterval(interval)
  //         return '0'
  //       }
  //       return `${Number(prev) - 1}`
  //     })
  //   }, 1000)

  //   return () => clearInterval(interval)
  // }, [timer])

  const { isDesktop } = useResponsive()

  return (
    <div className={cn('space-y-2', !isDesktop && 'px-3 pb-12')}>
      {!isDesktop && (
        <h5 className="app-font-medium mt-5 font-[15px]">{t('assets.transfers.selectTokenDescription')}</h5>
      )}
      <div className="relative z-[5]">
        <TokenInput
          label={t('assets.transfers.fromAccount')}
          token={formState.selectedFromToken}
          defaultTokenImage={defaultTokenImage}
          defaultTokenSymbol={defaultTokenSymbol}
          defaultChainLogo={getBlockchainLogo2(activeWallet?.chainId || '')}
          showPrice={true}
          amount={formState.fromAmount}
          balance={formState.fromAvailableBalance}
          displayedBalance={formState.fromDisplayedAvailableBalance}
          walletAddress={formState.selectedFromAddress}
          onTokenSelect={() => handleTokenDrawerToggled(true, true)}
          onTokenChange={(token) => {
            const walletAddress = token.chainName === 'SOLANA' ? formState.selectedFromAddress : undefined
            handleTokenSelect(token, true, walletAddress)
            setSwapRateReversed(true)
          }}
          onAmountChange={handleAmountChange}
          onMaxClick={handleMaxClick}
          onAccountTypeChange={(isContractAccount) => handleAccountTypeChange(isContractAccount, true)}
          usdPrice={formState.selectedFromToken?.usdPrice || 0}
          isContractAccountType={formState.fromAccountType === ACCOUNT_TYPE.CONTRACT}
          onWalletSelect={(walletAddress) => handleWalletSelect(walletAddress, true)}
          excludeWallet={formState.selectedToAddress}
        />

        <ButtonShadowGradient
          className="absolute -bottom-5 left-1/2 flex h-[32px] w-[32px] -translate-x-1/2 items-center justify-center rounded-full"
          onClick={handleFromToSwap}
        >
          <IconSwap2 className="h-[17px] w-[15px] text-white" />
        </ButtonShadowGradient>
      </div>
      <TokenInput
        label={t('assets.transfers.toAccount')}
        token={formState.selectedToToken}
        defaultTokenImage="/images/cryptoDeposit/usdc.svg"
        defaultTokenSymbol="USDC"
        defaultChainLogo="/images/cryptoDeposit/arbitrum-chain.png"
        amount={formState.toAmount || ''}
        balance={formState.toAvailableBalance}
        displayedBalance={formState.toDisplayedAvailableBalance}
        walletAddress={formState.selectedToAddress}
        disabled={true}
        usdPrice={formState.selectedToToken?.usdPrice || 0}
        showPrice={true}
        onTokenSelect={() => handleTokenDrawerToggled(true, false)}
        onTokenChange={(token) => {
          const walletAddress = token.chainName === 'SOLANA' ? formState.selectedToAddress : undefined
          handleTokenSelect(token, false, walletAddress)
          setSwapRateReversed(true)
        }}
        onAmountChange={() => {}}
        onMaxClick={() => {}}
        onAccountTypeChange={(isContractAccount) => handleAccountTypeChange(isContractAccount, false)}
        isContractAccountType={formState.toAccountType === ACCOUNT_TYPE.CONTRACT}
        onWalletSelect={(walletAddress) => handleWalletSelect(walletAddress, false)}
        excludeWallet={formState.selectedFromAddress}
        isTokenSelectable={
          !(formState.fromAccountType === ACCOUNT_TYPE.CONTRACT && formState.toAccountType === ACCOUNT_TYPE.MEME)
        }
      />

      {formState.warning !== '' && (
        <div className="mt-4 rounded-[8px] bg-[#E146501A] p-2 text-left text-[calc(11rem/16)] text-[#FFFFFF]">
          <p>{formState.warning}</p>
        </div>
      )}

      {(formState.fromAccountType === ACCOUNT_TYPE.CONTRACT || formState.toAccountType === ACCOUNT_TYPE.CONTRACT) &&
        formState.warning === '' &&
        !formState.transactionData &&
        !formState.isQuoteing && (
          <>
            {formState.swapRate && (
              <div className="flex flex-row items-center justify-between pt-[10px]">
                <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
                  {t('assets.transfers.swapRate')}
                </span>
                <div className="inline-flex items-center gap-1">
                  <span className="px-[6px] text-[13px]">{getDisplaySwapRate()}</span>
                  <img src="/images/cryptoDeposit/swap-solid.svg" alt="swap" className="h-[15px] w-[14px]" />
                </div>
              </div>
            )}
            {formState.estimatedTime && (
              <div className="flex flex-row items-center justify-between pt-[10px]">
                <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
                  {t('assets.transfers.estimatedTime')}
                </span>
                <span className="text-[13px]">{formState.estimatedTime}s</span>
              </div>
            )}
            {formState.estimatedFee && (
              <div className="flex flex-row items-center justify-between pt-[10px]">
                <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
                  {/* 合约-meme 提币操作，显示网络费 */}
                  {formState.fromAccountType === ACCOUNT_TYPE.CONTRACT && formState.toAccountType === ACCOUNT_TYPE.MEME
                    ? t('assets.transfers.fee')
                    : t('assets.transfers.estimatedFee')}
                </span>
                <span className="text-[13px]">
                  {formatAmount(formState.estimatedFee.toString(), {
                    roundMode: 'ceil',
                    showCurrency: true,
                  })}
                </span>
              </div>
            )}
          </>
        )}

      {formState.selectedFromToken?.symbol.toUpperCase() === 'SOL' &&
        formState.selectedToToken?.symbol.toUpperCase() === 'SOL' &&
        formState.warning === '' &&
        Number(formState.fromAmount || 0) > 0 && (
          <>
            <div className="flex flex-row items-center justify-between pt-[10px]">
              <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
                {t('assets.transfers.swapRate')}
              </span>
              <span className="text-[13px]">1 SOL = 1 SOL</span>
            </div>
            <div className="flex flex-row items-center justify-between pt-[10px]">
              <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
                {t('assets.transfers.estimatedFee')}
              </span>
              <span className="text-[13px]">
                {formatAmount(formState.estimatedFee ? formState.estimatedFee : 0.000015, {
                  unit: 'SOL',
                })}
              </span>
            </div>
          </>
        )}
      {formState.isQuoteing && (
        <div className="app-font-light mt-2 flex h-[36px] items-center justify-center text-center text-[calc(1rem*(13/16))] text-[#FFFFFFB2]">
          <div className="relative mr-1.5 h-[16px] w-[16px]">
            <span className="filledLoadingSpinner transition-transform"></span>
          </div>
          {t('assets.transfers.fetchingPrice')}
        </div>
      )}
      {!formState.isQuoteing && formState.transactionData && (
        <>
          <div className="flex flex-row items-center justify-between pt-[10px]">
            <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
              {t('assets.transfers.swapRate')}
            </span>
            <div className="inline-flex items-center gap-1">
              <span className="px-[6px] text-[13px]">{getDisplaySwapRate()}</span>
              <img
                src="/images/cryptoDeposit/swap-solid.svg"
                alt="swap solid"
                className="h-[15px] w-[14px] cursor-pointer"
                onClick={handleChangeSwapRate}
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between pt-[10px]">
            <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
              {t('assets.transfers.estimatedTime')}
            </span>
            <span className="text-[13px]">{formState.transactionData.estimatedTimeInSeconds}s</span>
          </div>

          <div className="flex flex-row items-center justify-between pt-[10px]">
            <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
              {t('assets.transfers.estimatedFee')}
            </span>
            <span className="text-[13px]">{`${formatAmount(formState.transactionData.gasAmountFormatted, {
              roundMode: 'ceil',
              unit: formState.selectedFromToken?.symbol.toUpperCase(),
            })}`}</span>
          </div>

          {formState.selectedFromToken?.chainId !== formState.selectedToToken?.chainId && (
            <div className="flex flex-row items-center justify-between pt-[10px]">
              <span className="inline-flex items-center gap-1 text-[13px] text-[#FFFFFFB2]">
                {t('assets.transfers.crossChainFee')}
              </span>
              <span className="text-[13px]">{`${formatAmount(formState.transactionData.platformFeeAmountFormat, {
                roundMode: 'ceil',
                unit: formState.transactionData.platformFeeSymbol,
              })}`}</span>
            </div>
          )}

          {formState.noArbEth && (
            <div className="relative mt-1 p-[1px]">
              <div className="flex flex-row items-center justify-between pt-[10px]">
                {isDesktop ? (
                  <div className="inline-flex items-center gap-1">
                    <span className="text-[13px] text-[#FFFFFFB2]">{t('assets.transfers.reserveArbitrumEth')}</span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <img
                            src="/images/cryptoDeposit/info-circle.svg"
                            className="cursor-pointer"
                            alt="icon info circle"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] rounded-md border border-[#79778C29] bg-[#212127] p-2 text-[12px] font-[330] text-[#908E98]">
                          <div>
                            {t('assets.transfers.systemWillAutoSwap', {
                              amount: formState.transactionData
                                ? formatAmount(formState.transactionData.gasTopupAmountUsd, {
                                    roundMode: 'ceil',
                                  })
                                : '$2.00',
                              amountFormatted: formatAmount(formState.transactionData?.gasTopupAmountFormatted || '0', {
                                roundMode: 'ceil',
                              }),
                              token: formState.selectedFromToken?.symbol,
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <span
                    className="inline-flex cursor-pointer items-center gap-1 text-[13px] text-[#FFFFFFB2]"
                    onClick={() => {
                      setOpenDrawer(!openDrawer)
                      setDrawerBtxText(t('assets.transfers.iKnow'))
                      setDrawerDescription(
                        t('assets.transfers.systemWillAutoSwap', {
                          amount: formState.transactionData
                            ? formatAmount(formState.transactionData.gasTopupAmountUsd)
                            : '$2.00',
                          amountFormatted: formatAmount(formState.transactionData?.gasTopupAmountFormatted || '0', {
                            roundMode: 'ceil',
                          }),
                          token: formState.selectedFromToken?.symbol,
                        }),
                      )
                      setDrawerType('info')
                    }}
                  >
                    {t('assets.transfers.reserveArbitrumEth')}
                    <span>
                      <img src="/images/cryptoDeposit/info-circle.svg" alt="icon info circle" />
                    </span>
                  </span>
                )}
                <span className="rounded-[4px] text-[13px]">{`${formatAmount(
                  formState.transactionData.gasTopupAmountUsd,
                  {
                    showCurrency: true,
                  },
                )} (${formatAmount(formState.transactionData.gasTopupAmountFormatted, {
                  roundMode: 'ceil',
                  unit: formState.selectedFromToken?.symbol,
                })})`}</span>
              </div>
            </div>
          )}
        </>
      )}

      {formState.error && (
        <div className="mt-4 rounded-md p-3 text-[#FF0000]">
          <p>{formState.error}</p>
        </div>
      )}
      <div className="mt-4 border-t border-[#79778C29] pt-3">
        {formState.enableSwap && formState.warning === '' ? (
          <ButtonShadowGradient
            className="h-[44px] w-full rounded-full text-white"
            onClick={() => handleSwap()}
            isLoading={formState.isLoading}
            disabled={!formState.enableSwap || formState.isLoading}
          >
            {formState.buttonText}
          </ButtonShadowGradient>
        ) : (
          <ButtonShadowGradient className="w-full rounded-full text-white" isLoading={formState.isLoading} disabled>
            {formState.buttonText}
            {/* {timer} */}
          </ButtonShadowGradient>
        )}
      </div>
      <AppDrawer
        isShowBgImg={false}
        open={formState.isTokenDrawerOpen}
        setOpen={(value: boolean | ((prevState: boolean) => boolean)) => {
          if (typeof value === 'function') {
            handleTokenDrawerToggle(value(formState.isTokenDrawerOpen))
          } else {
            handleTokenDrawerToggle(value)
          }
        }}
        // title={<span className="text-[18px]">{t('assets.transfers.selectToken')}</span>}
        maxHeight="80vh"
        drawerClassName=""
        drawerContentClassName="overflow-y-clip"
        drawerContent={
          <TokenSelectorDrawer
            onSelected={handleTokenSelected}
            defaultShow={
              formState.selectedFromToken?.chainName === 'SOLANA' || formState.selectedToToken?.chainName === 'SOLANA'
            }
            openForm={isFrom ? 'FromToken' : 'ToToken'}
            selectedFromToken={formState.selectedFromToken}
            selectedToToken={formState.selectedToToken}
            selectedFromAddress={formState.selectedFromAddress}
            selectedToAddress={formState.selectedToAddress}
          />
        }
      />

      <MessageDrawer
        open={openDrawer}
        type={drawerType}
        buttonTitle={drawerBtxText}
        text={drawerDescription}
        onClose={(isBtnClick) => handleMessageDrawerClose(isBtnClick)}
      />
    </div>
  )
}

export default TransferForm
