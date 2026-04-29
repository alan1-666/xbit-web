import { useCallback, useEffect, useMemo, useState } from 'react'
import { AccountSelect } from './AccountSelect'
import { ACCOUNT_TYPE } from '../lib/constants'
import TokenSelect from './TokenSelect'
import { SwapFormState, Token } from '../lib/types'
import { ChainIds } from '@/types/enums'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import WalletSelect from './WalletSelect'
import { updateSwapForm } from '@/redux/modules/swap.slice'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { useSwapForm } from '../hooks/useSwapForm'
import { isEvmAddress } from '../lib/helper'
import { useTranslation } from 'react-i18next'
import { formatAmount } from '@/lib/format'
import { Configs } from '@const/configs.ts'

interface SwapItemProps {
  label: string
  tokenList: Token[]
  isFrom: boolean
  disabled?: boolean
}

const defaultTokenSymbol = Configs.getDefaultTransferToken()

const SwapItem = ({ label, tokenList, disabled, isFrom }: SwapItemProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const swapInfo = useAppSelector<RootState, SwapFormState>((state) => state.swapInfo)

  const { withdrawable: available } = useWebData2()
  const { stopPolling } = useSwapForm()
  const [isPerpsAccount, setIsPerpsAccount] = useState<boolean>()
  const [selectedToken, setSelectedToken] = useState<Token | null>(isFrom ? swapInfo.fromToken : swapInfo.toToken)
  const [selectedWalletAddress, setSelectedWalletAddress] = useState(
    isFrom ? swapInfo.fromWalletAddress : swapInfo.toWalletAddress,
  )

  const { handleUpToDown } = useSwapForm()

  const { swapWallets, bnbWallets, solWallets, monWallets, perpsAddress, handleInputChange, handleMaxAmount } = useSwapForm()

  const chainId = useMemo(() => {
    return selectedToken ? Number(selectedToken.chainId) : ChainIds.Solana
  }, [selectedToken])

  const usdc = useMemo(() => {
    return tokenList.find((t) => t.symbol.toUpperCase() === 'USDC') || null
  }, [tokenList])

  const sol = useMemo(() => {
    return tokenList.find((t) => t.symbol.toUpperCase() === 'SOL') || null
  }, [tokenList])

  useEffect(() => {
    if (isFrom) {
      setIsPerpsAccount(swapInfo.fromAccountType === ACCOUNT_TYPE.Perps)
    } else {
      setIsPerpsAccount(swapInfo.toAccountType === ACCOUNT_TYPE.Perps)
    }
  }, [isFrom, swapInfo.fromAccountType, swapInfo.toAccountType])

  useEffect(() => {
    if (isFrom) {
      setSelectedWalletAddress(swapInfo.fromWalletAddress)
    } else {
      setSelectedWalletAddress(swapInfo.toWalletAddress)
    }
  }, [isFrom, swapInfo.fromWalletAddress, swapInfo.toWalletAddress])

  useEffect(() => {
    if (isFrom) {
      setSelectedToken(swapInfo.fromToken)
    } else {
      setSelectedToken(swapInfo.toToken)
    }
  }, [isFrom, swapInfo.fromToken, swapInfo.toToken])

  useEffect(() => {
    if (swapInfo.fromToken?.symbol.toUpperCase() === 'SOL' && swapInfo.toToken?.symbol.toUpperCase()) {
      if (swapInfo.fromWalletAddress === swapInfo.toWalletAddress) {
        const solWallet = solWallets.find((wallet: any) => wallet.walletAddress !== swapInfo.fromWalletAddress) // find another wallet
        if (solWallet) {
          if (isFrom) {
            dispatch(
              updateSwapForm({
                ...swapInfo,
                fromWalletAddress: solWallet.walletAddress,
                fromAvailableBalance: solWallet.balance,
                fromDisplayedAvailableBalance: solWallet.balance,
              }),
            )
          } else {
            dispatch(
              updateSwapForm({
                ...swapInfo,
                toWalletAddress: solWallet.walletAddress,
                toAvailableBalance: solWallet.balance,
                toDisplayedAvailableBalance: solWallet.balance,
              }),
            )
          }
        }
      }
    }
  }, [isFrom, swapInfo.fromWalletAddress, swapInfo.toWalletAddress])

  const handleAccountType = (accountType: ACCOUNT_TYPE) => {
    stopPolling()
    const isCAAccount = accountType === ACCOUNT_TYPE.Perps
    setIsPerpsAccount(isCAAccount)
    if (isCAAccount) {
      setSelectedToken(usdc)
      if (isFrom) {
        if (swapInfo.toAccountType === ACCOUNT_TYPE.Perps) {
          handleUpToDown()
          return
        }
        dispatch(
          updateSwapForm({
            ...swapInfo,
            fromAccountType: ACCOUNT_TYPE.Perps,
            fromAvailableBalance: available,
            fromDisplayedAvailableBalance: available,
            fromToken: usdc,
            fromWalletAddress: perpsAddress,
            fromAmount: null,
            toAmount: null,
            transactionData: null,
          }),
        )
      } else {
        if (swapInfo.fromAccountType === ACCOUNT_TYPE.Perps) {
          handleUpToDown()
          return
        }
        dispatch(
          updateSwapForm({
            ...swapInfo,
            toAccountType: ACCOUNT_TYPE.Perps,
            toAvailableBalance: available,
            toDisplayedAvailableBalance: available,
            toToken: usdc,
            toWalletAddress: perpsAddress,
            fromAmount: null,
            toAmount: null,
            transactionData: null,
          }),
        )
      }
    } else {
      setSelectedToken(sol)
      const solWallet = solWallets[0]
      if (isFrom) {
        dispatch(
          updateSwapForm({
            ...swapInfo,
            fromAccountType: ACCOUNT_TYPE.MEME,
            fromAvailableBalance: solWallet.balance,
            fromDisplayedAvailableBalance: solWallet.balance,
            fromToken: sol,
            fromWalletAddress: solWallet.walletAddress,
            fromAmount: null,
            toAmount: null,
            transactionData: null,
          }),
        )
      } else {
        dispatch(
          updateSwapForm({
            ...swapInfo,
            toAccountType: ACCOUNT_TYPE.MEME,
            toAvailableBalance: solWallet.balance,
            toDisplayedAvailableBalance: solWallet.balance,
            toToken: sol,
            toWalletAddress: solWallet.walletAddress,
            toAmount: null,
            fromAmount: null,
            transactionData: null,
          }),
        )
      }
    }
  }

  const handleSelectWallet = (walletAddress: string) => {
    stopPolling()
    if (!tokenList || tokenList.length === 0) return
    if (
      (isFrom && walletAddress === swapInfo.toWalletAddress) ||
      (!isFrom && walletAddress === swapInfo.fromWalletAddress)
    ) {
      handleUpToDown()
      return
    }
    setSelectedWalletAddress(walletAddress)
    const isBNBWallet = isEvmAddress(walletAddress)
    if (isFrom) {
      const chainName = swapInfo.fromToken?.chainList[0].chainName.toUpperCase() || 'SOLANA'
      let address, balance
      if (isBNBWallet) {
        if (chainName === 'HYPERLIQUID') {
          address = perpsAddress
        } else {
          address = chainName === 'BSC' || chainName === 'MONAD' || chainName === 'MON' ? walletAddress : swapInfo.fromWalletAddress
        }
      } else {
        address = chainName === 'SOLANA' ? walletAddress : swapInfo.fromWalletAddress
      }
      if (chainName === 'HYPERLIQUID') {
        balance = available
      } else {
        const originChainName = chainName === 'MONAD' ? 'MON' : chainName
        const wallet = swapWallets[originChainName][address]
        balance = wallet.balance
      }

      dispatch(
        updateSwapForm({
          ...swapInfo,
          fromWalletAddress: address,
          fromAvailableBalance: balance,
          fromDisplayedAvailableBalance: balance,
          fromAmount: null,
          toAmount: null,
          transactionData: null,
        }),
      )
    } else {
      const chainName = swapInfo.toToken?.chainList[0].chainName.toUpperCase() || 'SOLANA'
      let address, balance
      if (isBNBWallet) {
        if (chainName === 'HYPERLIQUID') {
          address = perpsAddress
        } else {
          address = chainName === 'BSC' || chainName === 'MONAD' || chainName === 'MON' ? walletAddress : swapInfo.toWalletAddress
        }
      } else {
        address = chainName === 'SOLANA' ? walletAddress : swapInfo.toWalletAddress
      }

      if (chainName === 'HYPERLIQUID') {
        balance = available
      } else {
        const originChainName = chainName === 'MONAD' ? 'MON' : chainName
        const wallet = swapWallets[originChainName][address]
        balance = wallet.balance
      }
      dispatch(
        updateSwapForm({
          ...swapInfo,
          toWalletAddress: address,
          toAvailableBalance: balance,
          toDisplayedAvailableBalance: balance,
          fromAmount: null,
          toAmount: null,
          transactionData: null,
        }),
      )
    }
  }

  const handleTokenSelect = useCallback(
    (value: string) => {
    stopPolling()
    if (value.toUpperCase() === 'BNB' || value.toUpperCase() === 'MON') {
      let originToken
      if (isFrom) {
        originToken = swapInfo.toToken?.symbol
        if (originToken?.toUpperCase() === value.toUpperCase()) {
          handleUpToDown()
          return
        }
      } else {
        originToken = swapInfo.fromToken?.symbol
        if (originToken?.toUpperCase() === value.toUpperCase()) {
          handleUpToDown()
          return
        }
      }
    }

    const selectedToken = tokenList.filter((token) => token.symbol.toUpperCase() === value.toUpperCase())[0]

    let wallet
    if (value.toUpperCase() === 'BNB') {
      wallet = bnbWallets[0]
    } else if (value.toUpperCase() === 'MON') {
      wallet = monWallets[0]
    } else {
      wallet = solWallets[0]
    }

    if (isFrom) {
      dispatch(
        updateSwapForm({
          ...swapInfo,
          fromToken: selectedToken,
          fromWalletAddress: wallet.walletAddress,
          fromAvailableBalance: wallet.balance,
          fromDisplayedAvailableBalance: wallet.balance,
          fromAmount: null,
          toAmount: null,
          transactionData: null,
        }),
      )
    } else {
      dispatch(
        updateSwapForm({
          ...swapInfo,
          toToken: selectedToken,
          toWalletAddress: wallet.walletAddress,
          toAvailableBalance: wallet.balance,
          toDisplayedAvailableBalance: wallet.balance,
          toAmount: null,
          fromAmount: null,
          transactionData: null,
        }),
      )
    }
    setSelectedToken(selectedToken)
  },
    [isFrom, swapInfo, tokenList, bnbWallets, solWallets, monWallets],
  )

  return (
    <div className="w-full rounded-lg inline-flex flex-col justify-start items-start border border-[#79778C29]">
      <div className="self-stretch h-10 px-4 py-2.5 border-b b-[#79778C29] inline-flex justify-between items-center">
        <div className="flex justify-start items-center gap-1.5">
          <div className="justify-start text-sm font-normal leading-5 text-[#605E68]">{label}</div>
          <div className="justify-start text-sm font-normal leading-5">
            <AccountSelect
              value={
                isFrom
                  ? swapInfo.fromAccountType === ACCOUNT_TYPE.Perps
                    ? 'CONTRACT'
                    : 'MEME'
                  : swapInfo.toAccountType === ACCOUNT_TYPE.Perps
                    ? 'CONTRACT'
                    : 'MEME'
              }
              onValueChange={(value) => {
                if (value === 'MEME') {
                  handleAccountType(ACCOUNT_TYPE.MEME)
                } else {
                  handleAccountType(ACCOUNT_TYPE.Perps)
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="self-stretch px-4 pt-3 pb-4 flex flex-col justify-start items-start gap-2">
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="rounded-[200px] flex justify-start items-center gap-1.5">
            <TokenSelect
              tokenList={tokenList}
              value={isFrom ? swapInfo.fromToken?.symbol : swapInfo.toToken?.symbol || defaultTokenSymbol}
              onValueChange={handleTokenSelect}
              isShowDropDown={
                isFrom ? swapInfo.fromAccountType === ACCOUNT_TYPE.MEME : swapInfo.toAccountType === ACCOUNT_TYPE.MEME
              }
            />
          </div>
          <div className="justify-start text-xl font-semibold leading-5">
            <input
              inputMode="decimal"
              className="w-full bg-transparent text-right text-[20px] leading-5 font-semibold text-white outline-none placeholder:text-[#5C5C66]"
              placeholder="0.0"
              value={isFrom ? swapInfo.fromAmount || '' : swapInfo.toAmount || ''}
              onChange={handleInputChange}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="h-[18px] self-stretch inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-1">
            <div className="flex justify-start items-center gap-1">
              {!isPerpsAccount && selectedToken?.symbol.toUpperCase() === 'SOL' && (
                <WalletSelect
                  chainId={chainId}
                  selectedWallet={selectedWalletAddress}
                  onWalletChange={handleSelectWallet}
                  excludeWallet={isFrom ? swapInfo.toWalletAddress : swapInfo.fromWalletAddress}
                />
              )}
            </div>
          </div>
          <div className="flex justify-start items-center gap-2">
            <div className="justify-start text-xs font-normal text-[#605E68] leading-3">
              {isFrom
                ? formatAmount(swapInfo.fromAvailableBalance, {
                    roundMode: 'floor',
                    unit: selectedToken?.symbol,
                  })
                : formatAmount(swapInfo.toAvailableBalance, {
                    roundMode: 'floor',
                    unit: selectedToken?.symbol,
                  })}
            </div>
            {isFrom && (
              <button
                className="justify-start text-xs font-medium leading-3 text-[#843BEA] uppercase whitespace-nowrap"
                onClick={handleMaxAmount}
              >
                {t('assets.transfers.max')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapItem
