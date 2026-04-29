import { Button } from '@components/ui/button.tsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { useWithdrawChains } from '@/modules/prediction/hooks/useWithdrawChains'
import { useWithdrawQuote } from '@/modules/prediction/hooks/useWithdrawQuote'
import { useMyUSDCBalance } from '@/modules/prediction/hooks/useMyUSDCBalance'
import { useWithdrawCrossChain } from '@/modules/prediction/hooks/useWithdrawCrossChain'
import { toast } from 'sonner'
import { WithdrawChainModel } from '@/modules/prediction/models/WithdrawChainModel'
import { FromInput } from './withdraw/FromInput'
import { TokenChainSelector } from './withdraw/TokenChainSelector'
import { ToAddressInput } from './withdraw/ToAddressInput'
import { QuoteSummary } from './withdraw/QuoteSummary'
import { buildTokenMapFromChains } from './withdraw/helpers'
import SecurityCheckModal from '@components/auth/WalletBackup/SecurityCheckModal.tsx'
import { FundingType, TransferStatus } from '@/types/enums.ts'
import { FundingRecord } from '@components/assets/overview/TabFundingRecords.tsx'
import { exchangeActions } from '@/redux/modules/exchange.slice.ts'
import { useTxDetail } from '@hooks/useTxDetail.ts'
import { useAppDispatch } from '@/redux/store'
import dayjs from 'dayjs'
import { useProxyWallet } from '@/modules/prediction/hooks/useProxyWallet.ts'
import { userService } from '@/modules/prediction/services/user.service.ts'
import eventBus from '@/lib/eventBus.ts'
import { RelayerStatusResponseDto } from '@/@generated/gql/graphql-xpUser.ts'
import { EnableTradingDialog } from '../shared/EnableTradingButton'

export interface WithdrawFormData {
  amount: string
  token: string
  chainId: number | string
  recipientAddress: string
}

interface WithdrawFormContentProps {
  onSuccess?: () => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const pollTransactionStatus = async (transactionId: string): Promise<RelayerStatusResponseDto> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const TIMEOUT_MS = 60000 // 60 seconds

    const poll = async () => {
      try {
        // Check if timeout has been reached
        if (Date.now() - startTime > TIMEOUT_MS) {
          reject(new Error('Transaction status polling timeout after 60 seconds'))
          return
        }

        const response = await userService.getRelayerStatus({
          transactionIds: [transactionId],
        })
        const res = response?.[0]

        if (res?.state === 'STATE_CONFIRMED') {
          resolve(res)
          return
        }

        // Continue polling after 2 seconds
        setTimeout(poll, 2000)
      } catch (error) {
        console.error('Error polling transaction status:', error)
        reject(error)
      }
    }

    // Start polling
    poll()
  })
}

