import { useResponsive } from '@/hooks/useResponsive'
import SwapItem from './components/SwapItem'
import { Item, SwapFormState, Token } from './lib/types'
import { useAppSelector, RootState, useAppDispatch } from '@/redux/store'
import { updateSwapForm, updateSwapToken } from '@/redux/modules/swap.slice'
import { useEffect, useMemo, useState } from 'react'
import { ACCOUNT_TYPE, TOKEN_CONFIG } from './lib/constants'
import { IconHelp } from '../icon'
import { buildSignableData } from '@/utils/hyperliquidSign'
import { useTurnkey } from '@turnkey/sdk-react'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { getAddress } from 'ethers'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useSwapService } from './hooks/useSwapService'
import { rsvToSignature } from './lib/helper'
import { useSendTransaction } from './hooks/useSendTransaction'
import { Button } from '../ui/button'
import { useSwapForm } from './hooks/useSwapForm'
import AccountTokenSelect from './components/AccountTokenSelect'
import { MathFun } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import Loader from '../common/Loader'
import { formatAmount, formatBalance, formatPercent } from '@/lib/format'
import { useNavigate } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import PriceImpactNote from '@components/assets/overview/PriceImpactNote.tsx'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
import axios from 'axios'
import { Configs } from '@const/configs.ts'
import { usePrice } from '@/hooks/relay'

interface SwapFormProps {
  isFromMeme: boolean
}

