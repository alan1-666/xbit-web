import { swapTokenSelector, updateSwapForm } from '@/redux/modules/swap.slice'
import { useAppDispatch, useAppSelector, RootState } from '@/redux/store'
import { SwapFormState, Token } from '../lib/types'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import { ACCOUNT_TYPE } from '../lib/constants'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { useSendTransaction } from './useSendTransaction'
import { MathFun } from '@/lib/utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Configs } from '@const/configs.ts'
import axios from 'axios'
import BigNumber from 'bignumber.js'

const lamportsFee = 5000 // a solana signature is about equal to 5000 lamports

/**
 * Get the default token symbol for MEME swaps based on enabled chains.
 * Prioritizes SOL if Solana is enabled, otherwise BNB if BSC is enabled.
 * Defaults to SOL for future multi-chain support.
 */
const getDefaultTokenNameForMeme = () => {
  if (Configs.enableSolana()) return 'SOL'
  if (Configs.enableBSC()) return 'BNB'
  if (Configs.enableMonad()) return 'MON'
  return 'MON' // TODO: change to MEME when other chains are supported
}

/**
 * Get the default token object for MEME swaps from the provided token list.
 * @param tokens - The list of available tokens.
 * @returns The default token object for MEME swaps, or undefined if not found.
 */
const getDefaultTokenForMeme = (tokens: Token[] | undefined) => {
  const defaultTokenName = getDefaultTokenNameForMeme()
  return tokens?.find((t) => t.symbol.toUpperCase() === defaultTokenName)
}

