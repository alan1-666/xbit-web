import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import SelectAccount from '@/components/assets/overview/SelectAccount'
import SecurityCheckModal, { VefiryWalletResponse } from '@/components/auth/WalletBackup/SecurityCheckModal.tsx'
import { useTxDetail } from '@/hooks/useTxDetail'
import { isValidEvmAddress, isValidSolAddress } from '@/lib/blockchain'
import { APP_PATH, ARB_USDC_ADDRESS } from '@/lib/constant.ts'
import { formatAmount } from '@/lib/format'
import { walletClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useAppSelector } from '@/redux/store'
import { getWithdrawFee, withdrawTurnkey } from '@/services/wallet.service.ts'
import { ChainIds, FundingType } from '@/types/enums.ts'
import { BLOCKCHAIN_NAMES, BLOCKCHAIN_SHORTNAME } from '@/utils/helpers.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Button } from '@components/ui/button.tsx'
import { Configs } from '@const/configs.ts'
import { useWalletBalances } from '@hooks/useWalletBalances.ts'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import { mappedChainIdToChainType } from '@/redux/modules/newWallet.slice'

const usePrices = () => {
  const priceList = useAppSelector((state) => state.price.list)
  return useMemo(() => {
    return {
      solPrice: priceList['SOL'],
      ethPrice: priceList['ETH'],
      bnbPrice: priceList['BNB'],
      monPrice: priceList['MON'],
    }
  }, [priceList])
}

export type ACCOUNT_TYPE = 'MEME' | 'CONTRACT'

export interface UserEmbeddedWalletWithAccountType extends UserEmbeddedWalletDto {
  accountType: ACCOUNT_TYPE
}

const mapChainIdToChainType = (chainId: number): ChainType => {
  switch (chainId) {
    case ChainIds.Solana:
      return ChainType.Solana
    case ChainIds.Ethereum:
      return ChainType.Evm
    case ChainIds.Arbitrum:
      return ChainType.Arb
    case ChainIds.Bsc:
      return ChainType.Bsc
    case ChainIds.Mon:
      return ChainType.Mon
    default:
      return ChainType.Solana
  }
}

const getDefaultToken = (): { tokenName: string; tokenAddress: string; chainId: string } => {
  if (Configs.enableSolana()) {
    return {
      tokenName: 'SOL',
      tokenAddress: 'So11111111111111111111111111111111111111111',
      chainId: ChainIds.Solana.toString(),
    }
  }
  if (Configs.enableBSC()) {
    return {
      tokenName: 'BNB',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      chainId: ChainIds.Bsc.toString(),
    }
  }
  if (Configs.enableMonad()) {
    return {
      tokenName: 'MON',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      chainId: ChainIds.Mon.toString(),
    }
  }
  return {
    tokenName: 'SOL',
    tokenAddress: 'So11111111111111111111111111111111111111111',
    chainId: ChainIds.Solana.toString(),
  }
}

const getDefaultChainType = (): ChainType => {
  if (Configs.enableSolana()) {
    return ChainType.Solana
  }
  if (Configs.enableBSC()) {
    return ChainType.Bsc
  }
  if (Configs.enableMonad()) {
    return ChainType.Mon
  }
  return ChainType.Solana
}