const SwapForm = ({ isFromMeme }: SwapFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isDesktop } = useResponsive()
  const RELAY = Configs.getRelayHost()
  const swapInfo = useAppSelector<RootState, SwapFormState>((state) => state.swapInfo)

  const { tokens: initTokens } = useAppSelector((state) => state.tokensChains)
  const [swapTokens, setSwapTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [enableSwap, setEnableSwap] = useState(false)
  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId

  const swapService = useSwapService()
  const { initSwapForm, handleUpToDown, resetSwapForm, handleInputChange, handleMaxAmount, stopPolling } = useSwapForm()
  const { sendSolanaTransfer, solCrossChainTransfer, bscCrossChainTransfer, monCrossChainTransfer } =
    useSendTransaction()

  useEffect(() => {
    const tokens: Token[] = initTokens?.flatMap((t: any) => {
      const config = TOKEN_CONFIG[t.symbol as keyof typeof TOKEN_CONFIG]
      if (!config) return []

      const chainList = t?.chainList?.filter((c: any) => `${c?.chainId}` === config.sourceChainId)
      if (!chainList?.length) return []

      return [
        {
          symbol: t.symbol,
          name: t.name,
          image: t.image,
          chainList,
          isShow: config.isShow,
          chainId: config.chainId,
          tokenId: chainList[0].tokenId,
          decimals: chainList[0].decimals,
        },
      ]
    })

    if (tokens) {
      setSwapTokens(tokens)

      dispatch(updateSwapToken(tokens))
      dispatch(
        updateSwapForm({
          ...swapInfo,
          swapTokens: tokens,
        }),
      )
      initSwapForm(tokens, isFromMeme)
    }
  }, [initTokens])

  const fromCoinPrice = usePrice({
    address: swapInfo.fromToken?.chainList?.[0]?.address,
    chainId: swapInfo.fromToken?.chainList?.[0]?.chainId,
  })

  useEffect(() => {
    setEnableSwap(
      isLoading ||
        MathFun.mul(Number(fromCoinPrice || 0), Number(swapInfo.fromAmount || 0)) < 1 ||
        Number(swapInfo.fromAmount || 0) > Number(swapInfo.fromAvailableBalance || 0),
    )
  }, [isLoading, fromCoinPrice, swapInfo.fromAmount, swapInfo.fromAvailableBalance])

  const sendTransaction = async ({ item }: { item: Item }) => {
    try {
      let txHash

      if (item.chainId == '501424') {
        txHash = await solCrossChainTransfer(item)
      } else if (item.chainId == '143') {
        txHash = await monCrossChainTransfer(item)
      } else {
        txHash = await bscCrossChainTransfer(item)
      }

      return txHash
    } catch (error: any) {
      toast.error(t('assets.transfers.swapFailed'))
    }
  }

  const checkSwapStatus = async (requestId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const poll = async () => {
        try {
          const { data } = await axios.get(`${RELAY}/intents/status?requestId=${requestId}&referrer=relay.link`)
          const status = data?.status
          if (status === 'success') {
            if (timeoutId) {
              clearTimeout(timeoutId)
            }
            resetSwapForm()
            toast.success(t('assets.transfers.swapSuccess')) // listen event from funding history
            resolve()
          } else if (status !== 'failure') {
            timeoutId = setTimeout(() => poll(), 5000)
          } else {
            toast.warning('Fail to check status...')
            reject()
          }
        } catch (error: any) {
          console.log('error: ', error)
        }
      }

      poll()
    })
  }
  const handleSwap = async () => {
    logEvent2(ACTIONS.transfer_click, {
      from_account: swapInfo.fromWalletAddress,
      to_account: swapInfo.toWalletAddress,
    })
    setIsLoading(true)
    stopPolling()
    try {
      if (swapInfo.fromAccountType === ACCOUNT_TYPE.Perps) {
        const transactionData = swapInfo.transactionData
        if (!transactionData) return

        const timeEstimate = transactionData?.details?.timeEstimate
          ? Number(transactionData?.details?.timeEstimate) + 3
          : 5 // add 3s buffer
        const signData = { ...transactionData.steps[0].items[0].data.sign }
        signData.message = signData.value
        delete signData.value

        let activity = await indexedDbClient?.signRawPayload({
          organizationId: subOrgId,
          signWith: getAddress(swapInfo.fromWalletAddress),
          payload: JSON.stringify(signData),
          encoding: 'PAYLOAD_ENCODING_EIP712',
          hashFunction: 'HASH_FUNCTION_NO_OP',
        })

        if (!activity) {
          toast.error('Failed to sign transfer transaction')
          return
        }

        const signature = rsvToSignature({ r: activity.r, s: activity.s, v: Number(activity.v) })

        const body = transactionData?.steps[0].items[0]?.data?.post.body

        const { data } = await swapService.relayAuthorize(signature, body)

        if (data.message === 'Success') {
          const payload = transactionData?.steps[1].items[0]?.data?.action?.parameters
          const operation = 'sendAsset'

          const { signableData } = await buildSignableData({ operation, payload })

          activity = await indexedDbClient?.signRawPayload({
            organizationId: subOrgId,
            signWith: getAddress(swapInfo.fromWalletAddress),
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
            // toast.success(t('assets.transfers.swapSuccess')) // listen event from funding history
            resetSwapForm()
            setTimeout(() => {
              checkSwapStatus(transactionData.steps[1].requestId)
            }, timeEstimate * 1000)
          } else {
            resetSwapForm()
            // toast.error(t('assets.transfers.swapFailed'))
          }
        } else {
          toast.error(t('assets.transfers.swapFailed'))
          setTimeout(() => {
            checkSwapStatus(transactionData.steps[1].requestId)
          }, timeEstimate * 1000)
        }
      } else {
        if (swapInfo.fromToken?.symbol.toUpperCase() === 'SOL' && swapInfo.toToken?.symbol.toUpperCase() === 'SOL') {
          // sol <-> sol
          try {
            const txHash = await sendSolanaTransfer(
              swapInfo.fromWalletAddress,
              swapInfo.toWalletAddress,
              Number(swapInfo.fromAmount || 0),
              Number(swapInfo.fromAvailableBalance || 0),
            )
            if (txHash) {
              // toast.success(t('assets.transfers.swapSuccess')) // listen event from funding history
            } else {
              toast.error(t('assets.transfers.swapFailed'))
            }
          } catch (error) {
            console.log('error: ', error)
            toast.error(t('assets.transfers.swapFailed'))
          }
        } else {
          const transactionData = swapInfo.transactionData
          if (!transactionData) return
          const steps = transactionData.steps || []

          const extractRequestIdFromEndpoint = (endpoint?: string): string | null => {
            if (!endpoint) return null
            const match = endpoint.match(/requestId=([^&]+)/i)
            return match?.[1] ? decodeURIComponent(match[1]) : null
          }

          const normalizeRelayItem = (raw: any): Item => {
            const d = raw?.data ?? raw

            const isSolInstructionOnly = Array.isArray(d?.instructions) && d?.instructions.length > 0 && !d?.from

            const inferSolFromAddress = () => {
              if (transactionData?.details?.sender) return transactionData.details.sender
              if (swapInfo.fromToken?.symbol.toUpperCase() === 'SOL') return swapInfo.fromWalletAddress
              if (swapInfo.toToken?.symbol.toUpperCase() === 'SOL') return swapInfo.toWalletAddress
              return ''
            }

            return {
              from: d?.from || (isSolInstructionOnly ? inferSolFromAddress() : ''),
              to: d?.to,
              data: d?.data,
              value: d?.value ?? '0',
              chainId: String(d?.chainId ?? (isSolInstructionOnly ? '501424' : '')),
              gas: d?.gas ?? '',
              maxFeePerGas: d?.maxFeePerGas ?? '',
              maxPriorityFeePerGas: d?.maxPriorityFeePerGas ?? '',
              isApprovalTx: Boolean(d?.isApprovalTx),
              serializedMessage: d?.serializedMessage,
              nonce: d?.nonce,
              eip712PrimaryType: d?.eip712PrimaryType,
              instructions: d?.instructions ?? [],
              sign: d?.sign,
              post: d?.post,
              action: d?.action,
              eip712Types: d?.eip712Types,
              __typename: d?.__typename,
            } as Item
          }

          // Cross-chain via Relay
          for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            const s = steps[stepIndex]
            const items = s.items || []
            let lastTxHash = ''

            for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
              const currentSwap = items[itemIndex] as any
              const itemToSend = normalizeRelayItem(currentSwap)
              try {
                const txHash = (await sendTransaction({ item: itemToSend })) || ''
                lastTxHash = txHash
                // toast.success(t('assets.transfers.swapSuccess')) // listen event from funding history
              } catch (error) {
                toast.error(t('assets.transfers.swapFailed'))
                break
              }
            }

            const fallbackRequestId = extractRequestIdFromEndpoint((items?.[0] as any)?.check?.endpoint || '')
            const requestId = s.requestId || fallbackRequestId
            if (!requestId) {
              throw new Error('Missing requestId for status check')
            }
            await checkSwapStatus(requestId)
          }
        }
      }
    } catch (error) {
      toast.error(t('assets.transfers.swapFailed'))
    } finally {
      setIsLoading(false)
      if (isDesktop) {
        resetSwapForm()
      } else {
        navigate('/assets/overview?tab=funds')
      }
    }
  }

  const amountError = useMemo(() => {
    if (isLoading) return

    if (Number(swapInfo.fromAmount || 0) > Number(swapInfo.fromAvailableBalance || 0)) {
      return t('exchange.insufficientBalance')
    }
    if (
      Number(swapInfo.fromAmount) > 0 &&
      MathFun.mul(Number(fromCoinPrice || 0), Number(swapInfo.fromAmount || 0)) < 1
    ) {
      return t('exchange.minimumTransfer', {
        value: 1,
      })
    }
    return null
  }, [swapInfo.fromAmount, swapInfo.fromAvailableBalance, fromCoinPrice, t, isLoading])

  const renderDesktopForm = () => {
    return (
      <div className="relative">
        <div className="w-full">
          <div className="relative space-y-3">
            <SwapItem label={t('assets.transfers.fromAccount')} disabled={false} isFrom={true} tokenList={swapTokens} />
            <SwapItem label={t('assets.transfers.toAccount')} disabled={true} isFrom={false} tokenList={swapTokens} />
            <img
              src="/images/swap/icon_swap.png"
              className="size-7 absolute top-[140px] left-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
              onClick={handleUpToDown}
            />
          </div>
          <div className="font-light text-[12px] leading-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[#908E98] flex items-center gap-1 ">{t('exchange.estAmount')}</div>
              <div className="text-white">
                {swapInfo.isQuoteing ? (
                  <Loader />
                ) : (
                  `≈ ${formatAmount(swapInfo.toAmount || 0, {
                    roundMode: 'floor',

                    unit: swapInfo.toToken?.symbol.toUpperCase(),
                  })}`
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[#908E98] flex items-center gap-1 ">
                {t('exchange.priceImpact')}{' '}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconHelp className="size-3 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-4 text-[#908E98]">
                      {t('exchange.priceImpactTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-white">
                {swapInfo.isQuoteing ? <Loader /> : `${swapInfo.transactionData?.details?.totalImpact?.percent ?? 0}%`}
              </div>
            </div>
          </div>

          {amountError ? (
            <div className="mt-3 text-[12px] text-[#FF353C]">{amountError}</div>
          ) : (
            swapInfo.errors &&
            swapInfo.errors.length > 0 && (
              <div className="mt-3 text-[12px] text-[#FF353C] wrap-break-word">{swapInfo.errors}</div>
            )
          )}

          <div className="mt-4 border-t border-t-[#79778C29] pt-4">
            <Button
              variant="gradient"
              className="rounded-full w-full"
              disabled={enableSwap}
              onClick={handleSwap}
              isLoading={isLoading}
            >
              {t('button.confirm')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderMobileForm = () => {
    return (
      <div className="relative">
        <div className="w-full space-y-4">
          <div className="relative space-y-3">
            <AccountTokenSelect isFrom={true} lable={t('assets.transfers.from')} tokenList={swapTokens} />
            <AccountTokenSelect isFrom={false} lable={t('assets.transfers.to')} tokenList={swapTokens} />
            <img
              src="/images/swap/icon_swap_h5.png"
              className="size-7 absolute top-[85px] left-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer"
              onClick={handleUpToDown}
            />
          </div>

          <div className="space-y-3">
            <div className="font-medium text-xs text-[#908E98]">{t('exchange.amount')}</div>
            <div className="w-full bg-[#18181D] rounded-[10px] p-3.5 flex items-center gap-2 justify-between">
              <input
                inputMode="decimal"
                className="text-[14px] leading-[150%] text-white placeholder:text-[#5C5C66] w-full"
                placeholder="0.0"
                value={swapInfo.fromAmount || ''}
                onChange={handleInputChange}
              />
              <div className="flex justify-start items-center gap-3.5 min-w-[90px]">
                <div className="text-right justify-start text-white text-xs font-medium leading-3">
                  {swapInfo.fromToken?.symbol.toUpperCase()}
                </div>
                <div className="w-px h-3 bg-zinc-800"></div>
                <button
                  className="text-right justify-start text-[#C8A7FD] text-xs font-medium leading-3 uppercase whitespace-nowrap"
                  onClick={handleMaxAmount}
                >
                  {t('assets.transfers.max')}
                </button>
              </div>
            </div>
            <div className="w-14 h-2.5 justify-center text-[#605E68] text-xs font-normal leading-[2.40px]">
              ≈{' '}
              {formatBalance(MathFun.mul(Number(fromCoinPrice || 0), Number(swapInfo.fromAmount || 0)), {
                roundMode: 'floor',
                showCurrency: true,
              })}
            </div>
          </div>

          {amountError ? (
            <div className="mt-3 text-[12px] leading-[20%] text-[#FF353C]">{amountError}</div>
          ) : (
            swapInfo.errors &&
            swapInfo.errors.length > 0 && (
              <div className="mt-3 text-[12px] leading-[20%] text-[#FF353C] wrap-break-word">{swapInfo.errors}</div>
            )
          )}

          <div className="w-full flex justify-between items-center font-light text-[12px] leading-3">
            <div className="text-[#908E98] flex items-center gap-1">{t('assets.transfers.balance')}</div>
            <div className="space-y-1">
              <div className="text-white">
                {formatAmount(swapInfo.fromAvailableBalance, {
                  roundMode: 'floor',
                  unit: swapInfo.fromToken?.symbol.toUpperCase(),
                })}
              </div>
              <div className="text-[#605E68] text-right">
                {formatBalance(MathFun.mul(Number(fromCoinPrice || 0), Number(swapInfo.fromAvailableBalance || 0)), {
                  roundMode: 'floor',
                  showCurrency: true,
                })}
              </div>
            </div>
          </div>

          <div className="font-light text-[12px] leading-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[#908E98] flex items-center gap-1">{t('exchange.estAmount')}</div>
              <div className="text-white">
                {swapInfo.isQuoteing ? (
                  <Loader />
                ) : (
                  `≈ ${formatAmount(swapInfo.toAmount || 0, {
                    roundMode: 'floor',
                    unit: swapInfo.toToken?.symbol.toUpperCase(),
                  })}`
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[#908E98] flex items-center gap-1">
                {t('exchange.priceImpact')} <PriceImpactNote />
              </div>
              <div className="text-white">
                {swapInfo.isQuoteing ? <Loader /> : `${swapInfo.transactionData?.details?.totalImpact?.percent ?? 0}%`}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Button
              variant="gradient"
              className="rounded-full w-full"
              disabled={enableSwap}
              onClick={handleSwap}
              isLoading={isLoading}
            >
              {t('button.confirm')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{isDesktop ? renderDesktopForm() : renderMobileForm()}</>
}

export default SwapForm