export const useSwapForm = () => {
  const dispatch = useAppDispatch()
  const swapInfo = useAppSelector<RootState, SwapFormState>((state) => state.swapInfo)
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const RELAY = Configs.getRelayHost()

  const swapTokens = useAppSelector(swapTokenSelector)
  const { withdrawable, positions } = useWebData2()

  const available = useMemo(() => {
    if (withdrawable) {
      if (positions && positions.length > 0) {
        return withdrawable - withdrawable * 0.01 // 1% buffer to ensure withdrawable
      }
      return +withdrawable
    }
    return 0
  }, [withdrawable, positions])

  const { checkIfNewSolAccountAndGetRent } = useSendTransaction()
  const pollRef = useRef<NodeJS.Timeout | number | null>(null)
  const lastQuoteParamsRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const swapWallets = useMemo(() => {
    return listWalletsByChain.reduce((acc: any, w: any) => {
      if (w.chain === 'SOLANA' || w.chain === 'BSC' || w.chain === 'MON') {
        if (!acc[w.chain]) {
          acc[w.chain] = []
        }
        acc[w.chain][w.walletAddress] = w
      }
      return acc
    }, {})
  }, [listWalletsByChain])

  const perpsAddress = useMemo(() => {
    return listWalletsByChain.filter((w: any) => w.chain === 'ARB')?.[0].walletAddress
  }, [listWalletsByChain])

  const bnbWallets = useMemo(() => {
    return listWalletsByChain.filter((w: any) => w.chain.toUpperCase() === 'BSC')
  }, [listWalletsByChain])

  const monWallets = useMemo(() => {
    return listWalletsByChain.filter((w: any) => w.chain.toUpperCase() === 'MON')
  }, [listWalletsByChain])

  const solWallets = useMemo(() => {
    return listWalletsByChain.filter((w: any) => w.chain.toUpperCase() === 'SOLANA')
  }, [listWalletsByChain])

  const defaultMemeWallets = useMemo(() => {
    if (Configs.enableSolana()) return solWallets
    if (Configs.enableBSC()) return bnbWallets
    if (Configs.enableMonad()) return monWallets
    return solWallets // TODO: change to MEME when other chains are supported
  }, [solWallets, bnbWallets, monWallets])

  const initSwapForm = useCallback(
    (tokens?: Token[], isFromMeme: boolean = false) => {
      let t
      if (swapTokens) {
        t = swapTokens
      } else {
        t = tokens
      }

      if (!t) return

      const memeToken = getDefaultTokenForMeme(tokens)
      const usdc = t?.filter((t) => t.symbol.toUpperCase() === 'USDC')[0]

      const fromToken = isFromMeme ? usdc : memeToken
      const toToken = isFromMeme ? memeToken : usdc

      const fromAccountType = isFromMeme ? ACCOUNT_TYPE.Perps : ACCOUNT_TYPE.MEME
      const toAccountType = isFromMeme ? ACCOUNT_TYPE.MEME : ACCOUNT_TYPE.Perps
      dispatch(
        updateSwapForm({
          ...swapInfo,
          fromAccountType: fromAccountType,
          toAccountType: toAccountType,
          fromAmount: null,
          fromToken: fromToken || null,
          fromWalletAddress: isFromMeme ? perpsAddress : defaultMemeWallets[0]?.walletAddress,
          fromAvailableBalance: isFromMeme ? available : defaultMemeWallets[0]?.balance,
          fromDisplayedAvailableBalance: isFromMeme ? available : defaultMemeWallets[0]?.balance,
          toAmount: null,
          toToken: toToken || null,
          toWalletAddress: !isFromMeme ? perpsAddress : defaultMemeWallets[0]?.walletAddress,
          toAvailableBalance: !isFromMeme ? available : defaultMemeWallets[0]?.balance,
          toDisplayedAvailableBalance: !isFromMeme ? available : defaultMemeWallets[0]?.balance,
          isLoading: false,
          errors: null,
        }),
      )
    },
    [swapTokens, defaultMemeWallets],
  )

  useEffect(() => {
    const solWs = listWalletsByChain.filter((w: any) => w.chain.toUpperCase() === 'SOLANA')
    const bnbW = listWalletsByChain.find((w: any) => w.chain.toUpperCase() === 'BSC')
    const monW = listWalletsByChain.find((w: any) => w.chain.toUpperCase() === 'MON')

    const solFromW = solWs.find((w: any) => w.walletAddress === swapInfo.fromWalletAddress)
    const solToW = solWs.find((w: any) => w.walletAddress === swapInfo.toWalletAddress)

    const updates: any = {}

    // FROM
    if (swapInfo.fromToken?.symbol?.toUpperCase() === 'USDC') {
      if (Number(swapInfo.fromAvailableBalance || 0) !== available) {
        updates.fromAvailableBalance = available
        updates.fromDisplayedAvailableBalance = available
      }
    } else if (swapInfo.fromToken?.symbol?.toUpperCase() === 'BNB') {
      const bal = bnbW?.balance ?? 0
      if (swapInfo.fromAvailableBalance !== bal) {
        updates.fromAvailableBalance = bal
        updates.fromDisplayedAvailableBalance = bal
      }
    } else if (swapInfo.fromToken?.symbol?.toUpperCase() === 'MON') {
      const bal = monW?.balance ?? 0
      if (swapInfo.fromAvailableBalance !== bal) {
        updates.fromAvailableBalance = bal
        updates.fromDisplayedAvailableBalance = bal
      }
    } else if (swapInfo.fromToken?.symbol?.toUpperCase() === 'SOL') {
      const bal = solFromW?.balance ?? 0
      if (swapInfo.fromAvailableBalance !== bal) {
        updates.fromAvailableBalance = bal
        updates.fromDisplayedAvailableBalance = bal
      }
    }

    // TO
    if (swapInfo.toToken?.symbol?.toUpperCase() === 'USDC') {
      if (Number(swapInfo.toAvailableBalance || 0) !== available) {
        updates.toAvailableBalance = available
        updates.toDisplayedAvailableBalance = available
      }
    } else if (swapInfo.toToken?.symbol?.toUpperCase() === 'BNB') {
      const bal = bnbW?.balance ?? 0
      if (swapInfo.toAvailableBalance !== bal) {
        updates.toAvailableBalance = bal
        updates.toDisplayedAvailableBalance = bal
      }
    } else if (swapInfo.toToken?.symbol?.toUpperCase() === 'MON') {
      const bal = monW?.balance ?? 0
      if (swapInfo.toAvailableBalance !== bal) {
        updates.toAvailableBalance = bal
        updates.toDisplayedAvailableBalance = bal
      }
    } else if (swapInfo.toToken?.symbol?.toUpperCase() === 'SOL') {
      const bal = solToW?.balance ?? 0
      if (swapInfo.toAvailableBalance !== bal) {
        updates.toAvailableBalance = bal
        updates.toDisplayedAvailableBalance = bal
      }
    }

    if (Object.keys(updates).length > 0) {
      dispatch(
        updateSwapForm({
          ...swapInfo,
          ...updates,
        }),
      )
    }
  }, [
    available,
    listWalletsByChain,
    swapInfo.fromToken?.symbol,
    swapInfo.toToken?.symbol,
    swapInfo.fromWalletAddress,
    swapInfo.toWalletAddress,
  ])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      if ((window as any).__swapQuoteInterval) {
        clearInterval((window as any).__swapQuoteInterval)
        ;(window as any).__swapQuoteInterval = null
      }
      lastQuoteParamsRef.current = null
    }
  }, [])

  const handleUpToDown = () => {
    dispatch(
      updateSwapForm({
        ...swapInfo,
        fromAccountType: swapInfo.toAccountType,
        fromAmount: '',
        fromToken: swapInfo.toToken,
        fromWalletAddress: swapInfo.toWalletAddress,
        fromAvailableBalance: swapInfo.toAvailableBalance,
        fromDisplayedAvailableBalance: swapInfo.toDisplayedAvailableBalance,

        toAccountType: swapInfo.fromAccountType,
        toAmount: '',
        toToken: swapInfo.fromToken,
        toWalletAddress: swapInfo.fromWalletAddress,
        toAvailableBalance: swapInfo.fromAvailableBalance,
        toDisplayedAvailableBalance: swapInfo.toDisplayedAvailableBalance,
        errors: null,
      }),
    )
  }

  const resetSwapForm = () => {
    dispatch(
      updateSwapForm({
        ...swapInfo,
        fromAmount: null,
        toAmount: null,
        transactionData: null,
        errors: null,
        isLoading: false,
        isQuoteing: false,
      }),
    )
  }

  const fetchQuote = async (params: {
    fromTokenId: string
    toTokenId: string
    toWalletAddress: string
    amount: string
    decimals: number
  }) => {
    // Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const amountForQuote = new BigNumber(params.amount)
        .multipliedBy(new BigNumber(10).pow(params.decimals))
        .toFixed(0, BigNumber.ROUND_DOWN)
      const relayPayload = {
        user: swapInfo?.fromWalletAddress,
        originChainId: swapInfo?.fromToken?.chainList?.[0].chainId,
        destinationChainId: swapInfo?.toToken?.chainList?.[0].chainId,
        originCurrency: swapInfo?.fromToken?.chainList?.[0].address,
        destinationCurrency: swapInfo?.toToken?.chainList?.[0].address,
        amount: amountForQuote,
        tradeType: 'EXACT_INPUT',
        recipient: params.toWalletAddress,
      }

      const { data } = await axios.post(`${RELAY}/quote/v2`, relayPayload, { signal: controller.signal })

      if (data) {
        dispatch(
          updateSwapForm({
            ...swapInfo,
            fromAmount:
              swapInfo.fromToken?.symbol.toUpperCase() === 'SOL'
                ? MathFun.div(
                    MathFun.add(MathFun.mul(Number(params.amount), LAMPORTS_PER_SOL), lamportsFee),
                    LAMPORTS_PER_SOL,
                  )
                : params.amount,
            toAmount: data?.details?.currencyOut?.amountFormatted || '0',
            transactionData: data,
            isQuoteing: false,
            errors: null,
          }),
        )
      }
    } catch (e: any) {
      if (axios.isCancel(e) || e?.name === 'AbortError' || e?.code === 'ERR_CANCELED') return
      console.error('Error fetching quote:', e)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    value = value.replace(/,/g, '')

    handleAmountChange(value)
  }

  const handleAmountChange = async (amount: string) => {
    if (amount === '' || /^\d*\.?\d*$/.test(amount)) {
      amount = amount.replace(/^0+(?!\.)/, '')
      if (amount.startsWith('.')) {
        amount = '0' + amount
      }
      const updatedSwapInfo = {
        ...swapInfo,
        fromAmount: amount,
        isQuoteing:
          amount !== '' &&
          !(swapInfo.fromToken?.symbol.toUpperCase() === 'SOL' && swapInfo.toToken?.symbol.toUpperCase() === 'SOL'),
      }
      dispatch(updateSwapForm(updatedSwapInfo))

      if (swapInfo.fromToken?.symbol.toUpperCase() === 'SOL' && swapInfo.toToken?.symbol.toUpperCase() === 'SOL') {
        dispatch(
          updateSwapForm({
            ...swapInfo,
            fromAmount: amount,
            toAmount: amount,
          }),
        )
        return
      }

      const params = {
        fromTokenId: updatedSwapInfo.fromToken?.tokenId || '',
        toTokenId: updatedSwapInfo.toToken?.tokenId || '',
        toWalletAddress: updatedSwapInfo.toWalletAddress,
        amount:
          updatedSwapInfo.fromToken?.symbol.toUpperCase() === 'SOL'
            ? MathFun.div(MathFun.sub(Number(amount) * LAMPORTS_PER_SOL, lamportsFee), LAMPORTS_PER_SOL)
            : amount,
        decimals: updatedSwapInfo.fromToken?.decimals || 0,
      }

      const paramsKey = JSON.stringify(params)

      if (!Number(amount || 0)) {
        if (pollRef.current) clearInterval(pollRef.current)
        pollRef.current = null
        lastQuoteParamsRef.current = null

        dispatch(
          updateSwapForm({
            ...swapInfo,
            fromAmount: amount,
            toAmount: null,
            transactionData: null,
          }),
        )
        return
      }

      if (lastQuoteParamsRef.current !== paramsKey) {
        lastQuoteParamsRef.current = paramsKey

        // defensively clear any previously stored global interval
        if ((window as any).__swapQuoteInterval) {
          clearInterval((window as any).__swapQuoteInterval)
          ;(window as any).__swapQuoteInterval = null
        }

        fetchQuote(params)

        const id = window.setInterval(() => {
          fetchQuote(params)
        }, 15000)
        pollRef.current = id
        ;(window as any).__swapQuoteInterval = id
      }
    }
  }

  const handleMaxAmount = async () => {
    const token = swapInfo.fromToken
    const availableBalance = swapInfo.fromAvailableBalance

    let availbaleToSwap,
      minAmount = 0

    if (token?.symbol.toUpperCase() === 'SOL') {
      const rent = await checkIfNewSolAccountAndGetRent(swapInfo.fromWalletAddress)
      minAmount = rent
      availbaleToSwap = MathFun.sub(Number(availableBalance || 0), minAmount)
    } else if (token?.symbol.toUpperCase() === 'BNB') {
      minAmount = 0.0005
      availbaleToSwap = MathFun.sub(Number(availableBalance || 0), minAmount)
    } else if (token?.symbol.toUpperCase() === 'MON') {
      minAmount = 0.05
      availbaleToSwap = MathFun.sub(Number(availableBalance || 0), minAmount)
    } else {
      // hyperliquid usdc
      availbaleToSwap = Number(availableBalance || 0)
    }

    handleAmountChange(`${availbaleToSwap >= 0 ? availbaleToSwap : 0}`)
  }

  const stopPolling = () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort()
    abortControllerRef.current = null

    // Clear interval stored on ref
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    // Also clear any interval attached to window (defensive)
    if ((window as any).__swapQuoteInterval) {
      clearInterval((window as any).__swapQuoteInterval)
      ;(window as any).__swapQuoteInterval = null
    }

    // clear last params so polling won't restart
    lastQuoteParamsRef.current = null
  }

  return {
    swapWallets,
    perpsAddress,
    bnbWallets,
    solWallets,
    monWallets,
    initSwapForm,
    handleUpToDown,
    resetSwapForm,
    handleInputChange,
    handleAmountChange,
    handleMaxAmount,
    stopPolling,
  }
}
