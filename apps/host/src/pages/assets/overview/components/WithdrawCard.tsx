import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import SelectNetwork from '@/components/assets/overview/SelectNetwork'
import SelectToken from '@/components/assets/overview/SelectToken'
import Loader from '@/components/common/Loader'
import { useSwapService } from '@/components/transfer/hook/useSwapService.ts'
import { useWebData2 } from '@/hooks/hyperliquid/useWebData2'
import { useTxDetail } from '@/hooks/useTxDetail'
import { isValidAddress } from '@/lib/blockchain'
import { isValidEvmAddress, isValidSolAddress, SOL_ADDRESS } from '@/lib/blockchain.ts'
import { ARB_USDC_ADDRESS } from '@/lib/constant.ts'
import { formatAmount, formatPercent } from '@/lib/format'
import { walletClient } from '@/lib/gql/apollo-client.ts'
import { exchangeActions } from '@/redux/modules/exchange.slice'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { _activeWallet, _walletDex } from '@/redux/modules/newWallet.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds, FundingType } from '@/types/enums.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import { buildSignableData } from '@/utils/hyperliquidSign/signableData'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import SecurityCheckModal, { VefiryWalletResponse } from '@components/auth/WalletBackup/SecurityCheckModal.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { IconHelp } from '@components/icon'
import { Button } from '@components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { Configs } from '@const/configs.ts'
import { useWalletBalances } from '@hooks/useWalletBalances.ts'
import { usePrices } from '@pages/assets'
import { AccountTypeSelect } from '@pages/assets/overview/components/AccountTypeSelect.tsx'
import { TokenSelect } from '@pages/assets/overview/components/TokenSelect.tsx'
import { WalletSelect } from '@pages/assets/overview/components/WalletSelect.tsx'
import { getWithdrawFee, withdrawTurnkey } from '@services/wallet.service.ts'
import { useQuery } from '@tanstack/react-query'
import { useTurnkey } from '@turnkey/sdk-react'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { getAddress } from 'ethers'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { ACCOUNT_TYPE } from './AccountTypeSelect'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import { mappedChainIdToChainType } from '@/redux/modules/newWallet.slice'
import { WithdrawForm } from '@/modules/prediction/components/portfolio/WithdrawForm'
import { usePrice, useQuote } from '@/hooks/relay'
import { aoutput } from '@noble/hashes/utils'

const mappingDefautTokenNameByChainId = (chainId: ChainIds) => {
  switch (chainId) {
    // case ChainIds.Ethereum:
    //   return 'ETH'
    // case ChainIds.Arbitrum:
    //   return 'ARB_USDC'
    case ChainIds.Bsc:
      return 'BNB'
    case ChainIds.Mon:
      return 'MON'
    default:
      return 'SOL'
  }
}

const networkMap: Record<number, string> = {
  [ChainIds.Solana]: 'Solana',
  [ChainIds.Ethereum]: 'Ethereum',
  [ChainIds.Arbitrum]: 'Arbitrum',
  [ChainIds.Bsc]: 'BSC',
  [ChainIds.Mon]: 'Monad',
}

const rsvToSignature = ({ r, s, v }: { r: string; s: string; v: number }) => {
  const vNormalized = v === 27 || v === 28 ? v - 27 : v // ✅ 0 or 1
  return '0x' + r.replace(/^0x/, '') + s.replace(/^0x/, '') + vNormalized.toString(16).padStart(2, '0')
}