const WithdrawFormContent = ({ onSuccess }: WithdrawFormContentProps) => {
  const { t } = useTranslation()
  const minBridgeUsd = '0'
  const { data = [] } = useWithdrawChains()
  const chains = data as WithdrawChainModel[]
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const { openTxDetail } = useTxDetail()
  const dispatch = useAppDispatch()
  const proxyWallet = useProxyWallet()

  // Get available USDC balance
  const { data: availableToWithdraw = 0 } = useMyUSDCBalance()

  // Watch form values using useWatch for better performance
  const { reset } = useFormContext<WithdrawFormData>()
  const amount = useWatch<WithdrawFormData, 'amount'>({ name: 'amount' })
  const token = useWatch<WithdrawFormData, 'token'>({ name: 'token' })
  const chainId = useWatch<WithdrawFormData, 'chainId'>({ name: 'chainId' })
  const recipientAddress = useWatch<WithdrawFormData, 'recipientAddress'>({ name: 'recipientAddress' })

  // Debounce form values
  const debouncedAmount = useDebounce(amount, 300)
  const debouncedRecipientAddress = useDebounce(recipientAddress, 300)
  const debouncedChainId = useDebounce(chainId, 300)

  // Get selected token info
  const supportedTokens = useMemo(() => {
    const tokenMap = buildTokenMapFromChains(chains)
    return Array.from(tokenMap.values())
  }, [chains])

  const selectedTokenInfo = useMemo(() => {
    return supportedTokens.find((t) => t.symbol === token)
  }, [supportedTokens, token])

  const networkSelectedObj = useMemo(() => {
    return selectedTokenInfo?.chainList?.find((network: any) => network.chainId == chainId)
  }, [chainId, selectedTokenInfo])

  const amountToWithdraw = useMemo(() => {
    if (!debouncedAmount) return 0
    return parseFloat(debouncedAmount)
  }, [debouncedAmount])

  // Fetch withdraw quote
  const { data: quoteData, isLoading: isQuoteing } = useWithdrawQuote({
    amount: debouncedAmount || '0',
    fromChainId: 137, // Polygon chain ID for Polymarket
    toChainId: Number(debouncedChainId) || 0,
    toAddress: debouncedRecipientAddress || '',
    toTokenAddress: networkSelectedObj?.addressInChain,
    enabled: !!debouncedAmount && !!debouncedRecipientAddress && !!debouncedChainId,
  })

  // Validation
  const amountError = useMemo(() => {
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
  }, [amountToWithdraw, availableToWithdraw, minBridgeUsd, t])

  const addressError = useMemo(() => {
    if (recipientAddress && networkSelectedObj) {
      const chainId = +networkSelectedObj.chainId
      // Solana chain ID
      if (chainId === 792703809) {
        // Validate Solana address format (Base58 string, typically 32-44 characters)
        const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
        const isValid = solanaAddressRegex.test(recipientAddress)
        if (!isValid) {
          return t('assets.withdrawal.invalidAddress')
        }
      } else {
        // EVM chains - Validate EVM address format (0x followed by 40 hex characters)
        const isValid = /^0x[a-fA-F0-9]{40}$/.test(recipientAddress)
        if (!isValid) {
          return t('assets.withdrawal.invalidAddress')
        }
      }
    }
    return undefined
  }, [recipientAddress, networkSelectedObj, t])

  const estimatedAmount = useMemo(() => {
    if (!quoteData?.finalToAmountBaseUnit) return undefined
    return Number(quoteData.finalToAmountBaseUnit) / Math.pow(10, networkSelectedObj?.decimals || 6)
  }, [quoteData, networkSelectedObj])

  // Withdraw mutation
  const { mutate: withdrawCrossChain, isPending: isWithdrawing } = useWithdrawCrossChain()

  const handleSubmit = () => {
    if (!quoteData?.quoteId) {
      console.error('No quote available')
      return
    }

    withdrawCrossChain(
      {
        quoteId: quoteData.quoteId,
        destinationAddress: recipientAddress || '',
      },
      {
        onSuccess: (data, input) => {
          console.log('Withdraw success:', data)
          // Close dialog
          onSuccess?.()
          reset()

          //
          setShowSecurityModal(false)
          // const txData = data.withdrawTurnkey
          if (data) {
            openTxDetail({
              id: data.transactionId,
              createdAt: dayjs().toISOString(),
              type: FundingType.WithdrawPredictExternal,
              status: TransferStatus.Processing,
              token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
              chainId: 137,
              amount: data.amount?.toString() || '0',
              from: proxyWallet,
              to: input.destinationAddress,
              txHash: '',
              errorCode: '',
              errorMessage: '',
            } as FundingRecord)
            dispatch(exchangeActions.closeExchangeDialog())

            pollTransactionStatus(data.transactionId).then((res) => {
              eventBus.dispatch('PREDICTION_WITHDRAW_CONFIRMED', {
                data: {
                  transactionId: data.transactionId,
                  transactionHash: res.transactionHash,
                },
              })
            })
          }
        },
        onError: (error) => {
          console.error('Withdraw failed:', error)
          toast.error(error.message || t('assets.withdrawal.unknownError'))
        },
      },
    )
  }

  const priceImpact = useMemo(() => {
    if (!quoteData) return undefined
    const estTotalUsd = +quoteData.estTotalUsd
    const estTotalFromAmount = +quoteData.estTotalFromAmount
    return 1 - estTotalUsd / estTotalFromAmount
  }, [quoteData])

  const isSubmitDisabled =
    !amountToWithdraw ||
    !recipientAddress ||
    !!amountError ||
    !!addressError ||
    isQuoteing ||
    !quoteData?.quoteId ||
    isWithdrawing

  return (
    <div className="space-y-3">
      <FromInput availableBalance={availableToWithdraw} error={amountError} />

      <TokenChainSelector />

      <ToAddressInput error={addressError} />

      <QuoteSummary
        isLoading={isQuoteing}
        estimatedAmount={estimatedAmount}
        priceImpact={priceImpact}
        tokenSymbol={token}
      />

      <SecurityCheckModal
        showModal={showSecurityModal}
        setShowModal={setShowSecurityModal}
        type="verifyAuth"
        onVerifyWallet={handleSubmit}
      />

      <div className="border-t border-t-[#79778C29] pt-4">
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
  )
}

export const WithdrawForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const proxyWallet = useProxyWallet()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // React Hook Form
  const methods = useForm<WithdrawFormData>({
    defaultValues: {
      amount: '',
      token: 'USDC',
      chainId: '137',
      recipientAddress: '',
    },
  })

  return (
    <FormProvider {...methods}>
      <div className="relative">
        <WithdrawFormContent onSuccess={onSuccess} />
        {!proxyWallet && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-[#0a0a0a]/60 backdrop-blur-[2px] px-4">
            <div className="w-[150px]">
              <Button className="w-full rounded-md" variant="gradient" onClick={() => setIsOpen(true)}>
                {t('prediction.enableTrading.btnEnable')}
              </Button>
            </div>
          </div>
        )}
        <EnableTradingDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>
    </FormProvider>
  )
}
