import NewSwitchWalletBottomSheet from '@/components/auth/ManagementWallets/NewSwitchWalletBottomSheet'
import { IconChevronDown } from '@/components/icon'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'
import { capitalizeFirstLetter, MathFun } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums'
import { BLOCKCHAIN_NAMES, BLOCKCHAIN_SHORTNAME } from '@/utils/helpers'
import { formatBalance } from '@/lib/format'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import LogoWithChain from '../../common/LogoWithChain'
import { useTransferContext } from '../context/TransferContext'
import AccountSelect from '../drawer/AccountSelect'
import TokenSelect from '../drawer/TokenSelect'
import WalletSelect from '../drawer/WalletSelect'
import { ACCOUNT_TYPE } from '../lib/enum'
import { Token } from '../types/ExchangeMeta'

interface TokenInputProps {
  label: string
  token: Token | null
  defaultTokenImage?: string
  defaultTokenSymbol?: string
  defaultChainLogo?: string
  amount: string | null
  balance: string
  displayedBalance: string
  walletAddress: string
  onTokenSelect?: () => void
  onTokenChange?: (token: Token) => void
  onAmountChange: (value: string, wallet: string) => void
  onMaxClick: () => void
  onAccountTypeChange: (isContractAccount: boolean) => void
  onWalletSelect: (walletAddress: string) => void
  showPrice?: boolean
  disabled?: boolean
  usdPrice?: number
  isContractAccountType?: boolean
  isTokenSelectable?: boolean
  excludeWallet?: string // Wallet address to exclude from selection
}