export const MemeWithdraw = ({ defaultChainId }: { defaultChainId?: ChainIds }) => {
  const { t } = useTranslation()
  const activeWallet = useSelector(_activeWallet)
  const dispatch = useAppDispatch()
  const [tokenName, setTokenName] = useState(
    mappingDefautTokenNameByChainId(
      (defaultChainId ?? activeWallet?.chainId == ChainIds.Bsc)
        ? ChainIds.Bsc
        : activeWallet?.chainId == ChainIds.Mon
          ? ChainIds.Mon
          : ChainIds.Solana,
    ),
  )

  const [wallet, setWallet] = useState('')
  const walletBalances = useWalletBalances()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const { solPrice, ethPrice, bnbPrice, monPrice } = usePrices()
  const [toAddress, setToAddress] = useState('')
  const [value, setValue] = useState<string>()
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { openTxDetail } = useTxDetail()

  const { chainId, token } = useMemo(() => {
    switch (tokenName) {
      // case 'ETH': {
      //   return { chainId: ChainIds.Ethereum, token: 'ETH' }
      // }
      // case 'ARB_ETH': {
      //   return { chainId: ChainIds.Arbitrum, token: 'ETH' }
      // }
      // case 'ARB_USDC': {
      //   return { chainId: ChainIds.Arbitrum, token: 'USDC' }
      // }
      case 'BNB': {
        return { chainId: ChainIds.Bsc, token: 'BNB' }
      }
      case 'MON': {
        return { chainId: ChainIds.Mon, token: 'MON' }
      }
      default:
        return { chainId: ChainIds.Solana, token: 'SOL' }
    }
  }, [tokenName])

  const selectedWallet = useMemo(() => {
    const filteredWallets = listWalletsByChain.filter(
      (wallet) =>
        wallet.chain ===
        (chainId === ChainIds.Solana
          ? 'SOLANA'
          : chainId === ChainIds.Ethereum
            ? 'EVM'
            : chainId === ChainIds.Bsc
              ? 'BSC'
              : chainId === ChainIds.Mon
                ? 'MON'
                : 'ARB'),
    )
    if (wallet) {
      return filteredWallets.find((w) => w.walletAddress === wallet) || filteredWallets[0]
    }
  }, [wallet, chainId, listWalletsByChain])

  const availableBalance = useMemo(() => {
    if (!selectedWallet) return 0
    if (token === 'ETH' && +chainId === ChainIds.Ethereum) {
      return selectedWallet.balance || 0
    }
    if (token === 'SOL' && +chainId === ChainIds.Solana) {
      return selectedWallet.balance || 0
    }
    if (chainId === ChainIds.Arbitrum) {
      if (token === 'ETH') {
        return selectedWallet.balance || 0
      }
      if (token === 'USDC') {
        return walletBalances.arbUsdc[selectedWallet.walletAddress] || 0
      }
    }
    if (chainId === ChainIds.Bsc) {
      if (token === 'BNB') {
        return selectedWallet.balance || 0
      }
    }
    if (chainId === ChainIds.Mon) {
      if (token === 'MON') {
        return selectedWallet.balance || 0
      }
    }
    return 0
  }, [selectedWallet, token, chainId, walletBalances])

  const estimatedAmountInUsd = useMemo(() => {
    if (!value) return 0
    const amount = parseFloat(value)
    if (token === 'ETH') return amount * ethPrice
    if (token === 'SOL') return amount * solPrice
    if (token === 'USDC') return amount
    if (token === 'BNB') return amount * bnbPrice
    if (token === 'MON') return amount * monPrice
    return 0
  }, [value, token, solPrice, ethPrice, monPrice, bnbPrice])

  const isValidAddress = useMemo(() => {
    if (!toAddress) return false
    // Validate the address based on the chain type
    if (+chainId === ChainIds.Solana) {
      return isValidSolAddress(toAddress)
    }
    // For EVM chains, we can use a generic EVM address validation
    if (
      +chainId === ChainIds.Ethereum ||
      +chainId === ChainIds.Arbitrum ||
      +chainId === ChainIds.Bsc ||
      +chainId === ChainIds.Mon
    ) {
      return isValidEvmAddress(toAddress)
    }
    return true
  }, [toAddress, chainId])

  const withdrawTokenAddress = useMemo(() => {
    if (token === 'ETH') {
      return '0x0000000000000000000000000000000000000000'
    }
    if (token === 'USDC' && +chainId === ChainIds.Arbitrum) {
      return ARB_USDC_ADDRESS // Arbitrum USDC address
    }
    if (token === 'SOL') {
      return SOL_ADDRESS
    }
    if (token === 'BNB') {
      return '0x0000000000000000000000000000000000000000'
    }
    if (token === 'MON') {
      return '0x0000000000000000000000000000000000000000'
    }
  }, [token, chainId])

  const amount = useMemo(() => {
    if (value === undefined) return 0
    return parseFloat(value)
  }, [value])

  const { data: withdrawFee } = useQuery({
    queryKey: ['withdrawFee', wallet, toAddress, chainId, withdrawTokenAddress],
    refetchInterval: 10000, // Refetch every 10 seconds
    queryFn: async () => {
      const res = await walletClient.query({
        query: getWithdrawFee,
        variables: {
          input: {
            fromAddress: wallet,
            toAddress,
            chainId,
            token: withdrawTokenAddress,
            amount: amount || 0,
          },
        },
      })
      return res.data.getWithdrawFee
    },
  })

  const withdrawTokenToTransaction = useMemo(() => {
    if (token === 'ETH' || token === 'BNB' || token === 'MON') return undefined
    if (token === 'USDC' && +chainId === ChainIds.Arbitrum) {
      return ARB_USDC_ADDRESS // Arbitrum USDC address
    }
    return SOL_ADDRESS
  }, [token, chainId])

  const tokenAddress = useMemo(() => {
    if (chainId === ChainIds.Ethereum && token === 'ETH') {
      return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    }
    if (chainId === ChainIds.Arbitrum) {
      if (token === 'ETH') {
        return '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
      }
      if (token === 'USDC') {
        return ARB_USDC_ADDRESS
      }
    }
    if (chainId === ChainIds.Bsc && token === 'BNB') {
      return '0x0000000000000000000000000000000000000000' // Native BNB token address
    }
    if (chainId === ChainIds.Mon && token === 'MON') {
      return '0x0000000000000000000000000000000000000000' // Native MON token address
    }
    if (chainId === ChainIds.Solana && token === 'SOL') {
      return SOL_ADDRESS
    }
  }, [token, chainId])

  const transactionType = useMemo(() => {
    if (
      +chainId === ChainIds.Arbitrum ||
      +chainId === ChainIds.Ethereum ||
      +chainId === ChainIds.Bsc ||
      +chainId === ChainIds.Mon
    ) {
      return 'TRANSACTION_TYPE_ETHEREUM'
    }
    return 'TRANSACTION_TYPE_SOLANA'
  }, [chainId])

  const decimals = useMemo(() => {
    if (token === 'USDC') {
      return 6
    }
    if (token === 'ETH' || token === 'ARB_ETH' || token === 'BNB' || token === 'MON') {
      return 18
    }
    return 9
  }, [token])

  const handleAmountInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9.,]/g, '')
    newValue = newValue.replace(/,/g, '.')
    if (newValue.includes('.')) {
      const parts = newValue.split('.')
      newValue = parts[0] + '.' + parts[1].slice(0, decimals) // Limit to the number of decimals for the token
    }
    setValue(newValue)
  }

  const handleWithdraw = async (res: VefiryWalletResponse) => {
    logEvent2(ACTIONS.withdraw_click, {
      chain_type: mappedChainIdToChainType(chainId),
    })

    setLoading(true)
    try {
      const { data } = await walletClient.mutate({
        mutation: withdrawTurnkey,
        variables: {
          input: {
            fromAddress: wallet,
            toAddress,
            chainId,
            token: tokenAddress,
            amount: Number(amount),
            activityId: res?.activityId,
            otpId: res?.otpId,
            otpCode: res?.otpCode,
            isOkxWallet: res?.isOkxWallet || false,
            message: res?.message,
            oidcToken: res?.oidcToken,
            signature: res?.signature,
            signedTx: res?.signedTx,
          },
        },
      })
      setLoading(false)
      setShowSecurityModal(false)
      const txData = data.withdrawTurnkey
      openTxDetail({
        id: txData.id,
        createdAt: txData.createdAt,
        type: FundingType.Withdraw,
        status: txData.status,
        token: txData.token,
        chainId: txData.chainId,
        amount: txData.amount,
        from: txData.fromAddress,
        to: txData.toAddress,
        txHash: txData.txid,
        errorCode: txData.errorCode || '',
        errorMessage: txData.errorMessage || '',
      } as FundingRecord)
      setValue('')
      setToAddress('')
      dispatch(exchangeActions.closeExchangeDialog())
    } catch (error) {
      setLoading(false)
      setShowSecurityModal(false)
    }
  }

  const maximumWithdrawable = useMemo(() => {
    const fee = withdrawFee?.fee ?? 0
    if (token === 'USDC') {
      return availableBalance
    }
    const max = new BigNumber(availableBalance).minus(fee)
    return max.toNumber()
  }, [availableBalance, withdrawFee, token])

  const handleMaxWithdraw = () => {
    if (!availableBalance || withdrawFee?.fee === undefined) {
      return
    }
    if (availableBalance < Number(withdrawFee?.fee)) {
      setValue('0')
      return
    }
    if (token === 'USDC') {
      setValue(availableBalance?.toString() || '0')
      return
    }
    if (maximumWithdrawable) {
      const maximumWithdrawableStr = maximumWithdrawable.toString()
      const maximumWithdrawableArr = maximumWithdrawableStr.split('.')
      if (maximumWithdrawableArr[1] && maximumWithdrawableArr?.length > decimals) {
        const finalStr = maximumWithdrawableArr[0] + '.' + maximumWithdrawableArr[1].slice(0, decimals)
        return setValue(finalStr)
      }
      setValue(maximumWithdrawableStr)
      return
    }
  }

  const shouldWarn = useMemo(() => {
    if (!withdrawFee || !withdrawFee.fee) return false
    if (token !== 'USDC') return false // Only warn for USDC withdrawals
    const feeInNumber = parseFloat(withdrawFee.fee)
    const currentBalance = selectedWallet?.balance || 0 // Balance of the selected wallet, in ETH
    return feeInNumber >= currentBalance
  }, [withdrawFee, selectedWallet, token])

  const minimalWithdrawableAmount = useMemo(() => {
    if (token === 'USDC') {
      return 0 // USDC has no minimum withdrawal limit
    }
    if (token === 'ETH' && +chainId === ChainIds.Ethereum) {
      return Configs.getMinimalWithdrawableEth()
    }
    if (token === 'ETH' && +chainId === ChainIds.Arbitrum) {
      return Configs.getMinimalWithdrawableArb()
    }
    if (token === 'BNB' && +chainId === ChainIds.Bsc) {
      return Configs.getMinimalWithdrawableBnb()
    }
    if (token === 'MON' && +chainId === ChainIds.Mon) {
      return Configs.getMinimalWithdrawableMon()
    }
    return Configs.getMinimalWithdrawableSol()
  }, [token, chainId])

  const isWithdrawable = useMemo(() => {
    if (!amount || amount <= 0) return false // No amount specified or invalid amount
    if (!withdrawFee?.fee) return false // No withdrawal fee available
    if (!toAddress) return false // No recipient address specified
    if (loading) return false // Currently processing a transaction
    if (!isValidAddress) return false // Invalid recipient address
    if (shouldWarn) return false // Warning condition met
    const amountBigNumber = new BigNumber(amount)
    if (amountBigNumber.isGreaterThan(maximumWithdrawable)) return false // Amount exceeds maximum withdrawable balance
    return amountBigNumber.isGreaterThanOrEqualTo(minimalWithdrawableAmount)
  }, [
    amount,
    toAddress,
    isValidAddress,
    loading,
    shouldWarn,
    maximumWithdrawable,
    minimalWithdrawableAmount,
    withdrawFee,
  ])

  const errorMessage = useMemo(() => {
    if (!amount) return undefined
    if (amount > maximumWithdrawable) {
      return t('assets.withdrawal.insufficientBalance')
    }
    if (amount < minimalWithdrawableAmount) {
      return t('assets.withdrawal.minimalWithdrawableError', {
        amount: minimalWithdrawableAmount,
        unit: token,
      })
    }
    if (shouldWarn) {
      return t('assets.withdrawal.insufficientBalanceForGasFee', { token: 'ETH' })
    }
    return undefined
  }, [amount, maximumWithdrawable, minimalWithdrawableAmount, token, shouldWarn])

  useEffect(() => {
    setTokenName(
      mappingDefautTokenNameByChainId(
        activeWallet?.chainId == ChainIds.Bsc
          ? ChainIds.Bsc
          : activeWallet?.chainId == ChainIds.Mon
            ? ChainIds.Mon
            : ChainIds.Solana,
      ),
    )
  }, [activeWallet?.chainId])

  useEffect(() => {
    setTokenName(mappingDefautTokenNameByChainId(defaultChainId ?? Configs.getDefaultPortfolioChain()))
  }, [defaultChainId])

  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <TokenSelect value={tokenName} onValueChange={setTokenName} />
        <WalletSelect chainId={chainId} selectedWallet={wallet} onWalletChange={setWallet} />
      </div>
      <div className="rounded-[8px] border border-[#79778C29] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <LogoWithChain logo={getBlockchainLogo2(chainId)} name={tokenName} logoClassName="size-6 min-w-6" />
            <span className="text-[14px] leading-5 text-[#FBFBFB]">{tokenName}</span>
          </div>
          <input
            className="flex-1 bg-transparent text-right text-[20px] leading-5 font-semibold text-white outline-none placeholder:text-[#5C5C66]"
            placeholder="0.0"
            inputMode="decimal"
            value={value}
            onChange={handleAmountInputChange}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          {errorMessage ? (
            <span className="text-[12px] text-[#FF353C]">{errorMessage}</span>
          ) : (
            <span className="text-[12px] text-[#6C6A74]">
              ≈{' '}
              {formatAmount(estimatedAmountInUsd, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-[#605E68]">
              {/* {t('exchange.availableBalance')}:{' '} */}
              {formatAmount(availableBalance, {
                roundMode: 'floor',
                unit: token,
              })}
            </span>
            <span
              className="cursor-pointer text-[12px] font-medium whitespace-nowrap text-[#843BEA]"
              onClick={handleMaxWithdraw}
            >
              {t('assets.transfers.max')}
            </span>
          </div>
        </div>
      </div>
      <div className="relative">
        <img
          src="/images/icons/icon-withdraw.svg"
          className="absolute -top-2 left-1/2 size-7 -translate-x-1/2 -translate-y-1/2"
        />
        <input
          placeholder="Recipient Address"
          className="w-full rounded-[8px] border border-[#79778C29] bg-transparent px-3 py-2.5 text-[13px] leading-[100%] text-[#FBFBFB] placeholder:text-[#6C6A74]"
          value={toAddress}
          onChange={(event) => setToAddress(event.target.value)}
        />
        {toAddress && !isValidAddress && (
          <div className="mt-2 text-[12px] leading-none font-normal text-[#FF353C]">
            {t('assets.withdrawal.invalidAddress', { network: networkMap[+chainId] ?? '' })}
          </div>
        )}
      </div>
      <div className="border-t border-[#79778C29] pt-3 pb-0">
        <Button
          variant="gradient"
          className="w-full rounded-full text-white"
          disabled={!isWithdrawable}
          isLoading={loading}
          onClick={() => setShowSecurityModal(true)}
        >
          {t('button.confirm')}
        </Button>
      </div>

      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        type={'withdraw'}
        withdrawData={{
          token: withdrawTokenToTransaction ?? '',
          fromAddress: wallet ?? '',
          toAddress: toAddress,
          amount: amount,
          decimals: decimals,
          chainId: +chainId,
          gasLimit: BigInt(withdrawFee?.gasLimit || 0),
          gasPrice: BigInt(withdrawFee?.gasPrice || 0),
        }}
        selectedWallet={selectedWallet}
        transactionType={transactionType}
        onVerifyWallet={(res: VefiryWalletResponse) => {
          setShowSecurityModal(false)
          handleWithdraw(res).then()
        }}
      />
    </div>
  )
}

export const PerpsWithdraw = () => {
  const { t, i18n } = useTranslation()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const swapService = useSwapService()
  const RELAY = Configs.getRelayHost()

  const tokensChains = useAppSelector((state) => state.tokensChains)
  const EVMAddress = useSelector(_walletDex)?.walletAddress
  const SOLAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Solana)?.walletAddress || ''
  const BTCAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Btc)?.walletAddress || ''
  const TRONAddress =
    listWalletsByChain?.find((w: UserEmbeddedWalletDto) => w?.chain === ChainType.Tron)?.walletAddress || ''
  const minBridgeUsd = tokensChains?.minBridgeUsd || '3'

  const supportedTokens = useMemo(() => {
    if (tokensChains?.tokens && tokensChains.tokens.length > 0) {
      return tokensChains.tokens.filter((token: any) => token.symbol !== 'BNB') // Exclude BNB token for now
    }
    return []
  }, [tokensChains?.tokens])

  const [tokenSelected, setTokenSelected] = useState<string>('')
  const [networkSelected, setNetworkSelected] = useState<number | string>(0)
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

  const originTokenPrice = usePrice({
    address: originTokenData?.address,
    chainId: originTokenData?.chainId,
  })

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

  return (
    <div className="space-y-3">
      <div className="rounded-[8px] border border-[#79778C29] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <LogoWithChain logo={originTokenData?.image} name={originTokenData?.name} logoClassName="size-6 min-w-6" />
            <span className="text-[14px] leading-5 text-[#FBFBFB]">{originTokenData?.symbol}</span>
          </div>
          <input
            className="flex-1 bg-transparent text-right text-[20px] leading-5 font-semibold text-white outline-none placeholder:text-[#5C5C66]"
            placeholder="0.0"
            inputMode="decimal"
            onChange={handleAmountInputChange}
            value={inputAmount}
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          {errorMessage ? (
            <span className="text-[12px] text-[#FF353C]">{errorMessage}</span>
          ) : (
            <span className="text-[12px] text-[#6C6A74]">
              ≈{' '}
              {formatAmount(amountToWithdraw ? amountToWithdraw * Number(originTokenPrice) : 0, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-[#605E68]">
              {/* {t('exchange.availableBalance')}:{' '} */}
              {formatAmount(availableToWithdraw ? availableToWithdraw : 0, {
                roundMode: 'floor',
                unit: 'USDC',
              })}
            </span>
            <span
              className="cursor-pointer text-[12px] font-medium whitespace-nowrap text-[#843BEA] uppercase"
              onClick={() => {
                const maxAmount = availableToWithdraw ? availableToWithdraw : '0'
                setInputAmount(maxAmount.toString())
              }}
            >
              {t('assets.transfers.max')}
            </span>
          </div>
        </div>
      </div>
      <div className="relative mt-3 space-y-3">
        <img
          src="/images/icons/icon-withdraw.svg"
          className="absolute -top-1.5 left-1/2 size-7 -translate-x-1/2 -translate-y-1/2"
        />
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
      </div>
      <div className="space-y-2">
        <input
          type="text"
          className="w-full rounded-[8px] border border-[#79778C29] bg-transparent px-3 py-2.5 text-[13px] leading-[100%] text-[#FBFBFB] placeholder:text-[#6C6A74]"
          placeholder={t('exchange.recipientAddress')}
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        {inValidRecipientAddress && (
          <div className="mt-1 text-[12px] leading-none font-normal text-[#FF353C]">
            {t('assets.withdrawal.invalidAddress')}
          </div>
        )}
      </div>

      <div className="space-y-3 text-[12px] leading-3 font-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#A1A1AA]">{t('exchange.estAmount')}</div>
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
          <div className="flex items-center gap-1 text-[#A1A1AA]">
            {t('exchange.priceImpact')}{' '}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconHelp className="size-3 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] rounded-md border border-[#79778C29] bg-[#212127] p-2 text-[12px] leading-4 font-[330] text-[#908E98]">
                  {t('exchange.priceImpactTooltip')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-white">
            {isQuoteing ? <Loader /> : `${quoteRelay?.details?.totalImpact?.percent ?? 0}%`}
          </div>
        </div>
      </div>

      <div className="border-t border-t-[#79778C29] pt-4">
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

export const WithdrawCard = ({
  defaultAccountType,
  defaultChainId,
  onWithdrawSuccess,
}: {
  defaultAccountType?: ACCOUNT_TYPE
  defaultChainId?: ChainIds
  onWithdrawSuccess?: () => void
}) => {
  const [currentAccountType, setCurrentAccountType] = useState<ACCOUNT_TYPE>(defaultAccountType || 'MEME')
  return (
    <div className="space-y-3">
      <AccountTypeSelect value={currentAccountType} onValueChange={setCurrentAccountType} />
      {currentAccountType === 'MEME' ? (
        <MemeWithdraw defaultChainId={defaultChainId} />
      ) : currentAccountType === 'PREDICTION' ? (
        <WithdrawForm onSuccess={onWithdrawSuccess} />
      ) : (
        <PerpsWithdraw />
      )}
    </div>
  )
}