const Withdrawal = () => {
  const accessToken = ServiceConfig.token
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  const defaultWallets = listWalletsByChain.filter(
    (wallet: UserEmbeddedWalletDto) => wallet.chain === getDefaultChainType(),
  )
  const [searchParams] = useSearchParams()
  const defaultTokenInfo = getDefaultToken()
  const chainId = searchParams.get('chainId') || defaultTokenInfo.chainId
  const tokenAddress = searchParams.get('tokenAddress') || defaultTokenInfo.tokenAddress
  const tokenName = searchParams.get('token') || defaultTokenInfo.tokenName
  const walletAddress = searchParams.get('walletAddress') || defaultWallets[0]?.walletAddress
  const location = useLocation()

  const navigate = useNavigate()
  const [toAddress, setToAddress] = useState<string>('')
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const { solPrice, ethPrice, bnbPrice, monPrice } = usePrices()
  const [selectedWallet, setSelectedWallet] = useState<UserEmbeddedWalletDto>()
  const [showMinimalWithdrawableError, setShowMinimalWithdrawableError] = useState(false)
  const [openSelectAccount, setOpenSelectAccount] = useState(false)
  if (!accessToken) {
    navigate(APP_PATH.ASSETS)
  }
  const walletBalances = useWalletBalances()

  const availableBalance = useMemo(() => {
    if (!selectedWallet) return 0
    if (tokenName === 'ETH' && +chainId === ChainIds.Ethereum) {
      return selectedWallet.balance || 0
    }
    if (tokenName === 'SOL' && +chainId === ChainIds.Solana) {
      return selectedWallet.balance || 0
    }
    if (+chainId === ChainIds.Arbitrum) {
      if (tokenName === 'ARB-ETH') {
        return selectedWallet.balance || 0
      }
      if (tokenName === 'USDC') {
        return walletBalances.arbUsdc[selectedWallet.walletAddress] || 0
      }
    }
    if (+chainId === ChainIds.Bsc) {
      if (tokenName === 'BNB') {
        return selectedWallet.balance || 0
      }
    }
    if (tokenName === 'MON' && +chainId === ChainIds.Mon) {
      return selectedWallet.balance || 0
    }
    return 0
  }, [selectedWallet, tokenName, chainId, walletBalances])

  const normalizedTokenName = useMemo(() => {
    if (tokenName === 'ARB-ETH') {
      return 'ETH'
    }
    return tokenName
  }, [tokenName])

  const filteredWallets = useMemo(() => {
    if (+chainId === ChainIds.Solana) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'SOLANA')
    }
    if (+chainId === ChainIds.Ethereum) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'EVM')
    }
    if (+chainId === ChainIds.Arbitrum) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'ARB')
    }
    if (+chainId === ChainIds.Bsc) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'BSC')
    }
    if (+chainId === ChainIds.Mon) {
      return listWalletsByChain.filter((wallet) => wallet.chain === 'MON')
    }
    return []
  }, [listWalletsByChain, chainId])

  useEffect(() => {
    if (!walletAddress) {
      setSelectedWallet(filteredWallets[0])
      return
    }
    const wallet = listWalletsByChain.find(
      (wallet) => wallet.walletAddress === walletAddress && wallet.chain === mapChainIdToChainType(+chainId),
    )
    if (wallet) {
      setSelectedWallet(wallet)
    } else {
      setSelectedWallet(filteredWallets[0])
    }
  }, [walletAddress, chainId])

  useEffect(() => {
    if (!selectedWallet) return
    navigate(
      `${APP_PATH.WITHDRAWAL}?token=${tokenName}&chainId=${chainId}&tokenAddress=${tokenAddress}&walletAddress=${selectedWallet?.walletAddress}`,
      { state: { ...location.state }, replace: true },
    )
  }, [selectedWallet, tokenName, chainId, tokenAddress])

  const isValidAddress = useMemo(() => {
    if (!toAddress) return true
    // Validate the address based on the chain type
    if (+chainId === ChainIds.Solana) {
      return isValidSolAddress(toAddress)
    }
    // For EVM chains, we can use a generic EVM address validation
    if (+chainId === ChainIds.Ethereum || +chainId === ChainIds.Arbitrum || +chainId === ChainIds.Bsc || +chainId === ChainIds.Mon) {
      return isValidEvmAddress(toAddress)
    }
    return true
  }, [toAddress, chainId])

  const [value, setValue] = useState<string>()

  const [loading, setLoading] = useState(false)

  const { t } = useTranslation()

  const amount = useMemo(() => {
    if (value === undefined) return 0
    return parseFloat(value)
  }, [value])

  const handleOpenTxDetail = (record: FundingRecord) => {
    openTxDetail(record)
    navigate(APP_PATH.ASSETS + '?page=funding')
  }
  const { openTxDetail } = useTxDetail()

  const withdrawTokenAddress = useMemo(() => {
    if (normalizedTokenName === 'ETH') {
      return '0x0000000000000000000000000000000000000000'
    }
    if (normalizedTokenName === 'USDC' && +chainId === ChainIds.Arbitrum) {
      return ARB_USDC_ADDRESS // Arbitrum USDC address
    }
    if (normalizedTokenName === 'BNB' || +chainId === ChainIds.Bsc) {
      return '0x0000000000000000000000000000000000000000'
    }
    if (normalizedTokenName === 'MON' && +chainId === ChainIds.Mon) {
      return '0x0000000000000000000000000000000000000000'
    }
    return tokenAddress
  }, [normalizedTokenName, chainId, tokenAddress])

  const withdrawTokenToTransaction = useMemo(() => {
    if (normalizedTokenName === 'ETH' || normalizedTokenName === 'BNB' || normalizedTokenName === 'MON') return undefined
    if (normalizedTokenName === 'USDC' && +chainId === ChainIds.Arbitrum) {
      return ARB_USDC_ADDRESS // Arbitrum USDC address
    }
    return tokenAddress
  }, [normalizedTokenName, chainId, tokenAddress])

  const fromAddress = useMemo(() => {
    return selectedWallet?.walletAddress
  }, [selectedWallet, chainId])

  const { data: withdrawFee } = useQuery({
    queryKey: ['withdrawFee', fromAddress, toAddress, chainId, withdrawTokenAddress],
    enabled: !!fromAddress && isValidAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    queryFn: async () => {
      const res = await walletClient.query({
        query: getWithdrawFee,
        variables: {
          input: {
            fromAddress,
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

  const handleWithdraw = async (res: VefiryWalletResponse) => {
    logEvent2(ACTIONS.withdraw_click, {
      chain_type: mappedChainIdToChainType(+chainId),
    })
    setLoading(true)
    try {
      const { data } = await walletClient.mutate({
        mutation: withdrawTurnkey,
        variables: {
          input: {
            fromAddress,
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
      handleOpenTxDetail({
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
    } catch (error) {
      setLoading(false)
      setShowSecurityModal(false)
    }
  }

  const tokenLogo = useMemo(() => {
    if (tokenName === 'ETH') return '/images/icons/chains/ic-ethereum.svg'
    if (tokenName === 'ARB-ETH') return '/images/icons/chains/ic-ethereum.svg'
    if (tokenName === 'SOL') return '/images/icons/sol-rounded-icon.svg'
    if (tokenName === 'USDC') return '/images/icons/chains/ic-usdc.svg'
    if (tokenName === 'BNB') return '/images/bnb.svg'
    if (tokenName === 'MON') return '/images/icons/chains/ic-monad.svg'
    return ''
  }, [chainId, tokenName])

  const networkLogo = useMemo(() => {
    switch (+chainId) {
      case ChainIds.Ethereum:
        return '/images/icons/chains/ic-ethereum.svg'
      case ChainIds.Arbitrum:
        return '/images/icons/chains/ic-arbitrum.svg'
      case ChainIds.Solana:
        return '/images/icons/sol-rounded-icon.svg'
      case ChainIds.Bsc:
        return '/images/bsc.svg'
      case ChainIds.Mon:
        return '/images/icons/chains/ic-monad.svg'
      default:
        return ''
    }
  }, [chainId])

  const transactionType = useMemo(() => {
    if (+chainId === ChainIds.Arbitrum || +chainId === ChainIds.Ethereum || +chainId === ChainIds.Bsc || +chainId === ChainIds.Mon) {
      return 'TRANSACTION_TYPE_ETHEREUM'
    }
    return 'TRANSACTION_TYPE_SOLANA'
  }, [chainId])

  const decimals = useMemo(() => {
    if (normalizedTokenName === 'USDC') {
      return 6
    }
    if (normalizedTokenName === 'ETH' || normalizedTokenName === 'ARB-ETH' || normalizedTokenName === 'BNB' || normalizedTokenName === 'MON') {
      return 18
    }
    return 9
  }, [normalizedTokenName])

  const estimatedUsdInput = useMemo(() => {
    if (!value) return 0
    if (+chainId === ChainIds.Solana) {
      return amount * solPrice
    }
    if (+chainId === ChainIds.Bsc) {
      return amount * bnbPrice
    }
    if (+chainId === ChainIds.Mon) {
      return amount * monPrice
    }
    return undefined
  }, [amount, chainId, ethPrice, solPrice, bnbPrice, monPrice])

  const estimatedUsdFee = useMemo(() => {
    if (!withdrawFee || !withdrawFee?.fee) return undefined
    const feeInNumber = parseFloat(withdrawFee.fee)
    const unit = withdrawFee.unit.toUpperCase()
    if (unit === 'ETH') {
      return feeInNumber * ethPrice
    }
    if (unit === 'SOL') {
      return feeInNumber * solPrice
    }
    if (unit === 'BNB') {
      return feeInNumber * bnbPrice
    }
    if (unit === 'MON') {
      return feeInNumber * monPrice
    }
    return undefined
  }, [withdrawFee, chainId, ethPrice, solPrice])

  const shouldWarn = useMemo(() => {
    if (!withdrawFee || !withdrawFee.fee) return false
    if (tokenName !== 'USDC') return false // Only warn for USDC withdrawals
    const feeInNumber = parseFloat(withdrawFee.fee)
    const currentBalance = selectedWallet?.balance || 0 // Balance of the selected wallet, in ETH
    return feeInNumber >= currentBalance
  }, [withdrawFee, selectedWallet, tokenName])

  const maximumWithdrawable = useMemo(() => {
    const fee = withdrawFee?.fee ?? 0
    if (normalizedTokenName === 'USDC') {
      return availableBalance
    }
    const max = new BigNumber(availableBalance).minus(fee)
    return max.toNumber()
  }, [availableBalance, withdrawFee, normalizedTokenName])

  const handleMaxWithdraw = () => {
    if (!availableBalance || withdrawFee?.fee === undefined) {
      return
    }
    if (availableBalance < Number(withdrawFee?.fee)) {
      setShowMinimalWithdrawableError(true)
      return
    }
    if (normalizedTokenName === 'USDC') {
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

  const handleAmountInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9.,]/g, '')
    newValue = newValue.replace(/,/g, '.')
    if (newValue.includes('.')) {
      const parts = newValue.split('.')
      newValue = parts[0] + '.' + parts[1].slice(0, decimals) // Limit to the number of decimals for the token
    }
    setValue(newValue)
  }

  const minimalWithdrawableAmount = useMemo(() => {
    if (normalizedTokenName === 'USDC') {
      return 0 // USDC has no minimum withdrawal limit
    }
    if (normalizedTokenName === 'ETH' && +chainId === ChainIds.Ethereum) {
      return Configs.getMinimalWithdrawableEth()
    }
    if (normalizedTokenName === 'ETH' && +chainId === ChainIds.Arbitrum) {
      return Configs.getMinimalWithdrawableArb()
    }
    if (normalizedTokenName === 'BNB' && +chainId === ChainIds.Bsc) {
      return Configs.getMinimalWithdrawableBnb()
    }
    if (normalizedTokenName === 'MON' && +chainId === ChainIds.Mon) {
      return Configs.getMinimalWithdrawableMon()
    }
    return Configs.getMinimalWithdrawableSol()
  }, [normalizedTokenName, chainId])

  const errorMessage = useMemo(() => {
    if (showMinimalWithdrawableError) {
      return t('assets.withdrawal.minimalWithdrawableError', {
        amount: minimalWithdrawableAmount,
        unit: normalizedTokenName,
      })
    }
    if (!amount) return undefined
    if (amount > maximumWithdrawable) {
      return t('assets.withdrawal.insufficientBalance')
    }
    if (amount < minimalWithdrawableAmount) {
      return t('assets.withdrawal.minimalWithdrawableError', {
        amount: minimalWithdrawableAmount,
        unit: normalizedTokenName,
      })
    }
    if (shouldWarn) {
      return t('assets.withdrawal.insufficientBalanceForGasFee', { token: 'ETH' })
    }
    return undefined
  }, [
    amount,
    maximumWithdrawable,
    minimalWithdrawableAmount,
    normalizedTokenName,
    shouldWarn,
    showMinimalWithdrawableError,
  ])

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

  useEffect(() => {
    setValue('')
  }, [])

  return (
    <div className="flex max-h-screen h-screen pt-16 flex-col overflow-hidden bg-[#0A0A0A] text-white">
      <div className="flex items-center justify-between fixed top-0 left-0 w-full z-10 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto flex items-center justify-between w-full p-4">
          <div className="w-24">
            <img
              src="/images/icons/arrow-left.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => {
                let previousPath = APP_PATH.ASSETS
                if (location.state?.from) {
                  const from = (location.state as any).from
                  previousPath += `/${from}`
                }
                navigate(previousPath)
              }}
            />
          </div>
          <div className="flex gap-1 items-center cursor-pointer">
            <div className="text-[calc(18rem/16)] leading-6 font-medium">{t('exchange.memeWithdraw')}</div>
          </div>
          <div className="w-24 flex items-center justify-end"></div>
        </div>
      </div>
      <div className="p-4">
        <div className="font-medium text-xs text-[#908E98]">{t('exchange.selectAccount')}</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div
            className="bg-[#18181D] p-[17.5px] rounded-[10px] flex items-center justify-between cursor-pointer"
            onClick={() => setOpenSelectAccount(true)}
          >
            <div className="flex items-center gap-2">
              <LogoWithChain logo={tokenLogo} name={tokenName} logoClassName="size-6 min-w-6" />
              <div className="font-medium text-[14px] leading-3.5 text-white">
                {BLOCKCHAIN_NAMES[+chainId as ChainIds]}
              </div>
            </div>
            <img className="size-5" src="/images/assets/arrow-down.svg" alt="" />
          </div>
          <div className="bg-[#18181D] p-[17.5px] rounded-[10px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogoWithChain logo={networkLogo} name="" logoClassName="size-6 min-w-6" />
              <div className="font-medium text-[14px] leading-3.5 text-white capitalize">
                {BLOCKCHAIN_SHORTNAME[+chainId as ChainIds]}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6.5">
          <div className="font-medium text-xs text-[#908E98]">{t('exchange.recipientAddress')}</div>
          <input
            type="text"
            className="mt-3 w-full bg-[#18181D] rounded-[10px] p-3.5 text-[14px] leading-[150%] text-white placeholder:text-[#5C5C66]"
            value={toAddress}
            onChange={(e) => {
              setToAddress(e.target.value)
            }}
            placeholder={t('assets.withdrawal.inputAddress')}
          />
          {!isValidAddress && (
            <div className="mt-2 font-normal text-[12px] text-[#FF353C] leading-none">
              {t('assets.withdrawal.invalidAddress')}
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="font-medium text-xs text-[#908E98]">{t('exchange.amount')}</div>
            <div className="font-medium text-xs text-[#908E98]">
              {t('exchange.availableBalance')}:
              <span className="text-white">
                {' '}
                {formatAmount(availableBalance, {
                  roundMode: 'floor',
                  unit: normalizedTokenName,
                })}
              </span>
            </div>
          </div>
          <div className="mt-3 w-full bg-[#18181D] rounded-[10px] p-3.5 flex items-center gap-2 justify-between">
            <input
              className="text-[14px] leading-[150%] text-white placeholder:text-[#5C5C66] w-full pr-2 border-r border-r-[#25242B]"
              placeholder="0.0"
              inputMode="decimal"
              value={value}
              onChange={handleAmountInputChange}
              onFocus={() => {
                setShowMinimalWithdrawableError(false)
              }}
            />
            <span
              className="font-medium text-[13px] text-[#C8A7FD] cursor-pointer uppercase whitespace-nowrap"
              onClick={handleMaxWithdraw}
            >
              {t('assets.transfers.max')}
            </span>
          </div>
          {errorMessage ? (
            <div className="mt-3 text-[12px] leading-[20%] text-[#FF353C]">{errorMessage}</div>
          ) : (
            <div className="mt-3 text-[12px] leading-[20%] text-[#52526E]">
              ≈{' '}
              {formatAmount(estimatedUsdInput, {
                showCurrency: true,
                roundMode: 'floor',
              })}
            </div>
          )}
        </div>

        <div className="mt-6 font-light text-[12px] leading-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[#908E98] flex items-center gap-1 ">{t('assets.withdrawal.fee')}</div>
            <div className="text-white">
              {formatAmount(withdrawFee?.fee, {
                roundMode: 'ceil',
                unit: withdrawFee?.unit,
              })}{' '}
              (~
              {formatAmount(estimatedUsdFee, {
                showCurrency: true,
                roundMode: 'ceil',
              })}
              )
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Button
            variant="gradient"
            className="rounded-full w-full"
            disabled={!isWithdrawable}
            onClick={() => {
              setShowSecurityModal(true)
            }}
            isLoading={loading}
          >
            {t('button.confirm')}
          </Button>
        </div>
      </div>

      <SelectAccount
        open={openSelectAccount}
        setOpen={setOpenSelectAccount}
        onAccountSelected={(account) => {
          setOpenSelectAccount(false)
          const { chainId, wallet, tokenAddress } = account
          let path = `${APP_PATH.WITHDRAWAL}?token=${
            chainId == ChainIds.Solana ? 'SOL' : chainId == ChainIds.Mon ? 'MON' : 'BNB'
          }&chainId=${chainId}&tokenAddress=${tokenAddress}`
          if (wallet) {
            path += `&walletAddress=${wallet}`
          }
          navigate(path, { state: { ...location.state } })
        }}
      />

      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        type="withdraw"
        withdrawData={{
          token: withdrawTokenToTransaction ?? '',
          fromAddress: fromAddress ?? '',
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
          handleWithdraw(res)
        }}
      />
    </div>
  )
}

export default Withdrawal