export const TokenInput = ({
  label,
  token,
  defaultTokenImage = '/images/cryptoDeposit/eth.png',
  defaultTokenSymbol = 'ETH',
  defaultChainLogo = '/images/cryptoDeposit/arbitrum-chain.png',
  amount,
  displayedBalance,
  walletAddress,
  onTokenSelect,
  onTokenChange,
  onAmountChange,
  onMaxClick,
  onAccountTypeChange,
  onWalletSelect,
  showPrice = true,
  disabled = false,
  usdPrice = 0,
  isContractAccountType = false,
  isTokenSelectable = true,
  excludeWallet,
}: TokenInputProps) => {
  const { tokens } = useTransferContext()
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const activeWallet = useSelector(_activeWallet)
  const solWallets = listWalletsByChain.filter((w) => w.chain === 'SOLANA')
  const [isContractAccount, setIsContractAccount] = useState<boolean>()
  const [selectedToken, setSelectedToken] = useState<Token | null>(token)
  const [openSelectWalletDrawer, setOpenSelectWalletDrawer] = useState(false)
  const [selectedWalletAddress, setSelectedWalletAddress] = useState(walletAddress)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    value = value.replace(/,/g, '')

    // Only allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onAmountChange(value, selectedWalletAddress)
    }
  }

  const handleAccountType = (accountType: ACCOUNT_TYPE) => {
    const isCAAccount = accountType === ACCOUNT_TYPE.CONTRACT

    setIsContractAccount(isCAAccount)
    onAccountTypeChange(isCAAccount)
    if (isCAAccount) {
      const USDC = tokens && tokens.filter((token) => token.symbol.toUpperCase() === 'USDC')
      if (USDC && USDC.length > 0) {
        setSelectedToken(USDC[0])
      }
    }
  }

  useEffect(() => {
    setIsContractAccount(isContractAccountType)
    if (isContractAccountType) {
      const USDC = tokens && tokens.filter((token) => token.symbol.toUpperCase() === 'USDC')
      if (USDC && USDC.length > 0) {
        setSelectedToken(USDC[0])
      }
    }
  }, [isContractAccountType])

  useEffect(() => {
    setSelectedWalletAddress(activeWallet?.walletAddress)
    onWalletSelect(activeWallet?.walletAddress)
  }, [openSelectWalletDrawer])

  useEffect(() => {
    if (selectedToken?.symbol === 'SOL') {
      setSelectedWalletAddress(activeWallet.walletAddress)
      onWalletSelect(activeWallet.walletAddress)
    }
  }, [])

  useEffect(() => {
    const isSolWallet = solWallets.filter((sw) => sw.walletAddress === walletAddress)

    if (isSolWallet.length > 0) {
      setSelectedWalletAddress(walletAddress)
      onWalletSelect(walletAddress)
    }
  }, [walletAddress])

  useEffect(() => {
    if (token) {
      setSelectedToken((prev) => {
        if (prev?.symbol === token.symbol && prev?.chainName === token.chainName) {
          return prev
        }
        return token
      })

      if (token?.symbol.toUpperCase() === 'SOL' && walletAddress) {
        return
      }

      let defaultWallet
      if (token?.symbol.toUpperCase() === 'SOL') {
        defaultWallet = listWalletsByChain.filter((w) => w.chain === 'SOLANA')[0].walletAddress
      } else if (token?.symbol.toUpperCase() === 'BNB') {
        defaultWallet = listWalletsByChain.filter((w) => w.chain === 'BSC')[0].walletAddress
      } else {
        defaultWallet = listWalletsByChain.filter((w) => w.chain === 'EVM')[0].walletAddress
      }
      setSelectedWalletAddress(defaultWallet)
    }
  }, [token, isContractAccountType, walletAddress, listWalletsByChain])

  const tokenSymbol = useMemo(() => {
    if (!selectedToken) {
      return defaultTokenSymbol === 'USDC' ? 'ARB_USDC' : defaultTokenSymbol
    }
    // For Arbitrum tokens, prefix with ARB_ (including ETH)
    if (selectedToken.chainName?.toUpperCase() === 'ARBITRUM') {
      return `ARB_${selectedToken.symbol}`
    }
    return selectedToken.symbol
  }, [selectedToken, defaultTokenSymbol])

  const handleSelectNewToken = useCallback(
    (value: string) => {
      const valueArr = value.split('_')
      let tokenData: Token | null = null

      if (valueArr.length === 2 && valueArr[0].toUpperCase() === 'ARB') {
        // Format: ARB_ETH or ARB_USDC - find token on Arbitrum chain
        const symbolToFind = valueArr[1].toUpperCase()

        const matchingTokens =
          tokens?.filter((t) => t.symbol.toUpperCase() === symbolToFind && t.chainName?.toUpperCase() === 'ARBITRUM') ||
          []

        tokenData = matchingTokens[0] || null
      } else {
        // Format: SOL, BNB, ETH - find token on specific chain
        const symbol = value.toUpperCase()

        if (symbol === 'ETH') {
          // ETH specifically means Ethereum ETH, not Arbitrum ETH
          const matchingTokens =
            tokens?.filter((t) => t.symbol.toUpperCase() === 'ETH' && t.chainName?.toUpperCase() === 'ETHEREUM') || []
          tokenData = matchingTokens[0] || null
        } else if (symbol === 'SOL') {
          const matchingTokens =
            tokens?.filter((t) => t.symbol.toUpperCase() === 'SOL' && t.chainName?.toUpperCase() === 'SOLANA') || []
          tokenData = matchingTokens[0] || null
        } else if (symbol === 'BNB') {
          const matchingTokens =
            tokens?.filter((t) => t.symbol.toUpperCase() === 'BNB' && t.chainName?.toUpperCase() === 'BSC') || []
          tokenData = matchingTokens[0] || null
        } else {
          // Fallback: find by symbol, excluding Arbitrum
          const matchingTokens =
            tokens?.filter((t) => t.symbol.toUpperCase() === symbol && t.chainName?.toUpperCase() !== 'ARBITRUM') || []
          tokenData = matchingTokens[0] || null
        }
      }

      if (tokenData) {
        setSelectedToken(tokenData)
        onTokenChange?.(tokenData)
      }
    },
    [tokens, onTokenChange],
  )

  const handleSelectWallet = (walletAddress: string) => {
    setSelectedWalletAddress(walletAddress)
    onWalletSelect(walletAddress)
  }

  const chainId = useMemo(() => {
    return selectedToken ? Number(selectedToken.chainId) : ChainIds.Solana
  }, [selectedToken])

  return (
    <div
      className={`relative overflow-hidden rounded-[8px] border border-[#79778C29] ${isDesktop ? 'bg-transparent' : 'bg-[#232329]'}`}
    >
      <div className="border-b border-[#79778C29] px-3 py-2.5">
        <div className="flex items-center justify-start gap-1 text-[14px] font-[330]">
          <span className="text-[#79778C]">{label}</span>
          <AccountSelect
            value={isContractAccount ? 'CONTRACT' : 'MEME'}
            onValueChange={(value) => {
              if (value === 'MEME') {
                handleAccountType(ACCOUNT_TYPE.MEME)
              } else {
                handleAccountType(ACCOUNT_TYPE.CONTRACT)
              }
            }}
          />
        </div>
      </div>
      <div className="p-4">
        <div className="flex h-[48px] items-center gap-2">
          {isContractAccount || !isTokenSelectable ? (
            <div className="flex h-[36px] items-center gap-1 rounded-full bg-[#79778C29] p-1.5 pr-3">
              <LogoWithChain
                logo={selectedToken?.image || defaultTokenImage}
                name={selectedToken?.symbol || defaultTokenSymbol}
                chainContainerClassName="!bg-none"
                logoClassName="size-6 min-w-6 rounded-full"
                chainLogo={selectedToken?.chainImage || defaultChainLogo}
              />
              <div className="text-[12px] leading-[1] font-[330]">{selectedToken?.symbol || defaultTokenSymbol}</div>
            </div>
          ) : (
            <>
              {isDesktop ? (
                <TokenSelect value={tokenSymbol || defaultTokenSymbol} onValueChange={handleSelectNewToken} />
              ) : (
                <button
                  className="flex h-[36px] items-center gap-1 rounded-full bg-[#79778C29] p-1.5 pr-2"
                  onClick={onTokenSelect}
                  disabled={!onTokenSelect}
                >
                  <LogoWithChain
                    logo={selectedToken?.image || defaultTokenImage}
                    name={selectedToken?.symbol || defaultTokenSymbol}
                    chainContainerClassName="!bg-none"
                    logoClassName="size-6 min-w-6 rounded-full"
                    chainLogo={selectedToken?.chainImage || defaultChainLogo}
                  />
                  <div className="inline-flex items-center gap-1 text-[12px] leading-[1] font-[330]">
                    <span>
                      {selectedToken?.chainName !== 'BSC'
                        ? defaultTokenSymbol === BLOCKCHAIN_SHORTNAME[ChainIds.Bsc] && !selectedToken?.chainName
                          ? BLOCKCHAIN_SHORTNAME[ChainIds.Bsc]
                          : capitalizeFirstLetter(selectedToken?.symbol || defaultTokenSymbol)
                        : BLOCKCHAIN_SHORTNAME[ChainIds.Bsc]}
                    </span>
                    {!isContractAccount && <IconChevronDown className="size-4 text-[#79778C]" />}
                  </div>
                </button>
              )}
            </>
          )}

          <div className="flex w-full flex-1 flex-col">
            <input
              type="text"
              placeholder="0.0"
              className="w-full bg-transparent text-right text-[20px] font-[450] outline-none"
              value={amount || ''}
              onChange={handleInputChange}
              disabled={disabled}
            />
            {showPrice && amount && (
              <span className="block w-full text-right text-[12px] text-[#FFFFFF80]">
                ≈{' '}
                {formatBalance(MathFun.mul(amount || '0', usdPrice ? usdPrice.toString() : '0').toString(), {
                  roundMode: 'floor',
                  showCurrency: true,
                })}
              </span>
            )}
          </div>
        </div>
        <div className={`mt-2 flex flex-row ${isContractAccountType ? 'justify-end' : 'justify-between'}`}>
          {!isContractAccountType && (
            <WalletSelect
              chainId={chainId}
              selectedWallet={selectedWalletAddress}
              onWalletChange={handleSelectWallet}
              excludeWallet={excludeWallet}
            />
          )}
          <div className="inline-flex items-center gap-2">
            <span className="text-[12px] text-[#79778C]">
              {formatBalance(displayedBalance ? displayedBalance.toString() : '0', {
                roundMode: 'floor',
              })}
            </span>
            {!disabled && (
              <>
                <span className="h-[11.5px] w-[1px] bg-[#ECECED14]" />
                <button
                  className="text-impartal text-[12px] uppercase"
                  onClick={onMaxClick}
                  disabled={Number(displayedBalance) === 0 ? true : false}
                >
                  {t('assets.transfers.max')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <NewSwitchWalletBottomSheet open={openSelectWalletDrawer} setOpen={setOpenSelectWalletDrawer} />
    </div>
  )
}
